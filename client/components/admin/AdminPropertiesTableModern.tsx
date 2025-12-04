'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui';
import { Features } from '@/lib/constants';
import Link from 'next/link';
import { DataTable } from '@/components/ui/DataTable';
import { useAdminProperties } from '@/hooks/useAdminProperties';
import {
	Home,
	CheckCircle,
	BarChart2,
	DollarSign,
	Eye,
	Trash2,
	LayoutGrid,
	List,
} from 'lucide-react';
import Pagination from '@/components/ui/Pagination';

interface Property {
	_id: string;
	title: string;
	propertyType?: string;
	type?: string;
	city?: string;
	location?: string;
	price: number;
	views?: number;
	status: string;
	createdAt: string;
}

export function AdminPropertiesTableModern({
	initialProperties,
}: {
	initialProperties?: Property[];
}) {
	// helpers
	const getPropertyTypeLabel = (type: string) => {
		if (!type) return '';
		switch (type) {
			case 'apartment':
				return 'Appartement';
			case 'house':
				return 'Maison';
			case 'land':
				return 'Terrain';
			case 'commercial':
				return 'Commercial';
			case 'studio':
				return 'Studio';
			default:
				return (
					(type || '').charAt(0).toUpperCase() + (type || '').slice(1)
				);
		}
	};

	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);
	const [filters, setFilters] = useState({
		type: '',
		status: '',
		search: '',
		postType: '',
	});
	const [viewType, setViewType] = useState<'table' | 'grid'>('table');

	// Delete modal state
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

	const properties = fetchedProperties || initialProperties || [];

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'gray';
	};

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
			const raw =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
			const API_ROOT = raw.replace(/\/+$/, '').replace(/\/api$/i, '');
			const res = await fetch(
				`${API_ROOT}/api/admin/properties/${selectedPropertyId}`,
				{
					method: 'DELETE',
					credentials: 'include',
				},
			);
			if (res.ok) {
				// optional: show toast instead of alert
				// alert('Annonce supprimée avec succès');
				refetch?.();
				closeDeleteModal();
			} else {
				// handle error response
				// alert('Erreur lors de la suppression');
				setDeleteLoading(false);
			}
		} catch {
			// alert('Erreur lors de la suppression');
			setDeleteLoading(false);
		}
	};

	const exportAsCSV = (fileExt: 'csv' | 'xls' = 'csv') => {
		const rowsSource = properties;
		if (!rowsSource || rowsSource.length === 0) return;
		const rows = rowsSource.map((p: Property) => ({
			id: p._id,
			title: p.title,
			type: getPropertyTypeLabel((p.propertyType || p.type) ?? ''),
			location: p.city || p.location,
			price: p.price,
			views: p.views || 0,
			status: p.status,
			createdAt: new Date(p.createdAt).toISOString(),
		}));
		const header = [
			'id',
			'title',
			'type',
			'location',
			'price',
			'views',
			'status',
			'createdAt',
		] as const;
		const csvContent = [
			header.join(','),
			...rows.map((r) =>
				header
					.map((h) => `"${String(r[h as keyof typeof r] ?? '')}")`)
					.join(','),
			),
		].join('\n');
		const blob = new Blob([csvContent], {
			type:
				fileExt === 'csv'
					? 'text/csv;charset=utf-8;'
					: 'application/vnd.ms-excel',
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `properties_export_${new Date().toISOString().slice(0, 10)}.${fileExt}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden">
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
								{totalItems ?? properties.length}
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
			<div className="flex flex-col gap-3">
				<div className="flex flex-wrap gap-2">
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setFilters({ ...filters, postType: '' });
							setPage(1);
						}}
						className={`text-xs ${filters.postType === '' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : ''}`}
					>
						Tous
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setFilters({ ...filters, postType: 'property' });
							setPage(1);
						}}
						className={`text-xs ${filters.postType === 'property' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : ''}`}
					>
						Annonces
					</Button>
					<Button
						variant="secondary"
						size="sm"
						onClick={() => {
							setFilters({
								...filters,
								postType: 'search',
								type: '',
							});
							setPage(1);
						}}
						className={`text-xs ${filters.postType === 'search' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : ''}`}
					>
						Recherches
					</Button>
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
						options={[
							{ value: '', label: 'Tous types' },
							{ value: 'Appartement', label: 'Appartement' },
							{ value: 'Maison', label: 'Maison' },
							{ value: 'Terrain', label: 'Terrain' },
							{ value: 'Commercial', label: 'Commercial' },
						]}
					/>
					<Select
						name="status"
						value={filters.status}
						onChange={(val) =>
							setFilters({ ...filters, status: val })
						}
						options={[
							{ value: '', label: 'Tous statuts' },
							{ value: 'active', label: 'Actif' },
							{ value: 'pending', label: 'En attente' },
							{ value: 'archived', label: 'Archivé' },
						]}
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
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
				<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-[10px] sm:text-xs font-medium text-gray-600">
								Total
							</p>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-0.5">
								{totalItems ?? properties.length}
							</p>
						</div>
						<div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
							<Home className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
						</div>
					</div>
				</div>
				<div className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-[10px] sm:text-xs font-medium text-gray-600">
								Actives
							</p>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mt-0.5">
								{
									properties.filter(
										(p: Property) => p.status === 'active',
									).length
								}
							</p>
						</div>
						<div className="p-1.5 sm:p-2 bg-emerald-100 rounded-lg flex-shrink-0">
							<CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
						</div>
					</div>
				</div>
				<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-[10px] sm:text-xs font-medium text-gray-600">
								Vues
							</p>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mt-0.5">
								{properties.reduce(
									(sum: number, p: Property) =>
										sum + (p.views || 0),
									0,
								)}
							</p>
						</div>
						<div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg flex-shrink-0">
							<BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
						</div>
					</div>
				</div>
				<div className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 border rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
					<div className="flex items-start justify-between gap-2">
						<div className="min-w-0">
							<p className="text-[10px] sm:text-xs font-medium text-gray-600">
								Valeur
							</p>
							<p className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent mt-0.5">
								€
								{(
									properties.reduce(
										(sum: number, p: Property) =>
											sum + (p.price || 0),
										0,
									) / 1000000
								).toFixed(1)}
								M
							</p>
						</div>
						<div className="p-1.5 sm:p-2 bg-rose-100 rounded-lg flex-shrink-0">
							<DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
						</div>
					</div>
				</div>
			</div>
			{viewType === 'table' && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
					<DataTable
						columns={[
							{
								header: 'Annonce',
								accessor: 'title',
								width: '30%',
								render: (_: unknown, row: unknown) => {
									const prop = row as Property;
									return (
										<div className="min-w-0">
											<p className="font-semibold text-gray-900 text-sm truncate">
												{prop.title}
											</p>
											<p className="text-xs text-gray-500 truncate mt-0.5">
												{prop.location || prop.city}
											</p>
										</div>
									);
								},
							},
							{
								header: 'Type',
								accessor: 'type',
								width: '12%',
								render: (value: unknown, row: unknown) => {
									const prop = row as Property;
									return (
										<Badge
											variant="info"
											size="sm"
											className="shadow-sm"
										>
											{getPropertyTypeLabel(
												((value as string) ||
													prop.propertyType) ??
													'',
											)}
										</Badge>
									);
								},
							},
							{
								header: 'Prix',
								accessor: 'price',
								width: '12%',
								render: (value: unknown) => (
									<div className="flex items-center gap-1.5">
										<div className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200/50">
											<span className="font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
												€
												{(
													Number(value || 0) / 1000
												).toFixed(0)}
												k
											</span>
										</div>
									</div>
								),
							},
							{
								header: 'Vues',
								accessor: 'views',
								width: '10%',
								render: (value: unknown) => (
									<div className="flex items-center justify-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200/50 w-fit">
										<BarChart2 className="w-3.5 h-3.5 text-purple-600" />
										<span className="text-xs font-semibold text-purple-700">
											{Number(value) || 0}
										</span>
									</div>
								),
							},
							{
								header: 'Statut',
								accessor: 'status',
								width: '13%',
								render: (value: unknown) => (
									<div className="flex justify-center">
										<Badge
											variant={
												statusVariant(
													String(value || ''),
												) as
													| 'success'
													| 'warning'
													| 'gray'
													| 'primary'
													| 'secondary'
													| 'info'
													| 'error'
											}
											size="sm"
											className="shadow-sm"
										>
											{String(value || '')
												.charAt(0)
												.toUpperCase() +
												String(value || '').slice(1)}
										</Badge>
									</div>
								),
							},
							{
								header: 'Créée',
								accessor: 'createdAt',
								width: '13%',
								render: (value: unknown) => (
									<span className="text-xs text-gray-600 hidden sm:inline">
										{new Date(
											String(value),
										).toLocaleDateString('fr-FR')}
									</span>
								),
							},
						]}
						data={properties}
						loading={loading}
						actions={(row: unknown) => {
							const prop = row as Property;
							return (
								<div className="flex items-center justify-end gap-1.5">
									<Link
										href={
											prop.propertyType === 'Recherche'
												? `/search-ads/${prop._id}`
												: `/property/${prop._id}`
										}
										className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200 group"
										title="Voir"
									>
										<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
									</Link>
									<button
										className="p-2 hover:bg-red-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200 group"
										title="Supprimer"
										onClick={() =>
											openDeleteModal(prop._id)
										}
									>
										<Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
									</button>
								</div>
							);
						}}
					/>
				</div>
			)}{' '}
			{viewType === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{properties.map((prop: Property) => (
						<div
							key={prop._id}
							className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
						>
							<div className="w-full h-40 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
								<Home className="w-10 h-10 text-gray-600" />
							</div>
							<div className="p-4">
								<h3 className="font-bold text-gray-900 mb-1">
									{prop.title}
								</h3>
								<p className="text-xs text-gray-500 mb-3">
									<Home className="w-4 h-4 inline-block mr-2 text-gray-500" />
									{prop.location || prop.city}
								</p>
								<div className="flex items-center justify-between mb-4">
									<span className="text-lg font-bold text-cyan-600">
										€{(prop.price / 1000).toFixed(0)}k
									</span>
									<Badge variant="info" size="sm">
										{getPropertyTypeLabel(
											(prop.propertyType || prop.type) ??
												'',
										)}
									</Badge>
								</div>
								<div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b">
									<span>
										<Eye className="w-4 h-4 inline-block mr-2" />
										{prop.views || 0} vues
									</span>
									<span>
										📅{' '}
										{new Date(
											prop.createdAt,
										).toLocaleDateString('fr-FR')}
									</span>
								</div>
								<div className="flex gap-2">
									<Link
										href={
											prop.propertyType === 'Recherche'
												? `/search-ads/${prop._id}`
												: `/property/${prop._id}`
										}
										className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors text-sm font-medium"
									>
										Voir
									</Link>
									<button
										onClick={() =>
											openDeleteModal(prop._id)
										}
										className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors text-sm font-medium"
									>
										Supprimer
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
			<div className="flex justify-center items-center gap-4 mt-6">
				<Pagination
					currentPage={currentPage ?? page}
					totalItems={totalItems ?? properties.length}
					pageSize={limit}
					onPageChange={(p) => setPage(p)}
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
