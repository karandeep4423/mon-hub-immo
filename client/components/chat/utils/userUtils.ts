/**
 * User-related utility functions
 * Functions for user display, status, and validation
 */

import { CHAT_TEXT } from '@/lib/constants/text';
import type { ChatUser as User } from '@/types/chat';

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

	// Build a French phrase using our formatter without duplicating "il y a"
	const base = formatLastSeen(lastSeen); // e.g., "Il y a 3h" or "À l'instant"
	if (base.toLowerCase().startsWith('il y a')) {
		// Normalize to lower-case 'il' and prefix with 'Vu'
		const relative = 'il y a' + base.slice('Il y a'.length);
		return `Vu ${relative}`;
	}
	return `Vu ${base}`; // "Vu à l'instant"
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
