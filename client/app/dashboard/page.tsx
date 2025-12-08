'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardContent } from '@/components/dashboard-agent/DashboardContent';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Home from '@/components/dashboard-apporteur/Home';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
	const router = useRouter();
	const { user, loading } = useAuth();

	// Redirect admins to /admin
	useEffect(() => {
		if (!loading && user?.userType === 'admin') {
			router.replace('/admin');
		}
	}, [user, loading, router]);

	// Don't render anything while checking or if admin (will redirect)
	if (loading || user?.userType === 'admin') {
		return null;
	}

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
