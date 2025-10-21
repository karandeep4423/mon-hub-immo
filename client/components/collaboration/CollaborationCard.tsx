/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CollaborationStatusBadge } from './CollaborationStatusBadge';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { Collaboration } from '../../types/collaboration';
import { Property, propertyService } from '../../lib/api/propertyApi';
import type { SearchAd } from '../../types/searchAd';
import searchAdApi from '../../lib/api/searchAdApi';
import { PROGRESS_STEPS_CONFIG } from './progress-tracking/types';

interface CollaborationCardProps {
	collaboration: Collaboration;
	currentUserId: string;
	onClose?: () => void;
	onCancel?: (collaborationId: string) => void;
	showChatButton?: boolean;
	showCancelButton?: boolean;
}

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString('fr-FR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
	});
};

export const CollaborationCard: React.FC<CollaborationCardProps> = ({
	collaboration,
	currentUserId,
	onClose,
	onCancel,
	showChatButton = true,
	showCancelButton = true,
}) => {
	const router = useRouter();
	const [property, setProperty] = useState<Property | null>(null);
	const [searchAd, setSearchAd] = useState<SearchAd | null>(null);
	const [loadingPost, setLoadingPost] = useState(true);

	// Fetch property or search ad data
	useEffect(() => {
		const fetchPostData = async () => {
			try {
				// Extract post ID - handle both string and object cases
				let postId: string;

				if (typeof collaboration.postId === 'string') {
					postId = collaboration.postId;
				} else if (
					collaboration.postId &&
					typeof collaboration.postId === 'object'
				) {
					postId =
						(collaboration.postId as { _id?: string })._id || '';
				} else {
					postId = '';
				}

				if (!postId) {
					console.warn('No valid post ID found in collaboration');
					setLoadingPost(false);
					return;
				}

				if (collaboration.postType === 'Property') {
					const propertyData =
						await propertyService.getPropertyById(postId);
					setProperty(propertyData);
				} else if (collaboration.postType === 'SearchAd') {
					const searchAdData =
						await searchAdApi.getSearchAdById(postId);
					setSearchAd(searchAdData);
				}
			} catch (error) {
				console.error('Error fetching post data:', error);
			} finally {
				setLoadingPost(false);
			}
		};

		if (collaboration.postId) {
			fetchPostData();
		}
	}, [collaboration.postId, collaboration.postType]);

	// Early return if participant data is missing
	if (!collaboration.postOwnerId || !collaboration.collaboratorId) {
		return (
			<div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
				<p className="text-red-600 text-sm">
					⚠️ Données de collaboration incomplètes
				</p>
			</div>
		);
	}

	const isOwner = collaboration.postOwnerId._id === currentUserId;

	// Both participants
	const ownerUser = collaboration.postOwnerId;
	const collaboratorUser = collaboration.collaboratorId;
	const shortCollabId = collaboration._id.slice(-6);

	// Get current progress step info
	const currentStepConfig =
		PROGRESS_STEPS_CONFIG[collaboration.currentProgressStep];
	const completedSteps =
		collaboration.progressSteps?.filter((step) => step.completed).length ||
		0;
	const totalSteps = Object.keys(PROGRESS_STEPS_CONFIG).length;

	// Get post display info (property or search ad)
	const postTitle = property
		? `${property.propertyType} ${property.rooms ? property.rooms + ' pièces' : ''}`
		: searchAd
			? searchAd.title
			: collaboration.postType === 'Property'
				? 'Propriété'
				: 'Recherche de bien';

	const postLocation = property
		? `${property.city}${property.postalCode ? ' (' + property.postalCode + ')' : ''}`
		: searchAd
			? searchAd.location.cities.join(', ')
			: 'Location inconnue';

	const postImage =
		collaboration.postType === 'Property'
			? typeof property?.mainImage === 'string'
				? property.mainImage
				: property?.mainImage?.url || '/api/placeholder/300/200'
			: '/recherches-des-biens.png';

	const postPrice = property?.price || 0;

	// Determine compensation display
	const getCompensationDisplay = () => {
		if (collaboration.compensationType === 'gift_vouchers') {
			return {
				type: 'Chèques cadeaux',
				value: `${collaboration.compensationAmount || 0}`,
			};
		} else if (collaboration.compensationType === 'fixed_amount') {
			return {
				type: 'Montant fixe',
				value: `${collaboration.compensationAmount || 0}€`,
			};
		} else {
			// percentage or default
			const userCommission = isOwner
				? 100 - collaboration.proposedCommission
				: collaboration.proposedCommission;
			return {
				type: 'Commission',
				value: `${userCommission}%`,
			};
		}
	};

	const compensationInfo = getCompensationDisplay();

	// Get latest activity (sorted by most recent)
	const latestActivity =
		collaboration.activities?.length > 0
			? [...collaboration.activities].sort(
					(a, b) =>
						new Date(b.createdAt).getTime() -
						new Date(a.createdAt).getTime(),
				)[0]
			: null;

	const handleViewDetails = () => {
		router.push(`/collaboration/${collaboration._id}`);
		if (onClose) {
			onClose();
		}
	};

	const handleOpenChat = () => {
		router.push(`/chat?userId=${ownerUser._id}`);
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel(collaboration._id);
		}
	};
	return (
		<Card className="overflow-hidden">
			{/* Post Header (Property or Search Ad) */}
			<div className="flex items-start space-x-4 p-4">
				<div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
					{loadingPost ? (
						<div className="w-full h-full bg-gray-300 animate-pulse" />
					) : (
						<img
							src={postImage}
							alt={postTitle}
							width={80}
							height={100}
							className="object-cover h-full"
						/>
					)}
				</div>
				<div className="flex-1 min-w-0">
					<div className="flex items-center justify-between">
						<div>
							<h3 className="text-lg font-semibold text-gray-900 truncate">
								{loadingPost ? (
									<div className="h-5 bg-gray-300 animate-pulse rounded w-32" />
								) : (
									postTitle
								)}
							</h3>
							{property && (
								<p className="text-sm text-blue-600 font-medium">
									{postPrice.toLocaleString('fr-FR')} €
								</p>
							)}
						</div>
						<CollaborationStatusBadge
							status={collaboration.status}
						/>
					</div>
					<div className="flex items-center text-gray-600 mt-1">
						<svg
							className="w-4 h-4 mr-1"
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
						<span className="text-sm">
							{loadingPost ? (
								<div className="h-4 bg-gray-300 animate-pulse rounded w-24" />
							) : (
								postLocation
							)}
						</span>
					</div>
					{property && (
						<div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
							{property.surface && (
								<span>📐 {property.surface}m²</span>
							)}
							{property.rooms && (
								<span>🏠 {property.rooms} pièces</span>
							)}
							{property.bedrooms && (
								<span>🛏️ {property.bedrooms} ch.</span>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Participants */}
			<div className="px-4 pb-4">
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
					<div className="flex items-center justify-between mb-3">
						<p className="text-sm font-medium text-gray-900">
							Intervenants
						</p>
						<span className="text-[10px] text-gray-500">
							ID {shortCollabId}
						</span>
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{/* Owner */}
						<div className="flex items-center space-x-3">
							<ProfileAvatar
								user={{
									...ownerUser,
									profileImage:
										ownerUser.profileImage ?? undefined,
								}}
								size="sm"
								className="w-8 h-8"
							/>
							<div className="min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{ownerUser.firstName} {ownerUser.lastName}
									{ownerUser._id === currentUserId && (
										<span className="ml-1 text-[10px] text-blue-600">
											(Vous)
										</span>
									)}
								</p>
								<div className="flex items-center gap-2 text-xs text-gray-600">
									<span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
										Propriétaire
									</span>
									{property?.city && (
										<span className="truncate">
											📍 {property.city}
										</span>
									)}
								</div>
							</div>
						</div>
						{/* Collaborator */}
						<div className="flex items-center space-x-3">
							<ProfileAvatar
								user={{
									...collaboratorUser,
									profileImage:
										collaboratorUser.profileImage ??
										undefined,
								}}
								size="sm"
								className="w-8 h-8"
							/>
							<div className="min-w-0">
								<p className="text-sm font-medium text-gray-900 truncate">
									{collaboratorUser.firstName}{' '}
									{collaboratorUser.lastName}
									{collaboratorUser._id === currentUserId && (
										<span className="ml-1 text-[10px] text-blue-600">
											(Vous)
										</span>
									)}
								</p>
								<div className="flex items-center gap-2 text-xs text-gray-600">
									<span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700">
										Collaborateur
									</span>
									{property?.postalCode && (
										<span>📫 {property.postalCode}</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Progress Tracking */}
			{collaboration.status === 'active' && (
				<div className="px-4 pb-4">
					<div className="bg-blue-50 rounded-lg p-3">
						<div className="flex items-center justify-between mb-2">
							<p className="text-sm font-medium text-gray-900">
								Étape actuelle
							</p>
							<span className="text-xs text-blue-600">
								{completedSteps}/{totalSteps} étapes
							</span>
						</div>
						<div className="flex items-center space-x-2">
							<span className="text-lg">
								{currentStepConfig?.icon}
							</span>
							<div>
								<p className="text-sm font-medium text-blue-800">
									{currentStepConfig?.title}
								</p>
								<p className="text-xs text-blue-600">
									{currentStepConfig?.description}
								</p>
							</div>
						</div>
						{/* Progress bar */}
						<div className="mt-3">
							<div className="bg-blue-200 rounded-full h-2">
								<div
									className="bg-blue-600 h-2 rounded-full transition-all duration-300"
									style={{
										width: `${(completedSteps / totalSteps) * 100}%`,
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Compensation & Status Details */}
			<div className="px-4 pb-4">
				<div className="bg-gray-50 rounded-lg p-3">
					<div className="flex items-center justify-between mb-2">
						<div className="w-full">
							<p className="text-sm font-medium text-gray-900 mb-2">
								{compensationInfo.type}
							</p>
							{collaboration.compensationType ===
								'gift_vouchers' ||
							collaboration.compensationType ===
								'fixed_amount' ? (
								<div className="text-center py-2">
									<p className="text-lg font-bold text-blue-600">
										{compensationInfo.value}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										{collaboration.compensationType ===
										'gift_vouchers'
											? 'Chèques cadeaux pour le collaborateur'
											: 'Montant fixe pour le collaborateur'}
									</p>
								</div>
							) : (
								<div className="flex items-center space-x-4 mt-1">
									<div className="text-center flex-1">
										<p className="text-xs text-gray-500">
											Propriétaire
										</p>
										<p className="text-sm font-semibold text-gray-900">
											{isOwner
												? compensationInfo.value
												: `${100 - collaboration.proposedCommission}%`}
										</p>
									</div>
									<div className="text-center flex-1">
										<p className="text-xs text-gray-500">
											Collaborateur
										</p>
										<p className="text-sm font-semibold text-blue-600">
											{isOwner
												? `${collaboration.proposedCommission}%`
												: compensationInfo.value}
										</p>
									</div>
								</div>
							)}
						</div>
					</div>
					<div className="mt-2">
						{collaboration.status === 'pending' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
								⏳ En attente
							</span>
						)}
						{collaboration.status === 'accepted' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
								✅ Acceptée
							</span>
						)}
						{collaboration.status === 'active' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								🔄 Active
							</span>
						)}
						{collaboration.status === 'rejected' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
								❌ Refusée
							</span>
						)}
						{collaboration.status === 'completed' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
								🎯 Finalisée
							</span>
						)}
						{collaboration.status === 'cancelled' && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								🚫 Annulée
							</span>
						)}
					</div>
					{property &&
						collaboration.compensationType === 'percentage' && (
							<p className="text-xs text-gray-600 mt-2">
								Estimation commission:{' '}
								{Math.round(
									(postPrice *
										(isOwner
											? 100 -
												collaboration.proposedCommission
											: collaboration.proposedCommission)) /
										100,
								).toLocaleString('fr-FR')}{' '}
								€
							</p>
						)}
				</div>
			</div>

			{/* Message Preview */}
			{collaboration.proposalMessage && (
				<div className="px-4 pb-4">
					<p className="text-sm text-gray-600 italic truncate">
						{collaboration.proposalMessage}
					</p>
				</div>
			)}

			{/* Latest Activity */}
			{latestActivity && (
				<div className="px-4 pb-4">
					<div className="bg-gray-50 rounded-lg p-3">
						<div className="flex items-start justify-between mb-1">
							<p className="text-sm font-medium text-gray-900">
								Dernière activité
							</p>
							<span className="text-xs text-gray-500">
								{formatDate(latestActivity.createdAt)}
							</span>
						</div>
						<div className="flex items-start space-x-2">
							<div className="flex-shrink-0 mt-1">
								{latestActivity.type === 'proposal' && '📋'}
								{latestActivity.type === 'acceptance' && '✅'}
								{latestActivity.type === 'rejection' && '❌'}
								{latestActivity.type === 'signing' && '📝'}
								{latestActivity.type === 'status_update' &&
									'🔄'}
								{latestActivity.type ===
									'progress_step_update' && '📈'}
								{latestActivity.type === 'note' && '💬'}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm text-gray-700">
									{latestActivity.message}
								</p>
								{collaboration.activities.length > 1 && (
									<p className="text-xs text-blue-600 mt-1">
										+{collaboration.activities.length - 1}{' '}
										autres activités
									</p>
								)}
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Timestamps & Contract Status */}
			<div className="px-4 pb-4">
				<div className="flex justify-between items-center text-xs text-gray-500">
					<div>
						<span>
							📅 Créée le {formatDate(collaboration.createdAt)}
						</span>
						{collaboration.status !== 'pending' && (
							<span className="ml-4">
								📝 Mise à jour le{' '}
								{formatDate(collaboration.updatedAt)}
							</span>
						)}
					</div>
					{(collaboration.ownerSigned ||
						collaboration.collaboratorSigned) && (
						<div className="flex items-center space-x-2">
							{collaboration.ownerSigned && (
								<span className="text-green-600">
									📝 Propriétaire signé
								</span>
							)}
							{collaboration.collaboratorSigned && (
								<span className="text-green-600">
									📝 Collaborateur signé
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Action Buttons */}
			<div className="px-4 pb-4 flex gap-2">
				<Button
					size="sm"
					variant="outline"
					onClick={handleViewDetails}
					className="flex-1"
				>
					👁 Voir détails
				</Button>

				{showChatButton && collaboration.status === 'active' && (
					<Button
						size="sm"
						onClick={handleOpenChat}
						className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
					>
						💬 Chat
					</Button>
				)}

				{collaboration.status === 'pending' && isOwner && (
					<Button
						size="sm"
						className="bg-green-600 hover:bg-green-700 text-white"
						onClick={() => {
							// Handle accept
							console.log('Accept collaboration');
						}}
					>
						✅ Accepter
					</Button>
				)}

				{showCancelButton &&
					collaboration.status === 'pending' &&
					!isOwner && (
						<Button
							size="sm"
							variant="outline"
							onClick={handleCancel}
							className="text-red-600 border-red-300 hover:bg-red-50"
						>
							❌ Annuler
						</Button>
					)}

				{showCancelButton &&
					collaboration.status === 'active' &&
					(isOwner || collaboration.status === 'active') && (
						<Button
							size="sm"
							variant="outline"
							onClick={handleCancel}
							className="text-red-600 border-red-300 hover:bg-red-50"
						>
							🚫 Terminer
						</Button>
					)}
			</div>
		</Card>
	);
};
