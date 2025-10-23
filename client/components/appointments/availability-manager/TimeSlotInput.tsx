interface TimeSlotInputProps {
	startTime: string;
	endTime: string;
	onStartTimeChange: (value: string) => void;
	onEndTimeChange: (value: string) => void;
	onRemove: () => void;
	canRemove: boolean;
}

export const TimeSlotInput = ({
	startTime,
	endTime,
	onStartTimeChange,
	onEndTimeChange,
	onRemove,
	canRemove,
}: TimeSlotInputProps) => {
	return (
		<div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50/50 to-blue-50/50 p-3 rounded-lg border border-cyan-100">
			<div className="flex items-center gap-2 flex-1">
				<div className="flex-1">
					<label className="block text-xs font-medium text-gray-600 mb-1">
						Début
					</label>
					<input
						type="time"
						value={startTime}
						onChange={(e) => onStartTimeChange(e.target.value)}
						className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base font-medium text-gray-700"
						style={{
							colorScheme: 'light',
						}}
					/>
				</div>
				<div className="flex items-center justify-center pt-6">
					<svg
						className="w-5 h-5 text-cyan-600"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M14 5l7 7m0 0l-7 7m7-7H3"
						/>
					</svg>
				</div>
				<div className="flex-1">
					<label className="block text-xs font-medium text-gray-600 mb-1">
						Fin
					</label>
					<input
						type="time"
						value={endTime}
						onChange={(e) => onEndTimeChange(e.target.value)}
						className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all text-base font-medium text-gray-700"
						style={{
							colorScheme: 'light',
						}}
					/>
				</div>
			</div>

			{canRemove && (
				<button
					onClick={onRemove}
					className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors flex-shrink-0"
					title="Supprimer ce créneau"
				>
					<svg
						className="w-5 h-5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				</button>
			)}
		</div>
	);
};
