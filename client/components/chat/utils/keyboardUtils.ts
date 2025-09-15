/**
 * Keyboard and input utilities
 * Functions for handling keyboard events and input validation
 */

/**
 * Check if Enter key was pressed without modifiers
 */
export const isEnterKeyPress = (event: React.KeyboardEvent): boolean => {
	return (
		event.key === 'Enter' &&
		!event.shiftKey &&
		!event.ctrlKey &&
		!event.metaKey
	);
};

/**
 * Check if Escape key was pressed
 */
export const isEscapeKeyPress = (event: React.KeyboardEvent): boolean => {
	return event.key === 'Escape';
};

/**
 * Check if Ctrl/Cmd + Enter was pressed
 */
export const isCtrlEnterPress = (event: React.KeyboardEvent): boolean => {
	return (
		event.key === 'Enter' &&
		(event.ctrlKey || event.metaKey) &&
		!event.shiftKey
	);
};
