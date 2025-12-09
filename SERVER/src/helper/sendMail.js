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
    console.log('📧 [sendMail] Called with:', { to, subject: subject.substring(0, 50) + '...' });
    
    // Environment variables kontrolü
    // EMAIL_SERVICE veya (EMAIL_HOST + EMAIL_PORT) gerekli
    const hasServiceConfig = !!process.env.EMAIL_SERVICE;
    const hasHostConfig = !!process.env.EMAIL_HOST && !!process.env.EMAIL_PORT;
    const hasAuth = !!process.env.EMAIL_USER && (!!process.env.EMAIL_PASSWORD || !!process.env.EMAIL_PASS);
    
    console.log('📧 [sendMail] Config check:', {
        hasServiceConfig,
        hasHostConfig,
        hasAuth,
        EMAIL_HOST: process.env.EMAIL_HOST || 'NOT SET',
        EMAIL_PORT: process.env.EMAIL_PORT || 'NOT SET',
        EMAIL_USER: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.substring(0, 10)}...` : 'NOT SET',
        hasEmailPassword: !!process.env.EMAIL_PASSWORD,
        hasEmailPass: !!process.env.EMAIL_PASS
    });
    
    if (!((hasServiceConfig || hasHostConfig) && hasAuth)) {
        logger.warn('Email configuration missing, skipping email send', { 
            to, 
            subject,
            hasEmailService: !!process.env.EMAIL_SERVICE,
            hasEmailHost: !!process.env.EMAIL_HOST,
            hasEmailPort: !!process.env.EMAIL_PORT,
            hasEmailUser: !!process.env.EMAIL_USER,
            hasEmailPassword: !!process.env.EMAIL_PASSWORD,
            hasEmailPass: !!process.env.EMAIL_PASS
        });
        console.error('❌ EMAIL CONFIGURATION MISSING!');
        console.error('   Required environment variables:');
        console.error('   Option 1 (Service-based):');
        console.error('     - EMAIL_SERVICE (e.g., "gmail", "outlook")');
        console.error('     - EMAIL_USER (your email address)');
        console.error('     - EMAIL_PASSWORD or EMAIL_PASS (your email password or app password)');
        console.error('   Option 2 (Host-based):');
        console.error('     - EMAIL_HOST (e.g., "smtp.gmail.com")');
        console.error('     - EMAIL_PORT (e.g., 587 for TLS, 465 for SSL)');
        console.error('     - EMAIL_USER (your email address)');
        console.error('     - EMAIL_PASSWORD or EMAIL_PASS (your email password or app password)');
        return false;
    }

    // Email validation
    if (!to || !subject || !message) {
        logger.warn('Invalid email parameters', { 
            to, 
            subject, 
            hasMessage: !!message,
            toType: typeof to,
            subjectType: typeof subject
        });
        return false;
    }

    try {
        // Email transporter oluştur
        let transporterConfig;
        
        if (hasServiceConfig) {
            // Service-based configuration (Gmail, Outlook, etc.)
            transporterConfig = {
                service: process.env.EMAIL_SERVICE,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
                }
            };
            console.log('📧 [sendMail] Using SERVICE-based config:', { service: process.env.EMAIL_SERVICE, user: process.env.EMAIL_USER });
        } else {
            // Host-based configuration (custom SMTP)
            transporterConfig = {
                host: process.env.EMAIL_HOST,
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: parseInt(process.env.EMAIL_PORT) === 465, // 465 için SSL, diğerleri için TLS
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
                }
            };
            console.log('📧 [sendMail] Using SMTP config:', { 
                host: process.env.EMAIL_HOST, 
                port: parseInt(process.env.EMAIL_PORT) || 587,
                secure: parseInt(process.env.EMAIL_PORT) === 465,
                user: process.env.EMAIL_USER 
            });
        }
        
        console.log('📧 [sendMail] Creating transporter...');
        const transporter = nodemailer.createTransport(transporterConfig);

        // Email gönder
        console.log('📧 [sendMail] Sending email to:', to);
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: message.replace(/<[^>]*>/g, ''), // HTML'den text çıkar
            html: message,
        });

        logger.info('Email sent successfully', { 
            to, 
            subject, 
            messageId: info.messageId,
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER
        });
        
        console.log('✅ [sendMail] Email sent successfully to:', to);
        console.log('✅ [sendMail] Message ID:', info.messageId);

        return true;
    } catch (error) {
        logger.error('Email send failed', error, { 
            to, 
            subject,
            errorCode: error.code,
            errorMessage: error.message,
            errorResponse: error.response
        });
        console.error('❌ [sendMail] Email send failed:', error.message);
        console.error('❌ [sendMail] Error code:', error.code);
        console.error('❌ [sendMail] Error stack:', error.stack);
        if (error.code === 'EAUTH') {
            console.error('   🔐 Authentication failed - check EMAIL_USER and EMAIL_PASSWORD/EMAIL_PASS');
        } else if (error.code === 'ECONNECTION') {
            console.error('   🔌 Connection failed - check EMAIL_HOST and EMAIL_PORT');
        } else if (error.code === 'ETIMEDOUT') {
            console.error('   ⏱️ Connection timeout - check EMAIL_HOST and network');
        }
        return false;
    }
}