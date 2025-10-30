'use client';

import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function VerifyEmailPage() {
	const { loading } = useAuthRedirect();

	if (loading) {
		return (
			<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
		);
	}

	return (
		<AuthLayout title="Verify Your Email">
			<Suspense
				fallback={
					<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
				}
			>
				<VerifyEmailForm />
			</Suspense>
		</AuthLayout>
	);
}
