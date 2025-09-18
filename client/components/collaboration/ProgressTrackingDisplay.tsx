import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ProgressStatusModal } from './progress-tracking/ProgressStatusModal';
import {
	PROGRESS_STEPS_CONFIG,
	ProgressStep,
	ProgressStatusUpdate,
	ProgressStepData,
} from './progress-tracking/types';

interface ProgressTrackingDisplayProps {
	collaborationId: string;
	currentProgressStep: ProgressStep;
	progressSteps: ProgressStepData[];
	canUpdate: boolean;
	onStatusUpdate: (update: ProgressStatusUpdate) => Promise<void>;
}

export const ProgressTrackingDisplay: React.FC<
	ProgressTrackingDisplayProps
> = ({ currentProgressStep, progressSteps, canUpdate, onStatusUpdate }) => {
	const [isModalOpen, setIsModalOpen] = useState(false);

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

	const currentStepIndex = stepOrder.indexOf(currentProgressStep);

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
						{currentStepIndex + 1} / {stepOrder.length} étapes
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

				{stepOrder.map((stepId, index) => {
					const stepData = getStepData(stepId);
					const config = PROGRESS_STEPS_CONFIG[stepId];
					const status = getStepStatus(stepId, index);

					return (
						<div
							key={stepId}
							className="flex items-start space-x-4"
						>
							{/* Step indicator */}
							<div
								className={`flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium ${
									status === 'completed'
										? 'bg-green-500 text-white'
										: status === 'current'
											? 'bg-blue-500 text-white'
											: 'bg-gray-200 text-gray-600'
								}`}
							>
								{status === 'completed' ? (
									<svg
										className="w-5 h-5"
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
									<span>{config.icon}</span>
								)}
							</div>

							{/* Connector line */}
							{index < stepOrder.length - 1 && (
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
												stepData.completedAt && (
													<span className="text-xs text-gray-500">
														{new Date(
															stepData.completedAt,
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
										{stepData.notes && (
											<div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
												<strong>Note:</strong>{' '}
												{stepData.notes}
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
				onUpdateStatus={onStatusUpdate}
			/>
		</div>
	);
};
