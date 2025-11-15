"use strict";
/* -------------------------------------------------------
    Rechnung Service - Deutsche Gesetzeskonform
------------------------------------------------------- */

const Rechnung = require('../models/rechnung');
const Payout = require('../models/payout');
const Payment = require('../models/payment');
const Usage = require('../models/usage');
const Business = require('../models/business');
const User = require('../models/user');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const sendMail = require('../helper/sendMail');

class RechnungService {
    
    // 📊 Payout için Rechnung oluştur
    static async erstelleRechnungFuerPayout(payoutId) {
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
                    // ✅ Tarih formatı her zaman Almanca
                    const datumFormatiert = this.formatiereDatum(payment.createdAt);
                    positionen.push({
                        positionsnummer: index + 1,
                        datum: payment.createdAt,
                        beschreibung: `WC-Nutzung - ${business.businessName} - ${datumFormatiert}`, // ✅ Almanca tarih formatı
                        menge: 1,
                        einzelpreis: payment.businessFee, // İşletme payı
                        gesamtpreis: payment.businessFee,
                        steuersatz: 19,
                        usageId: usage._id,
                        paymentId: payment._id
                    });
                }
            });
            
            // Summen berechnen
            const nettobetrag = payments.reduce((sum, p) => sum + p.businessFee, 0);
            const mwstBetrag = Math.round((nettobetrag * 0.19) * 100) / 100; // 19% MwSt
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
                    strasse: business.address?.street || '',
                    hausnummer: '',
                    plz: business.address?.postalCode || '',
                    ort: business.address?.city || '',
                    land: business.address?.country || 'Deutschland',
                    ustIdNr: business.ustIdNr || '',
                    email: business.owner?.email || '',
                    telefon: business.phone || ''
                },
                positionen,
                summen: {
                    nettobetrag: Math.round(nettobetrag * 100) / 100,
                    mehrwertsteuer: {
                        satz: 19,
                        betrag: mwstBetrag
                    },
                    bruttobetrag: bruttobetrag
                },
                zahlungsbedingungen: {
                    zahlungsziel: 14,
                    faelligkeitsdatum
                },
                status: 'entwurf'
            });
            
            console.log(`✅ Rechnung erstellt: ${rechnung.rechnungsnummer}`);
            return rechnung;
            
        } catch (error) {
            console.error('❌ Fehler beim Erstellen der Rechnung:', error);
            throw error;
        }
    }
    
    // 📄 PDF-Rechnung generieren (Deutscher Standard)
    static async generiereRechnungPDF(rechnung) {
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
                size: 'A4'
            });
            const stream = fs.createWriteStream(dateipfad);
            doc.pipe(stream);
            
            // === HEADER ===
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text(rechnung.leistender.firmenname, 50, 50);
            doc.font('Helvetica').fontSize(8);
            doc.text(`${rechnung.leistender.strasse}, ${rechnung.leistender.plz} ${rechnung.leistender.ort}`, 50);
            doc.text(`Tel: ${rechnung.leistender.telefon || '-'} | E-Mail: ${rechnung.leistender.email}`);
            doc.text(`USt-IdNr: ${rechnung.leistender.ustIdNr} | Steuernr: ${rechnung.leistender.steuernummer}`);
            
            // === Rechnungsempfänger ===
            doc.moveDown(2);
            doc.fontSize(10);
            doc.text(rechnung.rechnungsempfaenger.firmenname, 50, 150, { bold: true });
            if (rechnung.rechnungsempfaenger.ansprechpartner) {
                doc.text(`z.H. ${rechnung.rechnungsempfaenger.ansprechpartner}`);
            }
            doc.text(rechnung.rechnungsempfaenger.strasse);
            doc.text(`${rechnung.rechnungsempfaenger.plz} ${rechnung.rechnungsempfaenger.ort}`);
            
            // === Rechnungsdaten (rechts) ===
            doc.fontSize(9);
            doc.text(`Rechnungsnummer: ${rechnung.rechnungsnummer}`, 350, 150);
            doc.text(`Rechnungsdatum: ${this.formatiereDatum(rechnung.rechnungsdatum)}`, 350);
            doc.text(`Leistungszeitraum:`, 350);
            doc.text(`${this.formatiereDatum(rechnung.leistungszeitraum.von)} - ${this.formatiereDatum(rechnung.leistungszeitraum.bis)}`, 350);
            
            // === RECHNUNG Titel ===
            doc.moveDown(3);
            doc.fontSize(16).font('Helvetica-Bold');
            doc.text('RECHNUNG', 50, 250, { underline: true });
            
            // === Einleitung ===
            doc.moveDown(1);
            doc.fontSize(10).font('Helvetica');
            doc.text(`Sehr geehrte Damen und Herren,`, 50);
            doc.moveDown(0.5);
            doc.text(`für die Nutzung unserer Dienstleistungen im Zeitraum ${this.formatiereDatum(rechnung.leistungszeitraum.von)} bis ${this.formatiereDatum(rechnung.leistungszeitraum.bis)} erlauben wir uns, Ihnen folgende Positionen in Rechnung zu stellen:`, { width: 500 });
            
            // === Tabelle Header ===
            doc.moveDown(1.5);
            const tabelleTop = doc.y;
            const spalten = {
                pos: 50,
                datum: 80,
                beschreibung: 140,
                menge: 380,
                einzelpreis: 430,
                gesamt: 490
            };
            
            // Tabellen-Header
            doc.fontSize(9).font('Helvetica-Bold');
            doc.text('Pos.', spalten.pos, tabelleTop);
            doc.text('Datum', spalten.datum, tabelleTop);
            doc.text('Beschreibung', spalten.beschreibung, tabelleTop);
            doc.text('Menge', spalten.menge, tabelleTop);
            doc.text('Einzelpreis', spalten.einzelpreis, tabelleTop);
            doc.text('Gesamt', spalten.gesamt, tabelleTop);
            
            // Linie
            doc.moveTo(50, tabelleTop + 15).lineTo(550, tabelleTop + 15).stroke();
            
            // === Tabellen-Zeilen ===
            let y = tabelleTop + 25;
            doc.font('Helvetica').fontSize(8);
            rechnung.positionen.forEach(pos => {
                doc.text(String(pos.positionsnummer), spalten.pos, y);
                doc.text(this.formatiereDatum(pos.datum), spalten.datum, y);
                doc.text(pos.beschreibung, spalten.beschreibung, y, { width: 230 });
                doc.text(String(pos.menge), spalten.menge, y);
                doc.text(this.formatiereWaehrung(pos.einzelpreis), spalten.einzelpreis, y);
                doc.text(this.formatiereWaehrung(pos.gesamtpreis), spalten.gesamt, y);
                y += 25;
                
                // Neue Seite bei Bedarf
                if (y > 700) {
                    doc.addPage();
                    y = 50;
                }
            });
            
            // === Summen ===
            y += 10;
            doc.moveTo(350, y).lineTo(550, y).stroke();
            y += 15;
            
            doc.fontSize(10);
            doc.text('Nettobetrag:', 380, y);
            doc.text(this.formatiereWaehrung(rechnung.summen.nettobetrag), spalten.gesamt, y);
            y += 20;
            
            doc.text(`Mehrwertsteuer (${rechnung.summen.mehrwertsteuer.satz}%):`, 380, y);
            doc.text(this.formatiereWaehrung(rechnung.summen.mehrwertsteuer.betrag), spalten.gesamt, y);
            y += 25;
            
            doc.moveTo(350, y).lineTo(550, y).stroke();
            y += 10;
            
            doc.fontSize(12).font('Helvetica-Bold');
            doc.text('Gesamtbetrag:', 380, y);
            doc.text(this.formatiereWaehrung(rechnung.summen.bruttobetrag), spalten.gesamt, y);
            
            // === Zahlungsbedingungen ===
            doc.font('Helvetica').fontSize(10);
            doc.moveDown(3);
            doc.text(`Zahlbar innerhalb von ${rechnung.zahlungsbedingungen.zahlungsziel} Tagen ohne Abzug bis zum ${this.formatiereDatum(rechnung.zahlungsbedingungen.faelligkeitsdatum)}.`);
            doc.moveDown(0.5);
            doc.text('Bitte überweisen Sie den Betrag unter Angabe der Rechnungsnummer auf folgendes Konto:');
            doc.moveDown(0.5);
            doc.text(`IBAN: ${rechnung.zahlungsbedingungen.bankverbindung.iban}`);
            doc.text(`BIC: ${rechnung.zahlungsbedingungen.bankverbindung.bic}`);
            doc.text(`Bank: ${rechnung.zahlungsbedingungen.bankverbindung.bankname}`);
            doc.text(`Verwendungszweck: ${rechnung.rechnungsnummer}`);
            
            // === Schlusstext ===
            doc.moveDown(1);
            doc.text('Vielen Dank für Ihr Vertrauen!');
            doc.text('Mit freundlichen Grüßen');
            doc.moveDown(0.5);
            doc.text(rechnung.leistender.firmenname);
            
            // === Footer (Pflichtangaben) ===
            doc.fontSize(7).fillColor('#666666');
            const footerY = 750;
            doc.text(`${rechnung.leistender.firmenname} | Geschäftsführer: ${rechnung.leistender.geschaeftsfuehrer}`, 50, footerY, { align: 'center' });
            doc.text(`${rechnung.leistender.registergericht} | ${rechnung.leistender.handelsregister}`, 50, footerY + 10, { align: 'center' });
            doc.text(`Steuernummer: ${rechnung.leistender.steuernummer} | USt-IdNr: ${rechnung.leistender.ustIdNr}`, 50, footerY + 20, { align: 'center' });
            
            doc.end();
            
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });
            
            return `/rechnungen/${dateiname}`;
            
        } catch (error) {
            console.error('❌ Fehler beim Generieren der PDF:', error);
            throw error;
        }
    }
    
    // 📧 Rechnung per E-Mail versenden
    static async sendeRechnungEmail(rechnung) {
        try {
            await rechnung.populate('rechnungsempfaenger.businessId');
            const business = await Business.findById(rechnung.rechnungsempfaenger.businessId)
                .populate('owner');
            
            if (!business || !business.owner || !business.owner.email) {
                throw new Error('Empfänger-E-Mail nicht gefunden');
            }
            
            const betreff = `Rechnung ${rechnung.rechnungsnummer} - ${business.businessName}`;
            
            const nachricht = `
                <h2>Rechnung ${rechnung.rechnungsnummer}</h2>
                <p>Sehr geehrte/r ${business.owner.username},</p>
                
                <p>anbei erhalten Sie Ihre Rechnung für den Zeitraum ${this.formatiereDatum(rechnung.leistungszeitraum.von)} bis ${this.formatiereDatum(rechnung.leistungszeitraum.bis)}.</p>
                
                <table border="1" cellpadding="10" style="border-collapse: collapse; margin: 20px 0;">
                    <tr>
                        <td><strong>Rechnungsnummer:</strong></td>
                        <td>${rechnung.rechnungsnummer}</td>
                    </tr>
                    <tr>
                        <td><strong>Rechnungsdatum:</strong></td>
                        <td>${this.formatiereDatum(rechnung.rechnungsdatum)}</td>
                    </tr>
                    <tr>
                        <td><strong>Leistungszeitraum:</strong></td>
                        <td>${this.formatiereDatum(rechnung.leistungszeitraum.von)} - ${this.formatiereDatum(rechnung.leistungszeitraum.bis)}</td>
                    </tr>
                    <tr>
                        <td><strong>Anzahl Positionen:</strong></td>
                        <td>${rechnung.positionen.length}</td>
                    </tr>
                    <tr>
                        <td><strong>Nettobetrag:</strong></td>
                        <td>${this.formatiereWaehrung(rechnung.summen.nettobetrag)}</td>
                    </tr>
                    <tr>
                        <td><strong>MwSt (19%):</strong></td>
                        <td>${this.formatiereWaehrung(rechnung.summen.mehrwertsteuer.betrag)}</td>
                    </tr>
                    <tr style="background-color: #f0f0f0; font-weight: bold;">
                        <td><strong>Gesamtbetrag:</strong></td>
                        <td>${this.formatiereWaehrung(rechnung.summen.bruttobetrag)}</td>
                    </tr>
                    <tr>
                        <td><strong>Fällig am:</strong></td>
                        <td>${this.formatiereDatum(rechnung.zahlungsbedingungen.faelligkeitsdatum)}</td>
                    </tr>
                </table>
                
                <h3>Zahlungsinformationen:</h3>
                <p>
                    <strong>IBAN:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.iban}<br>
                    <strong>BIC:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.bic}<br>
                    <strong>Bank:</strong> ${rechnung.zahlungsbedingungen.bankverbindung.bankname}<br>
                    <strong>Verwendungszweck:</strong> ${rechnung.rechnungsnummer}
                </p>
                
                <p>Die Rechnung als PDF finden Sie in Ihrem Dashboard zum Download.</p>
                
                <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                
                <p>Mit freundlichen Grüßen<br>
                Ihr WCFinder Team</p>
            `;
            
            await sendMail(business.owner.email, betreff, nachricht);
            
            rechnung.status = 'versendet';
            rechnung.versendetAm = new Date();
            await rechnung.save();
            
            console.log(`✅ Rechnung per E-Mail versendet: ${rechnung.rechnungsnummer}`);
            
        } catch (error) {
            console.error('❌ Fehler beim Versenden der E-Mail:', error);
            throw error;
        }
    }
    
    // === Hilfsfunktionen ===
    // ✅ ZWINGEND: Tarih formatı her zaman Almanca (de-DE)
    static formatiereDatum(datum) {
        // Her zaman Almanca locale kullan (dil seçiminden bağımsız)
        const date = new Date(datum);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`; // DD.MM.YYYY formatı (Almanca standart)
    }
    
    // ✅ ZWINGEND: Para birimi formatı her zaman Almanca (de-DE)
    static formatiereWaehrung(betrag) {
        // Her zaman Almanca locale kullan (dil seçiminden bağımsız)
        // Format: 1.234,56 € (nokta binlik ayırıcı, virgül ondalık ayırıcı)
        const formatted = new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(betrag);
        return formatted; // Örnek: "1.234,56 €"
    }
}

module.exports = RechnungService;

