'use client';

import React, { useMemo, useState } from 'react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import Link from 'next/link';
import { DataTable } from './ui/DataTable';
import { useAdminProperties } from '@/hooks/useAdminProperties';

export interface AdminProperty {
	_id: string;
	title: string;
	location: string;
	type: string;
	price: number;
	status: 'active' | 'archived' | 'pending';
	agent: string;
	createdAt: string;
	views: number;
}

interface AdminPropertiesTableModernProps {
	// optional initial properties to display (useful for SSR or testing)
	initialProperties?: AdminProperty[];
}

export const AdminPropertiesTableModern: React.FC<AdminPropertiesTableModernProps> = ({ initialProperties }) => {
	// Map internal property type to readable label (FR)
	const getPropertyTypeLabel = (type: string) => {
		switch (type) {
			case 'apartment': return 'Appartement';
			case 'house': return 'Maison';
			case 'land': return 'Terrain';
			case 'commercial': return 'Commercial';
			case 'studio': return 'Studio';
			default: return (type || '').charAt(0).toUpperCase() + (type || '').slice(1);
		}
	};

	// Pagination for server-side
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);

	// Export CSV/XLS helper (simple CSV export). XLS option downloads same CSV but with .xls MIME.
	const exportAsCSV = (fileExt: 'csv' | 'xls' = 'csv') => {
		const rowsSource = (typeof fetchedProperties !== 'undefined' && fetchedProperties && fetchedProperties.length > 0) ? fetchedProperties : (initialProperties || []);
		if (!rowsSource || rowsSource.length === 0) return;
		const rows: Array<Record<string, string | number | undefined>> = rowsSource.map((p: any) => ({
			id: p._id,
			title: p.title,
			type: getPropertyTypeLabel(p.propertyType || p.type),
			location: p.city || p.location,
			price: p.price,
			views: p.views || 0,
			status: p.status,
			createdAt: new Date(p.createdAt).toISOString(),
		}));
		const header = ['id','title','type','location','price','views','status','createdAt'];
		const csvContent = [header.join(','), ...rows.map(r => header.map(h => `"${String((r[h] ?? '') ?? '')}"`).join(','))].join('\n');
		const blob = new Blob([csvContent], { type: fileExt === 'csv' ? 'text/csv;charset=utf-8;' : 'application/vnd.ms-excel' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `properties_export_${new Date().toISOString().slice(0,10)}.${fileExt}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	};
	const [filters, setFilters] = useState({ type: '', status: '', search: '' });
	const [viewType, setViewType] = useState<'table' | 'grid'>('table');

	const { properties: fetchedProperties, loading, totalItems, currentPage, totalPages, refetch } = useAdminProperties({
		search: filters.search,
		status: filters.status,
		propertyType: filters.type,
		page,
		limit,
	});

	// Use fetchedProperties directly, as filtering is done server-side
	const properties = fetchedProperties || initialProperties || [];

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'default';
	};

	const handleDelete = async (propertyId: string) => {
		if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) return;
		try {
			const res = await fetch(`http://localhost:4000/api/admin/properties/${propertyId}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			if (res.ok) {
				alert('Annonce supprimée avec succès');
				refetch?.();
			} else {
				alert('Erreur lors de la suppression');
			}
		} catch (err) {
			alert('Erreur lors de la suppression');
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Gestion Annonces</h1>
					<p className="text-gray-600 mt-1">Total: {totalItems ?? properties.length} annonce(s)</p>
				</div>
				<div className="flex gap-2">
					<Button variant="secondary" size="md" onClick={() => exportAsCSV('csv')}>
						⬇️ Export CSV
					</Button>
					<Button variant="secondary" size="md" onClick={() => exportAsCSV('xls')}>
						⬇️ Export XLS
					</Button>
					<Button variant="primary" size="md">
						➕ Nouvelle Annonce
					</Button>
				</div>
			</div>

			{/* Filters and view toggle */}
			<div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
				<div className="flex gap-3 flex-1">
					<input
						type="search"
						placeholder="Chercher par titre, localisation..."
						value={filters.search}
						onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
					<select
						value={filters.type}
						onChange={(e) => setFilters({ ...filters, type: e.target.value })}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					>
						<option value="">Tous les types</option>
						<option value="Appartement">Appartement</option>
						<option value="Maison">Maison</option>
						<option value="Terrain">Terrain</option>
						<option value="Commercial">Commercial</option>
					</select>
					<select
						value={filters.status}
						onChange={(e) => setFilters({ ...filters, status: e.target.value })}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					>
						<option value="">Tous les statuts</option>
						<option value="active">Actif</option>
						<option value="pending">En attente</option>
						<option value="archived">Archivé</option>
					</select>
				</div>

				{/* View toggle */}
				<div className="flex border border-gray-300 rounded-lg bg-gray-50">
					<button
						onClick={() => setViewType('table')}
						className={`px-3 py-2 transition-colors ${viewType === 'table' ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
					>
						📋
					</button>
					<button
						onClick={() => setViewType('grid')}
						className={`px-3 py-2 transition-colors ${viewType === 'grid' ? 'bg-cyan-500 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
					>
						📊
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<StatCard icon="🏠" label="Total" value={totalItems ?? properties.length} color="blue" />
				<StatCard icon="✅" label="Actives" value={properties.filter((p:any) => p.status === 'active').length} color="green" />
				<StatCard icon="📊" label="Vues" value={properties.reduce((sum:number, p:any) => sum + (p.views || 0), 0)} color="purple" />
				<StatCard icon="💰" label="Valeur Total" value={`€${(properties.reduce((sum:number, p:any) => sum + (p.price || 0), 0) / 1000000).toFixed(1)}M`} color="rose" />
			</div>

			{/* Table view */}
			{viewType === 'table' && (
				<DataTable
					columns={[
						{
							header: 'Annonce',
							accessor: 'title',
							width: '30%',
							render: (_: any, row: any) => (
								<div>
									<p className="font-medium text-gray-900">{row.title}</p>
									<p className="text-xs text-gray-500">📍 {row.location || row.city}</p>
								</div>
							),
						},
						{
							header: 'Type',
							accessor: 'type',
							width: '15%',
							render: (value: any, row: any) => (
								<Badge label={getPropertyTypeLabel(value || row.propertyType)} variant="info" size="sm" />
							),
						},
						{
							header: 'Prix',
							accessor: 'price',
							width: '15%',
							render: (value: any) => (
								<span className="font-medium text-gray-900">
									€{(Number(value || 0) / 1000).toFixed(0)}k
								</span>
							),
						},
						{
							header: 'Vues',
							accessor: 'views',
							width: '10%',
							render: (value: any) => (
								<span className="text-sm text-gray-700">{value || 0}</span>
							),
						},
						{
							header: 'Statut',
							accessor: 'status',
							width: '15%',
							render: (value: any) => (
								<Badge
									label={(value || '').charAt(0).toUpperCase() + (value || '').slice(1)}
									variant={statusVariant(value || '')}
									size="sm"
								/>
							),
						},
						{
							header: 'Créée',
							accessor: 'createdAt',
							width: '15%',
							render: (value) => (
								<span className="text-sm text-gray-600">
									{new Date(value).toLocaleDateString('fr-FR')}
								</span>
							),
						},
					]}
					data={properties as any}
					loading={loading}
					actions={(row: AdminProperty) => (
						<div className="flex items-center gap-2">
							<Link href={`/property/${row._id}`} className="p-1 hover:bg-blue-100 rounded transition-colors" title="Voir">
								👁️
							</Link>
							<button className="p-1 hover:bg-yellow-100 rounded transition-colors" title="Éditer">
								✏️
							</button>
							<button
								className="p-1 hover:bg-red-100 rounded transition-colors"
								title="Supprimer"
								onClick={() => handleDelete(row._id)}
							>
								🗑️
							</button>
						</div>
					)}
				/>
			)}

			{/* Grid view */}
			{viewType === 'grid' && (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{properties.map((prop) => (
						<div
							key={prop._id}
							className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
						>
							{/* Image placeholder */}
							<div className="w-full h-40 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
								🏠
							</div>

							{/* Content */}
							<div className="p-4">
								<h3 className="font-bold text-gray-900 mb-1">{prop.title}</h3>
								<p className="text-xs text-gray-500 mb-3">📍 {(prop as any).location || (prop as any).city}</p>

								<div className="flex items-center justify-between mb-4">
									<span className="text-lg font-bold text-cyan-600">€{(prop.price / 1000).toFixed(0)}k</span>
									<Badge label={getPropertyTypeLabel((prop as any).propertyType || (prop as any).type)} variant="info" size="sm" />
								</div>

								<div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b">
									<span>👁️ {(prop as any).views || 0} vues</span>
									<span>📅 {new Date(prop.createdAt).toLocaleDateString('fr-FR')}</span>
								</div>

								<div className="flex gap-2">
									<Link href={`/property/${prop._id}`} className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors text-sm font-medium">
										Voir
									</Link>
									<button
										onClick={() => handleDelete(prop._id)}
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
			
			{/* Pagination Controls */}
			<div className="flex justify-center items-center gap-4 mt-6">
				<Button
					onClick={() => setPage(p => Math.max(1, p - 1))}
					disabled={page <= 1 || loading}
					variant="secondary"
				>
					Précédent
				</Button>
				<span className="text-gray-700 font-medium">
					Page {currentPage ?? page} sur {totalPages ?? 1}
				</span>
				<Button
					onClick={() => setPage(p => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
					disabled={page >= (totalPages ?? 1) || loading}
					variant="secondary"
				>
					Suivant
				</Button>
			</div>
		</div>
	);
};

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({
	icon,
	label,
	value,
	color,
}) => {
	const colors = {
		blue: 'from-blue-50 to-cyan-50 border-blue-100',
		green: 'from-emerald-50 to-green-50 border-emerald-100',
		purple: 'from-purple-50 to-indigo-50 border-purple-100',
		rose: 'from-rose-50 to-pink-50 border-rose-100',
	};
	return (
		<div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-lg p-4`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-600">{label}</p>
					<p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
				</div>
				<span className="text-3xl">{icon}</span>
			</div>
		</div>
	);
};

export default AdminPropertiesTableModern;
