import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, ShieldAlert } from 'lucide-react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccess("Thank you! Your message has been received. Our helpdesk team will respond within 24 hours.");
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pt-28 pb-12 space-y-12">
      {/* Intro Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Get in Touch With Us
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Have questions about posting land ads, verified brokers, or subscription pricing? Drop us a message below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Info Sidebar card */}
        <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 space-y-6">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base pb-3 border-b dark:border-gray-805">
            Contact Information
          </h2>

          <div className="space-y-4 text-xs">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-gray-700 dark:text-gray-300">Office Location</span>
                <span className="text-gray-500 dark:text-gray-400 mt-1 block">100 Galle Road, Colombo 03, Sri Lanka</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-gray-700 dark:text-gray-300">Phone Hotline</span>
                <span className="text-gray-500 dark:text-gray-400 mt-1 block">+94 11 234 5678</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="block font-bold text-gray-700 dark:text-gray-300">Email Address</span>
                <span className="text-gray-500 dark:text-gray-400 mt-1 block">info@lankaland.lk</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-2xl flex items-start gap-2.5 border dark:border-gray-850">
            <HelpCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong>Need urgent help?</strong> Log in and open a direct message with our system admin desk by looking up admin listings.
            </div>
          </div>
        </div>

        {/* Form area */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="font-extrabold text-gray-900 dark:text-white text-base pb-3 border-b dark:border-gray-805">
            Submit Support Inquiry
          </h2>

          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-755 dark:text-green-300 border border-green-200 dark:border-green-900 rounded-xl text-xs">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ruwan Silva"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ruwan@example.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Inquiry Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Agent premium verification plans"
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 dark:text-gray-400">Detailed Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your support inquiry details..."
                className="w-full px-3.5 py-2.5 border rounded-xl text-xs bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-white border-gray-200 dark:border-gray-800 focus:bg-white focus:outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              Send Inquiry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
