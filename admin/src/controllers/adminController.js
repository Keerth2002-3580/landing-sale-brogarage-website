/**
 * Controller: adminController.js
 * MVC Layer: Controller
 * Responsibility: Business logic for admin operations.
 * Wraps adminModel API calls with state management and error handling.
 */

import { validateAdminToken } from '../models/adminModel';

/**
 * Validate admin JWT token against the backend.
 * Calls logout if token is invalid or expired.
 * @param {string} token
 * @param {Function} onLogout
 */
export const validateToken = async (token, onLogout) => {
  if (!token) return;
  try {
    const valid = await validateAdminToken(token);
    if (!valid) {
      onLogout();
    }
  } catch (err) {
    console.error('AdminController: Token validation failed', err);
  }
};

/**
 * Handle successful login — saves token and user to localStorage.
 * @param {string} newToken
 * @param {object} newUser
 * @param {Function} setToken
 * @param {Function} setUser
 */
export const handleLoginSuccess = (newToken, newUser, setToken, setUser) => {
  setToken(newToken);
  setUser(newUser);
};

/**
 * Handle admin logout — clears localStorage and resets state.
 * @param {Function} setToken
 * @param {Function} setUser
 */
export const handleLogout = (setToken, setUser) => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  setToken(null);
  setUser(null);
};

/**
 * Load admin user from localStorage on app init.
 * @param {Function} setUser
 */
export const loadAdminUser = (setUser) => {
  const savedUser = localStorage.getItem('adminUser');
  if (savedUser) {
    try {
      setUser(JSON.parse(savedUser));
    } catch {
      console.error('AdminController: Failed to parse saved admin user');
    }
  }
};
