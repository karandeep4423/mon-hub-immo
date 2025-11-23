'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AdminCollaborationsTableModern } from '@/components/admin/AdminCollaborationsTableModern';
import { useAdminCollaborations } from '@/hooks/useAdminCollaborations';

export default function AdminCollaborationsPage() {
	const { collaborations, loading } = useAdminCollaborations();

	return (
		<AdminLayout>
			<AdminCollaborationsTableModern collaborations={collaborations} loading={loading} />
		</AdminLayout>
	);
}
