import React from 'react';

export interface DataTableColumn<T> {
	header: string;
	accessor: string;
	render?: (value: unknown, row: T) => React.ReactNode;
	width?: string;
}

interface DataTableProps<T> {
	columns: Array<DataTableColumn<T>>;
	data: T[];
	loading?: boolean;
	onRowClick?: (row: T) => void;
	actions?: (row: T) => React.ReactNode;
	/** Enable client-side pagination */
	pagination?: boolean;
	/** Initial rows per page */
	initialPageSize?: number;
	/** Optional page size options in select */
	pageSizeOptions?: number[];
}

export const DataTable = <T,>({
	columns,
	data,
	loading,
	onRowClick,
	actions,
	pagination = false,
	initialPageSize = 10,
	pageSizeOptions = [10, 25, 50],
}: DataTableProps<T>) => {
	// Pagination state (client-side)
	const [pageSize, setPageSize] = React.useState<number>(initialPageSize);
	const [currentPage, setCurrentPage] = React.useState<number>(1);

	React.useEffect(() => {
		// reset to first page when data or page size changes
		setCurrentPage(1);
	}, [data, pageSize]);

	const totalRows = data.length;
	const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalRows);
	const paginatedData = pagination ? data.slice(startIndex, endIndex) : data;

	const goToPage = (p: number) =>
		setCurrentPage(Math.min(Math.max(1, p), totalPages));

	if (loading) {
		return (
			<div className="bg-white rounded-lg p-6 shadow-md">
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div
							key={i}
							className="h-12 bg-gray-200 rounded animate-pulse"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[600px]">
					<thead>
						<tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
							{columns.map((col) => (
								<th
									key={col.accessor}
									className="px-2 sm:px-3 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 whitespace-nowrap"
									style={{ width: col.width }}
								>
									{col.header}
								</th>
							))}
							{actions && (
								<th className="px-2 sm:px-3 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-left text-[10px] sm:text-xs lg:text-sm font-semibold text-gray-700 whitespace-nowrap">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{paginatedData.length === 0 ? (
							<tr>
								<td
									colSpan={columns.length + (actions ? 1 : 0)}
									className="px-2 sm:px-3 lg:px-6 py-6 sm:py-8 text-center text-xs sm:text-sm text-gray-500"
								>
									Aucune donnée
								</td>
							</tr>
						) : (
							paginatedData.map((row, idx) => (
								<tr
									key={idx}
									onClick={() => onRowClick?.(row)}
									className="hover:bg-gray-50 transition-colors cursor-pointer"
								>
									{columns.map((col) => {
										const value: unknown = (
											row as unknown as Record<
												string,
												unknown
											>
										)[col.accessor];
										return (
											<td
												key={col.accessor}
												className="px-2 sm:px-3 lg:px-6 py-2 sm:py-3 lg:py-4 text-[10px] sm:text-xs lg:text-sm text-gray-700"
											>
												{col.render
													? col.render(value, row)
													: (value as React.ReactNode)}
											</td>
										);
									})}
									{actions && (
										<td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 text-sm">
											{actions(row)}
										</td>
									)}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{/* Pagination controls */}
			{pagination && (
				<div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 bg-white border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
						Affichage{' '}
						<span className="font-medium">{startIndex + 1}</span> -{' '}
						<span className="font-medium">{endIndex}</span> sur{' '}
						<span className="font-medium">{totalRows}</span>
					</div>
					<div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 order-1 sm:order-2">
						<div className="flex flex-wrap items-center gap-1 sm:gap-2">
							<button
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
								className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
							>
								Préc
							</button>
							<div className="text-xs sm:text-sm whitespace-nowrap">
								Page
							</div>
							<input
								type="number"
								min={1}
								max={totalPages}
								value={currentPage}
								onChange={(e) =>
									goToPage(Number(e.target.value || 1))
								}
								className="w-12 sm:w-16 text-xs sm:text-sm border rounded px-2 py-1"
							/>
							<div className="text-xs sm:text-sm">
								/ {totalPages}
							</div>
							<button
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
								className={`px-2 sm:px-3 py-1 rounded text-xs sm:text-sm ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
							>
								Suiv
							</button>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={pageSize}
								onChange={(e) =>
									setPageSize(Number(e.target.value))
								}
								className="border rounded px-2 py-1 text-xs sm:text-sm"
							>
								{pageSizeOptions.map((opt) => (
									<option key={opt} value={opt}>
										{opt} / page
									</option>
								))}
							</select>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DataTable;
