'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// A client component that checks authentication and redirects if not authenticated
export default function ProtectedRoute({ children, fallback = null }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status on component mount
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);

      if (!authenticated) {
        // Redirect to sign-in page if not authenticated
        router.push('/auth/signin');
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Show fallback or loading state while checking auth
  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  // If authenticated, render the protected content
  if (isAuth) {
    return <>{children}</>;
  }

  // If not authenticated, return fallback (which should redirect in useEffect)
  return fallback || null;
}