import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { getAccessTokenFromCookies } from '../utils/cookieHelper';

// ============================================================================
// SOCKET CONFIGURATION
// ============================================================================

/**
 * Create and configure Socket.IO server with JWT authentication
 * @param httpServer - HTTP server instance
 * @returns Configured Socket.IO server
 */
export function createSocketServer(httpServer: HttpServer): Server {
	const io = new Server(httpServer, {
		cors: {
			origin: [
				'http://localhost:3000',
				'http://localhost:3001',
				process.env.FRONTEND_URL || 'https://mon-hub-immo.vercel.app',
			],
			methods: ['GET', 'POST'],
			credentials: true,
		},
		// Additional Socket.IO options for better performance
		transports: ['websocket', 'polling'],
		allowEIO3: true,
		pingTimeout: 60000,
		pingInterval: 25000,
	});

	// Authentication middleware for Socket.IO connections
	io.use((socket, next) => {
		try {
			// Get token from httpOnly cookies only
			const cookies = socket.handshake.headers.cookie;
			let token: string | undefined;

			if (cookies) {
				// Parse cookies manually
				const parsedCookies = cookies.split(';').reduce(
					(acc, cookie) => {
						const [key, value] = cookie.trim().split('=');
						acc[key] = value;
						return acc;
					},
					{} as Record<string, string>,
				);
				token = getAccessTokenFromCookies(parsedCookies);
			}

			if (!token) {
				return next(
					new Error('Authentication error: No token provided'),
				);
			}

			// Verify JWT token
			const decoded = verifyToken(token);

			// Attach user info to socket
			socket.data.userId = decoded.userId;

			next();
		} catch (error) {
			logger.error('[SocketConfig] Socket authentication error', error);
			next(new Error('Authentication error: Invalid token'));
		}
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

	// Chat thread focus tracking (for suppressing noisy notifications)
	CHAT_ACTIVE_THREAD: 'chat:activeThread',
	CHAT_INACTIVE_THREAD: 'chat:inactiveThread',
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
