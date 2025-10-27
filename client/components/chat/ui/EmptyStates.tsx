'use client';

import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getUserDisplayName } from '../utils/userUtils';
import { Features } from '@/lib/constants';

// ============================================================================
// EMPTY STATE COMPONENTS
// ============================================================================

interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
}

interface EmptyConversationProps {
	selectedUser: User | null;
	className?: string;
}

interface NoConversationSelectedProps {
	className?: string;
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

/**
 * Chat Icon
 */
const ChatIcon: React.FC<{ className?: string }> = React.memo(
	({ className = '' }) => (
		<svg
			className={`w-8 h-8 text-brand ${className}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
			/>
		</svg>
	),
);

ChatIcon.displayName = 'ChatIcon';

/**
 * Message Icon
 */
const MessageIcon: React.FC<{ className?: string }> = React.memo(
	({ className = '' }) => (
		<svg
			className={`w-8 h-8 text-brand ${className}`}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1M3 4h12v8H7l-4 4V4z"
			/>
		</svg>
	),
);

MessageIcon.displayName = 'MessageIcon';

// ============================================================================
// MAIN COMPONENTS
// ============================================================================

/**
 * NoConversationSelected Component
 *
 * Shows when no user is selected for chat
 */
export const NoConversationSelected: React.FC<NoConversationSelectedProps> =
	React.memo(({ className = '' }) => (
		<div
			className={`flex-1 flex items-center justify-center bg-gray-50 ${className}`}
		>
			<div className="text-center max-w-md mx-auto px-4">
				<div className="w-16 h-16 bg-[#e6f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
					<ChatIcon />
				</div>
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					Bienvenue dans le Chat
				</h3>
				<p className="text-gray-500">
					Sélectionnez une conversation dans la barre latérale pour
					commencer à discuter
				</p>
			</div>
		</div>
	));

NoConversationSelected.displayName = 'NoConversationSelected';

/**
 * EmptyConversation Component
 *
 * Shows when a user is selected but no messages exist
 */
export const EmptyConversation: React.FC<EmptyConversationProps> = React.memo(
	({ selectedUser, className = '' }) => {
		const displayName = selectedUser
			? getUserDisplayName(selectedUser)
			: 'this user';

		return (
			<div
				className={`flex-1 flex items-center justify-center ${className}`}
			>
				<div className="text-center max-w-md mx-auto px-4">
					<div className="w-16 h-16 bg-[#e6f7ff] rounded-full flex items-center justify-center mx-auto mb-4">
						<MessageIcon />
					</div>
					<h3 className="text-lg font-semibold text-gray-700 mb-2">
						Aucun message pour le moment
					</h3>
					<p className="text-gray-500">
						Commencez une conversation avec {displayName}
					</p>
				</div>
			</div>
		);
	},
);

EmptyConversation.displayName = 'EmptyConversation';

/**
 * LoadingMessages Component
 *
 * Shows while messages are being fetched
 */
export const LoadingMessages: React.FC<{ className?: string }> = React.memo(
	({ className = '' }) => (
		<div
			className={`flex-1 flex items-center justify-center bg-gray-50 ${className}`}
		>
			<LoadingSpinner
				size="lg"
				message={Features.Chat.CHAT_UI_TEXT.loadingMessages}
			/>
		</div>
	),
);

LoadingMessages.displayName = 'LoadingMessages';

/**
 * LoadingUsers Component
 *
 * Shows while users are being fetched
 */
export const LoadingUsers: React.FC<{ className?: string }> = React.memo(
	({ className = '' }) => (
		<div
			className={`h-full bg-white border-r border-gray-200 flex items-center justify-center ${className}`}
		>
			<LoadingSpinner
				size="lg"
				message={Features.Chat.CHAT_UI_TEXT.loadingUsers}
			/>
		</div>
	),
);

LoadingUsers.displayName = 'LoadingUsers';
