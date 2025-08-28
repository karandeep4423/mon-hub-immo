'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useChat } from '../../hooks/useChat';
import { isValidMessageContent, isEnterKeyPress } from './messageUtils';
import TypingIndicator from './TypingIndicator';
import MessageStatus from './MessageStatus';
import { ButtonSpinner } from './ui';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MessageInputProps {
	/** Custom styling classes */
	className?: string;
	/** Maximum message length */
	maxLength?: number;
	/** Custom placeholder text */
	placeholder?: string;
}

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get appropriate placeholder text based on user selection
 */
const getPlaceholderText = (
	selectedUser: any,
	customPlaceholder?: string,
): string => {
	if (customPlaceholder) return customPlaceholder;
	return selectedUser
		? 'Type a message...'
		: 'Select a user to start chatting';
};

/**
 * Validate message content before sending
 */
const isValidMessage = (message: string, selectedUser: any): boolean => {
	return Boolean(selectedUser && isValidMessageContent(message));
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Send button with loading state
 */
const SendButton: React.FC<{
	isDisabled: boolean;
	isSending: boolean;
	onClick: () => void;
}> = React.memo(({ isDisabled, isSending, onClick }) => (
	<button
		type="submit"
		disabled={isDisabled}
		onClick={onClick}
		className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
		aria-label={isSending ? 'Sending message...' : 'Send message'}
	>
		{isSending ? <ButtonSpinner /> : 'Send'}
	</button>
));

SendButton.displayName = 'SendButton';

/**
 * Message input field with typing detection
 */
const MessageInputField: React.FC<{
	value: string;
	onChange: (value: string) => void;
	onKeyPress: (event: React.KeyboardEvent) => void;
	placeholder: string;
	disabled: boolean;
	maxLength: number;
}> = React.memo(
	({ value, onChange, onKeyPress, placeholder, disabled, maxLength }) => (
		<div className="flex-1 relative">
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				onKeyPress={onKeyPress}
				placeholder={placeholder}
				className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 resize-none"
				disabled={disabled}
				maxLength={maxLength}
				autoComplete="off"
				aria-label="Message input"
			/>
			{maxLength && (
				<div className="absolute -bottom-5 right-0 text-xs text-gray-400">
					{value.length}/{maxLength}
				</div>
			)}
		</div>
	),
);

MessageInputField.displayName = 'MessageInputField';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MessageInput Component
 *
 * Comprehensive message input interface that handles:
 * - Real-time typing indicators
 * - Message composition and sending
 * - User status display
 * - Keyboard shortcuts (Enter to send)
 * - Message validation
 * - Loading states
 * - Character count
 *
 * @param className - Custom styling classes
 * @param maxLength - Maximum message length (default: 1000)
 * @param placeholder - Custom placeholder text for message input
 */
const MessageInput: React.FC<MessageInputProps> = React.memo(
	({ className = '', maxLength = 1000, placeholder }) => {
		// ============================================================================
		// HOOKS & STATE
		// ============================================================================

		const {
			sendMessage,
			selectedUser,
			isSendingMessage,
			handleTyping,
			stopTyping,
			typingUsers,
		} = useChat();

		const [message, setMessage] = useState('');

		// ============================================================================
		// EFFECTS
		// ============================================================================

		/**
		 * Log selected user changes for debugging
		 */
		useEffect(() => {
			console.log(
				'💬 MessageInput: Selected user changed:',
				selectedUser?.firstName ||
					selectedUser?.name ||
					selectedUser?.email ||
					'None',
			);
		}, [selectedUser]);

		// ============================================================================
		// HANDLERS
		// ============================================================================

		/**
		 * Handle form submission
		 */
		const handleSubmit = useCallback(
			async (e: React.FormEvent) => {
				e.preventDefault();

				if (!isValidMessage(message, selectedUser)) {
					console.error(
						'❌ Cannot submit - invalid message or no user selected',
					);
					return;
				}

				if (!selectedUser) {
					console.error(
						'❌ MessageInput: Cannot send message - no user selected',
					);
					return;
				}

				try {
					await sendMessage({ text: message });
					setMessage('');
					stopTyping();
					console.log('✅ MessageInput: Message sent successfully');
				} catch (error) {
					console.error(
						'❌ MessageInput: Failed to send message:',
						error,
					);
				}
			},
			[message, selectedUser, sendMessage, stopTyping],
		);

		/**
		 * Handle input changes with typing detection
		 */
		const handleInputChange = useCallback(
			(value: string) => {
				setMessage(value);

				if (value.trim()) {
					handleTyping();
				} else {
					stopTyping();
				}
			},
			[handleTyping, stopTyping],
		);

		/**
		 * Handle keyboard shortcuts
		 */
		const handleKeyPress = useCallback(
			(e: React.KeyboardEvent) => {
				if (isEnterKeyPress(e)) {
					e.preventDefault();
					handleSubmit(e as any);
				}
			},
			[handleSubmit],
		);

		/**
		 * Handle send button click
		 */
		const handleSendClick = useCallback(() => {
			const syntheticEvent = {
				preventDefault: () => {},
			} as React.FormEvent;
			handleSubmit(syntheticEvent);
		}, [handleSubmit]);

		// ============================================================================
		// COMPUTED VALUES
		// ============================================================================

		const placeholderText = getPlaceholderText(selectedUser, placeholder);
		const isDisabled = !selectedUser || isSendingMessage;
		const canSend =
			isValidMessage(message, selectedUser) && !isSendingMessage;

		// ============================================================================
		// RENDER
		// ============================================================================

		return (
			<div className={`border-t bg-white ${className}`}>
				{/* Typing Indicator - Shows when other users are typing */}
				<TypingIndicator
					selectedUser={selectedUser}
					typingUsers={typingUsers}
				/>

				{/* Message Form */}
				<form onSubmit={handleSubmit} className="p-4">
					<div className="flex items-end space-x-2">
						<MessageInputField
							value={message}
							onChange={handleInputChange}
							onKeyPress={handleKeyPress}
							placeholder={placeholderText}
							disabled={isDisabled}
							maxLength={maxLength}
						/>

						<SendButton
							isDisabled={!canSend}
							isSending={isSendingMessage}
							onClick={handleSendClick}
						/>
					</div>
				</form>

				{/* Status Display - Shows user status and chat readiness */}
				<MessageStatus selectedUser={selectedUser} />
			</div>
		);
	},
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
