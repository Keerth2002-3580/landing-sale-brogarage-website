/**
 * Controller: authController.js
 * MVC Layer: Controller
 * Responsibility: Business logic for authentication.
 * Wraps authModel API calls with state management, token storage,
 * and error handling. Used by AuthContext to provide app-wide auth state.
 */

import {
  fetchCurrentUser,
  registerUser,
  loginUser,
  updateUserProfile,
  toggleFavoriteApi,
} from '../models/authModel';

/**
 * Load the authenticated user from the backend using a stored token.
 * @param {string} token
 * @param {Function} setUser
 * @param {Function} setLoading
 * @param {Function} logout
 */
export const loadUser = async (token, setUser, setLoading, logout) => {
  if (!token) {
    setLoading(false);
    return;
  }
  try {
    const data = await fetchCurrentUser(token);
    if (data.success) {
      setUser(data.data);
    } else {
      logout();
    }
  } catch (err) {
    console.error('AuthController: Error fetching user', err);
  } finally {
    setLoading(false);
  }
};

/**
 * Handle user registration.
 * On success, saves token and user state.
 * @param {object} userData - { name, email, password, phone, role }
 * @param {Function} setToken
 * @param {Function} setUser
 * @returns {{ success: boolean, error?: string }}
 */
export const handleRegister = async (userData, setToken, setUser) => {
  try {
    const data = await registerUser(userData);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  } catch {
    return { success: false, error: 'Server connection failed' };
  }
};

/**
 * Handle user login.
 * On success, saves token and user state.
 * @param {string} email
 * @param {string} password
 * @param {Function} setToken
 * @param {Function} setUser
 * @returns {{ success: boolean, error?: string }}
 */
export const handleLogin = async (email, password, setToken, setUser) => {
  try {
    const data = await loginUser(email, password);
    if (data.success) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { success: true };
    }
    return { success: false, error: data.error };
  } catch {
    return { success: false, error: 'Server connection failed' };
  }
};

/**
 * Handle profile update.
 * @param {object} profileData
 * @param {string} token
 * @param {Function} setUser
 * @returns {{ success: boolean, error?: string }}
 */
export const handleUpdateProfile = async (profileData, token, setUser) => {
  try {
    const data = await updateUserProfile(profileData, token);
    if (data.success) {
      setUser((prev) => ({ ...prev, ...data.data }));
      return { success: true };
    }
    return { success: false, error: data.error };
  } catch {
    return { success: false, error: 'Server update failed' };
  }
};

/**
 * Toggle a land listing in the user's favorites.
 * @param {string} landId
 * @param {string} token
 * @param {Function} setUser
 * @returns {{ success: boolean, error?: string }}
 */
export const handleToggleFavorite = async (landId, token, setUser) => {
  if (!token) return { success: false, error: 'Please login to save favorites' };
  try {
    const data = await toggleFavoriteApi(landId, token);
    if (data.success) {
      setUser((prev) => ({ ...prev, favorites: data.favorites }));
      return { success: true };
    }
    return { success: false, error: data.error };
  } catch {
    return { success: false, error: 'Failed to update favorites' };
  }
};
