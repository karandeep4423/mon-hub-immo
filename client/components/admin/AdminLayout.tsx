'use client';
import React, { ReactNode, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import { useEffect } from 'react';

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [headerHeight, setHeaderHeight] = useState<number>(64);

	useEffect(() => {
		const measure = () => {
			const header = document.querySelector('header');
			if (header) {
				const h = Math.ceil((header as HTMLElement).getBoundingClientRect().height);
				setHeaderHeight(h || 64);
			}
		};
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, []);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Sidebar */}
			<SidebarAdminModern isOpen={menuOpen} onClose={() => setMenuOpen(false)} headerHeight={headerHeight} />

			{/* Overlay for mobile */}
			{menuOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 lg:hidden"
					onClick={() => setMenuOpen(false)}
				/>
			)}

			{/* Main content - shift right on large screens to account for fixed sidebar */}
			<div className="lg:ml-72" style={{ marginTop: '-650px' }}>
				<main className="p-4 sm:p-6 lg:p-8">
					{children}
				</main>
			</div>
		</div>
	);
}
