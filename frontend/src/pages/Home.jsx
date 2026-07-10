import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, LandPlot, ShieldCheck, Building2, Trees, Sparkles, Phone, ArrowRight, ChevronDown, ChevronUp, HelpCircle, CheckCircle2, MessageSquare, Map, TrendingUp, Compass, Eye, Star, Wifi, Calculator, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LandCard from '../components/LandCard';

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

const FEATURED_DISTRICTS = [
  { name: 'Colombo', desc: 'Commercial Capital & Skyline Lands', img: 'https://images.unsplash.com/photo-1568849676085-51415703900f?auto=format&fit=crop&w=600&q=80', query: 'colombo' },
  { name: 'Kandy', desc: 'Scenic Hills & Cultural Heritage Sites', img: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=600&q=80', query: 'kandy' },
  { name: 'Galle', desc: 'Beachfront Plots & Colonial Fort Estates', img: 'https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=600&q=80', query: 'galle' },
  { name: 'Nuwara Eliya', desc: 'Tea Gardens & Cool Climate Retreats', img: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?auto=format&fit=crop&w=600&q=80', query: 'nuwara eliya' }
];



export default function Home() {
  const { API_URL } = useAuth();
  const [allLands, setAllLands] = useState([]);
  const [featuredLands, setFeaturedLands] = useState([]);
  const [latestLands, setLatestLands] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [categoryQuery, setCategoryQuery] = useState('');
  const [heroVideoUrl, setHeroVideoUrl] = useState('https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beautiful-green-forest-and-lake-32220-large.mp4');
  const [openFaq, setOpenFaq] = useState(null);
  const [categoryCounts, setCategoryCounts] = useState({ residential: 0, commercial: 0, agriculture: 0 });
  const navigate = useNavigate();

  // Mortgage Calculator states
  const [calcPrice, setCalcPrice] = useState(5000000); // default 5,000,000 LKR
  const [calcDownpayment, setCalcDownpayment] = useState(20); // default 20%
  const [calcTerm, setCalcTerm] = useState(15); // default 15 years



  const faqs = [
    {
      q: 'How do I verify a land listing\'s title deeds?',
      a: 'Each listing contains location coordinates and detailed seller descriptions. We highly recommend conducting an independent land registry check using the coordinates and address, or consulting a legal professional before completing any transaction. Verified sellers display a verified badge, indicating that their identity credentials have been moderated.'
    },
    {
      q: 'Are there any hidden fees or seller commissions on LankaLand?',
      a: 'No, LankaLand is a direct peer-to-peer platform connecting buyers and sellers. We do not charge any commission or brokerage fees on transactions. Basic listings are completely free to post.'
    },
    {
      q: 'How can I schedule a land site inspection?',
      a: 'You can use our integrated "Inquire About This Land" chat system on the listing page to message the seller directly. Set up a mutually convenient time and date for inspection visits.'
    },
    {
      q: 'How do I get a Verified Seller badge on my listings?',
      a: 'Go to your Profile and navigate to the Seller Portal. Submit your registration details along with a copy of your National ID (NIC), deed sample, or business registration document. Once reviewed and approved by our administrators, your profile and listings will display the Verified Seller badge.'
    }
  ];

  const calculateMortgage = () => {
    const downpaymentAmount = calcPrice * (calcDownpayment / 100);
    const principal = calcPrice - downpaymentAmount;
    const monthlyRate = 0.12 / 12; // 12% annual interest rate
    const totalPayments = calcTerm * 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);
    return Math.round(monthlyPayment);
  };



  const formatCurrency = (amount) => {
    if (amount >= 1000000) {
      return `LKR ${(amount / 1000000).toFixed(1)}M`;
    }
    return `LKR ${(amount / 1000).toFixed(0)}K`;
  };

  const getDistrictCount = (name) => {
    return allLands.filter(l => 
      l.location && l.location.toLowerCase().includes(name.toLowerCase())
    ).length;
  };

  useEffect(() => {
    // Fetch site settings for dynamic video
    const fetchSettings = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/settings');
        const data = await res.json();
        if (data && data.heroVideoUrl) {
          setHeroVideoUrl(data.heroVideoUrl);
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };

    // Fetch lands
    const fetchLands = async () => {
      try {
        const res = await fetch(`${API_URL}/lands`);
        const data = await res.json();
        if (data.success) {
          setAllLands(data.data);
          // Get featured lands
          setFeaturedLands(data.data.filter((l) => l.isFeatured).slice(0, 4));
          // Get latest lands
          setLatestLands(data.data.slice(0, 8));
          // Calculate category counts
          const counts = {
            residential: data.data.filter((l) => l.category === 'residential').length,
            commercial: data.data.filter((l) => l.category === 'commercial').length,
            agriculture: data.data.filter((l) => l.category === 'agriculture').length,
          };
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error('Error fetching lands:', err);
      }
    };

    fetchSettings();
    fetchLands();
  }, [API_URL]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    let queryParams = [];
    if (searchQuery) queryParams.push(`search=${searchQuery}`);
    if (locationQuery) queryParams.push(`location=${locationQuery}`);
    if (categoryQuery) queryParams.push(`category=${categoryQuery}`);
    
    navigate(`/listings?${queryParams.join('&')}`);
  };

  return (
    <div className="space-y-16">
      {/* 1. Hero Search Section */}
      <section 
        className="relative min-h-[80vh] lg:h-[86vh] lg:min-h-[770px] w-full flex flex-col justify-center text-white overflow-hidden bg-cover bg-center pt-28 pb-16 lg:py-0"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1800&q=80')" }}
      >
        {/* Advanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950/80 via-green-900/40 to-black/35 z-0 pointer-events-none" />
        
        {/* Main Content Area */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between lg:pt-24 lg:pb-12">
          
          {/* Left Text & Search */}
          <div className="flex-1 max-w-xl space-y-10">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-white drop-shadow-lg">
              Comprehensive listings for your <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">perfect land</span>
            </h1>
            
            {/* Sleek Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-white/20 backdrop-blur-md border border-white/30 rounded-full p-2 shadow-lg max-w-lg transition-all focus-within:bg-white/30 focus-within:border-white/50"
            >
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-white/90 mr-3" />
                <input
                  type="text"
                  placeholder="Search lands, locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 p-0 text-white placeholder-white/80 focus:ring-0 focus:outline-none text-base font-medium"
                />
              </div>
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white rounded-full px-6 py-3 font-semibold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-green-600/35"
              >
                Search <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <span className="text-white/80 text-sm font-medium">Quick search:</span>
              {['Residential', 'Commercial', 'Agriculture', 'Bare Land'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoryQuery(cat.toLowerCase());
                    navigate(`/listings?category=${cat.toLowerCase()}`);
                  }}
                  className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-colors backdrop-blur-sm"
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Trust Badges / Stats */}
            <div className="flex items-center gap-6 pt-8 mt-8 border-t border-white/20">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white drop-shadow-md">10K+</span>
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Verified Lands</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white drop-shadow-md">500+</span>
                <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Active Agents</span>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-8 h-8 text-green-400 drop-shadow-md" />
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm drop-shadow-md">Secure</span>
                  <span className="text-white/70 text-xs font-medium uppercase tracking-wider">Transactions</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Floating Info Card (Larger with Video) */}
          <div className="hidden lg:block relative z-10 mr-4 mt-12 lg:mt-0">
            <div className="bg-white/10 dark:bg-black/25 backdrop-blur-xl border border-white/20 rounded-3xl p-4 w-[28rem] shadow-[0_30px_70px_rgba(16,185,129,0.15)]">
              <div className="relative h-64 rounded-2xl overflow-hidden mb-4">
                <video 
                  src={heroVideoUrl} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  className="w-full h-full object-cover transition-transform hover:scale-105 duration-700"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-2 border border-white/20 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Tour
                </div>
              </div>
              <div className="px-2 pb-1">
                <p className="text-white text-base font-semibold leading-snug drop-shadow-sm">
                  Explore prime land investments with verified deeds and aerial tours.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-green-400 font-bold text-sm bg-green-400/10 px-3 py-1.5 rounded-full hover:bg-green-400/20 transition-colors cursor-pointer inline-block">
                    Explore Now
                  </span>
                </div>
              </div>
            </div>
          </div>
          
        </div>

      </section>

      {/* 2. Categories Layout */}
      <section className="max-w-7xl mx-auto px-4 relative">
        {/* Ambient decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-green-200/10 dark:bg-green-950/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-3 mb-12 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
            Browse by <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Explore diverse lands tailored for your specific building, cultivation, or development requirements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Residential */}
          <Link
            to="/listings?category=residential"
            className="group relative h-[380px] rounded-[2.5rem] overflow-hidden border border-gray-200/20 dark:border-gray-800/40 flex flex-col justify-end p-8 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(16,185,129,0.18)] transition-all duration-300"
          >
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Residential Lands"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent pointer-events-none" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <span className="px-3.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/45 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                <LandPlot className="w-3.5 h-3.5 text-green-400" />
                <span>Residential</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10">
                {categoryCounts.residential} {categoryCounts.residential === 1 ? 'Ad' : 'Ads'}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2 text-white">
              <h3 className="font-extrabold text-2xl tracking-tight leading-none">Residential Lands</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Plots perfect for housing estates, luxury cottages, and residential villas.
              </p>
              <div className="pt-3 flex items-center gap-1.5 text-[9px] font-extrabold text-green-400 group-hover:text-green-300 transition-colors uppercase tracking-widest">
                <span>View Listings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Commercial */}
          <Link
            to="/listings?category=commercial"
            className="group relative h-[380px] rounded-[2.5rem] overflow-hidden border border-gray-200/20 dark:border-gray-800/40 flex flex-col justify-end p-8 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(59,130,246,0.18)] transition-all duration-300"
          >
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
              alt="Commercial Lands"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent pointer-events-none" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <span className="px-3.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/45 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Commercial</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10">
                {categoryCounts.commercial} {categoryCounts.commercial === 1 ? 'Ad' : 'Ads'}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2 text-white">
              <h3 className="font-extrabold text-2xl tracking-tight leading-none">Commercial Lands</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                High-exposure plots facing main roads, suitable for showrooms, hotels, or offices.
              </p>
              <div className="pt-3 flex items-center gap-1.5 text-[9px] font-extrabold text-blue-400 group-hover:text-blue-300 transition-colors uppercase tracking-widest">
                <span>View Listings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>

          {/* Agriculture */}
          <Link
            to="/listings?category=agriculture"
            className="group relative h-[380px] rounded-[2.5rem] overflow-hidden border border-gray-200/20 dark:border-gray-800/40 flex flex-col justify-end p-8 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(245,158,11,0.18)] transition-all duration-300"
          >
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80"
              alt="Agricultural Lands"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/40 to-transparent pointer-events-none" />
            
            {/* Top Badges */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
              <span className="px-3.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/45 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5">
                <Trees className="w-3.5 h-3.5 text-amber-400" />
                <span>Agricultural</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10">
                {categoryCounts.agriculture} {categoryCounts.agriculture === 1 ? 'Ad' : 'Ads'}
              </span>
            </div>

            {/* Bottom Content */}
            <div className="relative z-10 space-y-2 text-white">
              <h3 className="font-extrabold text-2xl tracking-tight leading-none">Agricultural Lands</h3>
              <p className="text-xs text-gray-300 font-medium leading-relaxed">
                Fertile farms, tea & coconut estates, cinnamon gardens, and cultivation fields.
              </p>
              <div className="pt-3 flex items-center gap-1.5 text-[9px] font-extrabold text-amber-400 group-hover:text-amber-300 transition-colors uppercase tracking-widest">
                <span>View Listings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform duration-300" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* 2.5. Prime Districts Hub */}
      <section className="w-full relative">
        <div className="bg-emerald-950 dark:bg-gray-900 border-y border-emerald-900/25 dark:border-gray-800 w-full py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden shadow-2xl">
          {/* Ambient light glow inside the dark container */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Left Column: Info Block (matching the user's mockup style) */}
            <div className="lg:col-span-2 space-y-6 pt-4 text-white">
              <span className="inline-block text-[10px] tracking-widest font-black uppercase bg-green-500/20 text-green-400 px-3 py-1 rounded-full border border-green-500/30">
                Regional Hub
              </span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Explore Sri Lanka's Prime Districts
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                LankaLand is the ultimate portal for finding and listing lands across all 25 districts in Sri Lanka. Whether you're seeking a premium beachfront plot in Galle, a commercial zone in Colombo, or a scenic hillside retreat in Kandy, our curated regional explorer helps you pinpoint the perfect location.
              </p>
              
              <div className="pt-4">
                <Link
                  to="/districts"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/30 hover:border-white text-white text-xs font-extrabold uppercase tracking-wider hover:bg-white hover:text-emerald-950 transition-all duration-305"
                >
                  <span>View All 25 Districts</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Column: Featured Districts Grid (matching the middle & right cards) */}
            <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURED_DISTRICTS.map((loc, idx) => {
                const count = getDistrictCount(loc.name);
                return (
                  <div
                    key={idx}
                    className="group relative h-[285px] rounded-3xl overflow-hidden border border-white/10 flex flex-col justify-between p-6 shadow-md hover:-translate-y-1 transition-all duration-305"
                  >
                    {/* Background image */}
                    <img
                      src={loc.img}
                      alt={loc.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {/* Dark moody overlay */}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-300 pointer-events-none" />
                    
                    {/* Top Section */}
                    <div className="relative z-10 flex justify-between items-start w-full">
                      <div>
                        <h3 className="font-extrabold text-xl text-white tracking-tight leading-none">{loc.name}</h3>
                        <p className="text-[10px] text-gray-300 font-medium mt-1.5 leading-snug">{loc.desc}</p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-black/40 backdrop-blur-md text-white border border-white/10 shrink-0">
                        {count} {count === 1 ? 'Ad' : 'Ads'}
                      </span>
                    </div>

                    {/* Bottom Section Action Button */}
                    <div className="relative z-10">
                      <Link
                        to={`/listings?location=${loc.query}`}
                        className="inline-block w-full py-2.5 rounded-xl border border-white/30 text-white hover:bg-white hover:text-gray-900 hover:border-white text-center text-xs font-bold transition-all duration-300"
                      >
                        Explore Lands
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Latest Listings */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              Recently Added Lands
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Explore the latest land advertisements submitted across Sri Lanka
            </p>
          </div>
          <Link to="/listings" className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1 hover:underline">
            Browse All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {latestLands.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestLands.map((land) => (
              <LandCard key={land._id} land={land} />
            ))}
          </div>
        ) : (
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border border-gray-200/50 dark:border-gray-800/40 rounded-[2rem] p-12 text-center max-w-xl mx-auto shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
            {/* ambient background light */}
            <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-green-400/5 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-blue-400/5 blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center max-w-sm mx-auto space-y-6">
              {/* Icon with dynamic badge styling */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-500/10 to-emerald-500/5 dark:from-green-950/40 dark:to-emerald-950/20 text-green-600 dark:text-green-400 border border-green-500/15 flex items-center justify-center animate-bounce shadow-md">
                  <Compass className="w-8 h-8" />
                </div>
                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Pristine Canvas Awaiting Listings</h3>
                <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
                  We're currently verifying and moderating new property listings. Check back shortly or be the first to publish a new land advertisement!
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
                <Link
                  to="/profile?tab=add-listing"
                  className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-305 transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2"
                >
                  <span>Post Your Land Ad</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/listings"
                  className="w-full sm:flex-1 py-3 px-6 rounded-2xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all duration-305 text-center"
                >
                  Browse Existing Lands
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>


      {/* 5. Why Choose LankaLand? (Features Grid) */}
      <section className="w-full relative">
        <div className="bg-emerald-950 dark:bg-gray-900 border-y border-emerald-900/25 dark:border-gray-800 w-full py-16 px-4 md:px-8 lg:px-12 relative overflow-hidden shadow-2xl">
          {/* Ambient light glow inside the dark container */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 max-w-[1600px] mx-auto space-y-16">
            {/* Header */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Why Choose LankaLand?
              </h2>
              <p className="text-sm sm:text-base text-gray-300 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                A secure, transparent, and premium land portal designed specifically for direct buyers and sellers in Sri Lanka — no middlemen, no commissions.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">

              {/* Big Feature Card 1 - Verified Geolocation (spans 5 cols) */}
              <div 
                className="group md:col-span-5 relative p-8 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-305 flex flex-col justify-between min-h-[260px] border border-emerald-200 shadow-sm"
                style={{ backgroundColor: '#E6FBF0' }}
              >
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 group-hover:shadow-emerald-500/30 transition-all duration-300">
                    <Map className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-xl text-emerald-950 tracking-tight mt-6 mb-3">Verified Geolocation</h3>
                  <p className="text-sm leading-relaxed text-emerald-900/85 font-medium">
                    Every listing includes precise map coordinate pinning for transparent location verification, street-level previews, and easy navigation.
                  </p>
                </div>

                <div className="relative z-10 mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  GPS-Pinned Listings
                </div>
              </div>

              {/* Big Feature Card 2 - Direct Seller Inbox (spans 7 cols) */}
              <div 
                className="group md:col-span-7 relative p-8 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-305 flex flex-col justify-between min-h-[260px] border border-blue-200 shadow-sm"
                style={{ backgroundColor: '#EBF3FF' }}
              >
                <div className="relative z-10 flex gap-6 items-start">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-blue-500/30 transition-all duration-300">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-blue-950 tracking-tight mb-3">Direct Seller Inbox</h3>
                    <p className="text-sm leading-relaxed text-blue-900/85 font-medium">
                      Chat in real-time directly with land owners through our secure messaging platform. No brokers, no agent fees, and zero third-party commissions — just direct, honest communication.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 mt-8 grid grid-cols-3 gap-3">
                  {[
                    { label: 'No Brokers', icon: '🚫' },
                    { label: 'No Fees', icon: '✓' },
                    { label: 'Real-Time Chat', icon: '💬' },
                  ].map(({ label, icon }) => (
                    <div key={label} className="flex items-center gap-2 bg-blue-100/70 border border-blue-200/60 rounded-xl px-3 py-2">
                      <span className="text-sm">{icon}</span>
                      <span className="text-[10px] font-bold text-blue-800">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Small Card 3 - Verified Badging (spans 4 cols) */}
              <div 
                className="group md:col-span-4 relative p-7 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-305 flex flex-col justify-between min-h-[260px] border border-purple-200 shadow-sm"
                style={{ backgroundColor: '#F4F0FF' }}
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-all duration-300">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-purple-950 tracking-tight mt-5 mb-2">Verified Badging</h3>
                  <p className="text-xs leading-relaxed text-purple-900/85 font-medium">
                    Sellers verified by NIC documents and certificates earn a trust badge, giving buyers full confidence before transactions.
                  </p>
                </div>
              </div>

              {/* Small Card 4 - Custom Utilities Checklist (spans 4 cols) */}
              <div 
                className="group md:col-span-4 relative p-7 rounded-3xl hover:-translate-y-1 hover:shadow-lg transition-all duration-305 flex flex-col justify-between min-h-[260px] border border-amber-200 shadow-sm"
                style={{ backgroundColor: '#FFF8E6' }}
              >
                <div className="relative z-10">
                  <div className="w-11 h-11 bg-gradient-to-br from-amber-500 to-orange-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-all duration-300">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-amber-950 tracking-tight mt-5 mb-2">Utilities Checklist</h3>
                  <p className="text-xs leading-relaxed text-amber-900/85 font-medium">
                    Full availability details for electricity, water, road access, and broadband — all visible before you inquire.
                  </p>
                </div>
              </div>

              {/* Stats Banner Card (spans 4 cols) */}
              <div className="md:col-span-4 p-7 flex flex-col justify-between min-h-[260px]">
                <div className="space-y-5">
                  <span className="text-[10px] tracking-widest font-black uppercase text-green-400">Trusted Across Sri Lanka</span>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    {[
                      { value: '10K+', label: 'Verified Lands' },
                      { value: '500+', label: 'Active Agents' },
                      { value: '25', label: 'Districts Covered' },
                      { value: '100%', label: 'Free to Browse' },
                    ].map(({ value, label }) => (
                      <div key={label} className="space-y-0.5">
                        <div className="text-2xl font-black text-white tracking-tight">{value}</div>
                        <div className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/listings"
                      className="inline-flex items-center gap-2 text-xs font-bold text-green-400 hover:text-green-300 transition-colors group/cta"
                    >
                      Explore All Listings
                      <ArrowRight className="w-3.5 h-3.5 group-hover/cta:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 6. How LankaLand Works */}
      <section className="max-w-7xl mx-auto px-4 relative">
        <div className="text-center space-y-3 mb-16">

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950 dark:text-white">
            How LankaLand <span className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">Works</span>
          </h2>
          <p className="text-sm sm:text-base text-gray-555 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            A direct, secure, and transparent pathway to buy or sell properties in Sri Lanka without middlemen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start w-full">
          {/* Buyers Flow */}
          <div className="group/card relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-805/50 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.015)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-2xl hover:border-emerald-500/20 dark:hover:border-emerald-500/10 transition-all duration-300">
            {/* Soft decorative glow */}
            <div className="absolute top-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  For Buyers
                </span>
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">Buyer's Journey</span>
              </div>

              <div className="relative pl-8 space-y-8 border-l border-gray-150 dark:border-gray-800 ml-4">
                {[
                  {
                    num: 1,
                    title: 'Filter & Choose Plots',
                    desc: 'Browse and filter lands by category (Residential, Commercial, Agriculture), location, size, or price.',
                    icon: <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  },
                  {
                    num: 2,
                    title: 'Check Specs & Repayments',
                    desc: 'Review the utilities accordion checklist, look up the land coordinates, and estimate monthly repayments via LKR mortgage calculator.',
                    icon: <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  },
                  {
                    num: 3,
                    title: 'Inquire Directly',
                    desc: 'Chat directly with the owner using our secure message board to verify details, deeds, or arrange site visits.',
                    icon: <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  }
                ].map((step) => (
                  <div key={step.num} className="group/item relative space-y-1">
                    {/* Number Pin overlaying the border */}
                    <div className="absolute -left-[49px] top-0 w-8 h-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-650 dark:text-gray-450 font-black text-xs flex items-center justify-center shadow-sm group-hover/item:bg-emerald-600 group-hover/item:text-white group-hover/item:border-emerald-600 transition-all duration-300">
                      {step.num}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                        {step.icon}
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-950 dark:text-white tracking-tight">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-650 dark:text-gray-400 pl-8">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sellers Flow */}
          <div className="group/card relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-805/50 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.015)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:shadow-2xl hover:border-blue-500/20 dark:hover:border-blue-500/10 transition-all duration-300">
            {/* Soft decorative glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  For Sellers
                </span>
                <span className="text-[10px] font-bold text-gray-450 uppercase tracking-widest">Seller's Pathway</span>
              </div>

              <div className="relative pl-8 space-y-8 border-l border-gray-150 dark:border-gray-800 ml-4">
                {[
                  {
                    num: 1,
                    title: 'Register & Create Profile',
                    desc: 'Sign up as a Land Seller, configure your profile name, company details (optional), contact phone, and description bio.',
                    icon: <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  },
                  {
                    num: 2,
                    title: 'Get Identity Verified',
                    desc: 'Upload a verification ID or certificate in the Seller Portal. Admin approval triggers the Verified badge next to your ads.',
                    icon: <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  },
                  {
                    num: 3,
                    title: 'Publish Land Listing',
                    desc: 'Add titles, description, coordinates, size, images, and select custom statuses for utilities and restrictions before publishing.',
                    icon: <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  }
                ].map((step) => (
                  <div key={step.num} className="group/item relative space-y-1">
                    {/* Number Pin overlaying the border */}
                    <div className="absolute -left-[49px] top-0 w-8 h-8 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-650 dark:text-gray-455 font-black text-xs flex items-center justify-center shadow-sm group-hover/item:bg-blue-600 group-hover/item:text-white group-hover/item:border-blue-600 transition-all duration-300">
                      {step.num}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg">
                        {step.icon}
                      </div>
                      <h4 className="font-extrabold text-sm text-gray-950 dark:text-white tracking-tight">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-650 dark:text-gray-400 pl-8">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* 8. Frequently Asked Questions (FAQ Accordion) */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-2">
            <HelpCircle className="w-7 h-7 text-green-600" />
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Answers to common questions about buying and selling lands in Sri Lanka
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Column 1 */}
          <div className="space-y-6">
            {faqs.filter((_, idx) => idx % 2 === 0).map((faq, idx) => {
              const actualIdx = idx * 2;
              const isFaqOpen = openFaq === actualIdx;
              return (
                <div 
                  key={actualIdx} 
                  className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                    isFaqOpen 
                      ? 'border-green-500/40 dark:border-green-400/30 shadow-md shadow-green-500/5 ring-1 ring-green-500/10' 
                      : 'border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isFaqOpen ? null : actualIdx)}
                    className={`w-full px-6 py-4 flex items-center justify-between font-bold transition-colors text-left text-sm sm:text-base cursor-pointer ${
                      isFaqOpen ? 'text-green-700 dark:text-green-400 bg-green-50/20 dark:bg-green-950/10' : 'text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-gray-850/10'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <span className="flex-shrink-0 ml-4">
                      <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isFaqOpen ? 'transform rotate-180 text-green-600 dark:text-green-400' : ''}`} />
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isFaqOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 pt-3 text-xs sm:text-sm text-gray-555 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 bg-green-50/5 dark:bg-green-950/5">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Column 2 */}
          <div className="space-y-6">
            {faqs.filter((_, idx) => idx % 2 === 1).map((faq, idx) => {
              const actualIdx = idx * 2 + 1;
              const isFaqOpen = openFaq === actualIdx;
              return (
                <div 
                  key={actualIdx} 
                  className={`bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm transition-all duration-300 ${
                    isFaqOpen 
                      ? 'border-green-500/40 dark:border-green-400/30 shadow-md shadow-green-500/5 ring-1 ring-green-500/10' 
                      : 'border-gray-150 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isFaqOpen ? null : actualIdx)}
                    className={`w-full px-6 py-4 flex items-center justify-between font-bold transition-colors text-left text-sm sm:text-base cursor-pointer ${
                      isFaqOpen ? 'text-green-700 dark:text-green-400 bg-green-50/20 dark:bg-green-950/10' : 'text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-gray-850/10'
                    }`}
                  >
                    <span>{faq.q}</span>
                    <span className="flex-shrink-0 ml-4">
                      <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-300 ${isFaqOpen ? 'transform rotate-180 text-green-600 dark:text-green-400' : ''}`} />
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isFaqOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-5 pt-3 text-xs sm:text-sm text-gray-555 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800/60 bg-green-50/5 dark:bg-green-950/5">
                      <p>{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
