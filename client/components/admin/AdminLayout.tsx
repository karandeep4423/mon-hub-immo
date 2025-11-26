'use client';
import React, { ReactNode, useState } from 'react';
import SidebarAdminModern from './SidebarAdminModern';
import { useEffect } from 'react';
import AdminMobileNav from './AdminMobileNav';

interface AdminLayoutProps {
	children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	const [menuOpen, setMenuOpen] = useState(false);
	const [headerHeight, setHeaderHeight] = useState<number>(64);
	// Runtime vertical offset to correct unexpectedly large gaps produced by
	// some dashboard children (measured after render). This is a safe,
	// computed adjustment (never a hard-coded pixel value) that only pulls
	// the content up when the main content is rendered far below the header.
	const [verticalOffset, setVerticalOffset] = useState<number>(0);

	useEffect(() => {
		const measure = () => {
			const header = document.querySelector('header');
			if (header) {
				const h = Math.ceil((header as HTMLElement).getBoundingClientRect().height);
				setHeaderHeight(h || 64);
			}
		};

		// Also measure the main content and compute a corrective offset if the
		// main element is positioned far below the header (this fixes cases
		// where a child component adds large top spacing). We only apply a
		// negative translate when necessary and keep the adjustment dynamic.
		const measureAndAdjust = () => {
			measure();
			const main = document.querySelector('main');
			if (!main) {
				setVerticalOffset(0);
				return;
			}

			const mainRect = (main as HTMLElement).getBoundingClientRect();
			const gap = Math.round(mainRect.top) - (Math.round((document.querySelector('header') as HTMLElement)?.getBoundingClientRect().height) || headerHeight);
			// If the gap is larger than a small threshold, pull content up by that amount.
			if (gap > 48) {
				setVerticalOffset(-gap);
			} else {
				setVerticalOffset(0);
			}
		};
		measure();

		// Run measurements on resize and also shortly after mount to catch
		// content that renders slightly later.
		window.addEventListener('resize', measureAndAdjust);
		const t = window.setTimeout(measureAndAdjust, 160);
		return () => {
			window.removeEventListener('resize', measureAndAdjust);
			clearTimeout(t);
		};
	}, []);

	// Only keep headerHeight measurement (used by the sidebar positioning).

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

			{/* Main content - shift right on large screens to account for fixed sidebar.
				Use a responsive, header-aware negative top offset instead of a fixed -650px.
				We compute the offset from the measured header height so the content will
				always sit correctly beneath the sticky header on all screen sizes. */}
			<div
				className="lg:ml-72"
				// Keep main content below the sticky header by adding top padding equal to the header height.
				// Additionally apply a small, computed upward translate when child content
				// has pushed the main too far down (this avoids reintroducing hard-coded
				// negative margins). The translate is only applied when required.
				style={{ paddingTop: `${headerHeight}px`, transform: `translateY(${verticalOffset}px)` }}
			>
				<main className="p-4 sm:p-6 lg:p-8">
					{children}
				</main>
			</div>

			{/* Mobile bottom navigation for quick access to admin sections */}
			<AdminMobileNav />

			{/* Debug overlay removed - keeping layout clean for production */}
		</div>
	);
}
