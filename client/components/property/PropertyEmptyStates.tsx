import React from 'react';
import { Button } from '@/components/ui';

interface PropertyEmptyStateProps {
	onCreateClick: () => void;
}

export const PropertyEmptyState: React.FC<PropertyEmptyStateProps> = ({
	onCreateClick,
}) => {
	return (
		<div className="text-center py-16 bg-brand-subtle rounded-2xl border border-brand-200">
			<div className="mx-auto w-20 h-20 bg-brand rounded-full flex items-center justify-center mb-6 shadow-brand">
				<svg
					className="w-10 h-10 text-white"
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
			<h3 className="text-2xl font-bold text-gray-900 mb-3">
				Commencez à publier vos biens
			</h3>
			<p className="text-gray-600 mb-2 max-w-md mx-auto">
				Créez votre première annonce immobilière et atteignez des
				milliers de clients potentiels.
			</p>
			<p className="text-sm text-gray-500 mb-8">
				✨ Processus simple en 4 étapes • 📸 Ajoutez vos photos • 🚀
				Publication instantanée
			</p>
			<div className="space-y-3">
				<Button
					onClick={onCreateClick}
					className="px-8 py-3 text-lg font-semibold"
					size="lg"
				>
					<svg
						className="w-5 h-5 mr-2"
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
					Créer ma première annonce
				</Button>
				<div className="text-xs text-gray-400">
					Gratuit et sans engagement
				</div>
			</div>
		</div>
	);
};

interface NoResultsStateProps {
	onResetFilters: () => void;
}

export const NoResultsState: React.FC<NoResultsStateProps> = ({
	onResetFilters,
}) => {
	return (
		<div className="text-center py-12 bg-white rounded-xl border border-gray-200">
			<div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
				Aucun bien trouvé
			</h3>
			<p className="text-gray-600 mb-4">
				Aucun bien ne correspond à vos critères de recherche.
			</p>
			<Button variant="outline" onClick={onResetFilters}>
				Réinitialiser les filtres
			</Button>
		</div>
	);
};
