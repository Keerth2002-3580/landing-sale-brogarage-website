/**
 * Model: adminModel.js
 * MVC Layer: Model
 * Responsibility: Raw API calls to the admin backend endpoints.
 * No state management here — only data fetching and returning results.
 */

const API_URL = 'http://localhost:5000/api';

const authHeaders = (token) => ({ Authorization: `Bearer ${token}` });
const jsonHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

// ── Dashboard ────────────────────────────────────────────────────────────────

export const fetchDashboardStats = async (token) => {
  const res = await fetch(`${API_URL}/admin/dashboard-stats`, { headers: authHeaders(token) });
  return res.json();
};

// ── Users ────────────────────────────────────────────────────────────────────

export const fetchAllUsers = async (token) => {
  const res = await fetch(`${API_URL}/admin/users`, { headers: authHeaders(token) });
  return res.json();
};

export const deleteUserById = async (id, token) => {
  const res = await fetch(`${API_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return res.json();
};

export const updateUserRole = async (id, role, token) => {
  const res = await fetch(`${API_URL}/admin/users/${id}/role`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ role }),
  });
  return res.json();
};

// ── Land Listings ─────────────────────────────────────────────────────────────

export const fetchAllLands = async (token) => {
  const res = await fetch(`${API_URL}/admin/lands`, { headers: authHeaders(token) });
  return res.json();
};

export const updateLandStatus = async (id, status, token) => {
  const res = await fetch(`${API_URL}/admin/lands/${id}/status`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ status }),
  });
  return res.json();
};

export const deleteLandById = async (id, token) => {
  const res = await fetch(`${API_URL}/admin/lands/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  return res.json();
};

// ── Agents ────────────────────────────────────────────────────────────────────

export const fetchAllAgents = async (token) => {
  const res = await fetch(`${API_URL}/admin/agents`, { headers: authHeaders(token) });
  return res.json();
};

export const updateAgentStatus = async (id, status, reason, token) => {
  const res = await fetch(`${API_URL}/admin/agents/${id}/verify`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify({ status, rejectionReason: reason }),
  });
  return res.json();
};

// ── Payments ──────────────────────────────────────────────────────────────────

export const fetchAllPayments = async (token) => {
  const res = await fetch(`${API_URL}/admin/payments`, { headers: authHeaders(token) });
  return res.json();
};

// ── Site Settings ─────────────────────────────────────────────────────────────

export const fetchSiteSettings = async (token) => {
  const res = await fetch(`${API_URL}/settings`, { headers: authHeaders(token) });
  return res.json();
};

export const updateSiteSettings = async (settingsData, token) => {
  const res = await fetch(`${API_URL}/settings`, {
    method: 'PUT',
    headers: jsonHeaders(token),
    body: JSON.stringify(settingsData),
  });
  return res.json();
};

// ── Auth Validation ───────────────────────────────────────────────────────────

export const validateAdminToken = async (token) => {
  const res = await fetch(`${API_URL}/admin/dashboard-stats`, { headers: authHeaders(token) });
  return res.ok;
};
