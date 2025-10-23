import { useState } from 'react';
import { PropertyService, Property } from '@/lib/api/propertyApi';
import { toast } from 'react-toastify';
import { logger } from '@/lib/utils/logger';
import { TOAST_MESSAGES } from '@/lib/constants';

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
	const [deleteLoading, setDeleteLoading] = useState(false);
	const [showConfirmDialog, setShowConfirmDialog] = useState(false);
	const [propertyToDelete, setPropertyToDelete] = useState<string | null>(
		null,
	);

	const deleteProperty = async (propertyId: string) => {
		try {
			setDeleteLoading(true);
			await PropertyService.deleteProperty(propertyId);
			toast.success(TOAST_MESSAGES.PROPERTIES.DELETE_SUCCESS);
			onSuccess?.();
		} catch (error: unknown) {
			logger.error('Error deleting property:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: TOAST_MESSAGES.PROPERTIES.DELETE_ERROR;
			toast.error(errorMessage);
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
			await PropertyService.updatePropertyStatus(propertyId, newStatus);
			toast.success(TOAST_MESSAGES.PROPERTIES.STATUS_UPDATE_SUCCESS);
			onSuccess?.();
		} catch (error: unknown) {
			logger.error('Error updating status:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: TOAST_MESSAGES.PROPERTIES.STATUS_UPDATE_ERROR;
			toast.error(errorMessage);
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
