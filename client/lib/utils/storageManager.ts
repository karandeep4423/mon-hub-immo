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
 * sessionStorage wrapper with the exact same API as StorageManager
 */
class SessionStorageManager {
	private isAvailable(): boolean {
		return typeof window !== 'undefined';
	}

	get<T = string>(key: string): T | null {
		if (!this.isAvailable()) return null;

		try {
			const item = sessionStorage.getItem(key);
			if (item === null) return null;

			try {
				return JSON.parse(item) as T;
			} catch {
				return item as T;
			}
		} catch (error) {
			logger.error(`[SessionStorage] Error getting key: ${key}`, error);
			return null;
		}
	}

	set<T>(key: string, value: T): void {
		if (!this.isAvailable()) return;

		try {
			const stringValue =
				typeof value === 'string' ? value : JSON.stringify(value);
			sessionStorage.setItem(key, stringValue);
		} catch (error) {
			logger.error(`[SessionStorage] Error setting key: ${key}`, error);
		}
	}

	remove(key: string): void {
		if (!this.isAvailable()) return;

		try {
			sessionStorage.removeItem(key);
		} catch (error) {
			logger.error(`[SessionStorage] Error removing key: ${key}`, error);
		}
	}

	has(key: string): boolean {
		return this.get(key) !== null;
	}

	clear(): void {
		if (!this.isAvailable()) return;

		try {
			sessionStorage.clear();
		} catch (error) {
			logger.error('[SessionStorage] Error clearing storage', error);
		}
	}
}

export const session = new SessionStorageManager();

/**
 * Specific storage keys (prevents typos and magic strings)
 */
export const STORAGE_KEYS = {
	// Geolocation
	GEOLOCATION_PREFERENCE: 'geolocation_preference',

	// Location History
	PREVIOUS_LOCATIONS: 'previousLocations',

	// UI State
	DASHBOARD_PROF_INFO_OPEN: 'dashboard.profInfo.open',

	// Page State (sessionStorage)
	PAGE_STATE_PREFIX: 'pageState:',
} as const;

/**
 * Page state helpers stored in sessionStorage (per-path granularity)
 */
export type PageViewState = {
	scrollY?: number;
	scrollX?: number;
	activeTab?: string;
	filters?: Record<string, unknown>;
	currentPage?: number;
	timestamp: number;
	containerScroll?: Record<string, number>; // key: container id or selector -> scrollTop
};

const pageKey = (pathname: string) =>
	`${STORAGE_KEYS.PAGE_STATE_PREFIX}${pathname}`;

export const PageStateStorage = {
	/** Persist view state for a route into sessionStorage */
	save(pathname: string, state: Partial<PageViewState>): void {
		const key = pageKey(pathname);
		const existing = session.get<PageViewState>(key) || { timestamp: 0 };
		const merged: PageViewState = {
			...existing,
			...state,
			timestamp: Date.now(),
		};
		session.set(key, merged);
	},

	/** Retrieve view state for a route */
	get(pathname: string): PageViewState | null {
		return session.get<PageViewState>(pageKey(pathname));
	},

	/** Remove view state for a route */
	clear(pathname: string): void {
		session.remove(pageKey(pathname));
	},

	/** Remove all stored page states from sessionStorage */
	clearAll(): void {
		if (typeof window === 'undefined') return;
		try {
			for (let i = sessionStorage.length - 1; i >= 0; i--) {
				const key = sessionStorage.key(i);
				if (key && key.startsWith(STORAGE_KEYS.PAGE_STATE_PREFIX)) {
					sessionStorage.removeItem(key);
				}
			}
		} catch (error) {
			logger.error(
				'[PageStateStorage] Error clearing all page states',
				error,
			);
		}
	},
};
