import { Button } from '@/components/ui';

interface BlockedDatesTabProps {
	dateOverrides: Array<{
		date: string;
		isAvailable: boolean;
	}>;
	newBlockedDate: string;
	newBlockedDateEnd: string;
	saving: boolean;
	onNewBlockedDateChange: (value: string) => void;
	onNewBlockedDateEndChange: (value: string) => void;
	onAddBlockedDate: () => void;
	onRequestUnblock: (date: string) => void;
}

export const BlockedDatesTab = ({
	dateOverrides,
	newBlockedDate,
	newBlockedDateEnd,
	saving,
	onNewBlockedDateChange,
	onNewBlockedDateEndChange,
	onAddBlockedDate,
	onRequestUnblock,
}: BlockedDatesTabProps) => {
	return (
		<div className="space-y-6">
			{/* Add blocked date or date range */}
			<div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-4">
				<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
					<svg
						className="w-5 h-5 mr-2 text-cyan-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 6v6m0 0v6m0-6h6m-6 0H6"
						/>
					</svg>
					Bloquer une date ou une période
				</h4>
				<div className="space-y-3">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Date de début *
							</label>
							<input
								type="date"
								value={newBlockedDate}
								onChange={(e) => {
									onNewBlockedDateChange(e.target.value);
									// Reset end date if it's before start date
									if (
										newBlockedDateEnd &&
										e.target.value > newBlockedDateEnd
									) {
										onNewBlockedDateEndChange('');
									}
								}}
								min={new Date().toISOString().split('T')[0]}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
							/>
						</div>
						<div>
							<label className="block text-xs font-medium text-gray-700 mb-1">
								Date de fin (optionnel)
							</label>
							<input
								type="date"
								value={newBlockedDateEnd}
								onChange={(e) =>
									onNewBlockedDateEndChange(e.target.value)
								}
								min={
									newBlockedDate ||
									new Date().toISOString().split('T')[0]
								}
								disabled={!newBlockedDate}
								className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
							/>
						</div>
					</div>
					<p className="text-xs text-gray-600">
						💡 Laissez la date de fin vide pour bloquer une seule
						journée, ou remplissez-la pour bloquer une période
						complète.
					</p>
					<Button
						onClick={onAddBlockedDate}
						loading={saving}
						disabled={!newBlockedDate}
						className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 6v6m0 0v6m0-6h6m-6 0H6"
							/>
						</svg>
						Bloquer{' '}
						{newBlockedDateEnd ? 'cette période' : 'cette date'}
					</Button>
				</div>
			</div>

			{/* List of blocked dates */}
			{dateOverrides.length === 0 ? (
				<div className="text-center py-8 text-gray-500">
					<svg
						className="w-12 h-12 mx-auto mb-3 text-gray-300"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
						/>
					</svg>
					<p>Aucune date bloquée</p>
					<p className="text-sm mt-1">
						Ajoutez des dates pour bloquer les réservations
						(vacances, jours fériés, etc.)
					</p>
				</div>
			) : (
				<div className="space-y-2">
					{dateOverrides.map((override) => (
						<div
							key={override.date}
							className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
						>
							<div className="flex items-center gap-3">
								<svg
									className="w-5 h-5 text-red-600"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
									/>
								</svg>
								<span className="font-medium text-gray-900">
									{new Date(override.date).toLocaleDateString(
										'fr-FR',
										{
											weekday: 'long',
											day: 'numeric',
											month: 'long',
											year: 'numeric',
										},
									)}
								</span>
							</div>
							<Button
								onClick={() => onRequestUnblock(override.date)}
								loading={saving}
								variant="outline"
								size="sm"
								className="text-red-600 hover:bg-red-100"
							>
								Débloquer
							</Button>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
