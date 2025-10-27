import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { UI } from '@/lib/constants/components';

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
	confirmText = UI.DIALOG_TEXT.confirm,
	cancelText = UI.DIALOG_TEXT.cancel,
	variant = 'primary',
	loading = false,
}) => {
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
						loading={loading}
						className={UI.DIALOG_VARIANT_CLASSES[variant]}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmDialog;
