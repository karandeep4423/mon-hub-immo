'use client';

import React from 'react';
import Link from 'next/link';
import {
	Eye,
	Unlock,
	UserX,
	Key,
	CreditCard,
	X,
	Trash2,
	ShieldCheck,
	ShieldX,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { executeAdminAction, AdminActionType } from '@/hooks/useAdminActions';
import {
	CONFIRM_MESSAGES,
	ACTION_SUCCESS_MESSAGES,
} from '@/lib/constants/admin';
import type { AdminUser, ConfirmActionState } from '@/types/admin';

interface UserActionsProps {
	user: AdminUser;
	onConfirmAction: (action: ConfirmActionState | null) => void;
	refetch: () => Promise<void>;
	setActionBusy: (busy: boolean) => void;
}

// Helper to create action handler
const createActionHandler = (
	actionType: AdminActionType,
	confirmType: ConfirmActionState['type'],
	confirmMessage: string,
	userId: string,
	refetch: () => Promise<void>,
	setActionBusy: (busy: boolean) => void,
	onConfirmAction: (action: ConfirmActionState | null) => void,
) => {
	onConfirmAction({
		label: confirmMessage,
		type: confirmType,
		onConfirm: async () => {
			setActionBusy(true);
			try {
				const result = await executeAdminAction(actionType, userId);
				if (result.success) {
					toast.success(ACTION_SUCCESS_MESSAGES[actionType]);
				} else {
					toast.error(result.error || "Erreur lors de l'action");
				}
				await refetch();
			} catch {
				toast.error("Erreur lors de l'action");
			} finally {
				setActionBusy(false);
				onConfirmAction(null);
			}
		},
	});
};

export const UserActions: React.FC<UserActionsProps> = ({
	user,
	onConfirmAction,
	refetch,
	setActionBusy,
}) => {
	const handleBlockUnblock = () => {
		createActionHandler(
			user.isBlocked ? 'unblock' : 'block',
			user.isBlocked ? 'unblock' : 'block',
			user.isBlocked
				? CONFIRM_MESSAGES.UNBLOCK_USER
				: CONFIRM_MESSAGES.BLOCK_USER,
			user._id,
			refetch,
			setActionBusy,
			onConfirmAction,
		);
	};

	const handleAccessToggle = () => {
		createActionHandler(
			user.accessGrantedByAdmin ? 'revoke_access' : 'grant_access',
			user.accessGrantedByAdmin ? 'revoke_manual' : 'grant_manual',
			user.accessGrantedByAdmin
				? CONFIRM_MESSAGES.REVOKE_ACCESS
				: CONFIRM_MESSAGES.GRANT_ACCESS,
			user._id,
			refetch,
			setActionBusy,
			onConfirmAction,
		);
	};

	const handlePaymentReminder = () => {
		createActionHandler(
			'payment_reminder',
			'payment_reminder',
			CONFIRM_MESSAGES.PAYMENT_REMINDER,
			user._id,
			refetch,
			setActionBusy,
			onConfirmAction,
		);
	};

	const handleDelete = () => {
		createActionHandler(
			'delete',
			'delete',
			CONFIRM_MESSAGES.DELETE_USER,
			user._id,
			refetch,
			setActionBusy,
			onConfirmAction,
		);
	};

	const handleValidateToggle = () => {
		createActionHandler(
			user.isValidated ? 'invalidate' : 'validate',
			user.isValidated ? 'invalidate' : 'validate',
			user.isValidated
				? CONFIRM_MESSAGES.INVALIDATE_USER
				: CONFIRM_MESSAGES.VALIDATE_USER,
			user._id,
			refetch,
			setActionBusy,
			onConfirmAction,
		);
	};

	return (
		<div className="flex items-center justify-end gap-1.5">
			{/* View / Edit - Navigate to profile page */}
			<Link
				href={`/admin/users/${user._id}`}
				target="_blank"
				rel="noopener noreferrer"
				className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200 group"
				title="Voir / Modifier"
			>
				<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
			</Link>

			{/* Validate/Invalidate User */}
			{user.isValidated ? (
				<button
					title="Retirer la validation"
					onClick={handleValidateToggle}
					className="p-2 hover:bg-orange-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-orange-200 group"
				>
					<ShieldX className="w-4 h-4 text-gray-600 group-hover:text-orange-600 transition-colors" />
				</button>
			) : (
				<button
					title="Valider l'utilisateur"
					onClick={handleValidateToggle}
					className="p-2 hover:bg-emerald-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-emerald-200 group"
				>
					<ShieldCheck className="w-4 h-4 text-gray-600 group-hover:text-emerald-600 transition-colors" />
				</button>
			)}

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
