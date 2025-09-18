import { api } from '../../api';
import {
	ProgressStep,
	ProgressUpdate,
	ProgressStepData,
} from '@/components/collaboration/progress-tracking/types';

// Progress Tracking API (Workflow 2)
export const progressTrackingApi = {
	// Get progress steps for a collaboration
	getProgress: async (
		collaborationId: string,
	): Promise<{
		currentStep: ProgressStep;
		steps: ProgressStepData[];
		canUpdate: boolean;
	}> => {
		const response = await api.get(
			`/collaborations/${collaborationId}/progress`,
		);
		return response.data;
	},

	// Update a specific progress step
	updateStep: async (collaborationId: string, update: ProgressUpdate) => {
		const response = await api.put(
			`/collaborations/${collaborationId}/progress/step`,
			update,
		);
		return response.data;
	},

	// Mark step as completed
	completeStep: async (
		collaborationId: string,
		step: ProgressStep,
		notes?: string,
	) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/progress/complete`,
			{
				step,
				notes,
			},
		);
		return response.data;
	},

	// Mark step as incomplete (undo)
	uncompleteStep: async (
		collaborationId: string,
		step: ProgressStep,
		notes?: string,
	) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/progress/uncomplete`,
			{
				step,
				notes,
			},
		);
		return response.data;
	},

	// Add note to a specific step
	addStepNote: async (
		collaborationId: string,
		step: ProgressStep,
		notes: string,
	) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/progress/note`,
			{
				step,
				notes,
			},
		);
		return response.data;
	},

	// Get progress history
	getProgressHistory: async (collaborationId: string) => {
		const response = await api.get(
			`/api/collaborations/${collaborationId}/progress/history`,
		);
		return response.data;
	},

	// Set current step (advance collaboration)
	setCurrentStep: async (
		collaborationId: string,
		step: ProgressStep,
		notes?: string,
	) => {
		const response = await api.post(
			`/api/collaborations/${collaborationId}/progress/current`,
			{
				step,
				notes,
			},
		);
		return response.data;
	},
};
