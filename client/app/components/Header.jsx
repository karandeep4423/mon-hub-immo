'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useState, useEffect } from 'react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex-shrink-0">
              
            <Link href="/">
            <span className="text-2xl font-bold">
              <span className="text-black">Hub</span>
              <span className="text-[#6AD1E3]">immo</span>
            </span>
          </Link>
          
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600">En vente</Link>
            <Link href="/favorites" className="text-gray-700 hover:text-blue-600">Favoris</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-blue-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-500 hover:text-blue-600">
              {user ? <span>{user.name || 'Profil'}</span> : <Link href="/auth/sign-in"><svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Link>}
            </button>
            <button className="md:hidden text-gray-500 hover:text-blue-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <nav className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/properties" className="block text-gray-700 hover:text-blue-600">En vente</Link>
              <Link href="/favorites" className="block text-gray-700 hover:text-blue-600">Favoris</Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}