import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Modal } from '../../ui/Modal';
import {
	PROGRESS_STEPS_CONFIG,
	ProgressStep,
	ProgressStatusUpdate,
	ProgressStepData,
} from './types';

interface ProgressStatusModalProps {
	isOpen: boolean;
	onClose: () => void;
	currentStep: ProgressStep;
	steps: ProgressStepData[];
	onUpdateStatus: (update: ProgressStatusUpdate) => Promise<void>;
}

export const ProgressStatusModal: React.FC<ProgressStatusModalProps> = ({
	isOpen,
	onClose,
	currentStep,
	steps,
	onUpdateStatus,
}) => {
	// Find the next uncompleted step as default selection
	const stepOrder: ProgressStep[] = [
		'proposal',
		'accepted',
		'visit_planned',
		'visit_completed',
		'negotiation',
		'offer_made',
		'compromise_signed',
		'final_act',
	];

	const nextUncompletedStep =
		stepOrder.find((stepId) => {
			const stepData = steps?.find((s) => s.id === stepId);
			return !stepData?.completed;
		}) || currentStep;

	const [selectedStep, setSelectedStep] =
		useState<ProgressStep>(nextUncompletedStep);
	const [notes, setNotes] = useState('');
	const [isUpdating, setIsUpdating] = useState(false);

	const handleSubmit = async () => {
		const stepData = steps?.find((s) => s.id === selectedStep);
		if (!selectedStep || stepData?.completed) return;

		setIsUpdating(true);
		try {
			await onUpdateStatus({
				targetStep: selectedStep,
				notes: notes.trim() || undefined,
			});
			onClose();
			setNotes('');
		} catch (error) {
			console.error('Error updating status:', error);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Modifier le statut">
			<div className="space-y-6">
				{/* Step Selection */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-3">
						Sélectionner l&apos;étape
					</label>
					<div className="space-y-2">
						{stepOrder.map((step) => {
							const config = PROGRESS_STEPS_CONFIG[step];
							const stepData = steps?.find((s) => s.id === step);
							const isCompleted = stepData?.completed || false;
							const isDisabled = isCompleted; // Disable already completed steps

							return (
								<div
									key={step}
									className={`flex items-center p-3 border rounded-lg transition-colors ${
										selectedStep === step
											? 'border-blue-500 bg-blue-50'
											: isDisabled
												? 'border-gray-200 bg-gray-50 cursor-not-allowed'
												: 'border-gray-300 hover:border-gray-400 cursor-pointer'
									}`}
									onClick={() =>
										!isDisabled && setSelectedStep(step)
									}
								>
									<div
										className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium mr-3 ${
											isCompleted
												? 'bg-green-500 text-white'
												: selectedStep === step
													? 'bg-blue-100 text-blue-800'
													: 'bg-gray-200 text-gray-600'
										}`}
									>
										{isCompleted ? (
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth="2"
													d="M5 13l4 4L19 7"
												/>
											</svg>
										) : (
											config.icon
										)}
									</div>
									<div className="flex-1">
										<div className="flex items-center space-x-2">
											<span
												className={`font-medium ${isDisabled ? 'text-gray-400' : 'text-gray-900'}`}
											>
												{config.title}
											</span>
											{isCompleted && (
												<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
													Terminé
												</span>
											)}
										</div>
										<p
											className={`text-sm ${isDisabled ? 'text-gray-400' : 'text-gray-500'}`}
										>
											{config.description}
										</p>
									</div>
									{selectedStep === step && !isDisabled && (
										<div className="w-4 h-4 border-2 border-blue-500 rounded-full bg-blue-500 flex items-center justify-center">
											<div className="w-2 h-2 bg-white rounded-full" />
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>

				{/* Progress Bar Preview */}
				{selectedStep &&
					!steps?.find((s) => s.id === selectedStep)?.completed && (
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Aperçu de la progression
							</label>
							<div className="p-3 bg-blue-50 rounded-lg">
								<p className="text-sm text-blue-800">
									L&apos;étape &quot;
									{PROGRESS_STEPS_CONFIG[selectedStep].title}
									&quot; sera marquée comme terminée
								</p>
							</div>
						</div>
					)}

				{/* Notes */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1">
						Note (optionnel)
					</label>
					<textarea
						value={notes}
						onChange={(e) => setNotes(e.target.value)}
						placeholder="Ajouter une note sur cette mise à jour..."
						rows={3}
						maxLength={500}
						className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
					<p className="text-xs text-gray-500 mt-1">
						{notes.length}/500 caractères
					</p>
				</div>

				{/* Actions */}
				<div className="flex justify-end space-x-3 pt-4 border-t">
					<Button
						onClick={onClose}
						variant="outline"
						disabled={isUpdating}
					>
						Annuler
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={
							isUpdating ||
							!selectedStep ||
							steps?.find((s) => s.id === selectedStep)?.completed
						}
						className="min-w-24"
					>
						{isUpdating ? 'Mise à jour...' : 'Mettre à jour'}
					</Button>
				</div>
			</div>
		</Modal>
	);
};
