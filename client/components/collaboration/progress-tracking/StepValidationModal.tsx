import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';

interface StepValidationModalProps {
	isOpen: boolean;
	onClose: () => void;
	stepTitle: string;
	stepIcon: string;
	onConfirm: (note?: string) => Promise<void>;
	validatedBy: 'owner' | 'collaborator';
}

export const StepValidationModal: React.FC<StepValidationModalProps> = ({
	isOpen,
	onClose,
	stepTitle,
	stepIcon,
	onConfirm,
	validatedBy,
}) => {
	const [note, setNote] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleConfirm = async () => {
		setIsSubmitting(true);
		try {
			await onConfirm(note.trim() || undefined);
			setNote('');
			onClose();
		} catch (error) {
			console.error('Error validating step:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const roleLabel =
		validatedBy === 'owner' ? 'Propriétaire' : 'Collaborateur';

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Valider l'étape">
			<div className="space-y-6">
				{/* Step Info */}
				<div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
					<span className="text-3xl">{stepIcon}</span>
					<div>
						<h3 className="font-medium text-gray-900">
							{stepTitle}
						</h3>
						<p className="text-sm text-gray-600">
							En tant que {roleLabel.toLowerCase()}
						</p>
					</div>
				</div>

				{/* Confirmation Message */}
				<div className="bg-gray-50 rounded-lg p-4">
					<p className="text-sm text-gray-700">
						Confirmez-vous la validation de cette étape ?
					</p>
				</div>

				{/* Note Input */}
				<div>
					<label
						htmlFor="note"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Note (optionnelle)
					</label>
					<textarea
						id="note"
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder="Ajoutez une note pour cette étape..."
						rows={4}
						maxLength={500}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
					/>
					<p className="text-xs text-gray-500 mt-1">
						{note.length}/500 caractères
					</p>
				</div>

				{/* Actions */}
				<div className="flex justify-end space-x-3 pt-4 border-t">
					<Button
						onClick={onClose}
						variant="outline"
						disabled={isSubmitting}
					>
						Annuler
					</Button>
					<Button
						onClick={handleConfirm}
						disabled={isSubmitting}
						className="min-w-24"
					>
						{isSubmitting ? 'Validation...' : 'Confirmer'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
