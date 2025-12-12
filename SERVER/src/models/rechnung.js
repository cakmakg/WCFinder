"use strict";
/* -------------------------------------------------------
    Rechnung (Invoice) Model - Deutsche Steuergesetze §14 UStG
    EN 16931 / XRechnung 3.0 Konform
    GoBD Konform
------------------------------------------------------- */
const { mongoose } = require("../config/dbConnection");

// UN/ECE Recommendation 20 Birim Kodları
const UNIT_CODES = {
    H87: 'Stück',      // Piece
    HUR: 'Stunde',     // Hour
    DAY: 'Tag',        // Day
    MON: 'Monat',      // Month
    KGM: 'Kilogramm',  // Kilogram
    MTR: 'Meter',      // Metre
    LTR: 'Liter',      // Litre
    C62: 'Einheit',    // Unit
    MIN: 'Minute'      // Minute
};

// Fatura Türleri
const INVOICE_TYPES = {
    INVOICE: 'invoice',              // Normal fatura (380)
    CREDIT_NOTE: 'credit_note',      // Gutschrift/Storno (381)
    CORRECTED: 'corrected_invoice',  // Düzeltme faturası (384)
    ADVANCE: 'advance_invoice'       // Avans faturası (386)
};

// Fatura Durumları
const INVOICE_STATUS = {
    ENTWURF: 'entwurf',           // Draft
    VERSENDET: 'versendet',       // Sent
    ANGESEHEN: 'angesehen',       // Viewed (NEW)
    TEILBEZAHLT: 'teilbezahlt',   // Partially paid (NEW)
    BEZAHLT: 'bezahlt',           // Paid
    UEBERFAELLIG: 'ueberfaellig', // Overdue
    MAHNUNG: 'mahnung',           // Reminder sent
    STORNIERT: 'storniert',       // Cancelled
    ANGEFOCHTEN: 'angefochten'    // Disputed (NEW)
};

// Audit Log Schema (GoBD Konform)
const AuditLogSchema = new mongoose.Schema({
    zeitstempel: { 
        type: Date, 
        required: true, 
        default: Date.now,
        immutable: true // Değiştirilemez
    },
    aktion: { 
        type: String, 
        required: true,
        enum: [
            'erstellt', 
            'aktualisiert', 
            'versendet', 
            'angesehen',
            'bezahlt',
            'teilbezahlt',
            'storniert', 
            'mahnung_gesendet', 
            'pdf_generiert', 
            'email_gesendet',
            'zahlung_erhalten',
            'angefochten'
        ]
    },
    benutzer: { 
        type: String, 
        required: true 
    },
    benutzerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    details: { 
        type: String 
    },
    vorherWert: mongoose.Schema.Types.Mixed,
    nachherWert: mongoose.Schema.Types.Mixed,
    ipAdresse: String
}, { _id: false });

// Zahlung Schema (für Teilzahlungen)
const ZahlungSchema = new mongoose.Schema({
    zahlungsdatum: { 
        type: Date, 
        required: true,
        default: Date.now
    },
    betrag: { 
        type: Number, 
        required: true,
        min: 0.01
    },
    zahlungsmethode: {
        type: String,
        enum: ['bank_transfer', 'cash', 'credit_card', 'paypal', 'other'],
        default: 'bank_transfer'
    },
    transaktionsreferenz: String,
    notizen: String,
    erfasstVon: String,
    erfasstAm: { type: Date, default: Date.now }
}, { _id: true });

