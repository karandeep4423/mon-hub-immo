/**
 * Scroll and UI-related utility functions
 * Functions for scroll management, positioning, and UI state
 */

export interface ScrollAnchor {
	messageId: string;
	offsetFromTop: number;
	elementHeight: number;
}

/**
 * Check if user is near the bottom of scroll container
 */
export const isNearBottom = (
	scrollTop: number,
	scrollHeight: number,
	clientHeight: number,
	threshold: number = 100,
): boolean => {
	const distanceFromBottom = scrollHeight - clientHeight - scrollTop;
	return distanceFromBottom <= threshold;
};

/**
 * Check if user is near the top of scroll container
 */
export const isNearTop = (
	scrollTop: number,
	threshold: number = 24,
): boolean => {
	return scrollTop <= threshold;
};

/**
 * Calculate scroll position delta for infinite scroll
 */
export const calculateScrollDelta = (
	oldHeight: number,
	newHeight: number,
	oldScrollTop: number,
): number => {
	return newHeight - oldHeight + oldScrollTop;
};

/**
 * Create scroll anchor for position restoration
 */
export const createScrollAnchor = (
	messageElement: HTMLElement,
	container: HTMLElement,
): ScrollAnchor => {
	const messageId = messageElement.getAttribute('data-message-id') || '';
	const containerRect = container.getBoundingClientRect();
	const messageRect = messageElement.getBoundingClientRect();

	return {
		messageId,
		offsetFromTop: messageRect.top - containerRect.top,
		elementHeight: messageRect.height,
	};
};

/**
 * Restore scroll position using anchor
 */
export const restoreScrollPosition = (
	container: HTMLElement,
	anchor: ScrollAnchor,
): boolean => {
	const messageElement = container.querySelector(
		`[data-message-id="${anchor.messageId}"]`,
	) as HTMLElement;

	if (!messageElement) return false;

	const containerRect = container.getBoundingClientRect();
	const messageRect = messageElement.getBoundingClientRect();
	const currentOffset = messageRect.top - containerRect.top;
	const scrollAdjustment = currentOffset - anchor.offsetFromTop;

	container.scrollTop += scrollAdjustment;
	return true;
};

/**
 * Find best message element to use as scroll anchor
 */
export const findBestAnchorMessage = (
	container: HTMLElement,
): ScrollAnchor | null => {
	const messages = container.querySelectorAll('[data-message-id]');
	if (messages.length === 0) return null;

	// Find the first visible message in the middle third of the container
	const containerRect = container.getBoundingClientRect();
	const middleStart = containerRect.top + containerRect.height / 3;
	const middleEnd = containerRect.top + (2 * containerRect.height) / 3;

	for (const message of Array.from(messages)) {
		const messageRect = message.getBoundingClientRect();
		if (messageRect.top >= middleStart && messageRect.top <= middleEnd) {
			return createScrollAnchor(message as HTMLElement, container);
		}
	}

	// Fallback to first visible message
	const firstVisible = Array.from(messages).find((message) => {
		const rect = message.getBoundingClientRect();
		return (
			rect.bottom > containerRect.top && rect.top < containerRect.bottom
		);
	});

	return firstVisible
		? createScrollAnchor(firstVisible as HTMLElement, container)
		: null;
};

/**
 * Determine if auto-scroll should happen
 */
export const shouldAutoScrollToBottom = (
	container: HTMLElement,
	threshold: number = 100,
): boolean => {
	if (!container) return false;

	const { scrollTop, scrollHeight, clientHeight } = container;
	return isNearBottom(scrollTop, scrollHeight, clientHeight, threshold);
};

/**
 * Smooth scroll to bottom of container
 */
export const scrollToBottom = (
	container: HTMLElement,
	smooth: boolean = true,
): void => {
	if (!container) return;

	container.scrollTo({
		top: container.scrollHeight,
		behavior: smooth ? 'smooth' : 'auto',
	});
};

/**
 * Debounce function for scroll events
 */
export const debounce = <T extends (...args: unknown[]) => void>(
	func: T,
	wait: number,
): ((...args: Parameters<T>) => void) => {
	let timeout: NodeJS.Timeout;

	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};
