'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { usePageStateStore } from '@/store/pageStateStore';
import type { PageViewState } from '@/lib/utils/storageManager';
import { logger } from '@/lib/utils/logger';

interface UsePageStateOptions {
	// If the component has these UI features
	hasFilters?: boolean;
	hasPagination?: boolean;
	hasTabs?: boolean;
	// Optional discriminator to separate multiple views on the same pathname
	key?: string;
	// Optional readiness flags to delay scroll restoration until data is ready
	// Example: pass SWR's isValidating === false
	ready?: boolean | (() => boolean);
	// Provide a snapshot getter so the hook can auto-persist on unmount/navigation
	getCurrentState?: () => Partial<PageViewState>;
}

export const usePageState = (options: UsePageStateOptions = {}) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const restorePageState = usePageStateStore((s) => s.restorePageState);
	const savePageState = usePageStateStore((s) => s.savePageState);
	const clearPageState = usePageStateStore((s) => s.clearPageState);

	const computedKey = useMemo(() => {
		const base = pathname || '/';
		const extra = options.key ? `#${options.key}` : '';
		return `${base}${extra}`;
		// Note: URL params should not alter storage key, they override saved filters
		// at integration time if present, per requirements
	}, [pathname, options.key]);

	// Restore once per mount
	const restoredRef = useRef(false);
	const savedState = useMemo(() => {
		if (restoredRef.current)
			return usePageStateStore.getState().byPath[computedKey] || null;
		const state = restorePageState(computedKey);
		restoredRef.current = true;
		return state;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [computedKey]);

	// Auto-save on unload/navigation if a snapshot provider is given
	useEffect(() => {
		if (!options.getCurrentState) return;
		const save = () => {
			try {
				const snapshot = options.getCurrentState?.() || {};
				// Don't capture scroll here - let useScrollRestoration handle it
				// to avoid race conditions where navigation scrolls to top before unmount
				savePageState(computedKey, snapshot);
			} catch (error) {
				logger.error(
					'[usePageState] Failed to auto-save on unload',
					error,
				);
			}
		};

		window.addEventListener('beforeunload', save);
		window.addEventListener('pagehide', save);
		return () => {
			window.removeEventListener('beforeunload', save);
			window.removeEventListener('pagehide', save);
			// Save also on unmount for SPA navigations
			save();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [computedKey, options.getCurrentState]);

	const save = useCallback(
		(partial: Partial<PageViewState>) => {
			savePageState(computedKey, partial);
		},
		[computedKey, savePageState],
	);

	const clear = useCallback(() => {
		clearPageState(computedKey);
	}, [clearPageState, computedKey]);

	// URL params override saved state (priority)
	const urlOverrides = useMemo(() => {
		if (!searchParams) return {} as Partial<PageViewState>;
		const page = searchParams.get('page');
		const tab = searchParams.get('tab');
		return {
			currentPage: page ? Number(page) : undefined,
			activeTab: tab || undefined,
		} as Partial<PageViewState>;
	}, [searchParams]);

	return {
		key: computedKey,
		savedState,
		save,
		clear,
		urlOverrides,
	};
};
