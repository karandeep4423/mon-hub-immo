'use client';

import { useEffect } from 'react';
import { useSWRConfig } from 'swr';
import { useSocket } from '@/context/SocketContext';
import { logger } from '@/lib/utils/logger';

/**
 * Real-time synchronization hook
 * Invalidates SWR cache when Socket.IO events occur
 */
export function useRealtimeSync() {
	const { mutate } = useSWRConfig();
	const { socket, isConnected } = useSocket();

	useEffect(() => {
		if (!socket || !isConnected) {
			logger.debug('[RealtimeSync] Socket not ready');
			return;
		}

		logger.debug('[RealtimeSync] Setting up real-time listeners');

		// Collaboration updates - invalidate all collaboration-related caches
		const handleCollaborationUpdate = (data: {
			collaborationId?: string;
			action?: string;
		}) => {
			logger.debug('[RealtimeSync] Collaboration updated', data);

			// Invalidate all collaboration caches
			mutate(
				(key) => Array.isArray(key) && key[0] === 'collaborations',
				undefined,
				{ revalidate: true },
			);

			// Also invalidate dashboard stats
			mutate(
				(key) => Array.isArray(key) && key[0] === 'dashboard',
				undefined,
				{ revalidate: true },
			);
		};

		// Property updates
		const handlePropertyUpdate = (data: { propertyId?: string }) => {
			logger.debug('[RealtimeSync] Property updated', data);

			mutate(
				(key) => Array.isArray(key) && key[0] === 'properties',
				undefined,
				{ revalidate: true },
			);
		};

		// Search ad updates
		const handleSearchAdUpdate = (data: { searchAdId?: string }) => {
			logger.debug('[RealtimeSync] Search ad updated', data);

			mutate(
				(key) => Array.isArray(key) && key[0] === 'searchAds',
				undefined,
				{ revalidate: true },
			);
		};

		// Appointment updates
		const handleAppointmentUpdate = () => {
			logger.debug('[RealtimeSync] Appointment updated');

			mutate(
				(key) => Array.isArray(key) && key[0] === 'appointments',
				undefined,
				{ revalidate: true },
			);
		};

		// Register listeners
		socket.on('collaboration:updated', handleCollaborationUpdate);
		socket.on('collaboration:new', handleCollaborationUpdate);
		socket.on('property:updated', handlePropertyUpdate);
		socket.on('property:new', handlePropertyUpdate);
		socket.on('searchAd:updated', handleSearchAdUpdate);
		socket.on('searchAd:new', handleSearchAdUpdate);
		socket.on('appointment:updated', handleAppointmentUpdate);
		socket.on('appointment:new', handleAppointmentUpdate);

		return () => {
			logger.debug('[RealtimeSync] Cleaning up listeners');
			socket.off('collaboration:updated', handleCollaborationUpdate);
			socket.off('collaboration:new', handleCollaborationUpdate);
			socket.off('property:updated', handlePropertyUpdate);
			socket.off('property:new', handlePropertyUpdate);
			socket.off('searchAd:updated', handleSearchAdUpdate);
			socket.off('searchAd:new', handleSearchAdUpdate);
			socket.off('appointment:updated', handleAppointmentUpdate);
			socket.off('appointment:new', handleAppointmentUpdate);
		};
	}, [socket, isConnected, mutate]);
}
