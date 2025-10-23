'use client';

import React from 'react';

interface CollaborationChatButtonProps {
	unreadCount: number;
	onClick: () => void;
}

export const CollaborationChatButton: React.FC<
	CollaborationChatButtonProps
> = ({ unreadCount, onClick }) => {
	return (
		<button
			onClick={onClick}
			className="fixed bottom-6 right-6 z-30 bg-[#00b4d8] hover:bg-[#0094b3] text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
			aria-label="Ouvrir le chat"
			title={`Chat with collaboration partner${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
		>
			{unreadCount > 0 && (
				<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-bold">
					{unreadCount}
				</span>
			)}
			<svg
				className="w-6 h-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth="2"
					d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.295 0-2.522-.21-3.634-.595L3 20l.595-4.366C4.21 14.522 4 13.295 4 12c0-4.418 4.03-8 9-8s8 3.582 8 8z"
				/>
			</svg>
		</button>
	);
};
