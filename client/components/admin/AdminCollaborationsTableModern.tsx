/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Badge } from './ui/Badge';
import { DataTable } from './ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { BarChart2, CheckCircle, Check, DollarSign, Handshake, Home, Eye, MessageSquare, Calendar, RefreshCw } from 'lucide-react';

export interface AdminCollaboration {
	_id: string;
	agent?: { _id: string; firstName?: string; lastName?: string; userType?: string } | string;
	agentId?: string;
	agentName?: string;
	apporteur?: { _id: string; firstName?: string; lastName?: string; userType?: string } | string;
	apporteurId?: string;
	apporteurName?: string;
	property?: string;
	propertyId?: string;
	postId?: Record<string, any>;
	postOwnerId?: { _id: string; firstName?: string; lastName?: string; userType?: string };
	collaboratorId?: { _id: string; firstName?: string; lastName?: string; userType?: string };
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

const getCollaborationType = (collab: AdminCollaboration): 'agent-agent' | 'agent-apporteur' => {
	const agentType = typeof collab.agent === 'object' && collab.agent ? collab.agent.userType : undefined;
	const apporteurType = typeof collab.apporteur === 'object' && collab.apporteur ? collab.apporteur.userType : undefined;
	
	// Fallback to postOwnerId and collaboratorId if available
	const ownerType = collab.postOwnerId?.userType || agentType;
	const collabType = collab.collaboratorId?.userType || apporteurType;
	
	if (ownerType === 'agent' && collabType === 'agent') return 'agent-agent';
	if (ownerType === 'agent' && collabType === 'apporteur') return 'agent-apporteur';
	if (ownerType === 'apporteur' && collabType === 'agent') return 'agent-apporteur';
	return 'agent-apporteur'; // Default fallback
};

export const AdminCollaborationsTableModern: React.FC<AdminCollaborationsTableModernProps> = ({
	collaborations,
	loading,
}) => {
	const [filters, setFilters] = useState({ status: '', search: '', collabType: '' });
	const [page, setPage] = useState<number>(1);
	const [limit] = useState<number>(10);

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
			const collabType = getCollaborationType(c);
			const matchCollabType = !filters.collabType || collabType === filters.collabType;
			return matchSearch && matchStatus && matchCollabType;
		});
	}, [collaborations, filters]);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredCollaborations.length / limit)), [filteredCollaborations.length, limit]);
	const pagedCollaborations = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredCollaborations.slice(start, start + limit);
	}, [filteredCollaborations, page, limit]);

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
		<div className="space-y-6 px-4 sm:px-6 lg:px-0">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
				<div>
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collaborations</h1>
					<p className="text-sm sm:text-base text-gray-600 mt-1">Total: {filteredCollaborations.length} collaboration(s)</p>
				</div>
			</div>

			{/* Filters */}
			<div className="space-y-3 sm:space-y-4">
				<div className="flex flex-col sm:flex-row gap-3 flex-wrap">
					<input
						type="search"
						placeholder="Chercher agent, apporteur, annonce..."
						value={filters.search}
						onChange={(e) => setFilters({ ...filters, search: e.target.value })}
						className="w-full sm:flex-1 sm:min-w-48 px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
					<select
						value={filters.status}
						onChange={(e) => setFilters({ ...filters, status: e.target.value })}
						className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					>
						<option value="">Tous les statuts</option>
						<option value="pending">En attente</option>
						<option value="active">Active</option>
						<option value="completed">Complétée</option>
						<option value="cancelled">Annulée</option>
					</select>
				</div>
				<div className="flex flex-wrap gap-2">
					<button
						onClick={() => setFilters({ ...filters, collabType: '' })}
						className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
							!filters.collabType
								? 'bg-cyan-600 text-white'
								: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
						}`}
					>
						Tous les types
					</button>
					<button
						onClick={() => setFilters({ ...filters, collabType: 'agent-agent' })}
						className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
							filters.collabType === 'agent-agent'
								? 'bg-cyan-600 text-white'
								: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
						}`}
					>
						Agent-Agent
					</button>
					<button
						onClick={() => setFilters({ ...filters, collabType: 'agent-apporteur' })}
						className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-colors whitespace-nowrap ${
							filters.collabType === 'agent-apporteur'
								? 'bg-cyan-600 text-white'
								: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
						}`}
					>
						Agent-Apporteur
					</button>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
				<StatCard icon={<BarChart2 className="w-8 h-8 text-indigo-500" />} label="Total" value={filteredCollaborations.length} color="blue" />
				<StatCard icon={<CheckCircle className="w-8 h-8 text-green-500" />} label="Actives" value={filteredCollaborations.filter(c => c.status === 'active').length} color="green" />
				<StatCard icon={<Check className="w-8 h-8 text-purple-500" />} label="Complétées" value={filteredCollaborations.filter(c => c.status === 'completed').length} color="purple" />
				<StatCard icon={<DollarSign className="w-8 h-8 text-rose-500" />} label="Commissions" value={`€${(filteredCollaborations.reduce((sum, c) => sum + ((c.commission || c.proposedCommission) || 0), 0) / 1000).toFixed(1)}k`} color="rose" />
			</div>

			{/* Table */}
			<div className="overflow-x-auto -mx-4 sm:mx-0 rounded-lg border border-gray-200">
			<DataTable
				columns={[
					{
						header: 'Agent & Apporteur',
						accessor: 'agent',
						width: '25%',
					render: (_, row: AdminCollaboration) => {
						const agentName = row.agentName || (typeof row.agent === 'string' ? row.agent : (row.agent ? `${row.agent.firstName ?? ''} ${row.agent.lastName ?? ''}`.trim() : ''));
						const agentId = typeof row.agent === 'object' && row.agent ? row.agent._id : row.agentId;
						const apporteurName = row.apporteurName || (typeof row.apporteur === 'string' ? row.apporteur : (row.apporteur ? `${row.apporteur.firstName ?? ''} ${row.apporteur.lastName ?? ''}`.trim() : ''));
						const apporteurId = typeof row.apporteur === 'object' && row.apporteur ? row.apporteur._id : row.apporteurId;
							return (
								<div className="space-y-2 text-xs sm:text-sm">
									<div className="flex items-center gap-2 min-w-0">
										<div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs">
											{agentName ? agentName.charAt(0) : '?'}
										</div>
										{agentId ? (
											<Link href={`/admin/users/${agentId}`} className="text-xs sm:text-sm font-medium text-gray-900 hover:underline truncate">{agentName || 'Unknown'}</Link>
										) : (
											<span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{agentName || 'Unknown'}</span>
										)}
									</div>
									<div className="flex items-center gap-2 ml-0 sm:ml-1 min-w-0">
										<div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 flex items-center justify-center"><Handshake className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" /></div>
										{apporteurId ? (
											<Link href={`/admin/users/${apporteurId}`} className="text-xs text-gray-500 hover:underline truncate">{apporteurName || 'Unknown'}</Link>
										) : (
											<span className="text-xs text-gray-500 truncate">{apporteurName || 'Unknown'}</span>
										)}
									</div>
								</div>
							);
						},
					},
					{
						header: 'Annonce',
						accessor: 'property',
						width: '20%',
						render: (value, row: AdminCollaboration) => {
							const propertyTitle = value || row.postId?.address || row.postId?.title || 'Unknown';
							const isProperty = row.postType === 'Property';
							return (
									<div className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
									<Home className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 flex-shrink-0" />
									{isProperty && row.postId?._id ? (
										<Link href={`/property/${row.postId._id}`} className="font-medium text-gray-900 hover:underline truncate">{propertyTitle}</Link>
									) : (
										<span className="font-medium text-gray-900 truncate">{propertyTitle}</span>
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
								<span className="font-bold text-cyan-600 text-xs sm:text-sm">€{(commission / 1000).toFixed(1)}k</span>
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
								<p className="flex items-center gap-1 sm:gap-2"><Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{new Date(value).toLocaleDateString('fr-FR')}</span></p>
								<p className="text-gray-500 flex items-center gap-1 sm:gap-2"><RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" /><span className="truncate">{new Date(row.updatedAt).toLocaleDateString('fr-FR')}</span></p>
							</div>
						),
					},
				]}
				data={pagedCollaborations}
				loading={loading}
				pagination={false}
				actions={(row: AdminCollaboration) => (
					<div className="flex items-center gap-1 sm:gap-2">
						<Link href={`/collaboration/${row._id}`} className="p-1 hover:bg-blue-100 rounded transition-colors flex-shrink-0" title="Détails">
							<Eye className="w-4 h-4" />
						</Link>
						<Link href={`/admin/chat?collaborationId=${row._id}`} className="p-1 hover:bg-purple-100 rounded transition-colors flex-shrink-0" title="Historique des échanges">
							<MessageSquare className="w-4 h-4" />
						</Link>
						 
					 
					</div>
				)}
			/>
			<Pagination
				currentPage={page}
				totalItems={filteredCollaborations.length}
				pageSize={limit}
				onPageChange={(p) => setPage(p)}
				className="w-full"
			/>
			</div>
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
		<div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-lg p-3 sm:p-4`}>
			<div className="flex items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
					<p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1 truncate">{value}</p>
				</div>
				<span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
			</div>
		</div>
	);
};

export default AdminCollaborationsTableModern;
