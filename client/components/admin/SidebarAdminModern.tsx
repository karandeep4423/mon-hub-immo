 'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { designTokens } from '@/lib/constants/designTokens';
import { BarChart2, Users, Home, Handshake, Settings } from 'lucide-react';

const navItems = [
	{
		label: 'Tableau de bord',
		href: '/admin',
		icon: <BarChart2 className="w-5 h-5" />, 
		badge: null,
	},
	{
		label: 'Utilisateurs',
		href: '/admin/users',
		icon: <Users className="w-5 h-5" />,
		badge: null,
	},
	{
		label: 'Annonces',
		href: '/admin/properties',
		icon: <Home className="w-5 h-5" />,
		badge: null,
	},
	{
		label: 'Collaborations',
		href: '/admin/collaborations',
		icon: <Handshake className="w-5 h-5" />,
		badge: null,
	},
 
];

interface SidebarAdminModernProps {
	isOpen?: boolean;
	onClose?: () => void;
	headerHeight?: number;
}

export const SidebarAdminModern: React.FC<SidebarAdminModernProps> = ({ isOpen = true, onClose, headerHeight = 64 }) => {
	const pathname = usePathname();

	return (
		<aside
			className={`
				fixed left-0 z-40 w-72 bg-white
				text-gray-900 shadow transition-transform duration-300 border-r border-gray-200
				${isOpen ? 'translate-x-0' : '-translate-x-full'}
				lg:translate-x-0 lg:sticky flex flex-col
			`}
			style={{ top: `${headerHeight}px`, height: `calc(100vh - ${headerHeight}px)` }}
		>
			{/* Header */}
		 

			{/* Navigation */}
			<nav className="p-4 space-y-2 flex-1 overflow-y-auto">
				{navItems.map((item) => {
					const isActive =
						item.href === '/admin'
							? pathname === item.href
							: pathname.startsWith(item.href);
					return (
						<Link
							key={item.href}
							href={item.href}
							onClick={onClose}
							className={`
								flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300
								${isActive
									? 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg text-white'
									: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
								}
							`}
						>
							<span className="text-xl">{item.icon}</span>
							<span className="font-medium">{item.label}</span>
							{item.badge && (
								<span className="ml-auto bg-red-500 text-xs font-bold px-2 py-1 rounded-full text-white">
									{item.badge}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
				<p>&copy; 2025 MonHubImmo</p>
				<p className="mt-1">Admin Dashboard v1.0</p>
			</div>
		</aside>
	);
};

export default SidebarAdminModern;
