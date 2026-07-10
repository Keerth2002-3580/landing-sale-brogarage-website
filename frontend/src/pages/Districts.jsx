import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, ArrowRight, ChevronLeft, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PROVINCES_DATA = [
  {
    name: 'Western',
    districts: ['Colombo', 'Gampaha', 'Kalutara']
  },
  {
    name: 'Central',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya']
  },
  {
    name: 'Southern',
    districts: ['Galle', 'Matara', 'Hambantota']
  },
  {
    name: 'Northern',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu']
  },
  {
    name: 'Eastern',
    districts: ['Trincomalee', 'Batticaloa', 'Ampara']
  },
  {
    name: 'North Western',
    districts: ['Kurunegala', 'Puttalam']
  },
  {
    name: 'North Central',
    districts: ['Anuradhapura', 'Polonnaruwa']
  },
  {
    name: 'Uva',
    districts: ['Badulla', 'Moneragala']
  },
  {
    name: 'Sabaragamuwa',
    districts: ['Ratnapura', 'Kegalle']
  }
];

export default function Districts() {
  const { API_URL } = useAuth();
  const [allLands, setAllLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [districtSearch, setDistrictSearch] = useState('');
  const [activeProvince, setActiveProvince] = useState('All');

  useEffect(() => {
    const fetchLands = async () => {
      try {
        const res = await fetch(`${API_URL}/lands`);
        const data = await res.json();
        if (data.success) {
          setAllLands(data.data);
        }
      } catch (err) {
        console.error('Error fetching lands for districts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
  }, [API_URL]);

  const getDistrictCount = (name) => {
    return allLands.filter(l => 
      l.location && l.location.toLowerCase().includes(name.toLowerCase())
    ).length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Back Button */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Header Block */}
        <div className="bg-gradient-to-tr from-green-600 to-emerald-500 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          {/* Decorative background circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
              <MapPin className="w-3.5 h-3.5" /> Regional Hub
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
              All Sri Lankan Districts
            </h1>
            <p className="text-sm md:text-base text-white/95 leading-relaxed font-medium">
              Browse available land opportunities across all 25 districts of Sri Lanka, categorized by province to help you locate properties in your preferred area.
            </p>
          </div>
        </div>

        {/* Interactive Explorer Directory */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/80 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
          
          {/* Search & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div>
              <h2 className="font-bold text-xl text-gray-900 dark:text-white">Explore Region Directory</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Search districts or filter by province to discover property listings</p>
            </div>
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search district..."
                value={districtSearch}
                onChange={(e) => setDistrictSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-full border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-950 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Province Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
            {['All', ...PROVINCES_DATA.map(p => p.name)].map((prov) => (
              <button
                key={prov}
                onClick={() => setActiveProvince(prov)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  activeProvince === prov
                    ? 'bg-green-600 border-green-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-850 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                }`}
              >
                {prov} {prov !== 'All' ? 'Province' : ''}
              </button>
            ))}
          </div>

          {/* Districts Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {PROVINCES_DATA
                .filter(prov => activeProvince === 'All' || prov.name === activeProvince)
                .flatMap(prov => prov.districts.map(dist => ({ name: dist, province: prov.name })))
                .filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
                .map((d) => {
                  const count = getDistrictCount(d.name);
                  return (
                    <Link
                      key={d.name}
                      to={`/listings?location=${d.name.toLowerCase()}`}
                      className="group flex flex-col justify-between p-5 bg-gray-50/50 hover:bg-white dark:bg-gray-950/30 dark:hover:bg-gray-950 border border-gray-200/50 hover:border-green-500/40 dark:border-gray-900/50 rounded-2xl hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{d.province}</span>
                        <h4 className="font-extrabold text-sm text-gray-800 dark:text-gray-100 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors mt-0.5">{d.name}</h4>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          count > 0 
                            ? 'text-green-600 dark:text-green-400 bg-green-500/10' 
                            : 'text-gray-400 dark:text-gray-555 bg-gray-100 dark:bg-gray-900'
                        }`}>
                          {count} {count === 1 ? 'Ad' : 'Ads'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
