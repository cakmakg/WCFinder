/**
 * Booking Helper Functions
 * 
 * Utility functions for booking-related operations
 * Includes security measures (XSS prevention, URL sanitization)
 * 
 * Clean Code Principles:
 * - Single Responsibility: Each function does one thing
 * - KISS: Simple, straightforward implementations
 */
import { sanitizeString } from './validation';
import logger from './logger';

/**
 * Downloads QR code as PNG image
 * @param {string} accessCode - Access code to include in filename
 * @throws {Error} - If QR code element not found or download fails
 */
export const downloadQRCode = (accessCode) => {
  // Input validation
  if (!accessCode || typeof accessCode !== 'string') {
    logger.warn('downloadQRCode: Invalid access code', { accessCode });
    return;
  }

  // Sanitize access code for filename (prevent path traversal)
  const sanitizedCode = sanitizeString(accessCode).replace(/[^a-zA-Z0-9]/g, '');
  
  const svg = document.getElementById('qr-code-svg-detail');
  if (!svg) {
    logger.warn('downloadQRCode: QR code SVG element not found');
    return;
  }
  
  try {
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL('image/png');
        
        const downloadLink = document.createElement('a');
        // Sanitize filename to prevent XSS
        downloadLink.download = `QR-Code-${sanitizedCode}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        
        logger.info('QR code downloaded', { accessCode: sanitizedCode });
      } catch (error) {
        logger.error('Failed to create download link', error);
      }
    };
    
    img.onerror = () => {
      logger.error('Failed to load QR code image');
    };
    
    // Use data URI with base64 encoding (safe)
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  } catch (error) {
    logger.error('Failed to download QR code', error, { accessCode });
  }
};

/**
 * Opens Google Maps with booking location
 * @param {object} booking - Booking object with business location
 */
export const openMaps = (booking) => {
  // Input validation
  if (!booking || !booking.businessId) {
    logger.warn('openMaps: Invalid booking data', { booking });
    return;
  }

  const address = booking.businessId?.address || {};
  const coords = booking.businessId?.location?.coordinates;
  let url = '';
  
  // Prefer coordinates if available (more accurate)
  if (Array.isArray(coords) && coords.length === 2) {
    const lat = Number(coords[1]);
    const lng = Number(coords[0]);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      logger.warn('openMaps: Invalid coordinates', { lat, lng });
      // Fall through to address-based URL
    } else {
      // Sanitize coordinates in URL
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    }
  }
  
  // Fallback to address if coordinates not available or invalid
  if (!url) {
    const addressParts = [
      address.street,
      address.postalCode,
      address.city,
      address.country
    ].filter(Boolean).map(part => sanitizeString(part));
    
    if (addressParts.length === 0) {
      logger.warn('openMaps: No valid location data', { booking });
      return;
    }
    
    const addressLine = addressParts.join(' ');
    url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine)}`;
  }
  
  // Open in new tab with security attributes
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
    logger.info('Maps opened', { url: url.substring(0, 100) }); // Log truncated URL
  } catch (error) {
    logger.error('Failed to open maps', error, { url: url.substring(0, 100) });
  }
};

