"use strict";
/* -------------------------------------------------------
    Rechnung Service - Deutsche Gesetzeskonform
    §14 UStG, EN 16931, XRechnung 3.0, GoBD Konform
------------------------------------------------------- */

const Rechnung = require('../models/rechnung');
const Payout = require('../models/payout');
const Payment = require('../models/payment');
const Usage = require('../models/usage');
const Business = require('../models/business');
const User = require('../models/user');
const XRechnungService = require('./xrechnungService');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sendMail = require('../helper/sendMail');

// UN/ECE Recommendation 20 Birim Kodları
const UNIT_CODES = {
    H87: { de: 'Stück', en: 'Piece' },
    HUR: { de: 'Stunde', en: 'Hour' },
    DAY: { de: 'Tag', en: 'Day' },
    MON: { de: 'Monat', en: 'Month' },
    KGM: { de: 'Kilogramm', en: 'Kilogram' },
    MTR: { de: 'Meter', en: 'Metre' },
    LTR: { de: 'Liter', en: 'Litre' },
    C62: { de: 'Einheit', en: 'Unit' }
};

class RechnungService {
    
    // =========================================
    // 📊 RECHNUNG FÜR PAYOUT ERSTELLEN
    // =========================================
    static async erstelleRechnungFuerPayout(payoutId, benutzer = 'System') {
        console.log(`🧾 Erstelle Rechnung für Payout ${payoutId}...`);
        
        try {
            // Payout'u bul
            const payout = await Payout.findById(payoutId)
                .populate('businessId');
            
            if (!payout) {
                throw new Error("Payout not found");
            }
            
            // Business'i bul
            const business = await Business.findById(payout.businessId._id)
                .populate('owner');
            
            if (!business) {
                throw new Error("Business not found");
            }
            
            // Bu payout'a ait payment'ları bul
            const payments = await Payment.find({
                businessId: business._id,
                payoutId: payoutId,
                status: 'succeeded',
            }).populate('usageId');
            
            if (payments.length === 0) {
                throw new Error("No payments found for this payout");
            }
            
            // Daha önce bu payout için rechnung var mı?
            const existingRechnung = await Rechnung.findOne({ payoutId: payoutId });
            if (existingRechnung) {
                throw new Error("Rechnung already exists for this payout");
            }
            
            // Positionen erstellen
            const positionen = [];
            payments.forEach((payment, index) => {
                const usage = payment.usageId;
                if (usage) {
                    const datumFormatiert = this.formatiereDatum(payment.createdAt);
                    positionen.push({
                        positionsnummer: index + 1,
                        datum: payment.createdAt,
                        beschreibung: `WC-Nutzung - ${business.businessName} - ${datumFormatiert}`,
                        menge: 1,
                        einheitCode: 'C62', // Einheit
                        einheitName: 'Einheit',
                        einzelpreis: payment.businessFee,
                        gesamtpreis: payment.businessFee,
                        steuersatz: 19,
                        steuerbetrag: Math.round((payment.businessFee * 0.19) * 100) / 100,
                        usageId: usage._id,
                        paymentId: payment._id
                    });
                }
            });
            
            // Summen berechnen
            const nettobetrag = payments.reduce((sum, p) => sum + p.businessFee, 0);
            const mwstBetrag = Math.round((nettobetrag * 0.19) * 100) / 100;
            const bruttobetrag = Math.round((nettobetrag + mwstBetrag) * 100) / 100;
            
            // Fälligkeitsdatum: 14 Tage ab Rechnungsdatum
            const rechnungsdatum = new Date();
            const faelligkeitsdatum = new Date(rechnungsdatum);
            faelligkeitsdatum.setDate(faelligkeitsdatum.getDate() + 14);
            
            // Rechnung erstellen
            const rechnung = await Rechnung.create({
                rechnungsdatum,
                leistungszeitraum: {
                    von: payout.period.startDate,
                    bis: payout.period.endDate
                },
                payoutId: payout._id,
                rechnungsempfaenger: {
                    businessId: business._id,
                    firmenname: business.businessName,
                    ansprechpartner: business.owner?.username || '',
                    strasse: business.address?.street || 'Nicht angegeben',
                    hausnummer: '',
                    plz: business.address?.postalCode || '00000',
                    ort: business.address?.city || 'Nicht angegeben',
                    land: business.address?.country || 'Deutschland',
                    landCode: 'DE',
                    ustIdNr: business.ustIdNr || '',
                    steuernummer: business.steuernummer || '',
                    email: business.owner?.email || '',
                    telefon: business.phone || ''
                },
                positionen,
                summen: {
                    nettobetrag: Math.round(nettobetrag * 100) / 100,
                    mehrwertsteuer: {
                        satz: 19,
                        netto: Math.round(nettobetrag * 100) / 100,
                        betrag: mwstBetrag
                    },
                    bruttobetrag: bruttobetrag,
                    zahlbetrag: bruttobetrag
                },
                zahlungsbedingungen: {
                    zahlungsziel: 14,
                    faelligkeitsdatum
                },
                xrechnung: {
                    waehrungscode: 'EUR',
                    dokumentTyp: '380',
                    rechnungsTypCode: '380'
                },
                status: 'entwurf',
                auditLog: [{
                    zeitstempel: new Date(),
                    aktion: 'erstellt',
                    benutzer: benutzer,
                    details: `Rechnung für Payout ${payoutId} erstellt`
                }]
            });
            
            console.log(`✅ Rechnung erstellt: ${rechnung.rechnungsnummer}`);
            return rechnung;
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen der Rechnung:', error);
            throw error;
        }
    }
    
