"use strict";
/**
 * GDPR / DSGVO Service
 *
 * Setzt die Betroffenenrechte um:
 * - Art. 15 DSGVO (Auskunftsrecht): vollständiger Export der personenbezogenen
 *   Daten eines Nutzers als strukturiertes Objekt (exportUserData).
 * - Art. 17 DSGVO (Recht auf Löschung): Löschung bzw. Anonymisierung der
 *   personenbezogenen Daten (eraseUserData).
 *
 * WICHTIG: Rechnungen und Zahlungen unterliegen der gesetzlichen
 * Aufbewahrungspflicht (§147 AO, GoBD: 10 Jahre). Diese Datensätze werden
 * daher NICHT gelöscht, sondern von direkten personenbezogenen Merkmalen
 * (IP-Adresse, User-Agent, Roh-Gateway-Antwort) bereinigt und über das
 * anonymisierte Konto weiterhin buchhalterisch referenzierbar gehalten.
 * Diese Ausnahme ist durch Art. 17 Abs. 3 lit. b DSGVO gedeckt.
 */

const crypto = require("crypto");

const User = require("../models/user");
const Business = require("../models/business");
const Usage = require("../models/usage");
const Payment = require("../models/payment");
const Review = require("../models/review");
const Rechnung = require("../models/rechnung");
const Token = require("../models/token");
const PasswordReset = require("../models/passwordReset");
const passwordEncrypt = require("../helper/passwordEncrypt");
const { NotFoundError } = require("../middleware/errorHnadler");
const logger = require("../utils/logger");

/**
 * Alle personenbezogenen Daten eines Nutzers für den DSGVO-Auskunftsexport
 * sammeln (Art. 15). Passwort und rohe Gateway-Antworten werden nie exportiert.
 *
 * @param {string} userId
 * @returns {Promise<object>} strukturiertes Export-Objekt
 */
async function exportUserData(userId) {
    const user = await User.findById(userId).select("-password").lean();

    if (!user || user.isDeleted) {
        throw new NotFoundError("User");
    }

    const [unternehmen, buchungen, zahlungen, bewertungen, rechnungen] = await Promise.all([
        Business.find({ owner: userId }).lean(),
        Usage.find({ userId }).lean(),
        // gatewayResponse enthält rohe Provider-Payloads -> nicht exportieren
        Payment.find({ userId }).select("-gatewayResponse").lean(),
        Review.find({ userId }).lean(),
        // Rechnungen, die dieser Nutzer erstellt hat (i. d. R. nur Admin/Owner)
        Rechnung.find({ "erstelltVon.benutzerId": userId }).lean(),
    ]);

    return {
        meta: {
            exportiertAm: new Date().toISOString(),
            userId: String(userId),
            format: "json",
            hinweis:
                "Datenexport gemäß Art. 15 DSGVO. Enthält die zu Ihrer Person " +
                "gespeicherten Daten bei WCFinder.",
        },
        konto: user,
        unternehmen,
        buchungen,
        zahlungen,
        bewertungen,
        rechnungen,
    };
}

/**
 * Personenbezogene Daten eines Nutzers löschen bzw. anonymisieren (Art. 17).
 *
 * Ablauf:
 *  1. Session-/Sicherheitsdaten (Token, Passwort-Reset) hart löschen.
 *  2. Bewertungen löschen und betroffene Toilet-Durchschnitte neu berechnen.
 *  3. Zahlungen aufbewahren, aber direkte personenbezogene Merkmale entfernen.
 *  4. Konto anonymisieren (Login wird dadurch dauerhaft gesperrt).
 *
 * Unternehmen (Business) werden bewusst nicht automatisch verändert, da eine
 * Owner-Abmeldung buchhalterische Folgen (Auszahlungen) hat und über einen
 * separaten Admin-Prozess erfolgen sollte.
 *
 * @param {string} userId
 * @param {{ actorId?: string }} [options]
 * @returns {Promise<object>} Zusammenfassung der durchgeführten Aktionen
 */
async function eraseUserData(userId, { actorId } = {}) {
    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
        throw new NotFoundError("User");
    }

    // 1) Session-/Sicherheitsdaten hart löschen
    const [tokenResult, resetResult] = await Promise.all([
        Token.deleteMany({ userId }),
        PasswordReset.deleteMany({ userId }),
    ]);

    // 2) Bewertungen löschen; betroffene Toiletten-Durchschnitte neu berechnen
    const betroffeneToiletten = await Review.find({ userId }).distinct("toiletId");
    const reviewResult = await Review.deleteMany({ userId });
    for (const toiletId of betroffeneToiletten) {
        try {
            await Review.calculateAverageRatings(toiletId);
        } catch (err) {
            // Neuberechnung darf die Löschung nicht blockieren
            logger.warn("GDPR erasure: rating recalculation failed", {
                toiletId: String(toiletId),
                error: err.message,
            });
        }
    }

    // 3) Zahlungen aufbewahren (§147 AO), aber personenbezogene Merkmale entfernen
    const paymentResult = await Payment.updateMany(
        { userId },
        { $unset: { ipAddress: "", userAgent: "", gatewayResponse: "" } }
    );

    // Zählwerte für aufbewahrte Datensätze (Transparenz in der Antwort)
    const [zahlungenGesamt, buchungenGesamt, unternehmenGesamt] = await Promise.all([
        Payment.countDocuments({ userId }),
        Usage.countDocuments({ userId }),
        Business.countDocuments({ owner: userId }),
    ]);

    // 4) Konto anonymisieren -> Login dauerhaft gesperrt, PII entfernt
    const anonId = crypto.randomBytes(6).toString("hex");
    const anonymizedAt = new Date();

    user.username = `geloescht_${anonId}`;
    user.email = `geloescht_${anonId}@geloescht.wcfinder.invalid`;
    user.firstName = undefined;
    user.lastName = undefined;
    // Zufälliges, nicht ableitbares Passwort -> kein Login mehr möglich
    user.password = passwordEncrypt(crypto.randomBytes(32).toString("hex"));
    user.isActive = false;
    user.isDeleted = true;
    user.deletedAt = anonymizedAt;

    await user.save();

    const summary = {
        userId: String(userId),
        anonymisiertAm: anonymizedAt.toISOString(),
        actorId: actorId ? String(actorId) : String(userId),
        geloescht: {
            tokens: tokenResult.deletedCount || 0,
            passwortResets: resetResult.deletedCount || 0,
            bewertungen: reviewResult.deletedCount || 0,
        },
        anonymisiert: {
            konto: 1,
            zahlungenPiiBereinigt: paymentResult.modifiedCount || 0,
        },
        // Aus gesetzlichen Gründen aufbewahrt (anonymisiert referenziert)
        aufbewahrt: {
            zahlungen: zahlungenGesamt,
            buchungen: buchungenGesamt,
            unternehmen: unternehmenGesamt,
        },
    };

    return summary;
}

module.exports = {
    exportUserData,
    eraseUserData,
};
