// hooks/useCollaborationData.ts
import { useState, useEffect, useCallback } from 'react';
import { collaborationApi } from '@/lib/api/collaborationApi';
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
	const [collaboration, setCollaboration] = useState<Collaboration | null>(
		null,
	);
	const [progressSteps, setProgressSteps] = useState<ProgressStepData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCollaboration = useCallback(async () => {
		if (!collaborationId || !user) return;

		try {
			setIsLoading(true);
			setError(null);

			// Get basic collaboration data via getUserCollaborations
			const response = await collaborationApi.getUserCollaborations();
			const foundCollaboration = response.collaborations.find(
				(c) => c._id === collaborationId,
			);

			if (!foundCollaboration) {
				setError('Collaboration non trouvée');
				return;
			}

			setCollaboration(foundCollaboration);

			// Transform progress steps
			if (
				foundCollaboration.progressSteps &&
				foundCollaboration.progressSteps.length > 0
			) {
				const transformedSteps = foundCollaboration.progressSteps.map(
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					(step: any) => {
						const config =
							PROGRESS_STEPS_CONFIG[step.id as ProgressStep];
						return {
							id: step.id,
							title: config?.title || step.id,
							description: config?.description || '',
							completed: step.completed,
							current:
								foundCollaboration.currentProgressStep ===
								step.id,
							validatedAt: step.validatedAt,
							ownerValidated: step.ownerValidated || false,
							collaboratorValidated:
								step.collaboratorValidated || false,
							notes: step.notes || [],
						};
					},
				);
				setProgressSteps(transformedSteps);
			} else {
				// Create default progress steps
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
						ownerValidated: false,
						collaboratorValidated: false,
						notes: [],
					}),
				);
				setProgressSteps(defaultSteps);
			}
		} catch (err) {
			console.error('Error fetching collaboration:', err);
			setError('Erreur lors du chargement de la collaboration');
		} finally {
			setIsLoading(false);
		}
	}, [collaborationId, user]);

	useEffect(() => {
		fetchCollaboration();
	}, [fetchCollaboration]);

	return {
		collaboration,
		progressSteps,
		isLoading,
		error,
		refetchCollaboration: fetchCollaboration,
		setCollaboration,
		setProgressSteps,
	};
};
