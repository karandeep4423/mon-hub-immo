// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from './useAuth';
import { chatStore } from '@/store/chatStore';
import type {
	ChatUser,
	ChatMessage,
	ReadReceiptEvent,
	TypingEvent,
	SendMessageData,
} from '@/types/chat';
import type { User as AuthUser } from '@/types/auth';
import type { Socket } from 'socket.io-client';
import { Features } from '@/lib/constants';

import { logger } from '@/lib/utils/logger';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SocketEventHandlers {
	handleNewMessage: (msg: ChatMessage) => void;
	handleUserTyping: (data: TypingEvent) => void;
	handleUserStatusUpdate: (data: {
		userId: string;
		status: string;
		lastSeen: string;
	}) => void;
	handleMessagesRead: (data: ReadReceiptEvent) => void;
	handleMessageDeleted: (data: {
		messageId: string;
		receiverId: string;
		senderId: string;
	}) => void;
}

interface TypingActions {
	sendTypingStatus: (isTyping: boolean) => void;
	handleTyping: () => void;
	stopTyping: () => void;
}

interface ChatActions {
	getUsers: () => Promise<void>;
	getUserById: (userId: string) => Promise<ChatUser | null>;
	getMessages: (userId: string) => Promise<void>;
	loadOlderMessages: () => Promise<ChatMessage[]>;
	sendMessage: (messageData: SendMessageData) => Promise<void>;
	setSelectedUser: (user: ChatUser | null) => void;
	markMessagesAsRead: (senderId: string) => Promise<void>;
}

// ============================================================================
// CUSTOM HOOKS FOR FUNCTIONALITY SEPARATION
// ============================================================================

/**
 * Hook for managing chat store state subscription
 */
const useChatStoreState = () => {
	const [state, setState] = useState(chatStore.getState());

	useEffect(() => {
		logger.debug('🔌 useChat: Subscribing to chatStore');
		const unsubscribe = chatStore.subscribe(() => {
			const newState = chatStore.getState();
			setState(newState);
		});

		return unsubscribe;
	}, []);

	return state;
};

/**
 * Hook for creating socket event handlers with stable references
 */
const useSocketEventHandlers = (
	state: ReturnType<typeof useChatStoreState>,
	user: AuthUser | null,
): SocketEventHandlers => {
	// Use refs to access latest values without triggering re-subscriptions
	const stateRef = useRef(state);
	const userRef = useRef(user);

	// Update refs on every render
	useEffect(() => {
		stateRef.current = state;
		userRef.current = user;
	});

	const markMessagesAsRead = useCallback(async (senderId: string) => {
		try {
			await chatStore.markMessagesAsRead(senderId);
		} catch (error) {
			logger.error('Error marking messages as read', {
				error: error instanceof Error ? error.message : String(error),
			});
		}
	}, []);

	// Create stable handlers that read from refs
	const handleNewMessage = useCallback(
		(msg: ChatMessage) => {
			logger.debug('📨 Received newMessage in useChat', {
				messageId: msg._id,
				senderId: msg.senderId,
				receiverId: msg.receiverId,
				text: msg.text?.substring(0, 50),
			});
			const currentUser = userRef.current?._id || userRef.current?.id;
			const selectedUserId = stateRef.current.selectedUser?._id;

			// Use the store's handleIncomingMessage method for better real-time updates
			chatStore.handleIncomingMessage(msg, currentUser);

			// If message is from selected user, mark as read immediately
			if (
				msg.senderId === selectedUserId &&
				msg.receiverId === currentUser &&
				selectedUserId
			) {
				logger.debug(
					'🔵 Auto-marking message as read (from selected user)',
					selectedUserId,
				);
				markMessagesAsRead(selectedUserId);
			}
		},
		[markMessagesAsRead],
	);

	const handleUserTyping = useCallback((data: TypingEvent) => {
		logger.debug('⌨️ User typing event received', {
			senderId: data.senderId,
			isTyping: data.isTyping,
			selectedUserId: stateRef.current.selectedUser?._id,
		});
		const selectedUserId = stateRef.current.selectedUser?._id;
		if (data.senderId === selectedUserId) {
			logger.debug(
				'⌨️ Setting typing indicator for selected user',
				data.senderId,
			);
			chatStore.setUserTyping(data.senderId, data.isTyping);
		} else {
			logger.debug(
				'⌨️ Ignoring typing from non-selected user',
				data.senderId,
			);
		}
	}, []);

	const handleUserStatusUpdate = useCallback(
		(data: { userId: string; status: string; lastSeen: string }) => {
			logger.debug('👤 User status update', { userId: data.userId });
			chatStore.updateUserStatus(data.userId, {
				isOnline: data.status === 'online',
				lastSeen: data.lastSeen,
			});
		},
		[],
	);

	const handleMessagesRead = useCallback((data: ReadReceiptEvent) => {
		logger.debug('✅ Messages read receipt received', {
			readBy: data.readBy,
			senderId: data.senderId,
			currentUser: userRef.current?._id || userRef.current?.id,
		});
		const currentUser = userRef.current?._id || userRef.current?.id;

		// If I am the sender, mark my messages to this reader as read locally
		if (data.senderId === currentUser) {
			logger.debug(
				'✅ Marking messages as read locally for reader',
				data.readBy,
			);
			chatStore.markMessagesAsRead(currentUser, data.readBy);
		} else {
			logger.debug(
				'⚠️ Ignoring read receipt not meant for me',
				data.senderId,
			);
		}
	}, []);

	const handleMessageDeleted = useCallback(
		(data: { messageId: string; receiverId: string; senderId: string }) => {
			chatStore.setMessages(
				chatStore
					.getState()
					.messages.filter((m) => m._id !== data.messageId),
			);
		},
		[],
	);

	return {
		handleNewMessage,
		handleUserTyping,
		handleUserStatusUpdate,
		handleMessagesRead,
		handleMessageDeleted,
	};
};

