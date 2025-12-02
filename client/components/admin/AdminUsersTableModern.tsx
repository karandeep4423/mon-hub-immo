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
import { Download, Upload, Plus, Users, CheckCircle, Clock, Eye, Edit, Unlock, UserX, Key, CreditCard, X, Globe } from 'lucide-react';

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
	const [limit] = useState<number>(10);
	const [filters, setFilters] = useState<{ type: '' | 'agent' | 'apporteur' | 'admin'; status: '' | 'active' | 'pending' | 'blocked'; search: string; network: string; email: string }>({ type: '', status: '', search: '', network: '', email: '' });
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

	interface HookFilters { name?: string; userType?: 'agent' | 'apporteur' | 'admin' | ''; isValidated?: 'true' | 'false'; isBlocked?: 'true'; network?: string; email?: string }
	const hookFilters: HookFilters = {
		name: filters.search || undefined,
		userType: filters.type || undefined,
	};
	if (filters.status === 'active') hookFilters.isValidated = 'true';
	else if (filters.status === 'pending') hookFilters.isValidated = 'false';
	else if (filters.status === 'blocked') hookFilters.isBlocked = 'true';

	const { users: hookUsers, loading: hookLoading, refetch } = useAdminUsers(hookFilters);
	const users = initialUsers || hookUsers;
	const loading = initialLoading !== undefined ? initialLoading : hookLoading;

	const filteredUsers = useMemo<AdminUser[]>(() => {
		if (!users) return [];
		const usersToFilter = (users || []).map((u: AdminUser) => {
			const uu = u as unknown as Record<string, unknown>;
			const status = ((uu['status'] as string) || ((uu['isBlocked'] as boolean) ? 'blocked' : (uu['isValidated'] as boolean) ? 'active' : 'pending')) as 'active' | 'pending' | 'blocked';
			const registeredAt = ((uu['registeredAt'] as string) || (uu['createdAt'] as string) || (uu['createdAtISO'] as string) || (uu['created_at'] as string) || '') as string;
			const type = ((uu['type'] as string) || (uu['userType'] as string) || (uu['role'] as string) || 'apporteur') as 'agent' | 'apporteur' | 'admin';
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

	const pagedUsers = useMemo(() => {
		const start = (page - 1) * limit;
		return filteredUsers.slice(start, start + limit);
	}, [filteredUsers, page, limit]);

	const exportToCSV = (usersToExport: AdminUser[] = filteredUsers) => {
		const headers = ['_id','firstName','lastName','email','type','network','status','registeredAt','propertiesCount','collaborationsActive','collaborationsClosed','connectionsCount','lastActive'];
		const csvRows = [headers.join(',')];
		for (const u of usersToExport) {
			const row = headers.map((h) => {
				const v = (u as unknown as Record<string, unknown>)[h];
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

	const exportToXLS = (usersToExport: AdminUser[] = filteredUsers) => {
		const headers = ['ID','Prénom','Nom','Email','Type','Réseau','Statut','Inscription','Annonces','Collab.','Connexions','Dernière activité'];
		const rows = usersToExport.map((u) => [
			(u as unknown as Record<string, unknown>)['_id'] || '',
			(u as unknown as Record<string, unknown>)['firstName'] || '',
			(u as unknown as Record<string, unknown>)['lastName'] || '',
			(u as unknown as Record<string, unknown>)['email'] || '',
			(u as unknown as Record<string, unknown>)['type'] || '',
			(u as AdminUser).professionalInfo?.network || '-',
			(u as unknown as Record<string, unknown>)['status'] || '',
			(u as unknown as Record<string, unknown>)['registeredAt'] || '',
			(Number((u as unknown as Record<string, unknown>)['propertiesCount']) || 0),
			(Number((u as unknown as Record<string, unknown>)['collaborationsActive']) || 0) + (Number((u as unknown as Record<string, unknown>)['collaborationsClosed']) || 0),
			(Number((u as unknown as Record<string, unknown>)['connectionsCount']) || 0),
			(u as unknown as Record<string, unknown>)['lastActive'] || '',
		]);

		const table = '<table><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>' + rows.map(r => `<tr>${r.map(c => `<td>${String(c)}</td>`).join('')}</tr>`).join('') + '</table>';
		const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
		download(`users-${new Date().toISOString().slice(0,10)}.xls`, blob);
	};

	const statusVariant = (status: string): 'success' | 'warning' | 'error' => {
		if (status === 'active') return 'success';
		if (status === 'pending') return 'warning';
		return 'error';
	};

	return (
		<div className="space-y-5 animate-in fade-in duration-500">
			{/* Header - Mobile optimized */}
			<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
				<div className="min-w-0">
					<h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
						Gestion Utilisateurs
					</h1>
					<p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
						<Users className="w-4 h-4" />
						<span className="font-medium">{filteredUsers.length}</span> utilisateur{filteredUsers.length > 1 ? 's' : ''}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant="secondary" size="md" onClick={() => setShowImport(true)} className="text-xs sm:text-sm">
						<Download className="w-4 h-4 mr-1.5" />
						<span className="hidden sm:inline">Importer</span>
						<span className="sm:hidden">Import</span>
					</Button>
					<Button variant="secondary" size="md" onClick={() => exportToCSV()} className="text-xs sm:text-sm">
						<Upload className="w-4 h-4 mr-1.5" />
						<span className="hidden sm:inline">CSV</span>
					</Button>
					<Button variant="secondary" size="md" onClick={() => exportToXLS()} className="text-xs sm:text-sm">
						<Upload className="w-4 h-4 mr-1.5" />
						<span className="hidden sm:inline">XLS</span>
					</Button>
					<Button variant="primary" size="md" onClick={() => setShowCreate(true)} className="text-xs sm:text-sm">
						<Plus className="w-4 h-4 mr-1.5" />
						Nouveau
					</Button>
				</div>
			</div>

			<AdminUserFilters
					onChange={(f: { userType?: string; isValidated?: string; name?: string; network?: string; email?: string }) => {
						setFilters({
							type: (f.userType as 'agent' | 'apporteur' | 'admin' | '') || '',
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

			{/* Stats Cards - More compact on mobile */}
			<div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
				<FilterStatCard icon={<Users className="w-5 h-5 sm:w-7 sm:h-7" />} label="Total" value={filteredUsers.length} color="blue" />
				<FilterStatCard icon={<CheckCircle className="w-5 h-5 sm:w-7 sm:h-7" />} label="Actifs" value={filteredUsers.filter(u => u.status === 'active').length} color="green" />
				<FilterStatCard icon={<Clock className="w-5 h-5 sm:w-7 sm:h-7" />} label="Attente" value={filteredUsers.filter(u => u.status === 'pending').length} color="yellow" />
			</div>

			{/* DataTable with responsive wrapper */}
			<div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
			<DataTable
				columns={[
					{
						header: 'Utilisateur',
						accessor: 'firstName',
						width: '25%',
						render: (_: unknown, row: AdminUser) => (
							<div className="flex items-center gap-2 min-w-0">
								<div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
									{(row.firstName && row.firstName.charAt) ? row.firstName.charAt(0) : (row.email ? row.email.charAt(0) : 'U')}
								</div>
								<div className="min-w-0">
									<p className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{row.firstName} {row.lastName}</p>
									<p className="text-xs text-gray-500 truncate hidden sm:block">{row.email}</p>
								</div>
							</div>
						),
					},
					{
						header: 'Type',
						accessor: 'type',
						width: '12%',
						render: (value: unknown) => {
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
						render: (_value: unknown, row: AdminUser) => (
							<div className="flex items-center gap-1.5">
								<Globe className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
								<span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[120px]">{row.professionalInfo?.network || '-'}</span>
							</div>
						),
					},
					{
						header: 'Activité',
						accessor: 'activity',
						width: '18%',
						render: (_v: unknown, row: AdminUser) => (
							<div className="flex flex-wrap gap-2 justify-center">
								<div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 shadow-sm">
									<span className="text-[10px] text-gray-600">📋</span>
									<span className="text-xs font-semibold text-blue-700">{row.propertiesCount ?? 0}</span>
								</div>
								<div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200/50 shadow-sm">
									<span className="text-[10px] text-gray-600">🤝</span>
									<span className="text-xs font-semibold text-purple-700">{((row.collaborationsActive ?? 0) + (row.collaborationsClosed ?? 0))}</span>
								</div>
								<div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/50 shadow-sm">
									<span className="text-[10px] text-gray-600">📱</span>
									<span className="text-xs font-semibold text-emerald-700">{row.connectionsCount ?? 0}</span>
								</div>
							</div>
						),
					},
					{
						header: 'Statut',
						accessor: 'status',
						width: '12%',
						render: (_value: unknown, row: AdminUser) => {
							const value = (row.isBlocked ? 'blocked' : (row.isValidated ? 'active' : 'pending')) as 'active' | 'pending' | 'blocked';
							return (
								<div className="flex justify-center">
									<Badge variant={statusVariant(value)} size="sm" className="shadow-sm">
										{value && value.charAt ? value.charAt(0).toUpperCase() + value.slice(1) : String(value || '')}
									</Badge>
								</div>
							);
						},
					},
					{
						header: 'Inscription',
						accessor: 'registeredAt',
						width: '13%',
						render: (value: unknown) => {
							if (!value) return <span className="text-xs text-gray-500 hidden sm:inline">-</span>;
							const str = typeof value === 'string' ? value : String(value);
							const d = new Date(str);
							if (isNaN(d.getTime())) return <span className="text-xs text-gray-500 hidden sm:inline">-</span>;
							const isRecent = (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
							return (
								<div className="flex items-center gap-1.5 hidden sm:flex">
									<span className={`text-xs ${isRecent ? 'text-emerald-600 font-medium' : 'text-gray-600'}`}>
										{d.toLocaleDateString('fr-FR')}
									</span>
									{isRecent && <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">Nouveau</span>}
								</div>
							);
						},
					},
					{
						header: 'Paiement',
						accessor: 'isPaid',
						width: '12%',
						render: (_value: unknown, row: AdminUser) => {
							if (row.type !== 'agent') return <span className="text-xs text-gray-400 hidden md:inline">N/A</span>;
							if (row.accessGrantedByAdmin) return <Badge variant="info" size="sm" className="shadow-sm hidden md:inline-flex">Accès manuel</Badge>;
							if (row.isPaid) return <Badge variant="success" size="sm" className="shadow-sm hidden md:inline-flex">Payé</Badge>;
							if (row.profileCompleted) return <Badge variant="warning" size="sm" className="shadow-sm hidden md:inline-flex">En attente</Badge>;
							return <span className="text-xs text-gray-400 hidden md:inline">Profil incomplet</span>;
						},
					},
				]}
				data={pagedUsers}
				pagination={false}
				loading={loading}
				actions={(row: AdminUser) => (
					<div className="flex items-center justify-end gap-1.5">
						<Link 
							href={`/admin/users/${row._id}`} 
							className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200 group"
							title="Voir"
						>
							<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
						</Link>
						<button 
							onClick={() => setEditingUser(row)} 
							className="p-2 hover:bg-purple-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-purple-200 group"
							title="Éditer"
						>
							<Edit className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
						</button>
						
						<div className="hidden lg:flex">
							{row.isBlocked ? (
								<button 
									title="Débloquer" 
									onClick={() => setTableConfirmAction({ label: 'Débloquer cet utilisateur ?', type: 'unblock', onConfirm: async () => { setActionBusy(true); try { await adminService.unblockUser(row._id); await refetch(); toast.success('Utilisateur débloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} 
									className="p-2 hover:bg-green-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-green-200 group"
								>
									<Unlock className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
								</button>
							) : (
								<button 
									title="Bloquer" 
									onClick={() => setTableConfirmAction({ label: 'Bloquer cet utilisateur ?', type: 'block', onConfirm: async () => { setActionBusy(true); try { await adminService.blockUser(row._id); await refetch(); toast.warn('Utilisateur bloqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} 
									className="p-2 hover:bg-amber-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-amber-200 group"
								>
									<UserX className="w-4 h-4 text-gray-600 group-hover:text-amber-600 transition-colors" />
								</button>
							)}
						</div>

						{row.type === 'agent' && !row.isPaid && (
							<div className="hidden lg:flex">
								{row.accessGrantedByAdmin ? (
									<button 
										title="Révoquer l'accès manuel" 
										onClick={() => setTableConfirmAction({ label: 'Révoquer l\'accès manuel pour cet utilisateur ?', type: 'revoke_manual', onConfirm: async () => { setActionBusy(true); try { await adminService.revokeAdminAccess(row._id); await refetch(); toast.info('Accès manuel révoqué.'); } catch (err) { console.error(err); toast.error('Erreur.'); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} 
										className="p-2 hover:bg-red-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200 group"
									>
										<X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
									</button>
								) : (
									<button 
										title="Donner l'accès manuel" 
										onClick={() => setTableConfirmAction({ label: 'Donner l\'accès manuel à cet utilisateur (outrepasse le paiement) ?', type: 'grant_manual', onConfirm: async () => { setActionBusy(true); try { await adminService.grantAdminAccess(row._id); await refetch(); toast.success('Accès manuel accordé.'); } catch (err: unknown) { console.error(err); const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || (err as { message?: string }).message || 'Erreur.'; toast.error(msg); } finally { setActionBusy(false); setTableConfirmAction(null); } } })} 
										className="p-2 hover:bg-purple-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-purple-200 group"
									>
										<Key className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
									</button>
								)}
							</div>
						)}

						{row.type === 'agent' && !row.isPaid && row.profileCompleted && (
							<button 
								title="Envoyer rappel paiement" 
								onClick={async () => { try { await adminService.sendPaymentReminder(row._id); toast.success('Rappel de paiement envoyé.'); } catch (err) { console.error(err); toast.error('Erreur lors de l\'envoi du rappel.'); } }} 
								className="p-2 hover:bg-orange-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-orange-200 group hidden lg:flex"
							>
								<CreditCard className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
							</button>
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

interface AdminUserUpdatePayload {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	profileImage?: string;
	userType?: AdminUser['type'];
	type?: AdminUser['type'];
	professionalInfo?: AdminUser['professionalInfo'];
	profileCompleted?: boolean;
	isValidated?: boolean;
	isBlocked?: boolean;
}

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
			const calls: Promise<Response>[] = [];
			if (form.isValidated !== user.isValidated) {
				calls.push(fetch(`${API_ROOT}/api/admin/users/${user._id}/validate`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: !!form.isValidated }) }));
			}
			if (form.isBlocked !== user.isBlocked) {
				calls.push(fetch(`${API_ROOT}/api/admin/users/${user._id}/${form.isBlocked ? 'block' : 'unblock'}`, { method: 'POST', credentials: 'include' }));
			}
			const cleaned: AdminUserUpdatePayload = {
				firstName: form.firstName,
				lastName: form.lastName,
				email: form.email,
				phone: form.phone || undefined,
				profileImage: form.profileImage || undefined,
				...(form.type ? { userType: form.type, type: form.type } : {}),
				professionalInfo: form.professionalInfo || undefined,
				profileCompleted: form.profileCompleted === true,
				...(form.isValidated === user.isValidated ? { isValidated: form.isValidated } : {}),
				...(form.isBlocked === user.isBlocked ? { isBlocked: form.isBlocked } : {}),
			};
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
					 } catch (err: unknown) {
						 console.error(err);
						 const msg = (err as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error || (err as { message?: string }).message || 'Erreur.';
						 toast.error(msg);
				 } finally { setBusy(false); setConfirmAction(null); }
			 }
		 });
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
									<Badge variant="info">{`Rôle: ${(form.type || form.userType) || 'apporteur'}`}</Badge>
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
									<input className="mt-1 block w-full border rounded px-3 py-2" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
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
							<Button type="submit" disabled={busy} variant="primary" className="px-4 py-2">Enregistrer</Button>
							<Button type="button" onClick={onClose} variant="outline" className="px-4 py-2">Fermer</Button>
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
									<Button
										type="button"
										onClick={handleValidateToggle}
										disabled={busy}
										variant="outline"
										className="w-full justify-center"
									>
										{user.isValidated ? 'Retirer validation' : 'Valider utilisateur'}
									</Button>
									<Button
										type="button"
										onClick={handleBlockToggle}
										disabled={busy}
										variant="outline"
										className="w-full justify-center"
									>
										{user.isBlocked ? 'Débloquer' : 'Bloquer'}
									</Button>
									<Button
										type="button"
										onClick={handleGrantRevokeAccess}
										disabled={busy}
										variant="outline"
										className="w-full justify-center"
									>
										{user.accessGrantedByAdmin ? 'Révoquer accès manuel' : 'Donner accès manuel'}
									</Button>
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
