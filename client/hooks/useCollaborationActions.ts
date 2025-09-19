// hooks/useCollaborationActions.ts
import { useState, useCallback } from 'react';
import { collaborationApi } from '@/lib/api/collaborationApi';
import { Collaboration } from '@/types/collaboration';
import { OverallCollaborationStatus } from '@/components/collaboration/overall-status/types';

export const useCollaborationActions = (
	collaboration: Collaboration | null,
	refetchCollaboration: () => Promise<void>,
) => {
	const [isUpdating, setIsUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleStatusUpdate = useCallback(
		async (newStatus: OverallCollaborationStatus): Promise<boolean> => {
			if (!collaboration) return false;

			try {
				setIsUpdating(true);
				setError(null);

				if (newStatus === 'accepted' || newStatus === 'rejected') {
					// Owner response to pending proposal
					await collaborationApi.respond(collaboration._id, {
						response: newStatus,
					});
				} else if (newStatus === 'cancelled') {
					await collaborationApi.cancel(collaboration._id);
				} else if (newStatus === 'completed') {
					await collaborationApi.complete(collaboration._id);
				} else {
					// Fallback: add a note
					await collaborationApi.addNote(collaboration._id, {
						content: `Statut mis à jour: ${newStatus}`,
					});
				}

				await refetchCollaboration();
				return true;
			} catch (error) {
				console.error('Error updating status:', error);
				setError('Erreur lors de la mise à jour du statut');
				return false;
			} finally {
				setIsUpdating(false);
			}
		},
		[collaboration, refetchCollaboration],
	);

	const addNote = useCallback(
		async (content: string): Promise<boolean> => {
			if (!collaboration) return false;

			try {
				setIsUpdating(true);
				setError(null);

				await collaborationApi.addNote(collaboration._id, { content });
				await refetchCollaboration();
				return true;
			} catch (error) {
				console.error('Error adding note:', error);
				setError("Erreur lors de l'ajout de la note");
				return false;
			} finally {
				setIsUpdating(false);
			}
		},
		[collaboration, refetchCollaboration],
	);

	const signContract = useCallback(async (): Promise<boolean> => {
		if (!collaboration) return false;

		try {
			setIsUpdating(true);
			setError(null);

			await collaborationApi.sign(collaboration._id);
			await refetchCollaboration();
			return true;
		} catch (error) {
			console.error('Error signing contract:', error);
			setError('Erreur lors de la signature du contrat');
			return false;
		} finally {
			setIsUpdating(false);
		}
	}, [collaboration, refetchCollaboration]);

	return {
		handleStatusUpdate,
		addNote,
		signContract,
		isUpdating,
		error,
	};
};
