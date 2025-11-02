import { SearchAd } from '@/types/searchAd';
import { HomeSearchAdCard } from '@/components/search-ads/HomeSearchAdCard';
import { Pagination } from '@/components/ui/Pagination';

interface SearchAdsSectionProps {
	searchAds: SearchAd[];
	currentPage: number;
	pageSize: number;
	onPageChange: (page: number) => void;
}

export const SearchAdsSection = ({
	searchAds,
	currentPage,
	pageSize,
	onPageChange,
}: SearchAdsSectionProps) => {
	return (
		<div id="search-ads-section">
			<h2 className="text-2xl font-bold text-gray-900 mb-6">
				Recherches clients
			</h2>
			{searchAds.length === 0 ? (
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
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						Aucune recherche trouvée
					</h3>
					<p className="text-gray-600">
						Essayez d&apos;ajuster vos filtres pour voir des
						recherches clients.
					</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{searchAds
							.slice(
								(currentPage - 1) * pageSize,
								currentPage * pageSize,
							)
							.map((searchAd) => (
								<HomeSearchAdCard
									key={searchAd._id}
									searchAd={searchAd}
								/>
							))}
					</div>
					<Pagination
						currentPage={currentPage}
						totalItems={searchAds.length}
						pageSize={pageSize}
						onPageChange={onPageChange}
						scrollTargetId="search-ads-section"
						className="mt-4"
					/>
				</>
			)}
		</div>
	);
};