    // =========================================
    // 📄 PDF-RECHNUNG GENERIEREN (§14 UStG KONFORM)
    // =========================================
    static async generiereRechnungPDF(rechnung, benutzer = 'System') {
        try {
            await rechnung.populate('rechnungsempfaenger.businessId');
            
            const rechnungenDir = path.join(__dirname, '../../public/rechnungen');
            if (!fs.existsSync(rechnungenDir)) {
                fs.mkdirSync(rechnungenDir, { recursive: true });
            }
            
            const dateiname = `${rechnung.rechnungsnummer}.pdf`;
            const dateipfad = path.join(rechnungenDir, dateiname);
            
            const doc = new PDFDocument({ 
                margin: 50,
                size: 'A4',
                info: {
                    Title: `Rechnung ${rechnung.rechnungsnummer}`,
                    Author: rechnung.leistender.firmenname,
                    Subject: `Rechnung für ${rechnung.rechnungsempfaenger.firmenname}`,
                    Keywords: 'Rechnung, Invoice, XRechnung',
                    Creator: 'WCFinder Rechnungssystem',
                    CreationDate: new Date()
                }
            });
            const stream = fs.createWriteStream(dateipfad);
            doc.pipe(stream);
            
            // === HEADER ===
            this.generiereKopfzeile(doc, rechnung);
            
            // === ABSENDER & EMPFÄNGER ===
            this.generiereAdressbereich(doc, rechnung);
            
            // === RECHNUNG TITEL & DATEN ===
            this.generiereRechnungsdaten(doc, rechnung);
            
            // === POSITIONEN TABELLE ===
            const tabelleEndY = this.generierePositionenTabelle(doc, rechnung);
            
            // === SUMMEN ===
            this.generiereSummen(doc, rechnung, tabelleEndY);
            
            // === ZAHLUNGSBEDINGUNGEN ===
            this.generiereZahlungsbedingungen(doc, rechnung);
            
            // === KLEINUNTERNEHMER HINWEIS (§19 UStG) ===
            if (rechnung.kleinunternehmer?.istKleinunternehmer) {
                this.generiereKleinunternehmerHinweis(doc, rechnung);
            }
            
            // === FOOTER (PFLICHTANGABEN) ===
            this.generiereFusszeile(doc, rechnung);
            
            doc.end();
            
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            
            // Audit Log
            rechnung.addAuditLog('pdf_generiert', benutzer, `PDF erstellt: ${dateiname}`);
            
            // Hash für GoBD
            const pdfContent = fs.readFileSync(dateipfad);
            const hashWert = crypto.createHash('sha256').update(pdfContent).digest('hex');
            rechnung.archivierung = rechnung.archivierung || {};
            rechnung.archivierung.hashWert = hashWert;
            
            return `/rechnungen/${dateiname}`;
            
        } catch (error) {
            console.error('❌ Fehler beim Generieren der PDF:', error);
            throw error;
        }
    }
    
