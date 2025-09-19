// app/auth/login/page.tsx
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginWithUserType } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
	title: 'Connexion - HubImmo',
	description: 'Connectez-vous à votre compte HubImmo',
};

export default function LoginPage() {
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
