import React from 'react';
import { Button } from '@/components/ui';
import { Features } from '@/lib/constants';
// Migrated: Features.Properties.PROPERTY_UI_TEXT;

interface PropertyHeaderProps {
	propertiesCount: number;
	onCreateClick: () => void;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
	propertiesCount,
	onCreateClick,
}) => {
	return (
		<div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<div className="flex items-center gap-3 sm:gap-4">
					<div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
						<svg
							className="w-5 h-5 sm:w-6 sm:h-6 text-white"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
							/>
						</svg>
					</div>
					<div className="min-w-0">
						<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
							{Features.Properties.PROPERTY_UI_TEXT.title}
						</h1>
						<p className="text-sm sm:text-base text-gray-600 truncate">
							{Features.Properties.PROPERTY_UI_TEXT.subtitle} •{' '}
							{Features.Properties.getPropertyCountText(
								propertiesCount,
							)}
						</p>
					</div>
				</div>
				<div className="flex items-center">
					<Button
						onClick={onCreateClick}
						className="bg-gradient-to-r from-brand to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-lg w-full sm:w-auto text-sm"
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
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						<span className="hidden sm:inline">
							{Features.Properties.PROPERTY_UI_TEXT.newProperty}
						</span>
						<span className="sm:hidden">Nouvelle annonce</span>
					</Button>
				</div>
			</div>
		</div>
	);
};
