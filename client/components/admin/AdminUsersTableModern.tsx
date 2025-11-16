'use client';

import React, { useState, useMemo } from 'react';
import CreateUserModal from './CreateUserModal';
import ImportUsersModal from './ImportUsersModal';
import Link from 'next/link';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { DataTable } from './ui/DataTable';
import AdminUserFilters from './AdminUserFilters';

export interface AdminUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	type: 'agent' | 'apporteur';
	status?: 'active' | 'pending' | 'blocked';
	isBlocked?: boolean;
	isValidated?: boolean;
	registeredAt: string;
	lastActive?: string;
}

interface AdminUsersTableModernProps {
	users?: AdminUser[];
	loading?: boolean;
}

export const AdminUsersTableModern: React.FC<AdminUsersTableModernProps> = ({
	users: initialUsers,
	loading: initialLoading,
}) => {
	const [filters, setFilters] = useState({ type: '', status: '', search: '', network: '' });
	const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [showImport, setShowImport] = useState(false);

	const hookFilters: any = {
		name: filters.search || undefined,
		userType: filters.type || undefined,
	} as any;
	if (filters.status === 'active') hookFilters.isValidated = 'true';
	else if (filters.status === 'pending') hookFilters.isValidated = 'false';
	else if (filters.status === 'blocked') hookFilters.isBlocked = 'true';

	const { users: hookUsers, loading: hookLoading, refetch } = useAdminUsers(hookFilters);
	const users = initialUsers || hookUsers;
	const loading = initialLoading !== undefined ? initialLoading : hookLoading;

	// Filter users
	const filteredUsers = useMemo(() => {
		if (!users) return [];
		// normalize per-run to avoid stale dependency issues
		const usersToFilter = (users || []).map((u: AdminUser) => {
			const uu = u as unknown as Record<string, unknown>;
			const status = (uu['status'] as string) || ((uu['isBlocked'] as boolean) ? 'blocked' : (uu['isValidated'] as boolean) ? 'active' : 'pending');
			const registeredAt = (uu['registeredAt'] as string) || (uu['createdAt'] as string) || (uu['createdAtISO'] as string) || (uu['created_at'] as string) || undefined;
			return ({
				...u,
				status,
				registeredAt,
			});
		});

		return usersToFilter.filter((u) => {
			const search = filters.search?.toLowerCase() || '';
			const matchSearch = !search ||
				(u.firstName || '').toLowerCase().includes(search) ||
				(u.lastName || '').toLowerCase().includes(search) ||
				(u.email || '').toLowerCase().includes(search);
			const matchType = !filters.type || u.type === filters.type;
			const matchStatus = !filters.status || (u.status === filters.status);
			return matchSearch && matchType && matchStatus;
		});
	}, [users, filters]);

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'error';
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Gestion Utilisateurs</h1>
					<p className="text-gray-600 mt-1">Total: {filteredUsers.length} utilisateur(s)</p>
				</div>
							<div className="flex gap-2">
								<Button variant="secondary" size="md" onClick={() => setShowImport(true)}>
									📥 Importer
								</Button>
								<Button variant="primary" size="md" onClick={() => setShowCreate(true)}>
									➕ Nouveau
								</Button>
							</div>
			</div>

			{/* Filters */}
			<AdminUserFilters
				onChange={(f: any) => {
					// map AdminUserFilters f (name/userType/network/isValidated) to our internal filters
					setFilters({
						type: f.userType || '',
						status: f.isValidated === 'true' ? 'active' : f.isValidated === 'false' ? 'pending' : '',
						search: f.name || '',
						network: f.network || '',
					});
				}}
			/>

			{/* Stats cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FilterStatCard
					icon="👥"
					label="Total"
					value={filteredUsers.length}
					color="blue"
				/>
				<FilterStatCard
					icon="✅"
					label="Actifs"
					value={filteredUsers.filter(u => u.status === 'active').length}
					color="green"
				/>
				<FilterStatCard
					icon="⏳"
					label="En attente"
					value={filteredUsers.filter(u => u.status === 'pending').length}
					color="yellow"
				/>
			</div>

			{/* Table */}
			<DataTable
				columns={[
					{
						header: 'Utilisateur',
						accessor: 'firstName',
						width: '25%',
						render: (_, row: AdminUser) => (
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold">
									{(row.firstName && row.firstName.charAt) ? row.firstName.charAt(0) : (row.email ? row.email.charAt(0) : 'U')}
								</div>
								<div>
									<p className="font-medium text-gray-900">{row.firstName} {row.lastName}</p>
									<p className="text-xs text-gray-500">{row.email}</p>
								</div>
							</div>
						),
					},
					{
						header: 'Type',
						accessor: 'type',
						width: '15%',
						render: (value) => (
							<Badge
								label={value === 'agent' ? 'Agent' : 'Apporteur'}
								variant={value === 'agent' ? 'info' : 'default'}
								size="sm"
							/>
						),
					},
					{
						header: 'Statut',
						accessor: 'status',
						width: '15%',
						render: (_value, row: AdminUser) => {
							const value = (row.isBlocked ? 'blocked' : (row.isValidated ? 'active' : 'pending')) as 'active' | 'pending' | 'blocked';
							return (
								<Badge
									label={
										value && value.charAt
											? value.charAt(0).toUpperCase() + value.slice(1)
											: String(value || '')
									}
									variant={statusVariant(value)}
									size="sm"
								/>
							);
						},
					},
					{
						header: 'Date d\'inscription',
						accessor: 'registeredAt',
						width: '20%',
						render: (value) => {
							if (!value) return <span className="text-sm text-gray-600">-</span>;
							const d = new Date(value);
							if (isNaN(d.getTime())) return <span className="text-sm text-gray-600">-</span>;
							return <span className="text-sm text-gray-600">{d.toLocaleDateString('fr-FR')}</span>;
						},
					},
				]}
				data={filteredUsers}
				pagination
				initialPageSize={10}
				pageSizeOptions={[10, 25, 50]}
				loading={loading}
				actions={(row: AdminUser) => (
					<div className="flex items-center gap-2">
						<Link href={`/admin/users/${row._id}`} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Voir">
							👁️
						</Link>
						<button
							onClick={() => setEditingUser(row)}
							className="p-1 hover:bg-blue-100 rounded transition-colors"
							title="Éditer"
						>
							✏️
						</button>
						{row.isBlocked ? (
							<button
								title="Débloquer"
								onClick={async () => {
									try {
										await fetch(`http://localhost:4000/api/admin/users/${row._id}/unblock`, {
											method: 'POST',
											credentials: 'include',
										});
											await refetch();
									} catch (err) {
										console.error(err);
									}
								}}
								className="p-1 hover:bg-green-100 rounded transition-colors"
							>
								🔓
							</button>
						) : (
							<button
								title="Bloquer"
								onClick={async () => {
									if (!confirm('Bloquer cet utilisateur ?')) return;
									try {
										await fetch(`http://localhost:4000/api/admin/users/${row._id}/block`, {
											method: 'POST',
											credentials: 'include',
										});
										await refetch();
									} catch (err) {
										console.error(err);
									}
								}}
								className="p-1 hover:bg-amber-100 rounded transition-colors"
							>
								🚫
							</button>
						)}
						{/* Delete removed by request */}
					</div>
				)}
			/>

			{/* Import modal */}
			{showImport && (
				<ImportUsersModal open={showImport} onClose={() => setShowImport(false)} onSuccess={() => { setShowImport(false); refetch(); }} />
			)}
			{/* Edit Modal */}
			{editingUser && (
				<EditUserModal
					user={editingUser}
					onClose={() => setEditingUser(null)}
					onSave={() => { setEditingUser(null); refetch(); }}
				/>
			)}
			{/* Create Modal */}
			{showCreate && (
				<CreateUserModal
					onClose={() => setShowCreate(false)}
					onCreated={() => { setShowCreate(false); refetch(); }}
				/>
			)}
		</div>
	);
};

const FilterStatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({
	icon,
	label,
	value,
	color,
}) => {
	const colors = {
		blue: 'from-blue-50 to-cyan-50 border-blue-100',
		green: 'from-emerald-50 to-green-50 border-emerald-100',
		yellow: 'from-amber-50 to-yellow-50 border-amber-100',
	};
	return (
		<div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-lg p-4`}>
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm text-gray-600">{label}</p>
					<p className="text-2xl font-bold text-gray-900">{value}</p>
				</div>
				<span className="text-3xl">{icon}</span>
			</div>
		</div>
	);
};

const EditUserModal: React.FC<{
	user: AdminUser;
	onClose: () => void;
	onSave: () => void;
}> = ({ user, onClose, onSave }) => {
	const [form, setForm] = useState(user);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// Determine which calls to make: validation, block/unblock, and generic update
			const calls: Promise<any>[] = [];

			// If validation changed -> call dedicated endpoint so email & logging happen
			if (form.isValidated !== user.isValidated) {
				calls.push(
					fetch(`http://localhost:4000/api/admin/users/${user._id}/validate`, {
						method: 'PUT',
						credentials: 'include',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ value: !!form.isValidated }),
					}),
				);
			}

			// If blocked changed -> use block/unblock endpoints
			if (form.isBlocked !== user.isBlocked) {
				calls.push(
					fetch(`http://localhost:4000/api/admin/users/${user._id}/${form.isBlocked ? 'block' : 'unblock'}`, {
						method: 'POST',
						credentials: 'include',
					}),
				);
			}

			// Generic update for other changes
			const cleaned = {
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				// Only include isValidated/isBlocked in generic update if not handled above
				...(form.isValidated === user.isValidated ? { isValidated: form.isValidated } : {}),
				...(form.isBlocked === user.isBlocked ? { isBlocked: form.isBlocked } : {}),
			} as any;
			calls.push(
				fetch(`http://localhost:4000/api/admin/users/${user._id}`, {
					method: 'PUT',
					credentials: 'include',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(cleaned),
				}),
			);

			const results = await Promise.all(calls);
			if (results.every((r) => r.ok)) {
				onSave();
			} else {
				console.error('admin update failed', results);
			}
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg max-w-md w-full shadow-xl">
				<div className="border-b border-gray-200 p-6">
					<h2 className="text-xl font-bold text-gray-900">Éditer utilisateur</h2>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
						<input
							type="text"
							value={form.firstName}
							onChange={(e) => setForm({ ...form, firstName: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
						<input
							type="text"
							value={form.lastName}
							onChange={(e) => setForm({ ...form, lastName: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
						<input
							type="email"
							value={form.email}
							onChange={(e) => setForm({ ...form, email: e.target.value })}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
						<select
							value={(form.isBlocked ? 'blocked' : form.isValidated ? 'active' : 'pending') as any}
							onChange={(e) => {
								const newStatus = e.target.value;
								setForm({
									...form,
									isBlocked: newStatus === 'blocked',
									isValidated: newStatus === 'active',
								} as any);
							}}
							className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
						>
							<option value="active">Actif</option>
							<option value="pending">En attente</option>
							<option value="blocked">Bloqué</option>
						</select>
					</div>
					<div className="flex gap-3 pt-4">
						<Button variant="ghost" onClick={onClose} className="flex-1">
							Annuler
						</Button>
						<Button variant="primary" type="submit" className="flex-1">
							Enregistrer
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AdminUsersTableModern;
