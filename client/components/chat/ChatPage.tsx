'use client';

import React, { useState } from 'react';
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import { useChat } from '../../hooks/useChat';
import { useSocket } from '../../context/SocketContext';
import { getDetailedUserPresenceText } from './messageUtils';

const ChatPage: React.FC = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const { selectedUser, userStatuses, users } = useChat();
	const { onlineUsers } = useSocket();

	const presenceText = getDetailedUserPresenceText(
		selectedUser,
		onlineUsers,
		userStatuses,
		users,
	);

	return (
		<div className="flex h-screen bg-gray-50">
			{/* Mobile sidebar overlay */}
			{isSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
					onClick={() => setIsSidebarOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
			>
				<ChatSidebar onClose={() => setIsSidebarOpen(false)} />
			</div>

			{/* Main chat area */}
			<div className="flex-1 flex flex-col min-w-0">
				{/* Header */}
				<div className="bg-white border-b px-4 py-3 flex items-center space-x-4">
					<button
						onClick={() => setIsSidebarOpen(true)}
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
								d="M4 6h16M4 12h16M4 18h16"
							/>
						</svg>
					</button>

					{selectedUser && (
						<>
							<div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
								{selectedUser.firstName?.[0] ||
									selectedUser.firstName?.[0] ||
									'?'}
							</div>
							<div className="flex-1">
								<h3 className="font-semibold text-gray-900">
									{selectedUser.firstName &&
									selectedUser.lastName
										? `${selectedUser.firstName} ${selectedUser.lastName}`
										: selectedUser.name ||
											selectedUser.email}
								</h3>
								<p className="text-sm text-gray-500">
									{presenceText}
								</p>
							</div>
						</>
					)}
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-hidden">
					<ChatMessages />
				</div>

				{/* Message input */}
				<div className="border-t bg-white">
					<MessageInput />
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
