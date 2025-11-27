/**
 * User Storage Utility
 * 
 * Secure user data storage in localStorage
 * Removes sensitive information (password, email) before storing
 * 
 * Security Best Practices:
 * - Never store passwords (even hashed)
 * - Don't store sensitive PII (email) in localStorage
 * - Only store minimal data needed for UI (id, username, role)
 * - Full user data should be fetched from backend when needed
 */

/**
 * Sanitizes user data by removing sensitive information
 * @param {object} userData - User data from backend
 * @returns {object} - Sanitized user data safe for localStorage
 */
export const sanitizeUserData = (userData) => {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  // Only store non-sensitive data needed for UI
  const safeData = {
    _id: userData._id,
    username: userData.username,
    role: userData.role,
    isActive: userData.isActive,
    // Explicitly exclude sensitive data
    // email: NOT STORED (fetch from backend when needed)
    // password: NOT STORED (never store passwords)
  };

  return safeData;
};

/**
 * Stores user data securely in localStorage
 * @param {object} userData - User data from backend
 */
export const storeUserData = (userData) => {
  try {
    const sanitized = sanitizeUserData(userData);
    if (sanitized) {
      localStorage.setItem('user', JSON.stringify(sanitized));
    }
  } catch (error) {
    console.error('Error storing user data:', error);
    // Don't throw - storage failure shouldn't break the app
  }
};

/**
 * Retrieves user data from localStorage
 * @returns {object|null} - User data or null
 */
export const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // Ensure no sensitive data leaked in (defense in depth)
    return sanitizeUserData(user);
  } catch (error) {
    console.error('Error reading user data:', error);
    return null;
  }
};

/**
 * Removes user data from localStorage
 */
export const removeUserData = () => {
  try {
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

