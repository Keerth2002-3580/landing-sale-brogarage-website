/**
 * Model: landModel.js
 * MVC Layer: Model
 * Responsibility: Raw API calls to the land listings backend endpoints.
 * No state management here — only data fetching and returning results.
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Fetch all approved land listings with optional filters.
 * @param {object} params - { category, location, minPrice, maxPrice, search, page, limit }
 */
export const fetchLands = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/lands?${query}`);
  return res.json();
};

/**
 * Fetch a single land listing by its ID.
 * @param {string} id - Land listing ID
 */
export const fetchLandById = async (id) => {
  const res = await fetch(`${API_URL}/lands/${id}`);
  return res.json();
};

/**
 * Post a new land advertisement.
 * @param {FormData} formData - All land fields including images
 * @param {string} token - JWT auth token
 */
export const postLand = async (formData, token) => {
  const res = await fetch(`${API_URL}/lands`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return res.json();
};

/**
 * Delete a land listing by ID.
 * @param {string} id - Land listing ID
 * @param {string} token - JWT auth token
 */
export const deleteLand = async (id, token) => {
  const res = await fetch(`${API_URL}/lands/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/**
 * Fetch all listings owned by the current user.
 * @param {string} token - JWT auth token
 */
export const fetchMyListings = async (token) => {
  const res = await fetch(`${API_URL}/lands/my-listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/**
 * Fetch land listings the user saved as favorites.
 * @param {string} token - JWT auth token
 */
export const fetchFavoriteLands = async (token) => {
  const res = await fetch(`${API_URL}/lands/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

/**
 * Send a message to a land listing owner.
 * @param {string} landId - Target land ID
 * @param {string} message - Message text
 * @param {string} token - JWT auth token
 */
export const sendMessage = async (landId, message, token) => {
  const res = await fetch(`${API_URL}/lands/${landId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message }),
  });
  return res.json();
};

/**
 * Fetch all messages for a specific land.
 * @param {string} landId - Land listing ID
 * @param {string} token - JWT auth token
 */
export const fetchMessages = async (landId, token) => {
  const res = await fetch(`${API_URL}/lands/${landId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};
