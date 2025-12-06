import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth';
import { logger } from '@/lib/utils/logger';
import { canAccessProtectedResources } from '@/lib/utils/authUtils';

const OS_NOTIFY_COOLDOWN_MS = 3000;

export interface NotificationEntity {
	type: 'chat' | 'collaboration' | 'appointment';
	id: string;
}

export interface NotificationItem {
	id: string;
	type:
		| 'chat:new_message'
		| 'collab:proposal_received'
		| 'collab:proposal_accepted'
		| 'collab:proposal_rejected'
		| 'contract:updated'
		| 'contract:signed'
		| 'collab:activated'
		| 'collab:progress_updated'
		| 'collab:cancelled'
		| 'collab:completed'
		| 'collab:note_added'
		| 'appointment:new'
		| 'appointment:confirmed'
		| 'appointment:rejected'
		| 'appointment:cancelled'
		| 'appointment:rescheduled';
	title: string;
	message: string;
	entity: NotificationEntity;
	data?: Record<string, unknown>;
	actorId: string;
	read: boolean;
	createdAt: string;
}

export interface NotificationsState {
	items: NotificationItem[];
	nextCursor: string | null;
	unreadCount: number;
	loading: boolean;
}

// Module-level cache keyed by user to avoid refetch storms and cross-user bleed
type BootData = {
	items: NotificationItem[];
	nextCursor: string | null;
	unreadCount: number;
};
const bootstrapCacheMap = new Map<string, BootData>();
const bootstrapInflightMap = new Map<string, Promise<void>>();

