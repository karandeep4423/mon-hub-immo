'use client';

import { useEffect, useCallback } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useNotification } from './useNotification';
import { useAuth } from './useAuth';
import { Appointment } from '@/types/appointment';

interface UseAppointmentNotificationsOptions {
	onUpdate?: () => void;
}

export const useAppointmentNotifications = (
	options?: UseAppointmentNotificationsOptions,
) => {
	const { socket } = useSocket();
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

	useEffect(() => {
		if (!socket || !user) return;

		socket.on('appointment:new', handleNewAppointment);
		socket.on('appointment:status_updated', handleStatusUpdate);
		socket.on('appointment:cancelled', handleCancellation);
		socket.on('appointment:rescheduled', handleReschedule);

		return () => {
			socket.off('appointment:new', handleNewAppointment);
			socket.off('appointment:status_updated', handleStatusUpdate);
			socket.off('appointment:cancelled', handleCancellation);
			socket.off('appointment:rescheduled', handleReschedule);
		};
	}, [
		socket,
		user,
		handleNewAppointment,
		handleStatusUpdate,
		handleCancellation,
		handleReschedule,
	]);
};
