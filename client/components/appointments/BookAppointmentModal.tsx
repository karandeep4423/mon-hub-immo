'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import type { CreateAppointmentData } from '@/types/appointment';

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

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
	isOpen,
	onClose,
	agent,
}) => {
	const { user } = useAuth();
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [loading, setLoading] = useState(false);
	const [availableSlots, setAvailableSlots] = useState<string[]>([]);
	const [loadingSlots, setLoadingSlots] = useState(false);

	const [formData, setFormData] = useState<CreateAppointmentData>({
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
	});

	const resetForm = useCallback(() => {
		setStep(1);
		setFormData({
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
		});
		setAvailableSlots([]);
	}, [agent._id, user]);

	useEffect(() => {
		if (!isOpen) {
			resetForm();
		}
	}, [isOpen, resetForm]);

	const fetchAvailableSlots = useCallback(async () => {
		try {
			setLoadingSlots(true);
			const response = await appointmentApi.getAvailableSlots(
				agent._id,
				formData.scheduledDate,
			);
			setAvailableSlots(response.slots || []);
		} catch (error) {
			console.error('Error fetching slots:', error);
			setAvailableSlots([]);
		} finally {
			setLoadingSlots(false);
		}
	}, [agent._id, formData.scheduledDate]);

	useEffect(() => {
		if (formData.scheduledDate && step === 2) {
			fetchAvailableSlots();
		}
	}, [formData.scheduledDate, step, fetchAvailableSlots]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			router.push('/auth/login?redirect=/monagentimmo');
			return;
		}

		try {
			setLoading(true);
			await appointmentApi.createAppointment(formData);
			alert('Demande de rendez-vous envoyée avec succès !');
			onClose();
		} catch (error) {
			console.error('Error creating appointment:', error);
			alert('Une erreur est survenue lors de la création du rendez-vous');
		} finally {
			setLoading(false);
		}
	};

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
		<div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
			<div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] flex flex-col shadow-2xl animate-fadeIn">
				{/* Header - Professional Design */}
				<div className="bg-white px-4 md:px-6 py-4 md:py-5 rounded-t-2xl flex-shrink-0 border-b-2 border-gray-100">
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
							className="ml-3 text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-full"
							aria-label="Fermer"
						>
							<svg
								className="w-5 h-5 md:w-6 md:h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
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
					{/* Step 1: Type & Date */}
					{step === 1 && (
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
												setFormData({
													...formData,
													appointmentType:
														type.value as
															| 'estimation'
															| 'vente'
															| 'achat'
															| 'conseil',
												})
											}
											className={`relative p-3 md:p-4 rounded-xl border-2 transition-all duration-200 ${
												formData.appointmentType ===
												type.value
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
											{formData.appointmentType ===
												type.value && (
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
									value={formData.scheduledDate}
									onChange={(e) =>
										setFormData({
											...formData,
											scheduledDate: e.target.value,
										})
									}
									className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm md:text-base"
								/>
								<p className="text-xs text-gray-500 mt-1.5">
									Disponible de demain à{' '}
									{new Date(getMaxDate()).toLocaleDateString(
										'fr-FR',
									)}
								</p>
							</div>
						</div>
					)}

					{/* Step 2: Time Selection */}
					{step === 2 && (
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
										<div className="text-5xl md:text-6xl mb-4">
											📅
										</div>
										<p className="text-base md:text-lg text-gray-800 font-semibold mb-2">
											Aucun créneau disponible
										</p>
										<p className="text-xs md:text-sm text-gray-600 mb-5 px-4 max-w-md mx-auto">
											L&apos;agent n&apos;a pas encore
											configuré ses disponibilités pour
											cette date. Veuillez choisir une
											autre date.
										</p>
										<Button
											type="button"
											onClick={() => setStep(1)}
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
													onClick={() =>
														setFormData({
															...formData,
															scheduledTime: slot,
														})
													}
													className={`relative p-3 md:p-3.5 rounded-lg border-2 transition-all duration-200 text-center font-semibold ${
														formData.scheduledTime ===
														slot
															? 'border-brand bg-brand text-white shadow-lg scale-105'
															: 'border-gray-200 bg-white hover:border-brand/50 hover:bg-brand-50 text-gray-700'
													}`}
												>
													<div className="text-sm md:text-base">
														{slot}
													</div>
													{formData.scheduledTime ===
														slot && (
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
											{availableSlots.length > 1
												? 'x'
												: ''}{' '}
											disponible
											{availableSlots.length > 1
												? 's'
												: ''}
										</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Step 3: Contact & Details */}
					{step === 3 && (
						<div className="space-y-5 animate-fadeIn">
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
												d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
											/>
										</svg>
										Vos coordonnées
									</div>
								</label>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1.5">
										Nom complet *
									</label>
									<input
										type="text"
										required
										value={formData.contactDetails.name}
										onChange={(e) =>
											setFormData({
												...formData,
												contactDetails: {
													...formData.contactDetails,
													name: e.target.value,
												},
											})
										}
										className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-700 mb-1.5">
										Téléphone *
									</label>
									<input
										type="tel"
										required
										value={formData.contactDetails.phone}
										onChange={(e) =>
											setFormData({
												...formData,
												contactDetails: {
													...formData.contactDetails,
													phone: e.target.value,
												},
											})
										}
										className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">
									Email *
								</label>
								<input
									type="email"
									required
									value={formData.contactDetails.email}
									onChange={(e) =>
										setFormData({
											...formData,
											contactDetails: {
												...formData.contactDetails,
												email: e.target.value,
											},
										})
									}
									className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">
									Adresse du bien (optionnel)
								</label>
								<input
									type="text"
									value={
										formData.propertyDetails?.address || ''
									}
									onChange={(e) =>
										setFormData({
											...formData,
											propertyDetails: {
												...formData.propertyDetails,
												address: e.target.value,
											},
										})
									}
									placeholder="Ex: 123 rue de la Paix, Paris"
									className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm"
								/>
							</div>

							<div>
								<label className="block text-xs font-medium text-gray-700 mb-1.5">
									Message (optionnel)
								</label>
								<textarea
									value={formData.notes || ''}
									onChange={(e) =>
										setFormData({
											...formData,
											notes: e.target.value,
										})
									}
									rows={3}
									placeholder="Décrivez votre projet ou vos questions..."
									className="w-full px-3 md:px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all text-sm resize-none"
								/>
							</div>
						</div>
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
								disabled={loading}
							>
								← Retour
							</Button>
						)}
						{step < 3 ? (
							<Button
								type="button"
								onClick={() => setStep(step + 1)}
								disabled={
									(step === 1 && !formData.scheduledDate) ||
									(step === 2 && !formData.scheduledTime)
								}
								className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
							>
								Continuer →
							</Button>
						) : (
							<Button
								type="submit"
								onClick={handleSubmit}
								disabled={loading}
								className="flex-1 bg-brand hover:bg-brand-dark text-white font-semibold"
							>
								{loading ? (
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
		</div>
	);
};
