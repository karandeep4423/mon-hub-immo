import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '@/lib/api/adminApi';

// Common action types used across admin interfaces
export type AdminActionType =
	| 'validate'
	| 'invalidate'
	| 'block'
	| 'unblock'
	| 'grant_access'
	| 'revoke_access'
	| 'delete'
	| 'payment_reminder';

export interface AdminActionResult {
	success: boolean;
	error?: string;
}

interface ActionConfig {
	title: string;
	description: string;
	confirmText: string;
	variant: 'primary' | 'danger' | 'warning';
	successMessage: string;
	toastType: 'success' | 'warn' | 'info';
}

// Centralized action configurations
const getActionConfig = (
	action: AdminActionType,
	userName?: string,
): ActionConfig => {
	const name = userName || "l'utilisateur";

	const configs: Record<AdminActionType, ActionConfig> = {
		validate: {
			title: "Valider l'utilisateur",
			description: `Êtes-vous sûr de vouloir valider ${name} ? Cet utilisateur aura accès à toutes les fonctionnalités de la plateforme.`,
			confirmText: 'Valider',
			variant: 'primary',
			successMessage: 'Utilisateur validé',
			toastType: 'success',
		},
		invalidate: {
			title: "Invalider l'utilisateur",
			description: `Êtes-vous sûr de vouloir invalider ${name} ? Cet utilisateur perdra accès aux fonctionnalités de la plateforme.`,
			confirmText: 'Invalider',
			variant: 'danger',
			successMessage: 'Validation retirée',
			toastType: 'success',
		},
		block: {
			title: "Bloquer l'utilisateur",
			description: `Êtes-vous sûr de vouloir bloquer ${name} ? Cet utilisateur ne pourra plus accéder à la plateforme.`,
			confirmText: 'Bloquer',
			variant: 'danger',
			successMessage: 'Utilisateur bloqué',
			toastType: 'warn',
		},
		unblock: {
			title: "Débloquer l'utilisateur",
			description: `Êtes-vous sûr de vouloir débloquer ${name} ? Cet utilisateur retrouvera l'accès à la plateforme.`,
			confirmText: 'Débloquer',
			variant: 'primary',
			successMessage: 'Utilisateur débloqué',
			toastType: 'success',
		},
		grant_access: {
			title: "Accorder l'accès manuel",
			description: `Êtes-vous sûr de vouloir accorder l'accès manuel à ${name} ? Cela outrepassera le statut de paiement.`,
			confirmText: 'Accorder',
			variant: 'warning',
			successMessage: 'Accès manuel accordé',
			toastType: 'success',
		},
		revoke_access: {
			title: "Révoquer l'accès manuel",
			description: `Êtes-vous sûr de vouloir révoquer l'accès manuel de ${name} ?`,
			confirmText: 'Révoquer',
			variant: 'danger',
			successMessage: 'Accès manuel révoqué',
			toastType: 'info',
		},
		delete: {
			title: "Supprimer l'utilisateur",
			description: `Cette action est irréversible. Toutes les annonces, collaborations et messages de ${name} seront définitivement supprimés.`,
			confirmText: 'Supprimer définitivement',
			variant: 'danger',
			successMessage: 'Utilisateur supprimé',
			toastType: 'success',
		},
		payment_reminder: {
			title: 'Envoyer un rappel de paiement',
			description: `Envoyer un rappel de paiement à ${name} ?`,
			confirmText: 'Envoyer',
			variant: 'warning',
			successMessage: 'Rappel de paiement envoyé',
			toastType: 'success',
		},
	};

	return configs[action];
};

// Execute a single admin action
export async function executeAdminAction(
	action: AdminActionType,
	userId: string,
): Promise<AdminActionResult> {
	try {
		switch (action) {
			case 'validate':
				await adminService.validateUser(userId, true);
				break;
			case 'invalidate':
				await adminService.validateUser(userId, false);
				break;
			case 'block':
				await adminService.blockUser(userId);
				break;
			case 'unblock':
				await adminService.unblockUser(userId);
				break;
			case 'grant_access':
				await adminService.grantAdminAccess(userId);
				break;
			case 'revoke_access':
				await adminService.revokeAdminAccess(userId);
				break;
			case 'delete':
				await adminService.deleteUser(userId);
				break;
			case 'payment_reminder':
				await adminService.sendPaymentReminder(userId);
				break;
		}
		return { success: true };
	} catch (err) {
		const errorMsg =
			(err as { response?: { data?: { error?: string } } })?.response
				?.data?.error ||
			(err as { message?: string })?.message ||
			"Erreur lors de l'action";
		return { success: false, error: errorMsg };
	}
}

interface UseAdminActionsOptions {
	userName?: string;
	onSuccess?: (action: AdminActionType) => void;
	onError?: (action: AdminActionType, error: string) => void;
}

interface UseAdminActionsReturn {
	isLoading: boolean;
	executeAction: (
		action: AdminActionType,
		userId: string,
	) => Promise<boolean>;
	getActionConfig: (action: AdminActionType) => ActionConfig;
}

/**
 * Shared hook for admin user actions
 * Can be used in both user table and user profile contexts
 */
export function useAdminActions(
	options: UseAdminActionsOptions = {},
): UseAdminActionsReturn {
	const { userName, onSuccess, onError } = options;
	const [isLoading, setIsLoading] = useState(false);

	const executeAction = useCallback(
		async (action: AdminActionType, userId: string): Promise<boolean> => {
			setIsLoading(true);
			const config = getActionConfig(action, userName);

			try {
				const result = await executeAdminAction(action, userId);

				if (result.success) {
					// Show appropriate toast based on action type
					if (config.toastType === 'warn') {
						toast.warn(config.successMessage);
					} else if (config.toastType === 'info') {
						toast.info(config.successMessage);
					} else {
						toast.success(config.successMessage);
					}
					onSuccess?.(action);
					return true;
				} else {
					toast.error(result.error || "Erreur lors de l'action");
					onError?.(
						action,
						result.error || "Erreur lors de l'action",
					);
					return false;
				}
			} catch (err) {
				console.error(err);
				const errorMsg =
					(err as { message?: string })?.message ||
					"Erreur lors de l'action";
				toast.error(errorMsg);
				onError?.(action, errorMsg);
				return false;
			} finally {
				setIsLoading(false);
			}
		},
		[userName, onSuccess, onError],
	);

	const getConfig = useCallback(
		(action: AdminActionType) => getActionConfig(action, userName),
		[userName],
	);

	return {
		isLoading,
		executeAction,
		getActionConfig: getConfig,
	};
}

// Export config getter for use without the hook
export { getActionConfig };
