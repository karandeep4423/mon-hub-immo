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
import { SOCKET_EVENTS } from '@/lib/constants/socket';

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
		console.log('🔌 useChat: Subscribing to chatStore');
		const unsubscribe = chatStore.subscribe(() => {
			const newState = chatStore.getState();
			setState(newState);
		});

		return unsubscribe;
	}, []);

	return state;
};

/**
 * Hook for creating socket event handlers
 */
const useSocketEventHandlers = (
	state: ReturnType<typeof useChatStoreState>,
	user: AuthUser | null,
): SocketEventHandlers => {
	const markMessagesAsRead = useCallback(async (senderId: string) => {
		try {
			await chatStore.markMessagesAsRead(senderId);
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	}, []);

	const handleNewMessage = useCallback(
		(msg: ChatMessage) => {
			console.log('📨 Received newMessage in useChat:', msg);
			const currentUser = user?._id || user?.id;
			const selectedUserId = state.selectedUser?._id;

			// Use the store's handleIncomingMessage method for better real-time updates
			chatStore.handleIncomingMessage(msg, currentUser);

			// If message is from selected user, mark as read immediately
			if (
				msg.senderId === selectedUserId &&
				msg.receiverId === currentUser &&
				selectedUserId
			) {
				markMessagesAsRead(selectedUserId);
			}
		},
		[state.selectedUser?._id, user, markMessagesAsRead],
	);

	const handleUserTyping = useCallback(
		(data: TypingEvent) => {
			console.log('⌨️ User typing event:', data);
			if (data.senderId === state.selectedUser?._id) {
				chatStore.setUserTyping(data.senderId, data.isTyping);
			}
		},
		[state.selectedUser?._id],
	);

	const handleUserStatusUpdate = useCallback(
		(data: { userId: string; status: string; lastSeen: string }) => {
			console.log('👤 User status update:', data);
			chatStore.updateUserStatus(data.userId, {
				isOnline: data.status === 'online',
				lastSeen: data.lastSeen,
			});
		},
		[],
	);

	const handleMessagesRead = useCallback(
		(data: ReadReceiptEvent) => {
			console.log('✅ Messages read by:', data.readBy);
			const currentUser = user?._id || user?.id;

			// If I am the sender, mark my messages to this reader as read locally
			if (data.senderId === currentUser) {
				chatStore.markMessagesAsRead(currentUser, data.readBy);
			}
		},
		[user],
	);

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
	useEffect(() => {
		if (!socket || !isConnected) {
			console.log('Socket not connected yet, isConnected:', isConnected);
			return;
		}

		console.log('🔌 Subscribing to socket events in useChat');

		// Register all event handlers
		socket.on(SOCKET_EVENTS.NEW_MESSAGE, handlers.handleNewMessage);
		socket.on(SOCKET_EVENTS.USER_TYPING, handlers.handleUserTyping);
		socket.on(
			SOCKET_EVENTS.USER_STATUS_UPDATE,
			handlers.handleUserStatusUpdate,
		);
		socket.on(SOCKET_EVENTS.MESSAGES_READ, handlers.handleMessagesRead);
		socket.on(SOCKET_EVENTS.MESSAGE_DELETED, handlers.handleMessageDeleted);

		// Cleanup event listeners
		return () => {
			socket.off(SOCKET_EVENTS.NEW_MESSAGE, handlers.handleNewMessage);
			socket.off(SOCKET_EVENTS.USER_TYPING, handlers.handleUserTyping);
			socket.off(
				SOCKET_EVENTS.USER_STATUS_UPDATE,
				handlers.handleUserStatusUpdate,
			);
			socket.off(
				SOCKET_EVENTS.MESSAGES_READ,
				handlers.handleMessagesRead,
			);
			socket.off(
				SOCKET_EVENTS.MESSAGE_DELETED,
				handlers.handleMessageDeleted,
			);
		};
	}, [
		socket,
		isConnected,
		handlers.handleNewMessage,
		handlers.handleUserTyping,
		handlers.handleUserStatusUpdate,
		handlers.handleMessagesRead,
		handlers.handleMessageDeleted,
	]);
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
			if (!socket || !selectedUser) return;

			socket.emit(SOCKET_EVENTS.TYPING, {
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
					console.error('Error marking messages as read:', error);
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

	const state = useChatStoreState();
	const { socket, isConnected } = useSocket();
	const { user } = useAuth();

	// Create event handlers
	const eventHandlers = useSocketEventHandlers(state, user);

	// Set up socket listeners
	useSocketEventListeners(socket, isConnected, eventHandlers);

	// Create typing actions
	const typingActions = useTypingActions(socket, state.selectedUser);

	// Create chat actions
	const chatActions = useChatActions();

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
