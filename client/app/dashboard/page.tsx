import type { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard/DashboardContent';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export const metadata: Metadata = {
	title: 'Dashboard - HubImmo',
	description: 'Your HubImmo dashboard',
};

export default function DashboardPage() {
	return (
		<ProtectedRoute>
			<DashboardContent />
		</ProtectedRoute>
	);
}
