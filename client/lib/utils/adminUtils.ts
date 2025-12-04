/**
 * Admin utility functions
 */
import type {
	AdminUser,
	AdminCollaboration,
	CollaborationType,
	BadgeVariant,
} from '@/types/admin';
import { PROPERTY_TYPE_LABELS, STATUS_LABELS } from '@/lib/constants/admin';

/**
 * Check if a user is an admin
 */
export const isAdminUser = (user: AdminUser | null | undefined): boolean => {
	if (!user) return false;
	const rawRole = user.userType || user.type;
	const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : '';
	const flag = (user as unknown as { isAdmin?: boolean }).isAdmin === true;
	return flag || role === 'admin' || role === 'administrator';
};

/**
 * Get user status from isBlocked/isValidated flags
 */
export const getUserStatus = (
	user: AdminUser,
): 'active' | 'pending' | 'blocked' => {
	if (user.isBlocked) return 'blocked';
	if (user.isValidated) return 'active';
	return 'pending';
};

/**
 * Get badge variant for status
 */
export const getStatusBadgeVariant = (status: string): BadgeVariant => {
	switch (status) {
		case 'active':
			return 'success';
		case 'pending':
			return 'warning';
		case 'blocked':
		case 'cancelled':
		case 'error':
			return 'error';
		case 'completed':
			return 'info';
		default:
			return 'gray';
	}
};

/**
 * Get user type badge variant
 */
export const getUserTypeBadgeVariant = (type: string): BadgeVariant => {
	const normalizedType = type?.toLowerCase() || '';
	switch (normalizedType) {
		case 'agent':
			return 'info';
		case 'admin':
		case 'administrator':
			return 'success';
		case 'apporteur':
		default:
			return 'gray';
	}
};

/**
 * Get formatted user type label
 */
export const getUserTypeLabel = (type: string): string => {
	const normalizedType = type?.toLowerCase() || '';
	switch (normalizedType) {
		case 'agent':
			return 'Agent';
		case 'admin':
		case 'administrator':
			return 'Admin';
		case 'apporteur':
		default:
			return 'Apporteur';
	}
};

/**
 * Get property type label
 */
export const getPropertyTypeLabel = (type: string): string => {
	if (!type) return '';
	const normalized = type.toLowerCase();
	return (
		PROPERTY_TYPE_LABELS[normalized] ||
		type.charAt(0).toUpperCase() + type.slice(1)
	);
};

/**
 * Get status label
 */
export const getStatusLabel = (status: string): string => {
	return STATUS_LABELS[status] || status;
};

/**
 * Determine collaboration type from participants
 */
export const getCollaborationType = (
	collab: AdminCollaboration,
): CollaborationType => {
	const agentType =
		typeof collab.agent === 'object' && collab.agent
			? collab.agent.userType
			: undefined;
	const apporteurType =
		typeof collab.apporteur === 'object' && collab.apporteur
			? collab.apporteur.userType
			: undefined;

	const ownerType = collab.postOwnerId?.userType || agentType;
	const collabType = collab.collaboratorId?.userType || apporteurType;

	if (ownerType === 'agent' && collabType === 'agent') return 'agent-agent';
	return 'agent-apporteur';
};

/**
 * Get participant name from collaboration
 */
export const getParticipantName = (
	participant: AdminCollaboration['agent'] | AdminCollaboration['apporteur'],
	fallbackName?: string,
): string => {
	if (typeof participant === 'string') return participant;
	if (participant) {
		return `${participant.firstName || ''} ${participant.lastName || ''}`.trim();
	}
	return fallbackName || '';
};

/**
 * Format date for display
 */
export const formatDate = (
	dateString: string | undefined | null,
): string | null => {
	if (!dateString) return null;
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return null;
	return date.toLocaleDateString('fr-FR');
};

/**
 * Check if date is recent (within last 7 days)
 */
export const isRecentDate = (dateString: string): boolean => {
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return false;
	return Date.now() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
};

/**
 * Format price for display
 */
export const formatPrice = (
	price: number,
	format: 'short' | 'full' = 'short',
): string => {
	if (format === 'short') {
		if (price >= 1000000) {
			return `€${(price / 1000000).toFixed(1)}M`;
		}
		return `€${(price / 1000).toFixed(0)}k`;
	}
	return `€${price.toLocaleString('fr-FR')}`;
};

/**
 * Format commission as short currency string (e.g., €12.5k)
 */
export const formatCommissionShort = (amount: number): string => {
	return `€${(amount / 1000).toFixed(1)}k`;
};

/**
 * Download helper for exports
 */
export const downloadFile = (filename: string, content: Blob): void => {
	const url = URL.createObjectURL(content);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.style.display = 'none';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
};

/**
 * Generate CSV content from data
 */
export const generateCSV = <T extends Record<string, unknown>>(
	data: T[],
	headers: string[],
): string => {
	const csvRows = [headers.join(',')];
	for (const item of data) {
		const row = headers
			.map((h) => {
				const value = item[h];
				if (value === undefined || value === null) return '""';
				const str = String(value).replace(/"/g, '""');
				return `"${str}"`;
			})
			.join(',');
		csvRows.push(row);
	}
	return '\uFEFF' + csvRows.join('\n'); // BOM for Excel
};
