import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside of specified elements
 * Useful for closing dropdowns, modals, and popovers
 *
 * @example
 * ```typescript
 * const dropdownRef = useRef<HTMLDivElement>(null);
 * const buttonRef = useRef<HTMLButtonElement>(null);
 *
 * useClickOutside([dropdownRef, buttonRef], () => {
 *   setIsOpen(false);
 * });
 * ```
 *
 * @param refs - Array of refs to elements that should not trigger the callback
 * @param handler - Callback function to execute when clicking outside
 */
export const useClickOutside = (
	refs: RefObject<HTMLElement>[],
	handler: () => void,
) => {
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Check if click is outside all provided refs
			const clickedOutside = refs.every(
				(ref) =>
					ref.current && !ref.current.contains(event.target as Node),
			);

			if (clickedOutside) {
				handler();
			}
		};

		// Attach event listener
		document.addEventListener('mousedown', handleClickOutside);

		// Cleanup
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [refs, handler]);
};
