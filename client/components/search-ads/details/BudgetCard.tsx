import React from 'react';
import { SearchAd } from '@/types/searchAd';

interface BudgetCardProps {
	searchAd: SearchAd;
}

const formatFinancingType = (type: string) => {
	const typeMap: Record<string, string> = {
		loan: 'Prêt bancaire',
		cash: 'Cash',
		pending: "En attente d'accord",
	};
	return typeMap[type] || type;
};

export const BudgetCard: React.FC<BudgetCardProps> = ({ searchAd }) => {
	return (
		<div className="group bg-white p-6 rounded-xl shadow-md border border-gray-200/50 hover:shadow-xl hover:border-cyan-200 transition-all duration-300">
			<div className="flex items-center gap-3 mb-4">
				<div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
					<span className="text-xl">💰</span>
				</div>
				<h3 className="text-lg font-bold text-gray-900">Budget</h3>
			</div>
			<div className="space-y-3">
				<div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-lg border border-emerald-200">
					<span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1.5">
						Budget maximum
					</span>
					<p className="text-emerald-900 text-xl font-bold">
						{searchAd.budget.max.toLocaleString()} €
					</p>
				</div>

				{searchAd.budget.ideal && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							Budget idéal
						</span>
						<p className="text-gray-900 font-medium text-base">
							{searchAd.budget.ideal.toLocaleString()} €
						</p>
					</div>
				)}

				{searchAd.budget.financingType && (
					<div>
						<span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
							Type de financement
						</span>
						<p className="text-gray-900 font-medium text-base">
							{formatFinancingType(searchAd.budget.financingType)}
						</p>
					</div>
				)}

				<div className="space-y-2 pt-1">
					{searchAd.budget.isSaleInProgress && (
						<div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
							<div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-sm"></div>
							<span className="text-xs font-medium text-blue-800">
								Vente en cours
							</span>
						</div>
					)}
					{searchAd.budget.hasBankApproval && (
						<div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
							<div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-sm"></div>
							<span className="text-xs font-medium text-green-800">
								Accord bancaire obtenu
							</span>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
