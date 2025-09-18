import { api } from '../api';
import {
	Collaboration,
	ProposeCollaborationRequest,
	RespondToCollaborationRequest,
	AddCollaborationNoteRequest,
} from '../../types/collaboration';

export const collaborationApi = {
	// Propose a new collaboration
	propose: async (
		data: ProposeCollaborationRequest,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.post('/collaboration', data);
		return response.data;
	},

	// Get all collaborations for the current user
	getUserCollaborations: async (): Promise<{
		collaborations: Collaboration[];
	}> => {
		const response = await api.get('/collaboration');
		return response.data;
	},

	// Get collaborations for a specific property
	getPropertyCollaborations: async (
		propertyId: string,
	): Promise<{ collaborations: Collaboration[] }> => {
		const response = await api.get(`/collaboration/property/${propertyId}`);
		return response.data;
	},

	// Respond to a collaboration proposal
	respond: async (
		collaborationId: string,
		data: RespondToCollaborationRequest,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.post(
			`/collaboration/${collaborationId}/respond`,
			data,
		);
		return response.data;
	},

	// Add note to collaboration
	addNote: async (
		collaborationId: string,
		data: AddCollaborationNoteRequest,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.post(
			`/collaboration/${collaborationId}/notes`,
			data,
		);
		return response.data;
	},

	// Cancel collaboration
	cancel: async (
		collaborationId: string,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.delete(
			`/collaboration/${collaborationId}/cancel`,
		);
		return response.data;
	},

	// Update progress status
	updateProgressStatus: async (
		collaborationId: string,
		data: { targetStep: string; notes?: string },
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.put(
			`/collaboration/${collaborationId}/progress-status`,
			data,
		);
		return response.data;
	},

	// Sign collaboration contract
	sign: async (
		collaborationId: string,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.post(
			`/collaboration/${collaborationId}/sign`,
		);
		return response.data;
	},

	// Complete collaboration (terminate)
	complete: async (
		collaborationId: string,
	): Promise<{ collaboration: Collaboration }> => {
		const response = await api.post(
			`/collaboration/${collaborationId}/complete`,
		);
		return response.data;
	},
};