export const useNotifications = () => {
	const { socket } = useSocket();
	const { user, loading: authLoading } = useAuth();
	const { permission, requestPermission, showNotification } =
		useNotification();
	const [state, setState] = useState<NotificationsState>({
		items: [],
		nextCursor: null,
		unreadCount: 0,
		loading: false,
	});
	const loadingRef = useRef(false);
	const seenIdsRef = useRef<Set<string>>(new Set());
	const lastOsNotifyAtRef = useRef<number>(0);
	const bootstrappedRef = useRef(false);
	const lastUserIdRef = useRef<string | null>(null);
	// Stable user id key to avoid effect thrash on object identity changes
	const userIdKey: string | null = (() => {
		const u = user as User | undefined;
		// Prefer _id; fall back to id (stringifiable)
		return u?._id ?? u?.id?.toString?.() ?? null;
	})();

	// Initial fetch with stable dependency (userIdKey) to avoid cancellations
	useEffect(() => {
		if (authLoading || !userIdKey) return; // wait for authenticated user

		// Skip notifications fetch if user cannot access protected resources
		if (!canAccessProtectedResources(user)) {
			logger.debug(
				'[Notifications] Skipping fetch - user cannot access protected resources',
			);
			return;
		}

		// Re-bootstrap when user changes. Do not mark bootstrapped until state is applied.
		lastUserIdRef.current = userIdKey;
		const bootstrap = async () => {
			try {
				if (loadingRef.current) return;
				loadingRef.current = true;
				setState((s) => ({ ...s, loading: true }));

				// Serve from cache if available for this user
				const cached = userIdKey
					? bootstrapCacheMap.get(userIdKey)
					: null;
				if (cached) {
					const { items, nextCursor, unreadCount } = cached;
					// seed dedupe set
					for (const it of items) seenIdsRef.current.add(it.id);
					// Apply only if still same user
					if (lastUserIdRef.current !== userIdKey) return;
					setState((s) => ({
						...s,
						items,
						nextCursor,
						unreadCount,
						loading: false,
					}));
					bootstrappedRef.current = true;
					return;
				}

				// Share in-flight fetch across remounts
				if (userIdKey && !bootstrapInflightMap.get(userIdKey)) {
					const inflight = (async () => {
						const now = Date.now();
						const [listRes, countRes] = await Promise.all([
							api.get('/notifications', {
								params: { limit: 20, _ts: now },
							}),
							api.get('/notifications/count', {
								params: { _ts: now },
							}),
						]);
						const items: NotificationItem[] =
							listRes.data?.items ?? [];
						const data: BootData = {
							items,
							nextCursor: listRes.data?.nextCursor ?? null,
							unreadCount: countRes.data?.unreadCount ?? 0,
						};
						bootstrapCacheMap.set(userIdKey, data);
						// seed dedupe set
						for (const it of items) seenIdsRef.current.add(it.id);
					})();
					bootstrapInflightMap.set(userIdKey, inflight);
				}
				if (userIdKey) await bootstrapInflightMap.get(userIdKey);
				const ready = userIdKey
					? bootstrapCacheMap.get(userIdKey)
					: null;
				if (!ready) return;
				// Apply only if still same user
				if (lastUserIdRef.current !== userIdKey) return;
				setState((s) => ({
					...s,
					items: ready.items,
					nextCursor: ready.nextCursor,
					unreadCount: ready.unreadCount,
					loading: false,
				}));
				bootstrappedRef.current = true;
			} catch {
				setState((s) => ({ ...s, loading: false }));
			} finally {
				loadingRef.current = false;
			}
		};
		bootstrap();
		return () => {
			// no-op; we gate updates by user id rather than isMounted to avoid race on refresh
		};
	}, [authLoading, userIdKey]);

	// Request OS notification permission reactively
	useEffect(() => {
		if (permission === 'default') {
			requestPermission();
		}
	}, [permission, requestPermission]);

	// Socket wiring
	useEffect(() => {
		if (!socket) return;

		let hasConnectedOnce = false;

		const onNew = (payload: { notification: NotificationItem }) => {
			// dedupe by id to avoid duplicates on reconnects
			if (seenIdsRef.current.has(payload.notification.id)) {
				return;
			}
			seenIdsRef.current.add(payload.notification.id);
			setState((s) => ({
				...s,
				items: [payload.notification, ...s.items],
				unreadCount: s.unreadCount + 1,
			}));

			// Show OS notification only when the app is in background
			if (
				typeof document !== 'undefined' &&
				document.visibilityState === 'hidden'
			) {
				const now = Date.now();
				if (now - lastOsNotifyAtRef.current >= OS_NOTIFY_COOLDOWN_MS) {
					lastOsNotifyAtRef.current = now;
					showNotification(
						payload.notification.title,
						payload.notification.message,
					);
				}
			}
		};
		const onCount = (payload: { unreadCount: number }) => {
			setState((s) => ({ ...s, unreadCount: payload.unreadCount }));
		};
		const onRead = (payload: { id: string }) => {
			setState((s) => ({
				...s,
				items: s.items.map((n) =>
					n.id === payload.id ? { ...n, read: true } : n,
				),
			}));
		};
		const onReadAll = () => {
			setState((s) => ({
				...s,
				items: s.items.map((n) => ({ ...n, read: true })),
			}));
		};

		const onReconnect = async () => {
			// Only refetch on REconnection, not first connection
			if (!hasConnectedOnce) {
				hasConnectedOnce = true;
				logger.debug('🔌 Initial socket connection established');
				return;
			}

			logger.debug('🔄 Socket reconnected, refetching notifications');
			// Refetch notifications on reconnect to catch any missed during disconnect
			try {
				const now = Date.now();
				const [listRes, countRes] = await Promise.all([
					api.get('/notifications', {
						params: { limit: 20, _ts: now },
					}),
					api.get('/notifications/count', {
						params: { _ts: now },
					}),
				]);
				const items: NotificationItem[] = listRes.data?.items ?? [];
				const unreadCount = countRes.data?.unreadCount ?? 0;

				// Update dedupe set with new items
				seenIdsRef.current.clear();
				for (const it of items) seenIdsRef.current.add(it.id);

				setState((s) => ({
					...s,
					items,
					unreadCount,
				}));
			} catch (err) {
				logger.error('Failed to refetch notifications on reconnect', {
					error: err instanceof Error ? err.message : String(err),
				});
			}
		};
		// Use reusable socket listeners pattern
		const listeners = {
			'notification:new': onNew,
			'notifications:count': onCount,
			'notification:read': onRead,
			'notifications:readAll': onReadAll,
			connect: onReconnect,
		};

		Object.entries(listeners).forEach(([event, handler]) => {
			socket.on(event, handler);
		});

		return () => {
			Object.entries(listeners).forEach(([event, handler]) => {
				socket.off(event, handler);
			});
		};
	}, [socket, showNotification]);

	const loadMore = useCallback(async () => {
		if (loadingRef.current || !state.nextCursor) return;
		loadingRef.current = true;
		try {
			const res = await api.get('/notifications', {
				params: {
					cursor: state.nextCursor,
					limit: 20,
					_ts: Date.now(),
				},
			});
			const incoming: NotificationItem[] = res.data.items ?? [];
			const deduped = incoming.filter((n) => {
				if (seenIdsRef.current.has(n.id)) return false;
				seenIdsRef.current.add(n.id);
				return true;
			});
			setState((s) => ({
				...s,
				items: [...s.items, ...deduped],
				nextCursor: res.data.nextCursor ?? null,
			}));
		} finally {
			loadingRef.current = false;
		}
	}, [state.nextCursor]);

	const markRead = useCallback(async (id: string) => {
		await api.patch(`/notifications/${id}/read`);
		setState((s) => ({
			...s,
			items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
		}));
	}, []);

	const markAllRead = useCallback(async () => {
		await api.patch('/notifications/read-all');
		setState((s) => ({
			...s,
			items: s.items.map((n) => ({ ...n, read: true })),
			unreadCount: 0,
		}));
	}, []);

	const remove = useCallback(async (id: string) => {
		await api.delete(`/notifications/${id}`);
		setState((s) => ({ ...s, items: s.items.filter((n) => n.id !== id) }));
	}, []);

	const refresh = useCallback(async () => {
		if (loadingRef.current) return;
		loadingRef.current = true;
		try {
			const now = Date.now();
			const [listRes, countRes] = await Promise.all([
				api.get('/notifications', {
					params: { limit: 20, _ts: now },
				}),
				api.get('/notifications/count', {
					params: { _ts: now },
				}),
			]);
			const items: NotificationItem[] = listRes.data?.items ?? [];
			const unreadCount = countRes.data?.unreadCount ?? 0;

			// Update dedupe set with refreshed items
			seenIdsRef.current.clear();
			for (const it of items) seenIdsRef.current.add(it.id);

			setState((s) => ({
				...s,
				items,
				nextCursor: listRes.data?.nextCursor ?? null,
				unreadCount,
			}));

			// Update cache for this user
			if (userIdKey) {
				bootstrapCacheMap.set(userIdKey, {
					items,
					nextCursor: listRes.data?.nextCursor ?? null,
					unreadCount,
				});
			}
		} catch (err) {
			logger.error('Failed to refresh notifications', {
				error: err instanceof Error ? err.message : String(err),
			});
		} finally {
			loadingRef.current = false;
		}
	}, [userIdKey]);

	return { state, loadMore, markRead, markAllRead, remove, refresh };
};
