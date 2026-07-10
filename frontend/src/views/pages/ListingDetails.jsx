import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MapView from '../components/MapView';
import { MapPin, Maximize, Calendar, Eye, Send, ArrowLeft, ShieldCheck, Mail, Phone, Heart, ChevronUp, ChevronDown } from 'lucide-react';
import io from 'socket.io-client';

const categoryImages = {
  residential: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=600&q=80',
  commercial: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
  agriculture: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
};

const getTagsForLand = (land) => {
  const tags = [];
  
  if (land.category === 'residential') {
    tags.push('Residential', 'Freehold Land', 'Country Homes', 'Houses with Land', 'Cottages');
  } else if (land.category === 'commercial') {
    tags.push('Commercial', 'Freehold Land', 'Workshops', 'Outbuildings', 'High Exposure');
  } else if (land.category === 'agriculture') {
    tags.push('Agriculture', 'Country Estates', 'Barns', 'Rural properties', 'Riparian Land');
  }

  if (land.size >= 5 && land.sizeUnit === 'acre') {
    tags.push('Large acreage', 'Country Estates');
  } else {
    tags.push('Private Plot');
  }

  const textToSearch = `${land.title} ${land.description}`.toLowerCase();
  if (textToSearch.includes('lake') || textToSearch.includes('lagoon')) {
    tags.push('Lakes', 'Lakefront properties', 'Waterfront properties');
  }
  if (textToSearch.includes('river') || textToSearch.includes('stream') || textToSearch.includes('canal') || textToSearch.includes('water')) {
    tags.push('Riparian Land', 'Private Water Supply');
  }
  if (textToSearch.includes('beach') || textToSearch.includes('sea') || textToSearch.includes('ocean')) {
    tags.push('Waterfront properties', 'Beach Access');
  }
  if (textToSearch.includes('septic') || textToSearch.includes('sewer') || textToSearch.includes('drain')) {
    tags.push('Septic System Land');
  }
  if (textToSearch.includes('workshop') || textToSearch.includes('garage') || textToSearch.includes('store')) {
    tags.push('Workshops', 'Outbuildings');
  }
  if (textToSearch.includes('villa') || textToSearch.includes('house') || textToSearch.includes('home')) {
    tags.push('Stately Homes');
  }

  return Array.from(new Set(tags));
};

