// hooks/useCollaborationData.ts
import { useState, useMemo, useCallback } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { collaborationApi } from '@/lib/api/collaborationApi';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Collaboration } from '@/types/collaboration';
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

	// Fetch collaborations using useFetch hook
	const {
		data: collaborationsData,
		loading: isLoading,
		error: fetchError,
		refetch,
	} = useFetch(() => collaborationApi.getUserCollaborations(), {
		skip: !collaborationId || !user,
		showErrorToast: true,
		errorMessage: 'Erreur lors du chargement de la collaboration',
		deps: [collaborationId, user?._id],
	});

	// Find the specific collaboration
	const collaboration = useMemo(() => {
		if (!collaborationsData?.collaborations) return null;
		return (
			collaborationsData.collaborations.find(
				(c) => c._id === collaborationId,
			) || null
		);
	}, [collaborationsData, collaborationId]);

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
			const transformedSteps = collaboration.progressSteps.map((step) => {
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
				([stepId, config], index) => ({
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
