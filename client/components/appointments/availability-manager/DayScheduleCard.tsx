import { Button } from '@/components/ui';
import { TimeSlotInput } from './TimeSlotInput';
import { TimeSlot } from '@/types/appointment';

interface DayScheduleCardProps {
	day: {
		value: number;
		label: string;
	};
	isAvailable: boolean;
	slots: TimeSlot[];
	onToggleAvailability: () => void;
	onAddSlot: () => void;
	onUpdateSlot: (
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: string,
	) => void;
	onRemoveSlot: (slotIndex: number) => void;
}

export const DayScheduleCard = ({
	day,
	isAvailable,
	slots,
	onToggleAvailability,
	onAddSlot,
	onUpdateSlot,
	onRemoveSlot,
}: DayScheduleCardProps) => {
	return (
		<div
			className={`border rounded-lg p-4 transition-all ${
				isAvailable
					? 'border-cyan-200 bg-gradient-to-r from-cyan-50 to-blue-50'
					: 'border-gray-200 bg-gray-50'
			}`}
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-3">
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							className="sr-only peer"
							checked={isAvailable}
							onChange={onToggleAvailability}
						/>
						<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
					</label>
					<span className="text-lg font-medium text-gray-900">
						{day.label}
					</span>
				</div>

				{isAvailable && (
					<Button
						onClick={onAddSlot}
						variant="outline"
						size="sm"
						className="text-cyan-600 border-cyan-300 hover:bg-cyan-50"
					>
						<svg
							className="w-4 h-4 mr-1"
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
						Ajouter un créneau
					</Button>
				)}
			</div>

			{isAvailable && (
				<div className="space-y-3 ml-14">
					{slots.map((slot, slotIndex) => (
						<TimeSlotInput
							key={slotIndex}
							startTime={slot.startTime}
							endTime={slot.endTime}
							onStartTimeChange={(value) =>
								onUpdateSlot(slotIndex, 'startTime', value)
							}
							onEndTimeChange={(value) =>
								onUpdateSlot(slotIndex, 'endTime', value)
							}
							onRemove={() => onRemoveSlot(slotIndex)}
							canRemove={slots.length > 1}
						/>
					))}
				</div>
			)}
		</div>
	);
};
