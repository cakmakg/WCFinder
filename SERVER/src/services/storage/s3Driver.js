"use strict";
/* -------------------------------------------------------
    Storage – S3 / Cloudflare R2 Driver

    S3-kompatibler Object-Storage. Standard-Ziel: Cloudflare R2
    (egress-frei), funktioniert aber genauso mit AWS S3, MinIO u. a.

    Warum Object-Storage: GoBD verlangt die dauerhafte, unveränderbare
    Aufbewahrung von Rechnungen (~10 Jahre). Ephemerer Container-Speicher
    (Render/Railway) verliert Dateien beim Neustart. Für echte
    Unveränderbarkeit sollte am Bucket zusätzlich Versionierung bzw.
    Object-Lock/Retention aktiviert werden (Infrastruktur, nicht Code).

    Erwartete Env-Variablen (nur wenn STORAGE_DRIVER=s3):
      S3_BUCKET             (Pflicht)  Bucket-Name
      S3_ACCESS_KEY_ID      (Pflicht)  Access Key
      S3_SECRET_ACCESS_KEY  (Pflicht)  Secret Key
      S3_ENDPOINT           (R2 Pflicht) z. B. https://<accountid>.r2.cloudflarestorage.com
                                         (AWS S3: leer lassen → Default-Endpoint)
      S3_REGION             (optional) Default 'auto' (R2); AWS: z. B. 'eu-central-1'
      S3_FORCE_PATH_STYLE   (optional) 'false' um Virtual-Hosted-Style zu erzwingen;
                                       Default path-style (kompatibler, R2-tauglich)
------------------------------------------------------- */

const {
    S3Client,
    PutObjectCommand,
    HeadObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} = require('@aws-sdk/client-s3');

const REQUIRED = ['S3_BUCKET', 'S3_ACCESS_KEY_ID', 'S3_SECRET_ACCESS_KEY'];
const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
    throw new Error(
        `STORAGE_DRIVER=s3 gesetzt, aber folgende Env-Variablen fehlen: ${missing.join(', ')}. ` +
        `Siehe docs/DEPLOYMENT.md §6.1 (Storage / R2).`
    );
}

const BUCKET = process.env.S3_BUCKET;

const client = new S3Client({
    region: process.env.S3_REGION || 'auto',
    endpoint: process.env.S3_ENDPOINT || undefined,
    // path-style ist bei R2 und selbst gehosteten S3-Kompatiblen am robustesten
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE
        ? process.env.S3_FORCE_PATH_STYLE.toLowerCase() === 'true'
        : true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});

// Logische Referenz ('/rechnungen/RE-1.pdf') → Objekt-Key ('rechnungen/RE-1.pdf').
// Keys haben keinen führenden Slash; bestehende DB-Pfade bleiben unverändert gültig.
const toKey = (ref) => String(ref).replace(/^\/+/, '');

const isNotFound = (error) =>
    error?.$metadata?.httpStatusCode === 404 ||
    error?.name === 'NotFound' ||
    error?.name === 'NoSuchKey';

module.exports = {
    async putObject(ref, buffer, contentType) {
        await client.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: toKey(ref),
            Body: buffer,
            ContentType: contentType,
        }));
    },

    async objectExists(ref) {
        try {
            await client.send(new HeadObjectCommand({ Bucket: BUCKET, Key: toKey(ref) }));
            return true;
        } catch (error) {
            if (isNotFound(error)) return false;
            throw error;
        }
    },

    async getReadStream(ref) {
        const result = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: toKey(ref) }));
        // Im Node-Runtime ist Body ein Readable (IncomingMessage) – .on('error')/.pipe() kompatibel.
        return result.Body;
    },

    async deleteObject(ref) {
        // S3/R2 DeleteObject ist idempotent (kein Fehler bei fehlendem Key).
        await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: toKey(ref) }));
    },
};
