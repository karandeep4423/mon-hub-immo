import React from 'react';
import { Button, StatusBadge } from '@/components/ui';
import { Property } from '@/lib/api/propertyApi';
import { getImageUrl } from '@/lib/utils/imageUtils';
import { getBadgeConfig } from '@/lib/constants/badges';

interface PropertyListItemProps {
	property: Property;
	onEdit: (property: Property) => void;
	onDelete: (propertyId: string) => void;
	onStatusChange: (propertyId: string, newStatus: Property['status']) => void;
}

export const PropertyListItem: React.FC<PropertyListItemProps> = ({
	property,
	onEdit,
	onDelete,
	onStatusChange,
}) => {
	return (
		<div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
			<div className="flex">
				<div className="w-48 h-32 bg-gray-200 flex-shrink-0 relative">
					<img
						src={getImageUrl(property.mainImage, 'medium')}
						alt={property.title}
						className="object-cover w-full h-full"
					/>
				</div>
				<div className="flex-1 p-4">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<div className="flex items-center flex-wrap gap-2 mb-2">
								<h3 className="text-lg font-semibold text-gray-900 truncate">
									{property.title}
								</h3>
								{property.badges &&
									property.badges.length > 0 &&
									property.badges.map((badgeValue) => {
										const config =
											getBadgeConfig(badgeValue);
										if (!config) return null;

										return (
											<span
												key={badgeValue}
												className={`${config.bgColor.replace('bg-', 'bg-opacity-20 bg-')} ${config.color.replace('text-white', `text-${config.bgColor.split('-')[1]}-800`)} text-xs px-2 py-1 rounded-full`}
											>
												{config.label}
											</span>
										);
									})}
							</div>
							<p className="text-gray-600 text-sm mb-2 line-clamp-2">
								{property.description}
							</p>
							<div className="flex items-center space-x-4 text-sm text-gray-500">
								<span>{property.propertyType}</span>
								<span>•</span>
								<span>{property.surface} m²</span>
								<span>•</span>
								<span>{property.city}</span>
								<span>•</span>
								<span>{property.viewCount} vues</span>
							</div>
						</div>
						<div className="text-right">
							<div className="text-xl font-bold text-gray-900 mb-2">
								{property.price.toLocaleString()} €
							</div>
							<StatusBadge
								entityType="property"
								status={property.status}
							/>
						</div>
					</div>
					<div className="flex items-center justify-between mt-4 pt-4 border-t">
						<div className="flex items-center space-x-2">
							<select
								value={property.status}
								onChange={(e) =>
									onStatusChange(
										property._id,
										e.target.value as Property['status'],
									)
								}
								className="text-sm border border-gray-300 rounded px-2 py-1"
							>
								<option value="draft">Brouillon</option>
								<option value="active">Actif</option>
								<option value="sold">Vendu</option>
								<option value="rented">Loué</option>
								<option value="archived">Archivé</option>
							</select>
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(property)}
							>
								Modifier
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => onDelete(property._id)}
								className="text-red-600 border-red-300 hover:bg-red-50"
							>
								Supprimer
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
