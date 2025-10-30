import { Server, Socket } from 'socket.io';
import { User } from '../models/User';
import { SOCKET_EVENTS } from './socketConfig';
import { logger } from '../utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface UserSocketMap {
	[userId: string]: string;
}

export interface TypingData {
	receiverId: string;
	isTyping: boolean;
}

export interface StatusData {
	status: 'online' | 'offline';
}

export interface UserStatusUpdate {
	userId: string;
	status: 'online' | 'offline';
	lastSeen?: Date;
}

export interface SocketManagerAPI {
	getReceiverSocketId: (userId: string) => string | undefined;
	getOnlineUsers: () => string[];
	emitToUser: (userId: string, event: string, data: unknown) => void;
	broadcastToOthers: (senderId: string, event: string, data: unknown) => void;
	isChatThreadActive: (userId: string, peerId: string) => boolean;
}

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get socket ID for a specific user
 */
const getReceiverSocketId = (
	userSocketMap: UserSocketMap,
	userId: string,
): string | undefined => userSocketMap[userId];

/**
 * Get all online user IDs
 */
const getOnlineUsers = (userSocketMap: UserSocketMap): string[] =>
	Object.keys(userSocketMap);

/**
 * Add user to socket map
 */
const addUserToMap = (
	userSocketMap: UserSocketMap,
	userId: string,
	socketId: string,
): UserSocketMap => ({ ...userSocketMap, [userId]: socketId });

/**
 * Remove user from socket map
 */
const removeUserFromMap = (
	userSocketMap: UserSocketMap,
	userId: string,
): UserSocketMap => {
	const rest: UserSocketMap = { ...userSocketMap };
	delete rest[userId];
	return rest;
};

/**
 * Emit event to a specific user
 */
const emitToUser = (
	io: Server,
	userSocketMap: UserSocketMap,
	userId: string,
	event: string,
	data: unknown,
): void => {
	const socketId = getReceiverSocketId(userSocketMap, userId);
	if (socketId) {
		io.to(socketId).emit(event, data);
	}
};

/**
 * Broadcast event to all users except sender
 */
const broadcastToOthers = (
	io: Server,
	userSocketMap: UserSocketMap,
	senderId: string,
	event: string,
	data: unknown,
): void => {
	const senderSocketId = getReceiverSocketId(userSocketMap, senderId);
	if (senderSocketId) {
		io.except(senderSocketId).emit(event, data);
	} else {
		io.emit(event, data);
	}
};

/**
 * Announce user status change to all users
 */
const announceUserStatusUpdate = (
	io: Server,
	userId: string,
	status: 'online' | 'offline',
	lastSeen?: Date,
): void => {
	const statusUpdate: UserStatusUpdate = {
		userId,
		status,
		lastSeen,
	};
	io.emit(SOCKET_EVENTS.USER_STATUS_UPDATE, statusUpdate);
};

// ============================================================================
// EVENT HANDLERS
// ============================================================================

/**
 * Handle typing events
 */
const handleTyping = (
	io: Server,
	userSocketMap: UserSocketMap,
	userId: string,
	data: TypingData,
): void => {
	const { receiverId, isTyping } = data;
	const receiverSocketId = getReceiverSocketId(userSocketMap, receiverId);

	if (receiverSocketId) {
		io.to(receiverSocketId).emit(SOCKET_EVENTS.USER_TYPING, {
			senderId: userId,
			isTyping,
		});
	}
};

/**
 * Handle user status updates
 */
const handleStatusUpdate = async (
	io: Server,
	userId: string,
	status: StatusData,
): Promise<void> => {
	let lastSeen: Date | undefined = undefined;

	if (status.status === 'offline' && userId && userId !== 'undefined') {
		lastSeen = new Date();
		try {
			await User.findByIdAndUpdate(
				userId,
				{ $set: { lastSeen } },
				{ new: false },
			);
		} catch (e) {
			logger.error(
				'[SocketManager] Failed to persist lastSeen on updateStatus',
				e,
			);
		}
	}

	announceUserStatusUpdate(io, userId, status.status, lastSeen);
};

/**
 * Handle socket disconnection
 */
const handleDisconnection = async (
	io: Server,
	userSocketMap: UserSocketMap,
	userId: string,
	updateUserMap: (updater: (map: UserSocketMap) => UserSocketMap) => void,
): Promise<void> => {
	logger.debug('[SocketManager] User disconnected');

	if (userId && userId !== 'undefined') {
		updateUserMap((map) => removeUserFromMap(map, userId));
		logger.debug('[SocketManager] User unmapped:', userId);

		// Update user's last seen when disconnecting
		const lastSeen = new Date();
		try {
			await User.findByIdAndUpdate(
				userId,
				{ $set: { lastSeen } },
				{ new: false },
			);
		} catch (e) {
			logger.error(
				'[SocketManager] Failed to persist lastSeen on disconnect',
				e,
			);
		}

		announceUserStatusUpdate(io, userId, 'offline', lastSeen);
	}

	// Send updated online users list to all clients
	io.emit(SOCKET_EVENTS.GET_ONLINE_USERS, getOnlineUsers(userSocketMap));
};

