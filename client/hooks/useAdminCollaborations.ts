import { useState, useEffect } from 'react';

// Adapte cette interface à la structure Collaboration de ton backend (exemple simplifié)
export interface Collaboration {
	_id: string;
	postId?: Record<string, any>;
	postType?: string;
	agent?: { _id: string; firstName?: string; lastName?: string };
	agentId?: string;
	apporteur?: { _id: string; firstName?: string; lastName?: string };
	apporteurId?: string;
	status: 'pending' | 'active' | 'completed' | 'cancelled';
	createdAt: string;
	updatedAt?: string;
	// Ajoute d'autres champs si besoin
}

export function useAdminCollaborations() {
	const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		setLoading(true);
		const API_ROOT = (() => {
			const raw =
				process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
			return raw.replace(/\/+$/, '').replace(/\/api$/i, '');
		})();

		fetch(`${API_ROOT}/api/collaboration/all`, {
			credentials: 'include',
		})
			.then((res) => res.json())
			.then((data) => {
				console.log('[adminCollab] Réponse API complète:', data);
				// Sort by createdAt descending (newest first)
				const sorted = [...(data.collaborations || [])].sort((a, b) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA;
				});
				setCollaborations(sorted);
			})
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	return { collaborations, loading };
}
