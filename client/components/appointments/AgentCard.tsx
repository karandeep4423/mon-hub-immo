'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { Button } from '@/components/ui/Button';
import { BookAppointmentModal } from '@/components/appointments/BookAppointmentModal';

interface AgentCardProps {
	agent: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone?: string;
		profileImage?: string;
		professionalInfo?: {
			postalCode?: string;
			city?: string;
			interventionRadius?: number;
			network?: string;
			yearsExperience?: number;
			personalPitch?: string;
		};
	};
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
	const [showBookingModal, setShowBookingModal] = useState(false);
	const router = useRouter();

	return (
		<>
			<div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
				{/* Header with gradient */}
				<div className="bg-brand-gradient-horizontal p-6 text-white">
					<div className="flex items-center space-x-4">
						<ProfileAvatar
							user={agent}
							size="xl"
							className="ring-4 ring-white/20"
						/>
						<div className="flex-1 min-w-0">
							<h3 className="text-xl font-bold truncate">
								{agent.firstName} {agent.lastName}
							</h3>
							<p className="text-white/90 text-sm">
								Agent immobilier professionnel
							</p>
						</div>
					</div>
				</div>

				{/* Content */}
				<div className="p-6 space-y-4">
					{/* Stats */}
					<div className="grid grid-cols-2 gap-4">
						<div className="bg-brand-50 rounded-lg p-3 text-center">
							<p className="text-2xl font-bold text-brand-600">
								{agent.professionalInfo?.yearsExperience || 0}
							</p>
							<p className="text-xs text-gray-600">
								Années d&apos;expérience
							</p>
						</div>
						<div className="bg-brand-50 rounded-lg p-3 text-center">
							<p className="text-2xl font-bold text-brand-600">
								{agent.professionalInfo?.interventionRadius ||
									20}
								km
							</p>
							<p className="text-xs text-gray-600">
								Rayon d&apos;intervention
							</p>
						</div>
					</div>

					{/* Location */}
					{agent.professionalInfo?.city && (
						<div className="flex items-center space-x-2 text-gray-600">
							<svg
								className="w-5 h-5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
							<span className="text-sm">
								{agent.professionalInfo.city} (
								{agent.professionalInfo.postalCode})
							</span>
						</div>
					)}

					{/* Network */}
					{agent.professionalInfo?.network && (
						<div className="flex items-center space-x-2 text-gray-600">
							<svg
								className="w-5 h-5 flex-shrink-0"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
							<span className="text-sm">
								{agent.professionalInfo.network}
							</span>
						</div>
					)}

					{/* Personal Pitch */}
					{agent.professionalInfo?.personalPitch && (
						<div className="border-t pt-4">
							<p className="text-sm text-gray-600 line-clamp-3">
								{agent.professionalInfo.personalPitch}
							</p>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 pb-6 space-y-3">
					<Button
						onClick={() => setShowBookingModal(true)}
						className="w-full bg-brand hover:bg-brand-dark text-white"
					>
						<svg
							className="w-5 h-5 mr-2"
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
						Prendre rendez-vous
					</Button>

					<Button
						onClick={() => router.push(`/chat?userId=${agent._id}`)}
						variant="outline"
						className="w-full border-brand text-brand hover:bg-brand-50"
					>
						<svg
							className="w-5 h-5 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
							/>
						</svg>
						Message
					</Button>
				</div>
			</div>

			{/* Booking Modal */}
			<BookAppointmentModal
				isOpen={showBookingModal}
				onClose={() => setShowBookingModal(false)}
				agent={agent}
			/>
		</>
	);
};
