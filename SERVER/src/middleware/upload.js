"use strict"
/* -------------------------------------------------------
                Event Project
------------------------------------------------------- */
// app.use(upload.array('fieldName'))

const multer = require('multer');
const path = require('path');

//Mevcut proje yapınıza uygun entegre edilmiş versiyon
module.exports = multer({
    storage: multer.diskStorage({
        destination: './upload/', // Mevcut projenizin dizin yapısını koruyor
        filename: function (req, file, cb) {
            // Benzersiz dosya adı oluşturma (yeni özellik)
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit (yeni özellik)
    },
    fileFilter: function (req, file, cb) {
        // Dosya tipi kontrolü (yeni özellik)
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed! (jpeg, jpg, png, gif)'), false);
        }
    }
});