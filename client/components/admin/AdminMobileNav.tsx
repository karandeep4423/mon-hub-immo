'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Users, Home, Handshake, MessageSquare } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Tableau', icon: BarChart2 },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/properties', label: 'Annonces', icon: Home },
  { href: '/admin/collaborations', label: 'Collab', icon: Handshake },
];

export default function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl lg:hidden safe-area-inset-bottom">
      <div className="grid grid-cols-4 gap-0">
        {nav.map((n) => {
          const Icon = n.icon;
          const isActive = n.href === '/admin' ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`
                flex flex-col items-center justify-center py-2.5 px-2 transition-all duration-200
                ${isActive 
                  ? 'text-cyan-600' 
                  : 'text-gray-500 hover:text-gray-700 active:bg-gray-50'
                }
              `}
            >
              <div className={`
                p-2 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 scale-110' 
                  : 'bg-transparent'
                }
              `}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-all ${
                isActive ? 'text-cyan-600 font-semibold' : ''
              }`}>
                {n.label}
              </span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
