import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UI } from '@/lib/constants/components';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
	zIndex?: number;
	usePortal?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	title,
	size = 'md',
	className = '',
	zIndex = 50,
	usePortal = true,
}) => {
	const [isVisible, setIsVisible] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	useEffect(() => {
		if (isOpen) {
			setIsVisible(true);
			// Small delay to trigger enter animation
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			// Wait for exit animation to complete before unmounting
			const timer = setTimeout(() => setIsVisible(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!isVisible || !mounted) return null;

	const backdropZIndex = zIndex - 10;
	const containerZIndex = zIndex;
	const contentZIndex = zIndex + 10;

	const modalContent = (
		<div
			className={UI.MODAL_CONTAINER.className}
			style={{ zIndex: containerZIndex }}
		>
			{/* Backdrop */}
			<div
				className={`${UI.MODAL_BACKDROP.className} transition-opacity duration-300 ${
					isAnimating ? 'opacity-100' : 'opacity-0'
				}`}
				style={{
					backdropFilter: isAnimating ? 'blur(4px)' : 'blur(0px)',
					zIndex: backdropZIndex,
				}}
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`${UI.MODAL_CONTENT.baseClassName} ${UI.MODAL_SIZE_CLASSES[size]} ${UI.MODAL_CONTAINER.maxHeight} ${UI.MODAL_CONTAINER.overflow} ${className} transition-all duration-300 ${
					isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
				}`}
				style={{ zIndex: contentZIndex, position: 'relative' }}
			>
				{title && (
					<div className={UI.MODAL_CONTENT.headerClassName}>
						<h2 className="text-xl font-semibold text-gray-900">
							{title}
						</h2>
						<button
							onClick={onClose}
							className={UI.MODAL_CLOSE_BUTTON.className}
							aria-label={UI.MODAL_CLOSE_BUTTON.ariaLabel}
						>
							<svg
								className={UI.MODAL_CLOSE_BUTTON.iconClassName}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>
				)}

				<div
					className={
						title
							? UI.MODAL_CONTENT.bodyClassName
							: UI.MODAL_CONTENT.bodyClassName
					}
				>
					{children}
				</div>
			</div>
		</div>
	);

	if (usePortal && typeof window !== 'undefined') {
		return createPortal(modalContent, document.body);
	}

	return modalContent;
};
