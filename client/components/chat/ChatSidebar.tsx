'use client';

import React, { useEffect, useState } from 'react';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../context/SocketContext';
import { getUserDisplayName, formatLastSeen } from './utils/userUtils';
import { formatMessageTime, truncateMessage } from './utils/messageUtils';
import { LoadingUsers, UnreadBadge } from './ui';
import { ProfileAvatar } from '../ui';
import { CHAT_TEXT } from '@/lib/constants/text';
import type { ChatUser, ChatMessage } from '@/types/chat';
import { logger } from '@/lib/utils/logger';

interface ChatSidebarProps {
	onClose?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onClose }) => {
	const {
		users,
		isUsersLoading,
		getUsers,
		selectedUser,
		setSelectedUser,
		userStatuses,
	} = useChat();
	const { onlineUsers } = useSocket();
	const [searchQuery, setSearchQuery] = useState('');

	useEffect(() => {
		getUsers();
	}, [getUsers]);

	const handleUserSelect = (user: ChatUser) => {
		setSelectedUser(user);
		if (onClose) onClose();
	};

	// All utility functions moved to messageUtils - using imports now

	const formatLastMessage = (
		lastMessage?: ChatMessage | ChatUser['lastMessage'],
	) => {
		if (!lastMessage) return CHAT_TEXT.noMessagesYet;
		return truncateMessage(lastMessage.text || '', 30);
	};

	const getLastSeenText = (userId: string, userObj?: ChatUser) => {
		const status = userStatuses[userId];
		const isOnline = onlineUsers.includes(userId);

		if (isOnline) {
			return CHAT_TEXT.online;
		}

		const effectiveLastSeen = status?.lastSeen || userObj?.lastSeen;
		if (!effectiveLastSeen) return CHAT_TEXT.offline;

		return formatLastSeen(effectiveLastSeen);
	};

	const filteredUsers = users.filter((user) => {
		const displayName = getUserDisplayName(user).toLowerCase();
		return displayName.includes(searchQuery.toLowerCase());
	});

	if (isUsersLoading) {
		return <LoadingUsers />;
	}

	return (
		<div className="h-full bg-white border-r border-gray-200 flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-gray-200">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-semibold text-gray-900">
						{CHAT_TEXT.title}
					</h2>
					<div className="flex items-center space-x-2">
						{/* Refresh button */}
						<button
							onClick={() => {
								logger.debug(
									'🔄 Manual refresh of conversations...',
								);
								getUsers();
							}}
							className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
							title="Rafraîchir les conversations"
						>
							<svg
								className="w-5 h-5 text-gray-600"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
						{onClose && (
							<button
								onClick={onClose}
								className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
							>
								<svg
									className="w-6 h-6"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						)}
					</div>
				</div>

				{/* Search bar */}
				<div className="relative">
					<input
						type="text"
						placeholder={CHAT_TEXT.searchUsers}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none"
					/>
					<svg
						className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>

			{/* Users list */}
			<div className="flex-1 overflow-y-auto">
				{filteredUsers.length === 0 ? (
					<div className="p-4 text-center text-gray-500">
						{searchQuery
							? CHAT_TEXT.noUsersFound
							: CHAT_TEXT.noConversation}
					</div>
				) : (
					<div className="divide-y divide-gray-200">
						{filteredUsers.map((user) => {
							const isOnline = onlineUsers.includes(user._id);
							const lastSeen = getLastSeenText(user._id, user);
							const isSelected = selectedUser?._id === user._id;

							return (
								<div
									key={user._id}
									onClick={() => handleUserSelect(user)}
									className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
										isSelected
											? 'bg-brand-50 border-r-4 border-brand'
											: ''
									}`}
								>
									<div className="flex items-center space-x-3">
										<ProfileAvatar
											user={user}
											size="lg"
											showOnlineStatus={true}
											isOnline={isOnline}
										/>

										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between">
												<h3 className="font-semibold text-gray-900 truncate">
													{getUserDisplayName(user)}
												</h3>
												{user.lastMessage && (
													<span className="text-xs text-gray-500">
														{formatMessageTime(
															user.lastMessage
																.createdAt,
														)}
													</span>
												)}
											</div>

											<div className="flex items-center justify-between mt-1">
												<p className="text-sm text-gray-600 truncate">
													{formatLastMessage(
														user.lastMessage,
													)}
												</p>
												{/* Show unread count badge */}
												<UnreadBadge
													count={
														user.unreadCount || 0
													}
													maxCount={99}
													size="sm"
												/>
											</div>

											<p className="text-xs text-gray-500 mt-1">
												{lastSeen}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default ChatSidebar;
