// components/auth/AuthLayout.tsx
import React from 'react';
import Head from 'next/head';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Head>
        <title>{title} - HubImmo</title>
        <meta name="description" content="HubImmo authentication" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      {/* Mobile-first header */}
      {/* <div className="flex-shrink-0 px-4 pt-8 pb-4 sm:px-6 sm:pt-12">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl sm:text-2xl">Hi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">HubImmo</h2>
          <h3 className="text-lg sm:text-xl font-medium text-gray-700">{title}</h3>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 px-4">{subtitle}</p>
          )}
        </div>
      </div> */}

      {/* Mobile-optimized form container */}
      <div className="flex-1 flex flex-col px-4 sm:px-6">
        <div className="flex-1 w-full max-w-sm mx-auto sm:max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
