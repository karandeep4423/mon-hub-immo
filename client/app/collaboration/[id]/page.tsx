'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/context/SocketContext';
import { useMutation } from '@/hooks/useMutation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { TOAST_MESSAGES } from '@/lib/constants';

// New detail components
import {
	CollaborationHeader,
	CollaborationParticipants,
	CollaborationContract,
	CollaborationTimeline,
	CollaborationPostInfo,
	CollaborationClientInfo,
	CollaborationChat,
	CollaborationChatButton,
} from '@/components/collaboration/detail';

// Separated workflows
import { OverallStatusManager } from '@/components/collaboration/overall-status';
import { ProgressTracker } from '@/components/collaboration/progress-tracking';
import { ActivityManager } from '@/components/collaboration/shared';
import { ContractModal } from '@/components/collaboration/ContractModal';
import { ContractViewModal } from '@/components/contract';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { toast } from 'react-toastify';

// APIs
import { collaborationApi } from '@/lib/api/collaborationApi';
import { PropertyService, type Property } from '@/lib/api/propertyApi';
import searchAdApi from '@/lib/api/searchAdApi';

// Types
import { Collaboration } from '@/types/collaboration';
import { OverallCollaborationStatus } from '@/components/collaboration/overall-status/types';
import {
	ProgressStepData,
	ProgressStep,
	PROGRESS_STEPS_CONFIG,
	ProgressUpdate,
} from '@/components/collaboration/progress-tracking/types';
import type { SearchAd } from '@/types/searchAd';

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
	const [property, setProperty] = useState<Property | null>(null);
	const [searchAd, setSearchAd] = useState<SearchAd | null>(null);
	const [progressSteps, setProgressSteps] = useState<ProgressStepData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showContractModal, setShowContractModal] = useState(false);
	const [showContractViewModal, setShowContractViewModal] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [pendingAction, setPendingAction] =
		useState<OverallCollaborationStatus | null>(null);
	const [isChatOpen, setIsChatOpen] = useState(false);

	// Mutation for cancel/complete actions
	const { mutate: performAction, loading: confirmLoading } = useMutation(
		async (data: { id: string; action: 'cancelled' | 'completed' }) => {
			if (data.action === 'cancelled') {
				return await collaborationApi.cancel(data.id);
			} else {
				return await collaborationApi.complete(data.id);
			}
		},
		{
			onSuccess: async (_, variables) => {
				toast.success(
					variables.action === 'cancelled'
						? TOAST_MESSAGES.COLLABORATION.CANCEL_SUCCESS
						: TOAST_MESSAGES.COLLABORATION.COMPLETE_SUCCESS,
				);
				await fetchCollaboration();
				setConfirmOpen(false);
				setPendingAction(null);
			},
			errorMessage: TOAST_MESSAGES.COLLABORATION.STATUS_UPDATE_ERROR,
		},
	);

	// Helper to determine user permissions
	const userId = user?.id || user?._id;
	const isOwner =
		user &&
		collaboration &&
		userId &&
		(userId === collaboration.postOwnerId?._id ||
			userId === (collaboration.postOwnerId as unknown as string));
	const isCollaborator =
		user &&
		collaboration &&
		userId &&
		(userId === collaboration.collaboratorId?._id ||
			userId === (collaboration.collaboratorId as unknown as string));
	const canUpdate = Boolean(isOwner || isCollaborator);
	const isActive = collaboration?.status === 'active';

	// Chat integration
	const { selectedUser, setSelectedUser, getUserById, users, getUsers } =
		useChat();
	const { onlineUsers } = useSocket();

	// Initialize chat users when component mounts
	useEffect(() => {
		if (user && !loading) {
			getUsers();
		}
	}, [user, loading, getUsers]);

	// Chat peer resolution based on current user and collaboration
	const resolvePeerId = useCallback((): string | null => {
		if (!collaboration || !userId) return null;
		const owner =
			typeof collaboration.postOwnerId === 'string'
				? collaboration.postOwnerId
				: collaboration.postOwnerId?._id;
		const collaborator =
			typeof collaboration.collaboratorId === 'string'
				? collaboration.collaboratorId
				: collaboration.collaboratorId?._id;
		if (!owner || !collaborator) return null;
		return userId === owner ? collaborator : owner;
	}, [collaboration, userId]);

	// Get peer user and their unread count
	const peerId = resolvePeerId();
	const peerUser = users.find((u) => u._id === peerId);
	const unreadCount = peerUser?.unreadCount || 0;

	const openChat = useCallback(async () => {
		const peerId = resolvePeerId();
		if (!peerId) return;
		// If already selected, just open
		if (selectedUser?._id === peerId) {
			setIsChatOpen(true);
			return;
		}
		// Fetch peer details via chat store and select
		const user = await getUserById(peerId);
		if (user) setSelectedUser(user);
		setIsChatOpen(true);
	}, [resolvePeerId, selectedUser?._id, getUserById, setSelectedUser]);

	const closeChat = useCallback(() => {
		setIsChatOpen(false);
		// Do not clear selectedUser to keep context when reopening; server thread tracking is handled in useChat
	}, []);

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

			// Check for missing participant data
			if (
				!foundCollaboration.postOwnerId ||
				!foundCollaboration.collaboratorId
			) {
				setError('Données de collaboration incomplètes');
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
							validatedAt: step.validatedAt,
							ownerValidated: step.ownerValidated,
							collaboratorValidated: step.collaboratorValidated,
							notes: step.notes || [],
						};
					},
				);
				setProgressSteps(transformedSteps);
			} else {
				// Create default progress steps based on current collaboration step (fallback)
				const defaultSteps = Object.entries(PROGRESS_STEPS_CONFIG).map(
					([stepId, config]) => ({
						id: stepId as ProgressStep,
						title: config.title,
						description: config.description,
						completed: false,
						current:
							foundCollaboration.currentProgressStep === stepId,
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					}),
				);
				setProgressSteps(defaultSteps);
			}

			// Fetch Property or SearchAd details based on postType
			try {
				const postId =
					typeof foundCollaboration.postId === 'string'
						? foundCollaboration.postId
						: foundCollaboration.postId?._id;

				if (postId) {
					if (foundCollaboration.postType === 'Property') {
						const propertyData =
							await PropertyService.getPropertyById(postId);
						setProperty(propertyData);
					} else if (foundCollaboration.postType === 'SearchAd') {
						const searchAdData =
							await searchAdApi.getSearchAdById(postId);
						setSearchAd(searchAdData);
					}
				}
			} catch {
				// Failed to fetch post details - non-critical error
			}
		} catch {
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
			} catch {
				setError('Erreur lors de la mise à jour du statut');
			}
		},
		[collaboration, fetchCollaboration],
	);

	const handleConfirmAction = useCallback(async () => {
		if (!collaboration || !pendingAction) return;
		await performAction({
			id: collaboration._id,
			action: pendingAction as 'cancelled' | 'completed',
		});
	}, [collaboration, pendingAction, performAction]);

	// Workflow 2: Progress step update handler
	const handleProgressUpdate = useCallback(
		async (update: ProgressUpdate) => {
			// Block progress updates until collaboration is active
			if (!collaboration || collaboration.status !== 'active') {
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
			} catch {
				setError('Erreur lors de la mise à jour du progrès');
			}
		},
		[collaboration, collaborationId, fetchCollaboration],
	);

	// Status modification handler (from modal) - NEW API
	const handleProgressStatusUpdate = useCallback(
		async (update: {
			targetStep: string;
			notes?: string;
			validatedBy: 'owner' | 'collaborator';
		}) => {
			// Block status mutation until collaboration is active
			if (!collaboration || collaboration.status !== 'active') {
				return;
			}
			try {
				// Use the new progress status API
				await collaborationApi.updateProgressStatus(collaborationId, {
					targetStep: update.targetStep,
					notes: update.notes,
					validatedBy: update.validatedBy,
				});
				await fetchCollaboration(); // Refresh data
			} catch {
				setError('Erreur lors de la mise à jour du statut');
			}
		},
		[collaboration, collaborationId, fetchCollaboration],
	);

	// Activity management handler
	const handleAddActivity = useCallback(
		async (content: string) => {
			if (!collaboration || collaboration.status !== 'active') {
				return;
			}

			try {
				await collaborationApi.addNote(collaboration._id, {
					content,
				});
				await fetchCollaboration(); // Refresh data
			} catch (error) {
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
				<PageLoader message="Chargement..." />
			)}{' '}
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
					<CollaborationHeader onBack={() => router.back()} />

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
									currentStep={
										collaboration.currentProgressStep
									}
									steps={progressSteps}
									canUpdate={canUpdate && isActive}
									isOwner={Boolean(isOwner)}
									isCollaborator={Boolean(isCollaborator)}
									ownerUser={
										typeof collaboration.postOwnerId ===
										'object'
											? collaboration.postOwnerId
											: undefined
									}
									collaboratorUser={
										typeof collaboration.collaboratorId ===
										'object'
											? collaboration.collaboratorId
											: undefined
									}
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
										.map((activity, index) => {
											// Resolve user data from collaboration participants
											const isOwnerAction =
												activity.createdBy ===
												collaboration.postOwnerId?._id;
											const userInfo = isOwnerAction
												? collaboration.postOwnerId
												: collaboration.collaboratorId;
											return {
												id: `activity-${index}`,
												type:
													activity.type === 'note'
														? 'note'
														: 'status_update',
												title:
													activity.type === 'note'
														? 'Note ajoutée'
														: activity.message,
												content:
													activity.type === 'note'
														? activity.message
														: '', // Don't duplicate message for status updates
												author: {
													id:
														activity.createdBy ||
														'unknown',
													name: userInfo
														? `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim() ||
															'Utilisateur'
														: 'Utilisateur',
													role: isOwnerAction
														? ('agent' as const)
														: ('apporteur' as const),
													profileImage:
														userInfo?.profileImage,
												},
												createdAt: activity.createdAt,
											};
										})}
									canAddActivity={canUpdate && isActive}
									onAddActivity={handleAddActivity}
									onRefresh={fetchCollaboration}
								/>
							</div>

							<div className="space-y-6">
								{/* Property or SearchAd Information */}
								<CollaborationPostInfo
									collaboration={collaboration}
									property={property}
									searchAd={searchAd}
								/>
								{/* Client Information - Only visible for Property collaborations */}
								<CollaborationClientInfo
									collaboration={collaboration}
									property={property}
								/>
								{/* Agents Information */}
								<CollaborationParticipants
									collaboration={collaboration}
								/>
								{/* Prix et frais - Show if agency fees exist */}
								{typeof collaboration.postId === 'object' &&
									(collaboration.postId as PropertyDetails)
										?.agencyFeesPercentage && (
										<Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
											<h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
												<span>�</span> Prix et frais
											</h3>

											<div className="space-y-3 bg-white/70 rounded-lg p-4">
												<div className="flex justify-between items-center py-2">
													<span className="text-gray-700 font-medium">
														Prix net vendeur
													</span>
													<span className="text-xl font-bold text-gray-900">
														{(
															collaboration.postId as PropertyDetails
														)?.price?.toLocaleString()}{' '}
														€
													</span>
												</div>
												<div className="flex justify-between items-center py-2 bg-gray-50 px-3 rounded">
													<span className="text-gray-700">
														% frais d&apos;agence
													</span>
													<span className="text-lg font-semibold text-cyan-600">
														{
															(
																collaboration.postId as PropertyDetails
															)
																?.agencyFeesPercentage
														}{' '}
														%
													</span>
												</div>
												<div className="flex justify-between items-center py-2 pl-6">
													<span className="text-gray-600">
														→ Frais d&apos;agence
													</span>
													<span className="text-lg font-medium text-gray-800">
														{(
															collaboration.postId as PropertyDetails
														)?.agencyFeesAmount?.toLocaleString()}{' '}
														€
													</span>
												</div>
												<div className="flex justify-between items-center py-2 pl-6 border-t pt-3">
													<span className="text-gray-600">
														→ Prix FAI
													</span>
													<span className="text-lg font-semibold text-blue-600">
														{(
															collaboration.postId as PropertyDetails
														)?.priceIncludingFees?.toLocaleString()}{' '}
														€
													</span>
												</div>
											</div>
										</Card>
									)}
								{/* Commission Details */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										{collaboration.compensationType ===
										'gift_vouchers'
											? '🎁 Chèques cadeaux'
											: collaboration.compensationType ===
												  'fixed_amount'
												? '💰 Montant fixe'
												: '💰 Répartition commission'}
									</h3>

									<div className="space-y-3">
										{/* Gift Vouchers Display */}
										{collaboration.compensationType ===
											'gift_vouchers' && (
											<div className="text-center py-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
												<p className="text-sm text-gray-600 mb-2">
													Chèques cadeaux pour le
													collaborateur
												</p>
												<p className="text-4xl font-bold text-purple-600">
													{collaboration.compensationAmount ||
														0}
												</p>
												<p className="text-xs text-gray-500 mt-1">
													chèques cadeaux
												</p>
											</div>
										)}

										{/* Fixed Amount Display */}
										{collaboration.compensationType ===
											'fixed_amount' && (
											<div className="text-center py-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
												<p className="text-sm text-gray-600 mb-2">
													Montant fixe pour le
													collaborateur
												</p>
												<p className="text-4xl font-bold text-green-600">
													{(
														collaboration.compensationAmount ||
														0
													).toLocaleString()}{' '}
													€
												</p>
											</div>
										)}

										{/* Percentage Commission Display */}
										{(!collaboration.compensationType ||
											collaboration.compensationType ===
												'percentage') && (
											<>
												<div className="flex justify-between items-center">
													<span className="text-gray-600">
														Part collaborateur
													</span>
													<span className="font-medium text-green-600 text-lg">
														{
															collaboration.proposedCommission
														}{' '}
														%
													</span>
												</div>

												{typeof collaboration.postId ===
													'object' &&
													(
														collaboration.postId as PropertyDetails
													)?.agencyFeesAmount && (
														<>
															<div className="flex justify-between items-center py-2 pl-6 bg-green-50 px-3 rounded">
																<span className="text-gray-600">
																	→ Commission
																	collaborateur
																</span>
																<span className="text-lg font-semibold text-green-600">
																	{(
																		((
																			collaboration.postId as PropertyDetails
																		)
																			?.agencyFeesAmount ||
																			0) *
																		(collaboration.proposedCommission /
																			100)
																	).toLocaleString()}{' '}
																	€
																</span>
															</div>
															<div className="flex justify-between items-center py-2 pl-6 bg-blue-50 px-3 rounded">
																<span className="text-gray-600">
																	→ Commission
																	mandataire
																</span>
																<span className="text-lg font-semibold text-blue-600">
																	{(
																		((
																			collaboration.postId as PropertyDetails
																		)
																			?.agencyFeesAmount ||
																			0) *
																		((100 -
																			collaboration.proposedCommission) /
																			100)
																	).toLocaleString()}{' '}
																	€
																</span>
															</div>
														</>
													)}

												{/* Show message if no agency fees configured */}
												{typeof collaboration.postId ===
													'object' &&
													!(
														collaboration.postId as PropertyDetails
													)?.agencyFeesAmount && (
														<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
															<p className="text-sm text-amber-800">
																ℹ️ Les montants
																en euros seront
																affichés une
																fois que les
																frais
																d&apos;agence
																seront
																configurés sur
																le bien.
															</p>
														</div>
													)}
											</>
										)}
									</div>
								</Card>{' '}
								{/* Contract Status */}
								<CollaborationContract
									collaboration={collaboration}
									onViewContract={() =>
										setShowContractViewModal(true)
									}
								/>
								{/* Collaboration Timeline */}
								<CollaborationTimeline
									collaboration={collaboration}
								/>
							</div>
						</div>
					</div>
				</div>
			)}
			{/* Floating Chat Button */}
			{!isChatOpen && collaboration && (
				<CollaborationChatButton
					unreadCount={unreadCount}
					onClick={openChat}
				/>
			)}
			{/* Right-hand chat panel */}
			<CollaborationChat
				isOpen={isChatOpen}
				selectedUser={selectedUser}
				onlineUsers={onlineUsers}
				onClose={closeChat}
			/>
			{/* Contract View Modal */}
			{collaboration && (
				<ContractViewModal
					isOpen={showContractViewModal}
					onClose={() => setShowContractViewModal(false)}
					contractText={
						collaboration.contractText ||
						'Contenu du contrat non disponible.'
					}
					collaboration={collaboration}
				/>
			)}
		</div>
	);
}
