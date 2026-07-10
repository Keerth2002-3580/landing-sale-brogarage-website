import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Phone, Mail, ChevronLeft, Building, Sparkles, X, MapPin, LandPlot, ExternalLink, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandCard from '../components/LandCard';

export default function VerifiedSellers() {
  const { API_URL, user } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all'); // all, pro, premium, free
  
  // Listings Modal State
  const [activeModalAgent, setActiveModalAgent] = useState(null);
  const [modalListings, setModalListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/agents`);
        const data = await res.json();
        if (data.success) {
          setAgents(data.data);
        }
      } catch (err) {
        console.error('Error fetching verified sellers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [API_URL]);

  const openListingsModal = async (agent) => {
    setActiveModalAgent(agent);
    setLoadingListings(true);
    setModalListings([]);
    try {
      const res = await fetch(`${API_URL}/agents/${agent._id}`);
      const data = await res.json();
      if (data.success && data.data) {
        // The endpoint returns { agent, lands }
        setModalListings(data.data.lands || []);
      }
    } catch (err) {
      console.error('Error fetching agent listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const closeModal = () => {
    setActiveModalAgent(null);
    setModalListings([]);
  };

  // Filter logic
  const filteredAgents = agents.filter((agent) => {
    const nameMatch = agent.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const companyMatch = agent.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const planMatch = selectedPlan === 'all' || agent.subscriptionPlan === selectedPlan;
    return (nameMatch || companyMatch) && planMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-tr from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden border border-emerald-900/40">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-green-300 text-xs font-black tracking-widest uppercase border border-white/10 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-green-400 fill-green-400/20" /> Verified Sellers Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              Direct Land Sellers You Can Trust
            </h1>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed font-medium">
              We verify and moderate sellers using National identity credentials (NIC) and land deeds. 
              Browse verified profiles, view active property portfolios, and contact land owners directly—completely commission-free.
            </p>
          </div>
        </div>

        {/* Directory Controls */}
        <div className="bg-white dark:bg-gray-900 border border-gray-250/30 dark:border-gray-805/50 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-150/60 dark:border-gray-805/40">
            <div>
              <h2 className="font-extrabold text-xl text-gray-950 dark:text-white tracking-tight">Seller Directory</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">Filter by seller tier or search for individuals and agencies</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Tier Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Verified Sellers' },
              { id: 'pro', label: 'Pro Tier' },
              { id: 'premium', label: 'Premium Tier' },
              { id: 'free', label: 'Standard Tier' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPlan(tab.id)}
                className={`px-4.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedPlan === tab.id
                    ? 'bg-green-600 border-green-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-805 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-9 h-9 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-7 h-7 text-gray-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-950 dark:text-white text-base">No Sellers Found</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your search query or tier filters to explore other verified members.</p>
              </div>
            </div>
          ) : (
            /* Sellers Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
              {filteredAgents.map((agent) => {
                const planDetails = {
                  pro: {
                    label: 'Pro Seller',
                    style: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm border-purple-500/10'
                  },
                  premium: {
                    label: 'Premium',
                    style: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-sm border-blue-500/10'
                  },
                  free: {
                    label: 'Verified Owner',
                    style: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-sm border-green-500/10'
                  }
                };

                const currentPlan = planDetails[agent.subscriptionPlan] || planDetails.free;

                return (
                  <div
                    key={agent._id}
                    className="group bg-gray-50/50 hover:bg-white dark:bg-gray-950/20 dark:hover:bg-gray-950 border border-gray-200/50 hover:border-green-500/30 dark:border-gray-900/60 dark:hover:border-green-800/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300"
                  >
                    <div>
                      {/* Avatar Row */}
                      <div className="flex justify-between items-start mb-5">
                        <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border border-gray-150 dark:border-gray-800 flex items-center justify-center overflow-hidden">
                          {agent.userId?.avatar ? (
                            <img src={agent.userId.avatar} alt={agent.userId.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center text-xl font-black">
                              {agent.userId?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 p-1 bg-green-600 text-white rounded-xl shadow border border-white dark:border-gray-900">
                            <ShieldCheck className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>

                        {/* Tier Badge */}
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border ${currentPlan.style}`}>
                          {currentPlan.label}
                        </span>
                      </div>

                      {/* Name & Details */}
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-gray-950 dark:text-white text-base leading-snug group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {agent.userId?.name || 'LankaLand Member'}
                        </h3>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-gray-400" />
                          {agent.companyName || 'Independent Seller'}
                        </p>
                      </div>

                      {/* Bio */}
                      <p className="text-xs text-gray-600 dark:text-gray-450 mt-4 line-clamp-3 leading-relaxed">
                        {agent.bio || 'Dedicated seller committed to offering transparent property options across Sri Lanka with full coordinate mappings and verified title status.'}
                      </p>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-150/60 dark:border-gray-850/50 space-y-4">
                      {/* Contact metadata */}
                      <div className="space-y-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        {agent.userId?.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            <span>{agent.userId.phone}</span>
                          </div>
                        )}
                        {agent.userId?.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate">{agent.userId.email}</span>
                          </div>
                        )}
                      </div>

                      {/* CTA Action */}
                      <button
                        onClick={() => openListingsModal(agent)}
                        className="w-full py-2.5 bg-green-50 hover:bg-green-600 text-green-700 hover:text-white dark:bg-green-950/20 dark:hover:bg-green-600 dark:text-green-400 dark:hover:text-white border border-green-200/50 dark:border-green-900/30 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all group-hover:shadow-md"
                      >
                        <span>View Land Listings</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Become a verified seller CTA */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl text-center md:text-left">
            <h3 className="font-extrabold text-lg text-gray-950 dark:text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400/20" /> Are You a Property Owner?
            </h3>
            <p className="text-xs sm:text-sm text-gray-650 dark:text-gray-400 leading-relaxed font-medium">
              Submit your credentials via the Seller Portal inside your profile. Get verified to unlock the trust badge marker on your listings, increase visibility, and speed up property closures.
            </p>
          </div>
          <Link
            to="/profile"
            className="px-6 py-3 bg-green-600 text-white rounded-full text-xs font-black uppercase tracking-wider hover:scale-105 hover:bg-green-500 transition-all shadow-md shadow-green-600/20 shrink-0"
          >
            Become a Verified Seller
          </Link>
        </div>

      </div>

      {/* GORGEOUS MODAL OVERLAY: Agent Lands */}
      {activeModalAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md transition-opacity">
          <div className="relative w-full max-w-6xl h-[85vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-150 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center font-black text-green-700 text-base border border-green-100 dark:border-green-900/40">
                  {activeModalAgent.userId?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="font-black text-gray-950 dark:text-white text-lg flex items-center gap-1.5">
                    {activeModalAgent.userId?.name}
                    <ShieldCheck className="w-4.5 h-4.5 text-green-600 fill-green-600/10" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-bold">{activeModalAgent.companyName || 'Independent Seller'} • Active Portfolio</p>
                </div>
              </div>
              
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body (Scrollable Listings Grid) */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-gray-50/30 dark:bg-gray-950/10">
              {loadingListings ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-bold text-gray-500">Loading properties catalog...</span>
                </div>
              ) : modalListings.length === 0 ? (
                <div className="text-center py-24 space-y-4">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                    <LandPlot className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-gray-950 dark:text-white text-base">No Listings Posted Yet</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">This seller does not currently have any active land advertisements online.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modalListings.map((land) => (
                    <LandCard key={land._id} land={land} />
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4.5 border-t border-gray-150 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 dark:bg-gray-950/30 gap-4">
              <div className="text-xs text-gray-500 font-bold">
                Showing {modalListings.length} active approved property listing{modalListings.length === 1 ? '' : 's'}.
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={closeModal}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-xs font-bold transition-all"
                >
                  Close Catalog
                </button>
                {activeModalAgent.userId?.phone && (
                  <a
                    href={`tel:${activeModalAgent.userId.phone}`}
                    className="w-full sm:w-auto px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-green-600/20 hover:scale-102 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    Call {activeModalAgent.userId.name.split(' ')[0]}
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
