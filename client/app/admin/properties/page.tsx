'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPropertiesTableModern } from '@/components/admin/AdminPropertiesTableModern';
import { useAdminProperties } from '@/hooks/useAdminProperties';

export default function AdminPropertiesPage() {
	const { properties, loading } = useAdminProperties({});

	return (
		<AdminLayout>
			<AdminPropertiesTableModern properties={properties} loading={loading} />
		</AdminLayout>
	);
}
