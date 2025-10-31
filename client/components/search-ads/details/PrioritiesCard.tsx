import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface PrioritiesCardProps {
	searchAd: SearchAd;
}

export const PrioritiesCard: React.FC<PrioritiesCardProps> = ({ searchAd }) => {
	if (!searchAd.priorities) return null;

	return (
		<div className="bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-brand-200 transition-all duration-300 lg:col-span-2">
			<div className="flex items-center gap-3 mb-5">
				<div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">❤️</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">
					Priorités personnelles
				</h3>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-5">
				{searchAd.priorities.mustHaves &&
					searchAd.priorities.mustHaves.length > 0 && (
						<div className="bg-gradient-to-br from-red-50 to-rose-50 p-4 rounded-xl border-2 border-red-200">
							<h4 className="font-bold text-red-900 mb-2.5 flex items-center gap-2 text-sm">
								<span className="text-base">🔴</span>
								<span>Indispensables</span>
							</h4>
							<div className="space-y-2">
								{searchAd.priorities.mustHaves.map(
									(item, index) => (
										<div
											key={index}
											className="flex items-start gap-2 text-sm"
										>
											<div className="w-1 h-1 bg-red-600 rounded-full mt-1.5 flex-shrink-0"></div>
											<span className="text-red-900 font-medium">
												{item}
											</span>
										</div>
									),
								)}
							</div>
						</div>
					)}

				{searchAd.priorities.niceToHaves &&
					searchAd.priorities.niceToHaves.length > 0 && (
						<div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border-2 border-yellow-200">
							<h4 className="font-bold text-yellow-900 mb-2.5 flex items-center gap-2 text-sm">
								<span className="text-base">🟡</span>
								<span>Souhaitables</span>
							</h4>
							<div className="space-y-2">
								{searchAd.priorities.niceToHaves.map(
									(item, index) => (
										<div
											key={index}
											className="flex items-start gap-2 text-sm"
										>
											<div className="w-1 h-1 bg-yellow-600 rounded-full mt-1.5 flex-shrink-0"></div>
											<span className="text-yellow-900 font-medium">
												{item}
											</span>
										</div>
									),
								)}
							</div>
						</div>
					)}

				{searchAd.priorities.dealBreakers &&
					searchAd.priorities.dealBreakers.length > 0 && (
						<div className="bg-gradient-to-br from-gray-100 to-gray-50 p-4 rounded-xl border-2 border-gray-300">
							<h4 className="font-bold text-gray-900 mb-2.5 flex items-center gap-2 text-sm">
								<span className="text-base">⚫</span>
								<span>Points de blocage</span>
							</h4>
							<div className="space-y-2">
								{searchAd.priorities.dealBreakers.map(
									(item, index) => (
										<div
											key={index}
											className="flex items-start gap-2 text-sm"
										>
											<div className="w-1 h-1 bg-gray-600 rounded-full mt-1.5 flex-shrink-0"></div>
											<span className="text-gray-900 font-medium">
												{item}
											</span>
										</div>
									),
								)}
							</div>
						</div>
					)}
			</div>
		</div>
	);
};
