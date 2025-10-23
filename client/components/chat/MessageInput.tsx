'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { isValidMessageContent } from './utils/messageUtils';
import { isEnterKeyPress } from './utils/keyboardUtils';
import TypingIndicator from './TypingIndicator';
import { ButtonLoader } from '@/components/ui/LoadingSpinner';
import { ChatApi } from '@/lib/api/chatApi';
import { CHAT_TEXT } from '@/lib/constants/text';
import { logger } from '@/lib/utils/logger';

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

type AttachmentType = 'image' | 'pdf' | 'doc' | 'docx' | 'file';

const inferAttachmentType = (mime: string): AttachmentType => {
	const m = mime.toLowerCase();
	if (m.startsWith('image/')) return 'image';
	if (m.includes('pdf')) return 'pdf';
	// Only treat true Word docs as doc/docx; other Office docs map to 'file'
	if (m.includes('msword')) return 'doc';
	if (m.includes('officedocument.word')) return 'docx';
	return 'file';
};

// ============================================================================
// PURE UTILITY FUNCTIONS
// ============================================================================

/**
 * Get appropriate placeholder text based on user selection
 */
const getPlaceholderText = (
	selectedUser: unknown,
	customPlaceholder?: string,
): string => {
	if (customPlaceholder) return customPlaceholder;
	return selectedUser ? CHAT_TEXT.typeMessage : CHAT_TEXT.selectUserToChat;
};

/**
 * Validate message content before sending
 */
const isValidMessage = (message: string, selectedUser: unknown): boolean => {
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
		className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
		aria-label={
			isSending ? CHAT_TEXT.sendingMessage : CHAT_TEXT.sendMessageButton
		}
	>
		{isSending ? <ButtonLoader /> : CHAT_TEXT.send}
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
				className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8] focus:border-transparent disabled:bg-gray-100 resize-none"
				disabled={disabled}
				maxLength={maxLength}
				autoComplete="off"
				aria-label={CHAT_TEXT.messageInput}
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
		const fileInputRef = useRef<HTMLInputElement | null>(null);
		const [isUploading, setIsUploading] = useState(false);

		const onPickFile = useCallback(() => fileInputRef.current?.click(), []);

		const handleFilesUpload = useCallback(
			async (files: File[]) => {
				if (files.length === 0 || !selectedUser) return;
				try {
					setIsUploading(true);
					const uploaded = await Promise.all(
						files.map((file) => ChatApi.uploadChatFile(file)),
					);
					const attachments = uploaded.map((data) => ({
						url: data.url,
						name: data.name,
						mime: data.mime,
						size: data.size,
						type: inferAttachmentType(data.mime),
					}));
					await sendMessage({ attachments });
				} catch (err) {
					logger.error('Failed to upload/send attachments', err);
				} finally {
					setIsUploading(false);
					if (fileInputRef.current) fileInputRef.current.value = '';
				}
			},
			[selectedUser, sendMessage],
		);

		const handleFileChange = useCallback(
			async (e: React.ChangeEvent<HTMLInputElement>) => {
				const files = e.target.files ? Array.from(e.target.files) : [];
				await handleFilesUpload(files);
			},
			[handleFilesUpload],
		);

		const onDrop = useCallback(
			async (e: React.DragEvent<HTMLDivElement>) => {
				e.preventDefault();
				const files = Array.from(e.dataTransfer.files || []);
				await handleFilesUpload(files);
			},
			[handleFilesUpload],
		);

		const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
			e.preventDefault();
		}, []);

		// ============================================================================
		// EFFECTS
		// ============================================================================

		/**
		 * Log selected user changes for debugging
		 */
		useEffect(() => {
			logger.debug(
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
					logger.error(
						'❌ Cannot submit - invalid message or no user selected',
					);
					return;
				}

				if (!selectedUser) {
					logger.error(
						'❌ MessageInput: Cannot send message - no user selected',
					);
					return;
				}

				try {
					await sendMessage({ text: message });
					setMessage('');
					stopTyping();
					logger.debug('✅ MessageInput: Message sent successfully');
				} catch (error) {
					logger.error(
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
					handleSubmit(e as unknown as React.FormEvent);
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
			<div
				className={`border-t bg-white ${className}`}
				onDrop={onDrop}
				onDragOver={onDragOver}
			>
				{/* Typing Indicator - Shows when other users are typing */}
				<TypingIndicator
					selectedUser={selectedUser}
					typingUsers={typingUsers}
				/>

				{/* Message Form */}
				<form onSubmit={handleSubmit} className="p-4">
					<div className="flex items-end space-x-2">
						{/* Hidden file input for attachments */}
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/*,application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,text/csv,application/csv,.ppt,application/vnd.ms-powerpoint,.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
							className="hidden"
							onChange={handleFileChange}
							disabled={isDisabled}
						/>
						<button
							type="button"
							onClick={onPickFile}
							disabled={isDisabled}
							className="px-3 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-600 hover:text-brand"
							aria-label="Add attachment"
						>
							{isUploading ? (
								<ButtonLoader />
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									className="w-5 h-5"
									aria-hidden
								>
									<path d="M21.44 11.05L12 20.5a6.5 6.5 0 01-9.19-9.19l9.43-9.43a4.5 4.5 0 116.36 6.36L9.41 17.32a2.5 2.5 0 11-3.54-3.54l7.78-7.78" />
								</svg>
							)}
						</button>
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
			</div>
		);
	},
);

MessageInput.displayName = 'MessageInput';

export default MessageInput;
