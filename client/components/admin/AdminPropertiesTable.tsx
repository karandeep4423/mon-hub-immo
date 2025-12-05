'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui';
import { Features } from '@/lib/constants';
import { DataTable } from '@/components/ui/DataTable';
import { useAdminProperties } from '@/hooks/useAdminProperties';
import { adminService } from '@/lib/api/adminApi';
import {
	Home,
	CheckCircle,
	Search,
	DollarSign,
	LayoutGrid,
	List,
	BarChart2,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';
import type { AdminProperty } from '@/types/admin';
import {
	PROPERTY_TYPE_OPTIONS,
	PROPERTY_STATUS_OPTIONS,
} from '@/lib/constants/admin';
import {
	formatPrice,
	downloadFile,
	generateCSV,
	getPropertyTypeLabel,
} from '@/lib/utils/adminUtils';
import { FilterStatCard } from './ui';
import {
	PropertyActions,
	PropertyGridCard,
	getPropertyTableColumns,
} from './properties';

interface AdminPropertiesTableModernProps {
	initialProperties?: AdminProperty[];
}

const POST_TYPE_FILTERS = [
	{ value: '', label: 'Tous' },
	{ value: 'property', label: 'Annonces' },
	{ value: 'search', label: 'Recherches' },
] as const;

export function AdminPropertiesTableModern({
	initialProperties,
}: AdminPropertiesTableModernProps) {
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [filters, setFilters] = useState({
		type: '',
		status: '',
		search: '',
		postType: '',
	});
	const [viewType, setViewType] = useState<'table' | 'grid'>('table');
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
		null,
	);

	const {
		properties: fetchedProperties,
		loading,
		totalItems,
		currentPage,
		refetch,
	} = useAdminProperties({
		search: filters.search,
		status: filters.status,
		propertyType: filters.type,
		postType: filters.postType,
		page,
		limit,
	});

	const properties = useMemo(
		() => fetchedProperties || initialProperties || [],
		[fetchedProperties, initialProperties],
	);

	const stats = useMemo(
		() => ({
			total: totalItems ?? properties.length,
			propertiesCount: properties.filter(
				(p) => p.type === 'property' || !p.type,
			).length,
			searchAdsCount: properties.filter((p) => p.type === 'search')
				.length,
			active: properties.filter((p) => p.status === 'active').length,
			value: properties.reduce((sum, p) => sum + (p.price || 0), 0),
		}),
		[properties, totalItems],
	);

	const openDeleteModal = (propertyId: string) => {
		setSelectedPropertyId(propertyId);
		setShowConfirmDialog(true);
	};

	const closeDeleteModal = () => {
		setShowConfirmDialog(false);
		setSelectedPropertyId(null);
		setDeleteLoading(false);
	};

	const confirmDelete = async () => {
		if (!selectedPropertyId) return;
		setDeleteLoading(true);
		try {
			await adminService.deleteProperty(selectedPropertyId);
			refetch?.();
			closeDeleteModal();
		} catch {
			setDeleteLoading(false);
		}
	};

	const exportAsCSV = (fileExt: 'csv' | 'xls' = 'csv') => {
		if (!properties || properties.length === 0) return;
		const rows = properties.map((p) => ({
			id: p._id,
			title: p.title,
			type: getPropertyTypeLabel((p.propertyType || p.type) ?? ''),
			location: p.city || p.location,
			price: p.price,
			views: p.views || 0,
			status: p.status,
			createdAt: new Date(p.createdAt).toISOString(),
		}));
		const headers = [
			'id',
			'title',
			'type',
			'location',
			'price',
			'views',
			'status',
			'createdAt',
		];
		const csvContent = generateCSV(rows, headers);
		const blob = new Blob([csvContent], {
			type:
				fileExt === 'csv'
					? 'text/csv;charset=utf-8;'
					: 'application/vnd.ms-excel',
		});
		downloadFile(
			`properties_export_${new Date().toISOString().slice(0, 10)}.${fileExt}`,
			blob,
		);
	};

	const columns = getPropertyTableColumns();

	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
				<div className="min-w-0">
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
						Gestion Annonces
					</h1>
					<div className="flex items-center gap-2 mt-1">
						<Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
						<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
							Total:{' '}
							<span className="font-semibold text-gray-900">
								{stats.total}
							</span>{' '}
							annonce(s)
						</p>
					</div>
				</div>
				<div className="flex gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => exportAsCSV('csv')}
						className="text-xs"
					>
						<BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						<span className="hidden sm:inline ml-1.5">
							Export CSV
						</span>
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => exportAsCSV('xls')}
						className="text-xs"
					>
						<BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						<span className="hidden sm:inline ml-1.5">
							Export XLS
						</span>
					</Button>
				</div>
			</div>

			{/* Filters */}
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-2">
					{POST_TYPE_FILTERS.map((filter) => (
						<Button
							key={filter.value}
							variant="secondary"
							size="sm"
							onClick={() => {
								setFilters({
									...filters,
									postType: filter.value,
									...(filter.value === 'search'
										? { type: '' }
										: {}),
								});
								setPage(1);
							}}
							className={`text-xs ${filters.postType === filter.value ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : ''}`}
						>
							{filter.label}
						</Button>
					))}
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
					<Input
						name="search"
						placeholder="Chercher..."
						value={filters.search}
						onChange={(e) =>
							setFilters({ ...filters, search: e.target.value })
						}
						className="text-sm"
					/>
					<Select
						name="type"
						value={filters.type}
						onChange={(val) =>
							setFilters({ ...filters, type: val })
						}
						disabled={filters.postType === 'search'}
						options={PROPERTY_TYPE_OPTIONS}
					/>
					<Select
						name="status"
						value={filters.status}
						onChange={(val) =>
							setFilters({ ...filters, status: val })
						}
						options={PROPERTY_STATUS_OPTIONS}
					/>
					<div className="flex border border-gray-300 rounded-lg bg-white shadow-sm self-start">
						<button
							onClick={() => setViewType('table')}
							className={`px-2.5 sm:px-3 py-2 transition-all text-xs rounded-l-lg ${viewType === 'table' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}`}
							aria-label="Table view"
							title="Vue tableau"
						>
							<List className="w-4 h-4" />
						</button>
						<button
							onClick={() => setViewType('grid')}
							className={`px-2.5 sm:px-3 py-2 transition-all text-xs rounded-r-lg ${viewType === 'grid' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-gray-700 hover:bg-gray-50'}`}
							aria-label="Grid view"
							title="Vue grille"
						>
							<LayoutGrid className="w-4 h-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
				<FilterStatCard
					icon={
						<Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
					}
					label="Annonces"
					value={stats.propertiesCount}
					color="blue"
				/>
				<FilterStatCard
					icon={
						<Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
					}
					label="Recherches"
					value={stats.searchAdsCount}
					color="purple"
				/>
				<FilterStatCard
					icon={
						<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
					}
					label="Actives"
					value={stats.active}
					color="green"
				/>
				<FilterStatCard
					icon={
						<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
					}
					label="Valeur"
					value={formatPrice(stats.value)}
					color="rose"
				/>
			</div>

			{/* Table View */}
			{viewType === 'table' && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<DataTable
						columns={columns}
						data={properties}
						loading={loading}
						actions={(row: AdminProperty) => (
							<PropertyActions
								property={row}
								onDelete={() => openDeleteModal(row._id)}
							/>
						)}
					/>
				</div>
			)}

			{/* Grid View */}
			{viewType === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{properties.map((prop) => (
						<PropertyGridCard
							key={prop._id}
							property={prop}
							onDelete={() => openDeleteModal(prop._id)}
						/>
					))}
				</div>
			)}

			{/* Pagination */}
			<div className="flex justify-center items-center gap-4 mt-6">
				<Pagination
					currentPage={currentPage ?? page}
					totalItems={stats.total}
					pageSize={limit}
					onPageChange={setPage}
					className="w-full"
				/>
			</div>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				isOpen={showConfirmDialog}
				title={
					Features.Properties.PROPERTY_CONFIRMATION_DIALOGS
						.DELETE_TITLE
				}
				description={
					Features.Properties.PROPERTY_CONFIRMATION_DIALOGS
						.DELETE_DESCRIPTION
				}
				onConfirm={confirmDelete}
				onCancel={closeDeleteModal}
				confirmText={
					Features.Properties.PROPERTY_CONFIRMATION_DIALOGS
						.DELETE_CONFIRM
				}
				cancelText={
					Features.Properties.PROPERTY_CONFIRMATION_DIALOGS
						.DELETE_CANCEL
				}
				variant="danger"
				loading={deleteLoading}
			/>
		</div>
	);
}

export default AdminPropertiesTableModern;