    // PDF Generator Helpers
    static generiereKopfzeile(doc, rechnung) {
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text(rechnung.leistender.firmenname, 50, 50);
        doc.font('Helvetica').fontSize(8);
        doc.text(`${rechnung.leistender.strasse}${rechnung.leistender.hausnummer ? ' ' + rechnung.leistender.hausnummer : ''}, ${rechnung.leistender.plz} ${rechnung.leistender.ort}`, 50);
        doc.text(`Tel: ${rechnung.leistender.telefon || '-'} | E-Mail: ${rechnung.leistender.email}`);
        doc.text(`USt-IdNr: ${rechnung.leistender.ustIdNr} | Steuernr: ${rechnung.leistender.steuernummer}`);
        doc.text(`Web: ${rechnung.leistender.website || '-'}`);
    }
    
    static generiereAdressbereich(doc, rechnung) {
        // Absenderzeile (klein)
        doc.fontSize(7).fillColor('#666666');
        doc.text(`${rechnung.leistender.firmenname} · ${rechnung.leistender.strasse} · ${rechnung.leistender.plz} ${rechnung.leistender.ort}`, 50, 130);
        
        // Empfänger
        doc.fillColor('#000000').fontSize(10);
        doc.text(rechnung.rechnungsempfaenger.firmenname, 50, 145, { bold: true });
        if (rechnung.rechnungsempfaenger.ansprechpartner) {
            doc.text(`z.H. ${rechnung.rechnungsempfaenger.ansprechpartner}`);
        }
        doc.text(`${rechnung.rechnungsempfaenger.strasse}${rechnung.rechnungsempfaenger.hausnummer ? ' ' + rechnung.rechnungsempfaenger.hausnummer : ''}`);
        doc.text(`${rechnung.rechnungsempfaenger.plz} ${rechnung.rechnungsempfaenger.ort}`);
        if (rechnung.rechnungsempfaenger.land && rechnung.rechnungsempfaenger.land !== 'Deutschland') {
            doc.text(rechnung.rechnungsempfaenger.land);
        }
        if (rechnung.rechnungsempfaenger.ustIdNr) {
            doc.fontSize(8).text(`USt-IdNr: ${rechnung.rechnungsempfaenger.ustIdNr}`);
        }
    }
    
