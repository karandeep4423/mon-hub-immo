import React, { useState } from 'react';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { OverallStatusManagerProps, OverallCollaborationStatus } from './types';
import { OverallStatusBadge } from './OverallStatusBadge';

export const OverallStatusManager: React.FC<OverallStatusManagerProps> = ({
	currentStatus,
	canUpdate,
	isOwner,
	isCollaborator,
	onStatusUpdate,
}) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [showActions, setShowActions] = useState(false);

	const handleStatusChange = async (
		newStatus: OverallCollaborationStatus,
	) => {
		if (!onStatusUpdate) return;

		setIsUpdating(true);
		try {
			await onStatusUpdate(newStatus);
			setShowActions(false);
		} catch (error) {
			console.error('Error updating status:', error);
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
				return [
					{
						status: 'completed',
						label: 'Terminer',
						description: 'Marquer comme terminée',
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
							Modifier le statut
						</Button>
					) : (
						<div className="space-y-3">
							<h3 className="text-sm font-medium text-gray-900">
								Actions disponibles
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{availableActions.map((action) => (
									<Button
										key={action.status}
										onClick={() =>
											handleStatusChange(action.status)
										}
										disabled={isUpdating}
										variant={
											action.variant === 'primary'
												? 'primary'
												: 'outline'
										}
										className={
											action.variant === 'danger'
												? 'text-red-600 border-red-300 hover:bg-red-50'
												: action.variant === 'primary'
													? 'bg-green-600 hover:bg-green-700'
													: ''
										}
									>
										{action.label}
									</Button>
								))}
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
