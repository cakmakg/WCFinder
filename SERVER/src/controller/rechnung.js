"use strict";
/* -------------------------------------------------------
    Rechnung Controller - Deutsche Rechnungen
    §14 UStG, EN 16931, XRechnung 3.0, GoBD Konform
------------------------------------------------------- */

const Rechnung = require('../models/rechnung');
const Payout = require('../models/payout');
const Business = require('../models/business');
const RechnungService = require('../services/rechnungService');
const XRechnungService = require('../services/xrechnungService');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

module.exports = {

    // ============================================
    // LISTE & LESEN
    // ============================================

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
            
            // Query filters
            if (req.query.status) {
                filter.status = req.query.status;
            }
            if (req.query.from) {
                filter.rechnungsdatum = filter.rechnungsdatum || {};
                filter.rechnungsdatum.$gte = new Date(req.query.from);
            }
            if (req.query.to) {
                filter.rechnungsdatum = filter.rechnungsdatum || {};
                filter.rechnungsdatum.$lte = new Date(req.query.to);
            }
            if (req.query.rechnungstyp) {
                filter.rechnungstyp = req.query.rechnungstyp;
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
                .populate('payoutId')
                .populate('verknuepfteRechnungId');
            
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
                
                // Mark as viewed (angesehen)
                if (rechnung.status === 'versendet' && !rechnung.angesehenAm) {
                    rechnung.angesehenAm = new Date();
                    rechnung.status = 'angesehen';
                    rechnung.addAuditLog('angesehen', req.user.email, 'Rechnung vom Kunden angesehen');
                    await rechnung.save();
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

    // ============================================
    // RECHNUNG ERSTELLEN
    // ============================================

    // ✅ Payout için Rechnung oluştur (Admin)
    createForPayout: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Create Rechnung for Payout (Admin)"
        */
        
        try {
            const { payoutId, kleinunternehmer } = req.body;
            
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
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const benutzerId = req.user?._id;
            
            // Rechnung oluştur
            const rechnung = await RechnungService.erstelleRechnungFuerPayout(payoutId, benutzer);
            
            // Ersteller setzen
            rechnung.erstelltVon = {
                benutzerId: benutzerId,
                benutzerEmail: req.user?.email,
                benutzerName: benutzer
            };
            
            // Kleinunternehmer ayarı
            if (kleinunternehmer) {
                rechnung.kleinunternehmer = {
                    istKleinunternehmer: true,
                    hinweisText: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'
                };
                // MwSt sıfırla
                rechnung.summen.mehrwertsteuer.betrag = 0;
                rechnung.summen.bruttobetrag = rechnung.summen.nettobetrag;
                rechnung.summen.zahlbetrag = rechnung.summen.nettobetrag;
            }
            
            await rechnung.save();
            
            // PDF oluştur
            const pdfPfad = await RechnungService.generiereRechnungPDF(rechnung, benutzer);
            rechnung.pdfPfad = pdfPfad;
            await rechnung.save();
            
            // XRechnung XML oluştur
            try {
                await RechnungService.generiereXRechnung(rechnung, benutzer);
            } catch (xrechnungError) {
                logger.warn('XRechnung Generierung fehlgeschlagen (wird fortgesetzt)', {
                    rechnungId: rechnung._id,
                    error: xrechnungError.message
                });
            }
            
            // Email gönder
            try {
                await RechnungService.sendeRechnungEmail(rechnung, benutzer);
            } catch (emailError) {
                logger.warn('Email gönderim hatası (devam ediliyor)', {
                    rechnungId: rechnung._id,
                    error: emailError.message
                });
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

    // ✅ MonthlyReport için Rechnung oluştur (Admin) - DOĞRU AKIŞ
    createFromMonthlyReport: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Create Rechnung from Monthly Report (Admin)"
            #swagger.description = "Doğru akış: MonthlyReport → Rechnung → (Ödeme yapıldığında) Payout"
        */
        
        try {
            const { monthlyReportId, kleinunternehmer } = req.body;
            
            if (!monthlyReportId) {
                res.errorStatusCode = 400;
                throw new Error("monthlyReportId ist erforderlich");
            }
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const benutzerId = req.user?._id;
            
            // Rechnung oluştur
            const rechnung = await RechnungService.erstelleRechnungFuerMonthlyReport(
                monthlyReportId, 
                benutzer, 
                benutzerId
            );
            
            // Kleinunternehmer ayarı
            if (kleinunternehmer) {
                rechnung.kleinunternehmer = {
                    istKleinunternehmer: true,
                    hinweisText: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'
                };
                // MwSt sıfırla
                rechnung.summen.mehrwertsteuer.betrag = 0;
                rechnung.summen.bruttobetrag = rechnung.summen.nettobetrag;
                rechnung.summen.zahlbetrag = rechnung.summen.nettobetrag;
            }
            
            await rechnung.save();
            
            // PDF oluştur
            const pdfPfad = await RechnungService.generiereRechnungPDF(rechnung, benutzer);
            rechnung.pdfPfad = pdfPfad;
            await rechnung.save();
            
            // XRechnung XML oluştur
            try {
                await RechnungService.generiereXRechnung(rechnung, benutzer);
            } catch (xrechnungError) {
                logger.warn('XRechnung Generierung fehlgeschlagen (wird fortgesetzt)', {
                    rechnungId: rechnung._id,
                    error: xrechnungError.message
                });
            }
            
            res.status(201).send({
                error: false,
                result: rechnung,
                message: "Rechnung erfolgreich aus Monatsbericht erstellt"
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Zahlung erfassen und Payout erstellen (Admin) - DOĞRU AKIŞ
    recordPayment: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Record Payment for Rechnung and Create Payout (Admin)"
            #swagger.description = "Ödeme kaydedildiğinde otomatik Payout oluşturulur"
        */
        
        try {
            const { id } = req.params;
            const { 
                betrag, 
                zahlungsmethode = 'bank_transfer', 
                transaktionsreferenz,
                zahlungsdatum,
                notizen 
            } = req.body;
            
            if (!betrag || betrag <= 0) {
                res.errorStatusCode = 400;
                throw new Error("Gültiger Betrag ist erforderlich");
            }
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const benutzerId = req.user?._id;
            
            const result = await RechnungService.erfasseZahlungUndErzeugePayout(
                id,
                {
                    betrag,
                    zahlungsmethode,
                    transaktionsreferenz,
                    zahlungsdatum: zahlungsdatum ? new Date(zahlungsdatum) : new Date(),
                    notizen
                },
                benutzer,
                benutzerId
            );
            
            res.status(200).send({
                error: false,
                result: {
                    rechnung: result.rechnung,
                    zahlung: result.zahlung,
                    payout: result.payout
                },
                message: result.payout 
                    ? `Zahlung erfasst und Auszahlung erstellt (${result.payout._id})`
                    : `Teilzahlung erfasst. Offener Betrag: ${result.rechnung.offenerBetrag}€`
            });
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // DOWNLOAD ENDPOINTS
    // ============================================

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

    // ✅ XRechnung XML indir (EN 16931 / XRechnung 3.0)
    downloadXRechnung: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Download XRechnung XML (EN 16931)"
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
            
            // XRechnung yoksa oluştur
            if (!rechnung.xrechnungPfad || !rechnung.xrechnung?.xmlGeneriert) {
                const benutzer = req.user?.username || req.user?.email || 'System';
                await RechnungService.generiereXRechnung(rechnung, benutzer);
            }
            
            const xmlPath = path.join(__dirname, '../../public', rechnung.xrechnungPfad);
            
            if (!fs.existsSync(xmlPath)) {
                // Yeniden oluştur
                const benutzer = req.user?.username || req.user?.email || 'System';
                await RechnungService.generiereXRechnung(rechnung, benutzer);
            }
            
            res.setHeader('Content-Type', 'application/xml');
            res.setHeader('Content-Disposition', `attachment; filename="${rechnung.rechnungsnummer}_xrechnung.xml"`);
            res.sendFile(path.join(__dirname, '../../public', rechnung.xrechnungPfad));
            
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // VALIDIERUNG & AUDIT
    // ============================================

    // ✅ XRechnung Validierung
    validateXRechnung: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Validate XRechnung (Basic)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            const validation = XRechnungService.validateBasic(rechnung);
            
            res.status(200).send({
                error: false,
                result: {
                    valid: validation.valid,
                    errors: validation.errors,
                    rechnungsnummer: rechnung.rechnungsnummer,
                    xrechnungProfil: rechnung.xrechnung?.profilId || XRechnungService.SPECIFICATION_ID
                }
            });
            
        } catch (error) {
            throw error;
        }
    },

    // ✅ Audit Log getir (Admin)
    getAuditLog: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Rechnung Audit Log (Admin) - GoBD Compliant"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            res.status(200).send({
                error: false,
                result: {
                    rechnungsnummer: rechnung.rechnungsnummer,
                    auditLog: rechnung.auditLog,
                    zahlungen: rechnung.zahlungen,
                    archivierung: rechnung.archivierung,
                    createdAt: rechnung.createdAt,
                    updatedAt: rechnung.updatedAt
                },
            });
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // STATUS & ZAHLUNGEN
    // ============================================

    // ✅ Rechnung durumunu güncelle (Admin)
    updateStatus: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Update Rechnung Status (Admin)"
        */
        
        try {
            const { status, details } = req.body;
            
            const rechnung = await Rechnung.findById(req.params.id);
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            // GoBD: Stornierte Rechnungen können nicht reaktiviert werden (außer zu entwurf)
            if (rechnung.status === 'storniert' && status !== 'entwurf') {
                res.errorStatusCode = 400;
                throw new Error("Stornierte Rechnungen können nicht reaktiviert werden");
            }
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const benutzerId = req.user?._id;
            
            rechnung.setStatus(status, benutzer, details, benutzerId);
            await rechnung.save();
            
            res.status(200).send({
                error: false,
                result: rechnung,
                message: `Status auf "${status}" aktualisiert`
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Zahlung registrieren (Admin) - NEU
    registerPayment: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Register Payment for Invoice (Admin)"
        */
        
        try {
            const { betrag, zahlungsdatum, zahlungsmethode, transaktionsreferenz, notizen } = req.body;
            
            const rechnung = await Rechnung.findById(req.params.id);
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            // Stornierte Rechnungen können nicht bezahlt werden
            if (rechnung.status === 'storniert') {
                res.errorStatusCode = 400;
                throw new Error("Stornierte Rechnungen können nicht bezahlt werden");
            }
            
            // Bereits vollständig bezahlt?
            if (rechnung.status === 'bezahlt') {
                res.errorStatusCode = 400;
                throw new Error("Rechnung ist bereits vollständig bezahlt");
            }
            
            // Betrag prüfen
            const offenerBetrag = rechnung.offenerBetrag || (rechnung.summen.zahlbetrag || rechnung.summen.bruttobetrag) - (rechnung.bezahlterBetrag || 0);
            if (betrag > offenerBetrag) {
                res.errorStatusCode = 400;
                throw new Error(`Betrag übersteigt offenen Betrag (${offenerBetrag.toFixed(2)}€)`);
            }
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const benutzerId = req.user?._id;
            
            // Zahlung hinzufügen
            const zahlung = rechnung.addZahlung({
                betrag,
                zahlungsdatum: zahlungsdatum ? new Date(zahlungsdatum) : new Date(),
                zahlungsmethode,
                transaktionsreferenz,
                notizen
            }, benutzer, benutzerId);
            
            await rechnung.save();
            
            res.status(200).send({
                error: false,
                result: {
                    rechnung,
                    zahlung,
                    bezahlterBetrag: rechnung.bezahlterBetrag,
                    offenerBetrag: rechnung.offenerBetrag,
                    status: rechnung.status
                },
                message: rechnung.status === 'bezahlt' 
                    ? 'Rechnung vollständig bezahlt' 
                    : `Teilzahlung von ${betrag}€ registriert. Offen: ${rechnung.offenerBetrag.toFixed(2)}€`
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Zahlungsverlauf (Admin) - NEU
    getPayments: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Payment History for Invoice (Admin)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            res.status(200).send({
                error: false,
                result: {
                    rechnungsnummer: rechnung.rechnungsnummer,
                    gesamtbetrag: rechnung.summen.bruttobetrag,
                    zahlbetrag: rechnung.summen.zahlbetrag,
                    bezahlterBetrag: rechnung.bezahlterBetrag || 0,
                    offenerBetrag: rechnung.offenerBetrag || rechnung.summen.zahlbetrag,
                    zahlungen: rechnung.zahlungen || [],
                    status: rechnung.status
                }
            });
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // STORNO
    // ============================================

    // ✅ Storno Rechnung erstellen (Admin)
    createStorno: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Create Storno (Credit Note) for Rechnung (Admin)"
        */
        
        try {
            const { grund } = req.body;
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            
            const stornoRechnung = await RechnungService.erstelleStornoRechnung(
                req.params.id,
                grund,
                benutzer
            );
            
            // PDF für Storno erstellen
            const pdfPfad = await RechnungService.generiereRechnungPDF(stornoRechnung, benutzer);
            stornoRechnung.pdfPfad = pdfPfad;
            await stornoRechnung.save();
            
            res.status(201).send({
                error: false,
                result: stornoRechnung,
                message: "Stornorechnung erfolgreich erstellt"
            });
            
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // EMAIL & REGENERATION
    // ============================================

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
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            await RechnungService.sendeRechnungEmail(rechnung, benutzer);
            
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
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const pdfPfad = await RechnungService.generiereRechnungPDF(rechnung, benutzer);
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

    // ✅ XRechnung XML yeniden oluştur
    regenerateXRechnung: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Regenerate XRechnung XML (Admin)"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            const benutzer = req.user?.username || req.user?.email || 'Admin';
            const xmlPfad = await RechnungService.generiereXRechnung(rechnung, benutzer);
            
            res.status(200).send({
                error: false,
                result: {
                    xrechnungPfad: xmlPfad,
                    xrechnung: rechnung.xrechnung
                },
                message: "XRechnung XML erfolgreich neu generiert"
            });
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // STATISTIKEN & METADATA
    // ============================================

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
            
            const stats = await RechnungService.getStatistiken(filter);
            
            res.status(200).send({
                error: false,
                result: stats,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Birim Kodları (UN/ECE Recommendation 20)
    getUnitCodes: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get UN/ECE Recommendation 20 Unit Codes"
        */
        
        try {
            const unitCodes = Rechnung.getUnitCodes();
            
            res.status(200).send({
                error: false,
                result: unitCodes,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Fatura Türleri
    getInvoiceTypes: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Invoice Types"
        */
        
        try {
            const types = Rechnung.getInvoiceTypes();
            
            res.status(200).send({
                error: false,
                result: types,
            });
        } catch (error) {
            throw error;
        }
    },

    // ✅ Fatura Durumları
    getInvoiceStatuses: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Get Invoice Statuses"
        */
        
        try {
            const statuses = Rechnung.getInvoiceStatuses();
            
            res.status(200).send({
                error: false,
                result: statuses,
            });
        } catch (error) {
            throw error;
        }
    },

    // ============================================
    // DELETE (GoBD COMPLIANT)
    // ============================================

    // ✅ Silme (Admin - sadece entwurf durumunda - GoBD)
    deletee: async (req, res) => {
        /*
            #swagger.tags = ["Rechnungen"]
            #swagger.summary = "Delete Rechnung (Admin - only draft) - GoBD Compliant"
        */
        
        try {
            const rechnung = await Rechnung.findById(req.params.id);
            
            if (!rechnung) {
                res.errorStatusCode = 404;
                throw new Error("Rechnung not found");
            }
            
            // GoBD: Sadece entwurf (taslak) rechnungen silinebilir
            if (rechnung.status !== 'entwurf') {
                res.errorStatusCode = 400;
                throw new Error("GoBD: Nur Entwürfe können gelöscht werden. Versendete Rechnungen müssen storniert werden.");
            }
            
            // PDF'i sil
            if (rechnung.pdfPfad) {
                const pdfPath = path.join(__dirname, '../../public', rechnung.pdfPfad);
                if (fs.existsSync(pdfPath)) {
                    fs.unlinkSync(pdfPath);
                }
            }
            
            // XRechnung XML'i sil
            if (rechnung.xrechnungPfad) {
                const xmlPath = path.join(__dirname, '../../public', rechnung.xrechnungPfad);
                if (fs.existsSync(xmlPath)) {
                    fs.unlinkSync(xmlPath);
                }
            }
            
            await Rechnung.deleteOne({ _id: req.params.id });
            
            res.sendStatus(204);
        } catch (error) {
            throw error;
        }
    }
};
