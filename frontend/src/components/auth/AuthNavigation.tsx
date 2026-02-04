'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'
import { handleSignOut } from '@/lib/auth';

interface AuthNavigationProps {
  currentPage?: 'signin' | 'signup' | 'dashboard';
}

export default function AuthNavigation({ currentPage }: AuthNavigationProps) {
  const { user, loading, signout } = useAuth();
  const router = useRouter();

  const handleSignOutClick = async () => {
    try {
      await signout();
      // Redirect to home page immediately after signout
      router.push('/');
      router.refresh(); // Refresh to update auth state
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to home page
      router.push('/');
    }
  };

  // If still loading, don't render navigation
  if (loading) {
    return null;
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-soft border-b border-gray-100 sticky top-0 z-50" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center space-x-2 group"
              aria-label="Todo App home page"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
                Todo App
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4" role="group" aria-label="User menu">
                <span className="hidden sm:block text-gray-700 font-medium" aria-label={`Welcome, ${user.name || user.email}`}>
                  Welcome, <span className="text-primary-600 font-bold">{user.name || user.email}</span>
                </span>
                <button
                  onClick={handleSignOutClick}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  aria-label="Sign out of your account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-3" role="group" aria-label="Authentication menu">
                {currentPage !== 'signin' && (
                  <Link
                    href="/auth/signin"
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-primary-600 rounded-xl hover:bg-primary-50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Link>
                )}
                {currentPage !== 'signup' && (
                  <Link
                    href="/auth/signup"
                    className="px-5 py-2.5 text-sm font-bold text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                    aria-label="Create a new account"
                  >
                    Sign Up
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}