const RechnungSchema = new mongoose.Schema({
    // ============================================
    // 1. RECHNUNGSNUMMER (§14 Abs. 4 Nr. 4 UStG)
    // Fortlaufend und einmalig
    // ============================================
    rechnungsnummer: {
        type: String,
        required: true,
        unique: true,
        index: true,
        immutable: true // GoBD: Rechnungsnummer darf nicht geändert werden
    },
    
    // ============================================
    // 2. RECHNUNGSTYP
    // ============================================
    rechnungstyp: {
        type: String,
        enum: Object.values(INVOICE_TYPES),
        default: INVOICE_TYPES.INVOICE
    },
    
    // Verknüpfte Rechnung (für Storno/Korrektur)
    verknuepfteRechnungId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rechnung'
    },
    
    // ============================================
    // 3. RECHNUNGSDATUM (§14 Abs. 4 Nr. 1 UStG)
    // Ausstellungsdatum der Rechnung
    // ============================================
    rechnungsdatum: {
        type: Date,
        required: true,
        default: Date.now
    },
    
    // ============================================
    // 4. LEISTUNGSZEITRAUM (§14 Abs. 4 Nr. 6 UStG)
    // Zeitpunkt der Lieferung/Leistung
    // ============================================
    leistungszeitraum: {
        von: { type: Date, required: true },
        bis: { type: Date, required: true }
    },
    
    // ============================================
    // 5. PAYOUT REFERENZ (WCFinder spezifisch)
    // ============================================
    payoutId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payout',
        index: true,
    },
    
    // ============================================
    // 6. KUNDENNUMMER & REFERENZEN
    // ============================================
    kundennummer: String,
    bestellreferenz: String,     // Order reference
    kaeuferReferenz: String,     // Leitweg-ID für B2G
    
    // ============================================
    // 7. LEISTUNGSEMPFÄNGER / RECHNUNGSEMPFÄNGER
    // (§14 Abs. 4 Nr. 1 UStG)
    // Vollständiger Name und Anschrift
    // ============================================
    rechnungsempfaenger: {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: true
        },
        // Firmenname (Pflicht)
        firmenname: { type: String, required: true },
        // Zusatz
        namenszusatz: String,
        // Ansprechpartner
        ansprechpartner: String,
        abteilung: String,
        // Adresse (Pflicht)
        strasse: { type: String, required: true },
        hausnummer: String,
        adresszusatz: String,
        plz: { type: String, required: true },
        ort: { type: String, required: true },
        land: { type: String, default: 'Deutschland' },
        landCode: { type: String, default: 'DE' }, // ISO 3166-1 alpha-2
        // Steuerliche Identifikation
        ustIdNr: String, // USt-IdNr. (z.B. DE123456789)
        steuernummer: String,
        // Kontakt
        email: { type: String, required: true },
        telefon: String,
        // XRechnung: Leitweg-ID (für B2G)
        leitwegId: String
    },
    
    // ============================================
    // 8. LEISTENDER / RECHNUNGSSTELLER
    // (§14 Abs. 4 Nr. 1 UStG)
    // ============================================
    leistender: {
        firmenname: { 
            type: String, 
            required: true,
            default: 'WCFinder GmbH'
        },
        rechtsform: String,
        strasse: { 
            type: String, 
            required: true,
            default: 'Musterstraße 123'
        },
        hausnummer: String,
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
        landCode: { 
            type: String, 
            default: 'DE'
        },
        // Steuerliche Pflichtangaben (§14 Abs. 4 Nr. 2 UStG)
        steuernummer: { 
            type: String, 
            required: true,
            default: '123/456/78901'  // ⚠️ GERÇEK STEUERNUMMER EKLEYİN!
        },
        ustIdNr: { 
            type: String,
            default: 'DE123456789'  // ⚠️ GERÇEK UST-IDNR EKLEYİN!
        },
        telefon: {
            type: String,
            default: '+49 228 1234567'
        },
        email: { 
            type: String,
            default: 'rechnung@wcfinder.de'
        },
        website: {
            type: String,
            default: 'www.wcfinder.de'
        },
        // Handelsregister (Pflicht bei GmbH)
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
        },
        // Logo URL
        logoUrl: String
    },
    
    // ============================================
    // 9. RECHNUNGSPOSITIONEN (§14 Abs. 4 Nr. 5-7 UStG)
    // Menge und Art der Leistung
    // ============================================
    positionen: [{
        positionsnummer: { type: Number, required: true },
        datum: { type: Date, required: true },
        // Beschreibung der Leistung (Pflicht)
        beschreibung: { type: String, required: true },
        // Detaillierte Beschreibung (NEU)
        details: String,
        // Artikelnummer (NEU)
        artikelnummer: String,
        // Menge (Pflicht)
        menge: { type: Number, required: true },
        // UN/ECE Recommendation 20 Einheitencode
        einheitCode: { 
            type: String, 
            enum: Object.keys(UNIT_CODES),
            default: 'C62' // Einheit
        },
        einheitName: { type: String },
        // Preise (Pflicht)
        einzelpreis: { type: Number, required: true },
        gesamtpreis: { type: Number, required: true },
        // Steuersatz für diese Position
        steuersatz: { type: Number, required: true, default: 19 },
        steuerbetrag: { type: Number },
        // Rabatt (optional)
        rabatt: {
            prozent: { type: Number, default: 0 },
            betrag: { type: Number, default: 0 }
        },
        // Referenzen
        usageId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usage'
        },
        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment'
        }
    }],
    
    // ============================================
    // 10. SUMMEN UND STEUERN (§14 Abs. 4 Nr. 7-8 UStG)
    // ============================================
    summen: {
        // Nettobetrag (ohne Steuer)
        nettobetrag: { type: Number, required: true },
        // Regelsteuersatz 19%
        mehrwertsteuer: {
            satz: { type: Number, default: 19 },
            netto: { type: Number }, // Netto für diesen Steuersatz
            betrag: { type: Number, required: true }
        },
        // Ermäßigter Steuersatz 7% (falls vorhanden)
        ermaeßigteSteuer: {
            satz: { type: Number, default: 7 },
            netto: { type: Number, default: 0 },
            betrag: { type: Number, default: 0 }
        },
        // Bruttobetrag (mit Steuer)
        bruttobetrag: { type: Number, required: true },
        // Vorauszahlung (falls vorhanden)
        vorauszahlung: { type: Number, default: 0 },
        // Zahlbetrag
        zahlbetrag: { type: Number }
    },
    
    // ============================================
    // 11. KLEINUNTERNEHMERREGELUNG (§19 UStG)
    // ============================================
    kleinunternehmer: {
        istKleinunternehmer: { type: Boolean, default: false },
        // Pflicht-Hinweis wenn true:
        // "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet."
        hinweisText: { type: String }
    },
    
    // ============================================
    // 12. ZAHLUNGSBEDINGUNGEN
    // ============================================
    zahlungsbedingungen: {
        // Zahlungsziel in Tagen
        zahlungsziel: { 
            type: Number, 
            default: 14
        },
        // Fälligkeitsdatum
        faelligkeitsdatum: { 
            type: Date, 
            required: true 
        },
        // SEPA Bankverbindung
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
            },
            kontoinhaber: {
                type: String,
                default: 'WCFinder GmbH'
            }
        },
        // Verwendungszweck
        verwendungszweck: String,
        // Skonto (optional)
        skonto: {
            prozent: { type: Number, default: 0 },
            tage: { type: Number, default: 0 },
            betrag: { type: Number, default: 0 }
        }
    },
    
    // ============================================
    // 13. TEXTE
    // ============================================
    betreff: String,           // Subject line (Betreffzeile)
    einleitungstext: String,   // Greeting/intro text
    schlusstext: String,       // Closing text (NEU)
    notizen: String,           // Internal notes
    
    // ============================================
    // 14. STATUS UND ZAHLUNGEN
    // ============================================
    status: {
        type: String,
        enum: Object.values(INVOICE_STATUS),
        default: INVOICE_STATUS.ENTWURF,
        index: true,
    },
    
    // Storno-Referenz (wenn storniert)
    stornoReferenz: {
        originalRechnungId: mongoose.Schema.Types.ObjectId,
        stornoRechnungId: mongoose.Schema.Types.ObjectId,
        stornoGrund: String,
        stornoDatum: Date
    },
    
    // Zeitstempel
    versendetAm: Date,
    angesehenAm: Date,          // NEU: Wann wurde die Rechnung angesehen
    bezahltAm: Date,
    storniertAm: Date,
    
    // ZAHLUNGEN (NEU)
    zahlungen: [ZahlungSchema],
    bezahlterBetrag: { type: Number, default: 0 },  // NEU: Gezahlter Betrag
    offenerBetrag: { type: Number },                 // NEU: Offener Betrag
    
    // ============================================
    // 15. DATEIEN
    // ============================================
    pdfPfad: String,
    xrechnungPfad: String, // XRechnung XML Pfad
    
    // ============================================
    // 16. MAHNUNGEN
    // ============================================
    mahnungen: [{
        mahnungsnummer: Number,
        mahnstufe: { type: Number, default: 1 }, // 1, 2, 3
        datum: Date,
        faelligkeitsdatum: Date,
        offenerBetrag: Number,
        mahngebuehr: { type: Number, default: 0 },
        verzugszinsen: { type: Number, default: 0 },
        gesamtbetrag: Number,
        pdfPfad: String,
        gesendet: { type: Boolean, default: false },
        gesendetAm: Date
    }],
    
    // ============================================
    // 17. XRECHNUNG / EN 16931 METADATA
    // ============================================
    xrechnung: {
        // Profil ID (XRechnung 3.0)
        profilId: { 
            type: String, 
            default: 'urn:cen.eu:en16931:2017#compliant#urn:xeinkauf.de:kosit:xrechnung_3.0'
        },
        // Dokumenttyp
        dokumentTyp: { 
            type: String, 
            default: '380' // 380 = Commercial Invoice
        },
        // Rechnungstyp Code
        rechnungsTypCode: {
            type: String,
            default: '380' // UNTDID 1001
        },
        // Währungscode
        waehrungscode: { 
            type: String, 
            default: 'EUR' 
        },
        // Käufer-Referenz (Bestellnummer etc.)
        kaeuferReferenz: String,
        // Vertragsnummer
        vertragsnummer: String,
        // Bestellnummer
        bestellnummer: String,
        // Lieferscheinnummer
        lieferscheinnummer: String,
        // Projekt-Referenz
        projektReferenz: String,
        // XML generiert
        xmlGeneriert: { type: Boolean, default: false },
        xmlGeneriertAm: Date,
        // Validierungsstatus
        validiert: { type: Boolean, default: false },
        validierungsFehler: [String]
    },
    
    // ============================================
    // 18. GOBD AUDIT LOG
    // Unveränderlicher Protokolleintrag
    // ============================================
    auditLog: {
        type: [AuditLogSchema],
        default: []
    },
    
    // ============================================
    // 19. ARCHIVIERUNG (GoBD)
    // 10 Jahre Aufbewahrungspflicht
    // ============================================
    archivierung: {
        archiviert: { type: Boolean, default: false },
        archiviertAm: Date,
        aufbewahrungBis: Date, // 10 Jahre nach Jahresende
        hashWert: String // SHA-256 Hash für Integritätsprüfung
    },
    
    // ============================================
    // 20. ERSTELLER
    // ============================================
    erstelltVon: {
        benutzerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        benutzerEmail: String,
        benutzerName: String
    }
    
}, {
    collection: "rechnungen",
    timestamps: true,
});

