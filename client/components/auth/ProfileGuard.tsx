'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-toastify';
import { usePathname, useRouter } from 'next/navigation';

/**
 * ProfileGuard - Ensures agents complete their profile AND payment before accessing the platform
 *
 * This component enforces a strict flow for agents:
 * 1. Must complete profile first → redirect to /auth/complete-profile
 * 2. Must complete payment after profile → redirect to /payment
 *
 * Pages that incomplete profiles CAN access:
 * - /auth/complete-profile (obviously)
 * - /auth/* (login, signup, etc.)
 * - Landing page (/)
 * - Legal pages
 *
 * Pages that unpaid agents CAN access (after profile completion):
 * - /payment
 * - /auth/* (for logout, etc.)
 * - Landing page (/)
 * - Legal pages
 */

const ALLOWED_PATHS_FOR_INCOMPLETE_PROFILE = [
	'/auth/complete-profile',
	'/auth/login',
	'/auth/signup',
	'/auth/logout',
	'/auth/verify-email',
	'/auth/forgot-password',
	'/auth/reset-password',
	'/auth/welcome',
	'/', // Landing page
	'/mentions-legales',
	'/politique-de-confidentialite',
	'/politique-cookies',
	'/conditions-generales',
];

const ALLOWED_PATHS_FOR_UNPAID_AGENT = [
	'/payment',
	'/auth/login',
	'/auth/signup',
	'/auth/logout',
	'/auth/verify-email',
	'/', // Landing page
	'/mentions-legales',
	'/politique-de-confidentialite',
	'/politique-cookies',
	'/conditions-generales',
];

export const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
	const pathname = usePathname();
	const router = useRouter();
	const user = useAuthStore((state) => state.user);
	const loading = useAuthStore((state) => state.loading);
	const isInitialized = useAuthStore((state) => state.isInitialized);

	useEffect(() => {
		// Wait for auth to be initialized
		if (!isInitialized || loading) {
			return;
		}

		// Only check for logged-in agents
		if (!user || user.userType !== 'agent') {
			return;
		}

		// Step 1: Check if profile is complete
		if (!user.profileCompleted) {
			const isAllowedPath = ALLOWED_PATHS_FOR_INCOMPLETE_PROFILE.some(
				(path) => pathname === path || pathname?.startsWith(path + '/'),
			);

			if (!isAllowedPath) {
				toast.info(
					'Veuillez compléter votre profil pour accéder à la plateforme',
					{ toastId: 'profile-incomplete' },
				);
				router.replace('/auth/complete-profile');
			}
			return;
		}

		// Step 2: Check if payment is complete (after profile is done)
		// isPaid or accessGrantedByAdmin means they can access
		if (!user.isPaid && !user.accessGrantedByAdmin) {
			const isAllowedPath = ALLOWED_PATHS_FOR_UNPAID_AGENT.some(
				(path) => pathname === path || pathname?.startsWith(path + '/'),
			);

			if (!isAllowedPath) {
				toast.info(
					'Veuillez activer votre abonnement pour accéder à la plateforme',
					{ toastId: 'payment-required' },
				);
				router.replace('/payment');
			}
			return;
		}

		// User has completed profile AND paid - allow access
	}, [user, loading, isInitialized, pathname, router]);

	return <>{children}</>;
};
