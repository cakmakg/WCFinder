"use strict";
/* Storage-Adapter Tests: Local-Driver (Dateisystem), Dispatcher (index)
   und S3/R2-Driver (mit gemocktem @aws-sdk/client-s3). */

const fs = require('fs');
const path = require('path');

// @aws-sdk/client-s3 global mocken – kein Netzwerk, Kommandos werden inspizierbar.
const mockSend = jest.fn();
jest.mock('@aws-sdk/client-s3', () => {
    const makeCommand = (typ) =>
        class {
            constructor(input) {
                this.typ = typ;
                this.input = input;
            }
        };
    return {
        S3Client: jest.fn(() => ({ send: mockSend })),
        PutObjectCommand: makeCommand('Put'),
        HeadObjectCommand: makeCommand('Head'),
        GetObjectCommand: makeCommand('Get'),
        DeleteObjectCommand: makeCommand('Delete'),
    };
});

const streamToString = async (stream) => {
    let data = '';
    for await (const chunk of stream) data += chunk;
    return data;
};

describe('storage/localDriver', () => {
    const localDriver = require('../services/storage/localDriver');
    const ref = '/rechnungen/__storagetest__.bin';
    const diskPath = path.resolve(__dirname, '../../public', 'rechnungen/__storagetest__.bin');

    afterAll(() => {
        try { fs.rmSync(diskPath, { force: true }); } catch { /* ignore */ }
    });

    it('putObject → objectExists → getReadStream → deleteObject round trip', async () => {
        expect(await localDriver.objectExists(ref)).toBe(false);

        await localDriver.putObject(ref, Buffer.from('hallo welt'), 'application/octet-stream');
        expect(await localDriver.objectExists(ref)).toBe(true);

        const content = await streamToString(await localDriver.getReadStream(ref));
        expect(content).toBe('hallo welt');

        await localDriver.deleteObject(ref);
        expect(await localDriver.objectExists(ref)).toBe(false);
    });

    it('deleteObject ist idempotent (kein Fehler bei fehlender Datei)', async () => {
        await expect(localDriver.deleteObject(ref)).resolves.toBeUndefined();
    });

    it('blockiert Path-Traversal bei write/read/delete', async () => {
        await expect(localDriver.putObject('/../../evil.txt', Buffer.from('x')))
            .rejects.toThrow(/Ungültige Speicher-Referenz/);
        await expect(localDriver.getReadStream('/../../evil.txt'))
            .rejects.toThrow(/Ungültige Speicher-Referenz/);
        await expect(localDriver.deleteObject('/../../evil.txt'))
            .rejects.toThrow(/Ungültige Speicher-Referenz/);
    });
});

describe('storage/index (Dispatcher)', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        mockSend.mockReset();
        process.env = { ...OLD_ENV };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('nutzt standardmäßig den Local-Driver', () => {
        delete process.env.STORAGE_DRIVER;
        const storage = require('../services/storage');
        expect(storage).toBe(require('../services/storage/localDriver'));
    });

    it('routet bei STORAGE_DRIVER=s3 auf den S3-Driver', () => {
        process.env.STORAGE_DRIVER = 's3';
        process.env.S3_BUCKET = 'test-bucket';
        process.env.S3_ACCESS_KEY_ID = 'key';
        process.env.S3_SECRET_ACCESS_KEY = 'secret';
        const storage = require('../services/storage');
        expect(typeof storage.putObject).toBe('function');
        expect(storage).toBe(require('../services/storage/s3Driver'));
    });

    it('wirft bei unbekanntem Treiber', () => {
        process.env.STORAGE_DRIVER = 'foo';
        expect(() => require('../services/storage')).toThrow(/Unbekannter STORAGE_DRIVER/);
    });
});

describe('storage/s3Driver', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        jest.resetModules();
        mockSend.mockReset();
        process.env = {
            ...OLD_ENV,
            S3_BUCKET: 'test-bucket',
            S3_ACCESS_KEY_ID: 'key',
            S3_SECRET_ACCESS_KEY: 'secret',
            S3_ENDPOINT: 'https://acc.r2.cloudflarestorage.com',
        };
    });

    afterAll(() => {
        process.env = OLD_ENV;
    });

    it('wirft beim Laden, wenn Pflicht-Env fehlt', () => {
        delete process.env.S3_BUCKET;
        expect(() => require('../services/storage/s3Driver')).toThrow(/S3_BUCKET/);
    });

    it('putObject mappt Referenz auf Key ohne führenden Slash', async () => {
        mockSend.mockResolvedValue({});
        const driver = require('../services/storage/s3Driver');
        await driver.putObject('/rechnungen/RE-1.pdf', Buffer.from('x'), 'application/pdf');

        const command = mockSend.mock.calls[0][0];
        expect(command.typ).toBe('Put');
        expect(command.input.Bucket).toBe('test-bucket');
        expect(command.input.Key).toBe('rechnungen/RE-1.pdf');
        expect(command.input.ContentType).toBe('application/pdf');
    });

    it('objectExists: true bei Erfolg, false bei 404, rethrow sonst', async () => {
        const driver = require('../services/storage/s3Driver');

        mockSend.mockResolvedValueOnce({});
        expect(await driver.objectExists('/x.pdf')).toBe(true);

        mockSend.mockRejectedValueOnce({ $metadata: { httpStatusCode: 404 } });
        expect(await driver.objectExists('/fehlt.pdf')).toBe(false);

        mockSend.mockRejectedValueOnce({ name: 'NoSuchKey' });
        expect(await driver.objectExists('/fehlt2.pdf')).toBe(false);

        mockSend.mockRejectedValueOnce({ $metadata: { httpStatusCode: 500 }, name: 'InternalError' });
        await expect(driver.objectExists('/x.pdf')).rejects.toBeDefined();
    });

    it('deleteObject sendet DeleteObjectCommand mit korrektem Key', async () => {
        mockSend.mockResolvedValue({});
        const driver = require('../services/storage/s3Driver');
        await driver.deleteObject('/rechnungen/xrechnung/RE-1_xrechnung.xml');

        const command = mockSend.mock.calls[0][0];
        expect(command.typ).toBe('Delete');
        expect(command.input.Key).toBe('rechnungen/xrechnung/RE-1_xrechnung.xml');
    });
});