// =============================================
// PRE-SAVE HOOK
// Rechnungsnummer automatisch generieren
// =============================================
RechnungSchema.pre('save', async function(next) {
    // Rechnungsnummer generieren (wenn neu)
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
    
    // Zahlbetrag berechnen
    if (!this.summen.zahlbetrag) {
        this.summen.zahlbetrag = this.summen.bruttobetrag - (this.summen.vorauszahlung || 0);
    }
    
    // Offener Betrag berechnen
    this.offenerBetrag = (this.summen.zahlbetrag || this.summen.bruttobetrag) - (this.bezahlterBetrag || 0);
    
    // Einheitnamen für Positionen setzen
    this.positionen.forEach(pos => {
        if (pos.einheitCode && !pos.einheitName) {
            pos.einheitName = UNIT_CODES[pos.einheitCode] || 'Einheit';
        }
        // Steuerbetrag pro Position berechnen
        if (!pos.steuerbetrag && pos.gesamtpreis && pos.steuersatz) {
            pos.steuerbetrag = Math.round((pos.gesamtpreis * pos.steuersatz / 100) * 100) / 100;
        }
    });
    
    // Kleinunternehmer-Hinweis setzen
    if (this.kleinunternehmer?.istKleinunternehmer && !this.kleinunternehmer.hinweisText) {
        this.kleinunternehmer.hinweisText = 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.';
    }
    
    // Aufbewahrungsfrist berechnen (10 Jahre nach Jahresende)
    if (!this.archivierung?.aufbewahrungBis) {
        const jahresende = new Date(this.rechnungsdatum.getFullYear(), 11, 31);
        const aufbewahrungBis = new Date(jahresende);
        aufbewahrungBis.setFullYear(aufbewahrungBis.getFullYear() + 10);
        this.archivierung = this.archivierung || {};
        this.archivierung.aufbewahrungBis = aufbewahrungBis;
    }
    
    next();
});

