/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Image from 'next/image';
import CreateUserModal from './CreateUserModal';
import ImportUsersModal from './ImportUsersModal';
import Link from 'next/link';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { adminService } from '@/lib/api/adminApi'; // Import the new admin service
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import AdminUserFilters from './AdminUserFilters';
import { toast } from 'react-toastify';
import { Download, Upload, Plus, Users, CheckCircle, Clock, Eye, Edit, Unlock, UserX, Key, CreditCard, X } from 'lucide-react';

// Use env-configured API root so production builds call the correct backend
const API_ROOT = (() => {
	const raw = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
	return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
})();

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
	const [page, setPage] = useState<number>(1);
	const [limit, setLimit] = useState<number>(10);
	const [filters, setFilters] = useState({ type: '', status: '', search: '', network: '', email: '' });
	const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
	const [showCreate, setShowCreate] = useState(false);
	const [showImport, setShowImport] = useState(false);
	const [tableConfirmAction, setTableConfirmAction] = useState<null | { label: string; onConfirm: () => Promise<void>; type?: string }>(null);
	const [actionBusy, setActionBusy] = useState(false);

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
			const emailFilter = (filters.email || '').toLowerCase();
			const matchSearch = !search ||
				(u.firstName || '').toLowerCase().includes(search) ||
				(u.lastName || '').toLowerCase().includes(search) ||
				(u.email || '').toLowerCase().includes(search);
			const matchEmail = !emailFilter || (u.email || '').toLowerCase().includes(emailFilter);
			const matchType = !filters.type || u.type === filters.type;
			const matchStatus = !filters.status || (u.status === filters.status);
			return matchSearch && matchEmail && matchType && matchStatus;
		});
	}, [users, filters]);

	const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / limit)), [filteredUsers.length, limit]);
	const pagedUsers = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredUsers.slice(start, start + limit);
	}, [filteredUsers, page, limit]);

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

		const table = '<table><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>' + rows.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('') + '</table>';
		const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
		download(`users-${new Date().toISOString().slice(0,10)}.xls`, blob);
	};

	const statusVariant = (status: string) => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'error';
	};

	return (
		<div className="space-y-4 sm:space-y-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
				<div className="min-w-0">
					<h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion Utilisateurs</h1>
					<p className="text-xs sm:text-sm text-gray-600 mt-1">Total: {filteredUsers.length} utilisateur(s)</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="secondary" size="md" onClick={() => setShowImport(true)}><Download className="w-4 h-4 inline-block mr-1 sm:mr-2" />Importer</Button>
					<Button variant="secondary" size="md" onClick={() => exportToCSV()}><Upload className="w-4 h-4 inline-block mr-1 sm:mr-2" />Exporter CSV</Button>
					<Button variant="secondary" size="md" onClick={() => exportToXLS()}><Upload className="w-4 h-4 inline-block mr-1 sm:mr-2" />Exporter XLS</Button>
					<Button variant="primary" size="md" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 inline-block mr-1 sm:mr-2" />Nouveau</Button>
				</div>
			</div>

			<AdminUserFilters
				onChange={(f: any) => {
					setFilters({
						type: f.userType || '',
						status: f.isValidated === 'true' ? 'active' : f.isValidated === 'false' ? 'pending' : '',
						search: f.name || '',
						network: f.network || '',
						email: f.email || ''
					});
				}}
			/>
			{tableConfirmAction && (
				<ConfirmDialog
					isOpen={!!tableConfirmAction}
					title="Confirmation"
					description={tableConfirmAction.label}
					onConfirm={tableConfirmAction.onConfirm}
					onCancel={() => setTableConfirmAction(null)}
					confirmText="Confirmer"
					cancelText="Annuler"
					variant={tableConfirmAction.type === 'block' ? 'danger' : tableConfirmAction.type === 'unblock' ? 'primary' : tableConfirmAction.type?.includes('manual') ? 'warning' : 'primary'}
					loading={actionBusy}
				/>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
				<FilterStatCard icon={<Users className="w-6 h-6 sm:w-8 sm:h-8" />} label="Total" value={filteredUsers.length} color="blue" />
				<FilterStatCard icon={<CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />} label="Actifs" value={filteredUsers.filter(u => u.status === 'active').length} color="green" />
				<FilterStatCard icon={<Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />} label="En attente" value={filteredUsers.filter(u => u.status === 'pending').length} color="yellow" />
			</div>

			<DataTable
				columns={[
					{
						header: 'Utilisateur',
						accessor: 'firstName',
						width: '25%',
						render: (_: any, row: AdminUser) => (
							<div className="flex items-center gap-2 sm:gap-3 min-w-0">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
									{(row.firstName && row.firstName.charAt) ? row.firstName.charAt(0) : (row.email ? row.email.charAt(0) : 'U')}
								</div>
								<div className="min-w-0">
									<p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{row.firstName} {row.lastName}</p>
									<p className="text-xs text-gray-500 truncate">{row.email}</p>
								</div>
							</div>
						),
					},
					{
						header: 'Type',
						accessor: 'type',
						width: '12%',
						render: (value: any) => {
							const v = String(value || '').toLowerCase();
							let label = v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Apporteur';
							let variant: 'info' | 'gray' | 'success' | 'warning' | 'error' = 'gray';
							if (v === 'agent') { label = 'Agent'; variant = 'info'; }
							else if (v === 'apporteur') { label = 'Apporteur'; variant = 'gray'; }
							else if (v === 'admin' || v === 'administrator') { label = 'Admin'; variant = 'success'; }
							return <Badge variant={variant} size="sm">{label}</Badge>;
						},
					},
					{
						header: 'Réseau',
						accessor: 'network',
						width: '10%',
						render: (_value: any, row: AdminUser) => (<span className="text-xs sm:text-sm text-gray-700 truncate">{row.professionalInfo?.network || '-'}</span>),
					},
					{
						header: 'Activité',
						accessor: 'activity',
						width: '18%',
						render: (_v: any, row: AdminUser) => (
							<div className="text-xs space-y-0.5">
								<div>📋: <span className="font-medium">{row.propertiesCount ?? 0}</span></div>
								<div>🤝: <span className="font-medium">{((row.collaborationsActive ?? 0) + (row.collaborationsClosed ?? 0))}</span></div>
								<div>📱: <span className="font-medium">{row.connectionsCount ?? 0}</span></div>
							</div>
						),
					},
					{
						header: 'Statut',
						accessor: 'status',
						width: '12%',
						render: (_value: any, row: AdminUser) => {
							const value = (row.isBlocked ? 'blocked' : (row.isValidated ? 'active' : 'pending')) as 'active' | 'pending' | 'blocked';
							return <Badge variant={statusVariant(value) as any} size="sm">{value && value.charAt ? value.charAt(0).toUpperCase() + value.slice(1) : String(value || '')}</Badge>;
						},
					},
					{
						header: 'Inscription',
						accessor: 'registeredAt',
						width: '13%',
						render: (value: any) => {
							if (!value) return <span className="text-xs text-gray-600">-</span>;
							const d = new Date(value);
							if (isNaN(d.getTime())) return <span className="text-xs text-gray-600">-</span>;
							return <span className="text-xs text-gray-600">{d.toLocaleDateString('fr-FR')}</span>;
						},
					},
					{
						header: 'Paiement',
						accessor: 'isPaid',
						width: '12%',
						render: (_value: any, row: AdminUser) => {
							if (row.type !== 'agent') return <span className="text-xs text-gray-500">N/A</span>;
							if (row.accessGrantedByAdmin) return <Badge variant="info" size="sm">Accès manuel</Badge>;
							if (row.isPaid) return <Badge variant="success" size="sm">Payé</Badge>;
							if (row.profileCompleted) return <Badge variant="warning" size="sm">En attente</Badge>;
							return <span className="text-xs text-gray-500">Profil incomplet</span>;
						},
					},
				]}
				data={pagedUsers}
				pagination={false}
				loading={loading}
				actions={(row: AdminUser) => (
					<div className="flex items-center gap-2">
						<Link href={`/admin/users/${row._id}`} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Voir"><Eye className="w-4 h-4" /></Link>
						<button onClick={() => setEditingUser(row)} className="p-1 hover:bg-blue-100 rounded transition-colors" title="Éditer"><Edit className="w-4 h-4" /></button>
						{row.isBlocked ? (
							<button title="Débloquer" onClick={() => setTableConfirmAction({ label: 'Débloquer cet utilisateur ?', type: 'unblock', onConfirm: async () => { setActionBusy(true); try { await adminService.unblockUser(row._id); await refetch(); toast.success('Utilisateur débloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} className="p-1 hover:bg-green-100 rounded transition-colors"><Unlock className="w-4 h-4" /></button>
						) : (
							<button title="Bloquer" onClick={() => setTableConfirmAction({ label: 'Bloquer cet utilisateur ?', type: 'block', onConfirm: async () => { setActionBusy(true); try { await adminService.blockUser(row._id); await refetch(); toast.warn('Utilisateur bloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} className="p-1 hover:bg-amber-100 rounded transition-colors"><UserX className="w-4 h-4" /></button>
						)}
						{/* --- Manual Access Buttons --- */}
						{row.type === 'agent' && !row.isPaid && (
							row.accessGrantedByAdmin ? (
								<button title="Révoquer l'accès manuel" onClick={() => setTableConfirmAction({ label: 'Révoquer l\'accès manuel pour cet utilisateur ?', type: 'revoke_manual', onConfirm: async () => { setActionBusy(true); try { await adminService.revokeAdminAccess(row._id); await refetch(); toast.info('Accès manuel révoqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} className="p-1 hover:bg-red-100 rounded transition-colors"><X className="w-4 h-4" /></button>
							) : (
								<button title="Donner l'accès manuel" onClick={() => setTableConfirmAction({ label: 'Donner l\'accès manuel à cet utilisateur (outrepasse le paiement) ?', type: 'grant_manual', onConfirm: async () => { setActionBusy(true); try { await adminService.grantAdminAccess(row._id); await refetch(); toast.success('Accès manuel accordé.'); } catch (err: any) { console.error(err); const msg = err?.response?.data?.error || err?.message || 'Erreur.'; toast.error(msg); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} className="p-1 hover:bg-purple-100 rounded transition-colors"><Key className="w-4 h-4" /></button>
							)
						)}
						{row.type === 'agent' && !row.isPaid && row.profileCompleted && (
							<button title="Envoyer rappel paiement" onClick={async () => { try { await adminService.sendPaymentReminder(row._id); toast.success('Rappel de paiement envoyé.'); } catch (err) { console.error(err); toast.error('Erreur lors de l\'envoi du rappel.'); } }} className="p-1 hover:bg-orange-100 rounded transition-colors"><CreditCard className="w-4 h-4" /></button>
						)}
					</div>
				)}
			/>

			<Pagination
				currentPage={page}
				totalItems={filteredUsers.length}
				pageSize={limit}
				onPageChange={(p) => setPage(p)}
				className="w-full"
			/>

			{showImport && (<ImportUsersModal open={showImport} onClose={() => setShowImport(false)} onSuccess={() => { setShowImport(false); refetch(); }} />)}
			{editingUser && (<EditUserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={() => { setEditingUser(null); refetch(); }} />)}
			{showCreate && (<CreateUserModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); refetch(); }} />)}
		</div>
	);
};

const FilterStatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string }> = ({ icon, label, value, color }) => {
	const colors = { blue: 'from-blue-50 to-cyan-50 border-blue-100', green: 'from-emerald-50 to-green-50 border-emerald-100', yellow: 'from-amber-50 to-yellow-50 border-amber-100' };
	return (
		<div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-lg p-3 sm:p-4`}>
				<div className="flex items-center justify-between">
					<div className="min-w-0">
						<p className="text-xs sm:text-sm text-gray-600 truncate">{label}</p>
						<p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{value}</p>
					</div>
					<span className="text-2xl sm:text-3xl flex-shrink-0">{icon}</span>
				</div>
		</div>
	);
};

const EditUserModal: React.FC<{ user: AdminUser; onClose: () => void; onSave: () => void; }> = ({ user, onClose, onSave }) => {
	 const [form, setForm] = useState<AdminUser>({ ...user, professionalInfo: user.professionalInfo || { network: '' } });
	 const roleOptions = [
		 { value: 'agent', label: 'Agent' },
		 { value: 'apporteur', label: 'Apporteur' },
		 { value: 'admin', label: 'Admin' }
	 ];
	const [busy, setBusy] = useState(false);
	const [confirmAction, setConfirmAction] = useState<null | { type: 'block' | 'validate' | 'manualAccess', label: string, onConfirm: () => void }>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setBusy(true);
		try {
			const calls: Promise<any>[] = [];
			if (form.isValidated !== user.isValidated) {
				calls.push(fetch(`${API_ROOT}/api/admin/users/${user._id}/validate`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: !!form.isValidated }) }));
			}
			if (form.isBlocked !== user.isBlocked) {
				calls.push(fetch(`${API_ROOT}/api/admin/users/${user._id}/${form.isBlocked ? 'block' : 'unblock'}`, { method: 'POST', credentials: 'include' }));
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
			calls.push(fetch(`${API_ROOT}/api/admin/users/${user._id}`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cleaned) }));

			const results = await Promise.all(calls);
			if (results.every((r) => r.ok)) {
				toast.success('Modifications enregistrées');
				onSave();
			} else {
				console.error('admin update failed', results);
				toast.error('Échec de la mise à jour');
			}
		} catch (err) {
			console.error(err);
			toast.error('Erreur lors de la mise à jour');
		} finally {
			setBusy(false);
		}
	};

	 const handleBlockToggle = () => {
		 setConfirmAction({
			 type: 'block',
			 label: user.isBlocked ? 'Débloquer cet utilisateur ?' : 'Bloquer cet utilisateur ?',
			 onConfirm: async () => {
				 setBusy(true);
				 try {
					 if (user.isBlocked) await adminService.unblockUser(user._id);
					 else await adminService.blockUser(user._id);
					 toast.success(user.isBlocked ? 'Utilisateur débloqué' : 'Utilisateur bloqué');
					 onSave();
				 } catch (err) {
					 console.error(err);
					 toast.error('Erreur');
				 } finally { setBusy(false); setConfirmAction(null); }
			 }
		 });
	 };

	 const handleValidateToggle = () => {
		 setConfirmAction({
			 type: 'validate',
			 label: user.isValidated ? 'Retirer la validation de cet utilisateur ?' : 'Valider cet utilisateur ?',
			 onConfirm: async () => {
				 setBusy(true);
				 try {
					 await fetch(`${API_ROOT}/api/admin/users/${user._id}/validate`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: !user.isValidated }) });
					 toast.success(user.isValidated ? 'Validation retirée' : 'Utilisateur validé');
					 onSave();
				 } catch (err) {
					 console.error(err);
					 toast.error('Erreur');
				 } finally { setBusy(false); setConfirmAction(null); }
			 }
		 });
	 };

	 const handleGrantRevokeAccess = () => {
		 setConfirmAction({
			 type: 'manualAccess',
			 label: user.accessGrantedByAdmin ? 'Révoquer l\'accès manuel pour cet utilisateur ?' : 'Donner l\'accès manuel à cet utilisateur (outrepasse le paiement) ?',
			 onConfirm: async () => {
				 setBusy(true);
				 try {
					 if (user.accessGrantedByAdmin) await adminService.revokeAdminAccess(user._id);
					 else await adminService.grantAdminAccess(user._id);
					 toast.success(user.accessGrantedByAdmin ? 'Accès révoqué' : 'Accès accordé');
					 onSave();
				 } catch (err: any) {
					 console.error(err);
					 const msg = err?.response?.data?.error || err?.message || 'Erreur.';
					 toast.error(msg);
				 } finally { setBusy(false); setConfirmAction(null); }
			 }
		 });
	 };

	const handleSendReminder = async () => {
		setBusy(true);
		try {
			await adminService.sendPaymentReminder(user._id);
			toast.success('Rappel envoyé');
		} catch (err) {
			console.error(err);
			toast.error('Erreur');
		} finally { setBusy(false); }
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
				<div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
					<h2 className="text-xl font-bold text-gray-900">Profil utilisateur</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
				</div>

				 <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left: main info */}
					<div className="lg:col-span-2 bg-white p-4 rounded-lg border">
						<div className="flex items-start gap-6">
							<div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
								{form.profileImage ? <Image src={form.profileImage} alt="avatar" width={112} height={112} className="w-full h-full object-cover" /> : <Users className="w-12 h-12 text-gray-400" />}
							</div>
							<div className="flex-1">
								<h3 className="text-2xl font-bold text-gray-900">{form.firstName} {form.lastName}</h3>
								<p className="text-sm text-gray-600">{form.email}</p>
								<p className="text-sm text-gray-600">{form.phone || '-'}</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<Badge variant="info">{`Rôle: ${(form.type || (form as any).userType) || 'apporteur'}`}</Badge>
									<Badge variant="gray">{`Réseau: ${form.professionalInfo?.network || '-'}`}</Badge>
									<Badge variant={form.isValidated ? 'success' : 'warning'}>{`Validé: ${form.isValidated ? 'Oui' : 'Non'}`}</Badge>
								</div>
							</div>
						</div>

						 <div className="mt-6 space-y-4">
							 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								 <label className="block">
									 <span className="text-sm text-gray-600">Prénom</span>
									 <input className="mt-1 block w-full border rounded px-3 py-2" value={form.firstName || ''} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
								 </label>
								 <label className="block">
									 <span className="text-sm text-gray-600">Nom</span>
									 <input className="mt-1 block w-full border rounded px-3 py-2" value={form.lastName || ''} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
								 </label>
							 </div>

							 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								 <label className="block">
									 <span className="text-sm text-gray-600">Email</span>
									 <input className="mt-1 block w-full border rounded px-3 py-2" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
								 </label>
								 <label className="block">
									 <span className="text-sm text-gray-600">Téléphone</span>
									 <input className="mt-1 block w-full border rounded px-3 py-2" value={(form as any).phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value } as any)} />
								 </label>
							 </div>

							 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								 <label className="block">
									 <span className="text-sm text-gray-600">Rôle</span>
									<select className="mt-1 block w-full border rounded px-3 py-2" value={form.type || ''} onChange={(e) => setForm({ ...form, type: e.target.value as 'agent' | 'apporteur' | 'admin' })}>
										 {roleOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
									 </select>
								 </label>
								 <label className="block">
									 <span className="text-sm text-gray-600">Réseau</span>
									 <input className="mt-1 block w-full border rounded px-3 py-2" value={form.professionalInfo?.network || ''} onChange={(e) => setForm({ ...form, professionalInfo: { ...(form.professionalInfo || {}), network: e.target.value } })} />
								 </label>
							 </div>
						 </div>

						<div className="mt-6 flex gap-3">
							<button type="submit" disabled={busy} className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700">Enregistrer</button>
							<button type="button" onClick={onClose} className="px-4 py-2 border rounded">Fermer</button>
						</div>
					</div>

					{/* Right: actions & stats */}
					<div className="bg-white p-4 rounded-lg border flex flex-col gap-4">
						<div className="space-y-2">
							<div className="text-sm text-gray-600">Statistiques</div>
							<div className="grid grid-cols-3 gap-2">
								<div className="bg-blue-50 p-3 rounded text-center"><div className="text-sm text-blue-700">Annonces</div><div className="font-bold text-lg">{user.propertiesCount ?? 0}</div></div>
								<div className="bg-green-50 p-3 rounded text-center"><div className="text-sm text-green-700">Collab. actives</div><div className="font-bold text-lg">{user.collaborationsActive ?? 0}</div></div>
								<div className="bg-purple-50 p-3 rounded text-center"><div className="text-sm text-purple-700">Collab. clôturées</div><div className="font-bold text-lg">{user.collaborationsClosed ?? 0}</div></div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-sm text-gray-600">Actions rapides</div>
							<div className="flex flex-col gap-2">
								   <button disabled={busy} type="button" onClick={handleValidateToggle} className="w-full px-3 py-2 bg-emerald-500 text-white rounded flex items-center gap-2 justify-center">{user.isValidated ? 'Retirer validation' : 'Valider utilisateur'}</button>
								   <button disabled={busy} type="button" onClick={handleBlockToggle} className="w-full px-3 py-2 bg-amber-500 text-white rounded flex items-center gap-2 justify-center">{user.isBlocked ? 'Débloquer' : 'Bloquer'}</button>
								   <button disabled={busy} type="button" onClick={handleGrantRevokeAccess} className="w-full px-3 py-2 bg-purple-500 text-white rounded flex items-center gap-2 justify-center">{user.accessGrantedByAdmin ? 'Révoquer accès manuel' : 'Donner accès manuel'}</button>
											{confirmAction && (
												<ConfirmDialog
													isOpen={!!confirmAction}
													title="Confirmation"
													description={confirmAction.label}
													onConfirm={confirmAction.onConfirm}
													onCancel={() => setConfirmAction(null)}
													confirmText="Confirmer"
													cancelText="Annuler"
													variant={confirmAction.type === 'block' ? 'danger' : confirmAction.type === 'manualAccess' ? 'warning' : 'primary'}
													loading={busy}
												/>
											)}
 							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AdminUsersTableModern;
