import React, { useState } from 'react';
import { Card } from '../../ui/Card';
import { ProfileAvatar } from '../../ui/ProfileAvatar';
import {
	ProgressTrackingProps,
	PROGRESS_STEPS_CONFIG,
	ProgressStep,
} from './types';
import { StepValidationModal } from './StepValidationModal';
import { STEP_ORDER } from '../../../lib/constants/stepOrder';

interface ExtendedProgressTrackingProps extends ProgressTrackingProps {
	isOwner?: boolean;
	isCollaborator?: boolean;
}

export const ProgressTracker: React.FC<ExtendedProgressTrackingProps> = ({
	steps,
	canUpdate,
	onStatusUpdate,
	isOwner,
	isCollaborator,
}) => {
	const [showValidationModal, setShowValidationModal] = useState(false);
	const [selectedStep, setSelectedStep] = useState<ProgressStep | null>(null);
	const [validationRole, setValidationRole] = useState<
		'owner' | 'collaborator'
	>('owner');

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

	return (
		<Card className="p-6">
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-1">
					Workflow de suivi de collaboration
				</h2>
			</div>

			{/* Steps display */}
			<div className="space-y-8">
				{STEP_ORDER.map((stepId) => {
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

							{/* Checkboxes */}
							<div className="space-y-3">
								{/* Owner Checkbox */}
								<div className="flex items-center">
									<label className="flex items-center cursor-pointer group">
										<div className="relative">
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
													stepData?.ownerValidated ||
													!canUpdate ||
													!isOwner
												}
												className="sr-only peer"
											/>
											<div className="h-5 w-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-[#00b4d8] peer-checked:border-[#00b4d8] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors">
												{stepData?.ownerValidated && (
													<svg
														className="w-3 h-3 text-white"
														viewBox="0 0 12 10"
														fill="none"
													>
														<path
															d="M1 5L4.5 8.5L11 1.5"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												)}
											</div>
										</div>
										<span
											className={`ml-3 text-sm ${stepData?.ownerValidated ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
										>
											{getOwnerLabel(stepId)}
										</span>
									</label>
									{stepData?.ownerValidated &&
										stepData?.collaboratorValidated && (
											<>
												<span className="ml-2 text-blue-600">
													|
												</span>
												<span className="ml-2 text-sm text-gray-700">
													Autre agent validé
												</span>
											</>
										)}
								</div>

								{/* Collaborator Checkbox */}
								<div className="flex items-center">
									<label className="flex items-center cursor-pointer group">
										<div className="relative">
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
													stepData?.collaboratorValidated ||
													!canUpdate ||
													!isCollaborator
												}
												className="sr-only peer"
											/>
											<div className="h-5 w-5 border-2 border-gray-300 rounded flex items-center justify-center peer-checked:bg-[#00b4d8] peer-checked:border-[#00b4d8] peer-disabled:opacity-50 peer-disabled:cursor-not-allowed transition-colors">
												{stepData?.collaboratorValidated && (
													<svg
														className="w-3 h-3 text-white"
														viewBox="0 0 12 10"
														fill="none"
													>
														<path
															d="M1 5L4.5 8.5L11 1.5"
															stroke="currentColor"
															strokeWidth="2"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
													</svg>
												)}
											</div>
										</div>
										<span
											className={`ml-3 text-sm ${stepData?.collaboratorValidated ? 'text-gray-900 font-medium' : 'text-gray-700'}`}
										>
											{getCollaboratorLabel(stepId)}
										</span>
									</label>
									{stepData?.collaboratorValidated &&
										!stepData?.ownerValidated && (
											<>
												<span className="ml-2 text-blue-600">
													|
												</span>
												<span className="ml-2 text-sm text-gray-700">
													Autre agent confirmé
												</span>
											</>
										)}
								</div>
							</div>

							{/* Show notes if they exist */}
							{stepData?.notes && stepData.notes.length > 0 && (
								<div className="mt-4 space-y-2">
									{stepData.notes.map(
										(noteItem, noteIndex) => (
											<div
												key={noteIndex}
												className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
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

// Helper functions to get the correct labels for each step
const getOwnerLabel = (stepId: ProgressStep): string => {
	const labels: Record<ProgressStep, string> = {
		accord_collaboration: "J'ai validé l'accord",
		premier_contact: "J'ai contacté le client",
		visite_programmee: "J'ai programmé la visite",
		visite_realisee: "J'ai réalisé la visite",
		retour_client: "J'ai reçu le retour du client",
	};
	return labels[stepId] || "J'ai validé l'accord";
};

const getCollaboratorLabel = (stepId: ProgressStep): string => {
	const labels: Record<ProgressStep, string> = {
		accord_collaboration: 'Autre agent validé',
		premier_contact: 'Autre agent confirmé',
		visite_programmee: 'Autre agent confirmé',
		visite_realisee: 'Autre agent confirmé',
		retour_client: 'Autre agent confirmé',
	};
	return labels[stepId] || 'Autre agent validé';
};