export default function ListingDetails() {
  const { id } = useParams();
  const { user, token, API_URL, toggleFavorite, openLoginModal } = useAuth();
  const navigate = useNavigate();

  const [land, setLand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [utilitiesExpanded, setUtilitiesExpanded] = useState(true);
  
  // Ref for smooth scroll
  const chatBoxRef = useRef(null);

  // Helper for utilities checks
  const getUtilityStatus = (val) => {
    return val || 'Ask Seller';
  };

  const getStatusColor = (status) => {
    if (status === 'Available') return 'text-green-600 font-bold dark:text-green-400';
    if (status === 'Not Available') return 'text-red-500 font-bold dark:text-red-400';
    return 'text-gray-500 dark:text-gray-400 font-semibold';
  };

  // Chat/Messaging States
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  const isFavorited = user && user.favorites && (
    user.favorites.some(fav => fav === id || fav._id === id)
  );

  // Fetch land details
  useEffect(() => {
    const fetchLand = async () => {
      try {
        const res = await fetch(`${API_URL}/lands/${id}`);
        const data = await res.json();
        if (data.success) {
          setLand(data.data);
        } else {
          navigate('/listings');
        }
      } catch (err) {
        console.error('Error fetching land details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLand();
  }, [id, API_URL, navigate]);

  // Fetch chat messages if logged in and not the owner
  useEffect(() => {
    if (!token || !land || !user || land.owner._id === user.id) return;

    // Fetch initial chat history
    const fetchChatMessages = async () => {
      try {
        const res = await fetch(`${API_URL}/messages/chat/${land.owner._id}/${land._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchChatMessages();

    // Connect to Socket.io
    socketRef.current = io('http://localhost:5000');
    socketRef.current.emit('join', user.id);

    // Listen for incoming messages
    socketRef.current.on('message_received', (msg) => {
      if (msg.landId._id === land._id) {
        const isRelated =
          (msg.sender._id === land.owner._id && msg.receiver._id === user.id) ||
          (msg.sender._id === user.id && msg.receiver._id === land.owner._id);

        if (isRelated) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, land, user, API_URL]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !token || !land) return;

    setChatLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: land.owner._id,
          landId: land._id,
          content: newMessage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, data.data]);
        setNewMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setChatLoading(false);
    }
  };

  const getImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `http://localhost:5000/uploads/${img}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // 12% annual interest over 15 years, 80% loan amount
  const calculateEstimatedMortgage = (totalPrice) => {
    const principal = totalPrice * 0.8;
    const annualRate = 0.12;
    const payments = 15 * 12;
    const monthlyRate = annualRate / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, payments)) / (Math.pow(1 + monthlyRate, payments) - 1);
    return Math.round(monthlyPayment);
  };

  const handleTagClick = (tag) => {
    const lowerTag = tag.toLowerCase();
    if (lowerTag === 'residential') {
      navigate('/listings?category=residential');
    } else if (lowerTag === 'commercial') {
      navigate('/listings?category=commercial');
    } else if (lowerTag === 'agriculture') {
      navigate('/listings?category=agriculture');
    } else {
      navigate(`/listings?search=${encodeURIComponent(tag)}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500" />
      </div>
    );
  }

  if (!land) return null;

  const isOwner = user && user.id === land.owner._id;

  // Swapping image order so that active thumbnail is always main image
  const imagesToShow = [...(land.images || [])];
  if (imagesToShow.length > 0) {
    const temp = imagesToShow[0];
    imagesToShow[0] = imagesToShow[activeImage] || temp;
    imagesToShow[activeImage] = temp;
  }
  while (imagesToShow.length < 3) {
    imagesToShow.push(categoryImages[land.category]);
  }
  const remainingImages = Math.max(0, (land.images?.length || 0) - 3);

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-8 space-y-8">
      {/* Top Bar: Back to Listings & Share / Save */}
      <div className="flex items-center justify-between">
        <Link to="/listings" className="inline-flex items-center gap-1.5 text-xs font-black text-gray-500 hover:text-green-600 transition-colors uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" />
          Back to listings
        </Link>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-sm transition-colors">
            Share ad
          </button>
          {user && (
            <button
              onClick={() => toggleFavorite(land._id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 border rounded-xl text-xs font-bold shadow-sm transition-all ${
                isFavorited
                  ? 'bg-red-50 border-red-200 text-red-550 dark:bg-red-950/20 dark:border-red-950 dark:text-red-400'
                  : 'bg-white border-gray-200 text-gray-600 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 hover:bg-gray-50'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
              <span>{isFavorited ? 'Saved' : 'Save ad'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Premium 3-Column Image & Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[250px] sm:h-[350px] lg:h-[450px]">
        {/* Column 1 (Left 2 spans): Main Large Image */}
        <div className="md:col-span-2 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 relative group">
          <img
            src={imagesToShow[0] ? getImageUrl(imagesToShow[0]) : categoryImages[land.category]}
            alt={land.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-500 cursor-pointer"
            onClick={() => setActiveImage(0)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = categoryImages[land.category];
            }}
          />
          {land.isFeatured && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-yellow-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-md">
              Featured Listing
            </span>
          )}
        </div>

        {/* Column 2 (Middle 1 span): Stacked Thumbnail images */}
        <div className="hidden md:grid grid-rows-2 gap-4">
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 relative group">
            <img
              src={getImageUrl(imagesToShow[1])}
              alt={land.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 cursor-pointer"
              onClick={() => setActiveImage(1)}
            />
          </div>

          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-850 border border-gray-150 dark:border-gray-800 relative group">
            <img
              src={getImageUrl(imagesToShow[2])}
              alt={land.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500 cursor-pointer"
              onClick={() => setActiveImage(2)}
            />
            {remainingImages > 0 && (
              <div
                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white font-black text-xs cursor-pointer group-hover:bg-black/70 transition-all"
                onClick={() => setActiveImage(2)}
              >
                <span className="text-sm">+{remainingImages} others</span>
                <span className="text-[9px] font-medium opacity-80 mt-1 uppercase tracking-wider">Click to view</span>
              </div>
            )}
          </div>
        </div>

        {/* Column 3 (Right 1 span): Embedded Leaflet Map */}
        <div className="rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-850 h-full relative shadow-sm">
          <MapView lands={[land]} zoom={13} height="100%" />
          <div className="absolute bottom-4 left-4 z-[400]">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${land.coordinates?.lat || 6.9271},${land.coordinates?.lng || 79.8612}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 font-extrabold rounded-xl text-[10px] shadow-lg border transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-green-600" />
              Directions View
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Details Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Specifications, Key Features, Description */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-2xl sm:text-3.5xl font-black text-green-600 dark:text-green-400">
                  {formatPrice(land.price)}
                </span>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest ml-2 bg-gray-50 dark:bg-gray-850 px-2 py-0.5 rounded-full inline-block border dark:border-gray-800">
                  {land.sizeUnit === 'perch' ? 'per perch' : 'total price'}
                </span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Est. Mortgage Payment</span>
                <span className="text-sm font-extrabold text-gray-800 dark:text-gray-300">
                  LKR {calculateEstimatedMortgage(land.price).toLocaleString()}/month
                </span>
              </div>
            </div>

            <div className="border-t dark:border-gray-850 pt-4 space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white leading-tight">
                {land.title}
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-450" />
                <span>{land.address || `${land.location}, Sri Lanka`}</span>
              </p>
            </div>

            {/* Specs ribbon */}
            <div className="flex flex-wrap items-center gap-6 border-t dark:border-gray-850 pt-4 text-xs font-bold text-gray-550 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4 text-green-600" />
                <span>{land.size} {land.sizeUnit === 'perch' ? 'Perches' : 'Acres'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="capitalize">{land.category} Plot</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-green-600" />
                <span>{land.views} Views</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-green-600" />
                <span>{new Date(land.createdAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Key Features Block */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Key Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-650 dark:text-gray-350">
              <li className="list-disc pl-1 font-medium leading-relaxed">Premium {land.category} zoned land development</li>
              <li className="list-disc pl-1 font-medium leading-relaxed">Spacious block layout size: {land.size} {land.sizeUnit}s</li>
              <li className="list-disc pl-1 font-medium leading-relaxed">Highly accessible location inside {land.location}</li>
              <li className="list-disc pl-1 font-medium leading-relaxed">Fully vetted clear title deeds ready for transfer</li>
              <li className="list-disc pl-1 font-medium leading-relaxed">Direct road access with tap water & electricity ready</li>
              <li className="list-disc pl-1 font-medium leading-relaxed">Excellent capital appreciation growth rate</li>
            </div>
          </div>

          {/* Description Block */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h3>
            <div className="text-xs leading-relaxed text-gray-650 dark:text-gray-350 whitespace-pre-line">
              {showFullDesc ? land.description : `${land.description.slice(0, 300)}${land.description.length > 300 ? '...' : ''}`}
            </div>
            {land.description.length > 300 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline inline-flex items-center gap-1 mt-2 transition-all"
              >
                {showFullDesc ? 'Show Less' : 'Show More'}
              </button>
            )}
          </div>

          {/* Property Feature tags */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Property Categories & Features</h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {getTagsForLand(land).map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => handleTagClick(tag)}
                  className="px-3.5 py-2 bg-gray-100 hover:bg-green-600 hover:text-white dark:bg-gray-850 dark:hover:bg-green-650 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Utilities & Restrictions Accordion */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setUtilitiesExpanded(!utilitiesExpanded)}
              className="w-full px-6 py-5 flex items-center justify-between font-bold text-gray-900 dark:text-white border-b border-transparent dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-gray-850/10 transition-colors"
            >
              <span className="text-sm font-black uppercase tracking-wider text-gray-450">Utilities & Restrictions</span>
              <span className="text-gray-400">
                {utilitiesExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </span>
            </button>

            {utilitiesExpanded && (
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs border-t dark:border-gray-850 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Utilities column */}
                <div className="space-y-3.5">
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider pb-1.5 border-b dark:border-gray-800">Utilities</h4>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Electricity</span>
                    <span className={getStatusColor(getUtilityStatus(land.utilities?.electricity))}>
                      {getUtilityStatus(land.utilities?.electricity)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Water</span>
                    <span className={getStatusColor(getUtilityStatus(land.utilities?.water))}>
                      {getUtilityStatus(land.utilities?.water)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Heating</span>
                    <span className={getStatusColor(getUtilityStatus(land.utilities?.heating))}>
                      {getUtilityStatus(land.utilities?.heating)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Broadband</span>
                    <span className={getStatusColor(getUtilityStatus(land.utilities?.broadband))}>
                      {getUtilityStatus(land.utilities?.broadband)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Sewerage</span>
                    <span className={getStatusColor(getUtilityStatus(land.utilities?.sewerage))}>
                      {getUtilityStatus(land.utilities?.sewerage)}
                    </span>
                  </div>
                </div>

                {/* Rights & Restrictions column */}
                <div className="space-y-3.5">
                  <h4 className="font-extrabold text-gray-900 dark:text-white text-xs uppercase tracking-wider pb-1.5 border-b dark:border-gray-800">Rights & Restrictions</h4>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-550 dark:text-gray-400">Public Rights of Way</span>
                    <span className={getStatusColor(getUtilityStatus(land.restrictions?.publicRightsOfWay))}>
                      {getUtilityStatus(land.restrictions?.publicRightsOfWay)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Private Rights of Way</span>
                    <span className={getStatusColor(getUtilityStatus(land.restrictions?.privateRightsOfWay))}>
                      {getUtilityStatus(land.restrictions?.privateRightsOfWay)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Listed Property</span>
                    <span className={getStatusColor(getUtilityStatus(land.restrictions?.listedProperty))}>
                      {getUtilityStatus(land.restrictions?.listedProperty)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-500 dark:text-gray-400">Restrictions</span>
                    <span className={getStatusColor(getUtilityStatus(land.restrictions?.restrictions))}>
                      {getUtilityStatus(land.restrictions?.restrictions)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Seller Card & Chat Inquiry */}
        <div className="space-y-6">
          
          {/* Listing Seller Contact Details */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="font-bold text-xs uppercase text-gray-400 tracking-wider">Listing Seller</h3>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center text-green-600 text-xl font-bold border border-green-150 dark:border-green-900">
                {land.owner.avatar ? (
                  <img src={land.owner.avatar} alt={land.owner.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  land.owner.name.charAt(0)
                )}
              </div>
              <div>
                <h4 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-1 leading-tight">
                  {land.owner.name}
                  {land.owner.role === 'agent' && <ShieldCheck className="w-4.5 h-4.5 text-green-600" />}
                </h4>
                <span className="text-[10px] text-gray-450 uppercase tracking-widest font-bold block mt-0.5">
                  {land.owner.role === 'agent' ? 'Verified Seller' : 'Individual Seller'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-805 text-xs text-gray-650 dark:text-gray-350">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{land.owner.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{land.owner.phone || 'No phone provided'}</span>
              </div>
            </div>

            <button
              onClick={() => {
                chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-black shadow-md transition-all uppercase tracking-widest"
            >
              Enquire Now
            </button>
          </div>

          {/* Chat / Messaging Inquiry Pane */}
          <div ref={chatBoxRef} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 flex flex-col h-[400px] overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex-shrink-0 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Inquire About This Land</span>
            </div>

            {isOwner ? (
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <p className="text-xs">This is your property listing.</p>
                <Link
                  to={`/profile?tab=my-listings`}
                  className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors"
                >
                  Manage Listings
                </Link>
              </div>
            ) : !token ? (
              <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-gray-500">
                <p className="text-xs max-w-[200px] mx-auto leading-relaxed">
                  Log in to start a secure chat conversation with this land owner.
                </p>
                <button
                  onClick={openLoginModal}
                  className="mt-5 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Sign In to Chat
                </button>
              </div>
            ) : (
              <>
                {/* Chat Message Bubble List */}
                <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/50 dark:bg-gray-950/20">
                  {messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.sender._id === user.id;
                      return (
                        <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
                              isMe
                                ? 'bg-green-600 text-white rounded-tr-none shadow-sm'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-155 dark:border-gray-805 rounded-tl-none shadow-sm'
                            }`}
                          >
                            <p className="leading-relaxed">{msg.content}</p>
                            <span
                              className={`block text-[9px] mt-1.5 text-right ${
                                isMe ? 'text-green-200' : 'text-gray-400'
                              }`}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10 text-gray-455">
                      <p className="text-[11px]">Send the first message to start the inquiry.</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Send Input Box */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={chatLoading}
                    className="flex-grow px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-805 dark:text-white focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !newMessage.trim()}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
