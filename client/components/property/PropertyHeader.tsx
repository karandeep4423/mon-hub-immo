import React from 'react';
import { Button } from '@/components/ui';
import { PROPERTY_TEXT, getPropertyCountText } from '@/lib/constants/text';

interface PropertyHeaderProps {
	propertiesCount: number;
	onCreateClick: () => void;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
	propertiesCount,
	onCreateClick,
}) => {
	return (
		<div className="bg-white rounded-xl shadow-sm border p-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
						<svg
							className="w-6 h-6 text-white"
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
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{PROPERTY_TEXT.title}
						</h1>
						<p className="text-gray-600">
							{PROPERTY_TEXT.subtitle} •{' '}
							{getPropertyCountText(propertiesCount)}
						</p>
					</div>
				</div>
				<div className="flex items-center space-x-3">
					<Button
						onClick={onCreateClick}
						className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
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
						{PROPERTY_TEXT.newProperty}
					</Button>
				</div>
			</div>
		</div>
	);
};
