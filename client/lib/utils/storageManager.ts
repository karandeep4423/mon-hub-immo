/**
 * Centralized Storage Management Utility
 * Replaces scattered localStorage calls with type-safe abstractions
 */

import { logger } from './logger';

/**
 * Generic localStorage wrapper with error handling and SSR safety
 */
class StorageManager {
	private isAvailable(): boolean {
		return typeof window !== 'undefined';
	}

	/**
	 * Get item from localStorage with type safety
	 */
	get<T = string>(key: string): T | null {
		if (!this.isAvailable()) return null;

		try {
			const item = localStorage.getItem(key);
			if (item === null) return null;

			// Try to parse as JSON, fallback to string
			try {
				return JSON.parse(item) as T;
			} catch {
				return item as T;
			}
		} catch (error) {
			logger.error(`[StorageManager] Error getting key: ${key}`, error);
			return null;
		}
	}

	/**
	 * Set item in localStorage with automatic JSON stringification
	 */
	set<T>(key: string, value: T): void {
		if (!this.isAvailable()) return;

		try {
			const stringValue =
				typeof value === 'string' ? value : JSON.stringify(value);
			localStorage.setItem(key, stringValue);
		} catch (error) {
			logger.error(`[StorageManager] Error setting key: ${key}`, error);
		}
	}

	/**
	 * Remove item from localStorage
	 */
	remove(key: string): void {
		if (!this.isAvailable()) return;

		try {
			localStorage.removeItem(key);
		} catch (error) {
			logger.error(`[StorageManager] Error removing key: ${key}`, error);
		}
	}

	/**
	 * Check if key exists
	 */
	has(key: string): boolean {
		return this.get(key) !== null;
	}

	/**
	 * Clear all localStorage (use with caution)
	 */
	clear(): void {
		if (!this.isAvailable()) return;

		try {
			localStorage.clear();
		} catch (error) {
			logger.error('[StorageManager] Error clearing storage', error);
		}
	}
}

export const storage = new StorageManager();

/**
 * Specific storage keys (prevents typos and magic strings)
 */
export const STORAGE_KEYS = {
	// Auth
	TOKEN: 'token',

	// Geolocation
	GEOLOCATION_PREFERENCE: 'geolocation_preference',

	// Location History
	PREVIOUS_LOCATIONS: 'previousLocations',

	// UI State
	DASHBOARD_PROF_INFO_OPEN: 'dashboard.profInfo.open',
} as const;
