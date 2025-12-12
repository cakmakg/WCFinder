"use strict";
/* -------------------------------------------------------
    Rechnung Validation Middleware
    §14 UStG Konform - Express Validator
------------------------------------------------------- */

const { body, query, param, validationResult } = require('express-validator');

// =============================================
// VALIDATION HELPER FUNCTIONS
// =============================================

/**
 * Deutsche IBAN Validierung
 * Format: DE + 2 Prüfziffern + 18 Ziffern (Bankleitzahl + Kontonummer)
 */
const isValidGermanIBAN = (iban) => {
    if (!iban) return false;
    // Remove spaces
    const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
    // German IBAN: DE + 20 characters
    return /^DE[0-9]{20}$/.test(cleanIBAN);
};

/**
 * BIC/SWIFT Validierung
 * Format: 8 oder 11 Zeichen
 */
const isValidBIC = (bic) => {
    if (!bic) return false;
    return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.toUpperCase());
};

/**
 * Deutsche USt-IdNr Validierung
 * Format: DE + 9 Ziffern
 */
const isValidUStIdNr = (ustIdNr) => {
    if (!ustIdNr) return true; // Optional
    return /^DE[0-9]{9}$/.test(ustIdNr.toUpperCase());
};

/**
 * Deutsche PLZ Validierung
 * Format: 5 Ziffern
 */
const isValidGermanPLZ = (plz) => {
    if (!plz) return false;
    return /^\d{5}$/.test(plz);
};

/**
 * Deutsche Steuernummer Validierung
 * Format: varies by state, typically XX/XXX/XXXXX or XXX/XXX/XXXXX
 */
const isValidSteuernummer = (steuernummer) => {
    if (!steuernummer) return true; // Optional (if USt-IdNr exists)
    // Basic format check - numbers and slashes
    return /^[\d\/]+$/.test(steuernummer) && steuernummer.length >= 10;
};

// =============================================
// VALIDATION ERROR HANDLER
// =============================================

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: true,
            message: 'Validierungsfehler',
            errors: errors.array().map(e => ({
                field: e.path || e.param,
                message: e.msg,
                value: e.value
            }))
        });
    }
    next();
};

// =============================================
// RECHNUNG VALIDATION RULES
// =============================================

/**
 * Validierung für Rechnung erstellen (aus Payout)
 */
const createForPayoutValidation = [
    body('payoutId')
        .notEmpty()
        .withMessage('Payout-ID ist erforderlich')
        .isMongoId()
        .withMessage('Ungültige Payout-ID'),
    
    body('kleinunternehmer')
        .optional()
        .isBoolean()
        .withMessage('Kleinunternehmer muss ein Boolean sein'),
    
    handleValidationErrors
];

/**
 * Validierung für manuelle Rechnung erstellen
 */
