import { Server } from 'socket.io';
import { SocketManagerAPI } from './socketManager';
import { SOCKET_EVENTS } from './socketConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MessageHandlerAPI {
	emitNewMessage: (message: any) => void;
	emitReadReceipt: (senderId: string, readBy: string) => void;
}

// ============================================================================
// MESSAGE EMISSION FUNCTIONS
// ============================================================================

/**
 * Emit new message to relevant users
 */
const emitNewMessage = (
	socketManager: SocketManagerAPI,
	message: any,
): void => {
	const { receiverId, senderId } = message;

	// Emit to receiver for real-time notification
	socketManager.emitToUser(receiverId, SOCKET_EVENTS.NEW_MESSAGE, message);

	// Emit to sender for confirmation and real-time sync
	socketManager.emitToUser(senderId, SOCKET_EVENTS.NEW_MESSAGE, message);

	console.log(
		`📤 Emitted newMessage to receiver ${receiverId} and sender ${senderId}`,
	);
};

/**
 * Emit read receipt to message sender
 */
const emitReadReceipt = (
	socketManager: SocketManagerAPI,
	senderId: string,
	readBy: string,
): void => {
	const readReceipt = {
		readBy,
		senderId,
	};

	socketManager.emitToUser(
		senderId,
		SOCKET_EVENTS.MESSAGES_READ,
		readReceipt,
	);
	console.log(
		`📤 Emitted read receipt to sender ${senderId} from reader ${readBy}`,
	);
};

// ============================================================================
// MESSAGE HANDLER FACTORY FUNCTION
// ============================================================================

/**
 * Create a message handler using functional composition
 * @param io - Socket.IO server instance
 * @param socketManager - Socket manager API
 * @returns Message handler API
 */
export const createMessageHandler = (
	io: Server,
	socketManager: SocketManagerAPI,
): MessageHandlerAPI => {
	// Log initialization
	console.log('📨 Message handler initialized');

	// Return public API using partial application
	return {
		emitNewMessage: (message: any) =>
			emitNewMessage(socketManager, message),

		emitReadReceipt: (senderId: string, readBy: string) =>
			emitReadReceipt(socketManager, senderId, readBy),
	};
};
