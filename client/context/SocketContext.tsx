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
	console.log('🔗 Socket URL Configuration:', {
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
		console.log('SocketProvider: Auth state changed', {
			user: !!user,
			loading,
		});

		// Don't connect if still loading or no user
		if (loading || !user) {
			if (socketRef.current) {
				console.log('🛑 Disconnecting socket - no user or loading');
				socketRef.current.disconnect();
				socketRef.current = null;
				setIsConnected(false);
				setOnlineUsers([]);
			}
			return;
		}

		// Only create socket if it doesn't exist
		if (!socketRef.current) {
			console.log(
				'🟢 Creating new socket connection for user:',
				user._id || user.id,
			);

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

			newSocket.on('connect', () => {
				console.log('🚀 Socket connected successfully:', newSocket.id);
				console.log('🌐 Connected to:', BASE_URL);
				setIsConnected(true);
			});

			newSocket.on('disconnect', (reason) => {
				console.warn('⚠️ Socket disconnected:', reason);
				setIsConnected(false);
			});

			newSocket.on('connect_error', (err) => {
				console.error('❌ Socket connection error:', err);
				console.error('🔗 Attempted connection to:', BASE_URL);
				console.error('👤 User ID:', userId);
				setIsConnected(false);
			});

			newSocket.on('reconnect', (attemptNumber) => {
				console.log('🔄 Socket reconnected on attempt:', attemptNumber);
				setIsConnected(true);
			});

			newSocket.on('reconnect_error', (err) => {
				console.error('❌ Socket reconnection failed:', err);
				setIsConnected(false);
			});

			newSocket.on('reconnect_failed', () => {
				console.error(
					'❌ Socket reconnection failed after all attempts',
				);
				setIsConnected(false);
			});

			newSocket.on('getOnlineUsers', (users) => {
				console.log('🟢 Online users updated:', users);
				setOnlineUsers(users);
			});

			socketRef.current = newSocket;
		}

		// Cleanup only when component unmounts or user logs out
		return () => {
			// Only disconnect if user is logging out, not on every effect run
			if (!user && socketRef.current) {
				console.log('🛑 User logged out, disconnecting socket');
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
