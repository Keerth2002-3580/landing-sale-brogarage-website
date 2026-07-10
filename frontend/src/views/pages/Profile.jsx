import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LandPlot, Heart, MessageSquare, PlusCircle, ShieldCheck, Mail, Phone, Trash2, CheckCircle, Check, Send, Sparkles, MapPin, DollarSign, Ruler, Tag, FileText, Image as ImageIcon, Zap, Droplets, Wifi, FlameKindling, AlertTriangle, Navigation, X } from 'lucide-react';
import LandCard from '../components/LandCard';
import io from 'socket.io-client';

export default function Profile() {
  const { user, token, API_URL, updateProfile, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentTab = searchParams.get('tab') || 'settings';

  // State Management
  const [myListings, setMyListings] = useState([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Active Chat State
  const [activeChat, setActiveChat] = useState(null); // { partner, land, messages }
  const [chatMessages, setChatMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatPollRef = useRef(null);
  const socketRef = useRef(null);

  // Form Fields: Profile Settings
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [settingsSuccess, setSettingsSuccess] = useState('');
  const [settingsError, setSettingsError] = useState('');

  // Form Fields: Post Ad
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('6.9271');
  const [longitude, setLongitude] = useState('79.8612');
  const [size, setSize] = useState('');
  const [sizeUnit, setSizeUnit] = useState('perch');
  const [category, setCategory] = useState('residential');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [postSuccess, setPostSuccess] = useState('');
  const [postError, setPostError] = useState('');
  const [postLoading, setPostLoading] = useState(false);

  // Form Fields: Utilities & Restrictions
  const [electricity, setElectricity] = useState('Ask Seller');
  const [water, setWater] = useState('Ask Seller');
  const [heating, setHeating] = useState('Ask Seller');
  const [broadband, setBroadband] = useState('Ask Seller');
  const [sewerage, setSewerage] = useState('Ask Seller');
  const [publicRightsOfWay, setPublicRightsOfWay] = useState('Ask Seller');
  const [privateRightsOfWay, setPrivateRightsOfWay] = useState('Ask Seller');
  const [listedProperty, setListedProperty] = useState('Ask Seller');
  const [restrictions, setRestrictions] = useState('Ask Seller');

  // Form Fields: Agent Application
  const [companyName, setCompanyName] = useState('');
  const [bio, setBio] = useState('');
  const [agentSuccess, setAgentSuccess] = useState('');
  const [agentError, setAgentError] = useState('');
  const [agentProfile, setAgentProfile] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);

  // Sync auth updates
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  // Tab Loading Effects
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    if (currentTab === 'my-listings') {
      fetchMyListings();
    } else if (currentTab === 'inbox') {
      fetchConversations();
    } else if (currentTab === 'apply-agent') {
      fetchAgentProfile();
    }

    // Clean up active chat loops when tab changes
    return () => {
      if (chatPollRef.current) clearInterval(chatPollRef.current);
    };
  }, [currentTab, token, navigate]);

  // Setup Socket.io and listen for new messages
  useEffect(() => {
    if (!token || !user) return;

    // Connect to backend Socket.io server
    socketRef.current = io('http://localhost:5000');

    // Join user's private socket room
    socketRef.current.emit('join', user.id);

    // Listen for incoming messages
    socketRef.current.on('message_received', (msg) => {
      // If activeChat is open, and the message belongs to this conversation thread:
      if (activeChat && msg.landId._id === activeChat.land.id) {
        const isPartnerMsg = 
          (msg.sender._id === activeChat.partner.id && msg.receiver._id === user.id) ||
          (msg.sender._id === user.id && msg.receiver._id === activeChat.partner.id);
        
        if (isPartnerMsg) {
          setChatMessages((prev) => {
            // Avoid duplicate appends
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      }
      
      // Auto-refresh conversations list to show latest messages
      fetchConversations();
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, user, activeChat]);

  // Load chat messages when activeChat changes
  useEffect(() => {
    if (activeChat) {
      fetchActiveChatMessages();
    }
  }, [activeChat]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const changeTab = (tabName) => {
    setSearchParams({ tab: tabName });
    setActiveChat(null);
    setChatMessages([]);
  };

  // Fetch Logic
  const fetchMyListings = async () => {
    setMyListingsLoading(true);
    try {
      const res = await fetch(`${API_URL}/lands/my-listings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMyListings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMyListingsLoading(false);
    }
  };

  const fetchConversations = async () => {
    setConversationsLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setConversationsLoading(false);
    }
  };

  const fetchActiveChatMessages = async () => {
    if (!activeChat) return;
    try {
      const res = await fetch(`${API_URL}/messages/chat/${activeChat.partner.id}/${activeChat.land.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Action Logic
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSettingsSuccess('');
    setSettingsError('');
    const res = await updateProfile({ name, phone });
    if (res.success) {
      setSettingsSuccess('Profile updated successfully!');
    } else {
      setSettingsError(res.error || 'Failed to update profile');
    }
  };

  const handlePostAd = async (e) => {
    e.preventDefault();
    setPostSuccess('');
    setPostError('');
    setPostLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('location', location);
    formData.append('address', address);
    formData.append('latitude', latitude);
    formData.append('longitude', longitude);
    formData.append('size', size);
    formData.append('sizeUnit', sizeUnit);
    formData.append('category', category);
    formData.append('electricity', electricity);
    formData.append('water', water);
    formData.append('heating', heating);
    formData.append('broadband', broadband);
    formData.append('sewerage', sewerage);
    formData.append('publicRightsOfWay', publicRightsOfWay);
    formData.append('privateRightsOfWay', privateRightsOfWay);
    formData.append('listedProperty', listedProperty);
    formData.append('restrictions', restrictions);
    
    for (let i = 0; i < imageFiles.length; i++) {
      formData.append('images', imageFiles[i]);
    }

    try {
      const res = await fetch(`${API_URL}/lands`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setPostSuccess('Listing posted successfully! Awaiting administrator approval.');
        // Reset form
        setTitle('');
        setDescription('');
        setPrice('');
        setLocation('');
        setAddress('');
        setSize('');
        setImageFiles([]);
        setImagePreviews([]);
        setElectricity('Ask Seller');
        setWater('Ask Seller');
        setHeating('Ask Seller');
        setBroadband('Ask Seller');
        setSewerage('Ask Seller');
        setPublicRightsOfWay('Ask Seller');
        setPrivateRightsOfWay('Ask Seller');
        setListedProperty('Ask Seller');
        setRestrictions('Ask Seller');
      } else {
        setPostError(data.error || 'Failed to submit listing');
      }
    } catch (err) {
      setPostError('Network connection failure');
    } finally {
      setPostLoading(false);
    }
  };

  const handleDeleteListing = async (landId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`${API_URL}/lands/${landId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMyListings(myListings.filter((l) => l._id !== landId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkSold = async (landId) => {
    try {
      const res = await fetch(`${API_URL}/lands/${landId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'sold' }),
      });
      const data = await res.json();
      if (data.success) {
        setMyListings(myListings.map((l) => (l._id === landId ? { ...l, status: 'sold' } : l)));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChat) return;

    setReplyLoading(true);
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: activeChat.partner.id,
          landId: activeChat.land.id,
          content: replyText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChatMessages((prev) => [...prev, data.data]);
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReplyLoading(false);
    }
  };

  const fetchAgentProfile = async () => {
    setAgentLoading(true);
    try {
      const res = await fetch(`${API_URL}/agents/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAgentProfile(data.data);
        setCompanyName(data.data.companyName || '');
        setBio(data.data.bio || '');
      }
    } catch (err) {
      console.error('Error fetching agent profile:', err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleApplyAgent = async (e) => {
    e.preventDefault();
    setAgentSuccess('');
    setAgentError('');

    const formData = new FormData();
    formData.append('companyName', companyName);
    formData.append('bio', bio);
    formData.append('subscriptionPlan', 'premium');
    if (docFile) {
      formData.append('document', docFile);
    }

    try {
      const res = await fetch(`${API_URL}/agents/apply`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAgentSuccess('Agent application submitted successfully! Admin will review details.');
        setAgentProfile(data.data);
        fetchAgentProfile();
      } else {
        setAgentError(data.error || 'Failed to apply');
      }
    } catch (err) {
      setAgentError('Network failure');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Profile Navigation Menu */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-6">
            
            {/* Header info */}
            <div className="text-center space-y-2 border-b pb-6 border-gray-100 dark:border-gray-805">
              <div className="w-16 h-16 rounded-full bg-green-50 dark:bg-green-950 flex items-center justify-center text-green-600 text-xl font-bold mx-auto border border-green-150 dark:border-green-900">
                {user?.name.charAt(0)}
              </div>
              <h2 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight flex items-center justify-center gap-1">
                {user?.name}
                {user?.role === 'agent' && <ShieldCheck className="w-4.5 h-4.5 text-green-600" />}
              </h2>
              <span className="text-[10px] font-bold uppercase font-mono tracking-widest text-gray-400 bg-gray-100 dark:bg-gray-850 px-2 py-0.5 rounded-full inline-block">
                {user?.role}
              </span>
            </div>

            {/* Navigation links */}
            <nav className="flex flex-col gap-1 text-sm font-semibold">
              <button
                onClick={() => changeTab('settings')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'settings'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <User className="w-4.5 h-4.5" />
                Profile Settings
              </button>

              <button
                onClick={() => changeTab('my-listings')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'my-listings'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <LandPlot className="w-4.5 h-4.5" />
                My Listings
              </button>

              <button
                onClick={() => changeTab('saved-lands')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'saved-lands'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Heart className="w-4.5 h-4.5" />
                Saved Wishlist
              </button>

              <button
                onClick={() => changeTab('inbox')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'inbox'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5" />
                Inbox Chats
              </button>

              <button
                onClick={() => changeTab('add-listing')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'add-listing'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <PlusCircle className="w-4.5 h-4.5" />
                Post New Ad
              </button>

              <button
                onClick={() => changeTab('apply-agent')}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all ${
                  currentTab === 'apply-agent'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-850 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Sparkles className="w-4.5 h-4.5" />
                Seller Portal
              </button>
            </nav>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="w-full py-2.5 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold transition-all"
            >
              Sign Out
            </button>
          </div>
        </aside>

        {/* Right Side: Tab Contents */}
        <main className="flex-grow">
          {/* TAB: Settings */}
          {currentTab === 'settings' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-850">
                Profile Information
              </h3>

              {settingsSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 rounded-xl text-xs">{settingsSuccess}</div>}
              {settingsError && <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-750 dark:text-red-300 rounded-xl text-xs">{settingsError}</div>}

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address (Read Only)</label>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-100 dark:bg-gray-950 text-gray-500 border-gray-200 dark:border-gray-805"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Contact Number</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}

          {/* TAB: My Listings */}
          {currentTab === 'my-listings' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-850">
                My Advertisements
              </h3>

              {myListingsLoading ? (
                <div className="text-center py-10 text-gray-400">Loading your ads...</div>
              ) : myListings.length > 0 ? (
                <div className="space-y-4">
                  {myListings.map((land) => (
                    <div
                      key={land._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border dark:border-gray-850 rounded-xl gap-4"
                    >
                      <div className="space-y-1.5">
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-snug">{land.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-550 dark:text-gray-400">
                          <span className="font-mono">Rs. {land.price.toLocaleString()}</span>
                          <span>&bull;</span>
                          <span>{land.location}</span>
                          <span>&bull;</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            land.status === 'approved'
                              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                              : land.status === 'sold'
                              ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {land.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {land.status === 'approved' && (
                          <button
                            onClick={() => handleMarkSold(land._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-600 hover:bg-green-50 dark:border-green-950 dark:text-green-455 dark:hover:bg-green-950/20 rounded-lg text-xs font-semibold"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Mark Sold
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteListing(land._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-950 dark:text-red-400 dark:hover:bg-red-950/20 rounded-lg text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                  <p className="text-gray-400 text-sm">You haven't posted any land ads yet.</p>
                  <button
                    onClick={() => changeTab('add-listing')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                  >
                    Post First Ad
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Wishlist */}
          {currentTab === 'saved-lands' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-850">
                Saved Properties
              </h3>

              {user?.favorites && user.favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user.favorites.map((land) => (
                    <LandCard key={land._id || land} land={land} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-250 dark:border-gray-800 rounded-xl">
                  <p className="text-gray-400 text-sm">Your saved items list is empty.</p>
                  <button
                    onClick={() => navigate('/listings')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-semibold"
                  >
                    Browse Lands
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: Inbox Chats */}
          {currentTab === 'inbox' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 h-[550px] flex flex-col overflow-hidden">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-850 flex-shrink-0">
                Message Conversations
              </h3>

              {conversationsLoading ? (
                <div className="text-center py-10 text-gray-450 flex-grow">Loading chats...</div>
              ) : conversations.length > 0 ? (
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden mt-4">
                  {/* Conversations Sidebar Directory */}
                  <div className={`w-full md:w-64 border-r dark:border-gray-800 flex-shrink-0 overflow-y-auto ${activeChat ? 'hidden md:block' : 'block'}`}>
                    <div className="divide-y dark:divide-gray-805">
                      {conversations.map((chat) => (
                        <button
                          key={chat.id}
                          onClick={() => {
                            setActiveChat(chat);
                            setChatMessages([]);
                          }}
                          className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors ${
                            activeChat?.id === chat.id
                              ? 'bg-green-50/50 dark:bg-green-950/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-850'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-955 flex items-center justify-center text-green-700 text-sm font-bold flex-shrink-0">
                            {chat.partner.name.charAt(0)}
                          </div>
                          <div className="flex-grow min-w-0">
                            <h4 className="font-bold text-gray-900 dark:text-white text-xs truncate leading-snug">{chat.partner.name}</h4>
                            <p className="text-[10px] text-green-600 truncate mt-0.5">{chat.land.title}</p>
                            <p className="text-[10px] text-gray-400 truncate mt-1">{chat.lastMessage.content}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Message Pane */}
                  <div className={`flex-grow flex flex-col overflow-hidden ${!activeChat ? 'hidden md:flex justify-center items-center text-gray-400' : 'flex'}`}>
                    {activeChat ? (
                      <>
                        {/* active head */}
                        <div className="px-4 py-3 bg-gray-55/40 dark:bg-gray-950/40 border-b dark:border-gray-800 flex-shrink-0 flex items-center justify-between">
                          <button
                            onClick={() => setActiveChat(null)}
                            className="md:hidden text-xs text-green-600 font-bold"
                          >
                            Back
                          </button>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-xs">{activeChat.partner.name}</h4>
                            <p className="text-[9px] text-gray-450 truncate max-w-xs">{activeChat.land.title}</p>
                          </div>
                        </div>

                        {/* chat body */}
                        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-gray-50/20">
                          {chatMessages.map((msg) => {
                            const isMe = msg.sender._id === user.id;
                            return (
                              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div
                                  className={`max-w-[70%] rounded-2xl px-3.5 py-2 text-xs ${
                                    isMe
                                      ? 'bg-green-600 text-white rounded-tr-none'
                                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-250 border dark:border-gray-805 rounded-tl-none'
                                  }`}
                                >
                                  <p>{msg.content}</p>
                                  <span className="block text-[8px] text-right mt-1 opacity-70">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={chatEndRef} />
                        </div>

                        {/* chat input form */}
                        <form
                          onSubmit={handleSendReply}
                          className="p-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800 flex gap-2 flex-shrink-0"
                        >
                          <input
                            type="text"
                            placeholder="Type reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-grow px-3 py-2 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                          />
                          <button
                            type="submit"
                            disabled={replyLoading || !replyText.trim()}
                            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-xl disabled:opacity-40 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="text-center py-20">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-xs">Select a conversation thread to view chat history.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400 flex-grow">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">No active chats in your inbox.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: Post New Ad */}
          {currentTab === 'add-listing' && (
            <div className="space-y-5">

              {/* Header */}
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950 flex items-center justify-center">
                    <PlusCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Post Land Advertisement</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Fill in the details below. Your listing will go live after admin approval.</p>
                  </div>
                </div>
              </div>

              {postSuccess && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-700 dark:text-green-300 rounded-2xl text-xs">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {postSuccess}
                </div>
              )}
              {postError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-300 rounded-2xl text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {postError}
                </div>
              )}

              <form onSubmit={handlePostAd} className="space-y-5">

                {/* ── Section 1: Basic Info ───────────────────── */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Basic Information</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title - full width */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" /> Listing Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. 15 Perches Bare Land in Kottawa, near Highway"
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <LandPlot className="w-3 h-3" /> Category *
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                      >
                        <option value="residential">🏡 Residential</option>
                        <option value="commercial">🏢 Commercial</option>
                        <option value="agriculture">🌾 Agriculture</option>
                      </select>
                    </div>

                    {/* Price */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" /> Price (LKR) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">Rs.</span>
                        <input
                          type="number"
                          required
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          placeholder="1,500,000"
                          className="w-full pl-9 pr-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Size */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Ruler className="w-3 h-3" /> Land Size *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          required
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          placeholder="e.g. 15"
                          className="w-2/3 px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                        />
                        <select
                          value={sizeUnit}
                          onChange={(e) => setSizeUnit(e.target.value)}
                          className="w-1/3 px-2 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:outline-none transition-colors"
                        >
                          <option value="perch">Perch</option>
                          <option value="acre">Acre</option>
                        </select>
                      </div>
                    </div>

                    {/* Description - full width */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Land Description *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the plot — road access, deed type, water availability, surrounding area, nearby amenities..."
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 2: Location ─────────────────────── */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Location Details</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* City/District */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Kottawa, Colombo"
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Full Address */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <Navigation className="w-3 h-3" /> Full Address
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 45/2, High Level Road, Kottawa"
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Latitude */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Latitude <span className="font-normal text-gray-400">(for map pin)</span></label>
                      <input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(e.target.value)}
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>

                    {/* Longitude */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Longitude <span className="font-normal text-gray-400">(for map pin)</span></label>
                      <input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(e.target.value)}
                        className="w-full px-3.5 py-2.5 border-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700 focus:border-green-500 focus:bg-white focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* ── Section 3: Utilities & Restrictions ────── */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-950 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Utilities & Restrictions</h4>
                    <span className="text-[10px] text-gray-400 font-normal ml-1">(optional — defaults to "Ask Seller")</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Utilities Column */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Utilities</p>

                      {[
                        { label: 'Electricity', icon: <Zap className="w-3 h-3 text-amber-500" />, value: electricity, setter: setElectricity },
                        { label: 'Water', icon: <Droplets className="w-3 h-3 text-blue-500" />, value: water, setter: setWater },
                        { label: 'Broadband', icon: <Wifi className="w-3 h-3 text-purple-500" />, value: broadband, setter: setBroadband },
                        { label: 'Heating', icon: <FlameKindling className="w-3 h-3 text-orange-500" />, value: heating, setter: setHeating },
                        { label: 'Sewerage', icon: <Navigation className="w-3 h-3 text-gray-500" />, value: sewerage, setter: setSewerage },
                      ].map(({ label, icon, value, setter }) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            {icon} {label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none"
                          >
                            <option value="Ask Seller">Ask Seller</option>
                            <option value="Available">✅ Available</option>
                            <option value="Not Available">❌ Not Available</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    {/* Rights & Restrictions Column */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Rights & Restrictions</p>

                      {[
                        { label: 'Public Rights of Way', value: publicRightsOfWay, setter: setPublicRightsOfWay },
                        { label: 'Private Rights of Way', value: privateRightsOfWay, setter: setPrivateRightsOfWay },
                        { label: 'Listed Property', value: listedProperty, setter: setListedProperty },
                        { label: 'Restrictions', value: restrictions, setter: setRestrictions },
                      ].map(({ label, value, setter }) => (
                        <div key={label} className="flex items-center justify-between gap-3">
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                            <AlertTriangle className="w-3 h-3 text-gray-400" /> {label}
                          </label>
                          <select
                            value={value}
                            onChange={(e) => setter(e.target.value)}
                            className="px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white focus:outline-none"
                          >
                            <option value="Ask Seller">Ask Seller</option>
                            <option value="Available">✅ Yes</option>
                            <option value="Not Available">❌ No</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Section 4: Image Upload ─────────────────── */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b dark:border-gray-800">
                    <div className="w-6 h-6 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center">
                      <ImageIcon className="w-3.5 h-3.5 text-violet-600" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">Property Photos</h4>
                    <span className="text-[10px] text-gray-400 ml-1">(up to 5 images)</span>
                  </div>

                  {/* Upload area */}
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center gap-2 w-full h-28 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50/30 dark:hover:bg-green-950/10 transition-all"
                  >
                    <ImageIcon className="w-7 h-7 text-gray-300" />
                    <p className="text-xs text-gray-400">Click to upload or drag & drop images here</p>
                    <p className="text-[10px] text-gray-300">JPG, PNG, WEBP — Max 10MB each</p>
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files).slice(0, 5);
                        setImageFiles(files);
                        setImagePreviews(files.map(f => URL.createObjectURL(f)));
                      }}
                    />
                  </label>

                  {/* Image preview grid */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-2">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative group aspect-square">
                          <img
                            src={src}
                            alt={`preview-${i}`}
                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = imagePreviews.filter((_, idx) => idx !== i);
                              const newFiles = Array.from(imageFiles).filter((_, idx) => idx !== i);
                              setImagePreviews(newPreviews);
                              setImageFiles(newFiles);
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 text-[8px] font-bold bg-green-500 text-white px-1 py-0.5 rounded">COVER</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Submit Button ──────────────────────────── */}
                <div className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl">
                  <div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Ready to publish?</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Your ad will be reviewed by admin before going live.</p>
                  </div>
                  <button
                    type="submit"
                    disabled={postLoading}
                    className="flex items-center gap-2 px-7 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {postLoading ? (
                      <>
                        <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" className="opacity-75" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-3.5 h-3.5" />
                        Publish Listing
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB: Seller Portal */}
          {currentTab === 'apply-agent' && (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b pb-3 dark:border-gray-850 flex items-center justify-between">
                <span>Seller Verification Portal</span>
                {agentProfile && (
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    agentProfile.verificationStatus === 'approved'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/45 dark:text-green-300'
                      : agentProfile.verificationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950/45 dark:text-red-300'
                      : 'bg-amber-100 text-amber-805 text-amber-800 dark:bg-amber-950/45 dark:text-amber-300'
                  }`}>
                    {agentProfile.verificationStatus}
                  </span>
                )}
              </h3>

              {agentSuccess && <div className="p-3 bg-green-50 dark:bg-green-950/40 text-green-755 dark:text-green-300 rounded-xl text-xs">{agentSuccess}</div>}
              {agentError && <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-750 dark:text-red-300 rounded-xl text-xs">{agentError}</div>}

              {agentLoading ? (
                <div className="text-center py-10 text-gray-400">Loading seller profile...</div>
              ) : (
                <>
                  {agentProfile?.verificationStatus === 'approved' && user?.role === 'agent' ? (
                    <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-900 text-green-700 dark:text-green-400 rounded-xl flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
                      <div className="text-xs">
                        <p className="font-bold">Your Verified Seller Status is Active!</p>
                        <p className="mt-1">You are verified to post premium listings on LankaLand. Your listings will show the Verified Seller badge.</p>
                      </div>
                    </div>
                  ) : agentProfile?.verificationStatus === 'pending' ? (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-150 dark:border-amber-900 text-amber-800 dark:text-amber-400 rounded-xl flex items-start gap-3">
                      <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
                      <div className="text-xs">
                        <p className="font-bold">Application Pending Review</p>
                        <p className="mt-1">Your document and credentials are currently being reviewed by our administrators. You will be notified once verification is complete.</p>
                      </div>
                    </div>
                  ) : agentProfile?.verificationStatus === 'rejected' ? (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-150 dark:border-red-900 text-red-800 dark:text-red-400 rounded-xl flex items-start gap-3">
                      <Trash2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                      <div className="text-xs">
                        <p className="font-bold">Application Rejected</p>
                        <p className="mt-1">Reason: <span className="font-semibold">{agentProfile.rejectionReason || 'No reason provided.'}</span></p>
                        <p className="mt-2 text-[11px] text-gray-550 dark:text-gray-400">Please review the reason, correct your details or upload a new verification document, and resubmit below.</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-550 leading-relaxed">
                      Upgrade your account to a Verified Seller profile. Verified sellers get specific badge markers on their ads, higher listing limits, and premium exposure.
                    </p>
                  )}

                  <form onSubmit={handleApplyAgent} className="space-y-4 max-w-lg">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Company / Seller Name</label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g. Lanka Lands & Properties"
                        className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Bio / Description</label>
                      <textarea
                        required
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Describe your service areas, years of selling experience..."
                        className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none resize-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        Verification Document {(!agentProfile || agentProfile.verificationStatus === 'rejected') && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="file"
                        required={!agentProfile?.verificationDocument}
                        accept="image/*,.pdf"
                        onChange={(e) => setDocFile(e.target.files[0])}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 dark:file:bg-green-950 dark:file:text-green-300 hover:file:opacity-90 cursor-pointer"
                      />
                      <p className="text-[10px] text-gray-450">Upload a clear photo or copy of your ID Card, deed sample, or business certificate (JPEG, PNG, PDF up to 10MB).</p>
                      {agentProfile?.verificationDocument && (
                        <div className="mt-2 text-xs flex items-center gap-1.5 text-gray-500">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span>Submitted document:</span>
                          <a
                            href={`http://localhost:5000${agentProfile.verificationDocument}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:underline font-semibold font-mono"
                          >
                            View Submitted File
                          </a>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={agentLoading}
                      className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                    >
                      {agentProfile ? 'Resubmit / Update Application' : 'Apply for Seller Verification'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
