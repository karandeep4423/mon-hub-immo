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
						value={defaultDuration}
						onChange={(e) => {
							const numValue = parseInt(e.target.value);
							onSettingChange(
								'defaultDuration',
								isNaN(numValue) ? 0 : numValue,
							);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
						placeholder="Ex: 60"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Temps de pause (min)
					</label>
					<input
						type="number"
						value={bufferTime}
						onChange={(e) => {
							const numValue = parseInt(e.target.value);
							onSettingChange(
								'bufferTime',
								isNaN(numValue) ? 0 : numValue,
							);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
						placeholder="Ex: 5"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Max RDV par jour
					</label>
					<input
						type="number"
						value={maxAppointmentsPerDay}
						onChange={(e) => {
							const numValue = parseInt(e.target.value);
							onSettingChange(
								'maxAppointmentsPerDay',
								isNaN(numValue) ? 0 : numValue,
							);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
						placeholder="Ex: 8"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Jours d&apos;avance
					</label>
					<input
						type="number"
						value={advanceBookingDays}
						onChange={(e) => {
							const numValue = parseInt(e.target.value);
							onSettingChange(
								'advanceBookingDays',
								isNaN(numValue) ? 0 : numValue,
							);
						}}
						className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20"
						placeholder="Ex: 30"
					/>
				</div>
			</div>
		</div>
	);
};
