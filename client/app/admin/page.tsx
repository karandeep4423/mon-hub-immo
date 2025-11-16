import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminStatsClient from '../../components/admin/AdminStatsClient';

export default function AdminIndex() {
	return (
		<AdminLayout>
			<AdminStatsClient />
		</AdminLayout>
	);
}
