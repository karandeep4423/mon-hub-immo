/**
 * useSocketListener - Reusable hook for Socket.IO event listeners
 *
 * Provides a clean, consistent way to subscribe to socket events with:
 * - Automatic cleanup on unmount
 * - Connection state checking
 * - Stable handler references
 * - TypeScript type safety
 *
 * @example
 * ```typescript
 * useSocketListener('notification:new', (data) => {
 *   console.log('New notification', data);
 * });
 * ```
 */

import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { logger } from '@/lib/utils/logger';

type SocketEventHandler<T = unknown> = (data: T) => void;

interface UseSocketListenerOptions {
	/**
	 * If true, listener only activates when connected
	 * @default true
	 */
	requireConnection?: boolean;
	/**
	 * Enable debug logging
	 * @default false
	 */
	debug?: boolean;
}

/**
 * Subscribe to a single socket event
 */
export function useSocketListener<T = unknown>(
	event: string,
	handler: SocketEventHandler<T>,
	options: UseSocketListenerOptions = {},
) {
	const { socket, isConnected } = useSocket();
	const { requireConnection = true, debug = false } = options;

	useEffect(() => {
		if (!socket) {
			if (debug)
				logger.debug(
					`[useSocketListener] No socket for event: ${event}`,
				);
			return;
		}

		if (requireConnection && !isConnected) {
			if (debug)
				logger.debug(
					`[useSocketListener] Not connected, skipping: ${event}`,
				);
			return;
		}

		if (debug) logger.debug(`[useSocketListener] Subscribing to: ${event}`);

		socket.on(event, handler);

		return () => {
			if (debug)
				logger.debug(
					`[useSocketListener] Unsubscribing from: ${event}`,
				);
			socket.off(event, handler);
		};
	}, [socket, isConnected, event, handler, requireConnection, debug]);
}

/**
 * Subscribe to multiple socket events at once
 *
 * @example
 * ```typescript
 * useSocketListeners({
 *   'message:new': handleNewMessage,
 *   'message:deleted': handleDeletedMessage,
 *   'user:typing': handleTyping,
 * });
 * ```
 */
export function useSocketListeners<
	T extends Record<string, SocketEventHandler>,
>(eventHandlers: T, options: UseSocketListenerOptions = {}) {
	const { socket, isConnected } = useSocket();
	const { requireConnection = true, debug = false } = options;

	useEffect(() => {
		if (!socket) {
			if (debug) logger.debug('[useSocketListeners] No socket available');
			return;
		}

		if (requireConnection && !isConnected) {
			if (debug)
				logger.debug('[useSocketListeners] Not connected, skipping');
			return;
		}

		const events = Object.entries(eventHandlers);

		if (debug) {
			logger.debug(
				`[useSocketListeners] Subscribing to ${events.length} events:`,
				events.map(([event]) => event),
			);
		}

		// Subscribe to all events
		events.forEach(([event, handler]) => {
			socket.on(event, handler);
		});

		// Cleanup
		return () => {
			if (debug)
				logger.debug(
					'[useSocketListeners] Unsubscribing from all events',
				);
			events.forEach(([event, handler]) => {
				socket.off(event, handler);
			});
		};
	}, [socket, isConnected, eventHandlers, requireConnection, debug]);
}

/**
 * Subscribe to socket events only when a condition is met
 * Useful for conditional event listeners based on user state, etc.
 *
 * @example
 * ```typescript
 * useSocketListenerConditional(
 *   'admin:notification',
 *   handleAdminNotif,
 *   user?.role === 'admin'
 * );
 * ```
 */
export function useSocketListenerConditional<T = unknown>(
	event: string,
	handler: SocketEventHandler<T>,
	condition: boolean,
	options: UseSocketListenerOptions = {},
) {
	const { socket, isConnected } = useSocket();
	const { requireConnection = true, debug = false } = options;

	useEffect(() => {
		if (!condition) {
			if (debug)
				logger.debug(
					`[useSocketListenerConditional] Condition false for: ${event}`,
				);
			return;
		}

		if (!socket) return;
		if (requireConnection && !isConnected) return;

		if (debug)
			logger.debug(
				`[useSocketListenerConditional] Subscribing to: ${event}`,
			);

		socket.on(event, handler);

		return () => {
			if (debug)
				logger.debug(
					`[useSocketListenerConditional] Unsubscribing from: ${event}`,
				);
			socket.off(event, handler);
		};
	}, [
		socket,
		isConnected,
		event,
		handler,
		condition,
		requireConnection,
		debug,
	]);
}
