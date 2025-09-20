import React from 'react';

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

	const sizeClasses = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Backdrop */}
			<div
				className="fixed inset-0  bg-[rgba(0,0,0,0.5)]  bg-opacity-10  transition-opacity"
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto m-4 ${className}`}
			>
				{title && (
					<div className="flex items-center justify-between p-6 border-b border-gray-200">
						<h2 className="text-xl font-semibold text-gray-900">
							{title}
						</h2>
						<button
							onClick={onClose}
							className="text-gray-400 hover:text-gray-600 transition-colors"
						>
							<svg
								className="w-6 h-6"
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

				<div className={title ? 'p-6' : 'p-6'}>{children}</div>
			</div>
		</div>
	);
};
