// context/SocketContext.tsx
'use client';

import React, {
	createContext,
	useContext,
	useEffect,
	useState,
	useRef,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { logger } from '@/lib/utils/logger';
import { SOCKET_EVENTS } from '@/lib/constants/socket';

interface SocketContextType {
	socket: Socket | null;
	onlineUsers: string[];
	isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
	const context = useContext(SocketContext);
	if (context === undefined) {
		throw new Error('useSocket must be used within a SocketProvider');
	}
	return context;
};

// Resolve Socket server URL from environment, with sensible fallbacks
const BASE_URL: string =
	// Prefer explicit socket URL
	(process.env.NEXT_PUBLIC_SOCKET_URL as string | undefined)?.trim() ||
	// Otherwise derive from API URL by stripping trailing /api
	(process.env.NEXT_PUBLIC_API_URL as string | undefined)?.replace(
		/\/?api\/?$/,
		'',
	) ||
	// Final fallback to localhost:4000 for development
	'http://localhost:4000';

// Debug logging for development
if (typeof window !== 'undefined') {
	logger.debug('[Socket] URL Configuration', {
		NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		resolved_BASE_URL: BASE_URL,
	});
}

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { user, loading } = useAuth();
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const socketRef = useRef<Socket | null>(null);

	useEffect(() => {
		logger.debug('[SocketProvider] Auth state changed', {
			hasUser: !!user,
			loading,
		});

		// Don't connect if still loading or no user
		if (loading || !user) {
			if (socketRef.current) {
				logger.debug('[Socket] Disconnecting - no user or loading');
				socketRef.current.disconnect();
				socketRef.current = null;
				setIsConnected(false);
				setOnlineUsers([]);
			}
			return;
		}

		// Only create socket if it doesn't exist
		if (!socketRef.current) {
			logger.debug('[Socket] Creating new connection', {
				userId: user._id || user.id,
			});

			const userId = user._id || user.id;
			const newSocket = io(BASE_URL, {
				query: { userId },
				transports: ['polling', 'websocket'], // Try polling first, then websocket
				reconnectionAttempts: 5,
				reconnectionDelay: 1000,
				reconnectionDelayMax: 5000,
				timeout: 20000, // Increased timeout to 20 seconds
				forceNew: false,
				autoConnect: true,
			});

			newSocket.on(SOCKET_EVENTS.CONNECTION, () => {
				logger.debug('🚀 Socket connected successfully', {
					socketId: newSocket.id,
					baseUrl: BASE_URL,
				});
				setIsConnected(true);
			});

			newSocket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
				logger.warn('⚠️ Socket disconnected', { reason });
				setIsConnected(false);
			});

			newSocket.on('connect_error', (err) => {
				logger.error('❌ Socket connection error', {
					error: err.message,
					baseUrl: BASE_URL,
					userId,
				});
				setIsConnected(false);
			});

			newSocket.on('reconnect', (attemptNumber) => {
				logger.debug('🔄 Socket reconnected', { attemptNumber });
				setIsConnected(true);
			});

			newSocket.on('reconnect_error', (err) => {
				logger.error('❌ Socket reconnection failed', {
					error: err.message,
				});
				setIsConnected(false);
			});

			newSocket.on('reconnect_failed', () => {
				logger.error(
					'❌ Socket reconnection failed after all attempts',
				);
				setIsConnected(false);
			});

			newSocket.on(SOCKET_EVENTS.GET_ONLINE_USERS, (users) => {
				logger.debug('🟢 Online users updated', {
					count: users.length,
				});
				setOnlineUsers(users);
			});
			socketRef.current = newSocket;
		}

		// Cleanup only when component unmounts or user logs out
		return () => {
			// Only disconnect if user is logging out, not on every effect run
			if (!user && socketRef.current) {
				logger.debug('🛑 User logged out, disconnecting socket');
				socketRef.current.disconnect();
				socketRef.current = null;
				setIsConnected(false);
				setOnlineUsers([]);
			}
		};
	}, [user, loading]); // Only depend on user and loading changes

	return (
		<SocketContext.Provider
			value={{
				socket: socketRef.current,
				onlineUsers,
				isConnected,
			}}
		>
			{children}
		</SocketContext.Provider>
	);
};
