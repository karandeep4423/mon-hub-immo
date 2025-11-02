/**
 * Centralized date formatting utilities for consistent date display across the app
 */

/**
 * Format date with long month name (e.g., "15 janvier 2024")
 */
export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
};

/**
 * Format date with short numeric format (e.g., "15/01/2024")
 */
export const formatDateShort = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	}).format(date);
};

/**
 * Format date with optional support (returns '-' if no date provided)
 */
export const formatDateOptional = (dateString?: string): string => {
	if (!dateString) return '-';
	return formatDate(dateString);
};

/**
 * Format time only (HH:MM)
 */
export const formatTime = (timeString: string): string => {
	// Handle HH:mm format
	if (timeString.includes(':')) {
		return timeString;
	}
	// Handle ISO date format
	const date = new Date(timeString);
	return new Intl.DateTimeFormat('fr-FR', {
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

/**
 * Format date and time (e.g., "15 janvier 2024 à 14:30")
 */
export const formatDateTime = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

/**
 * Format date and time with short format (e.g., "15/01/2024 14:30")
 */
export const formatDateTimeShort = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(date);
};

/**
 * Format date to MM/YYYY format (for available dates, etc.)
 */
export const formatMonthYear = (dateValue: string | Date): string => {
	// If it's already in MM/YYYY format, use it directly
	if (typeof dateValue === 'string' && /^\d{2}\/\d{4}$/.test(dateValue)) {
		return dateValue;
	}

	// If it's a date object or ISO string, format it
	try {
		const date = new Date(dateValue);
		if (!isNaN(date.getTime())) {
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const year = date.getFullYear();
			return `${month}/${year}`;
		}
	} catch {
		return String(dateValue);
	}

	return String(dateValue);
};
