import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, ShieldAlert, Check } from 'lucide-react';

export default function UserManagement({ adminToken }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [adminToken]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account and all their listings? This action cannot be undone.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">User Directory</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Manage registered user accounts and structural access roles</p>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading user accounts...</div>
        ) : users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-950 border-b dark:border-gray-805 text-gray-400 font-mono uppercase tracking-wider">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-805">
                {users.map((usr) => (
                  <tr key={usr._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                    <td className="p-4 font-bold text-gray-900 dark:text-white">{usr.name}</td>
                    <td className="p-4 text-gray-650 dark:text-gray-350">{usr.email}</td>
                    <td className="p-4 text-gray-650 dark:text-gray-350">{usr.phone || 'N/A'}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        usr.role === 'admin'
                          ? 'bg-red-50 text-red-755 dark:bg-red-950/20 dark:text-red-400'
                          : usr.role === 'agent'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {usr.role === 'agent' ? 'seller' : usr.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-450">{new Date(usr.createdAt).toLocaleDateString()}</td>
                    
                    <td className="p-4 flex items-center justify-center gap-2">
                      {usr.role === 'user' && (
                        <button
                          onClick={() => handleUpdateRole(usr._id, 'agent')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-950/20 dark:text-green-455 rounded-lg font-semibold"
                          title="Promote to Verified Seller"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Verify Seller
                        </button>
                      )}
                      
                      {usr.role === 'agent' && (
                        <button
                          onClick={() => handleUpdateRole(usr._id, 'user')}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-lg font-semibold"
                          title="Demote to User"
                        >
                          Demote Seller
                        </button>
                      )}

                      {usr.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(usr._id)}
                          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-lg"
                          title="Block & Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-450">
            <p className="text-xs">No registered accounts in system.</p>
          </div>
        )}
      </div>
    </div>
  );
}
