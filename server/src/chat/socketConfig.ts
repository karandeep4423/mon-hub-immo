import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

// ============================================================================
// SOCKET CONFIGURATION
// ============================================================================

/**
 * Create and configure Socket.IO server
 * @param httpServer - HTTP server instance
 * @returns Configured Socket.IO server
 */
export function createSocketServer(httpServer: HttpServer): Server {
	const io = new Server(httpServer, {
		cors: {
			origin: ['http://localhost:3000', 'http://localhost:3001', process.env.FRONTEND_URL || 'https://mon-hub-immo.vercel.app'],
			methods: ['GET', 'POST'],
			credentials: true,
		},
		// Additional Socket.IO options for better performance
		transports: ['websocket', 'polling'],
		allowEIO3: true,
		pingTimeout: 60000,
		pingInterval: 25000,
	});

	return io;
}

/**
 * Socket event names constants for consistency
 */
export const SOCKET_EVENTS = {
	// Connection events
	CONNECTION: 'connection',
	DISCONNECT: 'disconnect',

	// User status events
	USER_STATUS_UPDATE: 'userStatusUpdate',
	UPDATE_STATUS: 'updateStatus',
	GET_ONLINE_USERS: 'getOnlineUsers',

	// Chat events
	TYPING: 'typing',
	USER_TYPING: 'userTyping',
	NEW_MESSAGE: 'newMessage',
	MESSAGES_READ: 'messagesRead',
	MESSAGE_DELETED: 'messageDeleted',
} as const;

/**
 * Socket room names for organized communication
 */
export const SOCKET_ROOMS = {
	// User-specific rooms
	USER: (userId: string) => `user:${userId}`,

	// Chat-specific rooms
	CHAT: (chatId: string) => `chat:${chatId}`,

	// General rooms
	ONLINE_USERS: 'online_users',
} as const;
