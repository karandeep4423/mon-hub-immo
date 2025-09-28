import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StepIndicator } from '../../ui/StepIndicator';
import { ProfileAvatar } from '../../ui/ProfileAvatar';
import { ProgressTrackingProps, PROGRESS_STEPS_CONFIG } from './types';
import { ProgressStatusModal } from './ProgressStatusModal';
import { STEP_ORDER } from '../../../lib/constants/stepOrder';

export const ProgressTracker: React.FC<ProgressTrackingProps> = ({
	currentStep,
	steps,
	canUpdate,
	onStatusUpdate,
}) => {
	const [showStatusModal, setShowStatusModal] = useState(false);
	const completedSteps = steps.filter((step) => step.completed).length;
	const totalSteps = steps.length;
	const progressPercentage = (completedSteps / totalSteps) * 100;

	return (
		<Card className="p-6">
			<div className="mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium text-gray-900">
						📈 Suivi de la collaboration
					</h2>
					<div className="flex items-center space-x-4">
						<div className="text-sm text-gray-600">
							{completedSteps} / {totalSteps} étapes
						</div>
						{canUpdate && onStatusUpdate && (
							<Button
								onClick={() => setShowStatusModal(true)}
								className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
							>
								<span>✏️</span>
								<span>Modifier le statut</span>
							</Button>
						)}
					</div>
				</div>

				{/* Progress bar */}
				<div className="w-full bg-gray-200 rounded-full h-2 mb-2">
					<div
						className="bg-blue-600 h-2 rounded-full transition-all duration-300"
						style={{ width: `${progressPercentage}%` }}
					></div>
				</div>
				<p className="text-xs text-gray-500">
					Progression de la collaboration entre agents
				</p>
			</div>

			{/* Steps display */}
			<div className="space-y-4">
				{STEP_ORDER.map((stepId, index) => {
					const stepData = steps.find((step) => step.id === stepId);
					const config = PROGRESS_STEPS_CONFIG[stepId];
					const isCompleted = stepData?.completed || false;
					const isCurrent = stepId === currentStep && !isCompleted;

					const stepState = isCompleted
						? 'completed'
						: isCurrent
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
								<div className="flex items-center space-x-2">
									<span
										className={`font-medium ${
											isCurrent
												? 'text-blue-600'
												: isCompleted
													? 'text-green-600'
													: 'text-gray-600'
										}`}
									>
										{config.title}
									</span>
									{isCurrent && (
										<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
											Étape actuelle
										</span>
									)}
									{isCompleted && stepData?.completedAt && (
										<span className="text-xs text-gray-500">
											{new Date(
												stepData.completedAt,
											).toLocaleDateString('fr-FR')}
										</span>
									)}
								</div>
								<p className="text-sm text-gray-500 mt-1">
									{config.description}
								</p>

								{/* Show notes if they exist */}
								{stepData?.notes && (
									<div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
										<strong>Note:</strong> {stepData.notes}
									</div>
								)}

								{/* Show who completed the step */}
								{isCompleted && stepData?.completedBy && (
									<div className="mt-3 flex items-center space-x-2">
										<ProfileAvatar
											user={{
												_id: stepData.completedBy._id,
												firstName:
													stepData.completedBy
														.firstName,
												lastName:
													stepData.completedBy
														.lastName,
												profileImage:
													stepData.completedBy
														.profileImage ||
													undefined,
											}}
											size="xs"
										/>
										<div className="text-xs text-gray-600">
											<span>
												{stepData.completedBy
													.firstName &&
												stepData.completedBy.lastName
													? `${stepData.completedBy.firstName} ${stepData.completedBy.lastName}`
													: 'Utilisateur'}
											</span>
											{stepData.completedAt && (
												<span className="text-gray-400 ml-2">
													•{' '}
													{new Date(
														stepData.completedAt,
													).toLocaleDateString(
														'fr-FR',
													)}
												</span>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Status Update Modal */}
			{showStatusModal && onStatusUpdate && (
				<ProgressStatusModal
					isOpen={showStatusModal}
					onClose={() => setShowStatusModal(false)}
					currentStep={currentStep}
					steps={steps}
					onUpdateStatus={onStatusUpdate}
				/>
			)}
		</Card>
	);
};
