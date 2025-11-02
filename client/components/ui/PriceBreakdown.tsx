'use client';

import React from 'react';

interface PriceBreakdownProps {
	netPrice: number;
	agencyFeesPercentage?: number;
	className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
	netPrice,
	agencyFeesPercentage = 0,
	className = '',
}) => {
	// Calculate agency fees and total price
	const agencyFeesAmount = (netPrice * agencyFeesPercentage) / 100;
	const priceIncludingFees = netPrice + agencyFeesAmount;

	// If no agency fees, don't show the breakdown
	if (!agencyFeesPercentage || agencyFeesPercentage === 0) {
		return null;
	}

	return (
		<div
			className={`bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-5 border-2 border-brand-100 ${className}`}
		>
			<div className="flex items-center gap-2 mb-4">
				<div className="w-8 h-8 bg-gradient-to-br from-brand to-brand-600 rounded-lg flex items-center justify-center">
					<span className="text-white text-lg">💰</span>
				</div>
				<h3 className="text-base font-bold text-gray-900">
					Prix et frais
				</h3>
			</div>

			<div className="space-y-3">
				{/* Net seller price */}
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-600">
						Prix net vendeur
					</span>
					<span className="text-lg font-bold text-gray-900">
						{netPrice.toLocaleString('fr-FR')} €
					</span>
				</div>

				{/* Agency fee percentage */}
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-600">
						% frais d&apos;agence
					</span>
					<span className="text-base font-semibold text-brand">
						{agencyFeesPercentage} %
					</span>
				</div>

				{/* Separator */}
				<div className="border-t border-blue-200 my-2"></div>

				{/* Agency fees amount */}
				<div className="flex justify-between items-center">
					<span className="text-sm text-gray-600 flex items-center gap-1">
						<span className="text-brand">→</span> Frais
						d&apos;agence
					</span>
					<span className="text-base font-semibold text-gray-700">
						{agencyFeesAmount.toLocaleString('fr-FR')} €
					</span>
				</div>

				{/* Total price including fees */}
				<div className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-200">
					<span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
						<span className="text-brand">→</span> Prix FAI
					</span>
					<span className="text-xl font-bold text-brand">
						{priceIncludingFees.toLocaleString('fr-FR')} €
					</span>
				</div>

				{/* Info note */}
				<div className="mt-3 pt-3 border-t border-blue-200">
					<p className="text-xs text-gray-500 italic">
						FAI = Frais d&apos;Acquéreur Inclus
					</p>
				</div>
			</div>
		</div>
	);
};
