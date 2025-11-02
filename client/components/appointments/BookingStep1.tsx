import React from 'react';
import { formatDateShort } from '@/lib/utils/date';

interface BookingStep1Props {
	appointmentType: 'estimation' | 'vente' | 'achat' | 'conseil';
	scheduledDate: string;
	onTypeChange: (type: 'estimation' | 'vente' | 'achat' | 'conseil') => void;
	onDateChange: (date: string) => void;
	getMinDate: () => string;
	getMaxDate: () => string;
}

export const BookingStep1: React.FC<BookingStep1Props> = ({
	appointmentType,
	scheduledDate,
	onTypeChange,
	onDateChange,
	getMinDate,
	getMaxDate,
}) => {
	return (
		<div className="space-y-5 animate-fadeIn">
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">
					Type de rendez-vous *
				</label>
				<div className="grid grid-cols-2 gap-2.5 md:gap-3">
					{[
						{
							value: 'estimation',
							label: 'Estimation',
							icon: '📊',
							desc: 'Évaluation',
						},
						{
							value: 'vente',
							label: 'Mise en vente',
							icon: '🏡',
							desc: 'Vendre',
						},
						{
							value: 'achat',
							label: 'Recherche bien',
							icon: '🔍',
							desc: 'Acheter',
						},
						{
							value: 'conseil',
							label: 'Conseil',
							icon: '💼',
							desc: 'Accompagnement',
						},
					].map((type) => (
						<button
							key={type.value}
							type="button"
							onClick={() =>
								onTypeChange(
									type.value as
										| 'estimation'
										| 'vente'
										| 'achat'
										| 'conseil',
								)
							}
							className={`relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
								appointmentType === type.value
									? 'border-brand bg-brand-50 shadow-md scale-[1.02]'
									: 'border-gray-200 hover:border-brand/50 hover:bg-gray-50'
							}`}
						>
							<div className="text-2xl md:text-3xl mb-1">
								{type.icon}
							</div>
							<div className="text-xs md:text-sm font-semibold text-gray-900">
								{type.label}
							</div>
							<div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
								{type.desc}
							</div>
							{appointmentType === type.value && (
								<div className="absolute top-2 right-2 bg-brand text-white rounded-full p-0.5">
									<svg
										className="w-3 h-3"
										fill="currentColor"
										viewBox="0 0 20 20"
									>
										<path
											fillRule="evenodd"
											d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							)}
						</button>
					))}
				</div>
			</div>

			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-2.5">
					<div className="flex items-center">
						<svg
							className="w-4 h-4 mr-1.5 text-brand"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
							/>
						</svg>
						Date souhaitée *
					</div>
				</label>
				<input
					type="date"
					required
					min={getMinDate()}
					max={getMaxDate()}
					value={scheduledDate}
					onChange={(e) => onDateChange(e.target.value)}
					className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm md:text-base"
				/>
				<p className="text-xs text-gray-500 mt-1.5">
					Disponible de demain à {formatDateShort(getMaxDate())}
				</p>
			</div>
		</div>
	);
};
