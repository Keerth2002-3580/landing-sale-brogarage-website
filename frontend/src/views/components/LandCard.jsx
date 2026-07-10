import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Heart, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const categoryImages = {
  residential: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  agriculture: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
};

const categoryLabels = {
  residential: 'Residential',
  commercial: 'Commercial',
  agriculture: 'Agriculture',
};

const categoryBadgeColors = {
  residential: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-100/70 dark:border-emerald-900/30',
  commercial: 'bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-100/70 dark:border-blue-900/30',
  agriculture: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-100/70 dark:border-amber-900/30',
};

export default function LandCard({ land }) {
  const { user, toggleFavorite } = useAuth();
  
  const isFavorited = user && user.favorites && (
    user.favorites.some(fav => fav === land._id || fav._id === land._id)
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = () => {
    if (land.images && land.images.length > 0) {
      if (land.images[0].startsWith('http')) {
        return land.images[0];
      }
      return `http://localhost:5000/uploads/${land.images[0]}`;
    }
    return categoryImages[land.category] || categoryImages.residential;
  };

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(land._id);
  };

  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-805/50 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      {/* Listing Status Tag (Only shows if sold or pending) */}
      {land.status !== 'approved' && land.status !== 'sold' && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-md">
          {land.status}
        </span>
      )}
      {land.status === 'sold' && (
        <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-600 text-white shadow-md">
          Sold
        </span>
      )}

      {/* Featured Badge */}
      {land.isFeatured && land.status === 'approved' && (
        <span className="absolute top-4 left-4 z-10 flex items-center gap-1 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-gray-900/90 text-amber-400 border border-amber-500/20 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
          Featured
        </span>
      )}

      {/* Save Button */}
      {user && (
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full transition-all backdrop-blur-md shadow-sm border ${
            isFavorited
              ? 'bg-red-500 border-red-400 text-white'
              : 'bg-white/70 hover:bg-white text-gray-700 border-white/20 dark:bg-gray-900/60 dark:hover:bg-gray-900/80 dark:text-gray-200 dark:border-gray-805'
          }`}
          aria-label="Add to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Image Gallery Mock / Cover */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-50 dark:bg-gray-850">
        <img
          src={getImageUrl()}
          alt={land.title}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = categoryImages[land.category] || categoryImages.residential;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Category & Size */}
        <div className="flex items-center justify-between mb-3.5">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${categoryBadgeColors[land.category]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              land.category === 'residential' ? 'bg-emerald-500' : land.category === 'commercial' ? 'bg-blue-500' : 'bg-amber-500'
            }`} />
            {categoryLabels[land.category]}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-gray-55 dark:bg-gray-805/50 text-gray-500 dark:text-gray-400 border border-gray-150/60 dark:border-gray-808/30">
            <Maximize className="w-3 h-3 text-gray-400" />
            {land.size} {land.sizeUnit === 'perch' ? 'Perch' : 'Acre'}
          </span>
        </div>

        {/* Title */}
        <Link to={`/listings/${land._id}`} className="block group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors duration-200">
          <h3 className="text-[15px] font-bold text-gray-900 dark:text-gray-50 line-clamp-2 leading-snug tracking-tight min-h-[2.5rem]">
            {land.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-2.5 text-xs text-gray-550 dark:text-gray-400">
          <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <span className="line-clamp-1 font-medium">{land.location}</span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-150/60 dark:border-gray-805/40 mt-5">
          <div>
            <span className="block text-[17px] font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
              {formatPrice(land.price)}
            </span>
            <span className="block text-[9px] font-bold text-gray-400 dark:text-gray-550 mt-1.5 uppercase tracking-wider">
              {land.sizeUnit === 'perch' ? 'per perch' : 'total price'}
            </span>
          </div>
          
          <Link
            to={`/listings/${land._id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 group/btn"
          >
            <span>Details</span>
            <div className="w-7 h-7 rounded-full bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 group-hover:bg-green-600 group-hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm border border-green-100/10">
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-250 group-hover/btn:translate-x-0.5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
