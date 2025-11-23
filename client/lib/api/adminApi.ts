import { api } from '@/lib/api';

/**
 * Admin API Service
 * Centralized API operations for admin-related user management.
 */
export const adminService = {
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
  }
};
