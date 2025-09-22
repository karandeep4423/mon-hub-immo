'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name: string } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="bg-gradient-to-r from-gray-100 to-white shadow-xl relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex-shrink-0">
            <Link href="/">
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-gray-800">mon</span>
                <span className="text-[#6AD1E3]">hubimmo</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
          </nav>

          <div className="flex items-center space-x-4">
            {!user && (
              <>
                <Link
                  href="/auth/signup"
                  className="hidden md:inline-flex items-center px-5 py-2 border-2 border-[#F97316] text-[#F97316] rounded-full hover:bg-[#F97316] hover:text-white transition-all duration-300 font-medium"
                >
                  Nous rejoindre
                </Link>
                <Link
                  href="/auth/login"
                  className="hidden md:inline-flex items-center px-5 py-2 bg-[#6AD1E3] text-white rounded-full hover:bg-[#4AB9CC] shadow-lg transition-all duration-300 font-medium"
                >
                  Se connecter
                </Link>
              </>
            )}

            <button
              className="md:hidden text-gray-600 hover:text-[#6AD1E3] transition-colors duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="h-7 w-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden bg-white shadow-md">
            <div className="px-4 py-3 space-y-2">
              {!user && (
                <>
                  <Link
                    href="/auth/signup"
                    className="block text-gray-600 hover:text-[#6AD1E3] font-medium"
                  >
                    Nos rejoindre
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block text-gray-600 hover:text-[#6AD1E3] font-medium"
                  >
                    Se connecter
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}