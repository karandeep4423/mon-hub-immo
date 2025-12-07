import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Home, Eye } from 'lucide-react';
import type { AdminProperty } from '@/types/admin';
import { getPropertyTypeLabel } from '@/lib/utils/adminUtils';

interface PropertyGridCardProps {
	property: AdminProperty;
	onDelete: () => void;
}

export const PropertyGridCard: React.FC<PropertyGridCardProps> = ({
	property,
	onDelete,
}) => {
	const basePath =
		property.propertyType === 'Recherche' ? '/search-ads' : '/property';

	return (
		<div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group">
			<div className="w-full h-40 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-4xl group-hover:scale-105 transition-transform">
				<Home className="w-10 h-10 text-gray-600" />
			</div>
			<div className="p-4">
				<h3 className="font-bold text-gray-900 mb-1">
					{property.title}
				</h3>
				<p className="text-xs text-gray-500 mb-3">
					<Home className="w-4 h-4 inline-block mr-2 text-gray-500" />
					{property.location || property.city}
				</p>
				<div className="flex items-center justify-between mb-4">
					<span className="text-lg font-bold text-cyan-600">
						€{(property.price / 1000).toFixed(0)}k
					</span>
					<Badge variant="info" size="sm">
						{getPropertyTypeLabel(
							(property.propertyType || property.type) ?? '',
						)}
					</Badge>
				</div>
				<div className="flex items-center justify-between text-xs text-gray-600 mb-4 pb-4 border-b">
					<span>
						<Eye className="w-4 h-4 inline-block mr-2" />
						{property.views || 0} vues
					</span>
					<span>
						📅{' '}
						{new Date(property.createdAt).toLocaleDateString(
							'fr-FR',
						)}
					</span>
				</div>
				<div className="flex gap-2">
					<Link
						href={`${basePath}/${property._id}`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors text-sm font-medium text-center"
					>
						Voir
					</Link>
					<Link
						href={`${basePath}/edit/${property._id}?returnPath=/admin/properties`}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded transition-colors text-sm font-medium text-center"
					>
						Modifier
					</Link>
					<button
						onClick={onDelete}
						className="flex-1 px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors text-sm font-medium"
					>
						Supprimer
					</button>
				</div>
			</div>
		</div>
	);
};
