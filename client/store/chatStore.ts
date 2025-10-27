import { ChatApi } from '@/lib/api/chatApi';
import { toast } from 'react-toastify';
import { chatLogger } from '@/lib/utils/logger';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';
import type {
	ChatUser as User,
	ChatMessage as Message,
	SendMessageData,
} from '@/types/chat';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

// Types moved to '@/types/chat' to keep shapes consistent across modules

export interface ChatState {
	messages: Message[];
	// Pagination cursors per peer user id for infinite scroll
	messageCursors: Record<
		string,
		{ hasMore: boolean; oldestLoadedAt?: string }
	>;
	users: User[];
	selectedUser: User | null;
	isUsersLoading: boolean;
	isMessagesLoading: boolean;
	isSendingMessage: boolean;
	typingUsers: string[];
	userStatuses: Record<string, { isOnline: boolean; lastSeen: string }>;
}

export interface ChatActions {
	// State management
	setSelectedUser: (user: User | null) => void;
	setUsers: (users: User[]) => void;
	setMessages: (messages: Message[]) => void;
	addMessage: (message: Message) => void;
	handleIncomingMessage: (message: Message, currentUserId?: string) => void;
	markMessagesAsRead: (
		senderId: string,
		receiverId?: string,
	) => Promise<void>;
	setUserTyping: (userId: string, isTyping: boolean) => void;
	updateUserStatus: (
		userId: string,
		status: { isOnline: boolean; lastSeen: string },
	) => void;
	setUsersLoading: (loading: boolean) => void;
	setMessagesLoading: (loading: boolean) => void;
	setSendingMessage: (loading: boolean) => void;

	// API methods
	getUsers: () => Promise<void>;
	getUserById: (userId: string) => Promise<User | null>;
	getMessages: (userId: string) => Promise<void>;
	loadOlderMessages: () => Promise<Message[]>;
	sendMessage: (messageData: SendMessageData) => Promise<void>;
	deleteMessage: (messageId: string) => Promise<void>;

	// Debug methods (development only)
	debugDuplicates: () => {
		total: number;
		unique: number;
		duplicates: string[];
	};
}

export interface ChatStore extends ChatState, ChatActions {
	subscribe: (listener: () => void) => () => void;
	getState: () => ChatState;
}

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Deduplicate messages by ID and sort by creation time
 */
const dedupeAndSortMessages = (messages: Message[]): Message[] => {
	const byId = new Map<string, Message>();
	const duplicates: string[] = [];

	// Keep only the first occurrence of each message ID
	for (const message of messages) {
		const id = String(message._id);
		if (!byId.has(id)) {
			byId.set(id, message);
		} else {
			duplicates.push(id);
		}
	}

	// Log duplicates for debugging
	if (duplicates.length > 0) {
		chatLogger.warn('Removed duplicate messages:', duplicates);
	}

	// Sort by creation time (oldest first for UI rendering)
	return Array.from(byId.values()).sort(
		(a, b) =>
			new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
	);
};

/**
 * Sort users by most recent message activity
 */
const sortUsersByRecentActivity = (users: User[]): User[] => {
	return users.sort((a, b) => {
		const aTime = a.lastMessage?.createdAt
			? new Date(a.lastMessage.createdAt).getTime()
			: 0;
		const bTime = b.lastMessage?.createdAt
			? new Date(b.lastMessage.createdAt).getTime()
			: 0;
		return bTime - aTime; // Most recent first
	});
};

/**
 * Update user's last message in users array, or add user if not present
 */
const updateUserLastMessage = (
	users: User[],
	userId: string,
	message: Message,
): User[] => {
	const existingUserIndex = users.findIndex((user) => user._id === userId);

	if (existingUserIndex !== -1) {
		// Update existing user
		const updatedUsers = [...users];
		updatedUsers[existingUserIndex] = {
			...updatedUsers[existingUserIndex],
			lastMessage: {
				text: message.text || '',
				createdAt: message.createdAt,
				senderId: message.senderId,
			},
		};
		return updatedUsers;
	} else {
		// User not found - this shouldn't happen in normal flow, but handle gracefully
		chatLogger.warn(
			'Trying to update last message for user not in sidebar:',
			userId,
		);
		return users;
	}
};

