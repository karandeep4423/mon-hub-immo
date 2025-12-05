'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/CustomSelect';
import { DataTable } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import { ConfirmDialog } from '@/components/ui';
import { adminService } from '@/lib/api/adminApi';
import { toast } from 'react-toastify';
import { BarChart2, CheckCircle, Check, Clock, Handshake } from 'lucide-react';
import type { AdminCollaboration, ConfirmDialogState } from '@/types/admin';
import { COLLABORATION_STATUS_OPTIONS } from '@/lib/constants/admin';
import { getCollaborationType } from '@/lib/utils/adminUtils';
import { FilterStatCard } from './ui';
import {
	EditCollaborationModal,
	CollaborationActions,
	getCollaborationTableColumns,
} from './collaborations';

// Re-export for backwards compatibility
export type { AdminCollaboration } from '@/types/admin';

interface AdminCollaborationsTableModernProps {
	collaborations?: AdminCollaboration[];
	loading?: boolean;
	onRefetch?: () => void;
}

const COLLAB_TYPE_FILTERS = [
	{ value: '', label: 'Tous' },
	{ value: 'agent-agent', label: 'Agent-Agent' },
	{ value: 'agent-apporteur', label: 'Agent-Apporteur' },
] as const;

export const AdminCollaborationsTableModern: React.FC<
	AdminCollaborationsTableModernProps
