import React from 'react';
import { designTokens } from '@/lib/constants/designTokens';

interface DataTableProps {
	columns: {
		header: string;
		accessor: string;
		render?: (value: any, row: any) => React.ReactNode;
		width?: string;
	}[];
	data: any[];
	loading?: boolean;
	onRowClick?: (row: any) => void;
	actions?: (row: any) => React.ReactNode;
	/** Enable client-side pagination */
	pagination?: boolean;
	/** Initial rows per page */
	initialPageSize?: number;
	/** Optional page size options in select */
	pageSizeOptions?: number[];
}

export const DataTable: React.FC<DataTableProps> = ({
	columns,
	data,
	loading,
	onRowClick,
	actions,
	pagination = false,
	initialPageSize = 10,
	pageSizeOptions = [10, 25, 50],
}) => {
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

	const goToPage = (p: number) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

	if (loading) {
		return (
			<div className="bg-white rounded-lg p-6 shadow-md">
				<div className="space-y-3">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
								    {columns.map((col) => (
								<th
									key={col.accessor}
									className="px-6 py-4 text-left text-sm font-semibold text-gray-700"
									style={{ width: col.width }}
								>
									{col.header}
								</th>
							))}
							{actions && <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-200">
						{paginatedData.length === 0 ? (
							<tr>
								<td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
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
									{columns.map((col) => (
										<td key={col.accessor} className="px-6 py-4 text-sm text-gray-700">
											{col.render ? col.render(row[col.accessor], row) : row[col.accessor]}
										</td>
									))}
									{actions && (
										<td className="px-6 py-4 text-sm">
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
				<div className="px-4 py-3 bg-white border-t border-gray-100 flex items-center justify-between">
					<div className="text-sm text-gray-600">
						Affichage <span className="font-medium">{startIndex + 1}</span> - <span className="font-medium">{endIndex}</span> sur <span className="font-medium">{totalRows}</span>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center gap-2">
							<button
								onClick={() => goToPage(currentPage - 1)}
								disabled={currentPage === 1}
								className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
							>Préc</button>
							<div className="text-sm">Page</div>
							<input
								type="number"
								min={1}
								max={totalPages}
								value={currentPage}
								onChange={(e) => goToPage(Number(e.target.value || 1))}
								className="w-16 text-sm border rounded px-2 py-1"
							/>
							<div className="text-sm">/ {totalPages}</div>
							<button
								onClick={() => goToPage(currentPage + 1)}
								disabled={currentPage === totalPages}
								className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 hover:bg-gray-100'}`}
							>Suiv</button>
						</div>
						<div className="flex items-center gap-2">
							<select
								value={pageSize}
								onChange={(e) => setPageSize(Number(e.target.value))}
								className="border rounded px-2 py-1 text-sm"
							>
								{pageSizeOptions.map((opt) => (
									<option key={opt} value={opt}>{opt} / page</option>
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
