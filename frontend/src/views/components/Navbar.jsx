import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sun, Moon, Menu, X, User, LogOut, Compass, PlusCircle, LayoutDashboard, LandPlot, ChevronDown, Phone, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const { user, logout, darkMode, toggleDarkMode, openLoginModal, openRegisterModal } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const hasHero = location.pathname === '/' || location.pathname === '/verified-sellers';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!hasHero) {
      setIsScrolled(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Trigger check immediately in case page loads scrolled down
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasHero]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const isTransparent = hasHero && !isScrolled;

  // Single floating pill style
  const navContainerClass = `fixed z-50 transition-all duration-500 ease-in-out left-1/2 -translate-x-1/2 w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${
    isScrolled ? 'top-2' : 'top-6'
  }`;

  const pillClass = `flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 ${
    isTransparent
      ? 'bg-emerald-950/75 dark:bg-emerald-950/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(16,185,129,0.2)]'
      : 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-green-500/10 dark:border-green-800/20 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]'
  }`;

  const linkClass = `text-sm font-semibold transition-colors ${
    isTransparent
      ? 'text-green-100/90 hover:text-white'
      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
  }`;

  const iconBtnClass = `p-2 rounded-full transition-colors ${
    isTransparent
      ? 'text-green-100/90 hover:text-white hover:bg-white/10'
      : 'text-gray-600 dark:text-gray-300 hover:text-green-600 hover:bg-gray-100 dark:hover:bg-gray-800'
  }`;

  return (
    <div className={navContainerClass}>
      <nav className={pillClass}>
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-green-500 text-white shadow-md shadow-green-500/30 transition-transform duration-300 group-hover:rotate-12">
            <LandPlot className="w-5 h-5" />
          </div>
          <span className={`text-xl font-bold tracking-tight ${
            isTransparent ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}>
            LankaLand
          </span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={linkClass}>Home</Link>
          <Link to="/listings" className={linkClass}>Browse Lands</Link>
          <Link to="/verified-sellers" className={linkClass}>Verified Sellers</Link>
          <Link to="/contact" className={linkClass}>Contact Us</Link>
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode} className={iconBtnClass} aria-label="Toggle Theme">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className={`w-px h-6 mx-2 opacity-50 ${isTransparent ? 'bg-white' : 'bg-gray-300 dark:bg-gray-700'}`} />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full border transition-all ${
                  isTransparent 
                    ? 'border-white/30 hover:bg-white/20 text-white' 
                    : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-800 dark:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center font-bold text-xs text-white shadow-sm">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-2xl p-2 z-20">
                    <Link
                      to="/profile?tab=add-listing"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Post a Land Ad
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <a 
                        href="http://localhost:5174" 
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        Admin Panel
                      </a>
                    )}
                    <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <button
                onClick={openLoginModal}
                className={`text-sm font-bold transition-colors ${
                  isTransparent ? 'text-green-100 hover:text-white' : 'text-gray-700 dark:text-gray-200 hover:text-green-600'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => openRegisterModal()}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-transform hover:scale-105 flex items-center gap-2 ${
                  isTransparent 
                    ? 'bg-green-600 text-white hover:bg-green-500 shadow-md shadow-green-600/30' 
                    : 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                }`}
              >
                Sign Up <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggleDarkMode} className={iconBtnClass}>
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className={iconBtnClass}>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-4 rounded-3xl bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 shadow-2xl p-5 z-50">
          <div className="space-y-1">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Home</Link>
            <Link to="/listings" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Browse Lands</Link>
            <Link to="/verified-sellers" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Verified Sellers</Link>
            <Link to="/contact" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">Contact Us</Link>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <div className="space-y-1">
                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900">Profile</Link>
                {user?.role === 'admin' && (
                  <a href="http://localhost:5174" className="block px-5 py-3.5 rounded-2xl text-base font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">Admin Panel</a>
                )}
                <button onClick={() => { setIsOpen(false); handleLogout(); }} className="w-full text-left px-5 py-3.5 rounded-2xl text-base font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setIsOpen(false); openLoginModal(); }}
                  className="block w-full text-center py-3.5 rounded-2xl text-base font-semibold border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsOpen(false); openRegisterModal(); }}
                  className="block text-center py-3.5 bg-green-600 text-white rounded-2xl text-base font-bold shadow-lg shadow-green-500/30"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
