import { Server } from 'socket.io';
import { SocketManagerAPI } from './socketManager';
import { SOCKET_EVENTS } from './socketConfig';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MessageHandlerAPI {
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
}

// ============================================================================
// MESSAGE EMISSION FUNCTIONS
// ============================================================================

/**
 * Emit new message to relevant users
 */
const emitNewMessage = (
	socketManager: SocketManagerAPI,
	message: { senderId: string; receiverId: string; [k: string]: unknown },
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

/**
 * Emit message deleted to both participants
 */
const emitMessageDeleted = (
	socketManager: SocketManagerAPI,
	payload: { messageId: string; receiverId: string; senderId: string },
): void => {
	socketManager.emitToUser(
		payload.receiverId,
		SOCKET_EVENTS.MESSAGE_DELETED,
		payload,
	);
	socketManager.emitToUser(
		payload.senderId,
		SOCKET_EVENTS.MESSAGE_DELETED,
		payload,
	);
	console.log(`🗑️ Emitted messageDeleted for ${payload.messageId}`);
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
		emitNewMessage: (message: {
			senderId: string;
			receiverId: string;
			[k: string]: unknown;
		}) => emitNewMessage(socketManager, message),

		emitReadReceipt: (senderId: string, readBy: string) =>
			emitReadReceipt(socketManager, senderId, readBy),

		emitMessageDeleted: (payload: {
			messageId: string;
			receiverId: string;
			senderId: string;
		}) => emitMessageDeleted(socketManager, payload),
	};
};
