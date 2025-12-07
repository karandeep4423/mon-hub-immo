'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Hook to require subscription for agents
 * Redirects unpaid agents to /payment page
 * Apporteurs and admins bypass subscription check
 */
export const useRequireSubscription = () => {
	const router = useRouter();
	const { user, loading } = useAuth();

	useEffect(() => {
		if (loading) return;

		// Not logged in - let other auth guards handle this
		if (!user) return;

		// Only agents need subscription
		if (user.userType !== 'agent') return;

		// Admin granted free access bypasses payment
		if (user.accessGrantedByAdmin) return;

		// Check if paid
		if (!user.isPaid) {
			router.push('/payment');
		}
	}, [user, loading, router]);

	const requiresPayment =
		!loading &&
		user &&
		user.userType === 'agent' &&
		!user.isPaid &&
		!user.accessGrantedByAdmin;

	return {
		user,
		loading,
		requiresPayment,
		hasSubscription:
			user?.userType !== 'agent' ||
			user?.isPaid ||
			user?.accessGrantedByAdmin,
	};
};
