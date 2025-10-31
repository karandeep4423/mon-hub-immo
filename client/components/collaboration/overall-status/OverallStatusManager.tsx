import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { OverallStatusManagerProps, OverallCollaborationStatus } from './types';
import { OverallStatusBadge } from './OverallStatusBadge';
import { logger } from '@/lib/utils/logger';
import { Components } from '@/lib/constants';
import { getCompletionReasonDetails } from '../CompletionReasonModal';

export const OverallStatusManager: React.FC<OverallStatusManagerProps> = ({
	currentStatus,
	canUpdate,
	isOwner,
	isCollaborator,
	onStatusUpdate,
	progressSteps = [],
	completionReason,
}) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [showActions, setShowActions] = useState(false);

	// Check if "Affaire conclue" is validated by both parties
	const isAffaireConclueValidated = () => {
		const affaireConclueStep = progressSteps.find(
			(step) => step.id === 'affaire_conclue',
		);
		return (
			affaireConclueStep?.ownerValidated &&
			affaireConclueStep?.collaboratorValidated
		);
	};

	const handleStatusChange = async (
		newStatus: OverallCollaborationStatus,
	) => {
		if (!onStatusUpdate) return;

		setIsUpdating(true);
		try {
			await onStatusUpdate(newStatus);
			setShowActions(false);
		} catch (error) {
			logger.error('Error updating status:', error);
		} finally {
			setIsUpdating(false);
		}
	};

	const getAvailableActions = (): Array<{
		status: OverallCollaborationStatus;
		label: string;
		description: string;
		variant: 'primary' | 'secondary' | 'danger';
	}> => {
		switch (currentStatus) {
			case 'pending': {
				const actions: Array<{
					status: OverallCollaborationStatus;
					label: string;
					description: string;
					variant: 'primary' | 'secondary' | 'danger';
				}> = [];
				// Only owner can accept/refuse
				if (isOwner) {
					actions.push(
						{
							status: 'accepted',
							label: 'Accepter',
							description: 'Accepter cette collaboration',
							variant: 'primary',
						},
						{
							status: 'rejected',
							label: 'Refuser',
							description: 'Refuser cette collaboration',
							variant: 'danger',
						},
					);
				}
				// Request initiator can cancel while pending
				if (isCollaborator) {
					actions.push({
						status: 'cancelled',
						label: 'Annuler',
						description: 'Annuler votre demande',
						variant: 'danger',
					});
				}
				return actions;
			}
			case 'accepted':
				// After accepted, both parties can proceed to signing (represented here as activate)
				return [
					{
						status: 'active',
						label: 'Signer le contrat',
						description: 'Signer pour activer la collaboration',
						variant: 'primary',
					},
					{
						status: 'cancelled',
						label: 'Annuler',
						description: 'Annuler cette collaboration',
						variant: 'danger',
					},
				];
			case 'active':
				// Always show completion button, but it will be disabled if "Affaire conclue" not validated
				return [
					{
						status: 'completed',
						label: 'Complété',
						description: 'Marquer comme complétée',
						variant: 'primary',
					},
					{
						status: 'cancelled',
						label: 'Annuler',
						description: 'Annuler cette collaboration',
						variant: 'danger',
					},
				];
			default:
				return [];
		}
	};

	const availableActions = getAvailableActions();
	const isReadOnly = ['completed', 'cancelled', 'rejected'].includes(
		currentStatus,
	);

	// Get completion reason details if collaboration is completed
	const reasonDetails =
		currentStatus === 'completed' && completionReason
			? getCompletionReasonDetails(completionReason)
			: null;

	return (
		<Card className="p-6">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h2 className="text-lg font-medium text-gray-900">
						Statut de la collaboration
					</h2>
					<p className="text-sm text-gray-600">
						État général de cette collaboration
					</p>
				</div>
				<OverallStatusBadge status={currentStatus} />
			</div>

			{/* Display completion reason if collaboration is completed */}
			{reasonDetails && (
				<div
					className="mb-6 p-4 border rounded-lg"
					style={{
						backgroundColor: reasonDetails.color.includes('green')
							? '#f0fdf4'
							: reasonDetails.color.includes('red')
								? '#fef2f2'
								: reasonDetails.color.includes('blue')
									? '#eff6ff'
									: '#f9fafb',
						borderColor: reasonDetails.color.includes('green')
							? '#bbf7d0'
							: reasonDetails.color.includes('red')
								? '#fecaca'
								: reasonDetails.color.includes('blue')
									? '#bfdbfe'
									: '#e5e7eb',
					}}
				>
					<div className="flex items-start">
						<span className="text-2xl mr-3">
							{reasonDetails.icon}
						</span>
						<div className="flex-1">
							<p className="text-sm font-semibold text-gray-900 mb-1">
								Raison de la clôture
							</p>
							<p
								className={`text-sm font-medium ${
									reasonDetails.color.includes('green')
										? 'text-green-700'
										: reasonDetails.color.includes('red')
											? 'text-red-700'
											: reasonDetails.color.includes(
														'blue',
												  )
												? 'text-brand-700'
												: 'text-gray-700'
								}`}
							>
								{reasonDetails.label}
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Read-only notice for final states */}
			{isReadOnly && (
				<div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
					<div className="flex items-center">
						<svg
							className="w-5 h-5 text-gray-600 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<p className="text-sm font-medium text-gray-700">
							Cette collaboration est dans un état final. Aucune
							modification n&apos;est possible.
						</p>
					</div>
				</div>
			)}

			{/* Notice when "Affaire conclue" is not validated yet */}
			{currentStatus === 'active' &&
				!isReadOnly &&
				!isAffaireConclueValidated() && (
					<div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
						<div className="flex items-start">
							<svg
								className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<div>
								<p className="text-sm font-medium text-amber-800">
									Étape &quot;Affaire conclue&quot; requise
								</p>
								<p className="text-sm text-amber-700 mt-1">
									Les deux parties doivent valider
									l&apos;étape &quot;Affaire conclue&quot;
									avant de pouvoir marquer cette collaboration
									comme complétée.
								</p>
							</div>
						</div>
					</div>
				)}

			{/* Action buttons for active states */}
			{canUpdate && !isReadOnly && availableActions.length > 0 && (
				<div className="space-y-4">
					{!showActions ? (
						<Button
							onClick={() => setShowActions(true)}
							variant="outline"
							className="w-full"
						>
							<svg
								className="w-4 h-4 mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
								/>
							</svg>
							{Components.UI.BUTTON_TEXT.editStatus}
						</Button>
					) : (
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-gray-900">
								Actions disponibles
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{availableActions.map((action) => {
									// Disable "Complété" button if "Affaire conclue" not validated
									const isCompleteAction =
										action.status === 'completed';
									const shouldDisable =
										isCompleteAction &&
										!isAffaireConclueValidated();

									return (
										<Button
											key={action.status}
											onClick={() =>
												handleStatusChange(
													action.status,
												)
											}
											loading={isUpdating}
											disabled={shouldDisable}
											variant={
												action.variant === 'primary'
													? 'primary'
													: 'outline'
											}
											className={
												action.variant === 'danger'
													? 'text-red-600 border-red-300 hover:bg-red-50'
													: action.variant ===
														  'primary'
														? 'bg-green-600 hover:bg-green-700'
														: ''
											}
										>
											{action.label}
										</Button>
									);
								})}
							</div>
							<Button
								onClick={() => setShowActions(false)}
								variant="outline"
								size="sm"
								className="w-full"
							>
								Annuler
							</Button>
						</div>
					)}
				</div>
			)}
		</Card>
	);
};
