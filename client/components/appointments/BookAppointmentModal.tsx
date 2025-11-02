'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/hooks/useAuth';
import type { CreateAppointmentData } from '@/types/appointment';
import { useForm } from '@/hooks/useForm';
import { BookingStep1 } from './BookingStep1';
import { BookingStep2 } from './BookingStep2';
import { BookingStep3 } from './BookingStep3';
import {
	useAvailableSlots,
	useAppointmentMutations,
} from '@/hooks/useAppointments';

interface BookAppointmentModalProps {
	isOpen: boolean;
	onClose: () => void;
	agent: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
	};
}

interface AppointmentFormData
	extends CreateAppointmentData,
		Record<string, unknown> {}

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
	isOpen,
	onClose,
	agent,
}) => {
	const { user } = useAuth();
	const [step, setStep] = useState(1);

	// Prevent agents from booking appointments
	const isAgent = user?.userType === 'agent';

	const {
		values,
		isSubmitting,
		setFieldValue,
		handleSubmit,
		resetForm: resetFormValues,
	} = useForm<AppointmentFormData>({
		initialValues: {
			agentId: agent._id,
			appointmentType: 'conseil',
			scheduledDate: '',
			scheduledTime: '',
			contactDetails: {
				name: user ? `${user.firstName} ${user.lastName}` : '',
				email: user?.email || '',
				phone: user?.phone || '',
			},
			propertyDetails: {},
			notes: '',
		},
		onSubmit: async () => {
			await createAppointment(values);
			onClose();
		},
	});

	// Use SWR to load available slots (only when date is selected and on step 2)
	const { data: slotsData, isLoading: loadingSlots } = useAvailableSlots(
		agent._id,
		values.scheduledDate && step === 2 ? values.scheduledDate : undefined,
	);

	// Extract slots array from API response - slotsData is already { slots, isAvailable, duration }
	const availableSlots = slotsData?.slots || [];

	// Get mutation function for creating appointment
	const { createAppointment } = useAppointmentMutations(user?._id);

	const resetForm = useCallback(() => {
		setStep(1);
		resetFormValues();
	}, [resetFormValues]);

	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const getMinDate = () => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		return tomorrow.toISOString().split('T')[0];
	};

	const getMaxDate = () => {
		const maxDate = new Date();
		maxDate.setDate(maxDate.getDate() + 60);
		return maxDate.toISOString().split('T')[0];
	};

	if (!isOpen) return null;

	const stepLabels = ['Type & Date', 'Horaire', 'Coordonnées'];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			size="xl"
			className="max-w-2xl"
		>
			<div className="flex flex-col max-h-[90vh]">
				{/* Header - Professional Design */}
				<div className="px-4 md:px-6 py-4 md:py-5 flex-shrink-0 border-b-2 border-gray-100">
					<div className="flex justify-between items-center mb-6">
						<div className="flex-1 min-w-0">
							<h2 className="text-lg md:text-xl font-bold text-gray-900 truncate">
								Prendre rendez-vous
							</h2>
							<p className="text-gray-600 text-xs md:text-sm truncate">
								avec {agent.firstName} {agent.lastName}
							</p>
						</div>
						<button
							onClick={onClose}
							className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
							aria-label="Fermer"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Professional Progress Stepper */}
					<div className="relative px-2 md:px-4">
						{/* Background Progress Bar */}
						<div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full mx-8 md:mx-12" />

						{/* Active Progress Bar - Animated with Brand Color */}
						<div
							className="absolute top-5 left-8 md:left-12 h-1 bg-brand rounded-full transition-all duration-500 ease-out shadow-md"
							style={{
								width:
									step === 1
										? '0%'
										: step === 2
											? 'calc(50% - 40px)'
											: 'calc(100% - 96px)',
							}}
						/>

						<div className="relative flex items-start justify-between">
							{[1, 2, 3].map((s) => (
								<div
									key={s}
									className="flex flex-col items-center relative z-10"
								>
									{/* Step Circle */}
									<div
										className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-sm md:text-base transition-all duration-300 border-2 ${
											step > s
												? 'bg-brand text-white border-brand shadow-lg'
												: step === s
													? 'bg-brand text-white border-brand shadow-xl ring-4 ring-brand/20 scale-110'
													: 'bg-white text-gray-400 border-gray-300'
										}`}
									>
										{step > s ? (
											<svg
												className="w-5 h-5 md:w-6 md:h-6"
												fill="currentColor"
												viewBox="0 0 20 20"
											>
												<path
													fillRule="evenodd"
													d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
													clipRule="evenodd"
												/>
											</svg>
										) : (
											s
										)}
									</div>

									{/* Step Label */}
									<div className="mt-2 md:mt-3 text-center max-w-[80px] md:max-w-[100px]">
										<p
											className={`text-[10px] md:text-xs font-semibold transition-all duration-300 leading-tight ${
												step >= s
													? 'text-brand'
													: 'text-gray-400'
											}`}
										>
											{stepLabels[s - 1]}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Form Content - Scrollable */}
				<form
					onSubmit={handleSubmit}
					className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-5"
				>
					{/* Agent Restriction Message */}
					{isAgent ? (
						<div className="flex flex-col items-center justify-center py-12 px-6 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
								<svg
									className="w-8 h-8 text-gray-400"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
									/>
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Réservation non disponible
							</h3>
							<p className="text-gray-600 mb-4">
								Les agents ne peuvent pas prendre de
								rendez-vous. Seuls les utilisateurs anonymes
								peuvent réserver un rendez-vous avec un agent.
							</p>
							<Button
								type="button"
								onClick={onClose}
								className="bg-brand hover:bg-brand-dark text-white"
							>
								Fermer
							</Button>
						</div>
					) : (
						<>
							{/* Step 1: Type & Date */}
							{step === 1 && (
								<BookingStep1
									appointmentType={values.appointmentType}
									scheduledDate={values.scheduledDate}
									onTypeChange={(type) =>
										setFieldValue('appointmentType', type)
									}
									onDateChange={(date) =>
										setFieldValue('scheduledDate', date)
									}
									getMinDate={getMinDate}
									getMaxDate={getMaxDate}
								/>
							)}

							{/* Step 2: Time Selection */}
							{step === 2 && (
								<BookingStep2
									availableSlots={availableSlots}
									loadingSlots={loadingSlots}
									scheduledTime={values.scheduledTime}
									onTimeChange={(time) =>
										setFieldValue('scheduledTime', time)
									}
									onBackToStep1={() => setStep(1)}
								/>
							)}

							{/* Step 3: Contact & Details */}
							{step === 3 && (
								<BookingStep3
									contactDetails={values.contactDetails}
									propertyDetails={
										values.propertyDetails || {}
									}
									notes={values.notes || ''}
									onContactChange={(field, value) =>
										setFieldValue('contactDetails', {
											...values.contactDetails,
											[field]: value,
										})
									}
									onPropertyAddressChange={(address) =>
										setFieldValue('propertyDetails', {
											...values.propertyDetails,
											address,
										})
									}
									onNotesChange={(notes) =>
										setFieldValue('notes', notes)
									}
								/>
							)}
						</>
					)}
				</form>

				{/* Footer Actions - Fixed at bottom */}
				<div className="px-4 md:px-6 py-4 bg-gray-50 rounded-b-2xl border-t flex-shrink-0">
					{!isAgent && (
						<div className="flex space-x-3">
							{step > 1 && (
								<Button
									type="button"
									onClick={() => setStep(step - 1)}
									variant="outline"
									className="flex-1"
								>
									← Retour
								</Button>
							)}
							{step < 3 ? (
								<Button
									type="button"
									onClick={() => setStep(step + 1)}
									disabled={
										(step === 1 && !values.scheduledDate) ||
										(step === 2 && !values.scheduledTime)
									}
									className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
								>
									Continuer →
								</Button>
							) : (
								<Button
									type="submit"
									onClick={handleSubmit}
									loading={isSubmitting}
									className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
								>
									✓ Confirmer le rendez-vous
								</Button>
							)}
						</div>
					)}
				</div>
			</div>
		</Modal>
	);
};
