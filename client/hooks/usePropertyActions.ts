import { useState } from 'react';
import { Property } from '@/lib/api/propertyApi';
import { logger } from '@/lib/utils/logger';
import { usePropertyMutations } from './useProperties';
import { useAuth } from './useAuth';

interface UsePropertyActionsOptions {
	onSuccess?: () => void;
}

interface UsePropertyActionsReturn {
	deleteProperty: (propertyId: string) => Promise<void>;
	updateStatus: (
		propertyId: string,
		newStatus: Property['status'],
	) => Promise<void>;
	deleteLoading: boolean;
	showConfirmDialog: boolean;
	propertyToDelete: string | null;
	openDeleteDialog: (propertyId: string) => void;
	closeDeleteDialog: () => void;
	confirmDelete: () => Promise<void>;
}

export const usePropertyActions = ({
	onSuccess,
}: UsePropertyActionsOptions = {}): UsePropertyActionsReturn => {
	const { user } = useAuth();
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
		null,
	);

	// Get SWR mutation functions
	const {
		deleteProperty: deletePropertyMutation,
		updatePropertyStatus: updateStatusMutation,
	} = usePropertyMutations(user?._id);

	const deleteProperty = async (propertyId: string) => {
		try {
			setDeleteLoading(true);
			const result = await deletePropertyMutation(propertyId);
			if (result.success) {
				onSuccess?.();
			}
		} catch (error: unknown) {
			logger.error('Error deleting property:', error);
			throw error;
		} finally {
			setDeleteLoading(false);
		}
	};

	const updateStatus = async (
		propertyId: string,
		newStatus: Property['status'],
	) => {
		try {
			const result = await updateStatusMutation(propertyId, newStatus);
			if (result.success) {
				onSuccess?.();
			}
		} catch (error: unknown) {
			logger.error('Error updating status:', error);
			throw error;
		}
	};

	const openDeleteDialog = (propertyId: string) => {
		setPropertyToDelete(propertyId);
		setShowConfirmDialog(true);
	};

	const closeDeleteDialog = () => {
		setShowConfirmDialog(false);
		setPropertyToDelete(null);
	};

	const confirmDelete = async () => {
		if (!propertyToDelete) return;

		try {
			await deleteProperty(propertyToDelete);
			closeDeleteDialog();
		} catch {
			// Error already handled in deleteProperty
		}
	};

	return {
		deleteProperty,
		updateStatus,
		deleteLoading,
		showConfirmDialog,
		propertyToDelete,
		openDeleteDialog,
		closeDeleteDialog,
		confirmDelete,
	};
};
