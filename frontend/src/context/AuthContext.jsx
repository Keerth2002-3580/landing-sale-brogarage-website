/**
 * Context: AuthContext.jsx
 * MVC Layer: Context (thin bridge between Controller and View)
 * Responsibility: Provides global auth state to all React components.
 * Delegates all business logic to authController.js.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  loadUser,
  handleRegister,
  handleLogin,
  handleUpdateProfile,
  handleToggleFavorite,
} from '../controllers/authController';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'register'
  const [defaultRole, setDefaultRole] = useState('user');

  const API_URL = 'http://localhost:5000/api';

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openLoginModal = () => {
    setAuthModalMode('login');
    setLoginModalOpen(true);
  };
  const openRegisterModal = (role = 'user') => {
    setAuthModalMode('register');
    setDefaultRole(role);
    setLoginModalOpen(true);
  };
  const closeLoginModal = () => setLoginModalOpen(false);

  // ── Dark mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // ── Load user on mount / token change ─────────────────────────────────────
  useEffect(() => {
    loadUser(token, setUser, setLoading, logout);
  }, [token]);

  // ── Auth actions (delegate to Controller) ─────────────────────────────────
  const register = (name, email, password, phone, role) =>
    handleRegister({ name, email, password, phone, role }, setToken, setUser);

  const login = (email, password) =>
    handleLogin(email, password, setToken, setUser);

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = (profileData) =>
    handleUpdateProfile(profileData, token, setUser);

  const toggleFavorite = (landId) =>
    handleToggleFavorite(landId, token, setUser);

  // ── Provide state and actions ──────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        darkMode,
        API_URL,
        loginModalOpen,
        openLoginModal,
        openRegisterModal,
        closeLoginModal,
        authModalMode,
        defaultRole,
        register,
        login,
        logout,
        updateProfile,
        toggleFavorite,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
