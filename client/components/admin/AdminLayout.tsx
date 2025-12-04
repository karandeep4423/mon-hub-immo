'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import AdminMobileNav from './AdminMobileNav';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@/types/auth';

const isAdminUser = (u: User | null | undefined): boolean => {
	if (!u) return false;
	// Normalize role/userType
	const rawRole = u.userType;
	const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
	// Some backends may also set a boolean flag
	const flag = (u as unknown as { isAdmin?: boolean }).isAdmin === true;
	return flag || role === 'admin' || role === 'administrator';
};

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const { user, loading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	// Guard: Only allow admins to access /admin routes
	useEffect(() => {
		// Avoid running before auth state is known
		if (loading) return;
		// If user exists and is not admin on /admin, redirect to dashboard
		const isAdminRoute = pathname?.startsWith('/admin');
		if (isAdminRoute && user && !isAdminUser(user as User)) {
			router.replace('/dashboard');
		}
	}, [loading, user, pathname, router]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-x-hidden">
			{/* Modern Sticky Header */}

			{/* Sidebar */}
			<SidebarAdminModern
				isOpen={menuOpen}
				onClose={() => setMenuOpen(false)}
			/>

			{/* Overlay for mobile */}
			{menuOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={() => setMenuOpen(false)}
				/>
			)}

			{/* Main content */}
			<div className="lg:ml-72 min-w-0">
				<main className="p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] mx-auto overflow-x-hidden">
					{/* Prevent rendering protected content briefly for non-admins */}
					{loading
						? children
						: user && isAdminUser(user as User)
							? children
							: null}
				</main>
			</div>

			{/* Mobile bottom navigation */}
			<AdminMobileNav />
		</div>
	);
}
