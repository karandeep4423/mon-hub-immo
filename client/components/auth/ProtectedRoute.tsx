// components/auth/ProtectedRoute.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useProtectedRoute } from '@/hooks/useAuth';
import { PageLoader } from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requiredUserType?: 'buyer' | 'seller' | 'agent';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/auth/login',
  requiredUserType,
}) => {
  const router = useRouter();
  const { user, loading, shouldRedirect, isAuthenticated } = useProtectedRoute();

  React.useEffect(() => {
    if (shouldRedirect) {
      router.push(redirectTo);
    }
  }, [shouldRedirect, router, redirectTo]);

  // Show loading while checking authentication
  if (loading) {
    return <PageLoader message="Checking authentication..." />;
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <PageLoader message="Redirecting to login..." />;
  }

  // Check user type if specified
  if (requiredUserType && user?.userType !== requiredUserType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-4">
            This page is only available for {requiredUserType}s.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Render protected content
  return <>{children}</>;
};
