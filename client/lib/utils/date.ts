export const formatDate = (dateString: string): string => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat('fr-FR', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	}).format(date);
};

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