/**
 * Hook for managing socket event listeners
 */
const useSocketEventListeners = (
	socket: Socket | null,
	isConnected: boolean,
	handlers: SocketEventHandlers,
) => {
	// Use refs to keep stable handler references
	const handlersRef = useRef(handlers);

	// Update refs on every render
	useEffect(() => {
		handlersRef.current = handlers;
	});

	useEffect(() => {
		if (!socket || !isConnected) {
			logger.debug('Socket not connected yet', {
				hasSocket: !!socket,
				isConnected,
			});
			return;
		}

		logger.debug('🔌 Subscribing to socket events in useChat', {
			socketId: socket.id,
			isConnected,
		});

		// Create wrapper functions that call the latest handlers from ref
		const handleNewMessage = (msg: ChatMessage) => {
			logger.debug(
				'🎯 Wrapper: newMessage event received, calling handler',
			);
			handlersRef.current.handleNewMessage(msg);
		};
		const handleUserTyping = (data: TypingEvent) => {
			logger.debug(
				'🎯 Wrapper: userTyping event received, calling handler',
			);
			handlersRef.current.handleUserTyping(data);
		};
		const handleUserStatusUpdate = (data: {
			userId: string;
			status: string;
			lastSeen: string;
		}) => {
			logger.debug(
				'🎯 Wrapper: userStatusUpdate event received, calling handler',
			);
			handlersRef.current.handleUserStatusUpdate(data);
		};
		const handleMessagesRead = (data: ReadReceiptEvent) => {
			logger.debug(
				'🎯 Wrapper: messagesRead event received, calling handler',
			);
			handlersRef.current.handleMessagesRead(data);
		};
		const handleMessageDeleted = (data: {
			messageId: string;
			receiverId: string;
			senderId: string;
		}) => {
			logger.debug(
				'🎯 Wrapper: messageDeleted event received, calling handler',
			);
			handlersRef.current.handleMessageDeleted(data);
		};

		// Use reusable socket listeners pattern
		const chatListeners = {
			[Features.Chat.SOCKET_EVENTS.NEW_MESSAGE]: handleNewMessage,
			[Features.Chat.SOCKET_EVENTS.USER_TYPING]: handleUserTyping,
			[Features.Chat.SOCKET_EVENTS.USER_STATUS_UPDATE]:
				handleUserStatusUpdate,
			[Features.Chat.SOCKET_EVENTS.MESSAGES_READ]: handleMessagesRead,
			[Features.Chat.SOCKET_EVENTS.MESSAGE_DELETED]: handleMessageDeleted,
		};

		// Log all registered events
		logger.debug(
			'🔌 Registering socket event listeners:',
			Object.keys(chatListeners),
		);

		Object.entries(chatListeners).forEach(([event, handler]) => {
			socket.on(event, handler);
			logger.debug(`✅ Registered listener for: ${event}`);
		});

		// Verify listeners are registered
		logger.debug('🔌 All listeners registered. Socket listeners:', {
			listenerCount: socket.listeners(
				Features.Chat.SOCKET_EVENTS.NEW_MESSAGE,
			).length,
		});

		// Cleanup event listeners
		return () => {
			logger.debug('🔌 Cleaning up socket event listeners');
			Object.entries(chatListeners).forEach(([event, handler]) => {
				socket.off(event, handler);
			});
		};
	}, [socket, isConnected]); // Only re-subscribe when socket or connection changes
};

