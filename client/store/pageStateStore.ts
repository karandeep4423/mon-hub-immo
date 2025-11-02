import { create } from 'zustand';
import { logger } from '@/lib/utils/logger';
import {
	PageStateStorage,
	type PageViewState,
} from '@/lib/utils/storageManager';

export type PageStateRecord = Record<string, PageViewState>;

interface PageStateStoreState {
	byPath: PageStateRecord;

	// Actions
	savePageState: (pathname: string, state: Partial<PageViewState>) => void;
	restorePageState: (pathname: string) => PageViewState | null;
	clearPageState: (pathname: string) => void;
	clearAll: () => void;
}

export const usePageStateStore = create<PageStateStoreState>((set, get) => ({
	byPath: {},

	savePageState: (pathname, state) => {
		try {
			const current = get().byPath[pathname] || { timestamp: 0 };
			// Deep merge for nested objects like filters
			const merged: PageViewState = {
				...current,
				...state,
				// Special handling for filters: merge instead of replace
				...(state.filters && current.filters
					? {
							filters: {
								...(current.filters as Record<string, unknown>),
								...(state.filters as Record<string, unknown>),
							},
						}
					: {}),
				timestamp: Date.now(),
			};
			PageStateStorage.save(pathname, merged);
			set((s) => ({ byPath: { ...s.byPath, [pathname]: merged } }));
		} catch (error) {
			logger.error('[PageStateStore] Failed to save page state', error);
		}
	},

	restorePageState: (pathname) => {
		try {
			const fromMem = get().byPath[pathname];
			if (fromMem) return fromMem;

			const fromStorage = PageStateStorage.get(pathname);
			if (fromStorage) {
				set((s) => ({
					byPath: { ...s.byPath, [pathname]: fromStorage },
				}));
				return fromStorage;
			}
			return null;
		} catch (error) {
			logger.error(
				'[PageStateStore] Failed to restore page state',
				error,
			);
			return null;
		}
	},

	clearPageState: (pathname) => {
		try {
			PageStateStorage.clear(pathname);
			set((s) => {
				const next = { ...s.byPath };
				delete next[pathname];
				return { byPath: next };
			});
		} catch (error) {
			logger.error('[PageStateStore] Failed to clear page state', error);
		}
	},

	clearAll: () => {
		try {
			PageStateStorage.clearAll();
			set({ byPath: {} });
		} catch (error) {
			logger.error(
				'[PageStateStore] Failed to clear all page states',
				error,
			);
		}
	},
}));
