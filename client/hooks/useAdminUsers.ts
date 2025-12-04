import useSWR from 'swr';
import { api } from '@/lib/api';
import { swrKeys } from '@/lib/swrKeys';

interface Filters {
	name?: string;
	userType?: string;
	network?: string;
	isValidated?: string;
	isBlocked?: string;
}

export function useAdminUsers(filters: Filters) {
	const {
		data: users,
		isLoading: loading,
		error,
		mutate,
	} = useSWR<any[]>(
		swrKeys.admin.users(filters),
		async () => {
			const params = new URLSearchParams();
			Object.entries(filters || {}).forEach(([key, value]) => {
				if (value) params.append(key, value as string);
			});
			const res = await api.get(`/admin/users?${params.toString()}`);
			const data = res.data;

			// API may return either an array or an object { users: [...] }
			const payload = Array.isArray(data)
				? data
				: data?.users || data?.usersList || data || [];
			// Sort by createdAt descending (newest first)
			return [...payload].sort((a: any, b: any) => {
				const dateA = new Date(
					a.createdAt || a.registeredAt || 0,
				).getTime();
				const dateB = new Date(
					b.createdAt || b.registeredAt || 0,
				).getTime();
				return dateB - dateA;
			});
		},
		{
			revalidateOnFocus: false,
		},
	);

	return {
		users: users ?? [],
		loading,
		error: error?.message ?? null,
		refetch: mutate,
	};
}
