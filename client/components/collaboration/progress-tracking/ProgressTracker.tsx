import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { ProfileAvatar } from '../../ui/ProfileAvatar';
import {
	ProgressTrackingProps,
	PROGRESS_STEPS_CONFIG,
	ProgressStep,
} from './types';
import { StepValidationModal } from './StepValidationModal';
import { Features } from '@/lib/constants';

interface ExtendedProgressTrackingProps extends ProgressTrackingProps {
	isOwner?: boolean;
	isCollaborator?: boolean;
	ownerUser?: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string | null;
		userType?: string;
	};
	collaboratorUser?: {
		_id: string;
		firstName: string;
		lastName: string;
		profileImage?: string | null;
		userType?: string;
	};
}

export const ProgressTracker: React.FC<ExtendedProgressTrackingProps> = ({
	steps,
	canUpdate,
	onStatusUpdate,
	isOwner,
	isCollaborator,
	ownerUser,
	collaboratorUser,
}) => {
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [selectedStep, setSelectedStep] = useState<ProgressStep | null>(null);
	const [validationRole, setValidationRole] = useState<
		'owner' | 'collaborator'
	>('owner');

	// Helper to check if a step can be validated
	const canValidateStep = (stepId: ProgressStep): boolean => {
		const stepIndex = Features.Collaboration.STEP_ORDER.indexOf(stepId);

		// First step can always be validated
		if (stepIndex === 0) return true;

		// Check if all previous steps are completed (validated by BOTH users)
		for (let i = 0; i < stepIndex; i++) {
			const prevStepId = Features.Collaboration.STEP_ORDER[i];
			const prevStep = steps.find((step) => step.id === prevStepId);

			if (
				!prevStep ||
				!prevStep.ownerValidated ||
				!prevStep.collaboratorValidated
			) {
				return false;
			}
		}

		return true;
	};

	const handleCheckboxClick = (
		stepId: ProgressStep,
		role: 'owner' | 'collaborator',
	) => {
		// Verify user can validate as this role
		if (role === 'owner' && !isOwner) {
			return;
		}
		if (role === 'collaborator' && !isCollaborator) {
			return;
		}

		// Check if step can be validated (sequential validation)
		if (!canValidateStep(stepId)) {
			return;
		}

		setSelectedStep(stepId);
		setValidationRole(role);
		setShowValidationModal(true);
	};

	const handleValidationConfirm = async (note?: string) => {
		if (!selectedStep || !onStatusUpdate) return;

		await onStatusUpdate({
			targetStep: selectedStep,
			notes: note,
			validatedBy: validationRole,
		});
	};

	// Helper function to get gradient color for notes
	const getNoteGradient = (userId: string, noteIndex: number) => {
		// Warm gradients for owner
		const warmGradients = [
			'bg-gradient-to-br from-orange-50 to-amber-50',
			'bg-gradient-to-br from-red-50 to-pink-50',
			'bg-gradient-to-br from-yellow-50 to-orange-50',
			'bg-gradient-to-br from-pink-50 to-rose-50',
			'bg-gradient-to-br from-amber-50 to-yellow-50',
			'bg-gradient-to-br from-rose-50 to-orange-50',
		];

		// Cool gradients for collaborator
		const coolGradients = [
			'bg-gradient-to-br from-blue-50 to-cyan-50',
			'bg-gradient-to-br from-indigo-50 to-blue-50',
			'bg-gradient-to-br from-cyan-50 to-teal-50',
			'bg-gradient-to-br from-purple-50 to-indigo-50',
			'bg-gradient-to-br from-teal-50 to-emerald-50',
			'bg-gradient-to-br from-sky-50 to-blue-50',
		];

		// Determine if user is owner or collaborator
		const isOwnerNote = userId === ownerUser?._id;
		const gradients = isOwnerNote ? warmGradients : coolGradients;

		// Use note index to select gradient (cycling through available gradients)
		return gradients[noteIndex % gradients.length];
	};

	return (
		<Card className="p-6">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-1">
					Workflow de suivi de collaboration
				</h2>
			</div>

			{/* Steps display */}
			<div className="space-y-8">
				{Features.Collaboration.STEP_ORDER.map((stepId) => {
					const stepData = steps.find((step) => step.id === stepId);
					const config = PROGRESS_STEPS_CONFIG[stepId];

					return (
						<div
							key={stepId}
							className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0"
						>
							{/* Step Header */}
							<div className="mb-3">
								<h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
									<span className="mr-2 text-xl">
										{config.icon}
									</span>
									{config.title}
								</h3>

								{/* Date with calendar icon */}
								{stepData?.validatedAt && (
									<div className="flex items-center text-sm text-gray-600 mb-3">
										📅
										<span>
											{new Date(
												stepData.validatedAt,
											).toLocaleDateString('fr-FR', {
												day: '2-digit',
												month: '2-digit',
												year: 'numeric',
											})}
										</span>
									</div>
								)}
							</div>

							{/* Checkboxes with Avatars and Names */}
							<div className="space-y-4">
								{/* Owner Checkbox */}
								{ownerUser && (
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0 mt-1">
											<input
												type="checkbox"
												checked={
													stepData?.ownerValidated ||
													false
												}
												onChange={() =>
													!stepData?.ownerValidated &&
													canUpdate &&
													isOwner &&
													handleCheckboxClick(
														stepId,
														'owner',
													)
												}
												disabled={
													!canValidateStep(stepId) ||
													stepData?.ownerValidated ||
													!canUpdate ||
													!isOwner
												}
												className={`h-5 w-5 appearance-none rounded border-2 bg-center bg-no-repeat focus:ring-2 focus:ring-offset-0 transition-all
													${
														stepData?.ownerValidated
															? isOwner
																? 'bg-brand border-brand checked:bg-brand checked:border-brand disabled:bg-brand disabled:border-brand'
																: 'bg-gray-400 border-gray-400 checked:bg-gray-400 checked:border-gray-400 disabled:bg-gray-400 disabled:border-gray-400'
															: canUpdate &&
																  isOwner &&
																  canValidateStep(
																		stepId,
																  )
																? 'border-brand/60 border-[2.5px] bg-white hover:border-brand hover:bg-brand/5 focus:ring-brand/30 cursor-pointer shadow-sm'
																: 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
													}
													${stepData?.ownerValidated ? "bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M3.5%208.5l3%203%206-6%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')]" : ''}
												`}
											/>
										</div>
										<div className="flex items-center space-x-3 flex-1">
											<ProfileAvatar
												user={{
													_id: ownerUser._id,
													firstName:
														ownerUser.firstName,
													lastName:
														ownerUser.lastName,
													...(ownerUser.profileImage
														? {
																profileImage:
																	ownerUser.profileImage,
															}
														: {}),
												}}
												size="sm"
											/>
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<span
														className={`text-sm font-medium ${stepData?.ownerValidated ? 'text-gray-900' : 'text-gray-700'}`}
													>
														{ownerUser.firstName}{' '}
														{ownerUser.lastName}
													</span>
													<span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-800 rounded-full">
														Propriétaire
													</span>
													{isOwner && (
														<span className="text-xs text-brand font-medium">
															(Vous)
														</span>
													)}
												</div>
												<p
													className={`text-sm mt-0.5 ${stepData?.ownerValidated ? 'text-gray-700' : 'text-gray-600'}`}
												>
													{stepData?.ownerValidated
														? `${ownerUser.firstName} ${ownerUser.lastName} a validé ${config.title.toLowerCase()}`
														: isOwner
															? `Je valide ${config.title.toLowerCase()}`
															: `${ownerUser.firstName} ${ownerUser.lastName} valide ${config.title.toLowerCase()}`}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Collaborator Checkbox */}
								{collaboratorUser && (
									<div className="flex items-start space-x-3">
										<div className="flex-shrink-0 mt-1">
											<input
												type="checkbox"
												checked={
													stepData?.collaboratorValidated ||
													false
												}
												onChange={() =>
													!stepData?.collaboratorValidated &&
													canUpdate &&
													isCollaborator &&
													handleCheckboxClick(
														stepId,
														'collaborator',
													)
												}
												disabled={
													!canValidateStep(stepId) ||
													stepData?.collaboratorValidated ||
													!canUpdate ||
													!isCollaborator
												}
												className={`h-5 w-5 appearance-none rounded border-2 bg-center bg-no-repeat focus:ring-2 focus:ring-offset-0 transition-all
													${
														stepData?.collaboratorValidated
															? isCollaborator
																? 'bg-brand border-brand checked:bg-brand checked:border-brand disabled:bg-brand disabled:border-brand'
																: 'bg-gray-400 border-gray-400 checked:bg-gray-400 checked:border-gray-400 disabled:bg-gray-400 disabled:border-gray-400'
															: canUpdate &&
																  isCollaborator &&
																  canValidateStep(
																		stepId,
																  )
																? 'border-brand/60 border-[2.5px] bg-white hover:border-brand hover:bg-brand/5 focus:ring-brand/30 cursor-pointer shadow-sm'
																: 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
													}
													${stepData?.collaboratorValidated ? "bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2016%2016%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M3.5%208.5l3%203%206-6%22%20stroke%3D%22white%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')]" : ''}
												`}
											/>
										</div>
										<div className="flex items-center space-x-3 flex-1">
											<ProfileAvatar
												user={{
													_id: collaboratorUser._id,
													firstName:
														collaboratorUser.firstName,
													lastName:
														collaboratorUser.lastName,
													...(collaboratorUser.profileImage
														? {
																profileImage:
																	collaboratorUser.profileImage,
															}
														: {}),
												}}
												size="sm"
											/>
											<div className="flex-1">
												<div className="flex items-center space-x-2">
													<span
														className={`text-sm font-medium ${stepData?.collaboratorValidated ? 'text-gray-900' : 'text-gray-700'}`}
													>
														{
															collaboratorUser.firstName
														}{' '}
														{
															collaboratorUser.lastName
														}
													</span>
													<span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
														Collaborateur
													</span>
													{isCollaborator && (
														<span className="text-xs text-brand font-medium">
															(Vous)
														</span>
													)}
												</div>
												<p
													className={`text-sm mt-0.5 ${stepData?.collaboratorValidated ? 'text-gray-700' : 'text-gray-600'}`}
												>
													{stepData?.collaboratorValidated
														? `${collaboratorUser.firstName} ${collaboratorUser.lastName} a validé ${config.title.toLowerCase()}`
														: isCollaborator
															? `Je valide ${config.title.toLowerCase()}`
															: `${collaboratorUser.firstName} ${collaboratorUser.lastName} valide ${config.title.toLowerCase()}`}
												</p>
											</div>
										</div>
									</div>
								)}

								{/* Info message for current validatable step */}
								{canValidateStep(stepId) &&
									(!stepData?.ownerValidated ||
										!stepData?.collaboratorValidated) && (
										<div className="mt-3 flex items-start space-x-2 text-sm text-gray-500">
											<span className="text-base">
												ℹ️
											</span>
											<p>
												Les deux parties doivent valider
												cette étape pour débloquer la
												suivante
											</p>
										</div>
									)}
							</div>

							{/* Show notes if they exist */}
							{stepData?.notes && stepData.notes.length > 0 && (
								<div className="mt-4 space-y-2">
									{stepData.notes.map(
										(noteItem, noteIndex) => (
											<div
												key={noteIndex}
												className={`flex items-start space-x-3 p-3 rounded-lg border border-transparent ${getNoteGradient(noteItem.createdBy._id, noteIndex)}`}
											>
												<ProfileAvatar
													user={{
														_id: noteItem.createdBy
															._id,
														firstName:
															noteItem.createdBy
																.firstName,
														lastName:
															noteItem.createdBy
																.lastName,
														profileImage:
															noteItem.createdBy
																.profileImage ||
															undefined,
													}}
													size="sm"
												/>
												<div className="flex-1 min-w-0">
													<div className="flex items-center space-x-2 mb-1">
														<span className="text-sm font-medium text-gray-900">
															{
																noteItem
																	.createdBy
																	.firstName
															}{' '}
															{
																noteItem
																	.createdBy
																	.lastName
															}
														</span>
														<span className="text-xs text-gray-500">
															{new Date(
																noteItem.createdAt,
															).toLocaleString(
																'fr-FR',
																{
																	day: '2-digit',
																	month: 'short',
																	year: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
																},
															)}
														</span>
													</div>
													<p className="text-sm text-gray-700">
														{noteItem.note}
													</p>
												</div>
											</div>
										),
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>

			{/* Validation Modal */}
			{showValidationModal && selectedStep && (
				<StepValidationModal
					isOpen={showValidationModal}
					onClose={() => {
						setShowValidationModal(false);
						setSelectedStep(null);
					}}
					stepTitle={PROGRESS_STEPS_CONFIG[selectedStep].title}
					stepIcon={PROGRESS_STEPS_CONFIG[selectedStep].icon}
					onConfirm={handleValidationConfirm}
					validatedBy={validationRole}
				/>
			)}
		</Card>
	);
};
