'use client';

import React from 'react';
import { AuthProvider as AuthContextProvider } from '../context/AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContextProvider>{children}</AuthContextProvider>;
}
