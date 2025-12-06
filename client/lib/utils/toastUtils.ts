import { toast } from 'react-toastify';

// Toast deduplication - prevent multiple identical toasts
const recentToasts = new Map<string, number>();
const TOAST_COOLDOWN_MS = 3000; // 3 seconds cooldown for same message

/**
 * Show a toast only if the same message hasn't been shown recently.
 * Prevents duplicate toasts when multiple API calls fail simultaneously.
 */
export const showToastOnce = (
	message: string,
	type: 'info' | 'error' | 'success' | 'warning' = 'info',
): void => {
	const now = Date.now();
	const lastShown = recentToasts.get(message);

	if (lastShown && now - lastShown < TOAST_COOLDOWN_MS) {
		return; // Skip - already shown recently
	}

	recentToasts.set(message, now);
	toast[type](message);

	// Clean up old entries to prevent memory leak
	if (recentToasts.size > 20) {
		const oldestKey = recentToasts.keys().next().value;
		if (oldestKey) recentToasts.delete(oldestKey);
	}
};

/**
 * Clear the toast cooldown for a specific message (useful for testing)
 */
export const clearToastCooldown = (message?: string): void => {
	if (message) {
		recentToasts.delete(message);
	} else {
		recentToasts.clear();
	}
};
