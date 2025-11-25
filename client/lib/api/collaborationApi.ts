import { api } from '../api';
import {
	Collaboration,
	ProposeCollaborationRequest,
	RespondToCollaborationRequest,
	AddCollaborationNoteRequest,
} from '../../types/collaboration';
import { handleApiError } from '../utils/errorHandler';

/**
 * Collaboration API Service
 * Manages agent-apporteur collaboration workflows
 */
export class CollaborationApi {
	/**
	 * Propose a new collaboration
	 */
	static async propose(
		data: ProposeCollaborationRequest,
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.post('/collaboration', data);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.propose',
				'Erreur lors de la proposition de collaboration',
			);
		}
	}

	/**
	 * Get all collaborations for current user
	 */
	static async getUserCollaborations(): Promise<{
		collaborations: Collaboration[];
	}> {
		try {
			const response = await api.get('/collaboration');
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.getUserCollaborations',
				'Erreur lors de la récupération des collaborations',
			);
		}
	}

	/**
	 * Get collaborations for a specific property
	 */
	static async getPropertyCollaborations(
		propertyId: string,
	): Promise<{ collaborations: Collaboration[] }> {
		try {
			const response = await api.get(
				`/collaboration/property/${propertyId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.getPropertyCollaborations',
				'Erreur lors de la récupération des collaborations de la propriété',
			);
		}
	}

	/**
	 * Get collaborations for a specific search ad
	 */
	static async getSearchAdCollaborations(
		searchAdId: string,
	): Promise<{ collaborations: Collaboration[] }> {
		try {
			const response = await api.get(
				`/collaboration/search-ad/${searchAdId}`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.getSearchAdCollaborations',
				"Erreur lors de la récupération des collaborations de l'annonce",
			);
		}
	}

	/**
	 * Get a single collaboration by id (admin or participants)
	 */
	static async getById(collaborationId: string): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.get(`/collaboration/${collaborationId}`);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.getById',
				"Erreur lors de la récupération de la collaboration",
			);
		}
	}

	/**
	 * Respond to a collaboration proposal
	 */
	static async respond(
		collaborationId: string,
		data: RespondToCollaborationRequest,
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.post(
				`/collaboration/${collaborationId}/respond`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.respond',
				'Erreur lors de la réponse à la collaboration',
			);
		}
	}

	/**
	 * Add note to collaboration
	 */
	static async addNote(
		collaborationId: string,
		data: AddCollaborationNoteRequest,
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.post(
				`/collaboration/${collaborationId}/notes`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.addNote',
				"Erreur lors de l'ajout de la note",
			);
		}
	}

	/**
	 * Cancel collaboration
	 */
	static async cancel(
		collaborationId: string,
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.delete(
				`/collaboration/${collaborationId}/cancel`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.cancel',
				"Erreur lors de l'annulation de la collaboration",
			);
		}
	}

	/**
	 * Update progress status of collaboration
	 */
	static async updateProgressStatus(
		collaborationId: string,
		data: {
			targetStep: string;
			notes?: string;
			validatedBy: 'owner' | 'collaborator';
		},
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.put(
				`/collaboration/${collaborationId}/progress-status`,
				data,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.updateProgressStatus',
				'Erreur lors de la mise à jour du statut de progression',
			);
		}
	}

	/**
	 * Sign collaboration contract
	 */
	static async sign(
		collaborationId: string,
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.post(
				`/collaboration/${collaborationId}/sign`,
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.sign',
				'Erreur lors de la signature du contrat',
			);
		}
	}

	/**
	 * Complete collaboration (terminate successfully)
	 */
	static async complete(
		collaborationId: string,
		params?: { note?: string; completionReason?: string },
	): Promise<{ collaboration: Collaboration }> {
		try {
			const response = await api.post(
				`/collaboration/${collaborationId}/complete`,
				params || {},
			);
			return response.data;
		} catch (error) {
			throw handleApiError(
				error,
				'CollaborationApi.complete',
				'Erreur lors de la finalisation de la collaboration',
			);
		}
	}
}

// Backward compatibility
export const collaborationApi = {
	propose: CollaborationApi.propose.bind(CollaborationApi),
	getUserCollaborations:
		CollaborationApi.getUserCollaborations.bind(CollaborationApi),
	getPropertyCollaborations:
		CollaborationApi.getPropertyCollaborations.bind(CollaborationApi),
	getSearchAdCollaborations:
		CollaborationApi.getSearchAdCollaborations.bind(CollaborationApi),
	respond: CollaborationApi.respond.bind(CollaborationApi),
	addNote: CollaborationApi.addNote.bind(CollaborationApi),
	cancel: CollaborationApi.cancel.bind(CollaborationApi),
	updateProgressStatus:
		CollaborationApi.updateProgressStatus.bind(CollaborationApi),
	sign: CollaborationApi.sign.bind(CollaborationApi),
	complete: CollaborationApi.complete.bind(CollaborationApi),
	getById: CollaborationApi.getById.bind(CollaborationApi),
};
