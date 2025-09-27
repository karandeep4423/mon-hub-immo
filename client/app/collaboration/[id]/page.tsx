'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';

// Separated workflows
import { OverallStatusManager } from '@/components/collaboration/overall-status';
import { ProgressTracker } from '@/components/collaboration/progress-tracking';
import { ActivityManager } from '@/components/collaboration/shared';
import { ContractModal } from '@/components/collaboration/ContractModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-toastify';

// APIs
import { collaborationApi } from '@/lib/api/collaborationApi';

// Types
import { Collaboration } from '@/types/collaboration';
import { OverallCollaborationStatus } from '@/components/collaboration/overall-status/types';
import {
	ProgressStepData,
	ProgressStep,
	PROGRESS_STEPS_CONFIG,
	ProgressUpdate,
} from '@/components/collaboration/progress-tracking/types';
import type { Property } from '@/lib/api/propertyApi';

// Property type for when propertyId is populated
type PropertyDetails = Partial<Property> & { id?: string };

export default function CollaborationPage() {
	const params = useParams();
	const router = useRouter();
	const { user, loading } = useAuth();
	const collaborationId = params.id as string;

	// State management
	const [collaboration, setCollaboration] = useState<Collaboration | null>(
		null,
	);
	const [progressSteps, setProgressSteps] = useState<ProgressStepData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showContractModal, setShowContractModal] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [pendingAction, setPendingAction] =
		useState<OverallCollaborationStatus | null>(null);

	// Helper to determine user permissions
	const userId = user?.id || user?._id;
	const isOwner =
		user &&
		collaboration &&
		userId &&
		(userId === collaboration.propertyOwnerId?._id ||
			userId === collaboration.propertyOwnerId);
	const isCollaborator =
		user &&
		collaboration &&
		userId &&
		(userId === collaboration.collaboratorId?._id ||
			userId === collaboration.collaboratorId);
	const canUpdate = Boolean(isOwner || isCollaborator);
	const isActive = collaboration?.status === 'active';

	// Debug permissions (temporary)
	console.log('Permission Debug:', {
		userId,
		userIdFromId: user?.id,
		userIdFrom_id: user?._id,
		fullUser: user,
		propertyOwnerId: collaboration?.propertyOwnerId,
		collaboratorId: collaboration?.collaboratorId,
		isOwner,
		isCollaborator,
		canUpdate,
		collaborationType: typeof collaboration?.propertyOwnerId,
	});

	const fetchCollaboration = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			// Get basic collaboration data
			const response = await collaborationApi.getUserCollaborations();
			const foundCollaboration = response.collaborations.find(
				(c) => c._id === collaborationId,
			);

			if (!foundCollaboration) {
				setError('Collaboration non trouvée');
				return;
			}

			setCollaboration(foundCollaboration);

			// Extract progress steps from collaboration data or create defaults
			if (
				foundCollaboration.progressSteps &&
				foundCollaboration.progressSteps.length > 0
			) {
				// Transform backend progress steps to frontend format
				const transformedSteps = foundCollaboration.progressSteps.map(
					(step) => {
						const config = PROGRESS_STEPS_CONFIG[step.id];
						return {
							id: step.id,
							title: config?.title || step.id,
							description: config?.description || '',
							completed: step.completed,
							current:
								foundCollaboration.currentProgressStep ===
								step.id,
							completedAt: step.completedAt,
							notes: step.notes,
						};
					},
				);
				setProgressSteps(transformedSteps);
			} else {
				// Create default progress steps based on current collaboration step (fallback)
				const defaultSteps = Object.entries(PROGRESS_STEPS_CONFIG).map(
					([stepId, config], index) => ({
						id: stepId as ProgressStep,
						title: config.title,
						description: config.description,
						completed:
							foundCollaboration.currentStep === stepId ||
							(foundCollaboration.currentStep === 'completed' &&
								index <
									Object.keys(PROGRESS_STEPS_CONFIG).length -
										1),
						current: foundCollaboration.currentStep === stepId,
					}),
				);
				setProgressSteps(defaultSteps);
			}

			// Get property details
			try {
				// Property details no longer fetched
			} catch (error) {
				console.warn('Failed to fetch property details:', error);
			}
		} catch (err) {
			console.error('Error fetching collaboration:', err);
			setError('Erreur lors du chargement de la collaboration');
		} finally {
			setIsLoading(false);
		}
	}, [collaborationId]);

	useEffect(() => {
		if (!loading && user && collaborationId) {
			fetchCollaboration();
		}
	}, [loading, user, collaborationId, fetchCollaboration]);

	// Workflow 1: Overall status update handler -> map to real endpoints or open contract modal
	const handleOverallStatusUpdate = useCallback(
		async (newStatus: OverallCollaborationStatus) => {
			if (!collaboration) return;

			try {
				if (newStatus === 'accepted' || newStatus === 'rejected') {
					// Owner response to pending proposal
					await collaborationApi.respond(collaboration._id, {
						response: newStatus,
					});
				} else if (
					newStatus === 'cancelled' ||
					newStatus === 'completed'
				) {
					// Confirm before destructive actions
					setPendingAction(newStatus);
					setConfirmOpen(true);
					return;
				} else if (newStatus === 'active') {
					// Open contract modal for signing flow when collaboration is accepted
					if (collaboration.status === 'accepted') {
						setShowContractModal(true);
						return;
					}
					// If already active and user clicked, do nothing extra
				} else {
					// Fallback: add a note
					await collaborationApi.addNote(collaboration._id, {
						content: `Statut mis à jour: ${newStatus}`,
					});
				}

				await fetchCollaboration();
			} catch (error) {
				console.error('Error updating overall status:', error);
				setError('Erreur lors de la mise à jour du statut');
			}
		},
		[collaboration, fetchCollaboration],
	);

	const handleConfirmAction = useCallback(async () => {
		if (!collaboration || !pendingAction) return;
		try {
			setConfirmLoading(true);
			if (pendingAction === 'cancelled') {
				await collaborationApi.cancel(collaboration._id);
				toast.success('Collaboration annulée');
			} else if (pendingAction === 'completed') {
				await collaborationApi.complete(collaboration._id);
				toast.success('Collaboration terminée');
			}
			await fetchCollaboration();
			setConfirmOpen(false);
			setPendingAction(null);
		} catch (err) {
			console.error('Error executing action:', err);
			toast.error(
				err instanceof Error
					? err.message
					: 'Action impossible sur la collaboration',
			);
		} finally {
			setConfirmLoading(false);
		}
	}, [collaboration, pendingAction, fetchCollaboration]);

	// Workflow 2: Progress step update handler
	const handleProgressUpdate = useCallback(
		async (update: ProgressUpdate) => {
			// Block progress updates until collaboration is active
			if (!collaboration || collaboration.status !== 'active') {
				console.warn(
					'Progress update blocked: collaboration not active',
				);
				return;
			}
			try {
				// For now, just add a note about the progress update
				// TODO: Add proper backend endpoints for progress tracking
				await collaborationApi.addNote(collaborationId, {
					content: `Étape mise à jour: ${update.step}${
						update.notes ? ` - ${update.notes}` : ''
					}`,
				});
				await fetchCollaboration(); // Refresh data
			} catch (error) {
				console.error('Error updating progress:', error);
				setError('Erreur lors de la mise à jour du progrès');
			}
		},
		[collaboration, collaborationId, fetchCollaboration],
	);

	// Status modification handler (from modal) - NEW API
	const handleProgressStatusUpdate = useCallback(
		async (update: { targetStep: string; notes?: string }) => {
			// Block status mutation until collaboration is active
			if (!collaboration || collaboration.status !== 'active') {
				console.warn(
					'Progress status update blocked: collaboration not active',
				);
				return;
			}
			try {
				// Use the new progress status API
				await collaborationApi.updateProgressStatus(collaborationId, {
					targetStep: update.targetStep,
					notes: update.notes,
				});
				await fetchCollaboration(); // Refresh data
			} catch (error) {
				console.error('Error updating progress status:', error);
				setError('Erreur lors de la mise à jour du statut');
			}
		},
		[collaboration, collaborationId, fetchCollaboration],
	);

	// Activity management handler
	const handleAddActivity = useCallback(
		async (content: string) => {
			if (!collaboration || collaboration.status !== 'active') {
				console.warn('Add activity blocked: collaboration not active');
				return;
			}

			try {
				await collaborationApi.addNote(collaboration._id, {
					content,
				});
				await fetchCollaboration(); // Refresh data
			} catch (error) {
				console.error('Error adding activity:', error);
				throw error; // Re-throw for component error handling
			}
		},
		[collaboration, fetchCollaboration],
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<ConfirmDialog
				isOpen={confirmOpen}
				title={
					pendingAction === 'cancelled'
						? 'Annuler la collaboration ?'
						: 'Terminer la collaboration ?'
				}
				description={
					pendingAction === 'cancelled'
						? 'Cette action annulera la collaboration en cours. Voulez-vous continuer ?'
						: 'Cette action marquera la collaboration comme terminée. Voulez-vous continuer ?'
				}
				onCancel={() => {
					setConfirmOpen(false);
					setPendingAction(null);
				}}
				onConfirm={handleConfirmAction}
				confirmText={
					pendingAction === 'cancelled'
						? 'Oui, annuler'
						: 'Oui, terminer'
				}
				cancelText="Non, revenir"
				variant={pendingAction === 'completed' ? 'danger' : 'warning'}
				loading={confirmLoading}
			/>
			{showContractModal && collaboration && (
				<ContractModal
					isOpen={showContractModal}
					onClose={() => setShowContractModal(false)}
					collaboration={collaboration}
					onUpdate={async () => {
						await fetchCollaboration();
					}}
				/>
			)}
			{/* Loading state */}
			{(loading || isLoading) && (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto"></div>
						<p className="mt-4 text-gray-600">Chargement...</p>
					</div>
				</div>
			)}

			{/* Error state */}
			{(error || !collaboration) && !loading && !isLoading && (
				<div className="min-h-screen flex items-center justify-center">
					<div className="text-center">
						<p className="text-red-600 mb-4">
							{error || 'Collaboration non trouvée'}
						</p>
						<Button onClick={() => router.push('/dashboard')}>
							Retour au tableau de bord
						</Button>
					</div>
				</div>
			)}

			{/* Main content */}
			{collaboration && !loading && !isLoading && !error && (
				<div>
					{/* Header */}
					<div className="bg-white shadow-sm">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center justify-between py-6">
								<div className="flex items-center space-x-4">
									<Button
										onClick={() => router.back()}
										variant="outline"
										size="sm"
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
												d="M10 19l-7-7m0 0l7-7m-7 7h18"
											/>
										</svg>
										Retour
									</Button>
									<div>
										<h1 className="text-2xl font-bold text-gray-900">
											Collaboration - &quot;Bien
											immobilier&quot;
										</h1>
										<div className="flex items-center space-x-4 mt-1">
											<div className="flex items-center space-x-1 text-gray-600">
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
														d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
													/>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth="2"
														d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
													/>
												</svg>
												<span>Ville</span>
											</div>
										</div>
									</div>
								</div>
								<Button
									onClick={() =>
										router.push(
											`/chat?userId=${
												isOwner
													? collaboration
															.collaboratorId
															?._id ||
														collaboration.collaboratorId
													: collaboration
															.propertyOwnerId
															?._id ||
														collaboration.propertyOwnerId
											}`,
										)
									}
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
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										/>
									</svg>
									Chat
								</Button>
							</div>
						</div>
					</div>

					{/* Workflow components */}
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2 space-y-6">
								<OverallStatusManager
									collaborationId={collaboration._id}
									currentStatus={collaboration.status}
									canUpdate={canUpdate}
									isOwner={Boolean(isOwner)}
									isCollaborator={Boolean(isCollaborator)}
									onStatusUpdate={handleOverallStatusUpdate}
								/>

								<ProgressTracker
									collaborationId={collaboration._id}
									currentStep="proposal"
									steps={progressSteps}
									canUpdate={canUpdate && isActive}
									onStepUpdate={handleProgressUpdate}
									onStatusUpdate={handleProgressStatusUpdate}
								/>

								{/* Activities Section */}
								<ActivityManager
									collaborationId={collaboration._id}
									activities={collaboration.activities
										.sort(
											(a, b) =>
												new Date(
													b.createdAt,
												).getTime() -
												new Date(a.createdAt).getTime(),
										)
										.map((activity, index) => ({
											id: `activity-${index}`,
											type:
												activity.type === 'note'
													? 'note'
													: 'status_update',
											title:
												activity.type === 'note'
													? 'Note ajoutée'
													: activity.message,
											content: activity.message,
											author: {
												id:
													activity.createdBy ||
													'unknown',
												name: 'Utilisateur', // Would need to fetch user details
												role: 'agent' as const, // Would need to determine from user data
											},
											createdAt: activity.createdAt,
										}))}
									canAddActivity={canUpdate && isActive}
									onAddActivity={handleAddActivity}
									onRefresh={fetchCollaboration}
								/>
							</div>

							<div className="space-y-6">
								{/* Property Information */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										🏠 Bien immobilier
									</h3>
									<div className="space-y-3">
										<div>
											<span className="text-sm text-gray-600">
												Référence:
											</span>
											<p className="font-medium">
												{typeof collaboration.propertyId ===
												'object'
													? (
															collaboration.propertyId as PropertyDetails
														)?._id ||
														(
															collaboration.propertyId as PropertyDetails
														)?.id ||
														'N/A'
													: collaboration.propertyId}
											</p>
										</div>
										{typeof collaboration.propertyId ===
											'object' &&
											(
												collaboration.propertyId as PropertyDetails
											)?.title && (
												<div>
													<span className="text-sm text-gray-600">
														Titre:
													</span>
													<p className="font-medium">
														{
															(
																collaboration.propertyId as PropertyDetails
															).title
														}
													</p>
												</div>
											)}
										{typeof collaboration.propertyId ===
											'object' &&
											(
												collaboration.propertyId as PropertyDetails
											)?.formattedPrice && (
												<div>
													<span className="text-sm text-gray-600">
														Prix:
													</span>
													<p className="font-medium">
														{
															(
																collaboration.propertyId as PropertyDetails
															).formattedPrice
														}
													</p>
												</div>
											)}
										{typeof collaboration.propertyId ===
											'object' &&
											(
												collaboration.propertyId as PropertyDetails
											)?.displaySurface && (
												<div>
													<span className="text-sm text-gray-600">
														Surface:
													</span>
													<p className="font-medium">
														{
															(
																collaboration.propertyId as PropertyDetails
															).displaySurface
														}
													</p>
												</div>
											)}
										<div>
											<span className="text-sm text-gray-600">
												Localisation:
											</span>
											<p className="font-medium">
												{typeof collaboration.propertyId ===
													'object' &&
												(
													collaboration.propertyId as PropertyDetails
												)?.address
													? (
															collaboration.propertyId as PropertyDetails
														).address
													: 'Ville'}
											</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">
												Statut:
											</span>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
													collaboration.status ===
													'active'
														? 'bg-green-100 text-green-800'
														: collaboration.status ===
															  'pending'
															? 'bg-yellow-100 text-yellow-800'
															: 'bg-gray-100 text-gray-800'
												}`}
											>
												{collaboration.status ===
												'active'
													? 'Active'
													: collaboration.status ===
														  'pending'
														? 'En attente'
														: collaboration.status}
											</span>
										</div>
									</div>
								</Card>

								{/* Agents Information */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										👥 Intervenants
									</h3>
									<div className="space-y-4">
										<div>
											<h4 className="text-sm font-medium text-gray-900 mb-2">
												Propriétaire du bien
											</h4>
											<div className="flex items-center space-x-3">
												<ProfileAvatar
													user={
														collaboration.propertyOwnerId
													}
													size="sm"
												/>
												<div>
													<p className="font-medium text-sm">
														{
															collaboration
																.propertyOwnerId
																.firstName
														}{' '}
														{
															collaboration
																.propertyOwnerId
																.lastName
														}
													</p>
													<p className="text-xs text-gray-600">
														Agent propriétaire
													</p>
												</div>
											</div>
										</div>

										<div>
											<h4 className="text-sm font-medium text-gray-900 mb-2">
												Collaborateur
											</h4>
											<div className="flex items-center space-x-3">
												<ProfileAvatar
													user={
														collaboration.collaboratorId
													}
													size="sm"
												/>
												<div>
													<p className="font-medium text-sm">
														{
															collaboration
																.collaboratorId
																.firstName
														}{' '}
														{
															collaboration
																.collaboratorId
																.lastName
														}
													</p>
													<p className="text-xs text-gray-600">
														Agent apporteur
													</p>
												</div>
											</div>
										</div>
									</div>
								</Card>

								{/* Commission Details */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										💰 Répartition commission
									</h3>

									<div className="space-y-3">
										<div className="flex justify-between items-center">
											<span className="text-gray-600">
												Agent propriétaire:
											</span>
											<span className="font-medium text-blue-600">
												{100 -
													collaboration.proposedCommission}
												%
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-gray-600">
												Agent apporteur:
											</span>
											<span className="font-medium text-green-600">
												{
													collaboration.proposedCommission
												}
												%
											</span>
										</div>
										<hr className="my-3" />
										<div className="flex justify-between items-center">
											<span className="text-gray-600 font-medium">
												Votre part:
											</span>
											<span className="font-bold text-lg text-blue-600">
												{isOwner
													? 100 -
														collaboration.proposedCommission
													: collaboration.proposedCommission}
												%
											</span>
										</div>
									</div>
								</Card>

								{/* Contract Status */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										📋 Statut du contrat
									</h3>
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Propriétaire:
											</span>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
													collaboration.ownerSigned
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{collaboration.ownerSigned
													? '✓ Signé'
													: '⏳ En attente'}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-gray-600">
												Collaborateur:
											</span>
											<span
												className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
													collaboration.collaboratorSigned
														? 'bg-green-100 text-green-800'
														: 'bg-yellow-100 text-yellow-800'
												}`}
											>
												{collaboration.collaboratorSigned
													? '✓ Signé'
													: '⏳ En attente'}
											</span>
										</div>
										{collaboration.ownerSignedAt && (
											<div className="text-xs text-gray-500">
												Signé le:{' '}
												{new Date(
													collaboration.ownerSignedAt,
												).toLocaleDateString('fr-FR')}
											</div>
										)}
									</div>
								</Card>

								{/* Collaboration Timeline */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										⏰ Chronologie
									</h3>
									<div className="space-y-3">
										<div>
											<span className="text-sm text-gray-600">
												Créée le:
											</span>
											<p className="font-medium">
												{new Date(
													collaboration.createdAt,
												).toLocaleDateString('fr-FR', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">
												Dernière mise à jour:
											</span>
											<p className="font-medium">
												{new Date(
													collaboration.updatedAt,
												).toLocaleDateString('fr-FR', {
													day: 'numeric',
													month: 'long',
													year: 'numeric',
													hour: '2-digit',
													minute: '2-digit',
												})}
											</p>
										</div>
										<div>
											<span className="text-sm text-gray-600">
												Étape actuelle:
											</span>
											<p className="font-medium capitalize">
												{collaboration.currentProgressStep.replace(
													'_',
													' ',
												)}
											</p>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
