'use client';

import React from 'react';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import ChatMessages from '@/components/chat/ChatMessages';
import MessageInput from '@/components/chat/MessageInput';
import { getDetailedUserPresenceText } from '@/components/chat/utils';
import { ChatUser } from '@/types/chat';

interface CollaborationChatProps {
	isOpen: boolean;
	selectedUser: ChatUser | null;
	onlineUsers: string[];
	onClose: () => void;
}

export const CollaborationChat: React.FC<CollaborationChatProps> = ({
	isOpen,
	selectedUser,
	onlineUsers,
	onClose,
}) => {
	if (!isOpen) return null;

	return (
		<>
			{/* Overlay */}
			<div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
			{/* Panel */}
			<div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-xl flex flex-col">
				{/* Panel header with peer info */}
				<div className="flex items-center gap-3 p-4 border-b">
					{selectedUser && (
						<>
							<ProfileAvatar
								user={selectedUser}
								size="sm"
								showOnlineStatus={true}
								isOnline={onlineUsers.includes(
									selectedUser._id,
								)}
							/>
							<div className="min-w-0">
								<div className="font-medium truncate">
									{selectedUser.firstName &&
									selectedUser.lastName
										? `${selectedUser.firstName} ${selectedUser.lastName}`
										: selectedUser.email}
								</div>
								<div className="text-xs text-gray-500 truncate">
									{getDetailedUserPresenceText(
										selectedUser,
										onlineUsers,
										{},
										[selectedUser],
									)}
								</div>
							</div>
						</>
					)}
					<button
						onClick={onClose}
						className="ml-auto p-2 hover:bg-gray-100 rounded"
						aria-label="Fermer"
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
								strokeWidth="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Chat body */}
				<div className="flex-1 min-h-0 flex flex-col">
					<div className="flex-1 min-h-0 overflow-hidden">
						<ChatMessages />
					</div>
					<div className="flex-shrink-0 border-t">
						<MessageInput />
					</div>
				</div>
			</div>
		</>
	);
};
