import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collaboration } from '@/types/collaboration';
import { Property, propertyService } from '@/lib/api/propertyApi';
import type { SearchAd } from '@/types/searchAd';
import searchAdApi from '@/lib/api/searchAdApi';
import { PROGRESS_STEPS_CONFIG } from '@/components/collaboration/progress-tracking/types';
import { logger } from '@/lib/utils/logger';
import { useFetch } from '@/hooks';
import { Features } from '@/lib/constants';
import {
	CollaborationPostHeader,
	CollaborationParticipants,
	CollaborationDetails,
} from './index';

interface CollaborationCardProps {
	collaboration: Collaboration;
	currentUserId: string;
	onClose?: () => void;
	onCancel?: (collaborationId: string) => void;
	showChatButton?: boolean;
	showCancelButton?: boolean;
}

export const CollaborationCard: React.FC<CollaborationCardProps> = ({
	collaboration,
	currentUserId,
	onClose,
	onCancel,
	showChatButton = true,
	showCancelButton = true,
}) => {
	const router = useRouter();

	// Extract post ID - handle both string and object cases
	const postId = useMemo(() => {
		if (typeof collaboration.postId === 'string') {
			return collaboration.postId;
		} else if (
			collaboration.postId &&
			typeof collaboration.postId === 'object'
		) {
			return (collaboration.postId as { _id?: string })._id || '';
		}
		return '';
	}, [collaboration.postId]);

	// Fetch property using useFetch hook
	const { data: property, loading: isLoadingProperty } = useFetch<Property>(
		() => propertyService.getPropertyById(postId),
		{
			skip: !postId || collaboration.postType !== 'Property',
			showErrorToast: false,
			onError: (error) => {
				logger.error('Error fetching property data:', error);
			},
		},
	);

	// Fetch search ad using useFetch hook
	const { data: searchAd, loading: isLoadingSearchAd } = useFetch<SearchAd>(
		() => searchAdApi.getSearchAdById(postId),
		{
			skip: !postId || collaboration.postType !== 'SearchAd',
			showErrorToast: false,
			onError: (error) => {
				logger.error('Error fetching search ad data:', error);
			},
		},
	);

	const isLoadingPost = isLoadingProperty || isLoadingSearchAd;

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
			<CollaborationPostHeader
				postImage={postImage}
				postTitle={postTitle}
				postLocation={postLocation}
				postPrice={postPrice}
				property={property}
				isLoadingPost={isLoadingPost}
				status={collaboration.status}
			/>

			{/* Participants */}
			<CollaborationParticipants
				ownerUser={ownerUser}
				collaboratorUser={collaboratorUser}
				currentUserId={currentUserId}
				shortCollabId={shortCollabId}
				property={property}
			/>

			{/* Progress, Compensation, Activity, Timestamps */}
			<CollaborationDetails
				collaboration={collaboration}
				isOwner={isOwner}
				property={property}
				postPrice={postPrice}
				compensationInfo={compensationInfo}
				latestActivity={latestActivity || undefined}
				completedSteps={completedSteps}
				totalSteps={totalSteps}
				currentStepConfig={currentStepConfig}
			/>

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

				{showChatButton &&
					collaboration.status ===
						Features.Collaboration.COLLABORATION_STATUS_VALUES
							.ACTIVE && (
						<Button
							size="sm"
							onClick={handleOpenChat}
							className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
						>
							💬 Chat
						</Button>
					)}

				{collaboration.status ===
					Features.Collaboration.COLLABORATION_STATUS_VALUES
						.PENDING &&
					isOwner && (
						<Button
							size="sm"
							className="bg-green-600 hover:bg-green-700 text-white"
							onClick={() => {
								// Handle accept
								logger.debug('Accept collaboration');
							}}
						>
							✅ Accepter
						</Button>
					)}

				{showCancelButton &&
					collaboration.status ===
						Features.Collaboration.COLLABORATION_STATUS_VALUES
							.PENDING &&
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
					collaboration.status ===
						Features.Collaboration.COLLABORATION_STATUS_VALUES
							.ACTIVE &&
					(isOwner ||
						collaboration.status ===
							Features.Collaboration.COLLABORATION_STATUS_VALUES
								.ACTIVE) && (
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
