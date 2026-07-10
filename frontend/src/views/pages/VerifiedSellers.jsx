import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ShieldCheck, Phone, Mail, Building2, Sparkles, X,
  LandPlot, ArrowRight, Star, Users, Award, TrendingUp, BadgeCheck,
  ChevronLeft, Crown, Gem, Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LandCard from '../components/LandCard';

const PLAN_CONFIG = {
  pro: {
    label: 'Pro Seller',
    icon: <Crown className="w-3 h-3" />,
    badge: 'from-violet-600 to-purple-700',
    ring: 'ring-violet-400/30',
    accent: 'text-violet-500',
    bg: 'from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20',
    border: 'border-violet-200/60 dark:border-violet-800/30',
  },
  premium: {
    label: 'Premium',
    icon: <Gem className="w-3 h-3" />,
    badge: 'from-sky-500 to-blue-600',
    ring: 'ring-sky-400/30',
    accent: 'text-sky-500',
    bg: 'from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20',
    border: 'border-sky-200/60 dark:border-sky-800/30',
  },
  free: {
    label: 'Verified',
    icon: <BadgeCheck className="w-3 h-3" />,
    badge: 'from-emerald-500 to-green-600',
    ring: 'ring-emerald-400/30',
    accent: 'text-emerald-500',
    bg: 'from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20',
    border: 'border-emerald-200/60 dark:border-emerald-800/30',
  },
};

const TIER_TABS = [
  { id: 'all',     label: 'All Sellers',    icon: <Users className="w-3.5 h-3.5" /> },
  { id: 'pro',     label: 'Pro',            icon: <Crown className="w-3.5 h-3.5" /> },
  { id: 'premium', label: 'Premium',        icon: <Gem className="w-3.5 h-3.5" /> },
  { id: 'free',    label: 'Verified',       icon: <BadgeCheck className="w-3.5 h-3.5" /> },
];

