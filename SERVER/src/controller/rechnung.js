"use strict";
/* -------------------------------------------------------
    Rechnung Controller - Deutsche Rechnungen
------------------------------------------------------- */

const Rechnung = require('../models/rechnung');
const Payout = require('../models/payout');
const Business = require('../models/business');
const RechnungService = require('../services/rechnungService');
const path = require('path');
const fs = require('fs');

module.exports = {

    // ✅ Liste (Admin ve Owner)
    list: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Rechnungen List"
        */
        
        try {
            let filter = {};
            
            // Owner sadece kendi rechnungen'lerini görebilir
            if (req.user.role === 'owner') {
                const business = await Business.findOne({ owner: req.user._id });
                if (!business) {
                    res.errorStatusCode = 404;
                    throw new Error("Business not found");
                }
                filter['rechnungsempfaenger.businessId'] = business._id;
            }
            
            const data = await res.getModelList(Rechnung, filter, [
                'rechnungsempfaenger.businessId',
                'payoutId'
            ]);
            
            res.status(200).send({
                error: false,
                details: await res.getModelListDetails(Rechnung, filter),
                result: data,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Tekil Rechnung getir
    read: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Single Rechnung"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id)
                .populate('rechnungsempfaenger.businessId')
                .populate('payoutId');
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            // Owner kontrolü
            if (req.user.role === 'owner') {
                const business = await Business.findOne({ owner: req.user._id });
                if (!business || rechnung.rechnungsempfaenger.businessId._id.toString() !== business._id.toString()) {
                    res.errorStatusCode = 403;
                    throw new Error("Unauthorized");
                }
            }
            
            res.status(200).send({
                error: false,
                result: rechnung,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Payout için Rechnung oluştur (Admin)
    createForPayout: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Create Rechnung for Payout (Admin)"
        */
        
        try {
            const { payoutId } = req.body;
            
            if (!payoutId) {
                res.errorStatusCode = 400;
                throw new Error("payoutId is required");
            }
            
            // Payout'u kontrol et
            const payout = await Payout.findById(payoutId);
            if (!payout) {
                res.errorStatusCode = 404;
                throw new Error("Payout not found");
            }
            
            if (payout.status !== 'completed') {
                res.errorStatusCode = 400;
                throw new Error("Payout must be completed before creating Rechnung");
            }
            
            // Rechnung oluştur
            const rechnung = await RechnungService.erstelleRechnungFuerPayout(payoutId);
            
            // PDF oluştur
            const pdfPfad = await RechnungService.generiereRechnungPDF(rechnung);
            rechnung.pdfPfad = pdfPfad;
            await rechnung.save();
            
            // Email gönder
            try {
                await RechnungService.sendeRechnungEmail(rechnung);
            } catch (emailError) {
                console.error('Email gönderim hatası (devam ediliyor):', emailError);
                // Email hatası rechnung oluşturmayı engellemez
            }
            
            res.status(201).send({
                error: false,
                result: rechnung,
                message: "Rechnung erfolgreich erstellt und versendet"
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ PDF indir
    downloadPDF: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Download Rechnung PDF"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            // Owner kontrolü
            if (req.user.role === 'owner') {
                const business = await Business.findOne({ owner: req.user._id });
                if (!business || rechnung.rechnungsempfaenger.businessId.toString() !== business._id.toString()) {
                    res.errorStatusCode = 403;
                    throw new Error("Unauthorized");
                }
            }
            
            if (!rechnung.pdfPfad) {
                res.errorStatusCode = 404;
                throw new Error("PDF not found");
            }
            
            const pdfPath = path.join(__dirname, '../../public', rechnung.pdfPfad);
            
            if (!fs.existsSync(pdfPath)) {
                res.errorStatusCode = 404;
                throw new Error("PDF file not found on server");
            }
            
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${rechnung.rechnungsnummer}.pdf"`);
            res.sendFile(pdfPath);
            
        } catch (error) {
            throw error;
        }
    },

    // ✅ Rechnung durumunu güncelle (Admin)
    updateStatus: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Update Rechnung Status (Admin)"
        */
        
        try {
            const { status } = req.body;
            const allowedStatuses = ['entwurf', 'versendet', 'bezahlt', 'ueberfaellig', 'storniert', 'mahnung'];
            
            if (!allowedStatuses.includes(status)) {
                res.errorStatusCode = 400;
                throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
            }
            
            const rechnung = await Rechnung.findById(req.params.id);
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            rechnung.status = status;
            
            if (status === 'bezahlt') {
                rechnung.bezahltAm = new Date();
            } else if (status === 'storniert') {
                rechnung.storniertAm = new Date();
            }
            
            await rechnung.save();
            
            res.status(200).send({
                error: false,
                result: rechnung,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Rechnung'i yeniden gönder (Email)
    resendEmail: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Resend Rechnung Email (Admin)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            await RechnungService.sendeRechnungEmail(rechnung);
            
            res.status(200).send({
                error: false,
                message: "Rechnung erfolgreich erneut versendet"
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ PDF'i yeniden oluştur
    regeneratePDF: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Regenerate Rechnung PDF (Admin)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            const pdfPfad = await RechnungService.generiereRechnungPDF(rechnung);
            rechnung.pdfPfad = pdfPfad;
            await rechnung.save();
            
            res.status(200).send({
                error: false,
                result: rechnung,
                message: "PDF erfolgreich neu generiert"
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ İstatistikler (Admin)
    getStatistics: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Rechnung Statistics (Admin)"
        */
        
        try {
            const { startDate, endDate } = req.query;
            
            const filter = {};
            if (startDate || endDate) {
                filter.rechnungsdatum = {};
                if (startDate) filter.rechnungsdatum.$gte = new Date(startDate);
                if (endDate) filter.rechnungsdatum.$lte = new Date(endDate);
            }
            
            const rechnungen = await Rechnung.find(filter);
            
            const stats = {
                total: rechnungen.length,
                totalNetto: rechnungen.reduce((sum, r) => sum + r.summen.nettobetrag, 0),
                totalMwSt: rechnungen.reduce((sum, r) => sum + r.summen.mehrwertsteuer.betrag, 0),
                totalBrutto: rechnungen.reduce((sum, r) => sum + r.summen.bruttobetrag, 0),
                byStatus: {
                    entwurf: rechnungen.filter(r => r.status === 'entwurf').length,
                    versendet: rechnungen.filter(r => r.status === 'versendet').length,
                    bezahlt: rechnungen.filter(r => r.status === 'bezahlt').length,
                    ueberfaellig: rechnungen.filter(r => r.status === 'ueberfaellig').length,
                    storniert: rechnungen.filter(r => r.status === 'storniert').length,
                },
                unpaid: rechnungen
                    .filter(r => r.status !== 'bezahlt' && r.status !== 'storniert')
                    .reduce((sum, r) => sum + r.summen.bruttobetrag, 0)
            };
            
            res.status(200).send({
                error: false,
                result: stats,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Silme (Admin - sadece entwurf durumunda)
    deletee: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Delete Rechnung (Admin - only draft)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            if (rechnung.status !== 'entwurf') {
                res.errorStatusCode = 400;
                throw new Error("Only draft Rechnungen can be deleted");
            }
            
            // PDF'i sil
            if (rechnung.pdfPfad) {
                const pdfPath = path.join(__dirname, '../../public', rechnung.pdfPfad);
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
            
            await Rechnung.deleteOne({ _id: req.params.id });
            
            res.sendStatus(204);
        } catch (error) {
            throw error;
        }
    }
};

