import { Server } from 'socket.io';
import { createSocketManager } from './socketManager';
import { createMessageHandler } from './messageHandler';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface SocketServiceAPI {
	getReceiverSocketId: (userId: string) => string | undefined;
	getOnlineUsers: () => string[];
	emitNewMessage: (message: {
		senderId: string;
		receiverId: string;
		[k: string]: unknown;
	}) => void;
	emitReadReceipt: (senderId: string, readBy: string) => void;
	emitMessageDeleted: (payload: {
		messageId: string;
		receiverId: string;
		senderId: string;
	}) => void;
	emitToUser: (userId: string, event: string, data: unknown) => void;
	broadcastToOthers: (senderId: string, event: string, data: unknown) => void;
	getIO: () => Server;
}

// ============================================================================
// SOCKET SERVICE FACTORY FUNCTION
// ============================================================================

/**
 * Create a socket service using functional composition and dependency injection
 * @param io - Socket.IO server instance
 * @returns Socket service API
 */
export const createSocketService = (io: Server): SocketServiceAPI => {
	// Initialize dependencies using factory functions
	const socketManager = createSocketManager(io);
	const messageHandler = createMessageHandler(io, socketManager);

	console.log('🔌 Socket service initialized');

	// Return composed API using function delegation
	return {
		// Socket manager methods
		getReceiverSocketId: socketManager.getReceiverSocketId,
		getOnlineUsers: socketManager.getOnlineUsers,
		emitToUser: socketManager.emitToUser,
		broadcastToOthers: socketManager.broadcastToOthers,

		// Message handler methods
		emitNewMessage: messageHandler.emitNewMessage,
		emitReadReceipt: messageHandler.emitReadReceipt,
		emitMessageDeleted: messageHandler.emitMessageDeleted,

		// IO access
		getIO: () => io,
	};
};
