import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
	title: 'Reset Password - HubImmo',
	description: 'Reset your HubImmo password',
};

export default function ResetPasswordPage() {
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
