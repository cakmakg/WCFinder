"use strict";
/* -------------------------------------------------------
    Storage-Abstraktion für Rechnungsdateien (PDF, XRechnung XML)

    Treiber via STORAGE_DRIVER:
      - 'local' (Default) → Dateisystem unter public/
      - 's3'              → Cloudflare R2 / S3 (@aws-sdk/client-s3);
                            Env-Konfiguration siehe s3Driver.js

    Hintergrund: GoBD verlangt die dauerhafte, unveränderbare Aufbewahrung
    von Rechnungen (~10 Jahre). Ephemerer Container-Speicher (z. B. Render)
    verliert Dateien beim Neustart → in Produktion muss ein Object-Storage
    (R2/S3) genutzt werden.

    Einheitliche, treiber-unabhängige API (alle async):
      putObject(ref, buffer, contentType)  → schreibt Bytes unter logischer Referenz
      objectExists(ref)                    → boolean
      getReadStream(ref)                   → Node Readable
      deleteObject(ref)                    → idempotent
    Die Referenz (ref) ist der bisherige Pfad-String, z. B. '/rechnungen/RE-1.pdf',
    damit bestehende DB-Einträge (pdfPfad, xrechnungPfad) unverändert gültig bleiben.
------------------------------------------------------- */

const driverName = (process.env.STORAGE_DRIVER || 'local').toLowerCase();

switch (driverName) {
    case 's3':
        module.exports = require('./s3Driver');
        break;
    case 'local':
        module.exports = require('./localDriver');
        break;
    default:
        // Bewusst harter Fehler statt stillem Fallback: eine falsch geschriebene
        // Treiber-Angabe darf Rechnungen nicht unbemerkt auf ephemeren Speicher schreiben.
        throw new Error(
            `Unbekannter STORAGE_DRIVER="${driverName}". Erlaubt: 'local' oder 's3'.`
        );
}
