import React from 'react';

interface PaginationProps {
	currentPage: number;
	totalItems: number;
	pageSize?: number;
	onPageChange: (page: number) => void;
	className?: string;
	scrollTargetId?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
	currentPage,
	totalItems,
	pageSize = 9,
	onPageChange,
	className,
	scrollTargetId,
}) => {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	if (totalPages <= 1) return null;

	const scrollToTarget = () => {
		if (!scrollTargetId) return;

		// Use requestAnimationFrame for better timing with React's render cycle
		requestAnimationFrame(() => {
			setTimeout(() => {
				const element = document.getElementById(scrollTargetId);
				if (!element) return;

				// Get element position relative to viewport
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition =
					elementPosition + window.pageYOffset - 20;

				window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
			}, 50);
		});
	};

	const goTo = (p: number) => {
		const page = Math.min(totalPages, Math.max(1, p));
		onPageChange(page);
		scrollToTarget();
	};

	// Generate smart pagination with ellipsis
	const generatePageNumbers = (maxVisible: number) => {
		// If total pages fit within maxVisible, show all
		if (totalPages <= maxVisible) {
			return Array.from({ length: totalPages }, (_, i) => i + 1);
		}

		const pages: (number | string)[] = [];
		const halfVisible = Math.floor((maxVisible - 3) / 2); // Reserve 3 spots for 1, ..., last

		// Always show first page
		pages.push(1);

		// Calculate start and end of the middle range
		let startPage = Math.max(2, currentPage - halfVisible);
		let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

		// Adjust if we're near the start
		if (currentPage <= halfVisible + 2) {
			endPage = Math.min(totalPages - 1, maxVisible - 2);
			startPage = 2;
		}

		// Adjust if we're near the end
		if (currentPage >= totalPages - halfVisible - 1) {
			startPage = Math.max(2, totalPages - maxVisible + 2);
			endPage = totalPages - 1;
		}

		// Add left ellipsis if needed
		if (startPage > 2) {
			pages.push('...');
		}

		// Add middle pages
		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		// Add right ellipsis if needed
		if (endPage < totalPages - 1) {
			pages.push('...');
		}

		// Always show last page (if more than 1 page)
		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	// Responsive page counts: sm-lg: 5, lg+: 7
	const pagesSm = generatePageNumbers(5); // Tablet
	const pagesLg = generatePageNumbers(7); // Desktop

	return (
		<nav className={className} aria-label="Pagination">
			{/* Info text showing items range */}
			<div className="mt-6 mb-4 text-center text-sm text-gray-600">
				{totalItems > 0 ? (
					<p>
						Affichage de{' '}
						<span className="font-semibold">
							{(currentPage - 1) * pageSize + 1}
						</span>
						{' à '}
						<span className="font-semibold">
							{Math.min(currentPage * pageSize, totalItems)}
						</span>
						{' sur '}
						<span className="font-semibold">{totalItems}</span>
						{' article' + (totalItems > 1 ? 's' : '')}
					</p>
				) : (
					<p>Aucun article</p>
				)}
			</div>

			{/* Mobile: compact layout */}
			<ul className="flex items-center justify-between gap-3 mt-4 sm:hidden">
				<li className="flex-1">
					<button
						onClick={() => goTo(currentPage - 1)}
						disabled={currentPage === 1}
						className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
							currentPage === 1
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Précédent
					</button>
				</li>
				<li className="px-2 text-sm text-gray-600 whitespace-nowrap">
					Page {currentPage} / {totalPages}
				</li>
				<li className="flex-1">
					<button
						onClick={() => goTo(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`w-full px-3 py-2 rounded-md text-sm font-medium ${
							currentPage === totalPages
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Suivant
					</button>
				</li>
			</ul>

			{/* sm+ : numbered pagination with ellipsis (responsive) */}
			<ul className="hidden sm:flex lg:hidden items-center gap-1 justify-center mt-4 flex-wrap">
				<li>
					<button
						onClick={() => goTo(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-2 py-1.5 rounded-md text-xs font-medium ${
							currentPage === 1
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Préc
					</button>
				</li>
				{pagesSm.map((p, idx) => (
					<li key={`${p}-${idx}`}>
						{p === '...' ? (
							<span className="px-1.5 py-1.5 text-gray-500 text-xs">
								...
							</span>
						) : (
							<button
								onClick={() => goTo(p as number)}
								className={`px-2.5 py-1.5 rounded-md text-xs font-medium ${
									p === currentPage
										? 'bg-brand text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
								aria-current={
									p === currentPage ? 'page' : undefined
								}
							>
								{p}
							</button>
						)}
					</li>
				))}
				<li>
					<button
						onClick={() => goTo(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`px-2 py-1.5 rounded-md text-xs font-medium ${
							currentPage === totalPages
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Suiv
					</button>
				</li>
			</ul>

			{/* lg+ : numbered pagination with more pages visible */}
			<ul className="hidden lg:flex items-center gap-1.5 justify-center mt-4 flex-wrap">
				<li>
					<button
						onClick={() => goTo(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-2.5 py-1.5 rounded-md text-sm font-medium ${
							currentPage === 1
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Précédent
					</button>
				</li>
				{pagesLg.map((p, idx) => (
					<li key={`${p}-${idx}`}>
						{p === '...' ? (
							<span className="px-2 py-1.5 text-gray-500">
								...
							</span>
						) : (
							<button
								onClick={() => goTo(p as number)}
								className={`px-3 py-1.5 rounded-md text-sm font-medium ${
									p === currentPage
										? 'bg-brand text-white'
										: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
								}`}
								aria-current={
									p === currentPage ? 'page' : undefined
								}
							>
								{p}
							</button>
						)}
					</li>
				))}
				<li>
					<button
						onClick={() => goTo(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`px-2.5 py-1.5 rounded-md text-sm font-medium ${
							currentPage === totalPages
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Suivant
					</button>
				</li>
			</ul>
		</nav>
	);
};

export default Pagination;
