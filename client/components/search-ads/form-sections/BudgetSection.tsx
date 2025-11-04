import { FormSection } from './FormSection';
import { Features } from '@/lib/constants';
import React from 'react';
import { Select } from '@/components/ui/CustomSelect';

interface BudgetSectionProps {
	budgetMax: number;
	budgetIdeal?: number;
	financingType: string;
	isSaleInProgress: boolean;
	hasBankApproval: boolean;
	onBudgetMaxChange: (value: number) => void;
	onBudgetIdealChange: (value: number | undefined) => void;
	onFinancingTypeChange: (value: string) => void;
	onSaleInProgressChange: (value: boolean) => void;
	onBankApprovalChange: (value: boolean) => void;
}

const FINANCING_TYPE_LABELS: Record<string, string> = {
	loan: 'Prêt bancaire',
	cash: 'Paiement comptant',
	pending: "En attente d'accord",
};

export const BudgetSection: React.FC<BudgetSectionProps> = ({
	budgetMax,
	budgetIdeal,
	financingType,
	isSaleInProgress,
	hasBankApproval,
	onBudgetMaxChange,
	onBudgetIdealChange,
	onFinancingTypeChange,
	onSaleInProgressChange,
	onBankApprovalChange,
}) => {
	const financingTypes = ['loan', 'cash', 'pending'];

	return (
		<FormSection
			title={Features.SearchAds.SEARCH_AD_FORM_SECTIONS.BUDGET}
			emoji="💰"
		>
			<div className="space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label
							htmlFor="budgetMax"
							className="block text-sm font-medium text-gray-700"
						>
							Budget total maximum ? *
						</label>
						<input
							id="budgetMax"
							name="budgetMax"
							type="number"
							value={budgetMax || ''}
							onChange={(e) =>
								onBudgetMaxChange(Number(e.target.value))
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>

					<div>
						<label
							htmlFor="budgetIdeal"
							className="block text-sm font-medium text-gray-700"
						>
							Budget idéal ?
						</label>
						<input
							id="budgetIdeal"
							name="budgetIdeal"
							type="number"
							value={budgetIdeal || ''}
							onChange={(e) =>
								onBudgetIdealChange(
									e.target.value
										? Number(e.target.value)
										: undefined,
								)
							}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand/20 focus:border-brand"
						/>
					</div>
				</div>

				<div>
					<label
						htmlFor="financingType"
						className="block text-sm font-medium text-gray-700"
					>
						Financement : prêt bancaire / cash / en attente
						d&apos;accord ?
					</label>
					<Select
						value={financingType}
						onChange={(value) => onFinancingTypeChange(value)}
						name="financingType"
						options={[
							{ value: '', label: 'Sélectionner...' },
							...financingTypes.map((type) => ({
								value: type,
								label: FINANCING_TYPE_LABELS[type] || type,
							})),
						]}
					/>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Vente d'un autre bien en cours ? */}
					<label
						className={`
							relative overflow-hidden rounded-xl cursor-pointer
							transition-all duration-300 ease-in-out
							${
								isSaleInProgress
									? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
									: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
							}
						`}
					>
						<input
							type="checkbox"
							checked={isSaleInProgress}
							onChange={(e) =>
								onSaleInProgressChange(e.target.checked)
							}
							className="sr-only"
						/>
						<div
							className={`
								bg-gradient-to-br ${isSaleInProgress ? 'from-amber-50 to-yellow-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300
								${isSaleInProgress ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
						>
							<div className="flex items-center gap-2">
								<div className="text-xl sm:text-2xl">🔁</div>
								<span
									className={`text-sm font-medium transition-colors duration-300 ${isSaleInProgress ? 'text-brand' : 'text-gray-700'}`}
								>
									Vente d&apos;un autre bien en cours ? (vente
									en cascade)
								</span>
								{isSaleInProgress && (
									<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
										✓
									</div>
								)}
							</div>
						</div>
					</label>

					{/* Accord bancaire */}
					<label
						className={`
							relative overflow-hidden rounded-xl cursor-pointer
							transition-all duration-300 ease-in-out
							${
								hasBankApproval
									? 'ring-2 ring-cyan-500 shadow-lg shadow-cyan-200'
									: 'ring-1 ring-gray-200 hover:ring-cyan-300 hover:shadow-md'
							}
						`}
					>
						<input
							type="checkbox"
							checked={hasBankApproval}
							onChange={(e) =>
								onBankApprovalChange(e.target.checked)
							}
							className="sr-only"
						/>
						<div
							className={`
								bg-gradient-to-br ${hasBankApproval ? 'from-teal-50 to-cyan-50' : 'from-gray-50 to-slate-50'}
								p-3 sm:p-4 transition-all duration-300
								${hasBankApproval ? 'bg-opacity-100' : 'bg-opacity-60 hover:bg-opacity-80'}
							`}
						>
							<div className="flex items-center gap-2">
								<div className="text-xl sm:text-2xl">🏦</div>
								<span
									className={`text-sm font-medium transition-colors duration-300 ${hasBankApproval ? 'text-brand' : 'text-gray-700'}`}
								>
									Avez-vous un accord de principe ou une
									simulation bancaire ?
								</span>
								{hasBankApproval && (
									<div className="text-brand text-sm sm:text-base absolute top-1 right-3">
										✓
									</div>
								)}
							</div>
						</div>
					</label>
				</div>
			</div>
		</FormSection>
	);
};
