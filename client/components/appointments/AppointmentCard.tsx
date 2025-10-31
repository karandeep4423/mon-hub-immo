import React from 'react';
import { Appointment } from '@/types/appointment';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';

type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed'
	| 'rejected';

interface AppointmentCardProps {
	appointment: Appointment;
	isAgent: boolean;
	actionLoading: string | null;
	onConfirm: (appointmentId: string) => void;
	onReject: (appointmentId: string) => void;
	onCancel: (appointmentId: string) => void;
	onComplete: (appointmentId: string) => void;
	onReschedule: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
	appointment,
	isAgent,
	actionLoading,
	onConfirm,
	onReject,
	onCancel,
	onComplete,
	onReschedule,
}) => {
	const otherUser = isAgent ? appointment.clientId : appointment.agentId;

	// For guest bookings, use contactDetails; otherwise use user info
	const displayName = isAgent
		? appointment.contactDetails.name ||
			`${otherUser.firstName} ${otherUser.lastName}`
		: `${otherUser.firstName} ${otherUser.lastName}`;

	const displayEmail = isAgent
		? appointment.contactDetails.email || otherUser.email
		: otherUser.email;

	const displayPhone = isAgent
		? appointment.contactDetails.phone || otherUser.phone
		: otherUser.phone;

	// Create a minimal user object for UserAvatar
	const userForAvatar = {
		...otherUser,
		id: otherUser._id,
		firstName: otherUser.firstName || displayName.split(' ')[0] || '',
		lastName:
			otherUser.lastName ||
			displayName.split(' ').slice(1).join(' ') ||
			'',
		name: displayName,
		phone: displayPhone || '',
		userType: (isAgent ? 'apporteur' : 'agent') as 'agent' | 'apporteur',
		isEmailVerified: true,
		profileCompleted: true,
	};

	const getStatusConfig = (status: AppointmentStatus) => {
		const configs = {
			pending: {
				bgColor: 'bg-gradient-to-r from-amber-100 to-amber-200',
				textColor: 'text-amber-700',
				icon: (
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				),
			},
			confirmed: {
				bgColor: 'bg-emerald-500',
				textColor: 'text-white',
				icon: (
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				),
			},
			cancelled: {
				bgColor: 'bg-gradient-to-r from-red-100 to-red-200',
				textColor: 'text-red-700',
				icon: (
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				),
			},
			completed: {
				bgColor: 'bg-gradient-to-r from-blue-100 to-blue-200',
				textColor: 'text-blue-700',
				icon: (
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M5 13l4 4L19 7"
						/>
					</svg>
				),
			},
			rejected: {
				bgColor: 'bg-gray-500',
				textColor: 'text-white',
				icon: (
					<svg
						className="w-3.5 h-3.5"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
						/>
					</svg>
				),
			},
		};
		return (
			configs[status] || {
				bgColor: 'bg-gray-500',
				textColor: 'text-white',
				icon: null,
			}
		);
	};

	const getStatusLabel = (status: AppointmentStatus): string => {
		const labels = {
			pending: 'En attente',
			confirmed: 'Confirmé',
			cancelled: 'Annulé',
			completed: 'Terminé',
			rejected: 'Refusé',
		};
		return labels[status] || status;
	};

	const statusConfig = getStatusConfig(appointment.status);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-brand-200 transition-all duration-300 group overflow-hidden">
			{/* Status Accent Bar */}
			<div className={`h-1.5 ${statusConfig.bgColor}`}></div>

			<div className="p-6">
				<div className="flex items-start gap-4">
					{/* Avatar without online indicator */}
					<div className="relative flex-shrink-0">
						<ProfileAvatar user={userForAvatar} size="lg" />
					</div>

					<div className="flex-1 min-w-0">
						{/* Header with name and badges */}
						<div className="flex items-start justify-between gap-3 mb-3">
							<div className="flex-1 min-w-0">
								<h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand transition-colors">
									{displayName}
								</h3>
								<div className="flex items-center gap-2 flex-wrap">
									<span
										className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${statusConfig.bgColor} ${statusConfig.textColor} shadow-sm`}
									>
										{statusConfig.icon}
										{getStatusLabel(appointment.status)}
									</span>
									{appointment.isRescheduled && (
										<span
											className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-100 to-orange-200 text-orange-700 shadow-sm"
											title="Ce rendez-vous a été reporté"
										>
											<svg
												className="w-3.5 h-3.5"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
												/>
											</svg>
											Modifié
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Appointment Details Grid */}
						<div className="grid grid-cols-1 gap-3">
							{/* Appointment Type */}
							<div className="flex items-center gap-3 p-3 bg-gradient-to-r from-brand-50 to-transparent rounded-lg border border-brand-100">
								<div className="flex-shrink-0 w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
										/>
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-gray-500 font-medium">
										Type de rendez-vous
									</p>
									<p className="text-sm font-semibold text-gray-900">
										{appointment.appointmentType}
									</p>
								</div>
							</div>

							{/* Date & Time */}
							<div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg border border-purple-100">
								<div className="flex-shrink-0 w-9 h-9 bg-purple-500 rounded-lg flex items-center justify-center">
									<svg
										className="w-5 h-5 text-white"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
								</div>
								<div className="flex-1 min-w-0">
									<p className="text-xs text-gray-500 font-medium">
										Date et heure
									</p>
									<p className="text-sm font-semibold text-gray-900">
										{formatDate(appointment.scheduledDate)}{' '}
										à{' '}
										{formatTime(appointment.scheduledTime)}
									</p>
								</div>
							</div>

							{/* Notes */}
							{appointment.notes && (
								<div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-transparent rounded-lg border border-amber-100">
									<div className="flex-shrink-0 w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
										<svg
											className="w-5 h-5 text-white"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
											/>
										</svg>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs text-gray-500 font-medium mb-1">
											Notes
										</p>
										<p className="text-sm text-gray-700 break-words">
											{appointment.notes}
										</p>
									</div>
								</div>
							)}

							{/* Contact Info Grid */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{displayEmail && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
												/>
											</svg>
										</div>
										<span className="truncate">
											{displayEmail}
										</span>
									</div>
								)}

								{displayPhone && (
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-lg flex items-center justify-center">
											<svg
												className="w-4 h-4 text-white"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													strokeWidth={2}
													d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
												/>
											</svg>
										</div>
										<span>{displayPhone}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-5 pt-5 border-t border-gray-100">
					<div className="flex flex-wrap gap-2">
						{/* Agent-specific actions */}
						{isAgent && appointment.status === 'pending' && (
							<>
								<Button
									variant="primary"
									size="sm"
									onClick={() => onConfirm(appointment._id)}
									loading={actionLoading === appointment._id}
									className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm"
								>
									<svg
										className="w-4 h-4 mr-1.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
									Accepter
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onReject(appointment._id)}
									loading={actionLoading === appointment._id}
									className="border-gray-300 hover:bg-gray-50 shadow-sm"
								>
									<svg
										className="w-4 h-4 mr-1.5"
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
									Refuser
								</Button>
							</>
						)}

						{/* Agent can complete confirmed appointments */}
						{isAgent && appointment.status === 'confirmed' && (
							<Button
								variant="primary"
								size="sm"
								onClick={() => onComplete(appointment._id)}
								loading={actionLoading === appointment._id}
								className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-sm"
							>
								<svg
									className="w-4 h-4 mr-1.5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
								Terminer
							</Button>
						)}

						{/* Common actions */}
						{(appointment.status === 'confirmed' ||
							appointment.status === 'pending') && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onReschedule(appointment)}
									className="border-brand-300 text-brand-700 hover:bg-brand-50 shadow-sm"
								>
									<svg
										className="w-4 h-4 mr-1.5"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									Reprogrammer
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onCancel(appointment._id)}
									loading={actionLoading === appointment._id}
									className="border-red-300 text-red-600 hover:bg-red-50 shadow-sm"
								>
									<svg
										className="w-4 h-4 mr-1.5"
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
									Annuler
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
