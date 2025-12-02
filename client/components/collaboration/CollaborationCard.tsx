import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Collaboration } from '@/types/collaboration';
import { PROGRESS_STEPS_CONFIG } from '@/components/collaboration/progress-tracking/types';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';
import {
	CollaborationPostHeader,
	CollaborationParticipants,
	CollaborationDetails,
} from './index';
import { useProperty } from '@/hooks/useProperties';
import { useSearchAd } from '@/hooks/useSearchAds';

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
	showChatButton = true,
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

	// Check if property data is already populated
	const populatedProperty = useMemo(() => {
		if (
			collaboration.postType === 'Property' &&
			typeof collaboration.postId === 'object' &&
			collaboration.postId !== null
		) {
			// It's populated, cast it to Property (partial)
			// We need to be careful about types here, but for display purposes it should be enough
			return collaboration.postId as unknown as import('@/lib/api/propertyApi').Property;
		}
		return null;
	}, [collaboration.postId, collaboration.postType]);

	// Fetch property using SWR ONLY if not populated
	const {
		data: fetchedProperty,
		isLoading: isLoadingProperty,
		error: propertyError,
	} = useProperty(
		!populatedProperty && postId && collaboration.postType === 'Property'
			? postId
			: undefined,
	);

	const property = populatedProperty || fetchedProperty;

	// Fetch search ad using SWR (with automatic deduplication)
	const {
		data: searchAd,
		isLoading: isLoadingSearchAd,
		error: searchAdError,
	} = useSearchAd(
		postId && collaboration.postType === 'SearchAd' ? postId : undefined,
	);

	// Log errors silently
	if (propertyError) {
		logger.error('[CollaborationCard] Error fetching property:', {
			postId,
			error: propertyError,
		});
	}
	if (searchAdError) {
		logger.error('[CollaborationCard] Error fetching search ad:', {
			postId,
			error: searchAdError,
		});
	}

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
			? searchAd.location?.cities?.join(', ') || 'Non spécifiée'
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
		// Chat with the OTHER person in the collaboration
		const otherUserId = isOwner ? collaboratorUser._id : ownerUser._id;
		router.push(`/chat?userId=${otherUserId}`);
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
							className="bg-brand hover:bg-brand-600 text-white flex-1"
						>
							💬 Chat
						</Button>
					)}
			</div>
		</Card>
	);
};
