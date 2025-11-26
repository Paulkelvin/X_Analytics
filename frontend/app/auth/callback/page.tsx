'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');

    if (error) {
      // Handle error
      router.push('/?error=' + error);
      return;
    }

    if (token) {
      // Store JWT token
      localStorage.setItem('token', token);
      
      // Redirect to dashboard
      if (connected === 'true') {
        router.push('/dashboard?success=true');
      } else {
        router.push('/dashboard');
      }
    } else {
      // No token, redirect to home
      router.push('/');
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
      </div>
    </div>
  );
}
