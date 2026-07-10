import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// ── MVC: Views — Components ───────────────────────────────────────────────────
import Navbar from './views/components/Navbar';
import Footer from './views/components/Footer';
import LoginModal from './views/components/LoginModal';
import ScrollToTop from './views/components/ScrollToTop';

// ── MVC: Views — Pages ────────────────────────────────────────────────────────
import Home from './views/pages/Home';
import Listings from './views/pages/Listings';
import ListingDetails from './views/pages/ListingDetails';
import Login from './views/pages/Login';
import Register from './views/pages/Register';
import Profile from './views/pages/Profile';
import Contact from './views/pages/Contact';
import Districts from './views/pages/Districts';
import VerifiedSellers from './views/pages/VerifiedSellers';
import AuthCallback from './views/pages/AuthCallback';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          {/* Scroll to top on every route change */}
          <ScrollToTop />

          {/* Login Modal - Global */}
          <LoginModal />

          {/* Header */}
          <Navbar />

          {/* Main Workspace */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/districts" element={<Districts />} />
              <Route path="/verified-sellers" element={<VerifiedSellers />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
            </Routes>
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
