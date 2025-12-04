'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AdminPropertiesTableModern } from '@/components/admin/AdminPropertiesTable';
import { useAdminProperties } from '@/hooks/useAdminProperties';

export default function AdminPropertiesPage() {
	const { properties } = useAdminProperties({});

	return (
		<AdminLayout>
			{/* AdminPropertiesTableModern expects `initialProperties` as a prop; pass the fetched properties as initialProperties. The component manages its own loading via the hook. */}
			<AdminPropertiesTableModern initialProperties={properties} />
		</AdminLayout>
	);
}