/**
 * Hook for managing typing functionality
 */
const useTypingActions = (
	socket: Socket | null,
	selectedUser: ChatUser | null,
): TypingActions => {
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const sendTypingStatus = useCallback(
		(isTyping: boolean) => {
			if (!socket || !selectedUser) {
				logger.debug(
					'⌨️ Cannot send typing status - socket or selectedUser missing',
					{ hasSocket: !!socket, hasSelectedUser: !!selectedUser },
				);
				return;
			}

			logger.debug(
				`⌨️ Sending typing status to ${selectedUser._id}: ${isTyping}`,
			);
			socket.emit(Features.Chat.SOCKET_EVENTS.TYPING, {
				receiverId: selectedUser._id,
				isTyping,
			});
		},
		[socket, selectedUser],
	);

	const handleTyping = useCallback(() => {
		sendTypingStatus(true);

		// Clear existing timeout
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}

		// Set new timeout to stop typing indicator after 2 seconds
		typingTimeoutRef.current = setTimeout(() => {
			sendTypingStatus(false);
		}, 2000);
	}, [sendTypingStatus]);

	const stopTyping = useCallback(() => {
		sendTypingStatus(false);
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
		}
	}, [sendTypingStatus]);

	return {
		sendTypingStatus,
		handleTyping,
		stopTyping,
	};
};

/**
 * Hook for creating chat actions
 */
const useChatActions = (): ChatActions => {
	const actions = useMemo(
		() => ({
			getUsers: chatStore.getUsers,
			getUserById: chatStore.getUserById,
			getMessages: chatStore.getMessages,
			loadOlderMessages: chatStore.loadOlderMessages,
			sendMessage: chatStore.sendMessage,
			setSelectedUser: chatStore.setSelectedUser,
			markMessagesAsRead: async (senderId: string) => {
				try {
					await chatStore.markMessagesAsRead(senderId);
				} catch (error) {
					logger.error('Error marking messages as read', {
						error:
							error instanceof Error
								? error.message
								: String(error),
					});
				}
			},
		}),
		[],
	);

	return actions;
};

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Custom hook for managing chat functionality using functional composition
 * Features:
 * - Real-time message handling
 * - Typing indicators
 * - User status updates
 * - Read receipts
 * - Store synchronization
 */
export const useChat = () => {
	// ============================================================================
	// COMPOSED HOOKS
	// ============================================================================

	logger.debug('🔌 useChat: Hook called');

	const state = useChatStoreState();
	const { socket, isConnected } = useSocket();
	const { user } = useAuth();

	logger.debug('🔌 useChat: State', {
		hasSocket: !!socket,
		isConnected,
		hasUser: !!user,
		socketId: socket?.id,
	});

	// Create event handlers
	const eventHandlers = useSocketEventHandlers(state, user);

	// Set up socket listeners
	useSocketEventListeners(socket, isConnected, eventHandlers);

	// Create typing actions
	const typingActions = useTypingActions(socket, state.selectedUser);

	// Create chat actions
	const chatActions = useChatActions();

	// Track active chat thread on the server to suppress redundant notifications
	useEffect(() => {
		if (!socket || !isConnected) return;

		const peerId = state.selectedUser?._id;
		if (peerId) {
			// Notify server that this client is actively viewing a thread with peerId
			socket.emit(Features.Chat.SOCKET_EVENTS.CHAT_ACTIVE_THREAD, {
				peerId,
			});
		}

		// On cleanup or when changing threads, mark inactive
		return () => {
			if (!socket || !isConnected) return;
			socket.emit(Features.Chat.SOCKET_EVENTS.CHAT_INACTIVE_THREAD);
		};
	}, [socket, isConnected, state.selectedUser?._id]);

	// ============================================================================
	// RETURN COMPOSED API
	// ============================================================================

	return {
		// Spread all store state
		...state,

		// Typing actions
		...typingActions,

		// Chat actions
		...chatActions,
	};
};
