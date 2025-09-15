// hooks/useChat.ts
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from './useAuth';
import { chatStore } from '@/store/chatStore';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface SocketEventHandlers {
	handleNewMessage: (msg: any) => void;
	handleUserTyping: (data: { senderId: string; isTyping: boolean }) => void;
	handleUserStatusUpdate: (data: {
		userId: string;
		status: string;
		lastSeen: string;
	}) => void;
	handleMessagesRead: (data: { readBy: string; senderId: string }) => void;
}

interface TypingActions {
	sendTypingStatus: (isTyping: boolean) => void;
	handleTyping: () => void;
	stopTyping: () => void;
}

interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	email: string;
	lastMessage?: {
		text: string;
		createdAt: string;
		senderId: string;
	} | null;
	unreadCount?: number;
}

interface ChatActions {
	getUsers: () => Promise<void>;
	getUserById: (userId: string) => Promise<User | null>;
	getMessages: (userId: string) => Promise<void>;
	loadOlderMessages: () => Promise<any[]>;
	sendMessage: (messageData: {
		text?: string;
		image?: string;
	}) => Promise<void>;
	setSelectedUser: (user: any) => void;
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
	user: any,
): SocketEventHandlers => {
	const markMessagesAsRead = useCallback(async (senderId: string) => {
		try {
			await chatStore.markMessagesAsRead(senderId);
		} catch (error) {
			console.error('Error marking messages as read:', error);
		}
	}, []);

	const handleNewMessage = useCallback(
		(msg: any) => {
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
		(data: { senderId: string; isTyping: boolean }) => {
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
		(data: { readBy: string; senderId: string }) => {
			console.log('✅ Messages read by:', data.readBy);
			const currentUser = user?._id || user?.id;

			// If I am the sender, mark my messages to this reader as read locally
			if (data.senderId === currentUser) {
				chatStore.markMessagesAsRead(currentUser, data.readBy);
			}
		},
		[user],
	);

	return {
		handleNewMessage,
		handleUserTyping,
		handleUserStatusUpdate,
		handleMessagesRead,
	};
};

/**
 * Hook for managing socket event listeners
 */
const useSocketEventListeners = (
	socket: any,
	isConnected: boolean,
	handlers: SocketEventHandlers,
	dependencies: any[],
) => {
	useEffect(() => {
		if (!socket || !isConnected) {
			console.log('Socket not connected yet, isConnected:', isConnected);
			return;
		}

		console.log('🔌 Subscribing to socket events in useChat');

		// Register all event handlers
		socket.on('newMessage', handlers.handleNewMessage);
		socket.on('userTyping', handlers.handleUserTyping);
		socket.on('userStatusUpdate', handlers.handleUserStatusUpdate);
		socket.on('messagesRead', handlers.handleMessagesRead);

		// Cleanup event listeners
		return () => {
			socket.off('newMessage', handlers.handleNewMessage);
			socket.off('userTyping', handlers.handleUserTyping);
			socket.off('userStatusUpdate', handlers.handleUserStatusUpdate);
			socket.off('messagesRead', handlers.handleMessagesRead);
		};
	}, [socket, isConnected, handlers, ...dependencies]);
};

/**
 * Hook for managing typing functionality
 */
const useTypingActions = (socket: any, selectedUser: any): TypingActions => {
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const sendTypingStatus = useCallback(
		(isTyping: boolean) => {
			if (!socket || !selectedUser) return;

			socket.emit('typing', {
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
	useSocketEventListeners(socket, isConnected, eventHandlers, [
		state.selectedUser?._id,
		user,
	]);

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
