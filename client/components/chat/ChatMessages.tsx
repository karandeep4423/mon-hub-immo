'use client';

import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { api } from '@/lib/api';
import MessageBubble from './MessageBubble';
import { ImageLightbox } from '@/components/ui';
import { isMyMessage } from './utils/messageUtils';
import { groupMessagesByDate } from './utils/dateUtils';
import {
	isNearBottom,
	isNearTop,
	findBestAnchorMessage,
	restoreScrollPosition,
	debounce,
} from './utils/scrollUtils';
import {
	NoConversationSelected,
	EmptyConversation,
	LoadingMessages,
	LoadingOlderMessages,
	DateSeparator,
} from './ui';
import TypingIndicator from './TypingIndicator';
// import { CHAT_TEXT } from '@/lib/constants/text';

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
		className="absolute bottom-4 right-4 bg-[#00b4d8] hover:bg-[#0094b3] text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
		title="Défiler vers le bas"
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

	// Loading older messages state
	const [isLoadingOlder, setIsLoadingOlder] = React.useState(false);

	// Lightbox state for viewing images full-size
	const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
	const [lightboxImages, setLightboxImages] = React.useState<
		Array<{ url: string; alt?: string }>
	>([]);
	const [lightboxIndex, setLightboxIndex] = React.useState(0);

	// Scroll anchor managed locally during load; no state needed

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
	 * Enhanced scroll handler with improved position preservation
	 */
	const handleScroll = useCallback(async () => {
		const container = messagesContainerRef.current;
		if (!container || isLoadingOlder) return;

		const { scrollTop, scrollHeight, clientHeight } = container;
		const nearBottom = isNearBottom(
			scrollTop,
			scrollHeight,
			clientHeight,
			100,
		);

		setShouldAutoScroll(nearBottom);

		// Load older messages when near top - with better UX
		if (isNearTop(scrollTop, 50) && selectedUser?._id && !isLoadingOlder) {
			console.log('🔄 Loading older messages...');
			setIsLoadingOlder(true);

			// Find and store the current anchor message for scroll restoration
			const anchor = findBestAnchorMessage(container);
			if (anchor) {
				console.log('📍 Scroll anchor set:', anchor.messageId);
			}

			try {
				const older = await loadOlderMessages();
				if (older && older.length > 0) {
					console.log(`✅ Loaded ${older.length} older messages`);

					// Restore scroll position after DOM update
					requestAnimationFrame(() => {
						if (anchor && container) {
							restoreScrollPosition(container, anchor);
							console.log(
								'🎯 Scroll position restored to anchor:',
								anchor.messageId,
							);
						}
					});
				} else {
					console.log('📭 No more older messages to load');
				}
			} catch (error) {
				console.error('❌ Error loading older messages:', error);
			} finally {
				setIsLoadingOlder(false);
			}
		}
	}, [selectedUser?._id, loadOlderMessages, isLoadingOlder]);

	// Debounced version of scroll handler to prevent excessive calls
	const debouncedHandleScroll = React.useMemo(
		() => debounce(handleScroll, 100),
		[handleScroll],
	);

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
			setIsLoadingOlder(false); // Reset loading state for new conversation
		} else {
			console.log('📱 ChatMessages: No user selected, clearing messages');
			setIsLoadingOlder(false);
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

	// Build image list for current conversation whenever messages change
	useEffect(() => {
		const imgs: Array<{ url: string; alt?: string }> = [];
		for (const msg of messages) {
			if (msg.image) imgs.push({ url: msg.image, alt: 'Image' });
			if (Array.isArray(msg.attachments)) {
				for (const att of msg.attachments) {
					if (att.type === 'image' && att.url) {
						imgs.push({ url: att.url, alt: att.name });
					}
				}
			}
		}
		setLightboxImages(imgs);
	}, [messages]);

	// Open lightbox for a clicked image URL
	const openImageLightbox = React.useCallback(
		(imageUrl: string) => {
			const idx = lightboxImages.findIndex((i) => i.url === imageUrl);
			setLightboxIndex(idx >= 0 ? idx : 0);
			setIsLightboxOpen(true);
		},
		[lightboxImages],
	);

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
	 * Memoized message list grouped by date to prevent unnecessary re-renders
	 */
	const renderedMessages = useMemo(() => {
		// Group messages by date
		const messageGroups = groupMessagesByDate(messages);

		// Render each group with date separator
		return messageGroups.map((group) => (
			<React.Fragment key={group.date.toISOString()}>
				{/* Date separator */}
				<DateSeparator dateText={group.dateKey} />

				{/* Messages for this date */}
				{group.messages.map((message) => (
					<MessageBubble
						key={message._id}
						message={message}
						isMyMessage={isMyMessage(message, currentUserId)}
						onImageClick={openImageLightbox}
					/>
				))}
			</React.Fragment>
		));
	}, [messages, currentUserId, openImageLightbox]);

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
				onScroll={debouncedHandleScroll}
			>
				{/* Loading indicator for older messages */}
				<LoadingOlderMessages isLoading={isLoadingOlder} />

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

			{/* Full-screen image lightbox */}
			<ImageLightbox
				isOpen={isLightboxOpen}
				images={lightboxImages}
				initialIndex={lightboxIndex}
				onClose={() => setIsLightboxOpen(false)}
			/>
		</div>
	);
};

export default ChatMessages;
