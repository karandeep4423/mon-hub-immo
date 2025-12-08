import { api } from '@/lib/api';

/**
 * Admin API Service
 * Centralized API operations for admin-related management.
 */
export const adminService = {
	// ==================== Stats ====================
	/**
	 * Fetches admin dashboard statistics.
	 */
	getStats: () => {
		return api.get('/admin/stats');
	},

	// ==================== Users ====================
	/**
	 * Blocks a user.
	 * @param userId - The ID of the user to block.
	 */
	blockUser: (userId: string) => {
		return api.post(`/admin/users/${userId}/block`);
	},

	/**
	 * Unblocks a user.
	 * @param userId - The ID of the user to unblock.
	 */
	unblockUser: (userId: string) => {
		return api.post(`/admin/users/${userId}/unblock`);
	},

	/**
	 * Validates or invalidates a user.
	 * @param userId - The ID of the user to validate.
	 * @param value - Whether to validate (true) or invalidate (false).
	 */
	validateUser: (userId: string, value: boolean) => {
		return api.put(`/admin/users/${userId}/validate`, { value });
	},

	/**
	 * Updates a user's information.
	 * @param userId - The ID of the user to update.
	 * @param payload - The user data to update.
	 */
	updateUser: (userId: string, payload: Record<string, unknown>) => {
		return api.put(`/admin/users/${userId}`, payload);
	},

	/**
	 * Deletes a user.
	 * @param userId - The ID of the user to delete.
	 */
	deleteUser: (userId: string) => {
		return api.delete(`/admin/users/${userId}`);
	},

	/**
	 * Creates a new user (admin only).
	 * @param payload - The user data to create.
	 */
	createUser: (payload: Record<string, unknown>) => {
		return api.post('/admin/users/create', payload);
	},

	/**
	 * Imports users from a CSV file.
	 * @param formData - FormData containing the CSV file and options.
	 */
	importUsers: (formData: FormData) => {
		return api.post('/admin/users/import', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
	},

	/**
	 * Grants manual platform access to a user, overriding payment status.
	 * @param userId - The ID of the user to grant access to.
	 */
	grantAdminAccess: (userId: string) => {
		return api.post(`/admin/users/${userId}/grant-access`);
	},

	/**
	 * Revokes manual platform access from a user.
	 * @param userId - The ID of the user to revoke access from.
	 */
	revokeAdminAccess: (userId: string) => {
		return api.post(`/admin/users/${userId}/revoke-access`);
	},

	/**
	 * Sends a payment reminder email to a user.
	 * @param userId - The ID of the user to send a reminder to.
	 */
	sendPaymentReminder: (userId: string) => {
		return api.post(`/admin/users/${userId}/send-payment-reminder`);
	},

	// ==================== Properties ====================
	/**
	 * Updates a property.
	 * @param propertyId - The ID of the property to update.
	 * @param payload - The property data to update.
	 */
	updateProperty: (propertyId: string, payload: Record<string, unknown>) => {
		return api.put(`/admin/properties/${propertyId}`, payload);
	},

	/**
	 * Deletes a property.
	 * @param propertyId - The ID of the property to delete.
	 */
	deleteProperty: (propertyId: string) => {
		return api.delete(`/admin/properties/${propertyId}`);
	},

	/**
	 * Updates a search ad (admin).
	 * @param searchAdId - The ID of the search ad to update.
	 * @param payload - The search ad data to update.
	 */
	updateSearchAd: (searchAdId: string, payload: Record<string, unknown>) => {
		return api.put(`/admin/search-ads/${searchAdId}`, payload);
	},

	/**
	 * Deletes a search ad (admin).
	 * @param searchAdId - The ID of the search ad to delete.
	 */
	deleteSearchAd: (searchAdId: string) => {
		return api.delete(`/admin/search-ads/${searchAdId}`);
	},

	// ==================== Collaborations ====================
	/**
	 * Fetches all collaborations (admin view).
	 */
	getAllCollaborations: () => {
		return api.get('/collaboration/all');
	},

	/**
	 * Updates a collaboration.
	 * @param collaborationId - The ID of the collaboration to update.
	 * @param payload - The collaboration data to update.
	 */
	updateCollaboration: (
		collaborationId: string,
		payload: Record<string, unknown>,
	) => {
		return api.put(`/collaboration/${collaborationId}/admin`, payload);
	},

	/**
	 * Deletes a collaboration.
	 * @param collaborationId - The ID of the collaboration to delete.
	 */
	deleteCollaboration: (collaborationId: string) => {
		return api.delete(`/collaboration/${collaborationId}/admin`);
	},

	/**
	 * Closes/cancels a collaboration.
	 * @param collaborationId - The ID of the collaboration.
	 * @param action - 'cancel' or 'complete'.
	 */
	closeCollaboration: (
		collaborationId: string,
		action: 'cancel' | 'complete',
	) => {
		return api.post(`/collaboration/${collaborationId}/admin/close`, {
			action,
		});
	},

	/**
	 * Force completes a collaboration.
	 * @param collaborationId - The ID of the collaboration to force complete.
	 */
	forceCompleteCollaboration: (collaborationId: string) => {
		return api.post(
			`/collaboration/${collaborationId}/admin/force-complete`,
		);
	},
};
