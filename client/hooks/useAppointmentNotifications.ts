'use client';

import { useCallback } from 'react';
import { useSocketListeners } from './useSocketListener';
import { useNotification } from './useNotification';
import { useAuth } from './useAuth';
import { Appointment } from '@/types/appointment';

interface UseAppointmentNotificationsOptions {
	onUpdate?: () => void;
}

export const useAppointmentNotifications = (
	options?: UseAppointmentNotificationsOptions,
) => {
	const { showNotification } = useNotification();
	const { user } = useAuth();
	const { onUpdate } = options || {};

	const handleNewAppointment = useCallback(
		(appointment: Appointment) => {
			if (user?.userType === 'agent') {
				const clientName =
					appointment.clientId &&
					typeof appointment.clientId === 'object'
						? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
						: appointment.contactDetails?.name || 'Un client';

				showNotification(
					`Nouvelle demande de rendez-vous de ${clientName}`,
					'info',
				);
				onUpdate?.();
			}
		},
		[user, showNotification, onUpdate],
	);

	const handleStatusUpdate = useCallback(
		(data: { appointment: Appointment; previousStatus: string }) => {
			const { appointment, previousStatus } = data;
			if (!user) return;

			const isAgent = user.userType === 'agent';
			const isClient =
				user._id ===
				(typeof appointment.clientId === 'string'
					? appointment.clientId
					: appointment.clientId?._id);

			if (isClient && !isAgent) {
				const agentName =
					appointment.agentId &&
					typeof appointment.agentId === 'object'
						? `${appointment.agentId.firstName} ${appointment.agentId.lastName}`
						: "L'agent";

				switch (appointment.status) {
					case 'confirmed':
						showNotification(
							`${agentName} a confirmé votre rendez-vous`,
							'success',
						);
						break;
					case 'rejected':
						showNotification(
							`${agentName} a refusé votre demande de rendez-vous`,
							'error',
						);
						break;
					case 'cancelled':
						if (previousStatus !== 'pending') {
							showNotification(
								`Rendez-vous avec ${agentName} annulé`,
								'warning',
							);
						}
						break;
					case 'completed':
						showNotification(
							`Rendez-vous avec ${agentName} marqué comme terminé`,
							'success',
						);
						break;
				}
				onUpdate?.();
			} else if (isAgent) {
				const clientName =
					appointment.clientId &&
					typeof appointment.clientId === 'object'
						? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
						: appointment.contactDetails?.name || 'Le client';

				if (
					appointment.status === 'cancelled' &&
					previousStatus !== 'pending'
				) {
					showNotification(
						`${clientName} a annulé le rendez-vous`,
						'warning',
					);
					onUpdate?.();
				}
			}
		},
		[user, showNotification, onUpdate],
	);

	const handleCancellation = useCallback(
		(data: { appointment: Appointment; cancelledBy: string }) => {
			const { appointment, cancelledBy } = data;
			if (!user) return;

			const isAgent = user.userType === 'agent';
			const isClient =
				user._id ===
				(typeof appointment.clientId === 'string'
					? appointment.clientId
					: appointment.clientId?._id);

			if (isClient && !isAgent && cancelledBy !== user._id) {
				const agentName =
					appointment.agentId &&
					typeof appointment.agentId === 'object'
						? `${appointment.agentId.firstName} ${appointment.agentId.lastName}`
						: "L'agent";

				showNotification(
					`Rendez-vous avec ${agentName} annulé`,
					'warning',
				);
				onUpdate?.();
			} else if (isAgent && cancelledBy !== user._id) {
				const clientName =
					appointment.clientId &&
					typeof appointment.clientId === 'object'
						? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
						: appointment.contactDetails?.name || 'Le client';

				showNotification(
					`${clientName} a annulé le rendez-vous`,
					'warning',
				);
				onUpdate?.();
			}
		},
		[user, showNotification, onUpdate],
	);

	const handleReschedule = useCallback(
		(appointment: Appointment) => {
			if (!user) return;

			const isAgent = user.userType === 'agent';
			const isClient =
				user._id ===
				(typeof appointment.clientId === 'string'
					? appointment.clientId
					: appointment.clientId?._id);

			if (isClient && !isAgent) {
				const agentName =
					appointment.agentId &&
					typeof appointment.agentId === 'object'
						? `${appointment.agentId.firstName} ${appointment.agentId.lastName}`
						: "L'agent";

				showNotification(
					`Rendez-vous avec ${agentName} reprogrammé`,
					'info',
				);
				onUpdate?.();
			} else if (isAgent) {
				const clientName =
					appointment.clientId &&
					typeof appointment.clientId === 'object'
						? `${appointment.clientId.firstName} ${appointment.clientId.lastName}`
						: appointment.contactDetails?.name || 'Le client';

				showNotification(
					`Rendez-vous avec ${clientName} reprogrammé`,
					'info',
				);
				onUpdate?.();
			}
		},
		[user, showNotification, onUpdate],
	);

	// Set up socket listeners using reusable pattern
	// Type casting to handle specific event types
	useSocketListeners({
		'appointment:new': handleNewAppointment as (data: unknown) => void,
		'appointment:status_updated': handleStatusUpdate as (
			data: unknown,
		) => void,
		'appointment:cancelled': handleCancellation as (data: unknown) => void,
		'appointment:rescheduled': handleReschedule as (data: unknown) => void,
	});
};
