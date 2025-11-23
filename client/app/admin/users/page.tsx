'use client';

import AdminLayout from '@/components/admin/AdminLayout';
import { AdminUsersTableModern } from '@/components/admin/AdminUsersTableModern';

export default function AdminUsersPage() {
	return (
		<AdminLayout>
			<AdminUsersTableModern />
		</AdminLayout>
	);
}
