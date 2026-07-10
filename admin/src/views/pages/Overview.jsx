import React, { useState, useEffect } from 'react';
import { Users, LandPlot, ShieldCheck, DollarSign, Clock, Check, X, ShieldAlert } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b'];

export default function Overview({ adminToken }) {
  const [stats, setStats] = useState(null);
  const [pendingLands, setPendingLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, [adminToken]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch core stats
      const statsRes = await fetch('http://localhost:5000/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (!statsRes.ok) {
        if (statsRes.status === 401) {
          setError('Session expired. Please sign out and log back in.');
          return;
        }
        throw new Error(`Failed to fetch stats (Status: ${statsRes.status})`);
      }
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      } else {
        throw new Error(statsData.error || 'Failed to fetch stats');
      }

      // Fetch pending listings
      const landsRes = await fetch('http://localhost:5000/api/admin/lands', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (landsRes.ok) {
        const landsData = await landsRes.json();
        if (landsData.success) {
          setPendingLands(landsData.data.filter((l) => l.status === 'pending'));
        }
      }
    } catch (err) {
      console.error('Error fetching overview stats:', err);
      setError(err.message || 'Failed to load dashboard data. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (landId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/lands/${landId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingLands(pendingLands.filter((l) => l._id !== landId));
        // Refresh stats
        fetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-4 text-center p-6">
        <div className="text-red-500 font-bold max-w-md">{error}</div>
        <button
          onClick={fetchStats}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-600" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Users', val: stats.stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Total Listings', val: stats.stats.totalLands, icon: LandPlot, color: 'text-green-600 bg-green-50 dark:bg-green-950/20' },
    { label: 'Pending Approvals', val: stats.stats.pendingApprovals, icon: Clock, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Verified Sellers', val: stats.stats.totalAgents, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Total Revenue', val: `Rs. ${stats.stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Overview Dashboard</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">System status and analytical visualizations</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl flex items-center gap-4">
              <div className={`p-3 rounded-xl ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block">{card.label}</span>
                <span className="text-lg font-black text-gray-900 dark:text-white mt-1 block">{card.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly listings growth */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Listing Additions (Last 6 Months)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyListings}>
                <defs>
                  <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="Listings" stroke="#22c55e" fillOpacity={1} fill="url(#colorListings)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Listings by Category</h3>
          <div className="h-48 flex justify-center items-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs font-semibold">
            {stats.categoryBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-gray-500 dark:text-gray-400 capitalize">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue growth */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Revenue Growth (LKR - Last 6 Months)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.monthlyRevenue}>
              <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Listings Queue */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Pending Moderation Queue</h3>
          <span className="px-2 py-0.5 bg-amber-500 text-white rounded text-[10px] font-bold uppercase tracking-wider">
            Awaiting Actions
          </span>
        </div>

        {pendingLands.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-805 text-gray-400 uppercase font-mono tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-805">
                {pendingLands.map((land) => (
                  <tr key={land._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/20">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{land.title}</td>
                    <td className="p-4 capitalize text-gray-600 dark:text-gray-350">{land.category}</td>
                    <td className="p-4 text-gray-600 dark:text-gray-350">{land.location}</td>
                    <td className="p-4 font-mono font-bold text-green-600">Rs. {land.price.toLocaleString()}</td>
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(land._id, 'approved')}
                        className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-455 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(land._id, 'rejected')}
                        className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No pending advertisements currently in the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
