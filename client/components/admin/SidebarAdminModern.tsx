'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { designTokens } from '@/lib/constants/designTokens';

const navItems = [
	{
		label: 'Tableau de bord',
		href: '/admin',
		icon: '📊',
		badge: null,
	},
	{
		label: 'Utilisateurs',
		href: '/admin/users',
		icon: '👥',
		badge: null,
	},
	{
		label: 'Annonces',
		href: '/admin/properties',
		icon: '🏠',
		badge: null,
	},
	{
		label: 'Collaborations',
		href: '/admin/collaborations',
		icon: '🤝',
		badge: null,
	},
	{
		label: 'Paramètres',
		href: '/admin/settings',
		icon: '⚙️',
		badge: null,
	},
];

interface SidebarAdminModernProps {
	isOpen?: boolean;
	onClose?: () => void;
}

export const SidebarAdminModern: React.FC<SidebarAdminModernProps> = ({ isOpen = true, onClose }) => {
	const pathname = usePathname();

	return (
		<aside
			className={`
				fixed inset-y-0 left-0 z-40 w-72 bg-white
				text-gray-900 shadow transition-transform duration-300 border-r border-gray-200
				${isOpen ? 'translate-x-0' : '-translate-x-full'}
				lg:translate-x-0 lg:sticky lg:top-0
			`}
		>
			{/* Header */}
			<div className="p-6 border-b border-gray-200">
				<Link href="/admin" className="flex items-center gap-2 group">
					<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center font-bold text-lg">
						MH
					</div>
					<div>
						<p className="font-black text-lg">MonHubImmo</p>
						<p className="text-xs text-gray-400">Admin Panel</p>
					</div>
				</Link>
			</div>

			{/* Navigation */}
			<nav className="p-4 space-y-2 flex-1 overflow-y-auto">
				{navItems.map((item) => {
					const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
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