/**
 * Increment unread count for a specific user
 */
const incrementUnreadCountForUser = (users: User[], userId: string): User[] => {
	return users.map((user) =>
		user._id === userId
			? { ...user, unreadCount: (user.unreadCount || 0) + 1 }
			: user,
	);
};

/**
 * Clear unread count for a specific user
 */
const clearUnreadCountForUser = (users: User[], userId: string): User[] => {
	return users.map((user) =>
		user._id === userId ? { ...user, unreadCount: 0 } : user,
	);
};

/**
 * Mark messages as read locally
 */
const markMessagesAsReadLocally = (
	messages: Message[],
	senderId: string,
	receiverId?: string,
): Message[] => {
	return messages.map((message) => {
		const isFromSender = message.senderId === senderId;
		const isToReceiver = receiverId
			? message.receiverId === receiverId
			: true;

		if (isFromSender && isToReceiver && !message.isRead) {
			return {
				...message,
				isRead: true,
				readAt: new Date().toISOString(),
			};
		}
		return message;
	});
};

/**
 * Update typing users list
 */
const updateTypingUsers = (
	typingUsers: string[],
	userId: string,
	isTyping: boolean,
): string[] => {
	if (isTyping) {
		return [...typingUsers.filter((id) => id !== userId), userId];
	} else {
		return typingUsers.filter((id) => id !== userId);
	}
};

// ============================================================================
// CHAT STORE FACTORY FUNCTION
// ============================================================================

/**
 * Create a chat store using functional composition and closures
 */
