/**
 * User Storage Utility for React Native
 * 
 * Secure user data storage using AsyncStorage
 * Removes sensitive information (password) before storing
 * 
 * Security Best Practices:
 * - Never store passwords (even hashed)
 * - Only store minimal data needed for UI (id, username, role)
 * - Full user data should be fetched from backend when needed
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Sanitizes user data by removing sensitive information
 * @param {object} userData - User data from backend
 * @returns {object} - Sanitized user data safe for AsyncStorage
 */
export const sanitizeUserData = (userData: any) => {
  if (!userData || typeof userData !== 'object') {
    return null;
  }

  // Only store non-sensitive data needed for UI
  const safeData = {
    _id: userData._id,
    username: userData.username,
    role: userData.role,
    isActive: userData.isActive,
    email: userData.email,
    firstName: userData.firstName,
    lastName: userData.lastName,
    // Explicitly exclude sensitive data
    // password: NOT STORED (never store passwords, even hashed)
  };

  return safeData;
};

/**
 * Stores user data securely in AsyncStorage
 * @param {object} userData - User data from backend
 */
export const storeUserData = async (userData: any) => {
  try {
    const sanitized = sanitizeUserData(userData);
    if (sanitized) {
      await AsyncStorage.setItem('user', JSON.stringify(sanitized));
    }
  } catch (error) {
    console.error('Error storing user data:', error);
    // Don't throw - storage failure shouldn't break the app
  }
};

/**
 * Retrieves user data from AsyncStorage
 * @returns {object|null} - User data or null
 */
export const getUserData = async () => {
  try {
    const userStr = await AsyncStorage.getItem('user');
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
 * Removes user data from AsyncStorage
 */
export const removeUserData = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (error) {
    console.error('Error removing user data:', error);
  }
};

