/**
 * Controller: landController.js
 * MVC Layer: Controller
 * Responsibility: Business logic for land listing operations.
 * Wraps landModel API calls with state management and error handling.
 * Used by views (pages) to fetch, filter, and manage land data.
 */

import {
  fetchLands,
  fetchLandById,
  postLand,
  deleteLand,
  fetchMyListings,
} from '../models/landModel';

/**
 * Load all land listings with optional filters.
 * @param {object} filters - Query params (category, location, etc.)
 * @param {Function} setLands
 * @param {Function} setLoading
 * @param {Function} setError
 */
export const loadLands = async (filters, setLands, setLoading, setError) => {
  setLoading(true);
  try {
    const data = await fetchLands(filters);
    if (data.success) {
      setLands(data.data || []);
    } else {
      setError(data.error || 'Failed to load listings');
    }
  } catch (err) {
    setError('Could not connect to server');
    console.error('LandController: loadLands error', err);
  } finally {
    setLoading(false);
  }
};

/**
 * Load a single land listing by ID.
 * @param {string} id
 * @param {Function} setLand
 * @param {Function} setLoading
 * @param {Function} setError
 */
export const loadLandById = async (id, setLand, setLoading, setError) => {
  setLoading(true);
  try {
    const data = await fetchLandById(id);
    if (data.success) {
      setLand(data.data);
    } else {
      setError(data.error || 'Listing not found');
    }
  } catch (err) {
    setError('Could not connect to server');
    console.error('LandController: loadLandById error', err);
  } finally {
    setLoading(false);
  }
};

/**
 * Handle submitting a new land advertisement.
 * @param {FormData} formData
 * @param {string} token
 * @param {Function} setLoading
 * @param {Function} onSuccess - Callback on success (e.g. redirect or show message)
 * @param {Function} setError
 */
export const submitLandPost = async (formData, token, setLoading, onSuccess, setError) => {
  setLoading(true);
  try {
    const data = await postLand(formData, token);
    if (data.success) {
      onSuccess(data.data);
    } else {
      setError(data.error || 'Failed to post listing');
    }
  } catch (err) {
    setError('Could not connect to server');
    console.error('LandController: submitLandPost error', err);
  } finally {
    setLoading(false);
  }
};

/**
 * Handle deleting a land listing.
 * @param {string} id
 * @param {string} token
 * @param {Function} setLands - State setter to remove the item from list
 * @param {Function} setError
 */
export const removeLand = async (id, token, setLands, setError) => {
  try {
    const data = await deleteLand(id, token);
    if (data.success) {
      setLands((prev) => prev.filter((l) => l._id !== id));
    } else {
      setError(data.error || 'Failed to delete listing');
    }
  } catch (err) {
    setError('Could not connect to server');
    console.error('LandController: removeLand error', err);
  }
};

/**
 * Load the current user's own land listings.
 * @param {string} token
 * @param {Function} setLands
 * @param {Function} setLoading
 * @param {Function} setError
 */
export const loadMyListings = async (token, setLands, setLoading, setError) => {
  setLoading(true);
  try {
    const data = await fetchMyListings(token);
    if (data.success) {
      setLands(data.data || []);
    } else {
      setError(data.error || 'Failed to load your listings');
    }
  } catch (err) {
    setError('Could not connect to server');
    console.error('LandController: loadMyListings error', err);
  } finally {
    setLoading(false);
  }
};
