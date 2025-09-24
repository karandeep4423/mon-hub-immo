import { api } from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { useEffect, useRef, useState } from 'react';
import { useNotification } from '@/hooks/useNotification';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/auth';

const OS_NOTIFY_COOLDOWN_MS = 3000;

export type NotificationEntity = { type: 'chat' | 'collaboration'; id: string };
export type NotificationItem = {
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
		| 'collab:note_added';
	title: string;
	message: string;
	entity: NotificationEntity;
	data?: Record<string, unknown>;
	actorId: string;
	read: boolean;
	createdAt: string;
};

export type NotificationsState = {
	items: NotificationItem[];
	nextCursor: string | null;
	unreadCount: number;
	loading: boolean;
};

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

	// Initial fetch (guarded against StrictMode double-mount)
	useEffect(() => {
		const u = user as User | undefined;
		const userId: string | null = u?.id?.toString?.() ?? u?._id ?? null;
		if (authLoading || !userId) return; // wait for authenticated user

		// Re-bootstrap when user changes
		const sameUser = lastUserIdRef.current === userId;
		if (sameUser && bootstrappedRef.current) return;
		bootstrappedRef.current = true;
		lastUserIdRef.current = userId;
		let isMounted = true;
		const bootstrap = async () => {
			try {
				if (loadingRef.current) return;
				loadingRef.current = true;
				setState((s) => ({ ...s, loading: true }));

				// Serve from cache if available for this user
				const cached = userId ? bootstrapCacheMap.get(userId) : null;
				if (cached) {
					const { items, nextCursor, unreadCount } = cached;
					// seed dedupe set
					for (const it of items) seenIdsRef.current.add(it.id);
					if (!isMounted) return;
					setState((s) => ({
						...s,
						items,
						nextCursor,
						unreadCount,
						loading: false,
					}));
					return;
				}

				// Share in-flight fetch across remounts
				if (userId && !bootstrapInflightMap.get(userId)) {
					const inflight = (async () => {
						const [listRes, countRes] = await Promise.all([
							api.get('/notifications', {
								params: { limit: 20 },
							}),
							api.get('/notifications/count'),
						]);
						const items: NotificationItem[] =
							listRes.data.items ?? [];
						const data: BootData = {
							items,
							nextCursor: listRes.data.nextCursor ?? null,
							unreadCount: countRes.data.unreadCount ?? 0,
						};
						bootstrapCacheMap.set(userId, data);
						// seed dedupe set
						for (const it of items) seenIdsRef.current.add(it.id);
					})();
					bootstrapInflightMap.set(userId, inflight);
				}
				if (userId) await bootstrapInflightMap.get(userId);
				const ready = userId ? bootstrapCacheMap.get(userId) : null;
				if (!isMounted || !ready) return;
				setState((s) => ({
					...s,
					items: ready.items,
					nextCursor: ready.nextCursor,
					unreadCount: ready.unreadCount,
					loading: false,
				}));
			} catch {
				setState((s) => ({ ...s, loading: false }));
			} finally {
				loadingRef.current = false;
			}
		};
		bootstrap();
		return () => {
			isMounted = false;
		};
	}, [authLoading, user]);

	// Request OS notification permission reactively
	useEffect(() => {
		if (permission === 'default') {
			requestPermission();
		}
	}, [permission, requestPermission]);

	// Socket wiring
	useEffect(() => {
		if (!socket) return;
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

		socket.on('notification:new', onNew);
		socket.on('notifications:count', onCount);
		socket.on('notification:read', onRead);
		socket.on('notifications:readAll', onReadAll);
		return () => {
			socket.off('notification:new', onNew);
			socket.off('notifications:count', onCount);
			socket.off('notification:read', onRead);
			socket.off('notifications:readAll', onReadAll);
		};
	}, [socket, showNotification]);

	const loadMore = async () => {
		if (loadingRef.current || !state.nextCursor) return;
		loadingRef.current = true;
		try {
			const res = await api.get('/notifications', {
				params: { cursor: state.nextCursor, limit: 20 },
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
	};

	const markRead = async (id: string) => {
		await api.patch(`/notifications/${id}/read`);
		setState((s) => ({
			...s,
			items: s.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
		}));
	};

	const markAllRead = async () => {
		await api.patch('/notifications/read-all');
		setState((s) => ({
			...s,
			items: s.items.map((n) => ({ ...n, read: true })),
			unreadCount: 0,
		}));
	};

	const remove = async (id: string) => {
		await api.delete(`/notifications/${id}`);
		setState((s) => ({ ...s, items: s.items.filter((n) => n.id !== id) }));
	};

	return { state, loadMore, markRead, markAllRead, remove };
};
