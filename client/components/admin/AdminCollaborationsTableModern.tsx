/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from './ui/Badge';
import { DataTable } from './ui/DataTable';
import { BarChart2, CheckCircle, Check, DollarSign, Handshake, Home, Eye, MessageSquare, Calendar, RefreshCw } from 'lucide-react';

export interface AdminCollaboration {
	_id: string;
	agent?: { _id: string; firstName?: string; lastName?: string } | string;
	agentId?: string;
	agentName?: string;
	apporteur?: { _id: string; firstName?: string; lastName?: string } | string;
	apporteurId?: string;
	apporteurName?: string;
	property?: string;
	propertyId?: string;
	postId?: Record<string, any>;
	postType?: string;
	status: 'pending' | 'active' | 'completed' | 'cancelled';
	commission?: number;
	proposedCommission?: number;
	createdAt: string;
	updatedAt: string;
}

interface AdminCollaborationsTableModernProps {
	collaborations?: AdminCollaboration[];
	loading?: boolean;
}

export const AdminCollaborationsTableModern: React.FC<AdminCollaborationsTableModernProps> = ({
	collaborations,
	loading,
}) => {
	const [filters, setFilters] = useState({ status: '', search: '' });

	const filteredCollaborations = useMemo(() => {
		if (!collaborations) return [];
		return collaborations.filter((c) => {
			const agentName = typeof c.agent === 'string' ? c.agent : (c.agent ? `${c.agent.firstName ?? ''} ${c.agent.lastName ?? ''}`.trim() : '');
			const apporteurName = typeof c.apporteur === 'string' ? c.apporteur : (c.apporteur ? `${c.apporteur.firstName ?? ''} ${c.apporteur.lastName ?? ''}`.trim() : '');
			const propertyName = c.property || '';
			const matchSearch = !filters.search ||
				agentName.toLowerCase().includes(filters.search.toLowerCase()) ||
				apporteurName.toLowerCase().includes(filters.search.toLowerCase()) ||
				propertyName.toLowerCase().includes(filters.search.toLowerCase());
			const matchStatus = !filters.status || c.status === filters.status;
			return matchSearch && matchStatus;
		});
	}, [collaborations, filters]);

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		if (status === 'completed') return 'info';
		return 'error';
	};

	const timelineStatus = (status: string) => {
		const statuses: Record<string, string> = {
			pending: 'En attente',
			active: 'Active',
			completed: 'Complétée',
			cancelled: 'Annulée',
		};
		return statuses[status] || status;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Collaborations</h1>
					<p className="text-gray-600 mt-1">Total: {filteredCollaborations.length} collaboration(s)</p>
				</div>
			</div>

			{/* Filters */}
			<div className="flex gap-3 flex-wrap">
				<input
					type="search"
					placeholder="Chercher agent, apporteur, annonce..."
					value={filters.search}
					onChange={(e) => setFilters({ ...filters, search: e.target.value })}
					className="flex-1 min-w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
				/>
				<select
					value={filters.status}
					onChange={(e) => setFilters({ ...filters, status: e.target.value })}
					className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
				>
					<option value="">Tous les statuts</option>
					<option value="pending">En attente</option>
					<option value="active">Active</option>
					<option value="completed">Complétée</option>
					<option value="cancelled">Annulée</option>
				</select>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<StatCard icon={<BarChart2 className="w-8 h-8 text-indigo-500" />} label="Total" value={filteredCollaborations.length} color="blue" />
				<StatCard icon={<CheckCircle className="w-8 h-8 text-green-500" />} label="Actives" value={filteredCollaborations.filter(c => c.status === 'active').length} color="green" />
				<StatCard icon={<Check className="w-8 h-8 text-purple-500" />} label="Complétées" value={filteredCollaborations.filter(c => c.status === 'completed').length} color="purple" />
				<StatCard icon={<DollarSign className="w-8 h-8 text-rose-500" />} label="Commissions" value={`€${(filteredCollaborations.reduce((sum, c) => sum + ((c.commission || c.proposedCommission) || 0), 0) / 1000).toFixed(1)}k`} color="rose" />
			</div>

			{/* Table */}
			<DataTable
				columns={[
					{
						header: 'Agent & Apporteur',
						accessor: 'agent',
						width: '30%',
					render: (_, row: AdminCollaboration) => {
						const agentName = row.agentName || (typeof row.agent === 'string' ? row.agent : (row.agent ? `${row.agent.firstName ?? ''} ${row.agent.lastName ?? ''}`.trim() : ''));
						const agentId = typeof row.agent === 'object' && row.agent ? row.agent._id : row.agentId;
						const apporteurName = row.apporteurName || (typeof row.apporteur === 'string' ? row.apporteur : (row.apporteur ? `${row.apporteur.firstName ?? ''} ${row.apporteur.lastName ?? ''}`.trim() : ''));
						const apporteurId = typeof row.apporteur === 'object' && row.apporteur ? row.apporteur._id : row.apporteurId;
							return (
								<div className="space-y-2">
									<div className="flex items-center gap-2">
										<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
											{agentName ? agentName.charAt(0) : '?'}
										</div>
										{agentId ? (
											<Link href={`/admin/users/${agentId}`} className="text-sm font-medium text-gray-900 hover:underline">{agentName || 'Unknown'}</Link>
										) : (
											<span className="text-sm font-medium text-gray-900">{agentName || 'Unknown'}</span>
										)}
									</div>
									<div className="flex items-center gap-2 ml-1">
										<div className="w-6 h-6 flex items-center justify-center"><Handshake className="w-5 h-5 text-gray-500" /></div>
										{apporteurId ? (
											<Link href={`/admin/users/${apporteurId}`} className="text-xs text-gray-500 hover:underline">{apporteurName || 'Unknown'}</Link>
										) : (
											<span className="text-xs text-gray-500">{apporteurName || 'Unknown'}</span>
										)}
									</div>
								</div>
							);
						},
					},
					{
						header: 'Annonce',
						accessor: 'property',
						width: '25%',
						render: (value, row: AdminCollaboration) => {
							const propertyTitle = value || row.postId?.address || row.postId?.title || 'Unknown';
							const isProperty = row.postType === 'Property';
							return (
									<div className="flex items-center gap-2">
									<Home className="w-5 h-5 text-gray-600" />
									{isProperty && row.postId?._id ? (
										<Link href={`/property/${row.postId._id}`} className="font-medium text-gray-900 hover:underline">{propertyTitle}</Link>
									) : (
										<span className="font-medium text-gray-900">{propertyTitle}</span>
									)}
								</div>
							);
						},
					},
					{
						header: 'Commission',
						accessor: 'commission',
						width: '15%',
						render: (value, row: AdminCollaboration) => {
							const commission = value || row.proposedCommission || 0;
							return (
								<span className="font-bold text-cyan-600">€{(commission / 1000).toFixed(1)}k</span>
							);
						},
					},
					{
						header: 'Statut',
						accessor: 'status',
						width: '15%',
						render: (value) => (
							<Badge
								label={timelineStatus(value)}
								variant={statusVariant(value)}
								size="sm"
							/>
						),
					},
					{
						header: 'Dates',
						accessor: 'createdAt',
						width: '15%',
						render: (value, row: AdminCollaboration) => (
							<div className="text-xs text-gray-600 space-y-1">
								<p className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{new Date(value).toLocaleDateString('fr-FR')}</p>
								<p className="text-gray-500 flex items-center gap-2"><RefreshCw className="w-4 h-4 text-gray-400" />{new Date(row.updatedAt).toLocaleDateString('fr-FR')}</p>
							</div>
						),
					},
				]}
				data={filteredCollaborations}
				loading={loading}
				pagination={true}
				initialPageSize={10}
				pageSizeOptions={[5, 10, 20, 50]}
				actions={(row: AdminCollaboration) => (
					<div className="flex items-center gap-2">
						<Link href={`/collaboration/${row._id}`} className="p-1 hover:bg-blue-100 rounded transition-colors" title="Détails">
							<Eye className="w-4 h-4" />
						</Link>
						<Link href={`/chat?userId=${row.agentId}&propertyId=${row.propertyId}`} className="p-1 hover:bg-purple-100 rounded transition-colors" title="Historique des échanges">
							<MessageSquare className="w-4 h-4" />
						</Link>
						 
					 
					</div>
				)}
			/>
		</div>
	);
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; color: string }> = ({
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

export default AdminCollaborationsTableModern;
