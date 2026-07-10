import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LandPlot, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error || !token) {
        setStatus('error');
        setMessage(
          error === 'google_failed'
            ? 'Google login was cancelled or failed.'
            : 'Authentication failed. Please try again.'
        );
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      try {
        // Save token to localStorage
        localStorage.setItem('token', token);

        // Fetch the user profile using the token
        const res = await fetch('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          // Manually update AuthContext by reloading (token is already in localStorage)
          setStatus('success');
          setMessage(`Welcome, ${data.data.name}! 🎉`);
          setTimeout(() => {
            window.location.href = '/'; // full reload so AuthContext picks up token
          }, 1500);
        } else {
          throw new Error(data.error || 'Failed to fetch user');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="text-center space-y-6 max-w-sm">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500 flex items-center justify-center shadow-xl shadow-green-500/30">
            <LandPlot className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Status */}
        {status === 'loading' && (
          <>
            <Loader2 className="w-10 h-10 text-green-500 animate-spin mx-auto" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Signing you in…</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Verifying your Google account
              </p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Redirecting you to LankaLand…
              </p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">Login Failed</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{message}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Redirecting you back…
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
