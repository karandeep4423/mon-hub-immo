import React from 'react';
import { UI } from '@/lib/constants/components';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title?: string;
	size?: 'sm' | 'md' | 'lg' | 'xl';
	className?: string;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	title,
	size = 'md',
	className = '',
}) => {
	if (!isOpen) return null;

	return (
		<div className={UI.MODAL_CONTAINER.className}>
			{/* Backdrop */}
			<div className={UI.MODAL_BACKDROP.className} onClick={onClose} />

			{/* Modal */}
			<div
				className={`${UI.MODAL_CONTENT.baseClassName} ${UI.MODAL_SIZE_CLASSES[size]} ${UI.MODAL_CONTAINER.maxHeight} ${UI.MODAL_CONTAINER.overflow} ${className}`}
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
};
