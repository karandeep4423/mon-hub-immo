'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import NotificationBell from '../notifications/NotificationBell';
import { Features } from '@/lib/constants';

export default function Header() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user, logout } = useAuth();

	return (
		<header className="bg-white shadow-lg relative z-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex-shrink-0">
						<Link
							href="/"
							className="inline-flex items-baseline text-2xl font-bold hover:opacity-90"
						>
							<span className="text-black">mon</span>
							<span className="text-[#6AD1E3]">hubimmo</span>
						</Link>
					</div>

					<div className="flex items-center space-x-2">
						{/* Desktop actions */}
						<div className="hidden md:flex items-center space-x-4">
							{user ? (
								<>
									<NotificationBell />
									<Link
										href="/dashboard"
										className="inline-flex items-center space-x-2 hover:opacity-80"
									>
										<ProfileAvatar
											user={user}
											size="sm"
											className="w-8 h-8"
										/>
										<span className="text-gray-700 text-sm">
											{user.firstName} {user.lastName}
										</span>
									</Link>
									<button
										className="px-4 py-2 rounded-md bg-[#6AD1E3] text-white text-sm hover:bg-[#59c4d8]"
										onClick={() => logout()}
									>
										Déconnexion
									</button>
								</>
							) : (
								<>
									<Link
										href={Features.Auth.AUTH_ROUTES.SIGNUP}
										className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
									>
										Nous rejoindre
									</Link>
									<Link
										href={Features.Auth.AUTH_ROUTES.LOGIN}
										className="px-4 py-2 rounded-md bg-[#6AD1E3] text-white text-sm hover:bg-[#59c4d8]"
									>
										Se connecter
									</Link>
								</>
							)}
						</div>

						{/* Mobile inline actions + toggle */}
						<div className="flex items-center md:hidden space-x-2">
							{user ? (
								<NotificationBell />
							) : (
								<Link
									href={Features.Auth.AUTH_ROUTES.LOGIN}
									className="px-3 py-1.5 rounded-md bg-[#6AD1E3] text-white text-xs hover:bg-[#59c4d8]"
								>
									Se connecter
								</Link>
							)}
							<button
								className="text-gray-500 hover:text-[#6AD1E3]"
								onClick={() =>
									setIsMobileMenuOpen(!isMobileMenuOpen)
								}
								aria-label="Toggle menu"
								aria-expanded={isMobileMenuOpen}
							>
								<svg
									className="h-6 w-6"
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
				</div>
			</div>

			{/* Mobile menu content */}
			{isMobileMenuOpen && (
				<div className="md:hidden border-t border-gray-100 bg-white">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 space-y-3">
						{user ? (
							<>
								<div className="flex items-center justify-between">
									<Link
										href="/dashboard"
										className="flex items-center space-x-2"
										onClick={() =>
											setIsMobileMenuOpen(false)
										}
									>
										<ProfileAvatar
											user={user}
											size="sm"
											className="w-8 h-8"
										/>
										<span className="text-gray-700 text-sm">
											{user.firstName} {user.lastName}
										</span>
									</Link>
									<NotificationBell />
								</div>
								<button
									className="w-full px-4 py-2 rounded-md bg-[#6AD1E3] text-white text-sm hover:bg-[#59c4d8]"
									onClick={() => {
										setIsMobileMenuOpen(false);
										logout();
									}}
								>
									Déconnexion
								</button>
							</>
						) : (
							<div className="grid grid-cols-2 gap-2">
								<Link
									href={Features.Auth.AUTH_ROUTES.SIGNUP}
									className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 text-sm text-center hover:bg-gray-200"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Nous rejoindre
								</Link>
								<Link
									href={Features.Auth.AUTH_ROUTES.LOGIN}
									className="px-4 py-2 rounded-md bg-[#6AD1E3] text-white text-sm text-center hover:bg-[#59c4d8]"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									Se connecter
								</Link>
							</div>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
