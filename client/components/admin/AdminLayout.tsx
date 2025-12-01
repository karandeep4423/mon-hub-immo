'use client';
import React, { ReactNode, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import AdminMobileNav from './AdminMobileNav';

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);

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
					{children}
				</main>
			</div>

			{/* Mobile bottom navigation */}
			<AdminMobileNav />
		</div>
	);
}
