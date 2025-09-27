import { SocketServiceAPI } from './socketService';

export const NOTIFICATION_SOCKET_EVENTS = {
	NEW: 'notification:new',
	COUNT: 'notifications:count',
	READ: 'notification:read',
	READ_ALL: 'notifications:readAll',
} as const;

export type NotificationSocketEvents =
	(typeof NOTIFICATION_SOCKET_EVENTS)[keyof typeof NOTIFICATION_SOCKET_EVENTS];

export const createNotificationSocket = (socketService: SocketServiceAPI) => {
	return {
		emitNew(userId: string, payload: unknown) {
			socketService.emitToUser(
				userId,
				NOTIFICATION_SOCKET_EVENTS.NEW,
				payload,
			);
		},
		emitCount(userId: string, unreadCount: number) {
			socketService.emitToUser(userId, NOTIFICATION_SOCKET_EVENTS.COUNT, {
				unreadCount,
			});
		},
		emitRead(userId: string, id: string) {
			socketService.emitToUser(userId, NOTIFICATION_SOCKET_EVENTS.READ, {
				id,
			});
		},
		emitReadAll(userId: string) {
			socketService.emitToUser(
				userId,
				NOTIFICATION_SOCKET_EVENTS.READ_ALL,
				{ count: 0 },
			);
		},
	};
};
