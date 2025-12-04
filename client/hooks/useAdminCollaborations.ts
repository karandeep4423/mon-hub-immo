import { useState, useEffect } from 'react';
import { adminService } from '@/lib/api/adminApi';

// Adapte cette interface à la structure Collaboration de ton backend (exemple simplifié)
export interface Collaboration {
	_id: string;
	postId?: Record<string, unknown>;
	postType?: string;
	agent?: { _id: string; firstName?: string; lastName?: string };
	agentId?: string;
	apporteur?: { _id: string; firstName?: string; lastName?: string };
	apporteurId?: string;
	status: 'pending' | 'active' | 'completed' | 'cancelled';
	createdAt: string;
	updatedAt?: string;
}

export function useAdminCollaborations() {
	const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);

		adminService
			.getAllCollaborations()
			.then((res) => {
				console.log('[adminCollab] Réponse API complète:', res.data);
				// Sort by createdAt descending (newest first)
				const sorted = [...(res.data.collaborations || [])].sort(
					(a: Collaboration, b: Collaboration) => {
						const dateA = new Date(a.createdAt || 0).getTime();
						const dateB = new Date(b.createdAt || 0).getTime();
						return dateB - dateA;
					},
				);
				setCollaborations(sorted);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return { collaborations, loading };
}
