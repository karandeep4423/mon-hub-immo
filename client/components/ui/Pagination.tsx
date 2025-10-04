import React from 'react';

type Props = {
	currentPage: number;
	totalItems: number;
	pageSize?: number;
	onPageChange: (page: number) => void;
	className?: string;
};

export const Pagination: React.FC<Props> = ({
	currentPage,
	totalItems,
	pageSize = 9,
	onPageChange,
	className,
}) => {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	if (totalPages <= 1) return null;

	const goTo = (p: number) => {
		const page = Math.min(totalPages, Math.max(1, p));
		onPageChange(page);
	};

	// Simple windowed pages (1 ... n)
	const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

	return (
		<nav className={className} aria-label="Pagination">
			<ul className="flex items-center gap-2 justify-center mt-6">
				<li>
					<button
						onClick={() => goTo(currentPage - 1)}
						disabled={currentPage === 1}
						className={`px-3 py-2 rounded-md text-sm font-medium ${
							currentPage === 1
								? 'bg-gray-200 text-gray-500 cursor-not-allowed'
								: 'bg-brand text-white hover:bg-brand-dark'
						}`}
					>
						Précédent
					</button>
				</li>
				{pages.map((p) => (
					<li key={p}>
						<button
							onClick={() => goTo(p)}
							className={`px-3 py-2 rounded-md text-sm font-medium ${
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
					</li>
				))}
				<li>
					<button
						onClick={() => goTo(currentPage + 1)}
						disabled={currentPage === totalPages}
						className={`px-3 py-2 rounded-md text-sm font-medium ${
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
