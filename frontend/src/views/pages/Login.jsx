import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate(from, { replace: true });
    } else {
      setError(res.error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 pt-28 pb-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Sign in to search, chat, and save land properties.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 rounded-xl text-xs border border-red-200 dark:border-red-900/35">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-805 text-xs text-gray-500 dark:text-gray-400">
          <span>Don't have an account? </span>
          <Link to="/register" className="font-bold text-green-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
