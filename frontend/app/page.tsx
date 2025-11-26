'use client';

import { useState } from 'react';

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      // Get OAuth URL from backend
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/x/authorize`);
      const data = await response.json();
      
      // Redirect to X OAuth
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      alert('Failed to connect to X. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
              X Analytics Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track your X (Twitter) followers, discover non-followers, analyze engagement, 
              and monitor your growth with powerful analytics tools.
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-4 font-medium">
              🚀 Sign in with X → Instant analytics → No registration needed!
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mt-8">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="px-12 py-5 bg-black text-white rounded-lg font-bold text-lg hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Connecting...
                </>
              ) : (
                <>
                  <svg className="w-7 h-7 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  Sign in with X (Twitter)
                </>
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              🔒 Secure OAuth 2.0 • One-click authentication • No passwords needed
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Non-Followers Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                See who you follow that doesn't follow you back with detailed profiles and sorting options.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Engagement Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Analyze follower quality, demographics, and engagement patterns to understand your audience.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                Growth Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitor daily follower gains and losses with beautiful charts and trend analysis.
              </p>
            </div>
          </div>

          <div className="mt-16 text-sm text-gray-500 dark:text-gray-400">
            <p>Safe, secure, and compliant with X API terms of service</p>
          </div>
        </div>
      </div>
    </div>
  );
}
