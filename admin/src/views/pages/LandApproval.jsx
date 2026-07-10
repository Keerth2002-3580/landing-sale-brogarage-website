import React, { useState, useEffect } from 'react';
import { Check, X, Trash2, Star, Clock, Filter, Eye } from 'lucide-react';

export default function LandApproval({ adminToken }) {
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchLands();
  }, [adminToken]);

  const fetchLands = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/lands', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setLands(data.data);
      }
    } catch (err) {
      console.error(err);
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
        setLands(lands.map((l) => (l._id === landId ? { ...l, status: newStatus } : l)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (landId, currentFeatured) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/lands/${landId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      const data = await res.json();
      if (data.success) {
        setLands(lands.map((l) => (l._id === landId ? { ...l, isFeatured: !currentFeatured } : l)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLand = async (landId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/lands/${landId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setLands(lands.filter((l) => l._id !== landId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLands = filterStatus === 'all' 
    ? lands 
    : lands.filter((l) => l.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Title & Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Listing Moderation</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Approve, reject, feature, or remove advertisements</p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-white dark:bg-gray-900 p-1 border dark:border-gray-800 rounded-xl text-xs font-semibold">
          {['all', 'pending', 'approved', 'rejected', 'sold'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                filterStatus === status
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading advertisements directory...</div>
        ) : filteredLands.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-950 border-b dark:border-gray-805 text-gray-400 font-mono uppercase tracking-wider">
                  <th className="p-4">Listing</th>
                  <th className="p-4">Owner</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Size</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-805">
                {filteredLands.map((land) => (
                  <tr key={land._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                    {/* title */}
                    <td className="p-4 max-w-[200px]">
                      <h4 className="font-bold text-gray-950 dark:text-white truncate leading-snug">{land.title}</h4>
                      <span className="text-[10px] text-gray-400 block mt-1">{land.location}</span>
                    </td>
                    
                    {/* owner info */}
                    <td className="p-4">
                      <span className="font-semibold block text-gray-700 dark:text-gray-300">{land.owner?.name}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{land.owner?.email}</span>
                    </td>

                    {/* category */}
                    <td className="p-4 capitalize text-gray-650 dark:text-gray-350">{land.category}</td>

                    {/* size */}
                    <td className="p-4 font-semibold text-gray-650 dark:text-gray-350">
                      {land.size} {land.sizeUnit}s
                    </td>

                    {/* price */}
                    <td className="p-4 font-mono font-bold text-gray-800 dark:text-gray-200">
                      Rs. {land.price.toLocaleString()}
                    </td>

                    {/* status tag */}
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        land.status === 'approved'
                          ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : land.status === 'sold'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : land.status === 'rejected'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {land.status}
                      </span>
                    </td>

                    {/* moderation actions */}
                    <td className="p-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleToggleFeatured(land._id, land.isFeatured)}
                        className={`p-1.5 border rounded-lg transition-colors ${
                          land.isFeatured
                            ? 'bg-yellow-50 text-yellow-600 border-yellow-250 dark:bg-yellow-950/20 dark:text-yellow-455 dark:border-yellow-900/30'
                            : 'bg-white text-gray-400 hover:text-yellow-500 border-gray-200 dark:bg-gray-900 dark:border-gray-800'
                        }`}
                        title="Feature listing"
                      >
                        <Star className={`w-4 h-4 ${land.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                      
                      {land.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(land._id, 'approved')}
                            className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-950/20 dark:text-green-455 rounded-lg"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(land._id, 'rejected')}
                            className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-lg"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDeleteLand(land._id)}
                        className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 rounded-lg"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-450">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-xs">No advertisements fit this status condition.</p>
          </div>
        )}
      </div>
    </div>
  );
}
