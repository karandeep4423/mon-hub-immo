 'use client';
 import React from 'react';
 import Link from 'next/link';
 import { BarChart2, Users, Home, Handshake } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Tableau', icon: <BarChart2 className="w-5 h-5" /> },
  { href: '/admin/users', label: 'Utilisateurs', icon: <Users className="w-5 h-5" /> },
  { href: '/admin/properties', label: 'Annonces', icon: <Home className="w-5 h-5" /> },
  { href: '/admin/collaborations', label: 'Collab', icon: <Handshake className="w-5 h-5" /> },
];

export default function AdminMobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-inner md:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="flex-1">
              <div className="flex flex-col items-center justify-center py-2 text-gray-700 hover:text-brand">
                <div className="p-2 rounded-md">{n.icon}</div>
                <div className="text-xs mt-1">{n.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
