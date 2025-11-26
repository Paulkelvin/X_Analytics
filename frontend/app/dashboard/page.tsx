'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface XAccount {
  xUserId: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
  followersCount: number;
  followingCount: number;
  lastSyncedAt: string | null;
}

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [xAccount, setXAccount] = useState<XAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Check for successful OAuth connection
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true' || params.get('connected') === 'true') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
      // Clean URL
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      // Don't redirect if not logged in - user might be coming from OAuth
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
      }
    } else if (user) {
      fetchXAccountStatus();
    }
  }, [user, authLoading, router]);

  const fetchXAccountStatus = async () => {
    try {
      const response = await api.get('/api/auth/x/status');
      if (response.data.connected) {
        setXAccount(response.data.account);
      }
    } catch (error) {
      console.error('Failed to fetch X account status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectX = async () => {
    try {
      const response = await api.get('/api/auth/x/authorize');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate X auth:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await api.post('/api/followers/sync');
      alert('Sync initiated! This may take a few minutes.');
      setTimeout(fetchXAccountStatus, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      alert('Sync failed. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <span className="text-xl">✓</span>
          <span className="font-medium">Successfully connected to X!</span>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              X Analytics
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-600 dark:text-gray-300">
                {user?.username}
              </span>
              <button
                onClick={logout}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {!xAccount ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">🐦</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Connect Your X (Twitter) Account
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                To start tracking your followers and analytics, you need to authorize this app with your X account.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                You'll be redirected to X (Twitter) to authorize access. We only request read permissions for your follower data.
              </p>
              <button
                onClick={handleConnectX}
                className="px-8 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Authorize with X (Twitter)
              </button>
              <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                Secure OAuth 2.0 authentication • No passwords stored • Revoke access anytime
              </p>
            </div>
          </div>
        ) : (
          <div>
            {/* X Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {xAccount.profileImageUrl && (
                    <img
                      src={xAccount.profileImageUrl}
                      alt={xAccount.displayName}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {xAccount.displayName}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      @{xAccount.username}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span><strong>{xAccount.followersCount}</strong> Followers</span>
                      <span><strong>{xAccount.followingCount}</strong> Following</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Syncing...' : 'Sync Now'}
                </button>
              </div>
              {xAccount.lastSyncedAt && (
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Last synced: {new Date(xAccount.lastSyncedAt).toLocaleString()}
                </p>
              )}
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg mb-8">
              <div className="flex border-b border-gray-200 dark:border-gray-700">
                <Link
                  href="/dashboard/non-followers"
                  className="px-6 py-4 text-blue-600 dark:text-blue-400 font-semibold border-b-2 border-blue-600"
                >
                  Non-Followers
                </Link>
                <Link
                  href="/dashboard/inactive"
                  className="px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Inactive Followers
                </Link>
                <Link
                  href="/dashboard/demographics"
                  className="px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Demographics
                </Link>
                <Link
                  href="/dashboard/engagement"
                  className="px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Engagement
                </Link>
                <Link
                  href="/dashboard/growth"
                  className="px-6 py-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Growth
                </Link>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Overview
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  View all your analytics in one place. Select a tab above to explore specific insights.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Quick Stats
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your follower stats and growth metrics will appear here after syncing.
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Actions
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your whitelist and unfollow settings from the dashboard tabs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
