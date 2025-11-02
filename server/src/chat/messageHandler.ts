import { Server } from 'socket.io';
import { SocketManagerAPI } from './socketManager';
import { SOCKET_EVENTS } from './socketConfig';
import { logger } from '../utils/logger';

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

	logger.debug(
		`[MessageHandler] Emitting newMessage from ${senderId} to ${receiverId}`,
		{ messageId: message._id },
	);

	// Emit to receiver for real-time notification
	const receiverSocketId = socketManager.getReceiverSocketId(receiverId);
	if (receiverSocketId) {
		socketManager.emitToUser(
			receiverId,
			SOCKET_EVENTS.NEW_MESSAGE,
			message,
		);
		logger.debug(
			`[MessageHandler] ✅ Emitted to receiver ${receiverId} (socket: ${receiverSocketId})`,
		);
	} else {
		logger.warn(`[MessageHandler] ⚠️ Receiver ${receiverId} not connected`);
	}

	// Emit to sender for confirmation and real-time sync
	const senderSocketId = socketManager.getReceiverSocketId(senderId);
	if (senderSocketId) {
		socketManager.emitToUser(senderId, SOCKET_EVENTS.NEW_MESSAGE, message);
		logger.debug(
			`[MessageHandler] ✅ Emitted to sender ${senderId} (socket: ${senderSocketId})`,
		);
	} else {
		logger.warn(`[MessageHandler] ⚠️ Sender ${senderId} not connected`);
	}
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

	logger.debug(
		`[MessageHandler] Emitting read receipt to sender ${senderId} from reader ${readBy}`,
	);

	const senderSocketId = socketManager.getReceiverSocketId(senderId);
	if (senderSocketId) {
		socketManager.emitToUser(
			senderId,
			SOCKET_EVENTS.MESSAGES_READ,
			readReceipt,
		);
		logger.debug(
			`[MessageHandler] ✅ Emitted read receipt to ${senderId} (socket: ${senderSocketId})`,
		);
	} else {
		logger.warn(
			`[MessageHandler] ⚠️ Sender ${senderId} not connected for read receipt`,
		);
	}
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
	logger.debug(
		`🗑️[MessageHandler] Emitted messageDeleted for ${payload.messageId}`,
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
	logger.debug('📨[MessageHandler] Message handler initialized');

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
