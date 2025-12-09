"use strict";
/**
 * Business Email Service
 * 
 * Business ile ilgili email gönderme logic'i.
 * 
 * Clean Code Principles:
 * - DRY: Email template'leri tek yerde
 * - Single Responsibility: Sadece email gönderme
 * - Separation of Concerns: Email logic controller'dan ayrı
 */

const User = require("../models/user");
const sendMail = require("../helper/sendMail");
const logger = require("../utils/logger");

/**
 * Partner registration için admin'lere bildirim email gönder
 * 
 * @param {Object} ownerUser - Owner user model
 * @param {Object} business - Business model
 * @param {Object} ownerData - Original owner data (firstName, lastName)
 */
async function sendPartnerRegistrationNotification(ownerUser, business, ownerData) {
    try {
        const admins = await User.find({ role: 'admin', isActive: true }).select('email');
        
        if (admins.length === 0) {
            logger.warn('No active admin users found for partner registration notification', {
                businessId: business._id
            });
            return;
        }

        const emailSubject = 'WCFinder - Neue Partneranfrage';
        const emailMessage = `
            <h2>Neue Partneranfrage</h2>
            <p>Eine neue Partneranfrage wurde eingereicht und wartet auf Ihre Überprüfung.</p>
            
            <h3>Owner Informationen:</h3>
            <ul>
                <li><strong>Name:</strong> ${ownerData.firstName} ${ownerData.lastName}</li>
                <li><strong>Benutzername:</strong> ${ownerUser.username}</li>
                <li><strong>E-Mail:</strong> ${ownerUser.email}</li>
            </ul>
            
            <h3>Geschäftsinformationen:</h3>
            <ul>
                <li><strong>Geschäftsname:</strong> ${business.businessName}</li>
                <li><strong>Geschäftstyp:</strong> ${business.businessType}</li>
                <li><strong>Adresse:</strong> ${business.address.street}, ${business.address.postalCode} ${business.address.city}, ${business.address.country}</li>
                ${business.phone ? `<li><strong>Telefon:</strong> ${business.phone}</li>` : ''}
                ${business.ustIdNr ? `<li><strong>USt-IdNr:</strong> ${business.ustIdNr}</li>` : ''}
            </ul>
            
            <p><strong>Status:</strong> Pending (Wartet auf Überprüfung)</p>
            
            <p>Bitte überprüfen Sie die Anfrage im Admin-Panel und genehmigen oder lehnen Sie sie ab.</p>
            
            <br>
            <p>Mit freundlichen Grüßen,<br>WCFinder System</p>
        `;

        // Tüm admin'lere email gönder
        for (const admin of admins) {
            await sendMail(admin.email, emailSubject, emailMessage);
        }

        logger.info('Partner registration notification sent to admins', { 
            adminCount: admins.length,
            businessId: business._id 
        });
    } catch (error) {
        logger.error('Failed to send partner registration notification email', error, {
            businessId: business._id,
            errorMessage: error.message
        });
    }
}

/**
 * Business onay/red için owner'a email gönder
 * 
 * @param {Object} business - Business model (populated with owner)
 * @param {String} action - 'approve' veya 'reject'
 */
async function sendBusinessApprovalEmail(business, action) {
    try {
        if (!business.owner || !business.owner.email) {
            return;
        }

        const emailSubject = action === 'approve' 
            ? 'WCFinder - Ihre Partneranfrage wurde genehmigt'
            : 'WCFinder - Ihre Partneranfrage wurde abgelehnt';
        
        const emailMessage = action === 'approve' 
            ? `
                <h2>Ihre Partneranfrage wurde genehmigt!</h2>
                <p>Hallo ${business.owner.firstName || business.owner.username},</p>
                <p>Wir freuen uns, Ihnen mitteilen zu können, dass Ihre Partneranfrage für <strong>${business.businessName}</strong> genehmigt wurde.</p>
                <p>Sie können sich jetzt mit Ihrem Konto anmelden und Ihre Geschäftsinformationen verwalten.</p>
                <p>Ihr Konto wurde aktiviert und Sie können nun:</p>
                <ul>
                    <li>Sich mit Ihrem Benutzernamen und Passwort anmelden</li>
                    <li>Ihre Geschäftsinformationen verwalten</li>
                    <li>Toiletten zu Ihrem Geschäft hinzufügen</li>
                </ul>
                <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
                <br>
                <p>Mit freundlichen Grüßen,<br>Das WCFinder Team</p>
            `
            : `
                <h2>Ihre Partneranfrage wurde abgelehnt</h2>
                <p>Hallo ${business.owner.firstName || business.owner.username},</p>
                <p>Leider müssen wir Ihnen mitteilen, dass Ihre Partneranfrage für <strong>${business.businessName}</strong> nicht genehmigt werden konnte.</p>
                <p>Falls Sie Fragen haben oder weitere Informationen benötigen, kontaktieren Sie uns bitte.</p>
                <br>
                <p>Mit freundlichen Grüßen,<br>Das WCFinder Team</p>
            `;

        await sendMail(business.owner.email, emailSubject, emailMessage);

        logger.info('Business approval/rejection email sent to owner', {
            businessId: business._id,
            ownerEmail: business.owner.email,
            action
        });
    } catch (error) {
        logger.error('Failed to send business approval/rejection email', error, {
            businessId: business._id,
            action
        });
    }
}

module.exports = {
    sendPartnerRegistrationNotification,
    sendBusinessApprovalEmail
};

