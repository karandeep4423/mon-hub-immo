import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface DashboardQuickActionsProps {
	onCreateProperty: () => void;
	onViewProperties: () => void;
}

export const DashboardQuickActions: React.FC<DashboardQuickActionsProps> = ({
	onCreateProperty,
	onViewProperties,
}) => {
	return (
		<div className="bg-white rounded-xl shadow-sm p-6 mb-8">
			<h3 className="text-lg font-semibold text-gray-900 mb-6">
				Actions rapides
			</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Primary CTA - Create Property */}
				<div className="sm:col-span-2 lg:col-span-1">
					<Button
						onClick={onCreateProperty}
						className="w-full bg-gradient-to-r from-brand to-brand-700 hover:from-brand-600 hover:to-brand-800 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
						size="md"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						<span className="font-semibold">Créer une annonce</span>
					</Button>
				</div>
				<Button
					onClick={onViewProperties}
					variant="outline"
					className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
					size="md"
				>
					<svg
						className="w-4 h-4 mr-2"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M4 6h16M4 10h16M4 14h16M4 18h16"
						/>
					</svg>
					Mes annonces
				</Button>
				<Link href="/chat">
					<Button
						variant="outline"
						className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
						size="md"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
						Messages
					</Button>
				</Link>

				<Link href="/dashboard/profile">
					<Button
						variant="outline"
						className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
						size="md"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
							/>
						</svg>
						Modifier profil
					</Button>
				</Link>

				<a href="mailto:contact@monhubimmo.com" className="w-full">
					<Button
						variant="outline"
						className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
						size="md"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
							/>
						</svg>
						Contact Support
					</Button>
				</a>
			</div>
		</div>
	);
};
