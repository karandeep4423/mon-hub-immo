// context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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

const BASE_URL = "http://localhost:4000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    console.log('SocketProvider: Auth state changed', { user: !!user, loading });

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
      console.log('🟢 Creating new socket connection for user:', user._id || user.id);
      
      const userId = user._id || user.id;
      const newSocket = io(BASE_URL, {
        query: { userId },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 10000,
      });

      newSocket.on('connect', () => {
        console.log('🚀 Socket connected:', newSocket.id);
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.warn('⚠️ Socket disconnected:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
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
    <SocketContext.Provider value={{ 
      socket: socketRef.current, 
      onlineUsers, 
      isConnected 
    }}>
      {children}
    </SocketContext.Provider>
  );
};
