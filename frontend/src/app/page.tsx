'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import AuthNavigation from '@/components/auth/AuthNavigation';
import { useEffect } from 'react';

/**
 * Landing Page Component
 *
 * This is the main entry point of the application (localhost:3000).
 * It displays a welcome message and call-to-action for new users.
 * The AuthNavigation component provides Sign In/Sign Up links in the navbar.
 *
 * Client Component: Required for useAuth hook and navigation logic
 */
export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <>
        <AuthNavigation />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" role="status" aria-label="Loading"></div>
        </div>
      </>
    );
  }

  // Don't render content if user is authenticated (will redirect)
  if (user) {
    return null;
  }

  return (
    <>
      {/* Navigation bar with Sign In/Sign Up links */}
      <AuthNavigation />

      {/* Hero Section with Gradient Background */}
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-accent-50 to-purple-100 opacity-70"></div>

        {/* Animated Background Shapes */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>

        <div className="relative max-w-6xl w-full text-center animate-fade-in">
          {/* Main Heading with Gradient Text */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
            <span className="block text-gray-900 mb-2">Welcome to</span>
            <span className="block bg-gradient-to-r from-primary-600 via-purple-600 to-accent-600 bg-clip-text text-transparent">
              Todo App
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            Organize your tasks, boost your productivity, and achieve your goals with our
            <span className="text-primary-600 font-bold"> simple and powerful </span>
            task management application.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/auth/signup"
              className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-glow-lg min-w-[220px]"
              style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              aria-label="Get started by creating an account"
            >
              <span className="relative z-10">Get Started</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/auth/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-700 bg-white border-2 border-primary-200 rounded-2xl hover:bg-primary-50 hover:border-primary-300 hover:shadow-soft transition-all duration-300 hover:scale-105 min-w-[220px]"
              aria-label="Sign in to your existing account"
            >
              Sign In
            </Link>
          </div>

          {/* Features Section */}
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft border-2 border-gray-100 hover:border-primary-200 hover:shadow-medium transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Task Management</h3>
              <p className="text-gray-600 leading-relaxed">Create, edit, and organize your tasks with a simple and intuitive interface designed for productivity.</p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft border-2 border-gray-100 hover:border-primary-200 hover:shadow-medium transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure & Private</h3>
              <p className="text-gray-600 leading-relaxed">Your tasks are protected with secure authentication and encrypted storage for complete peace of mind.</p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-soft border-2 border-gray-100 hover:border-primary-200 hover:shadow-medium transition-all duration-300 hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast & Responsive</h3>
              <p className="text-gray-600 leading-relaxed">Access your tasks from any device with a lightning-fast, responsive design that works everywhere.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}