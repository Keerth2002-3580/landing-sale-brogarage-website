import React from 'react';
import { LayoutDashboard, LandPlot, Users, ShieldCheck, CreditCard, LogOut, Settings } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, adminUser, onLogout }) {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'lands', label: 'Land Approvals', icon: LandPlot },
    { id: 'users', label: 'User Directory', icon: Users },
    { id: 'agents', label: 'Seller Verification', icon: ShieldCheck },
    { id: 'payments', label: 'Payment Logs', icon: CreditCard },
    { id: 'settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col h-screen sticky top-0 flex-shrink-0 border-r border-gray-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-gray-800 flex items-center gap-2">
        <span className="text-xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
          LANKALAND
        </span>
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-950 text-green-300 uppercase tracking-widest border border-green-800/30">
          Admin
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-grow p-4 space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                activeTab === item.id
                  ? 'bg-green-600 text-white shadow-md'
                  : 'hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Admin User Footer */}
      <div className="p-4 border-t border-gray-850 flex items-center justify-between gap-2 bg-gray-950/40">
        <div className="min-w-0">
          <h4 className="text-white text-xs font-bold truncate leading-tight">{adminUser?.name || 'Administrator'}</h4>
          <span className="text-[9px] text-gray-500 block truncate mt-0.5">{adminUser?.email}</span>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4.5 h-4.5" />
        </button>
      </div>
    </aside>
  );
}
