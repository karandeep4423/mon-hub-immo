'use client';

import React from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import {
	Eye,
	Edit,
	Unlock,
	UserX,
	Key,
	CreditCard,
	X,
	Trash2,
} from 'lucide-react';
import { adminService } from '@/lib/api/adminApi';
import { CONFIRM_MESSAGES } from '@/lib/constants/admin';
import type { AdminUser, ConfirmActionState } from '@/types/admin';

interface UserActionsProps {
	user: AdminUser;
	onEdit: (user: AdminUser) => void;
	onConfirmAction: (action: ConfirmActionState) => void;
	refetch: () => Promise<void>;
	setActionBusy: (busy: boolean) => void;
}

export const UserActions: React.FC<UserActionsProps> = ({
	user,
	onEdit,
	onConfirmAction,
	refetch,
	setActionBusy,
}) => {
	const handleBlockUnblock = () => {
		if (user.isBlocked) {
			onConfirmAction({
				label: CONFIRM_MESSAGES.UNBLOCK_USER,
				type: 'unblock',
				onConfirm: async () => {
					setActionBusy(true);
					try {
						await adminService.unblockUser(user._id);
						await refetch();
						toast.success('Utilisateur débloqué.');
					} catch (err) {
						console.error(err);
						toast.error('Erreur.');
					} finally {
						setActionBusy(false);
					}
				},
			});
		} else {
			onConfirmAction({
				label: CONFIRM_MESSAGES.BLOCK_USER,
				type: 'block',
				onConfirm: async () => {
					setActionBusy(true);
					try {
						await adminService.blockUser(user._id);
						await refetch();
						toast.warn('Utilisateur bloqué.');
					} catch (err) {
						console.error(err);
						toast.error('Erreur.');
					} finally {
						setActionBusy(false);
					}
				},
			});
		}
	};

	const handleAccessToggle = () => {
		if (user.accessGrantedByAdmin) {
			onConfirmAction({
				label: CONFIRM_MESSAGES.REVOKE_ACCESS,
				type: 'revoke_manual',
				onConfirm: async () => {
					setActionBusy(true);
					try {
						await adminService.revokeAdminAccess(user._id);
						await refetch();
						toast.info('Accès manuel révoqué.');
					} catch (err) {
						console.error(err);
						toast.error('Erreur.');
					} finally {
						setActionBusy(false);
					}
				},
			});
		} else {
			onConfirmAction({
				label: CONFIRM_MESSAGES.GRANT_ACCESS,
				type: 'grant_manual',
				onConfirm: async () => {
					setActionBusy(true);
					try {
						await adminService.grantAdminAccess(user._id);
						await refetch();
						toast.success('Accès manuel accordé.');
					} catch (err) {
						console.error(err);
						const msg =
							(
								err as {
									response?: { data?: { error?: string } };
								}
							)?.response?.data?.error ||
							(err as { message?: string })?.message ||
							'Erreur.';
						toast.error(msg);
					} finally {
						setActionBusy(false);
					}
				},
			});
		}
	};

	const handlePaymentReminder = () => {
		onConfirmAction({
			label: CONFIRM_MESSAGES.PAYMENT_REMINDER,
			type: 'payment_reminder',
			onConfirm: async () => {
				setActionBusy(true);
				try {
					await adminService.sendPaymentReminder(user._id);
					toast.success('Rappel de paiement envoyé.');
				} catch (err) {
					console.error(err);
					toast.error("Erreur lors de l'envoi du rappel.");
				} finally {
					setActionBusy(false);
				}
			},
		});
	};

	const handleDelete = () => {
		onConfirmAction({
			label: CONFIRM_MESSAGES.DELETE_USER,
			type: 'delete',
			onConfirm: async () => {
				setActionBusy(true);
				try {
					await adminService.deleteUser(user._id);
					await refetch();
					toast.success('Utilisateur supprimé.');
				} catch (err) {
					console.error(err);
					toast.error('Erreur lors de la suppression.');
				} finally {
					setActionBusy(false);
				}
			},
		});
	};

	return (
		<div className="flex items-center justify-end gap-1.5">
			{/* View */}
			<Link
				href={`/admin/users/${user._id}`}
				className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200 group"
				title="Voir"
			>
				<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
			</Link>

			{/* Edit */}
			<button
				onClick={() => onEdit(user)}
				className="p-2 hover:bg-purple-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-purple-200 group"
				title="Éditer"
			>
				<Edit className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
			</button>

			{/* Block/Unblock - Desktop only */}
			<div className="hidden lg:flex">
				{user.isBlocked ? (
					<button
						title="Débloquer"
						onClick={handleBlockUnblock}
						className="p-2 hover:bg-green-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-green-200 group"
					>
						<Unlock className="w-4 h-4 text-gray-600 group-hover:text-green-600 transition-colors" />
					</button>
				) : (
					<button
						title="Bloquer"
						onClick={handleBlockUnblock}
						className="p-2 hover:bg-amber-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-amber-200 group"
					>
						<UserX className="w-4 h-4 text-gray-600 group-hover:text-amber-600 transition-colors" />
					</button>
				)}
			</div>

			{/* Manual Access - Agent only, Desktop only */}
			{user.type === 'agent' && !user.isPaid && (
				<div className="hidden lg:flex">
					{user.accessGrantedByAdmin ? (
						<button
							title="Révoquer l'accès manuel"
							onClick={handleAccessToggle}
							className="p-2 hover:bg-red-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200 group"
						>
							<X className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
						</button>
					) : (
						<button
							title="Donner l'accès manuel"
							onClick={handleAccessToggle}
							className="p-2 hover:bg-purple-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-purple-200 group"
						>
							<Key className="w-4 h-4 text-gray-600 group-hover:text-purple-600 transition-colors" />
						</button>
					)}
				</div>
			)}

			{/* Payment Reminder - Agent with incomplete payment, Desktop only */}
			{user.type === 'agent' && !user.isPaid && user.profileCompleted && (
				<button
					title="Envoyer rappel paiement"
					onClick={handlePaymentReminder}
					className="p-2 hover:bg-orange-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-orange-200 group hidden lg:flex"
				>
					<CreditCard className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
				</button>
			)}

			{/* Delete - Desktop only */}
			<button
				title="Supprimer l'utilisateur"
				onClick={handleDelete}
				className="p-2 hover:bg-red-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200 group hidden lg:flex"
			>
				<Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
			</button>
		</div>
	);
};
