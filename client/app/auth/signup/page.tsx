// app/auth/signup/page.tsx
'use client';

import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function SignupPage() {
	const { loading } = useAuthRedirect();

	if (loading) {
		return (
			<div className="animate-pulse bg-gray-100 h-64 rounded-lg"></div>
		);
	}

	return <SignUpForm />;
}
