'use client';

import React from 'react';
import { ReadReceipt } from './MessageStatus';
import { MessageTime } from './ui';
import { formatTimeOnly } from './utils/messageUtils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Message {
	_id: string;
	senderId: string;
	receiverId: string;
	text?: string;
	image?: string;
	createdAt: string;
	isRead?: boolean;
	readAt?: string;
}

interface MessageBubbleProps {
	/** Message object to display */
	message: Message;
	/** Whether this message was sent by the current user */
	isMyMessage: boolean;
	/** Optional custom styling classes */
	className?: string;
}

interface MessageContentProps {
	/** Message text content */
	text?: string;
	/** Message image URL */
	image?: string;
}

interface MessageFooterProps {
	/** Message creation timestamp */
	createdAt: string;
	/** Whether this is the current user's message */
	isMyMessage: boolean;
	/** Whether the message has been read */
	isRead?: boolean;
}

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get bubble styling classes based on message ownership
 */
const getBubbleClasses = (isMyMessage: boolean): string => {
	const baseClasses =
		'max-w-[70%] sm:max-w-[85%] rounded-lg px-4 py-2 shadow-sm';

	if (isMyMessage) {
		return `${baseClasses} bg-[#00b4d8] text-white rounded-br-sm`;
	}

	return `${baseClasses} bg-white text-gray-800 border border-gray-200 rounded-bl-sm`;
};

/**
 * Get container alignment classes based on message ownership
 */
const getContainerClasses = (isMyMessage: boolean): string => {
	return `flex ${isMyMessage ? 'justify-end' : 'justify-start'} mb-4 px-4`;
};

/**
 * Handle image click events
 */
const handleImageClick = (imageUrl: string): void => {
	// Could implement image preview/modal here
	console.log('Image clicked:', imageUrl);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Message text content with proper formatting
 */
const MessageText: React.FC<{ text: string }> = React.memo(({ text }) => (
	<p className="text-sm leading-relaxed break-words">{text}</p>
));

MessageText.displayName = 'MessageText';

/**
 * Message image with loading and interaction
 */
const MessageImage: React.FC<{
	imageUrl: string;
	altText?: string;
}> = React.memo(({ imageUrl, altText = 'Message attachment' }) => (
	<img
		src={imageUrl}
		alt={altText}
		className="max-w-full h-auto rounded mt-2 cursor-pointer hover:opacity-90 transition-opacity"
		onClick={() => handleImageClick(imageUrl)}
		loading="lazy"
	/>
));

MessageImage.displayName = 'MessageImage';

/**
 * Message content container for text and/or images
 */
const MessageContent: React.FC<MessageContentProps> = React.memo(
	({ text, image }) => (
		<>
			{text && <MessageText text={text} />}
			{image && <MessageImage imageUrl={image} />}
		</>
	),
);

MessageContent.displayName = 'MessageContent';

/**
 * Message footer with timestamp and read receipts
 */
const MessageFooter: React.FC<MessageFooterProps> = React.memo(
	({ createdAt, isMyMessage, isRead }) => (
		<div className="flex items-center justify-end mt-1 space-x-1">
			<MessageTime
				timestamp={createdAt}
				isMyMessage={isMyMessage}
				format={formatTimeOnly}
			/>

			{/* Show read receipts only for sent messages */}
			{isMyMessage && (
				<ReadReceipt
					isRead={Boolean(isRead)}
					colorClass="text-white/70"
				/>
			)}
		</div>
	),
);

MessageFooter.displayName = 'MessageFooter';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MessageBubble Component
 *
 * Renders an individual message bubble with:
 * - Proper alignment based on sender
 * - Text and/or image content
 * - Timestamp display
 * - Read receipt indicators
 * - Responsive design
 * - Optimized with React.memo for performance
 *
 * Features:
 * - WhatsApp-style design
 * - Rounded corners with sender-specific styling
 * - Image preview capabilities
 * - Accessibility support
 * - Mobile-responsive layout
 *
 * @param message - Message object containing all message data
 * @param isMyMessage - Whether this message was sent by current user
 * @param className - Optional custom styling classes
 */
const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
	({ message, isMyMessage, className = '' }) => {
		const containerClasses = getContainerClasses(isMyMessage);
		const bubbleClasses = getBubbleClasses(isMyMessage);

		return (
			<div
				className={`${containerClasses} ${className}`}
				data-message-id={message._id}
			>
				<div className={bubbleClasses}>
					<MessageContent text={message.text} image={message.image} />

					<MessageFooter
						createdAt={message.createdAt}
						isMyMessage={isMyMessage}
						isRead={message.isRead}
					/>
				</div>
			</div>
		);
	},
);

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
