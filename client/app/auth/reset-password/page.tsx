'use client';

import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function ResetPasswordPage() {
	const { loading } = useAuthRedirect();

	if (loading) {
		return (
			<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
		);
	}

	return (
		<AuthLayout title="Reset Password">
			<Suspense
				fallback={
					<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
				}
			>
				<ResetPasswordForm />
			</Suspense>
		</AuthLayout>
	);
}
