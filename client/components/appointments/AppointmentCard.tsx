import React from 'react';
import { Appointment } from '@/types/appointment';
import { ProfileAvatar } from '../ui/ProfileAvatar';
import { Button } from '../ui/Button';
import { formatDate, formatTime } from '@/lib/utils/date';
import Link from 'next/link';

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
	onReschedule: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
	appointment,
	isAgent,
	actionLoading,
	onConfirm,
	onReject,
	onCancel,
	onReschedule,
}) => {
	const otherUser = isAgent ? appointment.clientId : appointment.agentId;

	// Create a minimal user object for UserAvatar
	const userForAvatar = {
		...otherUser,
		id: otherUser._id,
		phone: otherUser.phone || '',
		userType: (isAgent ? 'apporteur' : 'agent') as 'agent' | 'apporteur',
		isEmailVerified: true,
		profileCompleted: true,
	};

	const getStatusColor = (status: AppointmentStatus): string => {
		const colors = {
			pending: 'bg-yellow-100 text-yellow-800',
			confirmed: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
			completed: 'bg-blue-100 text-blue-800',
			rejected: 'bg-gray-100 text-gray-800',
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
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

	return (
		<div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
			<div className="p-6">
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4 flex-1">
						<ProfileAvatar user={userForAvatar} size="lg" />
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-3 mb-2">
								<h3 className="text-lg font-semibold text-gray-900">
									{otherUser.firstName} {otherUser.lastName}
								</h3>
								<span
									className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}
								>
									{getStatusLabel(appointment.status)}
								</span>
							</div>

							<div className="space-y-2 text-sm text-gray-600">
								<div className="flex items-center">
									<svg
										className="w-4 h-4 mr-2 flex-shrink-0"
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
									<span className="font-medium">
										{appointment.appointmentType}
									</span>
								</div>

								<div className="flex items-center">
									<svg
										className="w-4 h-4 mr-2 flex-shrink-0"
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
									<span>
										{formatDate(appointment.scheduledDate)}{' '}
										à{' '}
										{formatTime(appointment.scheduledTime)}
									</span>
								</div>

								{appointment.notes && (
									<div className="flex items-start">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5"
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
										<span className="break-words">
											{appointment.notes}
										</span>
									</div>
								)}

								{otherUser.email && (
									<div className="flex items-center">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0"
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
										<span>{otherUser.email}</span>
									</div>
								)}

								{otherUser.phone && (
									<div className="flex items-center">
										<svg
											className="w-4 h-4 mr-2 flex-shrink-0"
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
										<span>{otherUser.phone}</span>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="mt-4 pt-4 border-t border-gray-200">
					<div className="flex flex-wrap gap-2">
						{/* Agent-specific actions */}
						{isAgent && appointment.status === 'pending' && (
							<>
								<Button
									variant="primary"
									size="sm"
									onClick={() => onConfirm(appointment._id)}
									loading={actionLoading === appointment._id}
								>
									Accepter
								</Button>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onReject(appointment._id)}
									loading={actionLoading === appointment._id}
								>
									Refuser
								</Button>
							</>
						)}

						{/* Common actions */}
						{(appointment.status === 'confirmed' ||
							appointment.status === 'pending') && (
							<>
								<Button
									variant="outline"
									size="sm"
									onClick={() => onReschedule(appointment)}
								>
									<svg
										className="w-4 h-4 mr-2"
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
									className="text-red-600 border-red-300 hover:bg-red-50"
								>
									<svg
										className="w-4 h-4 mr-2"
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

						<Link
							href={`/chat?userId=${otherUser._id}`}
							className="ml-auto"
						>
							<Button variant="outline" size="sm">
								<svg
									className="w-4 h-4 mr-2"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
									/>
								</svg>
								Message
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
};