> = ({ collaborations, loading, onRefetch }) => {
	const [filters, setFilters] = useState({
		status: '',
		search: '',
		collabType: '',
	});
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [actionLoading, setActionLoading] = useState(false);
	const [editingCollaboration, setEditingCollaboration] =
		useState<AdminCollaboration | null>(null);
	const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
		open: false,
		title: '',
		message: '',
		onConfirm: () => {},
	});

	const handleAction = async (
		action: () => Promise<unknown>,
		successMsg: string,
		errorMsg: string,
	) => {
		setActionLoading(true);
		try {
			await action();
			toast.success(successMsg);
			onRefetch?.();
		} catch {
			toast.error(errorMsg);
		} finally {
			setActionLoading(false);
			setConfirmDialog((prev) => ({ ...prev, open: false }));
		}
	};

	const handleDeleteCollaboration = (id: string) =>
		handleAction(
			() => adminService.deleteCollaboration(id),
			'Collaboration supprimée avec succès',
			'Erreur lors de la suppression',
		);

	const handleCancelCollaboration = (id: string) =>
		handleAction(
			() => adminService.closeCollaboration(id, 'cancel'),
			'Collaboration annulée avec succès',
			"Erreur lors de l'annulation",
		);

	const handleCompleteCollaboration = (id: string) =>
		handleAction(
			() => adminService.forceCompleteCollaboration(id),
			'Collaboration complétée avec succès',
			'Erreur lors de la complétion',
		);

	const filteredCollaborations = useMemo(() => {
		if (!collaborations) return [];
		return collaborations.filter((c) => {
			const agentName =
				typeof c.agent === 'string'
					? c.agent
					: c.agent
						? `${c.agent.firstName ?? ''} ${c.agent.lastName ?? ''}`.trim()
						: '';
			const apporteurName =
				typeof c.apporteur === 'string'
					? c.apporteur
					: c.apporteur
						? `${c.apporteur.firstName ?? ''} ${c.apporteur.lastName ?? ''}`.trim()
						: '';
			const propertyName = c.property || '';
			const matchSearch =
				!filters.search ||
				[agentName, apporteurName, propertyName].some((n) =>
					n.toLowerCase().includes(filters.search.toLowerCase()),
				);
			const matchStatus = !filters.status || c.status === filters.status;
			const collabType = getCollaborationType(c);
			const matchCollabType =
				!filters.collabType || collabType === filters.collabType;
			return matchSearch && matchStatus && matchCollabType;
		});
	}, [collaborations, filters]);

	const pagedCollaborations = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredCollaborations.slice(start, start + limit);
	}, [filteredCollaborations, page, limit]);

	const stats = useMemo(
		() => ({
			total: filteredCollaborations.length,
			active: filteredCollaborations.filter((c) => c.status === 'active')
				.length,
			completed: filteredCollaborations.filter(
				(c) => c.status === 'completed',
			).length,
			pending: filteredCollaborations.filter(
				(c) => c.status === 'pending',
			).length,
		}),
		[filteredCollaborations],
	);

	const columns = getCollaborationTableColumns();

	const openConfirmDialog = (
		title: string,
		message: string,
		variant: 'danger' | 'warning' | 'info',
		onConfirm: () => void,
	) => {
		setConfirmDialog({ open: true, title, message, variant, onConfirm });
	};

	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
				<div>
					<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
						Collaborations
					</h1>
					<div className="flex items-center gap-2 mt-1">
						<Handshake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
						<p className="text-[10px] sm:text-xs lg:text-sm text-gray-600">
							Total:{' '}
							<span className="font-semibold text-gray-900">
								{stats.total}
							</span>{' '}
							collaboration(s)
						</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="space-y-2 sm:space-y-3">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
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
						name="status"
						value={filters.status}
						onChange={(val) =>
							setFilters({ ...filters, status: val })
						}
						options={COLLABORATION_STATUS_OPTIONS}
					/>
				</div>
				<div className="flex flex-wrap gap-1.5 sm:gap-2">
					{COLLAB_TYPE_FILTERS.map((filter) => (
						<button
							key={filter.value}
							onClick={() =>
								setFilters({
									...filters,
									collabType: filter.value,
								})
							}
							className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-sm rounded-lg font-medium transition-all shadow-sm ${
								filters.collabType === filter.value
									? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
									: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
							}`}
						>
							{filter.label}
						</button>
					))}
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
				<FilterStatCard
					icon={
						<BarChart2 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
					}
					label="Total"
					value={stats.total}
					color="blue"
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
						<Check className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
					}
					label="Complétées"
					value={stats.completed}
					color="purple"
				/>
				<FilterStatCard
					icon={
						<Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
					}
					label="En attente"
					value={stats.pending}
					color="yellow"
				/>
			</div>

			{/* Table */}
			<div className="bg-white pb-4 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<DataTable
					columns={columns}
					data={pagedCollaborations}
					loading={loading}
					pagination={false}
					actions={(row: AdminCollaboration) => (
						<CollaborationActions
							collaboration={row}
							onEdit={() => setEditingCollaboration(row)}
							onComplete={() =>
								openConfirmDialog(
									'Compléter la collaboration',
									'Êtes-vous sûr de vouloir forcer la complétion de cette collaboration ?',
									'info',
									() => handleCompleteCollaboration(row._id),
								)
							}
							onCancel={() =>
								openConfirmDialog(
									'Annuler la collaboration',
									'Êtes-vous sûr de vouloir annuler cette collaboration ?',
									'warning',
									() => handleCancelCollaboration(row._id),
								)
							}
							onDelete={() =>
								openConfirmDialog(
									'Supprimer la collaboration',
									'Êtes-vous sûr de vouloir supprimer définitivement cette collaboration ? Cette action est irréversible.',
									'danger',
									() => handleDeleteCollaboration(row._id),
								)
							}
							disabled={actionLoading}
						/>
					)}
				/>
				<Pagination
					currentPage={page}
					totalItems={stats.total}
					pageSize={limit}
					onPageChange={setPage}
					className="w-full"
				/>

				<ConfirmDialog
					isOpen={confirmDialog.open}
					title={confirmDialog.title}
					description={confirmDialog.message}
					onConfirm={confirmDialog.onConfirm}
					onCancel={() =>
						setConfirmDialog((prev) => ({ ...prev, open: false }))
					}
					confirmText="Confirmer"
					cancelText="Annuler"
					loading={actionLoading}
				/>

				{editingCollaboration && (
					<EditCollaborationModal
						collaboration={editingCollaboration}
						onClose={() => setEditingCollaboration(null)}
						onSave={() => {
							setEditingCollaboration(null);
							onRefetch?.();
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default AdminCollaborationsTableModern;
