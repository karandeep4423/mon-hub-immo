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
						className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
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
							d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
					Paramètres
				</Button>
			</div>
		</div>
	);
};
