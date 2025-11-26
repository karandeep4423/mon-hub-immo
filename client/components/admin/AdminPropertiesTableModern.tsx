"use client";

import React, { useState } from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { ConfirmDialog } from '@/components/ui';
import { Features } from '@/lib/constants';
import Link from 'next/link';
import { DataTable } from './ui/DataTable';
import { useAdminProperties } from '@/hooks/useAdminProperties';
import { Home, CheckCircle, BarChart2, DollarSign, Eye, Trash2, LayoutGrid, List } from 'lucide-react';

/* eslint-disable @typescript-eslint/no-explicit-any */
export function AdminPropertiesTableModern({ initialProperties }: { initialProperties?: any[] }) {
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
				return (type || '').charAt(0).toUpperCase() + (type || '').slice(1);
		}
	};

	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);
	const [filters, setFilters] = useState({ type: '', status: '', search: '' });
	const [viewType, setViewType] = useState<'table' | 'grid'>('table');

	// Delete modal state
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

	const { properties: fetchedProperties, loading, totalItems, currentPage, totalPages, refetch } = useAdminProperties({
		search: filters.search,
		status: filters.status,
		propertyType: filters.type,
		page,
		limit,
	});

	const properties = fetchedProperties || initialProperties || [];

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'default';
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
			const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
			const API_ROOT = raw.replace(/\/+$/, '').replace(/\/api$/i, '');
			const res = await fetch(`${API_ROOT}/api/admin/properties/${selectedPropertyId}`, {
				method: 'DELETE',
				credentials: 'include',
			});
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
		} catch (err) {
			// alert('Erreur lors de la suppression');
			setDeleteLoading(false);
		}
	};

	const exportAsCSV = (fileExt: 'csv' | 'xls' = 'csv') => {
		const rowsSource = properties;
		if (!rowsSource || rowsSource.length === 0) return;
		const rows = rowsSource.map((p: any) => ({
			id: p._id,
			title: p.title,
			type: getPropertyTypeLabel(p.propertyType || p.type),
			location: p.city || p.location,
			price: p.price,
			views: p.views || 0,
			status: p.status,
			createdAt: new Date(p.createdAt).toISOString(),
		}));
		const header = ['id', 'title', 'type', 'location', 'price', 'views', 'status', 'createdAt'];
		const csvContent = [header.join(','), ...rows.map(r => header.map(h => `"${String((r as any)[h] ?? '')}"`).join(','))].join('\n');
		const blob = new Blob([csvContent], { type: fileExt === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel' });
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
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Gestion Annonces</h1>
					<p className="text-gray-600 mt-1">Total: {totalItems ?? properties.length} annonce(s)</p>
				</div>
				<div className="flex gap-2">
					<Button variant="secondary" size="md" onClick={() => exportAsCSV('csv')}><BarChart2 className="w-4 h-4 inline-block mr-2" />Export CSV</Button>
					<Button variant="secondary" size="md" onClick={() => exportAsCSV('xls')}><BarChart2 className="w-4 h-4 inline-block mr-2" />Export XLS</Button>
 				</div>
			</div>

			<div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
				<div className="flex gap-3 flex-1">
					<input type="search" placeholder="Chercher par titre, localisation..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" />
					<select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
						<option value="">Tous les types</option>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Commercial">Commercial</option>
					</select>
					<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500">
						<option value="">Tous les statuts</option>
						<option value="active">Actif</option>
						<option value="pending">En attente</option>
						<option value="archived">Archivé</option>
					</select>
				</div>

				<div className="flex border border-gray-300 rounded-lg bg-gray-50">
					<button onClick={() => setViewType('table')} className={`px-3 py-2 transition-colors ${viewType === 'table' ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`} aria-label="Table view"><List className="w-4 h-4" /></button>
					<button onClick={() => setViewType('grid')} className={`px-3 py-2 transition-colors ${viewType === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`} aria-label="Grid view"><LayoutGrid className="w-4 h-4" /></button>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100 border rounded-lg p-4"><div><p className="text-sm text-gray-600">Total</p><p className="text-2xl font-bold text-gray-900 mt-1">{totalItems ?? properties.length}</p></div><Home className="text-3xl text-gray-500" /></div>
				<div className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-100 border rounded-lg p-4"><div><p className="text-sm text-gray-600">Actives</p><p className="text-2xl font-bold text-gray-900 mt-1">{properties.filter((p:any) => p.status === 'active').length}</p></div><CheckCircle className="text-3xl text-green-500" /></div>
				<div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100 border rounded-lg p-4"><div><p className="text-sm text-gray-600">Vues</p><p className="text-2xl font-bold text-gray-900 mt-1">{properties.reduce((sum:number, p:any) => sum + (p.views || 0), 0)}</p></div><BarChart2 className="text-3xl text-indigo-500" /></div>
				<div className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-100 border rounded-lg p-4"><div><p className="text-sm text-gray-600">Valeur Total</p><p className="text-2xl font-bold text-gray-900 mt-1">€{(properties.reduce((sum:number, p:any) => sum + (p.price || 0), 0) / 1000000).toFixed(1)}M</p></div><DollarSign className="text-3xl text-rose-500" /></div>
			</div>

			{viewType === 'table' && (
				<DataTable
					columns={[
						{ header: 'Annonce', accessor: 'title', width: '30%', render: (_: any, row: any) => (<div><p className="font-medium text-gray-900">{row.title}</p><p className="text-xs text-gray-500">{row.location || row.city}</p></div>) },
						{ header: 'Type', accessor: 'type', width: '15%', render: (value: any, row: any) => (<Badge label={getPropertyTypeLabel(value || row.propertyType)} variant="info" size="sm" />) },
						{ header: 'Prix', accessor: 'price', width: '15%', render: (value: any) => (<span className="font-medium text-gray-900">€{(Number(value || 0) / 1000).toFixed(0)}k</span>) },
						{ header: 'Vues', accessor: 'views', width: '10%', render: (value: any) => (<span className="text-sm text-gray-700">{value || 0}</span>) },
						{ header: 'Statut', accessor: 'status', width: '15%', render: (value: any) => (<Badge label={(value || '').charAt(0).toUpperCase() + (value || '').slice(1)} variant={statusVariant(value || '')} size="sm" />) },
						{ header: 'Créée', accessor: 'createdAt', width: '15%', render: (value: any) => (<span className="text-sm text-gray-600">{new Date(value).toLocaleDateString('fr-FR')}</span>) },
					]}
					data={properties as any}
					loading={loading}
					actions={(row: any) => (
						<div className="flex items-center gap-2">
							<Link href={`/property/${row._id}`} className="p-1 hover:bg-blue-100 rounded transition-colors" title="Voir"><Eye className="w-4 h-4" /></Link>
							<button className="p-1 hover:bg-red-100 rounded transition-colors" title="Supprimer" onClick={() => openDeleteModal(row._id)}><Trash2 className="w-4 h-4 text-red-600" /></button>
						</div>
					)}
				/>
			)}

			{viewType === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{properties.map((prop: any) => (
						<div key={prop._id} className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
							<div className="w-full h-40 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform"><Home className="w-10 h-10 text-gray-600" /></div>
							<div className="p-4">
								<h3 className="font-bold text-gray-900 mb-1">{prop.title}</h3>
								<p className="text-xs text-gray-500 mb-3"><Home className="w-4 h-4 inline-block mr-2 text-gray-500" />{prop.location || prop.city}</p>
								<div className="flex items-center justify-between mb-4">
									<span className="text-lg font-bold text-cyan-600">€{(prop.price / 1000).toFixed(0)}k</span>
									<Badge label={getPropertyTypeLabel(prop.propertyType || prop.type)} variant="info" size="sm" />
								</div>
								<div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b">
									<span><Eye className="w-4 h-4 inline-block mr-2" />{prop.views || 0} vues</span>
									<span>📅 {new Date(prop.createdAt).toLocaleDateString('fr-FR')}</span>
								</div>
								<div className="flex gap-2">
									<Link href={`/property/${prop._id}`} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors text-sm font-medium">Voir</Link>
									<button onClick={() => openDeleteModal(prop._id)} className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors text-sm font-medium">Supprimer</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			<div className="flex justify-center items-center gap-4 mt-6">
				<Button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || loading} variant="secondary">Précédent</Button>
				<span className="text-gray-700 font-medium">Page {currentPage ?? page} sur {totalPages ?? 1}</span>
				<Button onClick={() => setPage(p => (totalPages ? Math.min(totalPages, p + 1) : p + 1))} disabled={page >= (totalPages ?? 1) || loading} variant="secondary">Suivant</Button>
			</div>

			{/* Confirm Delete Dialog */}
			<ConfirmDialog
				isOpen={showConfirmDialog}
				title={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_TITLE}
				description={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_DESCRIPTION}
				onConfirm={confirmDelete}
				onCancel={closeDeleteModal}
				confirmText={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_CONFIRM}
				cancelText={Features.Properties.PROPERTY_CONFIRMATION_DIALOGS.DELETE_CANCEL}
				variant="danger"
				loading={deleteLoading}
			/>
		</div>
	);
}

export default AdminPropertiesTableModern;
