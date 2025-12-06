// hooks/useCollaborationData.ts
import { useState, useMemo, useCallback } from 'react';
import useSWR from 'swr';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { swrKeys } from '@/lib/swrKeys';
import {
	ProgressStepData,
	ProgressStep,
	PROGRESS_STEPS_CONFIG,
} from '@/components/collaboration/progress-tracking/types';
import type { User } from '@/types/auth';

export const useCollaborationData = (
	collaborationId: string,
	user: User | null,
) => {
	const [progressSteps, setProgressSteps] = useState<ProgressStepData[]>([]);

	// Fetch collaborations using SWR
	const isAdmin = user?.userType === 'admin';

	const {
		data: collaborationsData,
		isLoading,
		error: fetchError,
		mutate: refetch,
	} = useSWR<any>(
		isAdmin && collaborationId && user ? ['collaboration', collaborationId] : (collaborationId && user ? swrKeys.collaborations.list(user._id) : null),
		// If admin, fetch single collaboration by id (allows viewing any collaboration). Otherwise fetch current user's collaborations.
		isAdmin && collaborationId && user ? () => collaborationApi.getById(collaborationId) : () => collaborationApi.getUserCollaborations(),
		{
			revalidateOnFocus: false,
			onError: () => {
				// Error handled by global SWR config
			},
		},
	);

	// Find the specific collaboration
	const collaboration = useMemo(() => {
		if (!collaborationsData) return null;
		// If admin fetched a single collaboration, response shape is { collaboration }
		if (isAdmin && collaborationsData.collaboration) return collaborationsData.collaboration as any;
		if (!collaborationsData.collaborations) return null;
		return (
			(collaborationsData.collaborations as any[]).find(
				(c: any) => c._id === collaborationId,
			) || null
		);
	}, [collaborationsData, collaborationId, isAdmin]);

	// Transform progress steps when collaboration changes
	useMemo(() => {
		if (!collaboration) {
			setProgressSteps([]);
			return;
		}

		// Transform progress steps
		if (
			collaboration.progressSteps &&
			collaboration.progressSteps.length > 0
		) {
			const transformedSteps = collaboration.progressSteps.map((step: any) => {
				const config = PROGRESS_STEPS_CONFIG[step.id as ProgressStep];
				return {
					id: step.id,
					title: config?.title || step.id,
					description: config?.description || '',
					completed: step.completed,
					current: collaboration.currentProgressStep === step.id,
					validatedAt: step.validatedAt,
					ownerValidated: step.ownerValidated || false,
					collaboratorValidated: step.collaboratorValidated || false,
					notes: step.notes || [],
				} as ProgressStepData;
			});
			setProgressSteps(transformedSteps);
		} else {
			// Create default progress steps
			const defaultSteps = Object.entries(PROGRESS_STEPS_CONFIG).map(
				([stepId, config]: [string, any], index: number) => ({
					id: stepId as ProgressStep,
					title: config.title,
					description: config.description,
					completed:
						collaboration.currentStep === stepId ||
						(collaboration.currentStep === 'completed' &&
							index <
								Object.keys(PROGRESS_STEPS_CONFIG).length - 1),
					current: collaboration.currentStep === stepId,
					ownerValidated: false,
					collaboratorValidated: false,
					notes: [],
				}),
			);
			setProgressSteps(defaultSteps);
		}
	}, [collaboration]);

	// Manual setter for collaboration (for optimistic updates)
	const setCollaboration = useCallback(() => {
		// This is handled by the collaboration state now via useFetch
		// If needed for optimistic updates, trigger a refetch
		refetch();
	}, [refetch]);

	return {
		collaboration,
		progressSteps,
		isLoading,
		error: fetchError?.message || null,
		refetchCollaboration: refetch,
		setCollaboration,
		setProgressSteps,
	};
};