export default function VerifiedSellers() {
  const { API_URL } = useAuth();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('all');
  const [activeModalAgent, setActiveModalAgent] = useState(null);
  const [modalListings, setModalListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${API_URL}/agents`);
        const data = await res.json();
        if (data.success) setAgents(data.data);
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
      if (data.success && data.data) setModalListings(data.data.lands || []);
    } catch (err) {
      console.error('Error fetching agent listings:', err);
    } finally {
      setLoadingListings(false);
    }
  };

  const closeModal = () => { setActiveModalAgent(null); setModalListings([]); };

  const filteredAgents = agents.filter((a) => {
    const name = a.userId?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const company = a.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    const plan = selectedPlan === 'all' || a.subscriptionPlan === selectedPlan;
    return (name || company) && plan;
  });

  return (
    <div className="min-h-screen bg-[#edf6f2] dark:bg-[#07130e] transition-colors">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden pt-32 pb-20" style={{ background: '#001a0f' }}>

        {/* ── Scrolling Background Images ── */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Row 1 — scrolls left → right */}
          <div
            className="absolute top-0 left-0 flex h-1/2"
            style={{ animation: 'hero-marquee 35s linear infinite', width: 'max-content' }}
          >
            {[
              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80',
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80',
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80',
              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=700&q=80',
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
              /* duplicate for seamless loop */
              'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=700&q=80',
              'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=700&q=80',
              'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=700&q=80',
              'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=700&q=80',
              'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="h-full object-cover shrink-0 opacity-65" style={{ width: '320px' }} loading="lazy" />
            ))}
          </div>

          {/* Row 2 — scrolls right → left (opposite direction) */}
          <div
            className="absolute bottom-0 left-0 flex h-1/2"
            style={{ animation: 'hero-marquee-rev 40s linear infinite', width: 'max-content' }}
          >
            {[
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80',
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80',
              'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=700&q=80',
              'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=700&q=80',
              'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=700&q=80',
              /* duplicate */
              'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=700&q=80',
              'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&q=80',
              'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=700&q=80',
              'https://images.unsplash.com/photo-1416331108676-a22ccb276e35?w=700&q=80',
              'https://images.unsplash.com/photo-1464082354059-27db6ce50048?w=700&q=80',
            ].map((src, i) => (
              <img key={i} src={src} alt="" className="h-full object-cover shrink-0 opacity-55" style={{ width: '320px' }} loading="lazy" />
            ))}
          </div>

          {/* Dark gradient overlay — makes text readable */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#001a0f]/80 via-[#002d1a]/60 to-[#001a0f]/80 pointer-events-none" />
          {/* Vignette edges */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#001a0f_90%)] pointer-events-none" />
        </div>

        {/* CSS keyframes for hero */}
        <style>{`
          @keyframes hero-marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes hero-marquee-rev {
            0%   { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}</style>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400/70 hover:text-emerald-300 mb-8 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Home
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold tracking-widest uppercase backdrop-blur-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Identity-Verified Sellers
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.08] tracking-tight">
                Land Sellers
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
                  You Can Trust
                </span>
              </h1>

              <p className="text-gray-400 text-base leading-relaxed max-w-lg">
                Every seller on LandMark is verified using National Identity credentials and land deed documentation. Browse with confidence.
              </p>

              {/* Mini Stats */}
              <div className="flex flex-wrap gap-6 pt-2">
                {[
                  { icon: <Users className="w-4 h-4 text-emerald-400" />, value: agents.length, label: 'Verified Sellers' },
                  { icon: <ShieldCheck className="w-4 h-4 text-sky-400" />, value: '100%', label: 'Identity Checked' },
                  { icon: <TrendingUp className="w-4 h-4 text-amber-400" />, value: '0%', label: 'Commission' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-white font-black text-lg leading-none">{s.value}</div>
                      <div className="text-gray-500 text-[11px] font-medium mt-0.5">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side: floating tier cards preview */}
            <div className="hidden lg:flex flex-col gap-4 items-end">
              {Object.entries(PLAN_CONFIG).map(([key, plan]) => (
                <div
                  key={key}
                  className="flex items-center gap-4 px-5 py-4 rounded-2xl w-68 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg shadow-black/20"
                  style={{ width: '270px' }}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${plan.badge} flex items-center justify-center text-white shadow-md shrink-0`}>
                    {plan.icon}
                  </div>
                  <div className="flex-grow">
                    <div className="text-white font-bold text-sm">{plan.label}</div>
                    <div className="text-white/40 text-[11px] mt-0.5">Verified tier seller</div>
                  </div>
                  <ShieldCheck className={`w-4 h-4 ${plan.accent} ml-auto`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-900/80 border border-gray-200/60 dark:border-gray-800/60 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center justify-between shadow-sm backdrop-blur-sm">
          {/* Tier Tabs */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800/60 rounded-xl p-1">
            {TIER_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPlan(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  selectedPlan === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search seller or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Showing <span className="text-gray-900 dark:text-white font-bold">{filteredAgents.length}</span> verified seller{filteredAgents.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* ── Seller Cards Grid ─────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
              <Search className="w-7 h-7 text-gray-400" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">No Sellers Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Try adjusting your search or filter to find other verified members.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => {
              const plan = PLAN_CONFIG[agent.subscriptionPlan] || PLAN_CONFIG.free;
              const initial = agent.userId?.name?.charAt(0).toUpperCase() || 'S';

              return (
                <div
                  key={agent._id}
                  className="group relative bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-800/60 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/60 dark:hover:shadow-black/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Top color strip */}
                  <div className={`h-1 w-full bg-gradient-to-r ${plan.badge}`} />

                  <div className="p-6 flex flex-col h-full">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-5">
                      {/* Avatar */}
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl ring-2 ${plan.ring} overflow-hidden shadow-sm`}>
                          {agent.userId?.avatar ? (
                            <img src={agent.userId.avatar} alt={agent.userId.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${plan.badge} flex items-center justify-center text-white text-xl font-black`}>
                              {initial}
                            </div>
                          )}
                        </div>
                        {/* Verified dot */}
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                          <ShieldCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>

                      {/* Tier badge */}
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r ${plan.badge} text-white text-[10px] font-black uppercase tracking-wider shadow-sm`}>
                        {plan.icon}
                        {plan.label}
                      </span>
                    </div>

                    {/* Name & Company */}
                    <div className="space-y-1 mb-3">
                      <h3 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {agent.userId?.name || 'LandMark Member'}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        {agent.companyName || 'Independent Seller'}
                      </p>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 flex-grow">
                      {agent.bio || 'Dedicated to providing transparent land opportunities across Sri Lanka with verified title deeds.'}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

                    {/* Contact */}
                    <div className="space-y-2 mb-4">
                      {agent.userId?.phone && (
                        <a href={`tel:${agent.userId.phone}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium group/link">
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          {agent.userId.phone}
                        </a>
                      )}
                      {agent.userId?.email && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500 font-medium">
                          <div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                          <span className="truncate">{agent.userId.email}</span>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => openListingsModal(agent)}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all bg-gradient-to-r ${plan.badge} text-white hover:opacity-90 hover:shadow-md active:scale-[0.98]`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      View Listings
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Become a Seller CTA ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1f15] via-[#0d2b1c] to-[#071610] border border-white/5 shadow-2xl" style={{ minHeight: '240px' }}>

          {/* Scrolling image strip on the LEFT */}
          <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
            {/* Dark overlay fade → right */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0d2b1c] z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/30 z-10 pointer-events-none" />

            {/* Scrolling track */}
            <div
              className="flex h-full"
              style={{
                animation: 'marquee-x 28s linear infinite',
                width: 'max-content',
              }}
            >
              {[
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80',
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80',
                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&q=80',
                /* duplicate for seamless loop */
                'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&q=80',
                'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80',
                'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=500&q=80',
                'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&q=80',
                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=500&q=80',
              ].map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="h-full object-cover shrink-0"
                  style={{ width: '220px' }}
                  loading="lazy"
                />
              ))}
            </div>
          </div>

          {/* CSS keyframe injected inline */}
          <style>{`
            @keyframes marquee-x {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>

          {/* RIGHT: Text + CTA */}
          <div className="relative ml-auto w-full md:w-1/2 flex items-center justify-end px-8 md:px-12 py-10 z-20">
            <div className="space-y-5 max-w-sm text-right">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Property Owner?
              </div>

              {/* Heading */}
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight">
                Get Verified &amp;
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-green-400">
                  Sell Faster
                </span>
              </h3>

              {/* Description */}
              <p className="text-white/60 text-sm leading-relaxed">
                Submit your NIC and land deed documents via your Seller Portal. Earn the verified badge and close deals with zero commission.
              </p>

              {/* Stats row */}
              <div className="flex items-center justify-end gap-6">
                {[
                  { val: '0%', label: 'Commission' },
                  { val: '24h', label: 'Verification' },
                  { val: '100%', label: 'Secure' },
                ].map((s) => (
                  <div key={s.val} className="text-right">
                    <div className="text-white font-black text-lg leading-none">{s.val}</div>
                    <div className="text-white/40 text-[10px] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex justify-end">
                <Link
                  to="/profile?tab=seller"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-white text-sm font-black hover:from-emerald-400 hover:to-green-400 transition-all shadow-xl shadow-emerald-900/40 hover:scale-105 active:scale-100"
                >
                  <Award className="w-4 h-4" />
                  Become a Verified Seller
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Listings Modal ─────────────────────────────────────────────────── */}
      {activeModalAgent && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full sm:max-w-6xl max-h-[92vh] sm:max-h-[85vh] bg-white dark:bg-gray-900 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-800/50">

            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0 bg-gray-50/70 dark:bg-gray-950/40">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${(PLAN_CONFIG[activeModalAgent.subscriptionPlan] || PLAN_CONFIG.free).badge} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                  {activeModalAgent.userId?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
                    {activeModalAgent.userId?.name}
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                    {activeModalAgent.companyName || 'Independent Seller'} · Active Portfolio
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 md:p-8">
              {loadingListings ? (
                <div className="flex flex-col items-center justify-center py-28 space-y-4">
                  <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-semibold text-gray-400">Loading properties...</span>
                </div>
              ) : modalListings.length === 0 ? (
                <div className="text-center py-24 space-y-3">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                    <LandPlot className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                  </div>
                  <h4 className="font-black text-gray-900 dark:text-white">No Listings Yet</h4>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">This seller has no active land listings at the moment.</p>
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
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-950/30 shrink-0">
              <p className="text-xs text-gray-500 font-medium">
                {modalListings.length} active listing{modalListings.length !== 1 ? 's' : ''} in portfolio
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={closeModal}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  Close
                </button>
                {activeModalAgent.userId?.phone && (
                  <a
                    href={`tel:${activeModalAgent.userId.phone}`}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition hover:scale-105 active:scale-100"
                  >
                    <Phone className="w-3.5 h-3.5" />
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
