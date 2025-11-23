import useSWR, { useSWRConfig } from 'swr';
import { swrKeys } from '@/lib/swrKeys';
import { CollaborationApi } from '@/lib/api/collaborationApi';
import { Features } from '@/lib/constants';
import type {
	ProposeCollaborationRequest,
	RespondToCollaborationRequest,
	AddCollaborationNoteRequest,
} from '@/types/collaboration';
import { toast } from 'react-toastify';
import { handleApiError } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

// ============ QUERY HOOKS ============


export function useMyCollaborations(userId?: string) {
	const key = swrKeys.collaborations.list(userId);
	const { data, error, isLoading, mutate } = useSWR(
		key,
		async () => {
			// Keep the same shape as the API to avoid cache-shape collisions
			// with other places that use the same key
			return await CollaborationApi.getUserCollaborations();
		},
		{ revalidateOnFocus: true },
	);

	return {
		data,
		isLoading,
		error,
		refetch: () => mutate(),
	};
}

export function useCollaborationsByProperty(propertyId?: string) {
	const key = propertyId
		? swrKeys.collaborations.byProperty(propertyId)
		: null;
	const { data, error, isLoading, mutate } = useSWR(
		key,
		async () => {
			const res = await CollaborationApi.getPropertyCollaborations(
				propertyId as string,
			);
			return res.collaborations;
		},
		{ revalidateOnFocus: true },
	);
	return { data: data || [], isLoading, error, refetch: () => mutate() };
}

export function useCollaborationsBySearchAd(
	searchAdId?: string,
	opts?: { skip?: boolean },
) {
	const key =
		!opts?.skip && searchAdId
			? swrKeys.collaborations.bySearchAd(searchAdId)
			: null;
	const { data, error, isLoading, mutate } = useSWR(
		key,
		async () => {
			const res = await CollaborationApi.getSearchAdCollaborations(
				searchAdId as string,
			);
			return res.collaborations;
		},
		{ revalidateOnFocus: true },
	);
	return { data: data || [], isLoading, error, refetch: () => mutate() };
}

// ============ MUTATIONS ============

export function useCollaborationMutations(userId?: string) {
	const { mutate } = useSWRConfig();

	const invalidateCollabCaches = () => {
		// Invalidate all collaboration queries
		mutate((key) => Array.isArray(key) && key[0] === 'collaborations');
		if (userId) {
			mutate(swrKeys.dashboard.stats(userId));
		}
		logger.info('[useCollaborations] Collaboration caches invalidated');
	};

	const proposeCollaboration = async (
		payload: ProposeCollaborationRequest,
	) => {
		try {
			const res = await CollaborationApi.propose(payload);
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.PROPOSE_SUCCESS,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.propose',
				'Erreur lors de la proposition de collaboration',
			);
			logger.error('[useCollaborations] Propose failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const respondToCollaboration = async (
		collaborationId: string,
		data: RespondToCollaborationRequest,
	) => {
		try {
			const res = await CollaborationApi.respond(collaborationId, data);
			toast.success(
				data.response === 'accepted'
					? 'Collaboration acceptée'
					: 'Collaboration rejetée',
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.respond',
				'Erreur lors de la réponse à la collaboration',
			);
			logger.error('[useCollaborations] Respond failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const cancelCollaboration = async (collaborationId: string) => {
		try {
			const res = await CollaborationApi.cancel(collaborationId);
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.CANCEL_SUCCESS,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.cancel',
				"Erreur lors de l\'annulation de la collaboration",
			);
			logger.error('[useCollaborations] Cancel failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const completeCollaboration = async (
		collaborationId: string,
		completionReason?: string,
	) => {
		try {
			const res = await CollaborationApi.complete(collaborationId, {
				completionReason,
			});
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.COMPLETE_SUCCESS,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.complete',
				'Erreur lors de la finalisation de la collaboration',
			);
			logger.error('[useCollaborations] Complete failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const addCollaborationNote = async (
		collaborationId: string,
		data: AddCollaborationNoteRequest,
	) => {
		try {
			const res = await CollaborationApi.addNote(collaborationId, data);
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES.NOTE_ADDED,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.addNote',
				"Erreur lors de l'ajout de la note",
			);
			logger.error('[useCollaborations] Add note failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const updateCollaborationProgress = async (
		collaborationId: string,
		data: {
			targetStep: string;
			notes?: string;
			validatedBy: 'owner' | 'collaborator';
		},
	) => {
		try {
			const res = await CollaborationApi.updateProgressStatus(
				collaborationId,
				data,
			);
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.PROGRESS_UPDATED,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.updateProgress',
				'Erreur lors de la mise à jour du statut',
			);
			logger.error(
				'[useCollaborations] Update progress failed:',
				apiError,
			);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	const signCollaboration = async (collaborationId: string) => {
		try {
			const res = await CollaborationApi.sign(collaborationId);
			toast.success(
				Features.Collaboration.COLLABORATION_TOAST_MESSAGES
					.CONTRACT_SIGNED,
			);
			invalidateCollabCaches();
			return { success: true, data: res.collaboration };
		} catch (error) {
			const apiError = handleApiError(
				error,
				'useCollaborations.sign',
				'Erreur lors de la signature du contrat',
			);
			logger.error('[useCollaborations] Sign failed:', apiError);
			toast.error(apiError.message);
			return { success: false, error: apiError } as const;
		}
	};

	return {
		proposeCollaboration,
		respondToCollaboration,
		cancelCollaboration,
		completeCollaboration,
		addCollaborationNote,
		updateCollaborationProgress,
		signCollaboration,
		invalidateCollabCaches,
	};
}