const createInvoiceValidation = [
    // ============================================
    // SELLER (Leistender) - §14 Abs. 4 Nr. 1 UStG
    // ============================================
    body('seller.firmenname')
        .notEmpty()
        .withMessage('Firmenname ist erforderlich (§14 UStG)'),
    
    body('seller.strasse')
        .notEmpty()
        .withMessage('Straße ist erforderlich (§14 UStG)'),
    
    body('seller.plz')
        .notEmpty()
        .withMessage('PLZ ist erforderlich')
        .custom((value) => {
            if (!isValidGermanPLZ(value)) {
                throw new Error('PLZ muss 5 Ziffern haben');
            }
            return true;
        }),
    
    body('seller.ort')
        .notEmpty()
        .withMessage('Stadt ist erforderlich'),
    
    body('seller.email')
        .notEmpty()
        .withMessage('E-Mail ist erforderlich')
        .isEmail()
        .withMessage('Gültige E-Mail erforderlich'),
    
    // Steuernummer oder USt-IdNr muss vorhanden sein (§14 Abs. 4 Nr. 2 UStG)
    body()
        .custom((value, { req }) => {
            const seller = req.body.seller || {};
            if (!seller.steuernummer && !seller.ustIdNr) {
                throw new Error('Steuernummer oder USt-IdNr ist erforderlich (§14 UStG)');
            }
            return true;
        }),
    
    body('seller.ustIdNr')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (value && !isValidUStIdNr(value)) {
                throw new Error('USt-IdNr muss im Format DE123456789 sein');
            }
            return true;
        }),
    
    body('seller.steuernummer')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (value && !isValidSteuernummer(value)) {
                throw new Error('Ungültiges Steuernummer-Format');
            }
            return true;
        }),
    
    // Bankverbindung
    body('seller.iban')
        .optional()
        .custom((value) => {
            if (value && !isValidGermanIBAN(value)) {
                throw new Error('IBAN muss deutsches Format haben (DE + 20 Ziffern)');
            }
            return true;
        }),
    
    body('seller.bic')
        .optional()
        .custom((value) => {
            if (value && !isValidBIC(value)) {
                throw new Error('BIC-Format ungültig');
            }
            return true;
        }),
    
    // ============================================
    // BUYER (Leistungsempfänger) - §14 Abs. 4 Nr. 1 UStG
    // ============================================
    body('buyer.firmenname')
        .notEmpty()
        .withMessage('Kundenname ist erforderlich (§14 UStG)'),
    
    body('buyer.strasse')
        .notEmpty()
        .withMessage('Kundenadresse ist erforderlich (§14 UStG)'),
    
    body('buyer.plz')
        .notEmpty()
        .withMessage('Kunden-PLZ ist erforderlich')
        .custom((value, { req }) => {
            const buyer = req.body.buyer || {};
            // Nur deutsche PLZ validieren
            if ((!buyer.landCode || buyer.landCode === 'DE') && !isValidGermanPLZ(value)) {
                throw new Error('Deutsche PLZ muss 5 Ziffern haben');
            }
            return true;
        }),
    
    body('buyer.ort')
        .notEmpty()
        .withMessage('Kundenstadt ist erforderlich'),
    
    body('buyer.ustIdNr')
        .optional({ nullable: true, checkFalsy: true })
        .custom((value) => {
            if (value && !isValidUStIdNr(value)) {
                throw new Error('Kunden USt-IdNr muss im Format DE123456789 sein');
            }
            return true;
        }),
    
    // ============================================
    // POSITIONEN (Rechnungsposten) - §14 Abs. 4 Nr. 5 UStG
    // ============================================
    body('positionen')
        .isArray({ min: 1 })
        .withMessage('Mindestens eine Position erforderlich (§14 UStG)'),
    
    body('positionen.*.beschreibung')
        .notEmpty()
        .withMessage('Artikelbeschreibung ist erforderlich'),
    
    body('positionen.*.menge')
        .isFloat({ min: 0.001 })
        .withMessage('Menge muss positiv sein'),
    
    body('positionen.*.einzelpreis')
        .isFloat({ min: 0 })
        .withMessage('Preis muss positiv sein'),
    
    body('positionen.*.einheitCode')
        .optional()
        .isIn(['H87', 'HUR', 'DAY', 'MON', 'KGM', 'MTR', 'LTR', 'C62', 'MIN'])
        .withMessage('Ungültiger Einheitencode (UN/ECE Rec 20)'),
    
    body('positionen.*.steuersatz')
        .optional()
        .isIn([0, 7, 19])
        .withMessage('Steuersatz muss 0%, 7% oder 19% sein'),
    
    // ============================================
    // DATES - §14 Abs. 4 Nr. 3-4 UStG
    // ============================================
    body('rechnungsdatum')
        .optional()
        .isISO8601()
        .withMessage('Rechnungsdatum im ISO-Format erforderlich'),
    
    body('leistungszeitraum.von')
        .optional()
        .isISO8601()
        .withMessage('Leistungszeitraum Start im ISO-Format erforderlich'),
    
    body('leistungszeitraum.bis')
        .optional()
        .isISO8601()
        .withMessage('Leistungszeitraum Ende im ISO-Format erforderlich'),
    
    // ============================================
    // VAT & PAYMENT
    // ============================================
    body('summen.mehrwertsteuer.satz')
        .optional()
        .isIn([0, 7, 19])
        .withMessage('MwSt-Satz muss 0%, 7% oder 19% sein'),
    
    body('zahlungsbedingungen.zahlungsziel')
        .optional()
        .isInt({ min: 0, max: 365 })
        .withMessage('Zahlungsziel muss zwischen 0 und 365 Tagen sein'),
    
    body('kleinunternehmer.istKleinunternehmer')
        .optional()
        .isBoolean()
        .withMessage('Kleinunternehmer muss ein Boolean sein'),
    
    handleValidationErrors
];

