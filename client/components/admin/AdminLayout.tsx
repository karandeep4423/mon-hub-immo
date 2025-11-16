'use client';
import React, { ReactNode, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import HeaderAdmin from './HeaderAdmin';

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="flex min-h-screen bg-gray-50">
			{/* Sidebar */}
			<SidebarAdminModern isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

			{/* Overlay for mobile */}
			{menuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setMenuOpen(false)}
				/>
			)}

			{/* Main content */}
			<div className="flex-1 flex flex-col">
 				<main className="flex-1 p-6 lg:p-8 overflow-auto">
					<div className="max-w-7xl mx-auto">
						{children}
					</div>
				</main>
			</div>
		</div>
	);
}
