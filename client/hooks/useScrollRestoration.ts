'use client';

import { useEffect, useRef } from 'react';
import { usePageStateStore } from '@/store/pageStateStore';
import type { PageViewState } from '@/lib/utils/storageManager';
import { logger } from '@/lib/utils/logger';

interface UseScrollRestorationOptions {
	key: string; // page state key (pathname + optional suffix)
	// When true (or when the function returns true), we attempt to restore scroll
	ready?: boolean | (() => boolean);
	// Optional debug logging
	debug?: boolean;
}

/**
 * Restores window scroll position once data is ready and keeps saving on scroll.
 * Simplified to only handle window scroll (not containers).
 */
export const useScrollRestoration = (options: UseScrollRestorationOptions) => {
	const { key, ready, debug } = options;
	const restorePageState = usePageStateStore((s) => s.restorePageState);
	const savePageState = usePageStateStore((s) => s.savePageState);
	const restoredRef = useRef(false);
	const rafRef = useRef<number | null>(null);
	const lastSavedRef = useRef<PageViewState | null>(null);

	// Set manual scroll restoration once globally (never reset)
	useEffect(() => {
		if (typeof window === 'undefined') return;
		if (!('scrollRestoration' in window.history)) return;
		if (window.history.scrollRestoration !== 'manual') {
			window.history.scrollRestoration = 'manual';
			if (debug) {
				logger.debug(
					'[useScrollRestoration] forcing manual scroll restoration globally',
					{ key },
				);
			}
		}
	}, [key, debug]);

	// Save on scroll (throttled with rAF)
	useEffect(() => {
		if (debug) {
			logger.debug('[useScrollRestoration] attach scroll listener', {
				key,
			});
		}

		const onScroll = () => {
			if (rafRef.current) return; // throttle to one per frame
			rafRef.current = requestAnimationFrame(() => {
				try {
					const state: PageViewState = {
						scrollX: window.scrollX,
						scrollY: window.scrollY,
						timestamp: Date.now(),
					};
					lastSavedRef.current = state;
					savePageState(key, state);

					if (debug) {
						logger.debug(
							'[useScrollRestoration] saved window scroll',
							{
								key,
								x: window.scrollX,
								y: window.scrollY,
							},
						);
					}
				} catch (error) {
					logger.error(
						'[useScrollRestoration] Failed to save scroll',
						error,
					);
				} finally {
					rafRef.current = null;
				}
			});
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [key, savePageState, debug]);

	// Save once on unmount/navigation (only if we have a saved position from scrolling)
	useEffect(() => {
		return () => {
			try {
				// Only save if we have a previously saved position from actual scrolling
				// Don't capture scroll at unmount time as navigation may have already occurred
				if (!lastSavedRef.current) return;

				const finalState: PageViewState = {
					...lastSavedRef.current,
					timestamp: Date.now(),
				};

				savePageState(key, finalState);

				if (debug) {
					logger.debug(
						'[useScrollRestoration] unmount save window scroll',
						{
							key,
							x: finalState.scrollX ?? 0,
							y: finalState.scrollY ?? 0,
						},
					);
				}
			} catch (error) {
				logger.error(
					'[useScrollRestoration] Failed unmount save',
					error,
				);
			}
		};
	}, [key, savePageState, debug]);

	// Restore when ready and not yet restored
	useEffect(() => {
		const isReady = typeof ready === 'function' ? !!ready() : !!ready;
		if (restoredRef.current || !isReady) return;

		const state = restorePageState(key) as PageViewState | null;
		if (!state) {
			if (debug) {
				logger.debug(
					'[useScrollRestoration] no saved state to restore',
					{ key },
				);
			}
			restoredRef.current = true;
			return;
		}

		if (debug) {
			logger.debug('[useScrollRestoration] attempting restore', {
				key,
				state,
			});
		}

		// Restore scroll position
		const restoreScroll = () => {
			try {
				if (
					typeof state.scrollY === 'number' ||
					typeof state.scrollX === 'number'
				) {
					window.scrollTo({
						top: state.scrollY ?? 0,
						left: state.scrollX ?? 0,
						behavior: 'auto',
					});

					if (debug) {
						logger.debug(
							'[useScrollRestoration] restored window scroll',
							{
								key,
								y: state.scrollY ?? 0,
								x: state.scrollX ?? 0,
								after: {
									y: window.scrollY,
									x: window.scrollX,
								},
							},
						);
					}
				}
			} catch (error) {
				logger.error(
					'[useScrollRestoration] Failed to restore scroll',
					error,
				);
			} finally {
				restoredRef.current = true;
			}
		};

		// Defer restoration to allow content to render
		const rafId = requestAnimationFrame(() => {
			// Try multiple times to ensure content has fully rendered
			let attempts = 0;
			const maxAttempts = 5;
			const loop = () => {
				attempts++;
				restoreScroll();
				if (attempts < maxAttempts && typeof window !== 'undefined') {
					requestAnimationFrame(loop);
				}
			};
			loop();
		});

		return () => cancelAnimationFrame(rafId);
	}, [key, ready, restorePageState, debug]);
};
