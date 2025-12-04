'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminService } from '@/lib/api/adminApi';
import { USER_ROLE_OPTIONS } from '@/lib/constants/admin';
import type { AdminUser, AdminUserUpdatePayload } from '@/types/admin';

interface EditUserModalProps {
	user: AdminUser;
	onClose: () => void;
	onSave: () => void;
}

type ConfirmActionType = 'block' | 'validate' | 'manualAccess';

interface ConfirmActionState {
	type: ConfirmActionType;
	label: string;
	onConfirm: () => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
	user,
	onClose,
	onSave,
}) => {
	const [form, setForm] = useState<AdminUser>({
		...user,
		professionalInfo: user.professionalInfo || { network: '' },
	});
	const [busy, setBusy] = useState(false);
	const [confirmAction, setConfirmAction] =
		useState<ConfirmActionState | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setBusy(true);
		try {
			const calls: Promise<unknown>[] = [];

			if (form.isValidated !== user.isValidated) {
				calls.push(
					adminService.validateUser(user._id, !!form.isValidated),
				);
			}
			if (form.isBlocked !== user.isBlocked) {
				calls.push(
					form.isBlocked
						? adminService.blockUser(user._id)
						: adminService.unblockUser(user._id),
				);
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
				...(form.isValidated === user.isValidated
					? { isValidated: form.isValidated }
					: {}),
				...(form.isBlocked === user.isBlocked
					? { isBlocked: form.isBlocked }
					: {}),
			};
			calls.push(adminService.updateUser(user._id, cleaned));

			await Promise.all(calls);
			toast.success('Modifications enregistrées');
			onSave();
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
			label: user.isBlocked
				? 'Débloquer cet utilisateur ?'
				: 'Bloquer cet utilisateur ?',
			onConfirm: async () => {
				setBusy(true);
				try {
					if (user.isBlocked) {
						await adminService.unblockUser(user._id);
					} else {
						await adminService.blockUser(user._id);
					}
					toast.success(
						user.isBlocked
							? 'Utilisateur débloqué'
							: 'Utilisateur bloqué',
					);
					onSave();
				} catch (err) {
					console.error(err);
					toast.error('Erreur');
				} finally {
					setBusy(false);
					setConfirmAction(null);
				}
			},
		});
	};

	const handleValidateToggle = () => {
		setConfirmAction({
			type: 'validate',
			label: user.isValidated
				? 'Retirer la validation de cet utilisateur ?'
				: 'Valider cet utilisateur ?',
			onConfirm: async () => {
				setBusy(true);
				try {
					await adminService.validateUser(
						user._id,
						!user.isValidated,
					);
					toast.success(
						user.isValidated
							? 'Validation retirée'
							: 'Utilisateur validé',
					);
					onSave();
				} catch (err) {
					console.error(err);
					toast.error('Erreur');
				} finally {
					setBusy(false);
					setConfirmAction(null);
				}
			},
		});
	};

	const handleGrantRevokeAccess = () => {
		setConfirmAction({
			type: 'manualAccess',
			label: user.accessGrantedByAdmin
				? "Révoquer l'accès manuel pour cet utilisateur ?"
				: "Donner l'accès manuel à cet utilisateur (outrepasse le paiement) ?",
			onConfirm: async () => {
				setBusy(true);
				try {
					if (user.accessGrantedByAdmin) {
						await adminService.revokeAdminAccess(user._id);
					} else {
						await adminService.grantAdminAccess(user._id);
					}
					toast.success(
						user.accessGrantedByAdmin
							? 'Accès révoqué'
							: 'Accès accordé',
					);
					onSave();
				} catch (err) {
					console.error(err);
					const msg =
						(err as { response?: { data?: { error?: string } } })
							?.response?.data?.error ||
						(err as { message?: string })?.message ||
						'Erreur.';
					toast.error(msg);
				} finally {
					setBusy(false);
					setConfirmAction(null);
				}
			},
		});
	};

	const getConfirmVariant = () => {
		if (!confirmAction) return 'primary';
		if (confirmAction.type === 'block') return 'danger';
		if (confirmAction.type === 'manualAccess') return 'warning';
		return 'primary';
	};

	return (
		<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6">
				<div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
					<h2 className="text-xl font-bold text-gray-900">
						Profil utilisateur
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="grid grid-cols-1 lg:grid-cols-3 gap-6"
				>
					{/* Left: main info */}
					<div className="lg:col-span-2 bg-white p-4 rounded-lg border">
						<div className="flex items-start gap-6">
							<div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
								{form.profileImage ? (
									<Image
										src={form.profileImage}
										alt="avatar"
										width={112}
										height={112}
										className="w-full h-full object-cover"
									/>
								) : (
									<Users className="w-12 h-12 text-gray-400" />
								)}
							</div>
							<div className="flex-1">
								<h3 className="text-2xl font-bold text-gray-900">
									{form.firstName} {form.lastName}
								</h3>
								<p className="text-sm text-gray-600">
									{form.email}
								</p>
								<p className="text-sm text-gray-600">
									{form.phone || '-'}
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<Badge variant="info">{`Rôle: ${form.type || form.userType || 'apporteur'}`}</Badge>
									<Badge variant="gray">{`Réseau: ${form.professionalInfo?.network || '-'}`}</Badge>
									<Badge
										variant={
											form.isValidated
												? 'success'
												: 'warning'
										}
									>
										{`Validé: ${form.isValidated ? 'Oui' : 'Non'}`}
									</Badge>
								</div>
							</div>
						</div>

						<div className="mt-6 space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="block">
									<span className="text-sm text-gray-600">
										Prénom
									</span>
									<input
										className="mt-1 block w-full border rounded px-3 py-2"
										value={form.firstName || ''}
										onChange={(e) =>
											setForm({
												...form,
												firstName: e.target.value,
											})
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm text-gray-600">
										Nom
									</span>
									<input
										className="mt-1 block w-full border rounded px-3 py-2"
										value={form.lastName || ''}
										onChange={(e) =>
											setForm({
												...form,
												lastName: e.target.value,
											})
										}
									/>
								</label>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="block">
									<span className="text-sm text-gray-600">
										Email
									</span>
									<input
										className="mt-1 block w-full border rounded px-3 py-2"
										value={form.email || ''}
										onChange={(e) =>
											setForm({
												...form,
												email: e.target.value,
											})
										}
									/>
								</label>
								<label className="block">
									<span className="text-sm text-gray-600">
										Téléphone
									</span>
									<input
										className="mt-1 block w-full border rounded px-3 py-2"
										value={form.phone || ''}
										onChange={(e) =>
											setForm({
												...form,
												phone: e.target.value,
											})
										}
									/>
								</label>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<label className="block">
									<span className="text-sm text-gray-600">
										Rôle
									</span>
									<select
										className="mt-1 block w-full border rounded px-3 py-2"
										value={form.type || ''}
										onChange={(e) =>
											setForm({
												...form,
												type: e.target.value as
													| 'agent'
													| 'apporteur'
													| 'admin',
											})
										}
									>
										{USER_ROLE_OPTIONS.map((opt) => (
											<option
												key={opt.value}
												value={opt.value}
											>
												{opt.label}
											</option>
										))}
									</select>
								</label>
								<label className="block">
									<span className="text-sm text-gray-600">
										Réseau
									</span>
									<input
										className="mt-1 block w-full border rounded px-3 py-2"
										value={
											form.professionalInfo?.network || ''
										}
										onChange={(e) =>
											setForm({
												...form,
												professionalInfo: {
													...(form.professionalInfo ||
														{}),
													network: e.target.value,
												},
											})
										}
									/>
								</label>
							</div>
						</div>

						<div className="mt-6 flex gap-3">
							<Button
								type="submit"
								disabled={busy}
								variant="primary"
								className="px-4 py-2"
							>
								Enregistrer
							</Button>
							<Button
								type="button"
								onClick={onClose}
								variant="outline"
								className="px-4 py-2"
							>
								Fermer
							</Button>
						</div>
					</div>

					{/* Right: actions & stats */}
					<div className="bg-white p-4 rounded-lg border flex flex-col gap-4">
						<div className="space-y-2">
							<div className="text-sm text-gray-600">
								Statistiques
							</div>
							<div className="grid grid-cols-3 gap-2">
								<div className="bg-blue-50 p-3 rounded text-center">
									<div className="text-sm text-blue-700">
										Annonces
									</div>
									<div className="font-bold text-lg">
										{user.propertiesCount ?? 0}
									</div>
								</div>
								<div className="bg-green-50 p-3 rounded text-center">
									<div className="text-sm text-green-700">
										Collab. actives
									</div>
									<div className="font-bold text-lg">
										{user.collaborationsActive ?? 0}
									</div>
								</div>
								<div className="bg-purple-50 p-3 rounded text-center">
									<div className="text-sm text-purple-700">
										Collab. clôturées
									</div>
									<div className="font-bold text-lg">
										{user.collaborationsClosed ?? 0}
									</div>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="text-sm text-gray-600">
								Actions rapides
							</div>
							<div className="flex flex-col gap-2">
								<Button
									type="button"
									onClick={handleValidateToggle}
									disabled={busy}
									variant="outline"
									className="w-full justify-center"
								>
									{user.isValidated
										? 'Retirer validation'
										: 'Valider utilisateur'}
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
									{user.accessGrantedByAdmin
										? 'Révoquer accès manuel'
										: 'Donner accès manuel'}
								</Button>
							</div>
						</div>
					</div>
				</form>

				{confirmAction && (
					<ConfirmDialog
						isOpen={!!confirmAction}
						title="Confirmation"
						description={confirmAction.label}
						onConfirm={confirmAction.onConfirm}
						onCancel={() => setConfirmAction(null)}
						confirmText="Confirmer"
						cancelText="Annuler"
						variant={getConfirmVariant()}
						loading={busy}
					/>
				)}
			</div>
		</div>
	);
};
