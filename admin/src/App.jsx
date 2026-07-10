import React, { useState, useEffect } from 'react';

// ── MVC: Controller ───────────────────────────────────────────────────────────
import {
  validateToken,
  handleLoginSuccess,
  handleLogout,
  loadAdminUser,
} from './controllers/adminController';

// ── MVC: Views — Components ───────────────────────────────────────────────────
import Sidebar from './views/components/Sidebar';

// ── MVC: Views — Pages ────────────────────────────────────────────────────────
import AdminLogin from './views/pages/AdminLogin';
import Overview from './views/pages/Overview';
import LandApproval from './views/pages/LandApproval';
import UserManagement from './views/pages/UserManagement';
import AgentManagement from './views/pages/AgentManagement';
import PaymentTracking from './views/pages/PaymentTracking';
import SiteSettings from './views/pages/SiteSettings';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // ── Load admin user from localStorage on init ─────────────────────────────
  useEffect(() => {
    loadAdminUser(setUser);
  }, [token]);

  // ── Validate token against backend on startup ─────────────────────────────
  useEffect(() => {
    validateToken(token, () => handleLogout(setToken, setUser));
  }, [token]);

  const onLoginSuccess = (newToken, newUser) =>
    handleLoginSuccess(newToken, newUser, setToken, setUser);

  const onLogout = () => handleLogout(setToken, setUser);

  if (!token) {
    return <AdminLogin onLoginSuccess={onLoginSuccess} />;
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-100 transition-colors">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={user}
        onLogout={onLogout}
      />

      {/* Main dashboard viewport */}
      <main className="flex-grow p-8 max-h-screen overflow-y-auto">
        {activeTab === 'overview'  && <Overview adminToken={token} />}
        {activeTab === 'lands'     && <LandApproval adminToken={token} />}
        {activeTab === 'users'     && <UserManagement adminToken={token} />}
        {activeTab === 'agents'    && <AgentManagement adminToken={token} />}
        {activeTab === 'payments'  && <PaymentTracking adminToken={token} />}
        {activeTab === 'settings'  && <SiteSettings adminToken={token} />}
      </main>
    </div>
  );
}
