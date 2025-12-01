'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart2, Users, Home, Handshake } from 'lucide-react';

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
}

export const SidebarAdminModern: React.FC<SidebarAdminModernProps> = ({ isOpen = true, onClose }) => {
	const pathname = usePathname();

	return (
		<aside
			className={`
				fixed left-0 top-16 z-40 w-72 h-[calc(100vh-4rem)] bg-white
				border-r border-gray-200 shadow-xl transition-all duration-300 ease-in-out
				${isOpen ? 'translate-x-0' : '-translate-x-full'}
				lg:translate-x-0 flex flex-col
			`}
		>
			{/* Navigation */}
			<nav className="p-4 space-y-1.5 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
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
								flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200
								group relative overflow-hidden
								${isActive
									? 'bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 text-white scale-[1.02]'
									: 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
								}
							`}
						>
							{isActive && (
								<div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
							)}
							<span className={`${isActive ? 'text-white' : 'text-gray-600 group-hover:text-cyan-600'} transition-colors relative z-10`}>
								{item.icon}
							</span>
							<span className="font-semibold text-sm relative z-10">{item.label}</span>
							{item.badge && (
								<span className="ml-auto bg-red-500 text-xs font-bold px-2 py-1 rounded-full text-white shadow-md relative z-10">
									{item.badge}
								</span>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Quick Stats */}
 

			{/* Footer */}
			<div className="p-4 border-t border-gray-200 text-xs text-gray-500">
				<div className="flex items-center justify-between">
					<span>&copy; 2025 MonHubImmo</span>
					<span className="text-cyan-600 font-semibold">v1.0</span>
				</div>
			</div>
		</aside>
	);
};

export default SidebarAdminModern;
