interface GeneralSettingsProps {
	defaultDuration: number;
	bufferTime: number;
	maxAppointmentsPerDay: number;
	advanceBookingDays: number;
	onSettingChange: (
		field:
			| 'defaultDuration'
			| 'bufferTime'
			| 'maxAppointmentsPerDay'
			| 'advanceBookingDays',
		value: number,
	) => void;
}

export const GeneralSettings = ({
	defaultDuration,
	bufferTime,
	maxAppointmentsPerDay,
	advanceBookingDays,
	onSettingChange,
}: GeneralSettingsProps) => {
	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6">
			<h3 className="text-lg font-semibold text-gray-900 mb-4">
				Paramètres généraux
			</h3>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Durée par défaut (min)
					</label>
					<input
						type="number"
						min="15"
						max="180"
						step="15"
						value={defaultDuration}
						onChange={(e) =>
							onSettingChange(
								'defaultDuration',
								parseInt(e.target.value) || 15,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Temps de pause (min)
					</label>
					<input
						type="number"
						min="0"
						max="60"
						step="5"
						value={bufferTime}
						onChange={(e) =>
							onSettingChange(
								'bufferTime',
								parseInt(e.target.value) || 0,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Max RDV par jour
					</label>
					<input
						type="number"
						min="1"
						max="20"
						value={maxAppointmentsPerDay}
						onChange={(e) =>
							onSettingChange(
								'maxAppointmentsPerDay',
								parseInt(e.target.value) || 1,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Jours d&apos;avance
					</label>
					<input
						type="number"
						min="1"
						max="90"
						value={advanceBookingDays}
						onChange={(e) =>
							onSettingChange(
								'advanceBookingDays',
								parseInt(e.target.value) || 1,
							)
						}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
					/>
				</div>
			</div>
		</div>
	);
};
