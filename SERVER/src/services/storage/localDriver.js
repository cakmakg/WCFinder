"use strict";
/* -------------------------------------------------------
    Storage – Local Driver (Dateisystem)
    Schreibt/liest Dateien unter public/. Standard-Treiber.
    Verhalten identisch zum bisherigen direkten Disk-Zugriff.
------------------------------------------------------- */

const fs = require('fs');
const path = require('path');

// public/ Wurzel (…/SERVER/public)
const PUBLIC_DIR = path.resolve(__dirname, '../../../public');

// Logische Referenz (z. B. '/rechnungen/RE-2026-001.pdf') → absoluter Disk-Pfad.
// Schutz gegen Path-Traversal: Referenzen müssen innerhalb von public/ bleiben.
const toDiskPath = (ref) => {
    const clean = String(ref).replace(/^\/+/, '');
    const resolved = path.resolve(PUBLIC_DIR, clean);
    if (resolved !== PUBLIC_DIR && !resolved.startsWith(PUBLIC_DIR + path.sep)) {
        throw new Error('Ungültige Speicher-Referenz');
    }
    return resolved;
};

module.exports = {
    async putObject(ref, buffer /*, contentType */) {
        const diskPath = toDiskPath(ref);
        await fs.promises.mkdir(path.dirname(diskPath), { recursive: true });
        await fs.promises.writeFile(diskPath, buffer);
    },

    async objectExists(ref) {
        try {
            await fs.promises.access(toDiskPath(ref));
            return true;
        } catch {
            return false;
        }
    },

    async getReadStream(ref) {
        return fs.createReadStream(toDiskPath(ref));
    },

    async deleteObject(ref) {
        await fs.promises.rm(toDiskPath(ref), { force: true });
    },
};
