/**
 * Input Validation Utilities
 * 
 * Provides comprehensive input validation and sanitization functions
 * following Clean Code principles (DRY, KISS, YAGNI)
 * 
 * Security: Protects against XSS, NoSQL injection, and invalid data
 */

/**
 * Validates MongoDB ObjectId format
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid ObjectId format
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  // MongoDB ObjectId is 24 hex characters
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Sanitizes string input to prevent XSS attacks
 * @param {string} input - The string to sanitize
 * @returns {string} - Sanitized string
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onerror, etc.)
    .substring(0, 1000); // Limit length
};

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates date string and ensures it's a valid Date
 * @param {string|Date} date - Date to validate
 * @returns {boolean} - True if valid date
 */
export const isValidDate = (date) => {
  if (!date) return false;
  const dateObj = date instanceof Date ? date : new Date(date);
  return !isNaN(dateObj.getTime()) && dateObj > new Date();
};

/**
 * Validates person count (must be positive integer)
 * @param {number} count - Person count to validate
 * @returns {boolean} - True if valid
 */
export const isValidPersonCount = (count) => {
  const num = Number(count);
  return Number.isInteger(num) && num > 0 && num <= 10; // Max 10 people
};

/**
 * Validates gender preference
 * @param {string} gender - Gender preference to validate
 * @returns {boolean} - True if valid
 */
export const isValidGenderPreference = (gender) => {
  const validGenders = ['male', 'female', 'unisex'];
  return validGenders.includes(gender);
};

/**
 * Validates booking data before sending to API
 * @param {object} bookingData - Booking data to validate
 * @returns {{isValid: boolean, errors: string[]}} - Validation result
 */
export const validateBookingData = (bookingData) => {
  const errors = [];

  if (!bookingData) {
    errors.push('Booking data is required');
    return { isValid: false, errors };
  }

  // Validate businessId
  if (!bookingData.businessId || !isValidObjectId(bookingData.businessId)) {
    errors.push('Valid business ID is required');
  }

  // Validate toiletId
  if (!bookingData.toiletId || !isValidObjectId(bookingData.toiletId)) {
    errors.push('Valid toilet ID is required');
  }

  // Validate startTime
  if (!bookingData.startTime || !isValidDate(bookingData.startTime)) {
    errors.push('Valid future date is required');
  }

  // Validate personCount
  if (!isValidPersonCount(bookingData.personCount)) {
    errors.push('Person count must be between 1 and 10');
  }

  // Validate genderPreference (optional)
  if (bookingData.genderPreference && !isValidGenderPreference(bookingData.genderPreference)) {
    errors.push('Invalid gender preference');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitizes payment ID (handles both string and object)
 * @param {string|object} paymentId - Payment ID to sanitize
 * @returns {string|null} - Sanitized payment ID or null
 */
export const sanitizePaymentId = (paymentId) => {
  if (!paymentId) return null;
  
  if (typeof paymentId === 'string') {
    return isValidObjectId(paymentId) ? paymentId : null;
  }
  
  if (typeof paymentId === 'object' && paymentId !== null) {
    const id = paymentId._id || paymentId.id || paymentId.toString();
    return isValidObjectId(id) ? id : null;
  }
  
  return null;
};

/**
 * Validates and sanitizes user profile data
 * @param {object} profileData - Profile data to validate
 * @returns {{isValid: boolean, errors: string[], sanitized: object}} - Validation result
 */
export const validateProfileData = (profileData) => {
  const errors = [];
  const sanitized = {};

  if (!profileData) {
    errors.push('Profile data is required');
    return { isValid: false, errors, sanitized };
  }

  // Validate and sanitize username
  if (profileData.username !== undefined) {
    const username = sanitizeString(profileData.username);
    if (username.length < 3 || username.length > 30) {
      errors.push('Username must be between 3 and 30 characters');
    } else {
      sanitized.username = username;
    }
  }

  // Validate and sanitize email
  if (profileData.email !== undefined) {
    const email = profileData.email.trim();
    if (!isValidEmail(email)) {
      errors.push('Valid email is required');
    } else {
      sanitized.email = email.toLowerCase();
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitized,
  };
};

