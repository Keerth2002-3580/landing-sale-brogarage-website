import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LandCard from '../components/LandCard';
import MapView from '../components/MapView';
import { Search, SlidersHorizontal, MapPin, Grid, Map as MapIcon, X } from 'lucide-react';

export default function Listings() {
  const { API_URL } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState('split'); // split, list, map
  const [showMap, setShowMap] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 12 });

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minSize, setMinSize] = useState(searchParams.get('minSize') || '');
  const [maxSize, setMaxSize] = useState(searchParams.get('maxSize') || '');
  const [sizeUnit, setSizeUnit] = useState(searchParams.get('sizeUnit') || 'perch');
  const [isFeatured, setIsFeatured] = useState(searchParams.get('isFeatured') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'createdAt:desc');

  useEffect(() => {
    // Sync filters from URL search params when it changes
    setSearch(searchParams.get('search') || '');
    setLocation(searchParams.get('location') || '');
    setCategory(searchParams.get('category') || '');
    setMinPrice(searchParams.get('minPrice') || '');
    setMaxPrice(searchParams.get('maxPrice') || '');
    setMinSize(searchParams.get('minSize') || '');
    setMaxSize(searchParams.get('maxSize') || '');
    setSizeUnit(searchParams.get('sizeUnit') || 'perch');
    setIsFeatured(searchParams.get('isFeatured') || '');
    setSort(searchParams.get('sort') || 'createdAt:desc');
  }, [searchParams]);

  useEffect(() => {
    const fetchLands = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams(searchParams);
        const res = await fetch(`${API_URL}/lands?${queryParams.toString()}`);
        const data = await res.json();
        if (data.success) {
          setLands(data.data);
          if (data.pagination) {
            setPagination(data.pagination);
          }
        }
      } catch (err) {
        console.error('Error fetching lands:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLands();
  }, [searchParams, API_URL]);

  const handlePageChange = (newPage) => {
    const updatedParams = Object.fromEntries(searchParams);
    updatedParams.page = newPage;
    setSearchParams(updatedParams);
  };

  const applyFilters = () => {
    const params = {};
    if (search) params.search = search;
    if (location) params.location = location;
    if (category) params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (minSize) params.minSize = minSize;
    if (maxSize) params.maxSize = maxSize;
    if (sizeUnit) params.sizeUnit = sizeUnit;
    if (isFeatured) params.isFeatured = isFeatured;
    if (sort) params.sort = sort;

    setSearchParams(params);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinSize('');
    setMaxSize('');
    setSizeUnit('perch');
    setIsFeatured('');
    setSort('createdAt:desc');
    setSearchParams({});
    setShowMobileFilters(false);
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col">
      {/* Premium Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-850 text-white pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-green-500/15 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 inline-block">
            Sri Lanka Premium Zoned Catalog
          </span>
          <h1 className="text-3xl sm:text-4.5xl font-black tracking-tight leading-tight">
            Discover Verified Land Listings
          </h1>
          <p className="text-sm text-green-100/90 max-w-2xl leading-relaxed">
            Browse through commercial acreage, beachfront holdings, and residential plots vetted by property specialists across the island.
          </p>
        </div>
      </div>

      {/* Quick Category tabs & Controls */}
      <div className="bg-white dark:bg-gray-950 border-b border-gray-150 dark:border-gray-900 transition-colors py-3 sticky top-[64px] z-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => {
                setCategory('');
                const updatedParams = Object.fromEntries(searchParams);
                delete updatedParams.category;
                setSearchParams(updatedParams);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
                !category
                  ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              All Plots
            </button>
            <button
              onClick={() => {
                setCategory('residential');
                setSearchParams({ ...Object.fromEntries(searchParams), category: 'residential' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
                category === 'residential'
                  ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              🏡 Residential
            </button>
            <button
              onClick={() => {
                setCategory('commercial');
                setSearchParams({ ...Object.fromEntries(searchParams), category: 'commercial' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
                category === 'commercial'
                  ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              🏢 Commercial
            </button>
            <button
              onClick={() => {
                setCategory('agriculture');
                setSearchParams({ ...Object.fromEntries(searchParams), category: 'agriculture' });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border shrink-0 ${
                category === 'agriculture'
                  ? 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              🌾 Agricultural
            </button>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Desktop show/hide map toggle */}
            <button
              onClick={() => setShowMap(!showMap)}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-extrabold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-sm transition-colors"
            >
              <MapIcon className="w-4 h-4 text-green-600" />
              <span>{showMap ? 'Hide Map' : 'Show Map'}</span>
            </button>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-800"
            >
              <SlidersHorizontal className="w-4 h-4 text-green-600" />
              Filters
            </button>

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                const updatedParams = Object.fromEntries(searchParams);
                updatedParams.sort = e.target.value;
                setSearchParams(updatedParams);
              }}
              className="px-3.5 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-extrabold bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-0 focus:outline-none"
            >
              <option value="createdAt:desc">Newest First</option>
              <option value="price:asc">Price: Low to High</option>
              <option value="price:desc">Price: High to Low</option>
              <option value="size:asc">Size: Small to Large</option>
              <option value="size:desc">Size: Large to Small</option>
            </select>

            {/* Mobile View Mode switcher */}
            <div className="flex bg-gray-100 dark:bg-gray-900 p-0.5 rounded-xl border border-gray-200 dark:border-gray-800 lg:hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'text-gray-500'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-white dark:bg-gray-800 shadow text-green-600' : 'text-gray-500'}`}
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Split Panel */}
      <div className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-4 lg:px-6 py-6 gap-6">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0 space-y-6">
          <div className="sticky top-[150px] bg-white dark:bg-gray-900 p-6 border border-gray-150 dark:border-gray-850 rounded-2xl space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b pb-3 border-gray-100 dark:border-gray-800">
              <h2 className="font-extrabold text-sm uppercase text-gray-900 dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-green-600" />
                Refine Search
              </h2>
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline font-semibold">
                Clear
              </button>
            </div>

            {/* Keyword */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Keyword</label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Bare land..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="City name..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agriculture">Agriculture</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Price Range (LKR)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-955 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-955 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Size Range */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Size Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  className="w-1/3 px-2 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-955 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  className="w-1/3 px-2 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-955 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value)}
                  className="w-1/3 px-1 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-955 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="perch">Perch</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
            </div>

            {/* Featured Only */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="featChk"
                checked={isFeatured === 'true'}
                onChange={(e) => setIsFeatured(e.target.checked ? 'true' : '')}
                className="rounded border-gray-300 dark:border-gray-800 text-green-600 focus:ring-green-500 h-4 w-4"
              />
              <label htmlFor="featChk" className="text-xs font-bold text-gray-650 dark:text-gray-400 cursor-pointer">
                Featured Ads Only
              </label>
            </div>

            <button
              onClick={applyFilters}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </aside>

        {/* Listings and Map Area */}
        <div className="flex-grow flex flex-col lg:flex-row gap-6">
          {/* Card Grid list */}
          <div className={`w-full ${viewMode === 'map' ? 'hidden' : ''} ${showMap ? 'lg:w-[60%]' : 'lg:w-full'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400">
                Found <span className="text-gray-900 dark:text-white font-extrabold">{pagination.total}</span> verified plots of land
              </h2>
            </div>

            {loading ? (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${showMap ? '' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white dark:bg-gray-900 border rounded-2xl aspect-[9/10] animate-pulse" />
                ))}
              </div>
            ) : lands.length > 0 ? (
              <div className="space-y-8">
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${showMap ? '' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                  {lands.map((land) => (
                    <LandCard key={land._id} land={land} />
                  ))}
                </div>
                {/* Pagination Controls */}
                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-6 border-t border-gray-155 dark:border-gray-800">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3.5 py-2 border rounded-xl text-xs font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-gray-305 transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-colors ${
                          pagination.page === p
                            ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                            : 'border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 text-gray-700 dark:text-gray-305 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                      className="px-3.5 py-2 border rounded-xl text-xs font-bold bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-white text-gray-700 dark:text-gray-305 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl">
                <SlidersHorizontal className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">No listings match filters</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your size parameters, clearing keywords, or browsing all regions.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 px-5 py-2 border rounded-xl text-xs font-bold bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-900"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Leaflet Map panel */}
          <div
            className={`w-full relative ${
              viewMode === 'list'
                ? 'hidden lg:block lg:w-[40%]'
                : viewMode === 'split'
                ? 'lg:w-[40%]'
                : ''
            } ${showMap ? 'lg:block lg:w-[40%]' : 'lg:hidden'}`}
          >
            <div className="sticky top-[195px] h-[550px] lg:h-[calc(100vh-280px)] rounded-2xl overflow-hidden shadow-lg border border-gray-150 dark:border-gray-800">
              <MapView lands={lands} height="100%" zoom={10} />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mobile Filter Modal Overlay */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden flex items-end justify-center">
          <div className="bg-white dark:bg-gray-900 w-full rounded-t-3xl max-h-[85vh] overflow-y-auto p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Keyword */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="e.g. coconut estate..."
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Colombo, Negombo, Galle..."
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agriculture">Agriculture</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Price Range (LKR)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Size Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  className="w-1/3 px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  className="w-1/3 px-3 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value)}
                  className="w-1/3 px-2 py-2.5 border rounded-xl text-sm bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:outline-none"
                >
                  <option value="perch">Perch</option>
                  <option value="acre">Acre</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={clearFilters}
                className="w-1/2 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold"
              >
                Clear All
              </button>
              <button
                onClick={applyFilters}
                className="w-1/2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