    static generiereRechnungsdaten(doc, rechnung) {
        // Rechnung-Daten (rechts)
        doc.fontSize(9);
        const rechtsX = 380;
        let rechtsY = 145;
        
        doc.font('Helvetica-Bold').text('Rechnungsnummer:', rechtsX, rechtsY);
        doc.font('Helvetica').text(rechnung.rechnungsnummer, rechtsX + 100, rechtsY);
        rechtsY += 15;
        
        doc.font('Helvetica-Bold').text('Rechnungsdatum:', rechtsX, rechtsY);
        doc.font('Helvetica').text(this.formatiereDatum(rechnung.rechnungsdatum), rechtsX + 100, rechtsY);
        rechtsY += 15;
        
        doc.font('Helvetica-Bold').text('Leistungszeitraum:', rechtsX, rechtsY);
        doc.font('Helvetica').text(`${this.formatiereDatum(rechnung.leistungszeitraum.von)} - ${this.formatiereDatum(rechnung.leistungszeitraum.bis)}`, rechtsX + 100, rechtsY);
        rechtsY += 15;
        
        doc.font('Helvetica-Bold').text('Fällig am:', rechtsX, rechtsY);
        doc.font('Helvetica').text(this.formatiereDatum(rechnung.zahlungsbedingungen.faelligkeitsdatum), rechtsX + 100, rechtsY);
        
        // RECHNUNG Titel
        doc.moveDown(2);
        doc.fontSize(16).font('Helvetica-Bold');
        doc.text('RECHNUNG', 50, 250, { underline: true });
        
        // Einleitung
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica');
        doc.text(`Sehr geehrte Damen und Herren,`, 50);
        doc.moveDown(0.5);
        doc.text(`für die erbrachten Leistungen im Zeitraum ${this.formatiereDatum(rechnung.leistungszeitraum.von)} bis ${this.formatiereDatum(rechnung.leistungszeitraum.bis)} erlauben wir uns, Ihnen folgende Positionen in Rechnung zu stellen:`, { width: 500 });
    }
    
    static generierePositionenTabelle(doc, rechnung) {
        doc.moveDown(1.5);
        const tabelleTop = doc.y;
        
        const spalten = {
            pos: 50,
            datum: 75,
            beschreibung: 135,
            menge: 350,
            einheit: 380,
            einzelpreis: 430,
            gesamt: 490
        };
        
        // Tabellen-Header
        doc.fontSize(8).font('Helvetica-Bold');
        doc.fillColor('#333333');
        doc.rect(50, tabelleTop - 3, 500, 18).fill('#f0f0f0');
        doc.fillColor('#333333');
        doc.text('Pos.', spalten.pos, tabelleTop);
        doc.text('Datum', spalten.datum, tabelleTop);
        doc.text('Beschreibung', spalten.beschreibung, tabelleTop);
        doc.text('Menge', spalten.menge, tabelleTop);
        doc.text('Einh.', spalten.einheit, tabelleTop);
        doc.text('Einzelpreis', spalten.einzelpreis, tabelleTop);
        doc.text('Gesamt', spalten.gesamt, tabelleTop);
        
        // Tabellen-Zeilen
        let y = tabelleTop + 20;
        doc.font('Helvetica').fontSize(8).fillColor('#000000');
        
        rechnung.positionen.forEach((pos, index) => {
            // Zebra-Streifen
            if (index % 2 === 1) {
                doc.rect(50, y - 3, 500, 20).fill('#fafafa');
                doc.fillColor('#000000');
            }
            
            doc.text(String(pos.positionsnummer), spalten.pos, y);
            doc.text(this.formatiereDatum(pos.datum), spalten.datum, y);
            doc.text(pos.beschreibung, spalten.beschreibung, y, { width: 200 });
            doc.text(String(pos.menge), spalten.menge, y);
            doc.text(pos.einheitName || UNIT_CODES[pos.einheitCode]?.de || 'Einheit', spalten.einheit, y);
            doc.text(this.formatiereWaehrung(pos.einzelpreis), spalten.einzelpreis, y);
            doc.text(this.formatiereWaehrung(pos.gesamtpreis), spalten.gesamt, y);
            y += 20;
            
            // Neue Seite bei Bedarf
            if (y > 680) {
                doc.addPage();
                y = 50;
            }
        });
        
        // Abschlusslinie
        doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke();
        
        return y + 10;
    }
    
