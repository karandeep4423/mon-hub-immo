import { DayScheduleCard } from './DayScheduleCard';
import type { DayAvailability } from '@/types/appointment';

interface WeeklyScheduleTabProps {
	weeklySchedule: DayAvailability[];
	onToggleDayAvailability: (day: number) => void;
	onAddSlotToDay: (day: number) => void;
	onUpdateDaySlot: (
		day: number,
		slotIndex: number,
		field: 'startTime' | 'endTime',
		value: string,
	) => void;
	onRemoveSlotFromDay: (day: number, slotIndex: number) => void;
}

const DAYS_OF_WEEK = [
	{ value: 1, label: 'Lundi' },
	{ value: 2, label: 'Mardi' },
	{ value: 3, label: 'Mercredi' },
	{ value: 4, label: 'Jeudi' },
	{ value: 5, label: 'Vendredi' },
	{ value: 6, label: 'Samedi' },
	{ value: 0, label: 'Dimanche' },
];

export const WeeklyScheduleTab = ({
	weeklySchedule,
	onToggleDayAvailability,
	onAddSlotToDay,
	onUpdateDaySlot,
	onRemoveSlotFromDay,
}: WeeklyScheduleTabProps) => {
	return (
		<div className="space-y-4">
			{DAYS_OF_WEEK.map((day) => {
				const daySchedule = weeklySchedule.find(
					(d) => d.dayOfWeek === day.value,
				);
				if (!daySchedule) return null;

				return (
					<DayScheduleCard
						key={day.value}
						day={day}
						isAvailable={daySchedule.isAvailable}
						slots={daySchedule.slots}
						onToggleAvailability={() =>
							onToggleDayAvailability(day.value)
						}
						onAddSlot={() => onAddSlotToDay(day.value)}
						onUpdateSlot={(slotIndex, field, value) =>
							onUpdateDaySlot(day.value, slotIndex, field, value)
						}
						onRemoveSlot={(slotIndex) =>
							onRemoveSlotFromDay(day.value, slotIndex)
						}
					/>
				);
			})}
		</div>
	);
};
