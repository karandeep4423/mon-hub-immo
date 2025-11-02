'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface CollaborationHeaderProps {
	onBack: () => void;
}

export const CollaborationHeader: React.FC<CollaborationHeaderProps> = ({
	onBack,
}) => {
	return (
		<div className="bg-white border-b border-gray-200 shadow-sm">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-2 sm:space-x-4">
						<Button
							onClick={onBack}
							variant="outline"
							className="text-gray-600 hover:text-gray-900 flex-shrink-0"
						>
							<svg
								className="w-5 h-5 sm:mr-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 19l-7-7m0 0l7-7m-7 7h18"
								/>
							</svg>
							<span className="hidden sm:inline">Retour</span>
						</Button>
						<div className="min-w-0">
							<h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
								Collaboration
							</h1>
							<p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">
								Suivi et gestion de votre collaboration
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