// =============================================
// METHODS
// =============================================

// Audit Log Eintrag hinzufügen (GoBD)
RechnungSchema.methods.addAuditLog = function(aktion, benutzer, details, vorherWert, nachherWert, benutzerId, ipAdresse) {
    this.auditLog.push({
        zeitstempel: new Date(),
        aktion,
        benutzer,
        benutzerId,
        details,
        vorherWert,
        nachherWert,
        ipAdresse
    });
};

// Status ändern mit Audit Log
RechnungSchema.methods.setStatus = function(neuerStatus, benutzer, details, benutzerId) {
    const alterStatus = this.status;
    this.status = neuerStatus;
    
    // Timestamps setzen
    if (neuerStatus === 'versendet' && !this.versendetAm) {
        this.versendetAm = new Date();
    } else if (neuerStatus === 'angesehen' && !this.angesehenAm) {
        this.angesehenAm = new Date();
    } else if (neuerStatus === 'bezahlt' && !this.bezahltAm) {
        this.bezahltAm = new Date();
    } else if (neuerStatus === 'storniert' && !this.storniertAm) {
        this.storniertAm = new Date();
    }
    
    // Audit Log
    this.addAuditLog(
        neuerStatus === 'storniert' ? 'storniert' : 'aktualisiert',
        benutzer,
        details || `Status geändert: ${alterStatus} → ${neuerStatus}`,
        { status: alterStatus },
        { status: neuerStatus },
        benutzerId
    );
};

