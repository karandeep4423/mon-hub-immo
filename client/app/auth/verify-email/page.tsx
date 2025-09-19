import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { AuthLayout } from '@/components/auth/AuthLayout';

export const metadata: Metadata = {
	title: 'Verify Email - HubImmo',
	description: 'Verify your email address',
};

export default function VerifyEmailPage() {
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
