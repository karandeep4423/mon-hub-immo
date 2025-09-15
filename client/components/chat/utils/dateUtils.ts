/**
 * Date and time formatting utilities
 * Functions for date grouping, relative time, and formatting
 */

import { Message } from './messageUtils';

export interface MessageDateGroup {
	date: Date;
	dateKey: string;
	messages: Message[];
}

/**
 * Get relative date text (Today, Yesterday, etc.)
 */
export const getRelativeDateText = (date: Date): string => {
	const now = new Date();
	const diffInDays = Math.floor(
		(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
	);

	if (diffInDays === 0) return "Aujourd'hui";
	if (diffInDays === 1) return 'Hier';
	if (diffInDays <= 7) {
		return date.toLocaleDateString('fr-FR', { weekday: 'long' });
	}
	if (diffInDays <= 365) {
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'long',
		});
	}

	return date.toLocaleDateString('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	});
};

/**
 * Group messages by date for display
 */
export const groupMessagesByDate = (
	messages: Message[],
): MessageDateGroup[] => {
	const groups = new Map<string, Message[]>();

	messages.forEach((message) => {
		const date = new Date(message.createdAt);
		const dateKey = date.toDateString();

		if (!groups.has(dateKey)) {
			groups.set(dateKey, []);
		}
		groups.get(dateKey)?.push(message);
	});

	return Array.from(groups.entries()).map(([dateKey, groupMessages]) => {
		const dateObj = new Date(dateKey);
		return {
			date: dateObj,
			dateKey: getRelativeDateText(dateObj),
			messages: groupMessages,
		};
	});
};

/**
 * Format time for different contexts
 */
export const formatTime = {
	/**
	 * Short time format (HH:MM)
	 */
	short: (timestamp: string): string => {
		return new Date(timestamp).toLocaleTimeString('fr-FR', {
			hour: '2-digit',
			minute: '2-digit',
		});
	},

	/**
	 * Full date and time
	 */
	full: (timestamp: string): string => {
		return new Date(timestamp).toLocaleString('fr-FR', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	},

	/**
	 * Relative time (2 hours ago, etc.)
	 */
	relative: (timestamp: string): string => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffInSeconds = Math.floor(
			(now.getTime() - date.getTime()) / 1000,
		);

		if (diffInSeconds < 60) return "À l'instant";

		const diffInMinutes = Math.floor(diffInSeconds / 60);
		if (diffInMinutes < 60) {
			return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
		}

		const diffInHours = Math.floor(diffInMinutes / 60);
		if (diffInHours < 24) {
			return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
		}

		const diffInDays = Math.floor(diffInHours / 24);
		if (diffInDays < 7) {
			return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
		}

		return formatTime.full(timestamp);
	},
};