/**
 * Set up event listeners for a socket
 */
const setupSocketEventListeners = (
	io: Server,
	socket: Socket,
	userId: string,
	getUserSocketMap: () => UserSocketMap,
	updateUserMap: (updater: (map: UserSocketMap) => UserSocketMap) => void,
	getActiveThreads: () => Record<string, string | undefined>,
	setActiveThread: (userId: string, peerId?: string) => void,
): void => {
	// Handle typing events
	socket.on(SOCKET_EVENTS.TYPING, (data: TypingData) => {
		handleTyping(io, getUserSocketMap(), userId, data);
	});

	// Handle user status updates
	socket.on(SOCKET_EVENTS.UPDATE_STATUS, async (status: StatusData) => {
		await handleStatusUpdate(io, userId, status);
	});

	// Handle disconnection
	socket.on(SOCKET_EVENTS.DISCONNECT, async () => {
		// Clear active thread on disconnect
		setActiveThread(userId, undefined);
		await handleDisconnection(
			io,
			getUserSocketMap(),
			userId,
			updateUserMap,
		);
	});

	// Track active chat thread for notification suppression
	socket.on(SOCKET_EVENTS.CHAT_ACTIVE_THREAD, (data: { peerId: string }) => {
		if (!data || !data.peerId) return;
		setActiveThread(userId, data.peerId);
	});

	socket.on(SOCKET_EVENTS.CHAT_INACTIVE_THREAD, () => {
		setActiveThread(userId, undefined);
	});
};

/**
 * Handle new socket connection
 */
const handleConnection = (
	io: Server,
	socket: Socket,
	getUserSocketMap: () => UserSocketMap,
	updateUserMap: (updater: (map: UserSocketMap) => UserSocketMap) => void,
	getActiveThreads: () => Record<string, string | undefined>,
	setActiveThread: (userId: string, peerId?: string) => void,
): void => {
	logger.debug('[SocketManager] User connected:', socket.id);
	// Get userId from socket.data (set by auth middleware)
	const userId = socket.data.userId;

	// Disconnect if no userId (auth middleware failed or missing)
	if (!userId || userId === 'undefined') {
		logger.error(
			'[SocketManager] No userId found, disconnecting socket:',
			socket.id,
		);
		socket.disconnect(true);
		return;
	}

	updateUserMap((map) => addUserToMap(map, userId, socket.id));
	logger.debug('[SocketManager] User mapped:', userId, '->', socket.id);

	// Announce user online
	announceUserStatusUpdate(io, userId, 'online');

	// Send updated online users list to all clients
	io.emit(SOCKET_EVENTS.GET_ONLINE_USERS, getOnlineUsers(getUserSocketMap()));

	// Set up event listeners for this socket
	setupSocketEventListeners(
		io,
		socket,
		userId,
		getUserSocketMap,
		updateUserMap,
		getActiveThreads,
		setActiveThread,
	);
};

// ============================================================================
// MAIN SOCKET MANAGER FACTORY FUNCTION
// ============================================================================

/**
 * Create a socket manager using functional composition and closures
 * @param io - Socket.IO server instance
 * @returns Socket manager API
 */
export const createSocketManager = (io: Server): SocketManagerAPI => {
	// Private state using closure
	let userSocketMap: UserSocketMap = {};
	// Track which peer chat thread each user is actively viewing
	const activeThreads: Record<string, string | undefined> = {};

	// State management functions
	const getUserSocketMap = (): UserSocketMap => userSocketMap;
	const updateUserMap = (
		updater: (map: UserSocketMap) => UserSocketMap,
	): void => {
		userSocketMap = updater(userSocketMap);
	};

	// Set up connection handler
	io.on('connection', (socket: Socket) => {
		const getActiveThreads = () => activeThreads;
		const setActiveThread = (userId: string, peerId?: string) => {
			if (!userId) return;
			if (peerId) activeThreads[userId] = peerId;
			else delete activeThreads[userId];
		};
		handleConnection(
			io,
			socket,
			getUserSocketMap,
			updateUserMap,
			getActiveThreads,
			setActiveThread,
		);
	});

	// Return public API using function composition
	return {
		getReceiverSocketId: (userId: string) =>
			getReceiverSocketId(getUserSocketMap(), userId),

		getOnlineUsers: () => getOnlineUsers(getUserSocketMap()),

		emitToUser: (userId: string, event: string, data: unknown) =>
			emitToUser(io, getUserSocketMap(), userId, event, data),

		broadcastToOthers: (senderId: string, event: string, data: unknown) =>
			broadcastToOthers(io, getUserSocketMap(), senderId, event, data),

		isChatThreadActive: (userId: string, peerId: string) => {
			return activeThreads[userId] === peerId;
		},
	};
};
