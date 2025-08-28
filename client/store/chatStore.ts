import { api } from '@/lib/api';
import { toast } from 'react-toastify';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface User {
	firstName?: string;
	lastName?: string;
	_id: string;
	name?: string;
	email: string;
	lastMessage?: {
		text: string;
		createdAt: string;
		senderId: string;
	} | null;
	unreadCount?: number;
	isOnline?: boolean;
	lastSeen?: string;
	isTyping?: boolean;
}

export interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	text?: string;
	image?: string;
	createdAt: string;
	isRead?: boolean;
	readAt?: string;
}

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
	markMessagesAsRead: (senderId: string, receiverId?: string) => void;
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
	getMessages: (userId: string) => Promise<void>;
	loadOlderMessages: () => Promise<Message[]>;
	sendMessage: (messageData: {
		text?: string;
		image?: string;
	}) => Promise<void>;
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

	// Keep only the first occurrence of each message ID
	for (const message of messages) {
		const id = String(message._id);
		if (!byId.has(id)) byId.set(id, message);
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
 * Update user's last message in users array
 */
const updateUserLastMessage = (
	users: User[],
	userId: string,
	message: Message,
): User[] => {
	return users.map((user) => {
		if (user._id === userId) {
			return {
				...user,
				lastMessage: {
					text: message.text || '',
					createdAt: message.createdAt,
					senderId: message.senderId,
				},
			};
		}
		return user;
	});
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
	let processedMessageIds = new Set<string>();

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
		console.log('📝 ChatStore: Setting selected user:', user);

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

		console.log(
			'📊 ChatStore: Setting users with unread counts:',
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

	const addMessage = (message: Message): void => {
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

		console.log(
			`📝 Updated last message for user ${message.senderId}: "${message.text}" at ${message.createdAt}`,
		);
	};

	const handleIncomingMessage = (
		message: Message,
		currentUserId?: string,
	): void => {
		const messageId = String(message._id);

		// Prevent duplicate processing which leads to unread overcounting
		if (processedMessageIds.has(messageId)) {
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
		const usersWithLastMessage = updateUserLastMessage(
			state.users,
			peerUserId,
			message,
		);
		const reorderedUsers = sortUsersByRecentActivity(usersWithLastMessage);
		setState({ users: reorderedUsers });
	};

	const markMessagesAsRead = (
		senderId: string,
		receiverId?: string,
	): void => {
		// Update message read status locally
		const updatedMessages = markMessagesAsReadLocally(
			state.messages,
			senderId,
			receiverId,
		);
		setState({ messages: updatedMessages });

		// Clear unread count for this sender
		const updatedUsers = receiverId
			? clearUnreadCountForUser(state.users, senderId)
			: clearUnreadCountForUser(state.users, senderId);

		setState({ users: updatedUsers });
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
		console.log('🔍 ChatStore: Fetching users...');
		setUsersLoading(true);

		try {
			const res = await api.get('/message/users');
			console.log('✅ ChatStore: Users fetched:', res.data);
			setUsers(res.data);
		} catch (error: any) {
			console.error('❌ ChatStore: Error fetching users:', error);
			toast.error(
				error.response?.data?.message || 'Error fetching users',
			);
		} finally {
			setUsersLoading(false);
		}
	};

	const getMessages = async (userId: string): Promise<void> => {
		console.log('🔍 ChatStore: Fetching messages for user:', userId);
		setMessagesLoading(true);

		try {
			const res = await api.get(`/message/${userId}`, {
				params: { limit: 30 },
			});
			console.log('✅ ChatStore: Messages fetched:', res.data);
			setMessages(res.data);
		} catch (error: any) {
			console.error('❌ ChatStore: Error fetching messages:', error);
			toast.error(
				error.response?.data?.message || 'Error fetching messages',
			);
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
			const res = await api.get(`/message/${peerId}`, {
				params: { before: oldest, limit: 30 },
			});

			const older: Message[] = res.data || [];
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
			console.error('Error loading older messages', error);
			return [] as Message[];
		}
	};

	const sendMessage = async (messageData: {
		text?: string;
		image?: string;
	}): Promise<void> => {
		if (!state.selectedUser) {
			console.error('❌ ChatStore: No selected user');
			return;
		}

		console.log(
			'📤 ChatStore: Sending message:',
			messageData,
			'to:',
			state.selectedUser._id,
		);

		setSendingMessage(true);

		try {
			const res = await api.post(
				`/message/send/${state.selectedUser._id}`,
				messageData,
			);
			console.log('✅ ChatStore: Message sent:', res.data);
		} catch (error: any) {
			console.error('❌ ChatStore: Error sending message:', error);
			toast.error(
				error.response?.data?.message || 'Error sending message',
			);
		} finally {
			setSendingMessage(false);
		}
	};

	// ============================================================================
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
		markMessagesAsRead,
		setUserTyping,
		updateUserStatus,
		setUsersLoading,
		setMessagesLoading,
		setSendingMessage,

		// API methods
		getUsers,
		getMessages,
		loadOlderMessages,
		sendMessage,
	};
};

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const chatStore = createChatStore();