export const createChatStore = (): ChatStore => {
	// Private state using closure
	let state: ChatState = {
		messages: [],
		messageCursors: {},
		users: [],
		selectedUser: null,
		isUsersLoading: false,
		isMessagesLoading: false,
		isSendingMessage: false,
		typingUsers: [],
		userStatuses: {},
	};

	// Track processed message ids to prevent duplicate processing
	const processedMessageIds = new Set<string>();

	// Debug function for development
	const debugDuplicates = () => {
		const messageIds = state.messages.map((m) => m._id);
		const uniqueIds = new Set(messageIds);
		const duplicates = messageIds.filter(
			(id, index) => messageIds.indexOf(id) !== index,
		);

		chatLogger.debug('Debug:');
		chatLogger.debug('Total messages:', messageIds.length);
		chatLogger.debug('Unique messages:', uniqueIds.size);
		chatLogger.debug('Processed IDs:', Array.from(processedMessageIds));
		if (duplicates.length > 0) {
			chatLogger.warn('Duplicate message IDs found:', duplicates);
		}

		return { total: messageIds.length, unique: uniqueIds.size, duplicates };
	};

	// Listeners for state changes
	const listeners = new Set<() => void>();

	// State management functions
	const getState = (): ChatState => state;

	const setState = (newState: Partial<ChatState>): void => {
		state = { ...state, ...newState };
		notify();
	};

	const notify = (): void => {
		listeners.forEach((listener) => listener());
	};

	const subscribe = (listener: () => void): (() => void) => {
		listeners.add(listener);
		return () => listeners.delete(listener);
	};

	// ============================================================================
	// STATE ACTIONS
	// ============================================================================

	const setSelectedUser = (user: User | null): void => {
		chatLogger.debug('Setting selected user:', user);

		setState({ selectedUser: user });

		if (user) {
			// Reset messages and clear unread for the opened chat
			setState({
				messages: [],
				users: clearUnreadCountForUser(state.users, user._id),
			});

			// Reset pagination cursor for this conversation
			const cursors = { ...state.messageCursors };
			cursors[user._id] = { hasMore: true, oldestLoadedAt: undefined };
			setState({ messageCursors: cursors });
		}
	};

	const setUsers = (users: User[]): void => {
		const sortedUsers = sortUsersByRecentActivity(users);

		// Seed userStatuses with any lastSeen values from API
		const seededStatuses = { ...state.userStatuses };
		for (const user of users) {
			if (
				user._id &&
				user.lastSeen &&
				!seededStatuses[user._id]?.lastSeen
			) {
				seededStatuses[user._id] = {
					isOnline: seededStatuses[user._id]?.isOnline ?? false,
					lastSeen: user.lastSeen,
				};
			}
		}

		chatLogger.debug(
			'Setting users with unread counts:',
			users.map((u) => ({
				name: u.firstName || u.name || u.email,
				unreadCount: u.unreadCount,
				_id: u._id,
			})),
		);

		setState({
			users: sortedUsers,
			userStatuses: seededStatuses,
		});
	};

	const setMessages = (messages: Message[]): void => {
		setState({
			messages: dedupeAndSortMessages(messages),
		});

		// Update cursor for selected user
		const peerId = state.selectedUser?._id;
		if (peerId) {
			const oldest = messages[0]?.createdAt;
			const hasMore = Boolean(oldest); // Assume true until API returns empty
			const cursors = { ...state.messageCursors };
			cursors[peerId] = {
				hasMore,
				oldestLoadedAt: oldest,
			};
			setState({ messageCursors: cursors });
		}
	};

	// Helper to remove a message locally by id
	const removeMessageById = (messageId: string): void => {
		setState({
			messages: state.messages.filter((m) => m._id !== messageId),
		});
	};

	const addMessage = (message: Message): void => {
		const messageId = String(message._id);

		// Check if message was already processed to prevent duplicates
		if (processedMessageIds.has(messageId)) {
			chatLogger.debug(
				'Skipping duplicate message in addMessage:',
				messageId,
			);
			return;
		}
		processedMessageIds.add(messageId);

		const next = dedupeAndSortMessages([...state.messages, message]);

		setState({ messages: next });

		// Update user's last message for sidebar reordering
		const updatedUsers = updateUserLastMessage(
			state.users,
			message.senderId,
			message,
		);
		const reorderedUsers = sortUsersByRecentActivity(updatedUsers);

		setState({ users: reorderedUsers });

		logger.debug(
			`[ChatStore] Updated last message for user ${message.senderId}`,
			{ text: message.text, createdAt: message.createdAt },
		);
	};

	const handleIncomingMessage = (
		message: Message,
		currentUserId?: string,
	): void => {
		const messageId = String(message._id);

		// Prevent duplicate processing which leads to unread overcounting
		if (processedMessageIds.has(messageId)) {
			chatLogger.debug('Skipping duplicate message:', messageId);
			return;
		}
		processedMessageIds.add(messageId);

		// Determine the peer user for sidebar updates
		const senderId = String(message.senderId);
		const receiverId = String(message.receiverId);
		const me = currentUserId ? String(currentUserId) : undefined;
		const peerUserId = me && senderId === me ? receiverId : senderId;

		// Add message to current open conversation only if it belongs to it
		const isForOpenThread = state.selectedUser?._id === peerUserId;
		if (isForOpenThread) {
			const next = dedupeAndSortMessages([...state.messages, message]);
			setState({ messages: next });
		}

		// If message is inbound to me but the thread is NOT open, bump unread
		if (!isForOpenThread && me && receiverId === me) {
			const updatedUsers = incrementUnreadCountForUser(
				state.users,
				peerUserId,
			);
			setState({ users: updatedUsers });
		}

		// Update the peer's last message in the users list so the sidebar reorders
		// Only if the user exists in the sidebar (they should after sending/receiving messages)
		const userExists = state.users.some((u) => u._id === peerUserId);
		if (userExists) {
			const usersWithLastMessage = updateUserLastMessage(
				state.users,
				peerUserId,
				message,
			);
			const reorderedUsers =
				sortUsersByRecentActivity(usersWithLastMessage);
			setState({ users: reorderedUsers });

			logger.debug(
				`[ChatStore] Updated last message for user ${peerUserId}`,
				{ text: message.text, createdAt: message.createdAt },
			);
		} else {
			logger.debug(
				'[ChatStore] Received message from user not in sidebar',
				peerUserId,
			);
			// Could fetch user details here if needed, but this should be rare
		}
	};

	const markMessagesAsRead = async (
		senderId: string,
		receiverId?: string,
	): Promise<void> => {
		chatLogger.debug('Marking messages as read from:', senderId);

		try {
			await ChatApi.markMessagesAsRead(senderId);
			chatLogger.success('Messages marked as read');

			// Update message read status locally
			const updatedMessages = markMessagesAsReadLocally(
				state.messages,
				senderId,
				receiverId,
			);
			// Use deduplication for consistency (though shouldn't be needed here)
			setState({ messages: dedupeAndSortMessages(updatedMessages) });

			// Clear unread count for this sender
			const updatedUsers = receiverId
				? clearUnreadCountForUser(state.users, senderId)
				: clearUnreadCountForUser(state.users, senderId);

			setState({ users: updatedUsers });
		} catch (error: unknown) {
			chatLogger.error('Error marking messages as read:', error);
		}
	};

	const setUserTyping = (userId: string, isTyping: boolean): void => {
		const updatedTypingUsers = updateTypingUsers(
			state.typingUsers,
			userId,
			isTyping,
		);
		setState({ typingUsers: updatedTypingUsers });
	};

	const updateUserStatus = (
		userId: string,
		status: { isOnline: boolean; lastSeen: string },
	): void => {
		setState({
			userStatuses: {
				...state.userStatuses,
				[userId]: status,
			},
		});
	};

	const setUsersLoading = (loading: boolean): void => {
		setState({ isUsersLoading: loading });
	};

	const setMessagesLoading = (loading: boolean): void => {
		setState({ isMessagesLoading: loading });
	};

	const setSendingMessage = (loading: boolean): void => {
		setState({ isSendingMessage: loading });
	};

	// ============================================================================
	// API METHODS
	// ============================================================================

	const getUsers = async (): Promise<void> => {
		chatLogger.debug('Fetching users...');
		setUsersLoading(true);

		try {
			const users = await ChatApi.getConversationUsers();
			chatLogger.success('Users fetched:', users);
			setUsers(users);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error
					? error.message
					: Features.Chat.CHAT_TOAST_MESSAGES.FETCH_ERROR;
			chatLogger.error('Error fetching users:', error);
			toast.error(errorMessage);
		} finally {
			setUsersLoading(false);
		}
	};
	const getUserById = async (userId: string): Promise<User | null> => {
		chatLogger.debug('Fetching user by ID:', userId);

		try {
			const user = await ChatApi.getUserById(userId);
			chatLogger.success('User fetched by ID:', user);

			// Add the user to the users list if not already present
			const currentUsers = state.users;
			const existingUser = currentUsers.find((u) => u._id === userId);

			if (!existingUser) {
				const updatedUsers = [user, ...currentUsers];
				setUsers(updatedUsers);
			}

			return user;
		} catch (error: unknown) {
			chatLogger.error('Error fetching user by ID:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: Features.Chat.CHAT_TOAST_MESSAGES.FETCH_ERROR;
			toast.error(errorMessage);
			return null;
		}
	};
	const getMessages = async (userId: string): Promise<void> => {
		chatLogger.debug('Fetching messages for user:', userId);

		// Ensure we're only loading messages for the currently selected user
		if (state.selectedUser?._id !== userId) {
			logger.debug(
				'[ChatStore] Ignoring messages fetch for non-selected user',
				userId,
			);
			return;
		}

		setMessagesLoading(true);

		try {
			const messages = await ChatApi.getMessages(userId, { limit: 30 });
			logger.debug('[ChatStore] Messages fetched for user', {
				userId,
				count: messages.length,
			});

			// Double-check the user is still selected before setting messages
			if (state.selectedUser?._id === userId) {
				setMessages(messages);
			} else {
				logger.debug(
					'[ChatStore] User changed during fetch, ignoring messages for',
					userId,
				);
			}
		} catch (error: unknown) {
			chatLogger.error('Error fetching messages:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: Features.Chat.CHAT_TOAST_MESSAGES.FETCH_ERROR;
			toast.error(errorMessage);
		} finally {
			setMessagesLoading(false);
		}
	};
	const loadOlderMessages = async (): Promise<Message[]> => {
		const peerId = state.selectedUser?._id;
		if (!peerId) return [] as Message[];

		const cursor = state.messageCursors[peerId];
		if (cursor && cursor.hasMore === false) return [] as Message[];

		const oldest = state.messages[0]?.createdAt;

		try {
			const older = await ChatApi.getMessages(peerId, {
				before: oldest,
				limit: 30,
			});

			if (older.length === 0) {
				// No more messages to load
				const cursors = { ...state.messageCursors };
				cursors[peerId] = {
					hasMore: false,
					oldestLoadedAt: oldest,
				};
				setState({ messageCursors: cursors });
				return [] as Message[];
			}

			// Prepend older messages maintaining ascending order with de-duplication
			const newMessages = dedupeAndSortMessages([
				...older,
				...state.messages,
			]);

			setState({ messages: newMessages });

			// Update cursor
			const cursors = { ...state.messageCursors };
			cursors[peerId] = {
				hasMore: true,
				oldestLoadedAt: newMessages[0]?.createdAt,
			};
			setState({ messageCursors: cursors });

			return older as Message[];
		} catch (error) {
			chatLogger.error('Error loading older messages', error);
			return [] as Message[];
		}
	};

	const sendMessage = async (messageData: SendMessageData): Promise<void> => {
		if (!state.selectedUser) {
			chatLogger.error('No selected user');
			return;
		}

		logger.debug('[ChatStore] Sending message to', {
			userId: state.selectedUser._id,
			messageData,
		});

		setSendingMessage(true);

		try {
			const newMessage = await ChatApi.sendMessage(
				state.selectedUser._id,
				messageData,
			);
			chatLogger.success('Message sent:', newMessage);
			logger.debug(
				'[ChatStore] Current processed IDs before add',
				Array.from(processedMessageIds),
			);

			// Store sent message ID to prevent duplicate when socket echoes it back
			processedMessageIds.add(String(newMessage._id));
			logger.debug(
				'[ChatStore] Added message ID to processed',
				String(newMessage._id),
			);

			// Add message to current conversation immediately for better UX - use deduplication
			const updatedMessages = dedupeAndSortMessages([
				...state.messages,
				newMessage,
			]);
			setState({ messages: updatedMessages });
			logger.debug('[ChatStore] Messages after send', {
				count: updatedMessages.length,
			});

			// Ensure the selected user is in the users list (for new conversations)
			const existingUser = state.users.find(
				(u) => u._id === state.selectedUser!._id,
			);
			if (!existingUser) {
				logger.debug(
					'[ChatStore] Adding new user to sidebar',
					state.selectedUser!._id,
				);
				const updatedUsers = [
					{
						...state.selectedUser!,
						lastMessage: {
							text: newMessage.text || '',
							createdAt: newMessage.createdAt,
							senderId: newMessage.senderId,
						},
						unreadCount: 0,
					},
					...state.users,
				];
				setState({ users: updatedUsers });
			} else {
				// Update existing user's last message
				const updatedUsers = updateUserLastMessage(
					state.users,
					state.selectedUser._id,
					newMessage,
				);
				const reorderedUsers = sortUsersByRecentActivity(updatedUsers);
				setState({ users: reorderedUsers });
			}
		} catch (error: unknown) {
			chatLogger.error('Error sending message:', error);
			const errorMessage =
				error instanceof Error
					? error.message
					: Features.Chat.CHAT_TOAST_MESSAGES.SEND_ERROR;
			toast.error(errorMessage);
		} finally {
			setSendingMessage(false);
		}
	};

	const deleteMessage = async (messageId: string): Promise<void> => {
		try {
			await ChatApi.deleteMessage(messageId);
			removeMessageById(messageId);
		} catch (error) {
			toast.error(Features.Chat.CHAT_TOAST_MESSAGES.DELETE_ERROR);
			throw error as Error;
		}
	}; // ============================================================================
	// RETURN STORE API
	// ============================================================================

	return {
		// State getters
		...getState(),
		subscribe,
		getState,

		// State actions
		setSelectedUser,
		setUsers,
		setMessages,
		addMessage,
		handleIncomingMessage,
		markMessagesAsRead: markMessagesAsRead,
		setUserTyping,
		updateUserStatus,
		setUsersLoading,
		setMessagesLoading,
		setSendingMessage,

		// API methods
		getUsers,
		getUserById,
		getMessages,
		loadOlderMessages,
		sendMessage,
		deleteMessage,

		// Debug methods (only in development)
		debugDuplicates,
	};
};

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const chatStore = createChatStore();

// Expose debug function globally for development
if (typeof window !== 'undefined') {
	(
		window as unknown as {
			chatStoreDebug: typeof chatStore.debugDuplicates;
		}
	).chatStoreDebug = chatStore.debugDuplicates;
}