/**
 * Status Update Validierung
 */
const statusUpdateValidation = [
    body('status')
        .notEmpty()
        .withMessage('Status ist erforderlich')
        .isIn([
            'entwurf', 
            'versendet', 
            'angesehen',      // NEU: viewed
            'teilbezahlt',    // NEU: partially_paid
            'bezahlt', 
            'ueberfaellig', 
            'mahnung',
            'storniert',
            'angefochten'     // NEU: disputed
        ])
        .withMessage('Ungültiger Status'),
    
    body('details')
        .optional()
        .isString()
        .isLength({ max: 500 })
        .withMessage('Details darf maximal 500 Zeichen haben'),
    
    handleValidationErrors
];

/**
 * Zahlung registrieren Validierung
 */
const paymentValidation = [
    body('betrag')
        .notEmpty()
        .withMessage('Betrag ist erforderlich')
        .isFloat({ min: 0.01 })
        .withMessage('Betrag muss positiv sein'),
    
    body('zahlungsdatum')
        .optional()
        .isISO8601()
        .withMessage('Zahlungsdatum im ISO-Format erforderlich'),
    
    body('zahlungsmethode')
        .optional()
        .isIn(['bank_transfer', 'cash', 'credit_card', 'paypal', 'other'])
        .withMessage('Ungültige Zahlungsmethode'),
    
    body('transaktionsreferenz')
        .optional()
        .isString()
        .isLength({ max: 100 })
        .withMessage('Transaktionsreferenz maximal 100 Zeichen'),
    
    handleValidationErrors
];

/**
 * Storno Validierung
 */
const stornoValidation = [
    body('grund')
        .notEmpty()
        .withMessage('Stornogrund ist erforderlich')
        .isString()
        .isLength({ min: 5, max: 500 })
        .withMessage('Stornogrund muss zwischen 5 und 500 Zeichen haben'),
    
    handleValidationErrors
];

/**
 * Liste/Filter Validierung
 */
const listValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Seite muss eine positive Zahl sein'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit muss zwischen 1 und 100 sein'),
    
    query('status')
        .optional()
        .isIn([
            'entwurf', 
            'versendet', 
            'angesehen',
            'teilbezahlt',
            'bezahlt', 
            'ueberfaellig', 
            'mahnung',
            'storniert',
            'angefochten'
        ])
        .withMessage('Ungültiger Status-Filter'),
    
    query('from')
        .optional()
        .isISO8601()
        .withMessage('Von-Datum im ISO-Format erforderlich'),
    
    query('to')
        .optional()
        .isISO8601()
        .withMessage('Bis-Datum im ISO-Format erforderlich'),
    
    handleValidationErrors
];

/**
 * ID Parameter Validierung
 */
const idParamValidation = [
    param('id')
        .isMongoId()
        .withMessage('Ungültige Rechnungs-ID'),
    
    handleValidationErrors
];

// =============================================
// EXPORTS
// =============================================

module.exports = {
    // Validation Rules
    createForPayoutValidation,
    createInvoiceValidation,
    statusUpdateValidation,
    paymentValidation,
    stornoValidation,
    listValidation,
    idParamValidation,
    
    // Helper Functions
    isValidGermanIBAN,
    isValidBIC,
    isValidUStIdNr,
    isValidGermanPLZ,
    isValidSteuernummer,
    handleValidationErrors
};

