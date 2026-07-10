import React, { useState, useEffect } from 'react';

export default function SiteSettings({ adminToken }) {
  const [heroVideoUrl, setHeroVideoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/settings');
      const data = await res.json();
      if (data && data.heroVideoUrl) {
        setHeroVideoUrl(data.heroVideoUrl);
      }
      setLoading(false);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ heroVideoUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings updated successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update settings.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server error while saving settings.' });
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm max-w-3xl">
        <h2 className="text-lg font-semibold mb-4">Hero Video Configuration</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Floating Card Video URL (MP4)
            </label>
            <input
              type="url"
              value={heroVideoUrl}
              onChange={(e) => setHeroVideoUrl(e.target.value)}
              placeholder="https://example.com/video.mp4"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-green-500 focus:border-green-500 p-2.5"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Provide a direct link to an MP4 file. This will auto-play on the homepage hero section.</p>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Live Video Preview</h3>
          {heroVideoUrl ? (
            <div className="relative w-72 h-40 rounded-xl overflow-hidden shadow-md">
              <video 
                src={heroVideoUrl} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-72 h-40 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 text-sm">
              No video URL provided
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
