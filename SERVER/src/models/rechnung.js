"use strict";
/* -------------------------------------------------------
    Rechnung (Invoice) Model - Deutsche Steuergesetze §14 UStG
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

const RechnungSchema = new mongoose.Schema({
    // 1. Rechnungsnummer (§14 Abs. 4 Nr. 4 UStG)
    rechnungsnummer: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    
    // 2. Rechnungsdatum (§14 Abs. 4 Nr. 1 UStG)
    rechnungsdatum: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    // 3. Leistungszeitraum (Zeitpunkt der Lieferung/Leistung)
    leistungszeitraum: {
        von: { type: Date, required: true },  // Von (From)
        bis: { type: Date, required: true }   // Bis (To)
    },
    
    // 4. Payout Referansı (Hangi ödeme dağıtımı için)
    payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payout',
        index: true,
    },
    
    // 5. Leistungsempfänger (Rechnungsempfänger)
    rechnungsempfaenger: {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: true
        },
        firmenname: { type: String, required: true },
        ansprechpartner: String,
        strasse: String,
        hausnummer: String,
        plz: { type: String, required: true },
        ort: { type: String, required: true },
        land: { type: String, default: 'Deutschland' },
        ustIdNr: String,
        email: { type: String, required: true },
        telefon: String
    },
    
    // 6. Leistender (Unternehmer = WCFinder)
    leistender: {
        firmenname: { 
            type: String, 
            required: true,
            default: 'WCFinder GmbH'
        },
        strasse: { 
            type: String, 
            required: true,
            default: 'Musterstraße 123'
        },
        plz: { 
            type: String, 
            required: true,
            default: '53111'
        },
        ort: { 
            type: String, 
            required: true,
            default: 'Bonn'
        },
        land: { 
            type: String, 
            default: 'Deutschland'
        },
        steuernummer: { 
            type: String, 
            required: true,
            default: '123/456/78901'  // ⚠️ GERÇEK STEUERNUMMER EKLEYİN!
        },
        ustIdNr: { 
            type: String,
            default: 'DE123456789'  // ⚠️ GERÇEK UST-IDNR EKLEYİN!
        },
        telefon: String,
        email: { 
            type: String,
            default: 'rechnung@wcfinder.de'
        },
        website: {
            type: String,
            default: 'www.wcfinder.de'
        },
        geschaeftsfuehrer: {
            type: String,
            default: 'Max Mustermann'  // ⚠️ GERÇEK AD EKLEYİN!
        },
        registergericht: {
            type: String,
            default: 'Amtsgericht Bonn'
        },
        handelsregister: {
            type: String,
            default: 'HRB 12345'  // ⚠️ GERÇEK HRB NUMARASI EKLEYİN!
        }
    },
    
    // 7. Rechnungspositionen (§14 Abs. 4 Nr. 5-7 UStG)
    positionen: [{
        positionsnummer: { type: Number, required: true },
        datum: { type: Date, required: true },
        beschreibung: { type: String, required: true },
        menge: { type: Number, required: true },
        einzelpreis: { type: Number, required: true },
        gesamtpreis: { type: Number, required: true },
        steuersatz: { type: Number, required: true, default: 19 },
        usageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usage'
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }
    }],
    
    // 8. Gesamtbeträge
    summen: {
        nettobetrag: { type: Number, required: true },
        mehrwertsteuer: {
            satz: { type: Number, default: 19 },
            betrag: { type: Number, required: true }
        },
        bruttobetrag: { type: Number, required: true },
        ermaeßigteSteuer: {
            satz: { type: Number, default: 7 },
            netto: { type: Number, default: 0 },
            betrag: { type: Number, default: 0 }
        }
    },
    
    // 9. Zahlungsbedingungen
    zahlungsbedingungen: {
        zahlungsziel: { 
            type: Number, 
            default: 14
        },
        faelligkeitsdatum: { 
            type: Date, 
            required: true 
        },
        bankverbindung: {
            bankname: { 
                type: String,
                default: 'Sparkasse Bonn'
            },
            iban: { 
                type: String,
                default: 'DE89 3701 0050 0000 0000 00'  // ⚠️ GERÇEK IBAN EKLEYİN!
            },
            bic: { 
                type: String,
                default: 'PBNKDEFF'  // ⚠️ GERÇEK BIC EKLEYİN!
            }
        },
        verwendungszweck: String
    },
    
    // 10. Status und Verlauf
    status: {
        type: String,
        enum: ['entwurf', 'versendet', 'bezahlt', 'ueberfaellig', 'storniert', 'mahnung'],
        default: 'entwurf',
        index: true,
    },
    versendetAm: Date,
    bezahltAm: Date,
    storniertAm: Date,
    
    // 11. Dateien
    pdfPfad: String,
    
    // 12. Notizen (intern)
    notizen: String,
    
    // 13. Mahnungen
    mahnungen: [{
        mahnungsnummer: Number,
        datum: Date,
        betrag: Number,
        gesendet: Boolean
    }]
    
}, {
    collection: "rechnungen",
    timestamps: true,
});

// Rechnungsnummer automatisch generieren
RechnungSchema.pre('save', async function(next) {
    if (!this.rechnungsnummer) {
        const jahr = this.rechnungsdatum.getFullYear();
        const monat = String(this.rechnungsdatum.getMonth() + 1).padStart(2, '0');
        
        // Letzte Rechnung im gleichen Monat finden
        const letzteRechnung = await this.constructor
            .findOne({
                rechnungsdatum: {
                    $gte: new Date(jahr, this.rechnungsdatum.getMonth(), 1),
                    $lt: new Date(jahr, this.rechnungsdatum.getMonth() + 1, 1)
                }
            })
            .sort({ createdAt: -1 });
        
        let laufendeNummer = 1;
        if (letzteRechnung && letzteRechnung.rechnungsnummer) {
            const parts = letzteRechnung.rechnungsnummer.split('-');
            if (parts.length === 4) {
                const letzteLaufendeNr = parseInt(parts[3]);
                if (!isNaN(letzteLaufendeNr)) {
                    laufendeNummer = letzteLaufendeNr + 1;
                }
            }
        }
        
        this.rechnungsnummer = `RE-${jahr}-${monat}-${String(laufendeNummer).padStart(5, '0')}`;
    }
    
    // Verwendungszweck = Rechnungsnummer
    if (!this.zahlungsbedingungen.verwendungszweck) {
        this.zahlungsbedingungen.verwendungszweck = this.rechnungsnummer;
    }
    
    next();
});

// Virtuals
RechnungSchema.virtual('istUeberfaellig').get(function() {
    return this.status !== 'bezahlt' && 
           this.status !== 'storniert' && 
           new Date() > this.zahlungsbedingungen.faelligkeitsdatum;
});

RechnungSchema.virtual('tageUeberfaellig').get(function() {
    if (!this.istUeberfaellig) return 0;
    const diff = new Date() - this.zahlungsbedingungen.faelligkeitsdatum;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

RechnungSchema.set('toJSON', { virtuals: true });
RechnungSchema.set('toObject', { virtuals: true });

// Index'ler
RechnungSchema.index({ payoutId: 1 });
RechnungSchema.index({ 'rechnungsempfaenger.businessId': 1 });
RechnungSchema.index({ status: 1, createdAt: -1 });
RechnungSchema.index({ rechnungsdatum: -1 });

module.exports = mongoose.model("Rechnung", RechnungSchema);

