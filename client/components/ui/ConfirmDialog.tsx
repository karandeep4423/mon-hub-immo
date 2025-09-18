import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

type Variant = 'danger' | 'primary' | 'warning';

interface ConfirmDialogProps {
	isOpen: boolean;
	title: string;
	description?: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
	variant?: Variant;
	loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
	isOpen,
	title,
	description,
	onConfirm,
	onCancel,
	confirmText = 'Confirmer',
	cancelText = 'Annuler',
	variant = 'primary',
	loading = false,
}) => {
	const variantClasses: Record<Variant, string> = {
		danger: 'bg-red-600 hover:bg-red-700 text-white',
		primary: 'bg-blue-600 hover:bg-blue-700 text-white',
		warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
	};

	return (
		<Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
			<div className="space-y-4">
				{description && (
					<p className="text-sm text-gray-600">{description}</p>
				)}
				<div className="flex justify-end gap-3 pt-2">
					<Button
						variant="outline"
						onClick={onCancel}
						disabled={loading}
					>
						{cancelText}
					</Button>
					<Button
						onClick={onConfirm}
						disabled={loading}
						className={variantClasses[variant]}
					>
						{loading ? 'Veuillez patienter...' : confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmDialog;
