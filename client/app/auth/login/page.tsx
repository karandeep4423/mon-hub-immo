// app/auth/login/page.tsx
'use client';

import { Suspense } from 'react';
import { LoginWithUserType } from '@/components/auth/LoginForm';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function LoginPage() {
	const { loading } = useAuthRedirect();

	if (loading) {
		return (
			<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
		);
	}

	return (
		<Suspense
			fallback={
				<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
			}
		>
			<LoginWithUserType />
		</Suspense>
	);
}
