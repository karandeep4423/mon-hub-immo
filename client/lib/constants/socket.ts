// Client-side socket event constants to mirror server/src/chat/socketConfig.ts
export const SOCKET_EVENTS = {
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',
	USER_STATUS_UPDATE: 'userStatusUpdate',
	UPDATE_STATUS: 'updateStatus',
	GET_ONLINE_USERS: 'getOnlineUsers',
	TYPING: 'typing',
	USER_TYPING: 'userTyping',
	NEW_MESSAGE: 'newMessage',
	MESSAGES_READ: 'messagesRead',
	MESSAGE_DELETED: 'messageDeleted',
	// Chat thread focus tracking (for suppressing noisy notifications)
	CHAT_ACTIVE_THREAD: 'chat:activeThread',
	CHAT_INACTIVE_THREAD: 'chat:inactiveThread',
} as const;

export type SocketEventName =
	(typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
