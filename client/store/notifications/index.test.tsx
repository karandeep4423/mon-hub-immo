import { renderHook, act } from '@testing-library/react';
import { useNotifications } from './index';

// Mock API client
const apiGet = jest.fn(async (url: string) => {
	if (url.endsWith('/count')) return { data: { unreadCount: 0 } };
	return { data: { items: [], nextCursor: null } };
});
jest.mock('@/lib/api', () => ({
	api: {
		get: (url: string) => apiGet(url),
		patch: jest.fn(async () => ({})),
		delete: jest.fn(async () => ({})),
	},
}));

// Fake socket context
type Listener = (p: unknown) => void;
const socketListeners: Record<string, Listener[]> = {};
const fakeSocket = {
	on: jest.fn((event: string, cb: Listener) => {
		(socketListeners[event] ||= []).push(cb);
	}),
	off: jest.fn((event: string, cb: Listener) => {
		const arr = socketListeners[event] || [];
		const i = arr.indexOf(cb);
		if (i >= 0) arr.splice(i, 1);
	}),
};

jest.mock('@/context/SocketContext', () => ({
	useSocket: () => ({
		socket: fakeSocket,
		onlineUsers: [],
		isConnected: true,
	}),
}));

// Mock useNotification to observe showNotification calls
const showNotification = jest.fn();
const requestPermission = jest.fn();
const useNotificationValue = {
	permission: 'granted' as NotificationPermission,
	requestPermission,
	showNotification,
};
jest.mock('@/hooks/useNotification', () => ({
	useNotification: () => useNotificationValue,
}));

// Helper to emit socket events
const emit = (event: string, payload: unknown) => {
	(socketListeners[event] || []).forEach((cb) => cb(payload));
};

describe('useNotifications', () => {
	beforeEach(() => {
		showNotification.mockClear();
		requestPermission.mockClear();
		apiGet.mockClear();
		for (const k of Object.keys(socketListeners)) delete socketListeners[k];
		// visible by default; tests will change when needed
		Object.defineProperty(document, 'visibilityState', {
			value: 'visible',
			writable: true,
		});
	});

	test('dedupes incoming notifications by id', async () => {
		const { result } = renderHook(() => useNotifications());
		// allow effects to register socket listeners
		await act(async () => {
			await new Promise((r) => setTimeout(r, 0));
		});
		const base = {
			notification: {
				id: 'n1',
				type: 'chat:new_message' as const,
				title: 'T',
				message: 'M',
				entity: { type: 'chat' as const, id: 'c1' },
				data: {},
				actorId: 'u2',
				read: false,
				createdAt: new Date().toISOString(),
			},
		};
		await act(async () => {
			emit('notification:new', base);
			emit('notification:new', base); // duplicate
		});
		expect(result.current.state.items.length).toBe(1);
	});

	test('throttles OS notifications when hidden', async () => {
		Object.defineProperty(document, 'visibilityState', {
			value: 'hidden',
			writable: true,
		});
		renderHook(() => useNotifications());
		const mk = (id: string) => ({
			notification: {
				id,
				type: 'chat:new_message' as const,
				title: 'T',
				message: 'M',
				entity: { type: 'chat' as const, id: 'c1' },
				data: {},
				actorId: 'u2',
				read: false,
				createdAt: new Date().toISOString(),
			},
		});
		await act(async () => {
			emit('notification:new', mk('a'));
			emit('notification:new', mk('b'));
		});
		// First should show, second should be throttled
		expect(showNotification).toHaveBeenCalledTimes(1);
	});
});
