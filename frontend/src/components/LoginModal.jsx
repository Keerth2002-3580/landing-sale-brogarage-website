import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, AlertCircle, X, ArrowLeft,
  Eye, EyeOff, CheckCircle2, LandPlot,
  User as UserIcon, Phone, UserCheck
} from 'lucide-react';

export default function LoginModal() {
  const { 
    login, 
    register, 
    loginModalOpen, 
    closeLoginModal, 
    authModalMode, 
    defaultRole 
  } = useAuth();

  // step: 'options' | 'email' | 'register'
  const [step, setStep] = useState('options');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── Lock body scroll & Escape key ─────────────────────── */
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeLoginModal(); };
    if (loginModalOpen) {
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [loginModalOpen, closeLoginModal]);

  /* ── Initialize / Reset on close ──────────────────────── */
  useEffect(() => {
    if (loginModalOpen) {
      if (authModalMode === 'register') {
        setStep('register');
        setRole(defaultRole || 'user');
      } else {
        setStep('options');
      }
    } else {
      setStep('options');
      setEmail('');
      setPassword('');
      setName('');
      setPhone('');
      setRole('user');
      setError('');
      setLoading(false);
      setShowPassword(false);
    }
  }, [loginModalOpen, authModalMode, defaultRole]);

  if (!loginModalOpen) return null;

  /* ── Submit ─────────────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      closeLoginModal();
    } else {
      setError(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await register(name, email, password, phone, role);
    setLoading(false);
    if (res.success) {
      closeLoginModal();
    } else {
      setError(res.error || 'Registration failed. Please try again.');
    }
  };

  const bullets = [
    'Browse 1,000+ verified land listings',
    'Connect directly with trusted sellers',
    'Save favourites & track properties',
  ];

  return (
    /* ── Overlay ───────────────────────────────────────────── */
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={closeLoginModal}
      />

      {/* ── Modal Shell ─────────────────────────────────────── */}
      <div
        className="relative flex w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
        style={{ minHeight: '520px', animation: 'loginIn .28s cubic-bezier(.34,1.56,.64,1) both' }}
      >

        {/* ════ LEFT PANEL ════════════════════════════════════ */}
        <div
          className="hidden md:flex flex-col justify-end w-5/12 relative"
          style={{
            background: 'linear-gradient(160deg, #064e3b 0%, #065f46 40%, #047857 100%)',
          }}
        >
          {/* Background image */}
          <img
            src="/login-bg.jpg"
            alt="Sri Lanka Land"
            className="absolute inset-0 w-full h-full object-cover object-center mix-blend-overlay opacity-55"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/40 to-transparent" />

          {/* Content */}
          <div className="relative p-8 pb-10 space-y-5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center shadow-lg shadow-green-400/40">
                <LandPlot className="w-4 h-4 text-emerald-950" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">LankaLand</span>
            </div>

            <h2 className="text-white font-black text-2xl leading-snug">
              Your dream<br />land starts here.
            </h2>

            <ul className="space-y-3">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-100/90 text-sm leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ════ RIGHT PANEL ════════════════════════════════════ */}
        <div className="flex-1 bg-white dark:bg-gray-950 flex flex-col justify-center px-8 py-10 relative">

          {/* Close button */}
          <button
            onClick={closeLoginModal}
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ── STEP 1 : Options ──────────────────────────────── */}
          {step === 'options' && (
            <div className="space-y-6 max-w-xs mx-auto w-full">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Sign in to your account</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setStep('register'); setError(''); }}
                    className="text-green-600 font-semibold underline underline-offset-2 hover:text-green-700"
                  >
                    Join here
                  </button>
                </p>
              </div>

              <div className="space-y-3">
                {/* Continue with Google */}
                <a
                  href="http://localhost:5000/api/auth/google"
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-sm font-semibold text-gray-800 dark:text-gray-100 group"
                >
                  {/* Google SVG icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="flex-1 text-left">Continue with Google</span>
                </a>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                </div>

                {/* Continue with Email */}
                <button
                  onClick={() => setStep('email')}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all text-sm font-semibold text-gray-800 dark:text-gray-100 group"
                >
                  <Mail className="w-5 h-5 text-gray-500 group-hover:text-green-600 transition-colors" />
                  <span className="flex-1 text-left">Continue with email</span>
                </button>
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">
                By signing in, you agree to LankaLand's{' '}
                <a href="#" className="text-green-600 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-green-600 underline">Privacy Policy</a>.
              </div>
            </div>
          )}

          {/* ── STEP 2 : Email + Password ─────────────────────── */}
          {step === 'email' && (
            <div className="space-y-5 max-w-xs mx-auto w-full">
              {/* Back */}
              <button
                onClick={() => { setStep('options'); setError(''); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors -ml-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                  Continue with your<br />email
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Additional verification may be required at a later stage.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs border border-red-200 dark:border-red-900/40">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border-2 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 border-2 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 dark:focus:border-green-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div className="text-right">
                    <a href="#" className="text-sm text-gray-500 dark:text-gray-400 underline underline-offset-2 hover:text-green-600 transition-colors">
                      Forgot password?
                    </a>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading || !email || !password}
                  className="w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: (!loading && email && password)
                      ? 'linear-gradient(135deg, #059669 0%, #10b981 100%)'
                      : '#e5e7eb',
                    color: (!loading && email && password) ? '#fff' : '#9ca3af',
                    boxShadow: (!loading && email && password)
                      ? '0 6px 24px -4px rgba(16,185,129,0.45)'
                      : 'none',
                  }}
                >
                  {loading ? 'Signing In…' : 'Sign in'}
                </button>
              </form>

              <div className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed pt-1">
                By joining, you agree to LankaLand's{' '}
                <a href="#" className="text-green-600 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-green-600 underline">Privacy Policy</a>.
              </div>
            </div>
          )}

          {/* ── STEP 3 : Register ────────────────────────────── */}
          {step === 'register' && (
            <div className="space-y-4 max-w-xs mx-auto w-full max-h-[75vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Create Account</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Join LankaLand to post listings and reach buyers.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-xs border border-red-200 dark:border-red-900/40">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign Up */}
              <a
                href="http://localhost:5000/api/auth/google"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-xs font-semibold text-gray-800 dark:text-gray-100 group"
              >
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="flex-1 text-left">Continue with Google</span>
              </a>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3" autoComplete="off">
                {/* Role selector */}
                <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setRole('user')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      role === 'user'
                        ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('agent')}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      role === 'agent'
                        ? 'bg-white dark:bg-gray-800 text-green-600 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                    }`}
                  >
                    Land Seller
                  </button>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Password (min 6 characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 border-2 rounded-xl text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 focus:outline-none focus:border-green-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4" />
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </form>

              <div className="text-center pt-3 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
                <span>Already have an account? </span>
                <button
                  onClick={() => { setStep('options'); setError(''); }}
                  className="font-bold text-green-600 hover:underline"
                >
                  Login here
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes loginIn {
          from { opacity:0; transform:scale(.93) translateY(20px); }
          to   { opacity:1; transform:scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
}
