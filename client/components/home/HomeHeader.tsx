interface HomeHeaderProps {
	filteredPropertiesCount: number;
	filteredSearchAdsCount: number;
}

export const HomeHeader = ({
	filteredPropertiesCount,
	filteredSearchAdsCount,
}: HomeHeaderProps) => {
	return (
		<div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
			<div className="text-sm text-gray-600">
				{filteredPropertiesCount} bien
				{filteredPropertiesCount > 1 ? 's' : ''} •{' '}
				{filteredSearchAdsCount} recherche
				{filteredSearchAdsCount > 1 ? 's' : ''}
			</div>
		</div>
	);
};
