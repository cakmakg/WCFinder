"use strict";
/**
 * GDPR / DSGVO Controller
 *
 * Betroffenenrechte für das eigene Konto:
 * - GET  /users/me/export : Datenauskunft (Art. 15 DSGVO) als JSON-Download
 * - DELETE /users/me      : Löschung/Anonymisierung (Art. 17 DSGVO)
 *
 * Beide Endpunkte wirken ausschließlich auf das angemeldete Konto
 * (Absicherung über isLogin-Middleware + req.user).
 */

const gdprService = require("../services/gdprService");
const logger = require("../utils/logger");
const { AuthenticationError } = require("../middleware/errorHnadler");

module.exports = {
    /**
     * GET: Personenbezogene Daten des angemeldeten Nutzers exportieren.
     * Antwort wird als JSON-Datei zum Download ausgeliefert.
     */
    exportMe: async (req, res) => {
        if (!req.user || !req.user._id) {
            throw new AuthenticationError("Authentication required");
        }

        const userId = req.user._id.toString();
        const data = await gdprService.exportUserData(userId);

        logger.info("GDPR data export requested", { userId });

        const filename = `wcfinder-datenexport-${userId}.json`;
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.status(200).send(JSON.stringify({ error: false, ...data }, null, 2));
    },

    /**
     * DELETE: Konto und personenbezogene Daten des angemeldeten Nutzers
     * löschen bzw. anonymisieren. Aufbewahrungspflichtige Datensätze
     * (Rechnungen/Zahlungen) bleiben anonymisiert erhalten.
     */
    deleteMe: async (req, res) => {
        if (!req.user || !req.user._id) {
            throw new AuthenticationError("Authentication required");
        }

        const userId = req.user._id.toString();

        logger.info("GDPR erasure requested", {
            userId,
            username: req.user.username,
            role: req.user.role,
        });

        const result = await gdprService.eraseUserData(userId, { actorId: userId });

        logger.info("GDPR erasure completed", { userId, result });

        res.status(200).send({
            error: false,
            message:
                "Ihr Konto und Ihre personenbezogenen Daten wurden gelöscht bzw. " +
                "anonymisiert. Gesetzlich aufbewahrungspflichtige Belege bleiben " +
                "anonymisiert erhalten.",
            result,
        });
    },
};
