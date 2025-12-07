'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePageState } from '@/hooks/usePageState';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import {
	Users,
	Download,
	Upload,
	Plus,
	Banknote,
	AlertCircle,
	ShieldOff,
} from 'lucide-react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import CreateUserModal from './CreateUserModal';
import ImportUsersModal from './ImportUsersModal';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import AdminUserFilters from './AdminUserFilters';
import { AdminPageHeader, FilterStatCard } from './ui';
import { UserActions, getUserTableColumns } from './users';
import {
	getUserStatus,
	downloadFile,
	generateCSV,
} from '@/lib/utils/adminUtils';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@/lib/constants/admin';
import type {
	AdminUser,
	AdminUserFilters as FilterType,
	ConfirmActionState,
} from '@/types/admin';

// Re-export for backward compatibility
export type { AdminUser };

interface AdminUsersTableModernProps {
	users?: AdminUser[];
	loading?: boolean;
}

export const AdminUsersTableModern: React.FC<AdminUsersTableModernProps> = ({
	users: initialUsers,
	loading: initialLoading,
}) => {
	const [page, setPage] = useState<number>(DEFAULT_PAGE);
	const [limit] = useState<number>(DEFAULT_PAGE_SIZE);
	const [filters, setFilters] = useState<FilterType>({
		type: '',
		status: '',
		search: '',
		network: '',
		email: '',
	});
	const [showCreate, setShowCreate] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const [tableConfirmAction, setTableConfirmAction] =
		useState<ConfirmActionState | null>(null);
	const [actionBusy, setActionBusy] = useState(false);

	// Page state: persist filters, pagination and scroll restoration
	const {
		key: pageKey,
		savedState,
		save,
	} = usePageState({
		hasPagination: true,
		hasFilters: true,
		getCurrentState: () => ({
			currentPage: page,
			filters: filters as unknown as Record<string, unknown>,
		}),
	});

	// Restore saved state on mount
	useEffect(() => {
		if (
			savedState?.currentPage &&
			typeof savedState.currentPage === 'number'
		) {
			setPage(savedState.currentPage);
		}
		if (savedState?.filters) {
			const savedFilters = savedState.filters as Record<string, unknown>;
			setFilters({
				type: (savedFilters.type as FilterType['type']) || '',
				status: (savedFilters.status as FilterType['status']) || '',
				search: (savedFilters.search as string) || '',
				network: (savedFilters.network as string) || '',
				email: (savedFilters.email as string) || '',
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Save state on changes
	useEffect(() => {
		save({
			currentPage: page,
			filters: filters as unknown as Record<string, unknown>,
		});
	}, [page, filters, save]);

	// Build hook filters
	const hookFilters = useMemo(() => {
		const hf: Record<string, string | undefined> = {
			name: filters.search || undefined,
			userType: filters.type || undefined,
		};
		if (filters.status === 'active') hf.isValidated = 'true';
		else if (filters.status === 'pending') hf.isValidated = 'false';
		else if (filters.status === 'blocked') hf.isBlocked = 'true';
		return hf;
	}, [filters]);

	const {
		users: hookUsers,
		loading: hookLoading,
		refetch,
	} = useAdminUsers(hookFilters);
	const users = initialUsers || hookUsers;
	const loading = initialLoading !== undefined ? initialLoading : hookLoading;

	// Scroll restoration (window scroll)
	useScrollRestoration({
		key: pageKey,
		ready: !loading,
	});

	// Filter and normalize users
	const filteredUsers = useMemo<AdminUser[]>(() => {
		if (!users) return [];

		return (users as AdminUser[])
			.map((u) => ({
				...u,
				status: getUserStatus(u),
				registeredAt:
					u.registeredAt ||
					(u as unknown as { createdAt?: string }).createdAt ||
					'',
				type: u.type || u.userType || 'apporteur',
			}))
			.filter((u) => {
				const search = filters.search?.toLowerCase() || '';
				const emailFilter = (filters.email || '').toLowerCase();
				const matchSearch =
					!search ||
					(u.firstName || '').toLowerCase().includes(search) ||
					(u.lastName || '').toLowerCase().includes(search) ||
					(u.email || '').toLowerCase().includes(search);
				const matchEmail =
					!emailFilter ||
					(u.email || '').toLowerCase().includes(emailFilter);
				const matchType = !filters.type || u.type === filters.type;
				const matchStatus =
					!filters.status || u.status === filters.status;
				return matchSearch && matchEmail && matchType && matchStatus;
			}) as AdminUser[];
	}, [users, filters]);

	// Paginate
	const pagedUsers = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredUsers.slice(start, start + limit);
	}, [filteredUsers, page, limit]);

	// Export functions
	const exportToCSV = () => {
		const headers = [
			'_id',
			'firstName',
			'lastName',
			'email',
			'type',
			'network',
			'status',
			'registeredAt',
			'propertiesCount',
			'collaborationsActive',
			'collaborationsClosed',
			'connectionsCount',
			'lastActive',
		];
		const csvContent = generateCSV(
			filteredUsers.map((u) => ({
				...u,
				network: u.professionalInfo?.network || '',
			})),
			headers,
		);
		const blob = new Blob([csvContent], {
			type: 'text/csv;charset=utf-8;',
		});
		downloadFile(
			`users-${new Date().toISOString().slice(0, 10)}.csv`,
			blob,
		);
	};

	const exportToXLS = () => {
		const headers = [
			'ID',
			'Prénom',
			'Nom',
			'Email',
			'Type',
			'Réseau',
			'Statut',
			'Inscription',
			'Annonces',
			'Collab.',
			'Connexions',
			'Dernière activité',
		];
		const rows = filteredUsers.map((u) => [
			u._id,
			u.firstName || '',
			u.lastName || '',
			u.email || '',
			u.type || '',
			u.professionalInfo?.network || '-',
			u.status || '',
			u.registeredAt || '',
			u.propertiesCount || 0,
			(u.collaborationsActive || 0) + (u.collaborationsClosed || 0),
			u.connectionsCount || 0,
			u.lastActive || '',
		]);

		const table =
			'<table><tr>' +
			headers.map((h) => `<th>${h}</th>`).join('') +
			'</tr>' +
			rows
				.map(
					(r) =>
						`<tr>${r.map((c) => `<td>${String(c)}</td>`).join('')}</tr>`,
				)
				.join('') +
			'</table>';
		const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
		downloadFile(
			`users-${new Date().toISOString().slice(0, 10)}.xls`,
			blob,
		);
	};

	const handleFilterChange = (f: {
		userType?: string;
		isValidated?: string;
		name?: string;
		network?: string;
		email?: string;
	}) => {
		setFilters({
			type: (f.userType as FilterType['type']) || '',
			status:
				f.isValidated === 'true'
					? 'active'
					: f.isValidated === 'false'
						? 'pending'
						: '',
			search: f.name || '',
			network: f.network || '',
			email: f.email || '',
		});
		setPage(1);
	};

	const getConfirmVariant = () => {
		if (!tableConfirmAction?.type) return 'primary';
		if (
			tableConfirmAction.type === 'block' ||
			tableConfirmAction.type === 'delete' ||
			tableConfirmAction.type === 'invalidate'
		)
			return 'danger';
		if (
			tableConfirmAction.type === 'unblock' ||
			tableConfirmAction.type === 'validate'
		)
			return 'primary';
		if (tableConfirmAction.type?.includes('manual')) return 'warning';
		return 'primary';
	};

	const columns = getUserTableColumns();

	return (
		<div className="space-y-3 sm:space-y-4 lg:space-y-5 animate-in fade-in duration-500">
			<AdminPageHeader
				title="Gestion Utilisateurs"
				icon={<Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
				count={filteredUsers.length}
				countLabel={`utilisateur${filteredUsers.length > 1 ? 's' : ''}`}
				actions={
					<>
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setShowImport(true)}
							className="text-[10px] sm:text-xs px-2 sm:px-3"
						>
							<Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							<span className="hidden sm:inline ml-1">
								Import
							</span>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							onClick={exportToCSV}
							className="text-[10px] sm:text-xs px-2 sm:px-3"
						>
							<Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							<span className="hidden sm:inline ml-1">CSV</span>
						</Button>
						<Button
							variant="secondary"
							size="sm"
							onClick={exportToXLS}
							className="text-[10px] sm:text-xs px-2 sm:px-3"
						>
							<Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							<span className="hidden sm:inline ml-1">XLS</span>
						</Button>
						<Button
							variant="primary"
							size="sm"
							onClick={() => setShowCreate(true)}
							className="text-[10px] sm:text-xs px-2 sm:px-3"
						>
							<Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
							<span className="ml-1">Nouveau</span>
						</Button>
					</>
				}
			/>

			<AdminUserFilters onChange={handleFilterChange} />

			{tableConfirmAction && (
				<ConfirmDialog
					isOpen={!!tableConfirmAction}
					title="Confirmation"
					description={tableConfirmAction.label}
					onConfirm={tableConfirmAction.onConfirm}
					onCancel={() => setTableConfirmAction(null)}
					confirmText="Confirmer"
					cancelText="Annuler"
					variant={getConfirmVariant()}
					loading={actionBusy}
				/>
			)}

			{/* Stats Cards */}
			<div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 lg:gap-4">
				<FilterStatCard
					icon={
						<Users className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
					}
					label="Total"
					value={filteredUsers.length}
					color="blue"
				/>
				<FilterStatCard
					icon={
						<Banknote className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
					}
					label="Payé"
					value={
						filteredUsers.filter(
							(u) => u.isPaid || u.accessGrantedByAdmin,
						).length
					}
					color="green"
				/>
				<FilterStatCard
					icon={
						<AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
					}
					label="Non payé"
					value={
						filteredUsers.filter(
							(u) =>
								u.type === 'agent' &&
								!u.isPaid &&
								!u.accessGrantedByAdmin,
						).length
					}
					color="yellow"
				/>
				<FilterStatCard
					icon={
						<ShieldOff className="w-4 h-4 sm:w-5 sm:h-5 lg:w-7 lg:h-7" />
					}
					label="Bloqué"
					value={filteredUsers.filter((u) => u.isBlocked).length}
					color="rose"
				/>
			</div>

			{/* DataTable */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
				<DataTable
					columns={columns}
					data={pagedUsers}
					pagination={false}
					loading={loading}
					actions={(row: AdminUser) => (
						<UserActions
							user={row}
							onConfirmAction={setTableConfirmAction}
							refetch={async () => {
								await refetch();
							}}
							setActionBusy={setActionBusy}
						/>
					)}
				/>

				<Pagination
					currentPage={page}
					totalItems={filteredUsers.length}
					pageSize={limit}
					onPageChange={setPage}
					className="w-full my-4"
				/>
			</div>

			{/* Modals */}
			{showImport && (
				<ImportUsersModal
					open={showImport}
					onClose={() => setShowImport(false)}
					onSuccess={() => {
						setShowImport(false);
						refetch();
					}}
				/>
			)}
			{showCreate && (
				<CreateUserModal
					onClose={() => setShowCreate(false)}
					onCreated={() => {
						setShowCreate(false);
						refetch();
					}}
				/>
			)}
		</div>
	);
};

export default AdminUsersTableModern;
