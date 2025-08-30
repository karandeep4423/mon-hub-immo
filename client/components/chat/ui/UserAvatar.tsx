'use client';

import React from 'react';
import { getUserDisplayName, getUserInitials } from '../messageUtils';

// ============================================================================
// USER AVATAR COMPONENTS
// ============================================================================

interface User {
	_id: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	email: string;
	isOnline?: boolean;
}

interface UserAvatarProps {
	/** User object */
	user: User;
	/** Size of avatar */
	size?: 'sm' | 'md' | 'lg' | 'xl';
	/** Whether to show online indicator */
	showOnlineStatus?: boolean;
	/** Whether user is online */
	isOnline?: boolean;
	/** Custom className */
	className?: string;
}

interface OnlineIndicatorProps {
	/** Size of the indicator */
	size?: 'sm' | 'md' | 'lg';
	/** Position relative to avatar */
	position?: 'bottom-right' | 'top-right';
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get avatar size classes
 */
const getAvatarSize = (size: 'sm' | 'md' | 'lg' | 'xl'): string => {
	switch (size) {
		case 'sm':
			return 'w-8 h-8 text-xs';
		case 'md':
			return 'w-10 h-10 text-sm';
		case 'lg':
			return 'w-12 h-12 text-base';
		case 'xl':
			return 'w-16 h-16 text-lg';
		default:
			return 'w-10 h-10 text-sm';
	}
};

/**
 * Get random avatar background color
 */
const getAvatarColor = (userId: string): string => {
	const colors = [
		'bg-blue-500',
		'bg-green-500',
		'bg-purple-500',
		'bg-pink-500',
		'bg-indigo-500',
		'bg-red-500',
		'bg-yellow-500',
		'bg-teal-500',
	];

	// Use user ID to consistently pick same color
	const index =
		userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) %
		colors.length;
	return colors[index];
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Online Status Indicator
 */
export const OnlineIndicator: React.FC<OnlineIndicatorProps> = React.memo(
	({ size = 'sm', position = 'bottom-right' }) => {
		const sizeClass =
			size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5';
		const positionClass =
			position === 'bottom-right'
				? 'absolute -bottom-1 -right-1'
				: 'absolute -top-1 -right-1';

		return (
			<div
				className={`${positionClass} ${sizeClass} bg-green-500 border-2 border-white rounded-full`}
			/>
		);
	},
);

OnlineIndicator.displayName = 'OnlineIndicator';

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * UserAvatar Component
 *
 * Displays user avatar with initials and optional online status
 * Features:
 * - Consistent color based on user ID
 * - Multiple sizes
 * - Online status indicator
 * - Fallback to initials
 *
 * @param user - User object
 * @param size - Avatar size (sm|md|lg|xl)
 * @param showOnlineStatus - Whether to show online indicator
 * @param isOnline - Whether user is online
 * @param className - Custom styling
 */
export const UserAvatar: React.FC<UserAvatarProps> = React.memo(
	({
		user,
		size = 'md',
		showOnlineStatus = false,
		isOnline = false,
		className = '',
	}) => {
		const sizeClass = getAvatarSize(size);
		const bgColor = getAvatarColor(user._id);
		const initials = getUserInitials(user);

		return (
			<div className={`relative inline-block ${className}`}>
				<div
					className={`${sizeClass} ${bgColor} rounded-full flex items-center justify-center text-white font-semibold select-none`}
				>
					{initials}
				</div>

				{showOnlineStatus && isOnline && (
					<OnlineIndicator size={size === 'sm' ? 'sm' : 'md'} />
				)}
			</div>
		);
	},
);

UserAvatar.displayName = 'UserAvatar';

export default UserAvatar;
