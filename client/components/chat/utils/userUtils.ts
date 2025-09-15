/**
 * User-related utility functions
 * Functions for user display, status, and validation
 */

import { CHAT_TEXT } from '@/lib/constants/text';

export interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	isOnline?: boolean;
	lastSeen?: string;
	isTyping?: boolean;
	unreadCount?: number;
}

/**
 * Get display name for a user (firstName > name > email)
 */
export const getUserDisplayName = (user: User | null): string => {
	if (!user) return '';
	return user.firstName || user.name || user.email;
};

/**
 * Get user initials for avatar display
 */
export const getUserInitials = (user: User | null): string => {
	if (!user) return '';
	const displayName = getUserDisplayName(user);

	if (user.firstName && user.lastName) {
		return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
	}

	return displayName.slice(0, 2).toUpperCase();
};

/**
 * Check if user is currently online
 */
export const isUserOnline = (user: User | null): boolean => {
	return user?.isOnline === true;
};

/**
 * Check if user is currently typing
 */
export const isUserTyping = (
	user: User | null,
	typingUsers: string[],
): boolean => {
	if (!user) return false;
	return typingUsers.includes(user._id) || user.isTyping === true;
};

/**
 * Format last seen timestamp
 */
export const formatLastSeen = (lastSeen: string): string => {
	const lastSeenDate = new Date(lastSeen);
	const now = new Date();
	const diffInMinutes = Math.floor(
		(now.getTime() - lastSeenDate.getTime()) / (1000 * 60),
	);

	if (diffInMinutes < 1) return "À l'instant";
	if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;

	const diffInHours = Math.floor(diffInMinutes / 60);
	if (diffInHours < 24) return `Il y a ${diffInHours}h`;

	const diffInDays = Math.floor(diffInHours / 24);
	return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
};

/**
 * Get detailed user presence text for chat header
 */
export const getDetailedUserPresenceText = (
	selectedUser: User | null,
	onlineUsers: string[],
	userStatuses: Record<string, { lastSeen?: string }>,
	users: User[],
): string => {
	if (!selectedUser) return '';

	const isOnline = onlineUsers.includes(selectedUser._id);
	if (isOnline) return CHAT_TEXT.online;

	const lastSeen = selectedUser._id
		? userStatuses[selectedUser._id]?.lastSeen ||
			selectedUser.lastSeen ||
			users.find((u) => u._id === selectedUser._id)?.lastSeen
		: undefined;

	if (!lastSeen) return CHAT_TEXT.offline;

	const last = new Date(lastSeen);
	const diffMins = Math.floor((Date.now() - last.getTime()) / 60000);

	if (diffMins < 1) return 'Last seen just now';
	if (diffMins < 60) return `Last seen ${diffMins}m ago`;

	const hours = Math.floor(diffMins / 60);
	if (hours < 24) return `Last seen ${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (days < 7) return `Last seen ${days}d ago`;

	return `Last seen ${last.toLocaleDateString()}`;
};

/**
 * Get user status text for display
 */
export const getUserStatusText = (user: User | null): string => {
	if (!user) return CHAT_TEXT.selectUserToChat;

	const displayName = getUserDisplayName(user);

	if (user.isOnline) {
		return `${displayName} ${CHAT_TEXT.online}`;
	}

	if (user.lastSeen) {
		const lastSeenText = formatLastSeen(user.lastSeen);
		return `${displayName} ${CHAT_TEXT.lastSeen} ${lastSeenText}`;
	}

	return `Prêt à discuter avec ${displayName}`;
};
