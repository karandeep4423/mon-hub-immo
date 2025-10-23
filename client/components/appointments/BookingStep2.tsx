import React from 'react';
import { Button } from '../ui/Button';

interface BookingStep2Props {
	availableSlots: string[];
	loadingSlots: boolean;
	scheduledTime: string;
	onTimeChange: (time: string) => void;
	onBackToStep1: () => void;
}

export const BookingStep2: React.FC<BookingStep2Props> = ({
	availableSlots,
	loadingSlots,
	scheduledTime,
	onTimeChange,
	onBackToStep1,
}) => {
	return (
		<div className="space-y-4 animate-fadeIn">
			<div>
				<label className="block text-sm font-semibold text-gray-800 mb-3">
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
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Choisir un créneau horaire *
					</div>
				</label>
				{loadingSlots ? (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-brand border-t-transparent mb-3"></div>
						<p className="text-sm text-gray-600 font-medium">
							Chargement des créneaux...
						</p>
					</div>
				) : availableSlots.length === 0 ? (
					<div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
						<div className="text-5xl md:text-6xl mb-4">📅</div>
						<p className="text-base md:text-lg text-gray-800 font-semibold mb-2">
							Aucun créneau disponible
						</p>
						<p className="text-xs md:text-sm text-gray-600 mb-5 px-4 max-w-md mx-auto">
							L&apos;agent n&apos;a pas encore configuré ses
							disponibilités pour cette date. Veuillez choisir une
							autre date.
						</p>
						<Button
							type="button"
							onClick={onBackToStep1}
							variant="outline"
							className="mt-2"
						>
							← Choisir une autre date
						</Button>
					</div>
				) : (
					<div>
						<div className="grid grid-cols-3 gap-2 md:gap-2.5 max-h-56 overflow-y-auto p-1 bg-gray-50 rounded-xl">
							{availableSlots.map((slot) => (
								<button
									key={slot}
									type="button"
									onClick={() => onTimeChange(slot)}
									className={`relative p-3 md:p-3.5 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
										scheduledTime === slot
											? 'border-brand bg-brand text-white shadow-lg scale-105'
											: 'border-gray-200 bg-white hover:border-brand/50 hover:bg-brand-50 text-gray-700'
									}`}
								>
									<div className="text-sm md:text-base">
										{slot}
									</div>
									{scheduledTime === slot && (
										<div className="absolute -top-1 -right-1 bg-white text-brand rounded-full p-0.5 shadow">
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
						<p className="text-xs text-gray-500 mt-2.5 flex items-center">
							<svg
								className="w-3.5 h-3.5 mr-1"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path
									fillRule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clipRule="evenodd"
								/>
							</svg>
							{availableSlots.length} créneau
							{availableSlots.length > 1 ? 'x' : ''} disponible
							{availableSlots.length > 1 ? 's' : ''}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};
