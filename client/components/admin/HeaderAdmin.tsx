'use client';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { designTokens } from '@/lib/constants/designTokens';

interface HeaderAdminProps {
	onMenuToggle?: () => void;
	menuOpen?: boolean;
}

export const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onMenuToggle, menuOpen = false }) => {
	const { user, logout } = useAuth();
	const [profileOpen, setProfileOpen] = useState(false);

	return (
		<header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
			<div className="px-6 py-4 flex items-center justify-between">
				{/* Left: Menu toggle */}
				<div className="flex items-center gap-4">
					<button
						onClick={onMenuToggle}
						className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
						aria-label="Toggle menu"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
						</svg>
					</button>
					<h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
						Admin Dashboard
					</h1>
				</div>

				{/* Right: User menu */}
				<div className="flex items-center gap-4">
					{/* Notifications */}
					<button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
						<svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
						</svg>
						<span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
					</button>

					{/* Profile dropdown */}
					<div className="relative">
						<button
							onClick={() => setProfileOpen(!profileOpen)}
							className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
								{user?.firstName?.charAt(0) || 'A'}
							</div>
							<span className="text-sm font-medium text-gray-700 hidden sm:inline">
								{user?.firstName || 'Admin'}
							</span>
							<svg className={`w-4 h-4 text-gray-600 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
							</svg>
						</button>

						{profileOpen && (
							<div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
								<button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors">
									Mon profil
								</button>
								<button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors">
									Paramètres
								</button>
								<hr className="my-2" />
								<button
									onClick={() => {
										logout();
										setProfileOpen(false);
									}}
									className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
								>
									Déconnexion
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default HeaderAdmin;
