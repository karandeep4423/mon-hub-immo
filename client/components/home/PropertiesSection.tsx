import { Property } from '@/lib/api/propertyApi';
import { PropertyCard } from '@/components/property';
import { Pagination } from '@/components/ui/Pagination';

type ContentFilter =
	| 'all'
	| 'myArea'
	| 'properties'
	| 'searchAds'
	| 'favorites';

interface PropertiesSectionProps {
	properties: Property[];
	contentFilter: ContentFilter;
	favoritePropertyIds: Set<string>;
	currentPage: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export const PropertiesSection = ({
	properties,
	contentFilter,
	favoritePropertyIds,
	currentPage,
	pageSize,
	onPageChange,
}: PropertiesSectionProps) => {
	const propertiesToShow =
		contentFilter === 'favorites'
			? properties.filter((property) =>
					favoritePropertyIds.has(property._id),
				)
			: properties;

	return (
		<div id="properties-section">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Les biens à vendre
			</h2>
			{propertiesToShow.length === 0 ? (
				<div className="text-center py-12 bg-gray-50 rounded-lg">
					<div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
						<svg
							className="w-8 h-8 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
							/>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Aucun bien trouvé
					</h3>
					<p className="text-gray-600">
						{contentFilter === 'favorites'
							? "Vous n'avez pas encore de biens en favoris."
							: "Essayez d'ajuster vos filtres pour voir des biens à vendre."}
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{propertiesToShow
							.slice(
								(currentPage - 1) * pageSize,
								currentPage * pageSize,
							)
							.map((property) => (
								<PropertyCard
									key={property._id}
									property={property}
								/>
							))}
					</div>
					<Pagination
						currentPage={currentPage}
						totalItems={propertiesToShow.length}
						pageSize={pageSize}
						onPageChange={onPageChange}
						scrollTargetId="properties-section"
						className="mt-4"
					/>
				</>
			)}
		</div>
	);
};
