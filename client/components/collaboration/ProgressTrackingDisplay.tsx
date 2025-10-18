import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { StepIndicator } from '../ui/StepIndicator';
import { ProgressStatusModal } from './progress-tracking/ProgressStatusModal';
import {
	PROGRESS_STEPS_CONFIG,
	ProgressStep,
	ProgressStatusUpdate,
	ProgressStepData,
} from './progress-tracking/types';
import { STEP_ORDER } from '../../lib/constants/stepOrder';

interface ProgressTrackingDisplayProps {
	collaborationId: string;
	currentProgressStep: ProgressStep;
	progressSteps: ProgressStepData[];
	canUpdate: boolean;
	isOwner: boolean;
	isCollaborator: boolean;
	onStatusUpdate: (update: ProgressStatusUpdate) => Promise<void>;
}

export const ProgressTrackingDisplay: React.FC<
	ProgressTrackingDisplayProps
> = ({
	currentProgressStep,
	progressSteps,
	canUpdate,
	isOwner,
	isCollaborator,
	onStatusUpdate,
}) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

	const currentStepIndex = STEP_ORDER.indexOf(currentProgressStep);

	const getStepData = (stepId: ProgressStep): ProgressStepData => {
		const foundStep = progressSteps.find((step) => step.id === stepId);
		const config = PROGRESS_STEPS_CONFIG[stepId];

		return (
			foundStep || {
				id: stepId,
				title: config.title,
				description: config.description,
				completed: false,
				current: stepId === currentProgressStep,
				ownerValidated: false,
				collaboratorValidated: false,
				notes: [],
			}
		);
	};

	const getStepStatus = (stepId: ProgressStep, index: number) => {
		const stepData = getStepData(stepId);
		if (stepData.completed) return 'completed';
		if (index === currentStepIndex) return 'current';
		return 'upcoming';
	};

	return (
		<div className="space-y-6">
			{/* Header with action button */}
			<div className="flex items-center justify-between">
				<div>
					<h3 className="text-lg font-medium text-gray-900">
						Suivi de la collaboration
					</h3>
					<p className="text-sm text-gray-600 mt-1">
						{currentStepIndex + 1} / {STEP_ORDER.length} étapes
					</p>
				</div>
				{canUpdate && (
					<Button
						onClick={() => setIsModalOpen(true)}
						className="bg-blue-600 hover:bg-blue-700 text-white"
					>
						✏️ Modifier le statut
					</Button>
				)}
			</div>

			{/* Progress Steps */}
			<div className="space-y-4">
				<div className="text-sm text-gray-600 mb-4">
					Progression de la collaboration entre agents
				</div>

				{STEP_ORDER.map((stepId, index) => {
					const stepData = getStepData(stepId);
					const config = PROGRESS_STEPS_CONFIG[stepId];
					const status = getStepStatus(stepId, index);

					const stepState =
						status === 'completed'
							? 'completed'
							: status === 'current'
								? 'current'
								: 'upcoming';

					return (
						<div
							key={stepId}
							className="flex items-start space-x-4"
						>
							{/* Step indicator */}
							<StepIndicator
								state={stepState}
								icon={config.icon}
							/>

							{/* Connector line */}
							{index < STEP_ORDER.length - 1 && (
								<div className="absolute left-5 mt-10 w-0.5 h-8 bg-gray-300" />
							)}

							{/* Step content */}
							<div className="flex-1 min-w-0">
								<div className="flex items-center justify-between">
									<div>
										<div className="flex items-center space-x-2">
											<span
												className={`font-medium ${
													status === 'current'
														? 'text-blue-600'
														: status === 'completed'
															? 'text-green-600'
															: 'text-gray-600'
												}`}
											>
												{config.title}
											</span>
											{status === 'current' && (
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
													Étape actuelle
												</span>
											)}
											{status === 'completed' &&
												stepData.validatedAt && (
													<span className="text-xs text-gray-500">
														{new Date(
															stepData.validatedAt,
														).toLocaleDateString(
															'fr-FR',
														)}
													</span>
												)}
										</div>
										<p className="text-sm text-gray-500 mt-1">
											{config.description}
										</p>

										{/* Show notes if they exist */}
										{stepData.notes.length > 0 && (
											<div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
												<strong>Notes:</strong>
												{stepData.notes.map(
													(note, idx) => (
														<div
															key={idx}
															className="mt-1"
														>
															{note.note}
														</div>
													),
												)}
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* Progress Status Modal */}
			<ProgressStatusModal
				isOpen={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				currentStep={currentProgressStep}
				steps={progressSteps}
				isOwner={isOwner}
				isCollaborator={isCollaborator}
				onUpdateStatus={onStatusUpdate}
			/>
		</div>
	);
};
