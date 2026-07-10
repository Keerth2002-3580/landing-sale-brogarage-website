import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, User as UserIcon, Phone, UserCheck, AlertCircle } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('user'); // user or agent
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await register(name, email, password, phone, role);
    setLoading(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 pt-28 pb-12">
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-5">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Join LankaLand to post listings and reach buyers.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-655 dark:text-red-400 rounded-xl text-xs border border-red-200 dark:border-red-900/35">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 bg-gray-100 dark:bg-gray-950 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'user'
                  ? 'bg-white dark:bg-gray-850 text-green-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Buyer
            </button>
            <button
              type="button"
              onClick={() => setRole('agent')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'agent'
                  ? 'bg-white dark:bg-gray-850 text-green-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Land Seller
            </button>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Full Name</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Email Address */}
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

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Phone Number</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-850 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Password (min 6 characters)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-855 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
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

        <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-805 text-xs text-gray-500 dark:text-gray-400">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-green-600 hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}
