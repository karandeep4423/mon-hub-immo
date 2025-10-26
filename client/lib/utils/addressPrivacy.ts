import { Collaboration } from '@/types/collaboration';

/**
 * Determines if the full address should be shown based on collaboration status
 * Address is only shown if:
 * 1. User is the owner/author
 * 2. User has an accepted, active, or completed collaboration
 *
 * @param isOwner - Whether the current user is the owner
 * @param collaborations - List of collaborations for the post
 * @param userId - Current user's ID
 * @returns true if full address should be shown, false otherwise
 */
export function canViewFullAddress(
	isOwner: boolean,
	collaborations: Collaboration[],
	userId?: string,
): boolean {
	// Owner can always see full address
	if (isOwner) return true;

	// If no user or no collaborations, hide address
	if (!userId || !collaborations.length) return false;

	// Check if user has an accepted, active, or completed collaboration
	const userCollaboration = collaborations.find(
		(collab) =>
			collab.collaboratorId._id === userId &&
			(collab.status === 'accepted' ||
				collab.status === 'active' ||
				collab.status === 'completed'),
	);

	return !!userCollaboration;
}

/**
 * Masks address details to show only city
 *
 * @param city - City name
 * @returns Masked address showing only city
 */
export function getMaskedAddress(city?: string): string {
	return city || 'Localisation masquée';
}

/**
 * Gets the appropriate address display based on permissions
 *
 * @param canView - Whether user can view full address
 * @param address - Full street address
 * @param city - City name
 * @param postalCode - Postal code
 * @returns Full address or masked address (city only)
 */
export function getDisplayAddress(
	canView: boolean,
	address?: string,
	city?: string,
	postalCode?: string,
): string {
	if (canView) {
		const parts = [];
		if (address) parts.push(address);
		if (city) parts.push(city);
		if (postalCode) parts.push(postalCode);
		return parts.join(', ');
	}
	return getMaskedAddress(city);
}

/**
 * Gets location info message for search ads
 */
export function getSearchAdLocationMessage(canView: boolean): string | null {
	if (!canView) {
		return '📍 Localisation complète disponible après collaboration acceptée';
	}
	return null;
}
