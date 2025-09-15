// ============================================================================
// SOCKET MODULE EXPORTS
// ============================================================================

export { createSocketService } from './socketService';
export { createSocketManager } from './socketManager';
export {
	createSocketServer,
	SOCKET_EVENTS,
	SOCKET_ROOMS,
} from './socketConfig';
export { createMessageHandler } from './messageHandler';

// Re-export types for external use
export type {
	UserSocketMap,
	TypingData,
	StatusData,
	UserStatusUpdate,
	SocketManagerAPI,
} from './socketManager';

export type { MessageHandlerAPI } from './messageHandler';
export type { SocketServiceAPI } from './socketService';
