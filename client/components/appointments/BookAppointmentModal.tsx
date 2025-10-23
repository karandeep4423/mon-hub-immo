'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { useAuth } from '@/hooks/useAuth';
import { useFetch } from '@/hooks/useFetch';
import { useRouter } from 'next/navigation';
import type { CreateAppointmentData } from '@/types/appointment';
import { useForm } from '@/hooks/useForm';
import { BookingStep1 } from './BookingStep1';
import { BookingStep2 } from './BookingStep2';
import { BookingStep3 } from './BookingStep3';

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
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);

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
			if (!user) {
				router.push('/auth/login?redirect=/monagentimmo');
				return;
			}
			await appointmentApi.createAppointment(values);
			alert('Demande de rendez-vous envoyée avec succès !');
			onClose();
		},
	});

	// Use useFetch to load available time slots
	const { loading: loadingSlots } = useFetch(
		() => appointmentApi.getAvailableSlots(agent._id, values.scheduledDate),
		{
			deps: [agent._id, values.scheduledDate, step],
			skip: !values.scheduledDate || step !== 2,
			showErrorToast: false,
			onSuccess: (response) => {
				setAvailableSlots(response.slots || []);
			},
			onError: () => {
				setAvailableSlots([]);
			},
		},
	);

	const resetForm = useCallback(() => {
		setStep(1);
		resetFormValues();
		setAvailableSlots([]);
	}, [resetFormValues]);

	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
	}, [isOpen, resetForm]);

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
							propertyDetails={values.propertyDetails || {}}
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
				</form>

				{/* Footer Actions - Fixed at bottom */}
				<div className="px-4 md:px-6 py-4 bg-gray-50 rounded-b-2xl border-t flex-shrink-0">
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
								className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
							>
								{isSubmitting ? (
									<span className="flex items-center justify-center">
										<svg
											className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
											fill="none"
											viewBox="0 0 24 24"
										>
											<circle
												className="opacity-25"
												cx="12"
												cy="12"
												r="10"
												stroke="currentColor"
												strokeWidth="4"
											></circle>
											<path
												className="opacity-75"
												fill="currentColor"
												d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
											></path>
										</svg>
										Envoi en cours...
									</span>
								) : (
									'✓ Confirmer le rendez-vous'
								)}
							</Button>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
};
