'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import ChatMessages from '@/components/chat/ChatMessages';
import MessageInput from '@/components/chat/MessageInput';
import { useChat } from '@/hooks/useChat';
import { useSocket } from '@/context/SocketContext';
import { getDetailedUserPresenceText } from '@/components/chat/utils';

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
	const [showContractViewModal, setShowContractViewModal] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);
	const [confirmLoading, setConfirmLoading] = useState(false);
	const [pendingAction, setPendingAction] =
		useState<OverallCollaborationStatus | null>(null);
	const [isChatOpen, setIsChatOpen] = useState(false);

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
			typeof collaboration.propertyOwnerId === 'string'
				? collaboration.propertyOwnerId
				: collaboration.propertyOwnerId?._id;
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

	// Debug chat state
	console.log('Chat Debug:', {
		peerId,
		peerUser,
		unreadCount,
		usersLoaded: users.length,
		collaboration: !!collaboration,
		isChatOpen,
	});

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
		async (update: {
			targetStep: string;
			notes?: string;
			validatedBy: 'owner' | 'collaborator';
		}) => {
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
					validatedBy: update.validatedBy,
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
									currentStep={
										collaboration.currentProgressStep
									}
									steps={progressSteps}
									canUpdate={canUpdate && isActive}
									isOwner={Boolean(isOwner)}
									isCollaborator={Boolean(isCollaborator)}
									ownerUser={
										typeof collaboration.propertyOwnerId ===
										'object'
											? collaboration.propertyOwnerId
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
												collaboration.propertyOwnerId
													._id;
											const userInfo = isOwnerAction
												? collaboration.propertyOwnerId
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
								{/* Property Information */}
								<Card className="p-6">
									<h3 className="text-lg font-medium text-gray-900 mb-4">
										🏠 Bien immobilier
									</h3>

									{/* Property Main Image */}
									{typeof collaboration.propertyId ===
										'object' &&
										(
											collaboration.propertyId as PropertyDetails
										)?.mainImage && (
											<div className="mb-4">
												<div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 relative">
													<Image
														src={
															typeof (
																collaboration.propertyId as PropertyDetails
															).mainImage ===
															'object'
																? (
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			.mainImage as {
																			url: string;
																		}
																	).url
																: ((
																		collaboration.propertyId as PropertyDetails
																	)
																		.mainImage as string)
														}
														alt={
															(
																collaboration.propertyId as PropertyDetails
															).title ||
															'Property image'
														}
														fill
														className="object-cover"
														onError={(e) => {
															const target =
																e.target as HTMLImageElement;
															target.style.display =
																'none';
														}}
													/>
												</div>
											</div>
										)}

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
								{/* Client Information - Only visible in collaboration */}
								{typeof collaboration.propertyId === 'object' &&
									(
										collaboration.propertyId as PropertyDetails
									)?.clientInfo &&
									(collaboration.status === 'accepted' ||
										collaboration.status === 'active' ||
										collaboration.status ===
											'completed') && (
										<Card className="p-6 bg-blue-50 border-blue-200">
											<h3 className="text-lg font-medium text-gray-900 mb-4">
												🔒 Informations client
												confidentielles
											</h3>
											<p className="text-sm text-blue-600 mb-4">
												Ces informations sont
												confidentielles et uniquement
												visibles dans le cadre de cette
												collaboration.
											</p>

											{/* Commercial Details */}
											{(
												collaboration.propertyId as PropertyDetails
											)?.clientInfo
												?.commercialDetails && (
												<div className="mb-6 p-4 bg-white rounded-lg">
													<h4 className="font-medium text-gray-900 mb-3 flex items-center">
														<span className="mr-2">
															💡
														</span>
														Détails commerciaux
													</h4>
													<div className="space-y-3 text-sm">
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.commercialDetails
															?.strengths && (
															<div>
																<span className="font-medium text-gray-700">
																	Points
																	forts:
																</span>
																<p className="text-gray-600 mt-1">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.commercialDetails
																			?.strengths
																	}
																</p>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.commercialDetails
															?.weaknesses && (
															<div>
																<span className="font-medium text-gray-700">
																	Points
																	faibles:
																</span>
																<p className="text-gray-600 mt-1">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.commercialDetails
																			?.weaknesses
																	}
																</p>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.commercialDetails
															?.occupancyStatus && (
															<div>
																<span className="font-medium text-gray-700">
																	Occupation:
																</span>
																<span className="ml-2 text-gray-600">
																	{(
																		collaboration.propertyId as PropertyDetails
																	)
																		?.clientInfo
																		?.commercialDetails
																		?.occupancyStatus ===
																	'occupied'
																		? 'Occupé'
																		: 'Vide'}
																</span>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.commercialDetails
															?.openToLowerOffers && (
															<div className="text-green-600">
																✓ Ouvert aux
																offres
																&quot;coup de
																coeur&quot;
															</div>
														)}
													</div>
												</div>
											)}

											{/* Property History */}
											{(
												collaboration.propertyId as PropertyDetails
											)?.clientInfo?.propertyHistory && (
												<div className="mb-6 p-4 bg-white rounded-lg">
													<h4 className="font-medium text-gray-900 mb-3 flex items-center">
														<span className="mr-2">
															📅
														</span>
														Historique du bien
													</h4>
													<div className="space-y-3 text-sm">
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.propertyHistory
															?.listingDate && (
															<div>
																<span className="font-medium text-gray-700">
																	Mise en
																	vente:
																</span>
																<span className="ml-2 text-gray-600">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.propertyHistory
																			?.listingDate
																	}
																</span>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.propertyHistory
															?.lastVisitDate && (
															<div>
																<span className="font-medium text-gray-700">
																	Dernière
																	visite:
																</span>
																<span className="ml-2 text-gray-600">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.propertyHistory
																			?.lastVisitDate
																	}
																</span>
															</div>
														)}
														{typeof (
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.propertyHistory
															?.totalVisits ===
															'number' && (
															<div>
																<span className="font-medium text-gray-700">
																	Nombre de
																	visites:
																</span>
																<span className="ml-2 text-gray-600">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.propertyHistory
																			?.totalVisits
																	}
																</span>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.propertyHistory
															?.visitorFeedback && (
															<div>
																<span className="font-medium text-gray-700">
																	Retours
																	visiteurs:
																</span>
																<p className="text-gray-600 mt-1">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.propertyHistory
																			?.visitorFeedback
																	}
																</p>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo
															?.propertyHistory
															?.priceReductions && (
															<div>
																<span className="font-medium text-gray-700">
																	Historique
																	prix:
																</span>
																<p className="text-gray-600 mt-1">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.propertyHistory
																			?.priceReductions
																	}
																</p>
															</div>
														)}
													</div>
												</div>
											)}

											{/* Owner Information */}
											{(
												collaboration.propertyId as PropertyDetails
											)?.clientInfo?.ownerInfo && (
												<div className="p-4 bg-white rounded-lg">
													<h4 className="font-medium text-gray-900 mb-3 flex items-center">
														<span className="mr-2">
															🤝
														</span>
														Informations
														propriétaire
													</h4>
													<div className="space-y-3 text-sm">
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.urgentToSell && (
															<div className="text-orange-600">
																⚡ Pressés de
																vendre
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.openToNegotiation && (
															<div className="text-green-600">
																💬 Ouverts à la
																négociation
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.mandateType && (
															<div>
																<span className="font-medium text-gray-700">
																	Mandat:
																</span>
																<span className="ml-2 text-gray-600 capitalize">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.ownerInfo
																			?.mandateType
																	}
																</span>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.saleReasons && (
															<div>
																<span className="font-medium text-gray-700">
																	Raisons de
																	la vente:
																</span>
																<p className="text-gray-600 mt-1">
																	{
																		(
																			collaboration.propertyId as PropertyDetails
																		)
																			?.clientInfo
																			?.ownerInfo
																			?.saleReasons
																	}
																</p>
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.presentDuringVisits && (
															<div className="text-blue-600">
																👤 Présents
																pendant visites
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.flexibleSchedule && (
															<div className="text-blue-600">
																🕐 Horaires
																flexibles
															</div>
														)}
														{(
															collaboration.propertyId as PropertyDetails
														)?.clientInfo?.ownerInfo
															?.acceptConditionalOffers && (
															<div className="text-green-600">
																✓ Acceptent
																offres
																conditionnelles
															</div>
														)}
													</div>
												</div>
											)}
										</Card>
									)}
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
													user={{
														...collaboration.propertyOwnerId,
														profileImage:
															collaboration
																.propertyOwnerId
																.profileImage ||
															undefined,
													}}
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
													user={{
														...collaboration.collaboratorId,
														profileImage:
															collaboration
																.collaboratorId
																.profileImage ||
															undefined,
													}}
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
								{/* Prix et frais - Show if agency fees exist */}
								{typeof collaboration.propertyId === 'object' &&
									(
										collaboration.propertyId as PropertyDetails
									)?.agencyFeesPercentage && (
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
															collaboration.propertyId as PropertyDetails
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
																collaboration.propertyId as PropertyDetails
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
															collaboration.propertyId as PropertyDetails
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
															collaboration.propertyId as PropertyDetails
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
										💰 Répartition commission
									</h3>

									<div className="space-y-3">
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

										{typeof collaboration.propertyId ===
											'object' &&
											(
												collaboration.propertyId as PropertyDetails
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
																	collaboration.propertyId as PropertyDetails
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
																	collaboration.propertyId as PropertyDetails
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
										{typeof collaboration.propertyId ===
											'object' &&
											!(
												collaboration.propertyId as PropertyDetails
											)?.agencyFeesAmount && (
												<div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
													<p className="text-sm text-amber-800">
														ℹ️ Les montants en euros
														seront affichés une fois
														que les frais
														d&apos;agence seront
														configurés sur le bien.
													</p>
												</div>
											)}
									</div>
								</Card>{' '}
								{/* Contract Status */}
								<Card className="p-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-medium text-gray-900">
											📋 Statut du contrat
										</h3>
										<Button
											onClick={() =>
												setShowContractViewModal(true)
											}
											variant="outline"
											className="text-sm"
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
													strokeWidth={2}
													d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
												/>
											</svg>
											Voir le contrat
										</Button>
									</div>
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

			{/* Floating Chat Button */}
			{!isChatOpen && collaboration && (
				<button
					onClick={openChat}
					className="fixed bottom-6 right-6 z-30 bg-[#00b4d8] hover:bg-[#0094b3] text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
					aria-label="Ouvrir le chat"
					title={`Chat with collaboration partner${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
				>
					{unreadCount > 0 && (
						<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center font-bold">
							{unreadCount}
						</span>
					)}
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.295 0-2.522-.21-3.634-.595L3 20l1.595-4.366C4.21 14.522 4 13.295 4 12c0-4.418 4.03-8 9-8s8 3.582 8 8z"
						/>
					</svg>
				</button>
			)}

			{/* Right-hand chat panel */}
			{isChatOpen && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 bg-black/30 z-40"
						onClick={closeChat}
					/>
					{/* Panel */}
					<div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white shadow-xl flex flex-col">
						{/* Panel header with peer info */}
						<div className="flex items-center gap-3 p-4 border-b">
							{selectedUser && (
								<>
									<ProfileAvatar
										user={selectedUser}
										size="sm"
										showOnlineStatus={true}
										isOnline={onlineUsers.includes(
											selectedUser._id,
										)}
									/>
									<div className="min-w-0">
										<div className="font-medium truncate">
											{selectedUser.firstName &&
											selectedUser.lastName
												? `${selectedUser.firstName} ${selectedUser.lastName}`
												: selectedUser.name ||
													selectedUser.email}
										</div>
										<div className="text-xs text-gray-500 truncate">
											{getDetailedUserPresenceText(
												selectedUser,
												onlineUsers,
												{},
												[selectedUser],
											)}
										</div>
									</div>
								</>
							)}
							<button
								onClick={closeChat}
								className="ml-auto p-2 hover:bg-gray-100 rounded"
								aria-label="Fermer"
							>
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
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						{/* Chat body */}
						<div className="flex-1 min-h-0 flex flex-col">
							<div className="flex-1 min-h-0 overflow-hidden">
								<ChatMessages />
							</div>
							<div className="flex-shrink-0 border-t">
								<MessageInput />
							</div>
						</div>
					</div>
				</>
			)}

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
