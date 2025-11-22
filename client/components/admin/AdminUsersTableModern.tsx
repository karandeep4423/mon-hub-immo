'use client';

import React, { useState, useMemo } from 'react';
import CreateUserModal from './CreateUserModal';
import ImportUsersModal from './ImportUsersModal';
import Link from 'next/link';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { adminService } from '@/lib/api/adminApi'; // Import the new admin service
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { DataTable } from './ui/DataTable';
import AdminUserFilters from './AdminUserFilters';
import { toast } from 'react-toastify';

export interface AdminUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	type: 'agent' | 'apporteur' | 'admin';
	status?: 'active' | 'pending' | 'blocked';
	isBlocked?: boolean;
	isValidated?: boolean;
	registeredAt: string;
	propertiesCount?: number;
	collaborationsActive?: number;
	collaborationsClosed?: number;
	connectionsCount?: number;
	lastActive?: string;
	phone?: string;
	profileImage?: string;
	userType?: string;
	isPaid?: boolean;
	professionalInfo?: { network?: string; tCard?: string; sirenNumber?: string; rsacNumber?: string; collaboratorCertificate?: string };
	stripeCustomerId?: string;
	stripeSubscriptionId?: string;
	subscriptionStatus?: string;
	profileCompleted?: boolean;
	accessGrantedByAdmin?: boolean; // New field for manual access
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

	const download = (filename: string, content: Blob) => {
		const url = URL.createObjectURL(content);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

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

	const filteredUsers = useMemo(() => {
		if (!users) return [];
		const usersToFilter = (users || []).map((u: AdminUser) => {
			const uu = u as unknown as Record<string, unknown>;
			const status = (uu['status'] as string) || ((uu['isBlocked'] as boolean) ? 'blocked' : (uu['isValidated'] as boolean) ? 'active' : 'pending');
			const registeredAt = (uu['registeredAt'] as string) || (uu['createdAt'] as string) || (uu['createdAtISO'] as string) || (uu['created_at'] as string) || undefined;
			const type = (uu['type'] as string) || (uu['userType'] as string) || (uu['role'] as string) || 'apporteur';
			return ({
				...u,
				status,
				registeredAt,
				type,
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

	const exportToCSV = (usersToExport = filteredUsers) => {
		const headers = ['_id','firstName','lastName','email','type','network','status','registeredAt','propertiesCount','collaborationsActive','collaborationsClosed','connectionsCount','lastActive'];
		const csvRows = [headers.join(',')];
		for (const u of usersToExport) {
			const row = headers.map((h) => {
				const v = (u as any)[h];
				if (v === undefined || v === null) return '""';
				const s = String(v).replace(/"/g, '""');
				return `"${s}"`;
			}).join(',');
			csvRows.push(row);
		}
		const csvString = '\uFEFF' + csvRows.join('\n'); // BOM for excel
		const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
		download(`users-${new Date().toISOString().slice(0,10)}.csv`, blob);
	};

	const exportToXLS = (usersToExport = filteredUsers) => {
		const headers = ['ID','Prénom','Nom','Email','Type','Réseau','Statut','Inscription','Annonces','Collab.','Connexions','Dernière activité'];
		const rows = usersToExport.map((u) => [
			(u as any)._id || '',
			(u as any).firstName || '',
			(u as any).lastName || '',
			(u as any).email || '',
			(u as any).type || '',
			(u as any).professionalInfo?.network || '-',
			(u as any).status || '',
			(u as any).registeredAt || '',
			(u as any).propertiesCount ?? 0,
			((u as any).collaborationsActive ?? 0) + ((u as any).collaborationsClosed ?? 0),
			(u as any).connectionsCount ?? 0,
			(u as any).lastActive || '',
		]);

		let table = '<table><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>' + rows.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('') + '</table>';
		const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
		download(`users-${new Date().toISOString().slice(0,10)}.xls`, blob);
	};

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'error';
	};

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Gestion Utilisateurs</h1>
					<p className="text-gray-600 mt-1">Total: {filteredUsers.length} utilisateur(s)</p>
				</div>
				<div className="flex gap-2">
					<Button variant="secondary" size="md" onClick={() => setShowImport(true)}>📥 Importer</Button>
					<Button variant="secondary" size="md" onClick={() => exportToCSV()}>📤 Exporter CSV</Button>
					<Button variant="secondary" size="md" onClick={() => exportToXLS()}>📤 Exporter XLS</Button>
					<Button variant="primary" size="md" onClick={() => setShowCreate(true)}>➕ Nouveau</Button>
				</div>
			</div>

			<AdminUserFilters
				onChange={(f: any) => {
					setFilters({
						type: f.userType || '',
						status: f.isValidated === 'true' ? 'active' : f.isValidated === 'false' ? 'pending' : '',
						search: f.name || '',
						network: f.network || '',
					});
				}}
			/>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<FilterStatCard icon="👥" label="Total" value={filteredUsers.length} color="blue" />
				<FilterStatCard icon="✅" label="Actifs" value={filteredUsers.filter(u => u.status === 'active').length} color="green" />
				<FilterStatCard icon="⏳" label="En attente" value={filteredUsers.filter(u => u.status === 'pending').length} color="yellow" />
			</div>

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
						render: (value) => {
							const v = String(value || '').toLowerCase();
							let label = v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Apporteur';
							let variant: 'info' | 'default' | 'success' | 'warning' | 'error' = 'default';
							if (v === 'agent') { label = 'Agent'; variant = 'info'; }
							else if (v === 'apporteur') { label = 'Apporteur'; variant = 'default'; }
							else if (v === 'admin' || v === 'administrator') { label = 'Admin'; variant = 'success'; }
							return <Badge label={label} variant={variant} size="sm" />;
						},
					},
					{
						header: 'Réseau',
						accessor: 'network',
						width: '12%',
						render: (_value, row: AdminUser) => (<span className="text-sm text-gray-700">{row.professionalInfo?.network || '-'}</span>),
					},
					{
						header: 'Historique d\'activité',
						accessor: 'activity',
						width: '20%',
						render: (_v, row: AdminUser) => (
							<div className="text-sm text-gray-700 space-y-1">
								<div> Annonces: <span className="font-medium">{row.propertiesCount ?? 0}</span></div>
								<div> Collaborations: <span className="font-medium">{((row.collaborationsActive ?? 0) + (row.collaborationsClosed ?? 0))}</span></div>
								<div> Connexions: <span className="font-medium">{row.connectionsCount ?? 0}</span></div>
								<div> Dernière activité: <span className="font-medium">{row.lastActive ? (isNaN(new Date(row.lastActive).getTime()) ? '' : new Date(row.lastActive).toLocaleString('fr-FR')) : '-'}</span></div>
							</div>
						),
					},
					{
						header: 'Statut',
						accessor: 'status',
						width: '15%',
						render: (_value, row: AdminUser) => {
							const value = (row.isBlocked ? 'blocked' : (row.isValidated ? 'active' : 'pending')) as 'active' | 'pending' | 'blocked';
							return <Badge label={value && value.charAt ? value.charAt(0).toUpperCase() + value.slice(1) : String(value || '')} variant={statusVariant(value)} size="sm" />;
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
					{
						header: 'Paiement',
						accessor: 'isPaid',
						width: '12%',
						render: (_value, row: AdminUser) => {
							if (row.type !== 'agent') return <span className="text-sm text-gray-500">N/A</span>;
							if (row.accessGrantedByAdmin) return <Badge label="Accès manuel" variant="info" size="sm" />;
							if (row.isPaid) return <Badge label="Payé" variant="success" size="sm" />;
							if (row.profileCompleted) return <Badge label="En attente" variant="warning" size="sm" />;
							return <span className="text-sm text-gray-500">Profil incomplet</span>;
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
						<Link href={`/admin/users/${row._id}`} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Voir">👁️</Link>
						<button onClick={() => setEditingUser(row)} className="p-1 hover:bg-blue-100 rounded transition-colors" title="Éditer">✏️</button>
						{row.isBlocked ? (
							<button title="Débloquer" onClick={async () => { try { await adminService.unblockUser(row._id); await refetch(); toast.success('Utilisateur débloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } }} className="p-1 hover:bg-green-100 rounded transition-colors">🔓</button>
						) : (
							<button title="Bloquer" onClick={async () => { if (!confirm('Bloquer cet utilisateur ?')) return; try { await adminService.blockUser(row._id); await refetch(); toast.warn('Utilisateur bloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } }} className="p-1 hover:bg-amber-100 rounded transition-colors">🚫</button>
						)}
						{/* --- Manual Access Buttons --- */}
						{row.type === 'agent' && !row.isPaid && (
							row.accessGrantedByAdmin ? (
								<button title="Révoquer l'accès manuel" onClick={async () => { if (!confirm('Révoquer l\'accès manuel pour cet utilisateur ?')) return; try { await adminService.revokeAdminAccess(row._id); await refetch(); toast.info('Accès manuel révoqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } }} className="p-1 hover:bg-red-100 rounded transition-colors">💸</button>
							) : (
									<button title="Donner l'accès manuel" onClick={async () => { if (!confirm('Donner l\'accès manuel à cet utilisateur (outrepasse le paiement) ?')) return; try { await adminService.grantAdminAccess(row._id); await refetch(); toast.success('Accès manuel accordé.'); } catch (err: any) { console.error(err); const msg = err?.response?.data?.error || err?.message || 'Erreur.'; toast.error(msg); } }} className="p-1 hover:bg-purple-100 rounded transition-colors">✨</button>
								)
						)}
						{row.type === 'agent' && !row.isPaid && row.profileCompleted && (
							<button title="Envoyer rappel paiement" onClick={async () => { try { await adminService.sendPaymentReminder(row._id); toast.success('Rappel de paiement envoyé.'); } catch (err) { console.error(err); toast.error('Erreur lors de l\'envoi du rappel.'); } }} className="p-1 hover:bg-orange-100 rounded transition-colors">💳</button>
						)}
					</div>
				)}
			/>

			{showImport && (<ImportUsersModal open={showImport} onClose={() => setShowImport(false)} onSuccess={() => { setShowImport(false); refetch(); }} />)}
			{editingUser && (<EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={() => { setEditingUser(null); refetch(); }} />)}
			{showCreate && (<CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch(); }} />)}
		</div>
	);
};

const FilterStatCard: React.FC<{ icon: string; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
	const colors = { blue: 'from-blue-50 to-cyan-50 border-blue-100', green: 'from-emerald-50 to-green-50 border-emerald-100', yellow: 'from-amber-50 to-yellow-50 border-amber-100' };
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

const EditUserModal: React.FC<{ user: AdminUser; onClose: () => void; onSave: () => void; }> = ({ user, onClose, onSave }) => {
	const [form, setForm] = useState<AdminUser>({ ...user, professionalInfo: user.professionalInfo || { network: '' } });

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const calls: Promise<any>[] = [];
			if (form.isValidated !== user.isValidated) {
				calls.push(fetch(`http://localhost:4000/api/admin/users/${user._id}/validate`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: !!form.isValidated }) }));
			}
			if (form.isBlocked !== user.isBlocked) {
				calls.push(fetch(`http://localhost:4000/api/admin/users/${user._id}/${form.isBlocked ? 'block' : 'unblock'}`, { method: 'POST', credentials: 'include' }));
			}
			const cleaned = {
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				phone: (form as any).phone || undefined,
				profileImage: (form as any).profileImage || undefined,
				...(form.type ? { userType: form.type, type: form.type } : {}),
				professionalInfo: form.professionalInfo || undefined,
				profileCompleted: form.profileCompleted === true,
				...(form.isValidated === user.isValidated ? { isValidated: form.isValidated } : {}),
				...(form.isBlocked === user.isBlocked ? { isBlocked: form.isBlocked } : {}),
			} as any;
			calls.push(fetch(`http://localhost:4000/api/admin/users/${user._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleaned) }));

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
			<div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
				<div className="flex items-center justify-between mb-4 sticky top-0 bg-white">
					<h2 className="text-xl font-bold text-gray-900">Éditer utilisateur</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Form fields... */}
				</form>
			</div>
		</div>
	);
};

export default AdminUsersTableModern;
