import { Server, Socket } from 'socket.io';
import { User } from '../models/User';

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
	emitToUser: (userId: string, event: string, data: any) => void;
	broadcastToOthers: (senderId: string, event: string, data: any) => void;
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
	const { [userId]: removed, ...rest } = userSocketMap;
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
	data: any,
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
	data: any,
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
	io.emit('userStatusUpdate', statusUpdate);
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
		io.to(receiverSocketId).emit('userTyping', {
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
			console.error('Failed to persist lastSeen on updateStatus', e);
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
	console.log('❌ User disconnected');

	if (userId && userId !== 'undefined') {
		updateUserMap((map) => removeUserFromMap(map, userId));
		console.log('🗑️ User unmapped:', userId);

		// Update user's last seen when disconnecting
		const lastSeen = new Date();
		try {
			await User.findByIdAndUpdate(
				userId,
				{ $set: { lastSeen } },
				{ new: false },
			);
		} catch (e) {
			console.error('Failed to persist lastSeen on disconnect', e);
		}

		announceUserStatusUpdate(io, userId, 'offline', lastSeen);
	}

	// Send updated online users list to all clients
	io.emit('getOnlineUsers', getOnlineUsers(userSocketMap));
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
): void => {
	// Handle typing events
	socket.on('typing', (data: TypingData) => {
		handleTyping(io, getUserSocketMap(), userId, data);
	});

	// Handle user status updates
	socket.on('updateStatus', async (status: StatusData) => {
		await handleStatusUpdate(io, userId, status);
	});

	// Handle disconnection
	socket.on('disconnect', async () => {
		await handleDisconnection(
			io,
			getUserSocketMap(),
			userId,
			updateUserMap,
		);
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
): void => {
	console.log('🔌 User connected:', socket.id);
	const userId = socket.handshake.query.userId as string;

	if (userId && userId !== 'undefined') {
		updateUserMap((map) => addUserToMap(map, userId, socket.id));
		console.log('✅ User mapped:', userId, '->', socket.id);

		// Announce user online
		announceUserStatusUpdate(io, userId, 'online');
	}

	// Send updated online users list to all clients
	io.emit('getOnlineUsers', getOnlineUsers(getUserSocketMap()));

	// Set up event listeners for this socket
	setupSocketEventListeners(
		io,
		socket,
		userId,
		getUserSocketMap,
		updateUserMap,
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

	// State management functions
	const getUserSocketMap = (): UserSocketMap => userSocketMap;
	const updateUserMap = (
		updater: (map: UserSocketMap) => UserSocketMap,
	): void => {
		userSocketMap = updater(userSocketMap);
	};

	// Set up connection handler
	io.on('connection', (socket: Socket) => {
		handleConnection(io, socket, getUserSocketMap, updateUserMap);
	});

	// Return public API using function composition
	return {
		getReceiverSocketId: (userId: string) =>
			getReceiverSocketId(getUserSocketMap(), userId),

		getOnlineUsers: () => getOnlineUsers(getUserSocketMap()),

		emitToUser: (userId: string, event: string, data: any) =>
			emitToUser(io, getUserSocketMap(), userId, event, data),

		broadcastToOthers: (senderId: string, event: string, data: any) =>
			broadcastToOthers(io, getUserSocketMap(), senderId, event, data),
	};
};