// Zahlung hinzufügen
RechnungSchema.methods.addZahlung = function(zahlungsDaten, benutzer, benutzerId) {
    const zahlung = {
        zahlungsdatum: zahlungsDaten.zahlungsdatum || new Date(),
        betrag: zahlungsDaten.betrag,
        zahlungsmethode: zahlungsDaten.zahlungsmethode || 'bank_transfer',
        transaktionsreferenz: zahlungsDaten.transaktionsreferenz,
        notizen: zahlungsDaten.notizen,
        erfasstVon: benutzer,
        erfasstAm: new Date()
    };
    
    this.zahlungen.push(zahlung);
    this.bezahlterBetrag = (this.bezahlterBetrag || 0) + zahlung.betrag;
    this.offenerBetrag = (this.summen.zahlbetrag || this.summen.bruttobetrag) - this.bezahlterBetrag;
    
    // Status aktualisieren
    if (this.offenerBetrag <= 0) {
        this.setStatus('bezahlt', benutzer, `Vollständig bezahlt: ${zahlung.betrag}€`, benutzerId);
    } else if (this.bezahlterBetrag > 0) {
        this.setStatus('teilbezahlt', benutzer, `Teilzahlung erhalten: ${zahlung.betrag}€ (Offen: ${this.offenerBetrag}€)`, benutzerId);
    }
    
    // Audit Log
    this.addAuditLog(
        'zahlung_erhalten',
        benutzer,
        `Zahlung erhalten: ${zahlung.betrag}€ via ${zahlung.zahlungsmethode}`,
        { bezahlterBetrag: this.bezahlterBetrag - zahlung.betrag },
        { bezahlterBetrag: this.bezahlterBetrag, zahlung },
        benutzerId
    );
    
    return zahlung;
};

// =============================================
// VIRTUALS
// =============================================
RechnungSchema.virtual('istUeberfaellig').get(function() {
    return !['bezahlt', 'storniert'].includes(this.status) && 
           new Date() > this.zahlungsbedingungen.faelligkeitsdatum;
});

RechnungSchema.virtual('tageUeberfaellig').get(function() {
    if (!this.istUeberfaellig) return 0;
    const diff = new Date() - this.zahlungsbedingungen.faelligkeitsdatum;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Flatten für Frontend
RechnungSchema.virtual('nettobetrag').get(function() {
    return this.summen?.nettobetrag || 0;
});

RechnungSchema.virtual('mwstBetrag').get(function() {
    return this.summen?.mehrwertsteuer?.betrag || 0;
});

RechnungSchema.virtual('mwstSatz').get(function() {
    return this.summen?.mehrwertsteuer?.satz || 19;
});

RechnungSchema.virtual('gesamtbetrag').get(function() {
    return this.summen?.bruttobetrag || 0;
});

RechnungSchema.virtual('faelligkeitsdatum').get(function() {
    return this.zahlungsbedingungen?.faelligkeitsdatum;
});

RechnungSchema.virtual('bankverbindung').get(function() {
    return this.zahlungsbedingungen?.bankverbindung;
});

RechnungSchema.set('toJSON', { virtuals: true });
RechnungSchema.set('toObject', { virtuals: true });

// =============================================
// INDEXES
// =============================================
RechnungSchema.index({ payoutId: 1 });
RechnungSchema.index({ 'rechnungsempfaenger.businessId': 1 });
RechnungSchema.index({ status: 1, createdAt: -1 });
RechnungSchema.index({ rechnungsdatum: -1 });
RechnungSchema.index({ 'zahlungsbedingungen.faelligkeitsdatum': 1 });
RechnungSchema.index({ 'archivierung.aufbewahrungBis': 1 });
RechnungSchema.index({ rechnungstyp: 1 });
RechnungSchema.index({ kundennummer: 1 });

// =============================================
// STATICS
// =============================================

// Birim kodlarını getir
RechnungSchema.statics.getUnitCodes = function() {
    return UNIT_CODES;
};

// Fatura türlerini getir
RechnungSchema.statics.getInvoiceTypes = function() {
    return INVOICE_TYPES;
};

// Fatura durumlarını getir
RechnungSchema.statics.getInvoiceStatuses = function() {
    return INVOICE_STATUS;
};

module.exports = mongoose.model("Rechnung", RechnungSchema);
