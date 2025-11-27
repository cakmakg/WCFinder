"use strict"
/**
 * Email Service Helper
 * 
 * Nodemailer ile email gönderme servisi.
 * Environment variables kullanarak güvenli credential yönetimi.
 * 
 * Clean Code Principles:
 * - Security: Credentials environment variables'da
 * - DRY: Email logic tek bir yerde
 * - Error Handling: Proper error handling
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

/**
 * Email gönder
 * 
 * @param {String} to - Alıcı email adresi
 * @param {String} subject - Email konusu
 * @param {String} message - Email içeriği (HTML veya text)
 * @returns {Promise<Boolean>} Gönderim başarılı mı?
 */
module.exports = async function (to, subject, message) {
    // Environment variables kontrolü
    if (!process.env.EMAIL_SERVICE || !process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        logger.warn('Email configuration missing, skipping email send', { to, subject });
        return false;
    }

    // Email validation
    if (!to || !subject || !message) {
        logger.warn('Invalid email parameters', { to, subject, hasMessage: !!message });
        return false;
    }

    try {
        // Email transporter oluştur
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            }
        });

        // Email gönder
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: message,
            html: message,
        });

        logger.info('Email sent successfully', { 
            to, 
            subject, 
            messageId: info.messageId 
        });

        return true;
    } catch (error) {
        logger.error('Email send failed', error, { to, subject });
        return false;
    }
}