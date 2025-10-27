'use client';

import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Features } from '@/lib/constants';

/**
 * Loading indicator for when fetching older messages
 * Appears at the top of the chat to indicate loading state
 */
export const LoadingOlderMessages: React.FC<{
	isLoading: boolean;
}> = ({ isLoading }) => {
	if (!isLoading) return null;

	return (
		<div className="flex justify-center py-4 bg-gray-50/80 backdrop-blur-sm">
			<div className="flex items-center gap-2 text-gray-600 text-sm">
				<LoadingSpinner size="sm" />
				<span>{Features.Chat.CHAT_UI_TEXT.loadingOlderMessages}</span>
			</div>
		</div>
	);
};

export default LoadingOlderMessages;
