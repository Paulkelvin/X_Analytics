'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import api from '@/lib/api';
import Link from 'next/link';

interface NonFollower {
  xUserId: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  location: string;
  verified: boolean;
  profileUrl: string;
}

export default function NonFollowersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [nonFollowers, setNonFollowers] = useState<NonFollower[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('followers_desc');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchNonFollowers();
    }
  }, [user, authLoading, router, sortBy]);

  const fetchNonFollowers = async () => {
    try {
      const response = await api.get(`/api/followers/non-followers?sortBy=${sortBy}`);
      setNonFollowers(response.data.nonFollowers);
    } catch (error) {
      console.error('Failed to fetch non-followers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading non-followers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-gray-900 dark:text-white hover:text-blue-600">
              X Analytics
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Non-Followers ({nonFollowers.length})
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            People you follow who don't follow you back
          </p>

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="followers_desc">Largest accounts first</option>
              <option value="followers_asc">Smallest accounts first</option>
              <option value="newest">Newest follows</option>
              <option value="oldest">Oldest follows</option>
            </select>
          </div>
        </div>

        {nonFollowers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No non-followers found. Either everyone follows you back or you need to sync your data.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {nonFollowers.map((user) => (
              <div
                key={user.xUserId}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex items-start gap-4"
              >
                <img
                  src={user.profileImageUrl || '/default-avatar.png'}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-full flex-shrink-0"
                />
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {user.displayName}
                    </h3>
                    {user.verified && (
                      <span className="text-blue-500">✓</span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    @{user.username}
                  </p>
                  {user.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                      {user.bio}
                    </p>
                  )}
                  <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span><strong>{user.followersCount.toLocaleString()}</strong> Followers</span>
                    <span><strong>{user.followingCount.toLocaleString()}</strong> Following</span>
                    {user.location && <span>📍 {user.location}</span>}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={user.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View Profile
                    </a>
                    <button
                      onClick={() => {
                        // TODO: Implement unfollow with confirmation
                        alert(`Unfollow @${user.username} - Feature coming soon!`);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      Unfollow
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Implement add to whitelist
                        alert(`Add @${user.username} to whitelist - Feature coming soon!`);
                      }}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                    >
                      Add to Whitelist
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
