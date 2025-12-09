/**
 * XSS Protection Utilities
 * 
 * Provides client-side XSS protection for user-generated content.
 * React automatically escapes content, but this provides additional safety
 * for cases where HTML content might be rendered.
 * 
 * Clean Code Principles:
 * - Single Responsibility: Only handles XSS protection
 * - DRY: Centralized XSS protection logic
 * - Security: Multiple layers of protection
 * 
 * Note: React's JSX automatically escapes content, but this utility provides
 * additional protection for edge cases and explicit HTML rendering.
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML rendering
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (char) => map[char]);
};

/**
 * Sanitizes user input by removing potentially dangerous content
 * @param {string} input - User input to sanitize
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers (onclick, onerror, etc.)
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Limit length to prevent DoS
    .substring(0, 10000);
};

/**
 * Validates and sanitizes URL to prevent XSS through href attributes
 * @param {string} url - URL to validate
 * @returns {string|null} - Validated URL or null if invalid
 */
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') {
    return null;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    // Block javascript: and data: protocols
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return null;
    }
    
    return urlObj.href;
  } catch {
    // Invalid URL format
    return null;
  }
};

/**
 * Sanitizes object with string values recursively
 * @param {object} obj - Object to sanitize
 * @returns {object} - Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * React component wrapper that automatically sanitizes props
 * Use this for components that render user-generated content
 * 
 * @example
 * const SafeComponent = withXSSProtection(UserContentComponent);
 */
export const withXSSProtection = (Component) => {
  return (props) => {
    const sanitizedProps = sanitizeObject(props);
    return <Component {...sanitizedProps} />;
  };
};

