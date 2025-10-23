import { FormSection } from './FormSection';

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
	cash: 'Cash',
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
		<FormSection title="Budget & financement" emoji="💰">
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
					<select
						id="financingType"
						name="financingType"
						value={financingType}
						onChange={(e) => onFinancingTypeChange(e.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
					>
						<option value="">Sélectionner...</option>
						{financingTypes.map((type) => (
							<option key={type} value={type}>
								{FINANCING_TYPE_LABELS[type] || type}
							</option>
						))}
					</select>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={isSaleInProgress}
							onChange={(e) =>
								onSaleInProgressChange(e.target.checked)
							}
							className="rounded border-gray-300 text-blue-600"
						/>
						<span className="text-sm text-gray-700">
							Vente d&apos;un autre bien en cours ? (vente en
							cascade)
						</span>
					</label>

					<label className="flex items-center space-x-2">
						<input
							type="checkbox"
							checked={hasBankApproval}
							onChange={(e) =>
								onBankApprovalChange(e.target.checked)
							}
							className="rounded border-gray-300 text-blue-600"
						/>
						<span className="text-sm text-gray-700">
							Avez-vous un accord de principe ou une simulation
							bancaire ?
						</span>
					</label>
				</div>
			</div>
		</FormSection>
	);
};
