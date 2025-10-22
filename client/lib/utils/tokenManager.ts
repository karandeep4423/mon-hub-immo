/**
 * Centralized Token Management Utility
 * Replaces scattered localStorage.getItem/setItem('token') calls
 */

import { storage, STORAGE_KEYS } from './storageManager';

export const TokenManager = {
	/**
	 * Get authentication token from storage
	 */
	get(): string | null {
		return storage.get<string>(STORAGE_KEYS.TOKEN);
	},

	/**
	 * Set authentication token in storage
	 */
	set(token: string): void {
		storage.set(STORAGE_KEYS.TOKEN, token);
	},

	/**
	 * Remove authentication token from storage
	 */
	remove(): void {
		storage.remove(STORAGE_KEYS.TOKEN);
	},

	/**
	 * Check if token exists
	 */
	exists(): boolean {
		return this.get() !== null;
	},

	/**
	 * Clear all auth-related storage (for complete logout)
	 */
	clearAll(): void {
		this.remove();
		// Add any other auth-related keys here if needed
	},
};
