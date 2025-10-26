'use client';

import { useRealtimeSync } from '@/hooks/useRealtimeSync';

/**
 * Client component that enables real-time cache synchronization
 */
export function RealtimeSyncProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useRealtimeSync();
	return <>{children}</>;
}