    static generiereSummen(doc, rechnung, startY) {
        let y = startY + 15;
        const labelX = 380;
        const valueX = 490;
        
        doc.fontSize(10);
        
        // Nettobetrag
        doc.font('Helvetica').text('Nettobetrag:', labelX, y);
        doc.text(this.formatiereWaehrung(rechnung.summen.nettobetrag), valueX, y, { align: 'right', width: 60 });
        y += 18;
        
        // MwSt (wenn keine Kleinunternehmerregelung)
        if (!rechnung.kleinunternehmer?.istKleinunternehmer) {
            doc.text(`Mehrwertsteuer (${rechnung.summen.mehrwertsteuer.satz}%):`, labelX, y);
            doc.text(this.formatiereWaehrung(rechnung.summen.mehrwertsteuer.betrag), valueX, y, { align: 'right', width: 60 });
            y += 18;
            
            // Ermäßigte Steuer (7%) wenn vorhanden
            if (rechnung.summen.ermaeßigteSteuer?.betrag > 0) {
                doc.text(`Mehrwertsteuer (${rechnung.summen.ermaeßigteSteuer.satz}%):`, labelX, y);
                doc.text(this.formatiereWaehrung(rechnung.summen.ermaeßigteSteuer.betrag), valueX, y, { align: 'right', width: 60 });
                y += 18;
            }
        }
        
        // Trennlinie
        doc.moveTo(labelX, y).lineTo(550, y).stroke();
        y += 8;
        
        // Gesamtbetrag
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text('Gesamtbetrag:', labelX, y);
        doc.text(this.formatiereWaehrung(rechnung.summen.bruttobetrag), valueX, y, { align: 'right', width: 60 });
    }
    
    static generiereZahlungsbedingungen(doc, rechnung) {
        doc.font('Helvetica').fontSize(10);
        doc.moveDown(3);
        
        // Zahlungsziel
        doc.text(`Zahlbar innerhalb von ${rechnung.zahlungsbedingungen.zahlungsziel} Tagen ohne Abzug bis zum ${this.formatiereDatum(rechnung.zahlungsbedingungen.faelligkeitsdatum)}.`, 50);
        
        // Skonto (wenn vorhanden)
        if (rechnung.zahlungsbedingungen.skonto?.prozent > 0) {
            doc.moveDown(0.5);
            doc.text(`Bei Zahlung innerhalb von ${rechnung.zahlungsbedingungen.skonto.tage} Tagen gewähren wir ${rechnung.zahlungsbedingungen.skonto.prozent}% Skonto.`);
        }
        
        doc.moveDown(0.5);
        doc.text('Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer auf folgendes Konto:');
        doc.moveDown(0.5);
        
        // Bankverbindung
        const bank = rechnung.zahlungsbedingungen.bankverbindung;
        doc.font('Helvetica-Bold').text('Bankverbindung:', 50);
        doc.font('Helvetica');
        doc.text(`Kontoinhaber: ${bank.kontoinhaber || rechnung.leistender.firmenname}`);
        doc.text(`IBAN: ${bank.iban}`);
        doc.text(`BIC: ${bank.bic}`);
        doc.text(`Bank: ${bank.bankname}`);
        doc.text(`Verwendungszweck: ${rechnung.zahlungsbedingungen.verwendungszweck || rechnung.rechnungsnummer}`);
        
        // Schlusstext
        doc.moveDown(1);
        doc.text('Vielen Dank für Ihr Vertrauen!');
        doc.text('Mit freundlichen Grüßen');
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text(rechnung.leistender.firmenname);
    }
    
