'use client';

import type { Metadata } from 'next';
import { DashboardContent } from '@/components/dashboard-agent/DashboardContent';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Home from '@/components/dashboard-apporteur/Home';
import { useAuth } from '@/hooks/useAuth';

const Metadata = {
	title: 'Dashboard - HubImmo',
	description: 'Your HubImmo dashboard',
};

export default function DashboardPage() {
	const { user } = useAuth(); // Assuming you have a user object with userType in your auth context

	return (
		<ProtectedRoute>
			{user?.userType === 'agent' ? (
				<DashboardContent />
			) : user?.userType === 'apporteur' ? (
				<Home />
			) : null}
		</ProtectedRoute>
	);
}
