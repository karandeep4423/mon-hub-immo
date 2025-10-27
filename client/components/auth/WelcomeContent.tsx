'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '@/hooks';
import { Button } from '../ui/Button';
import { Features } from '@/lib/constants';

export const WelcomeContent: React.FC = () => {
	const router = useRouter();
	const { user } = useRequireAuth();

	if (!user) return null;

	return (
		<div className="text-center space-y-6">
			<div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
				<svg
					className="w-8 h-8 text-green-600"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M5 13l4 4L19 7"
					/>
				</svg>
			</div>

			<div>
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Welcome, {user.firstName}!
				</h3>
				<p className="text-gray-600">
					Your account has been verified successfully! You are all set
					to start exploring properties on HubImmo.
				</p>
			</div>

			<div className="bg-gray-50 rounded-lg p-4">
				<div className="text-sm text-gray-600 space-y-1">
					<p>
						<strong>Name:</strong> {user.firstName} {user.lastName}
					</p>
					<p>
						<strong>Email:</strong> {user.email}
					</p>
					<p>
						<strong>Account Type:</strong> {user.userType}
					</p>
				</div>
			</div>

			<Button
				onClick={() =>
					router.push(Features.Dashboard.DASHBOARD_ROUTES.BASE)
				}
				className="w-full"
				size="lg"
			>
				Continue to Dashboard
			</Button>
		</div>
	);
};