    static generiereKleinunternehmerHinweis(doc, rechnung) {
        doc.moveDown(1);
        doc.fontSize(9).font('Helvetica-Oblique');
        doc.fillColor('#666666');
        doc.text(rechnung.kleinunternehmer.hinweisText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.', 50, doc.y, { width: 500 });
        doc.fillColor('#000000');
    }
    
    static generiereFusszeile(doc, rechnung) {
        doc.fontSize(7).fillColor('#666666');
        const footerY = 750;
        
        // Linie
        doc.moveTo(50, footerY - 10).lineTo(550, footerY - 10).stroke('#cccccc');
        
        // Firmeninfo
        doc.text(`${rechnung.leistender.firmenname} | Geschäftsführer: ${rechnung.leistender.geschaeftsfuehrer}`, 50, footerY, { align: 'center', width: 500 });
        doc.text(`${rechnung.leistender.registergericht} | ${rechnung.leistender.handelsregister}`, 50, footerY + 10, { align: 'center', width: 500 });
        doc.text(`Steuernummer: ${rechnung.leistender.steuernummer} | USt-IdNr: ${rechnung.leistender.ustIdNr}`, 50, footerY + 20, { align: 'center', width: 500 });
        doc.text(`${rechnung.leistender.email} | ${rechnung.leistender.website}`, 50, footerY + 30, { align: 'center', width: 500 });
    }
    
    // =========================================
    // 📧 RECHNUNG PER E-MAIL VERSENDEN
    // =========================================
    static async sendeRechnungEmail(rechnung, benutzer = 'System') {
        try {
            await rechnung.populate('rechnungsempfaenger.businessId');
            const business = await Business.findById(rechnung.rechnungsempfaenger.businessId)
                .populate('owner');
            
            if (!business || !business.owner || !business.owner.email) {
                throw new Error('Empfänger-E-Mail nicht gefunden');
            }
            
            const betreff = `Rechnung ${rechnung.rechnungsnummer} - ${business.businessName}`;
            
            const nachricht = this.generiereEmailHTML(rechnung, business);
            
            await sendMail(business.owner.email, betreff, nachricht);
            
            rechnung.setStatus('versendet', benutzer, `E-Mail an ${business.owner.email} gesendet`);
            rechnung.addAuditLog('email_gesendet', benutzer, `E-Mail an ${business.owner.email} gesendet`);
            await rechnung.save();
            
            console.log(`✅ Rechnung per E-Mail versendet: ${rechnung.rechnungsnummer}`);
            
        } catch (error) {
            console.error('❌ Fehler beim Versenden der E-Mail:', error);
            throw error;
        }
    }
    
    static generiereEmailHTML(rechnung, business) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #1976d2; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Rechnung ${rechnung.rechnungsnummer}</h1>
                </div>
                
                <div style="padding: 20px;">
                    <p>Sehr geehrte/r ${business.owner.username},</p>
                    
                    <p>anbei erhalten Sie Ihre Rechnung für den Zeitraum <strong>${this.formatiereDatum(rechnung.leistungszeitraum.von)}</strong> bis <strong>${this.formatiereDatum(rechnung.leistungszeitraum.bis)}</strong>.</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #ddd;">
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Rechnungsnummer:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${rechnung.rechnungsnummer}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Rechnungsdatum:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${this.formatiereDatum(rechnung.rechnungsdatum)}</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Leistungszeitraum:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${this.formatiereDatum(rechnung.leistungszeitraum.von)} - ${this.formatiereDatum(rechnung.leistungszeitraum.bis)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Anzahl Positionen:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${rechnung.positionen.length}</td>
                        </tr>
                        <tr style="background: #f5f5f5;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Nettobetrag:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${this.formatiereWaehrung(rechnung.summen.nettobetrag)}</td>
                        </tr>
                        ${!rechnung.kleinunternehmer?.istKleinunternehmer ? `
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>MwSt (${rechnung.summen.mehrwertsteuer.satz}%):</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${this.formatiereWaehrung(rechnung.summen.mehrwertsteuer.betrag)}</td>
                        </tr>
                        ` : ''}
                        <tr style="background: #e3f2fd; font-weight: bold;">
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Gesamtbetrag:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd; font-size: 18px; color: #1976d2;">${this.formatiereWaehrung(rechnung.summen.bruttobetrag)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 12px; border: 1px solid #ddd;"><strong>Fällig am:</strong></td>
                            <td style="padding: 12px; border: 1px solid #ddd;">${this.formatiereDatum(rechnung.zahlungsbedingungen.faelligkeitsdatum)}</td>
                        </tr>
                    </table>
                    
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #333;">Zahlungsinformationen:</h3>
                        <p style="margin: 5px 0;"><strong>Kontoinhaber:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.kontoinhaber || rechnung.leistender.firmenname}</p>
                        <p style="margin: 5px 0;"><strong>IBAN:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.iban}</p>
                        <p style="margin: 5px 0;"><strong>BIC:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.bic}</p>
                        <p style="margin: 5px 0;"><strong>Bank:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.bankname}</p>
                        <p style="margin: 5px 0;"><strong>Verwendungszweck:</strong> ${rechnung.rechnungsnummer}</p>
                    </div>
                    
                    ${rechnung.kleinunternehmer?.istKleinunternehmer ? `
                    <p style="font-style: italic; color: #666; border-left: 3px solid #1976d2; padding-left: 10px;">
                        ${rechnung.kleinunternehmer.hinweisText || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'}
                    </p>
                    ` : ''}
                    
                    <p>Die Rechnung als PDF finden Sie in Ihrem Dashboard zum Download. XRechnung-XML steht ebenfalls zur Verfügung.</p>
                    
                    <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                    
                    <p>Mit freundlichen Grüßen<br>
                    <strong>Ihr WCFinder Team</strong></p>
                </div>
                
                <div style="background: #333; color: #999; padding: 15px; text-align: center; font-size: 12px;">
                    <p style="margin: 0;">${rechnung.leistender.firmenname} | ${rechnung.leistender.strasse} | ${rechnung.leistender.plz} ${rechnung.leistender.ort}</p>
                    <p style="margin: 5px 0;">USt-IdNr: ${rechnung.leistender.ustIdNr} | ${rechnung.leistender.registergericht} ${rechnung.leistender.handelsregister}</p>
                </div>
            </div>
        `;
    }
    
    // =========================================
    // 📋 XRECHNUNG XML GENERIEREN
    // =========================================
    static async generiereXRechnung(rechnung, benutzer = 'System') {
        try {
            // Validierung
            const validation = XRechnungService.validateBasic(rechnung);
            if (!validation.valid) {
                rechnung.xrechnung = rechnung.xrechnung || {};
                rechnung.xrechnung.validierungsFehler = validation.errors;
                await rechnung.save();
                throw new Error(`XRechnung Validierungsfehler: ${validation.errors.join(', ')}`);
            }
            
            // XML generieren und speichern
            const xmlPfad = await XRechnungService.saveXML(rechnung);
            
            // Rechnung aktualisieren
            rechnung.xrechnungPfad = xmlPfad;
            rechnung.xrechnung = rechnung.xrechnung || {};
            rechnung.xrechnung.xmlGeneriert = true;
            rechnung.xrechnung.xmlGeneriertAm = new Date();
            rechnung.xrechnung.validiert = true;
            rechnung.xrechnung.validierungsFehler = [];
            
            rechnung.addAuditLog('pdf_generiert', benutzer, `XRechnung XML erstellt: ${xmlPfad}`);
            await rechnung.save();
            
            console.log(`✅ XRechnung XML erstellt: ${xmlPfad}`);
            return xmlPfad;
            
        } catch (error) {
            console.error('❌ Fehler beim Generieren der XRechnung:', error);
            throw error;
        }
    }
    
    // =========================================
    // 📊 STATISTIKEN
    // =========================================
    static async getStatistiken(filter = {}) {
        const rechnungen = await Rechnung.find(filter);
        
        const stats = {
            gesamt: rechnungen.length,
            gesamtNetto: rechnungen.reduce((sum, r) => sum + (r.summen?.nettobetrag || 0), 0),
            gesamtMwSt: rechnungen.reduce((sum, r) => sum + (r.summen?.mehrwertsteuer?.betrag || 0), 0),
            gesamtBrutto: rechnungen.reduce((sum, r) => sum + (r.summen?.bruttobetrag || 0), 0),
            nachStatus: {
                entwurf: rechnungen.filter(r => r.status === 'entwurf').length,
                versendet: rechnungen.filter(r => r.status === 'versendet').length,
                bezahlt: rechnungen.filter(r => r.status === 'bezahlt').length,
                ueberfaellig: rechnungen.filter(r => r.status === 'ueberfaellig').length,
                storniert: rechnungen.filter(r => r.status === 'storniert').length,
                mahnung: rechnungen.filter(r => r.status === 'mahnung').length,
                teilbezahlt: rechnungen.filter(r => r.status === 'teilbezahlt').length
            },
            offenerBetrag: rechnungen
                .filter(r => !['bezahlt', 'storniert'].includes(r.status))
                .reduce((sum, r) => sum + (r.summen?.bruttobetrag || 0), 0),
            ueberfaelligeBetrag: rechnungen
                .filter(r => r.status === 'ueberfaellig')
                .reduce((sum, r) => sum + (r.summen?.bruttobetrag || 0), 0),
            xrechnungGeneriert: rechnungen.filter(r => r.xrechnung?.xmlGeneriert).length
        };
        
        return stats;
    }
    
    // =========================================
    // 🔧 HILFSFUNKTIONEN
    // =========================================
    
    // Tarih formatı her zaman Almanca (de-DE)
    static formatiereDatum(datum) {
        const date = new Date(datum);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`; // DD.MM.YYYY formatı (Almanca standart)
    }
    
    // Para birimi formatı her zaman Almanca (de-DE)
    static formatiereWaehrung(betrag) {
        const formatted = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(betrag);
        return formatted; // Örnek: "1.234,56 €"
    }
    
    // Birim kodları getir
    static getBirimKodlari() {
        return UNIT_CODES;
    }
    
    // Storno Rechnung erstellen
    static async erstelleStornoRechnung(originalRechnungId, stornoGrund, benutzer = 'System') {
        const original = await Rechnung.findById(originalRechnungId);
        if (!original) {
            throw new Error('Original-Rechnung nicht gefunden');
        }
        
        if (original.status === 'storniert') {
            throw new Error('Rechnung bereits storniert');
        }
        
        // Storno-Rechnung mit negativen Beträgen
        const stornoData = {
            ...original.toObject(),
            _id: undefined,
            rechnungsnummer: undefined, // Wird automatisch generiert
            rechnungsdatum: new Date(),
            status: 'versendet',
            positionen: original.positionen.map(pos => ({
                ...pos,
                einzelpreis: -pos.einzelpreis,
                gesamtpreis: -pos.gesamtpreis,
                steuerbetrag: pos.steuerbetrag ? -pos.steuerbetrag : undefined
            })),
            summen: {
                nettobetrag: -original.summen.nettobetrag,
                mehrwertsteuer: {
                    satz: original.summen.mehrwertsteuer.satz,
                    netto: -original.summen.mehrwertsteuer.netto,
                    betrag: -original.summen.mehrwertsteuer.betrag
                },
                bruttobetrag: -original.summen.bruttobetrag,
                zahlbetrag: -original.summen.bruttobetrag
            },
            stornoReferenz: {
                originalRechnungId: original._id,
                stornoGrund,
                stornoDatum: new Date()
            },
            xrechnung: {
                ...original.xrechnung,
                dokumentTyp: '381', // 381 = Credit Note / Gutschrift
                rechnungsTypCode: '381',
                xmlGeneriert: false
            },
            auditLog: [{
                zeitstempel: new Date(),
                aktion: 'erstellt',
                benutzer,
                details: `Storno für Rechnung ${original.rechnungsnummer}: ${stornoGrund}`
            }]
        };
        
        const stornoRechnung = await Rechnung.create(stornoData);
        
        // Original-Rechnung stornieren
        original.status = 'storniert';
        original.storniertAm = new Date();
        original.stornoReferenz = {
            stornoRechnungId: stornoRechnung._id,
            stornoGrund,
            stornoDatum: new Date()
        };
        original.addAuditLog('storniert', benutzer, `Storniert mit Gutschrift ${stornoRechnung.rechnungsnummer}`);
        await original.save();
        
        return stornoRechnung;
    }
}

module.exports = RechnungService;
