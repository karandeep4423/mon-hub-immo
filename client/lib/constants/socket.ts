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
} as const;

export type SocketEventName =
	(typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
