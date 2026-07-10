import React, { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import Sidebar from './components/Sidebar';

// Subpages
import Overview from './pages/Overview';
import LandApproval from './pages/LandApproval';
import UserManagement from './pages/UserManagement';
import AgentManagement from './pages/AgentManagement';
import PaymentTracking from './pages/PaymentTracking';
import SiteSettings from './pages/SiteSettings';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('adminToken') || null);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [token]);

  // Auto-validate token on mount/startup
  useEffect(() => {
    if (token) {
      fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!res.ok) {
          // Token is expired, invalid, or database was re-seeded
          handleLogout();
        }
      })
      .catch((err) => {
        console.error('Token validation failed:', err);
      });
    }
  }, [token]);

  const handleLoginSuccess = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setToken(null);
    setUser(null);
  };

  if (!token) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex bg-gray-50 dark:bg-gray-950 min-h-screen text-gray-800 dark:text-gray-100 transition-colors">
      {/* Sidebar navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        adminUser={user}
        onLogout={handleLogout}
      />

      {/* Main dashboard viewport */}
      <main className="flex-grow p-8 max-h-screen overflow-y-auto">
        {activeTab === 'overview' && <Overview adminToken={token} />}
        {activeTab === 'lands' && <LandApproval adminToken={token} />}
        {activeTab === 'users' && <UserManagement adminToken={token} />}
        {activeTab === 'agents' && <AgentManagement adminToken={token} />}
        {activeTab === 'payments' && <PaymentTracking adminToken={token} />}
        {activeTab === 'settings' && <SiteSettings adminToken={token} />}
      </main>
    </div>
  );
}
