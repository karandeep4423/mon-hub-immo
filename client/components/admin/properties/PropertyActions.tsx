import React from 'react';
import Link from 'next/link';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import type { AdminProperty } from '@/types/admin';

interface PropertyActionsProps {
	property: AdminProperty;
	onDelete: () => void;
}

export const PropertyActions: React.FC<PropertyActionsProps> = ({
	property,
	onDelete,
}) => {
	const basePath =
		property.propertyType === 'Recherche' ? '/search-ads' : '/property';

	return (
		<div className="flex items-center justify-end gap-1.5">
			<Link
				href={`${basePath}/${property._id}`}
				className="p-2 hover:bg-blue-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200 group"
				title="Voir"
			>
				<Eye className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
			</Link>
			<Link
				href={`${basePath}/edit/${property._id}?returnPath=/admin/properties`}
				className="p-2 hover:bg-amber-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-amber-200 group"
				title="Modifier"
			>
				<Pencil className="w-4 h-4 text-gray-600 group-hover:text-amber-600 transition-colors" />
			</Link>
			<button
				className="p-2 hover:bg-red-50 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200 group"
				title="Supprimer"
				onClick={onDelete}
			>
				<Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600 transition-colors" />
			</button>
		</div>
	);
};
