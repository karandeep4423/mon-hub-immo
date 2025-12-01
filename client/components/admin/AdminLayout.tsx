'use client';
import React, { ReactNode, useEffect, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import AdminMobileNav from './AdminMobileNav';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';

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
		const rawRole: unknown = (user as any)?.role ?? (user as any)?.type ?? (user as any)?.userType;
		const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : undefined;
		const isAdminFlag = Boolean((user as any)?.isAdmin);
		if (isAdminRoute && user && !(isAdminFlag || role === 'admin' || role === 'administrator')) {
			router.replace('/dashboard');
		}
	}, [loading, user, pathname, router]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
			{/* Modern Sticky Header */}
 	 

			{/* Sidebar */}
			<SidebarAdminModern isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

			{/* Overlay for mobile */}
			{menuOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
					onClick={() => setMenuOpen(false)}
				/>
			)}

			{/* Main content */}
			<div className="lg:ml-72 pt-16">
				<main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-[1600px] mx-auto">
					{/* Prevent rendering protected content briefly for non-admins */}
					{loading
						? children
						: ((): React.ReactNode => {
							const rawRole: unknown = (user as any)?.role ?? (user as any)?.type ?? (user as any)?.userType;
							const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : undefined;
							const isAdminFlag = Boolean((user as any)?.isAdmin);
							return user && (isAdminFlag || role === 'admin' || role === 'administrator') ? children : null;
						})()}
				</main>
			</div>

			{/* Mobile bottom navigation */}
			<AdminMobileNav />
		</div>
	);
}
