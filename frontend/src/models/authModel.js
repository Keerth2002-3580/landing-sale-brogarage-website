/**
 * Model: authModel.js
 * MVC Layer: Model
 * Responsibility: Raw API calls to the authentication backend endpoints.
 * No state management here — only data fetching and returning results.
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch the currently logged-in user's profile.
 * @param {string} token - JWT auth token
 */
export const fetchCurrentUser = async (token) => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/**
 * Register a new user.
 * @param {object} userData - { name, email, password, phone, role }
 */
export const registerUser = async ({ name, email, password, phone, role }) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, phone, role }),
  });
  return res.json();
};

/**
 * Login an existing user.
 * @param {string} email
 * @param {string} password
 */
export const loginUser = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

/**
 * Update user profile details.
 * @param {object} profileData - { name, phone, avatar }
 * @param {string} token - JWT auth token
 */
export const updateUserProfile = async (profileData, token) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  return res.json();
};

/**
 * Toggle a land listing as favorite for the current user.
 * @param {string} landId
 * @param {string} token - JWT auth token
 */
export const toggleFavoriteApi = async (landId, token) => {
  const res = await fetch(`${API_URL}/auth/favorites/${landId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
