// routes/seo.js
// SEO endpoints: sitemap.xml, robots.txt

"use strict";
const router = require('express').Router();
const Business = require('../models/business');

/**
 * Generate sitemap.xml
 * Tüm business'ları ve önemli sayfaları içerir
 */
router.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || req.protocol + '://' + req.get('host');
        
        // Tüm approved business'ları getir
        const businesses = await Business.find({ 
            approvalStatus: 'approved' 
        }).select('_id updatedAt').lean();

        // Sitemap XML oluştur
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Ana sayfa
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>1.0</priority>\n';
        xml += '  </url>\n';

        // Home sayfası
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}/home</loc>\n`;
        xml += '    <changefreq>daily</changefreq>\n';
        xml += '    <priority>0.9</priority>\n';
        xml += '  </url>\n';

        // Her business için URL
        businesses.forEach(business => {
            const lastmod = business.updatedAt ? new Date(business.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            xml += '  <url>\n';
            xml += `    <loc>${baseUrl}/business/${business._id}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

/**
 * Generate robots.txt
 */
router.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.FRONTEND_URL || req.protocol + '://' + req.get('host');
    
    let robots = 'User-agent: *\n';
    robots += 'Allow: /\n';
    robots += 'Disallow: /api/\n';
    robots += 'Disallow: /admin\n';
    robots += 'Disallow: /my-bookings\n';
    robots += 'Disallow: /payment\n';
    robots += 'Disallow: /login\n';
    robots += 'Disallow: /register\n';
    robots += '\n';
    robots += `Sitemap: ${baseUrl}/sitemap.xml\n`;

    res.set('Content-Type', 'text/plain');
    res.send(robots);
});

module.exports = router;

