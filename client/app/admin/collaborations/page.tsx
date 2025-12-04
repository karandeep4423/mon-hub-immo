'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AdminCollaborationsTableModern } from '@/components/admin/AdminCollaborationsTable';
import type { AdminCollaboration } from '@/components/admin/AdminCollaborationsTable';
import {
	useAdminCollaborations,
	type Collaboration,
} from '@/hooks/useAdminCollaborations';

export default function AdminCollaborationsPage() {
	const { collaborations, loading, refetch } = useAdminCollaborations();

	// Ensure we provide an updatedAt field expected by the admin table (fallback to createdAt)
	const allowedStatuses = [
		'pending',
		'active',
		'completed',
		'cancelled',
	] as const;
	type AllowedStatus = (typeof allowedStatuses)[number];

	const normalized: AdminCollaboration[] | undefined = collaborations?.map(
		(c: Collaboration) => {
			const rawStatus =
				typeof c.status === 'string' ? c.status.toLowerCase() : '';
			const status: AllowedStatus = (
				allowedStatuses as readonly string[]
			).includes(rawStatus)
				? (rawStatus as AllowedStatus)
				: 'pending';

			return {
				...c,
				updatedAt: c.updatedAt || c.createdAt,
				status,
			} as AdminCollaboration;
		},
	);

	return (
		<AdminLayout>
			<AdminCollaborationsTableModern
				collaborations={normalized}
				loading={loading}
				onRefetch={refetch}
			/>
		</AdminLayout>
	);
}
