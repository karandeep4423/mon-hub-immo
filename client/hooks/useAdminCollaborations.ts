import useSWR from 'swr';
import { adminService } from '@/lib/api/adminApi';
import { swrKeys } from '@/lib/swrKeys';

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
	const {
		data: collaborations,
		isLoading: loading,
		mutate,
	} = useSWR<Collaboration[]>(
		swrKeys.admin.collaborations,
		async () => {
			const res = await adminService.getAllCollaborations();
			// Sort by createdAt descending (newest first)
			return [...(res.data.collaborations || [])].sort(
				(a: Collaboration, b: Collaboration) => {
					const dateA = new Date(a.createdAt || 0).getTime();
					const dateB = new Date(b.createdAt || 0).getTime();
					return dateB - dateA;
				},
			);
		},
		{
			revalidateOnFocus: false,
		},
	);

	return {
		collaborations: collaborations ?? [],
		loading,
		refetch: mutate,
	};
}
