import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Check, X, Search, FileText, Eye, AlertCircle } from 'lucide-react';

export default function AgentManagement({ adminToken }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected

  // Rejection Modal State
  const [rejectingAgentId, setRejectingAgentId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Document Preview Modal State
  const [previewDocUrl, setPreviewDocUrl] = useState(null);

  useEffect(() => {
    fetchAgents();
  }, [adminToken]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/agents', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAgent = async (agentId, status, rejectReason = '') => {
    try {
      const body = { status };
      if (status === 'rejected') {
        body.rejectionReason = rejectReason || 'Rejected by Administrator';
      }
      
      const res = await fetch(`http://localhost:5000/api/admin/agents/${agentId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        // Update local agent state
        setAgents(agents.map((a) => (a._id === agentId ? data.data : a)));
        setRejectingAgentId(null);
        setRejectionReason('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Client-side filtering
  const filteredAgents = agents.filter((agent) => {
    const user = agent.userId || {};
    const name = (user.name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    const phone = (user.phone || '').toLowerCase();
    const company = (agent.companyName || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      name.includes(search) ||
      email.includes(search) ||
      phone.includes(search) ||
      company.includes(search);

    const status = agent.verificationStatus || (agent.verified ? 'approved' : 'pending');
    const matchesStatus = statusFilter === 'all' || status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Seller Verification</h1>
          <p className="text-xs text-gray-555 dark:text-gray-400">Review seller registration details, uploaded credentials, and moderate verifications</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-sm">
        
        {/* Search Filter */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search seller name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-805 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-green-600 focus:border-green-600 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-650"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved (Verified)' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => {
            const count = agents.filter(a => {
              const status = a.verificationStatus || (a.verified ? 'approved' : 'pending');
              return tab.id === 'all' || status === tab.id;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white dark:bg-gray-850 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {tab.label} <span className="ml-1 px-1.5 py-0.25 bg-gray-200 dark:bg-gray-800 rounded-full text-[10px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading seller requests...</div>
        ) : filteredAgents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-55 dark:bg-gray-950 border-b dark:border-gray-805 text-gray-400 font-mono uppercase tracking-wider">
                  <th className="p-4">Seller details</th>
                  <th className="p-4">Company Name (Optional)</th>
                  <th className="p-4">Seller Bio / Description</th>
                  <th className="p-4 text-center">Verification Doc</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-850">
                {filteredAgents.map((agt) => {
                  const status = agt.verificationStatus || (agt.verified ? 'approved' : 'pending');
                  return (
                    <tr key={agt._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/10">
                      {/* Broker Name / Avatar / Register info */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center text-green-700 font-extrabold text-sm border dark:border-green-900">
                            {agt.userId?.name ? agt.userId.name.charAt(0) : 'B'}
                          </div>
                          <div>
                            <span className="block font-bold text-gray-900 dark:text-white text-sm">{agt.userId?.name}</span>
                            <span className="block text-[10px] text-gray-450 mt-0.5">{agt.userId?.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="p-4 text-gray-700 dark:text-gray-300 font-medium">
                        {agt.companyName || 'Independent Seller'}
                      </td>

                      {/* Bio */}
                      <td className="p-4 max-w-xs">
                        <p className="text-gray-550 dark:text-gray-455 line-clamp-2 leading-relaxed">
                          {agt.bio || 'No description provided.'}
                        </p>
                        <span className="block text-[10px] text-gray-400 mt-1 font-mono">{agt.userId?.phone || 'No Phone Number'}</span>
                      </td>

                      {/* Verification Document */}
                      <td className="p-4 text-center">
                        {agt.verificationDocument ? (
                          <button
                            onClick={() => setPreviewDocUrl(agt.verificationDocument)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-950 rounded-xl font-semibold transition-colors cursor-pointer"
                            title="Verify and view uploaded credential document"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Verify Doc</span>
                            <Eye className="w-3.5 h-3.5 ml-0.5" />
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[10px] italic">No doc uploaded</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {status === 'approved' ? (
                          <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-455 font-bold uppercase tracking-wider text-[10px] bg-green-50 dark:bg-green-950/20 px-2 py-0.5 rounded">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        ) : status === 'rejected' ? (
                          <div className="relative group inline-block">
                            <span className="inline-flex items-center gap-1 text-red-500 font-bold uppercase tracking-wider text-[10px] bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded cursor-help">
                              <AlertCircle className="w-3.5 h-3.5" />
                              Rejected
                            </span>
                            {/* Hover reason popup */}
                            {agt.rejectionReason && (
                              <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white rounded-lg shadow-lg text-[10px] leading-relaxed hidden group-hover:block pointer-events-none">
                                <p className="font-bold border-b border-gray-700 pb-1 mb-1">Rejection Reason:</p>
                                {agt.rejectionReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-500 font-bold uppercase tracking-wider text-[10px] bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {status !== 'approved' && (
                            <button
                              onClick={() => handleVerifyAgent(agt._id, 'approved')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[11px] font-bold shadow-sm transition-all"
                            >
                              <Check className="w-3 h-3" />
                              Approve
                            </button>
                          )}
                          
                          {status === 'approved' && (
                            <button
                              onClick={() => handleVerifyAgent(agt._id, 'rejected', 'Verification Revoked by Administrator')}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg text-[11px] font-semibold"
                            >
                              Revoke
                            </button>
                          )}

                          {status === 'pending' && (
                            <button
                              onClick={() => setRejectingAgentId(agt._id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-850 rounded-lg text-[11px] font-semibold"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-gray-450">
            <p className="text-xs">No sellers match the selected filters.</p>
          </div>
        )}
      </div>

      {/* REJECTION MODAL */}
      {rejectingAgentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                Reject Seller Application
              </h3>
              <button
                onClick={() => setRejectingAgentId(null)}
                className="text-gray-400 hover:text-gray-655"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Specify Rejection Reason</label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this registration was rejected (e.g. Invalid document file, incomplete bio details)..."
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingAgentId(null)}
                className="px-4 py-2 border dark:border-gray-850 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-850"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVerifyAgent(rejectingAgentId, 'rejected', rejectionReason)}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-750 text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-colors"
              >
                Reject & Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3 dark:border-gray-800 flex-shrink-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-green-600" />
                Credential Document Verification Preview
              </h3>
              <div className="flex items-center gap-4">
                <a
                  href={`http://localhost:5000${previewDocUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-green-600 hover:underline font-semibold"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => setPreviewDocUrl(null)}
                  className="text-gray-400 hover:text-gray-655"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-auto flex items-center justify-center py-4 bg-gray-50 dark:bg-gray-950 rounded-xl my-4 min-h-[300px]">
              {previewDocUrl.endsWith('.pdf') ? (
                <iframe
                  src={`http://localhost:5000${previewDocUrl}`}
                  className="w-full h-[55vh]"
                  title="PDF Document"
                />
              ) : (
                <img
                  src={`http://localhost:5000${previewDocUrl}`}
                  alt="Verification Document"
                  className="max-w-full max-h-[55vh] object-contain rounded border shadow-sm"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400?text=Document+Format+Not+Supported';
                  }}
                />
              )}
            </div>

            <div className="flex items-center justify-end flex-shrink-0">
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
