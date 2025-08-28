'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { api } from '@/lib/api';
import MessageBubble from './MessageBubble';
import {
	isMyMessage,
	isNearBottom,
	isNearTop,
	calculateScrollDelta,
} from './messageUtils';
import {
	NoConversationSelected,
	EmptyConversation,
	LoadingMessages,
} from './ui';
import TypingIndicator from './TypingIndicator';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Scroll to bottom button component
 */
const ScrollToBottomButton: React.FC<{
	onClick: () => void;
}> = ({ onClick }) => (
	<button
		onClick={onClick}
		className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
		title="Scroll to bottom"
	>
		<svg
			className="w-5 h-5"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M19 14l-7 7m0 0l-7-7m7 7V3"
			/>
		</svg>
	</button>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Main chat messages component that handles:
 * - Message rendering and scrolling
 * - Auto-scroll to latest messages
 * - Infinite scroll for older messages
 * - Read receipts and typing indicators
 */
const ChatMessages: React.FC = () => {
	// ============================================================================
	// HOOKS & STATE
	// ============================================================================

	const {
		messages,
		selectedUser,
		isMessagesLoading,
		getMessages,
		loadOlderMessages,
		typingUsers,
	} = useChat();

	const { user } = useAuth();
	const { socket } = useSocket();

	// Refs for scroll management
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	// Auto-scroll state
	const [shouldAutoScroll, setShouldAutoScroll] = React.useState(true);

	// Current user ID for message ownership
	const currentUserId = user?._id || user?.id;

	// ============================================================================
	// SCROLL MANAGEMENT
	// ============================================================================

	/**
	 * Smooth scroll to bottom of messages
	 */
	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	/**
	 * Handle scroll events to:
	 * - Determine if user has scrolled up (disable auto-scroll)
	 * - Trigger infinite scroll when near top
	 */
	const handleScroll = useCallback(async () => {
		const container = messagesContainerRef.current;
		if (!container) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const nearBottom = isNearBottom(
			scrollTop,
			scrollHeight,
			clientHeight,
			100,
		);

		setShouldAutoScroll(nearBottom);

		// Infinite scroll: load older when near top
		if (isNearTop(scrollTop, 24) && selectedUser?._id) {
			const prevHeight = container.scrollHeight;
			const prevScrollTop = container.scrollTop;

			const older = await loadOlderMessages();
			if (older && older.length > 0) {
				// Preserve viewport by adjusting scrollTop by height delta
				const newHeight = container.scrollHeight;
				container.scrollTop = calculateScrollDelta(
					prevHeight,
					newHeight,
					prevScrollTop,
				);
			}
		}
	}, [selectedUser?._id, loadOlderMessages]);

	// ============================================================================
	// EFFECTS
	// ============================================================================

	/**
	 * Fetch messages when a user is selected
	 */
	useEffect(() => {
		if (selectedUser?._id) {
			console.log(
				'📱 ChatMessages: Loading messages for user:',
				selectedUser._id,
			);
			getMessages(selectedUser._id);
			setShouldAutoScroll(true);
		}
	}, [selectedUser?._id, getMessages]);

	/**
	 * Auto-scroll to latest messages after loading completes
	 */
	useEffect(() => {
		if (selectedUser?._id && !isMessagesLoading) {
			setShouldAutoScroll(true);
			// Wait for DOM to paint, then jump without animation to avoid flicker
			requestAnimationFrame(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
			});
		}
	}, [selectedUser?._id, isMessagesLoading]);

	/**
	 * Auto-scroll when new messages arrive (if user is near bottom)
	 */
	useEffect(() => {
		if (shouldAutoScroll) {
			scrollToBottom();
		}
	}, [messages, scrollToBottom, shouldAutoScroll]);

	/**
	 * Mark messages as read when user opens chat
	 */
	useEffect(() => {
		const markAsRead = async () => {
			if (selectedUser?._id && messages.length > 0) {
				try {
					await api.put(`/message/read/${selectedUser._id}`);
				} catch (error) {
					console.error('Error marking messages as read:', error);
				}
			}
		};

		markAsRead();
	}, [selectedUser?._id, messages.length]);

	/**
	 * Listen for read receipts from other users
	 */
	useEffect(() => {
		if (!socket) return;

		const handleMessagesRead = (data: {
			readBy: string;
			senderId: string;
		}) => {
			console.log('Messages read by:', data.readBy);
			// You can update the UI to show read receipts here
		};

		socket.on('messagesRead', handleMessagesRead);

		return () => {
			socket.off('messagesRead', handleMessagesRead);
		};
	}, [socket]);

	// ============================================================================
	// COMPUTED VALUES
	// ============================================================================

	/**
	 * Memoized message list to prevent unnecessary re-renders
	 */
	const renderedMessages = useMemo(() => {
		return messages.map((message) => (
			<MessageBubble
				key={message._id}
				message={message}
				isMyMessage={isMyMessage(message, currentUserId)}
			/>
		));
	}, [messages, currentUserId]);

	// ============================================================================
	// RENDER LOGIC
	// ============================================================================

	// No user selected - show welcome message
	if (!selectedUser) {
		return <NoConversationSelected />;
	}

	// Loading messages - show spinner
	if (isMessagesLoading) {
		return <LoadingMessages />;
	}

	// ============================================================================
	// MAIN RENDER
	// ============================================================================

	return (
		<div className="flex-1 flex flex-col bg-gray-50 h-full relative">
			{/* Messages container with scroll handling */}
			<div
				className="flex-1 overflow-y-auto py-4 min-h-0"
				ref={messagesContainerRef}
				onScroll={handleScroll}
			>
				{/* Empty state or messages */}
				{messages.length === 0 ? (
					<EmptyConversation selectedUser={selectedUser} />
				) : (
					<>
						{/* Render all messages */}
						{renderedMessages}

						{/* Typing indicator */}
						<TypingIndicator
							selectedUser={selectedUser}
							typingUsers={typingUsers}
						/>
					</>
				)}

				{/* Invisible element for scroll-to-bottom reference */}
				<div ref={messagesEndRef} />
			</div>

			{/* Scroll to bottom button - only show when auto-scroll is disabled */}
			{!shouldAutoScroll && messages.length > 0 && (
				<ScrollToBottomButton
					onClick={() => {
						setShouldAutoScroll(true);
						scrollToBottom();
					}}
				/>
			)}
		</div>
	);
};

export default ChatMessages;
