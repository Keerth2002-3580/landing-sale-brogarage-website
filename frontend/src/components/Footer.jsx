import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Share2, MessageCircle, Globe, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { openRegisterModal } = useAuth();
  return (
    <footer 
      className="border-t border-emerald-950 mt-20 transition-all text-white"
      style={{ backgroundColor: '#003B2F' }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-extrabold tracking-wider text-white">
              LANKALAND
            </span>
            <p className="text-sm text-gray-300">
              Sri Lanka's premier specialized marketplace for buying, selling, and leasing agricultural, commercial, and residential land plots.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-green-300 transition-colors" aria-label="Share site"><Share2 className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-green-300 transition-colors" aria-label="Official chat"><MessageCircle className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-green-300 transition-colors" aria-label="Web link"><Globe className="w-5 h-5" /></a>
              <a href="#" className="text-gray-300 hover:text-green-300 transition-colors" aria-label="Connect"><LinkIcon className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Marketplace</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/listings?category=residential" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Residential Lands
                </Link>
              </li>
              <li>
                <Link to="/listings?category=commercial" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Commercial Properties
                </Link>
              </li>
              <li>
                <Link to="/listings?category=agriculture" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Agricultural Lands
                </Link>
              </li>
              <li>
                <Link to="/listings?isFeatured=true" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Featured Lands
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Help & Support</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/contact" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <button
                  onClick={() => openRegisterModal('agent')}
                  className="text-sm text-gray-300 hover:text-green-300 transition-colors text-left"
                >
                  Become a Verified Seller
                </button>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-300 hover:text-green-300 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">Office Info</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>100 Galle Road, Colombo 03, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>info@lankaland.lk</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-emerald-950 text-center">
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} LankaLand. All rights reserved. Built for secure land transactions.
          </p>
        </div>
      </div>
    </footer>
  );
}
