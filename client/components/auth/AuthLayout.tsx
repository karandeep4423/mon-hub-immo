// components/auth/AuthLayout.tsx
import React from 'react';
import Head from 'next/head';

interface AuthLayoutProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<Head>
				<title>{title} - HubImmo</title>
				<meta name="description" content="HubImmo authentication" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
			</Head>

			{/* Mobile-optimized form container */}
			<div className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-2xl shadow-card border border-gray-200 p-6 sm:p-8">
						{children}
					</div>
				</div>
			</div>
		</div>
	);
};
