import { useState, useCallback } from 'react';
import {
	useAdminActions,
	getActionConfig,
	AdminActionType,
} from '@/hooks/useAdminActions';
import { UserProfile, ConfirmAction } from '../types';

interface ActionDetails {
	title: string;
	description: string;
	confirmText: string;
	variant: 'primary' | 'danger' | 'warning';
}

interface UseUserProfileActionsReturn {
	pendingAction: ConfirmAction;
	setPendingAction: (action: ConfirmAction) => void;
	isLoading: boolean;
	getActionDetails: (action: ConfirmAction) => ActionDetails;
	handleConfirmAction: () => Promise<void>;
}

// Map ConfirmAction to AdminActionType
const mapActionType = (action: ConfirmAction): AdminActionType | null => {
	if (!action) return null;
	const mapping: Record<NonNullable<ConfirmAction>, AdminActionType> = {
		validate: 'validate',
		invalidate: 'invalidate',
		block: 'block',
		unblock: 'unblock',
		grant_access: 'grant_access',
		revoke_access: 'revoke_access',
		delete: 'delete',
	};
	return mapping[action];
};

export function useUserProfileActions(
	user: UserProfile,
	form: UserProfile,
	setForm: React.Dispatch<React.SetStateAction<UserProfile>>,
	onUpdate: (updatedUser: UserProfile) => void,
	onDelete: () => void,
	fullName: string,
): UseUserProfileActionsReturn {
	const [pendingAction, setPendingAction] = useState<ConfirmAction>(null);

	// Use shared admin actions hook
	const { isLoading, executeAction } = useAdminActions({
		userName: fullName,
	});

	const getActionDetails = useCallback(
		(action: ConfirmAction): ActionDetails => {
			if (!action) {
				return {
					title: '',
					description: '',
					confirmText: '',
					variant: 'primary',
				};
			}
			const adminAction = mapActionType(action);
			if (!adminAction) {
				return {
					title: '',
					description: '',
					confirmText: '',
					variant: 'primary',
				};
			}
			const config = getActionConfig(adminAction, fullName);
			return {
				title: config.title,
				description: config.description,
				confirmText: config.confirmText,
				variant: config.variant,
			};
		},
		[fullName],
	);

	const handleConfirmAction = useCallback(async () => {
		if (!pendingAction) return;

		const adminAction = mapActionType(pendingAction);
		if (!adminAction) return;

		const success = await executeAction(adminAction, user._id);

		if (success) {
			// Update local state based on action
			switch (pendingAction) {
				case 'validate':
					setForm((prev) => ({ ...prev, isValidated: true }));
					onUpdate({ ...user, ...form, isValidated: true });
					break;
				case 'invalidate':
					setForm((prev) => ({ ...prev, isValidated: false }));
					onUpdate({ ...user, ...form, isValidated: false });
					break;
				case 'block':
					setForm((prev) => ({ ...prev, isBlocked: true }));
					onUpdate({ ...user, ...form, isBlocked: true });
					break;
				case 'unblock':
					setForm((prev) => ({ ...prev, isBlocked: false }));
					onUpdate({ ...user, ...form, isBlocked: false });
					break;
				case 'grant_access':
					setForm((prev) => ({
						...prev,
						accessGrantedByAdmin: true,
					}));
					onUpdate({ ...user, ...form, accessGrantedByAdmin: true });
					break;
				case 'revoke_access':
					setForm((prev) => ({
						...prev,
						accessGrantedByAdmin: false,
					}));
					onUpdate({ ...user, ...form, accessGrantedByAdmin: false });
					break;
				case 'delete':
					onDelete();
					break;
			}
		}

		setPendingAction(null);
	}, [pendingAction, user, form, setForm, onUpdate, onDelete, executeAction]);

	return {
		pendingAction,
		setPendingAction,
		isLoading,
		getActionDetails,
		handleConfirmAction,
	};
}
