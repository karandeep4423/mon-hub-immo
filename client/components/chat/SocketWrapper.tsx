// components/message/SocketWrapper.tsx
'use client';

import React from 'react';
import { SocketProvider } from '../../context/SocketContext';

export const SocketWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always render SocketProvider, let it handle user state internally
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
};
