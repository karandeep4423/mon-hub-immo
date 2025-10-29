import { api } from '../../api';
import {
	OverallCollaborationStatus,
	OverallStatusUpdate,
} from '@/components/collaboration/overall-status/types';

// Overall Status API (Workflow 1)
export const overallStatusApi = {
	// Update overall collaboration status
	updateStatus: async (
		collaborationId: string,
		update: OverallStatusUpdate,
	) => {
		const response = await api.put(
			`/collaborations/${collaborationId}/status`,
			update,
		);
		return response.data;
	},

	// Get overall status for a collaboration
	getStatus: async (
		collaborationId: string,
	): Promise<{
		status: OverallCollaborationStatus;
		canUpdate: boolean;
		lastUpdated: string;
	}> => {
		const response = await api.get(
			`/collaborations/${collaborationId}/status`,
		);
		return response.data;
	},

	// Accept collaboration (owner action)
	accept: async (collaborationId: string, note?: string) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/accept`,
			{ note },
		);
		return response.data;
	},

	// Reject collaboration (owner action)
	reject: async (collaborationId: string, note?: string) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/reject`,
			{ note },
		);
		return response.data;
	},

	// Activate collaboration (move from accepted to active)
	activate: async (collaborationId: string, note?: string) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/activate`,
			{ note },
		);
		return response.data;
	},

	// Complete collaboration (mark as finished)
	complete: async (
		collaborationId: string,
		params?: { note?: string; completionReason?: string },
	) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/complete`,
			params || {},
		);
		return response.data;
	},

	// Cancel collaboration
	cancel: async (collaborationId: string, note?: string) => {
		const response = await api.post(
			`/collaborations/${collaborationId}/cancel`,
			{ note },
		);
		return response.data;
	},
};
