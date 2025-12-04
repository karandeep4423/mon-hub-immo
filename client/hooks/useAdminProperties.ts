import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { logger } from '@/lib/utils/logger';
import SearchAdApi, { type SearchAdFilters } from '@/lib/api/searchAdApi';

interface Property {
	_id: string;
	title: string;
	price: number;
	surface: number;
	propertyType: string;
	type?: string;
	status: string;
	city: string;
	location?: string;
	owner?: {
		_id: string;
		firstName?: string;
		lastName?: string;
		network?: string;
	};
	createdAt: string;
	views?: number;
	transactionType?: string;
}

interface Filters {
	search?: string;
	status?: string;
	agentId?: string;
	network?: string;
	propertyType?: string; // e.g. Appartement, Maison...
	postType?: string; // '' | 'property' | 'search'
	page?: number;
	limit?: number;
}

interface UseAdminPropertiesResult {
	properties: Property[];
	loading: boolean;
	error: string | null;
	totalItems: number | null;
	currentPage: number | null;
	totalPages: number | null;
	refetch: () => void;
}

export function useAdminProperties(
	initialFilters: Filters,
): UseAdminPropertiesResult {
	const [properties, setProperties] = useState<Property[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [totalItems, setTotalItems] = useState<number | null>(null);
	const [currentPage, setCurrentPage] = useState<number | null>(null);
	const [totalPages, setTotalPages] = useState<number | null>(null);
	const [filters, setFilters] = useState<Filters>(initialFilters);

	// expose refetch via toggling a key
	const [reloadKey, setReloadKey] = useState(0);
	const refetch = () => setReloadKey((k) => k + 1);

	useEffect(() => {
		setFilters(initialFilters);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		initialFilters.postType,
		initialFilters.search,
		initialFilters.status,
		initialFilters.propertyType,
		initialFilters.page,
		initialFilters.limit,
	]);

	useEffect(() => {
		const controller = new AbortController();
		const fetchProperties = async () => {
			setLoading(true);
			setError(null);

			const page = filters.page || 1;
			const limit = filters.limit || 10;
			try {
				// Branch: fetch ALL (both properties and search ads)
				if (filters.postType === '') {
					// Fetch both in parallel
					const searchFilters: SearchAdFilters = {
						search: filters.search,
						propertyType: filters.propertyType,
					};

					const params = new URLSearchParams();
					if (filters.search)
						params.append('search', String(filters.search));
					if (filters.status)
						params.append('status', String(filters.status));
					if (filters.agentId)
						params.append('agentId', String(filters.agentId));
					if (filters.network)
						params.append('network', String(filters.network));
					if (filters.propertyType)
						params.append(
							'propertyType',
							String(filters.propertyType),
						);
					params.append('page', '1');
					params.append('limit', '1000'); // Get all for combining

					const [searchAdsResult, propertiesResult] =
						await Promise.all([
							SearchAdApi.getAllSearchAds(searchFilters),
							api.get(`/admin/properties?${params.toString()}`, {
								signal: controller.signal,
							}),
						]);

					// Map search ads
					const mappedSearchAds = searchAdsResult.map((ad: any) => {
						const title = ad.title || 'Recherche';
						const city =
							ad.location?.cities?.join(', ') || ad.city || '';
						const price = ad.maxBudget || ad.minBudget || 0;
						return {
							_id: ad._id,
							title,
							price,
							surface: 0,
							propertyType: 'Recherche',
							type: 'search',
							status: ad.status || 'active',
							city,
							owner: ad.author || undefined,
							createdAt: ad.createdAt || new Date().toISOString(),
							views: 0,
						} as Property;
					});

					// Map properties
					const rawProperties =
						propertiesResult.data.data?.properties || [];
					const mappedProperties = rawProperties.map((p: any) => ({
						...p,
						type: 'property',
						transactionType: p.transactionType ?? '',
					}));

					// Combine and sort by createdAt (newest first)
					const combined = [
						...mappedProperties,
						...mappedSearchAds,
					].sort(
						(a, b) =>
							new Date(b.createdAt).getTime() -
							new Date(a.createdAt).getTime(),
					);

					const total = combined.length;
					const totalPagesCalc = Math.max(
						1,
						Math.ceil(total / limit),
					);
					const startIdx = (page - 1) * limit;
					const pageSlice = combined.slice(
						startIdx,
						startIdx + limit,
					);

					setProperties(pageSlice);
					setTotalItems(total);
					setCurrentPage(page);
					setTotalPages(totalPagesCalc);
					setLoading(false);
					return;
				}

				// Branch: search ads only
				if (filters.postType === 'search') {
					const searchFilters: SearchAdFilters = {
						search: filters.search,
						propertyType: filters.propertyType,
					};
					const allSearchAds =
						await SearchAdApi.getAllSearchAds(searchFilters);
					// Sort by createdAt descending (newest first)
					const sortedAds = [...allSearchAds].sort(
						(a: any, b: any) => {
							return (
								new Date(b.createdAt || 0).getTime() -
								new Date(a.createdAt || 0).getTime()
							);
						},
					);
					const total = sortedAds.length;
					const totalPagesCalc = Math.max(
						1,
						Math.ceil(total / limit),
					);
					const startIdx = (page - 1) * limit;
					const pageSlice = sortedAds.slice(
						startIdx,
						startIdx + limit,
					);
					const mapped = pageSlice.map((ad: any) => {
						const title = ad.title || 'Recherche';
						const city =
							ad.location?.cities?.join(', ') || ad.city || '';
						const price = ad.maxBudget || ad.minBudget || 0;
						return {
							_id: ad._id,
							title,
							price,
							surface: 0,
							propertyType: 'Recherche',
							type: 'search',
							status: ad.status || 'active',
							city,
							owner: ad.author || undefined,
							createdAt: ad.createdAt || new Date().toISOString(),
							views: 0,
						} as Property;
					});
					setProperties(mapped);
					setTotalItems(total);
					setCurrentPage(page);
					setTotalPages(totalPagesCalc);
					setLoading(false);
					return;
				}

				// Branch: normal properties only
				const params = new URLSearchParams();
				if (filters.search)
					params.append('search', String(filters.search));
				if (filters.status)
					params.append('status', String(filters.status));
				if (filters.agentId)
					params.append('agentId', String(filters.agentId));
				if (filters.network)
					params.append('network', String(filters.network));
				if (filters.propertyType)
					params.append('propertyType', String(filters.propertyType));
				params.append('page', String(page));
				params.append('limit', String(limit));

				const response = await api.get(
					`/admin/properties?${params.toString()}`,
					{ signal: controller.signal },
				);
				const data = response.data;
				// Sort by createdAt descending (newest first)
				const sortedProperties = [...(data.data?.properties || [])]
					.map((p: any) => ({
						type: 'property',
						transactionType: p.transactionType ?? '',
						...p,
					}))
					.sort((a: any, b: any) => {
						return (
							new Date(b.createdAt || 0).getTime() -
							new Date(a.createdAt || 0).getTime()
						);
					});
				setProperties(sortedProperties);
				const pagination = data.data?.pagination;
				if (pagination) {
					setTotalItems(pagination.totalItems || 0);
					setCurrentPage(pagination.currentPage || page);
					setTotalPages(pagination.totalPages || 1);
				} else {
					setTotalItems(data.data?.properties?.length || 0);
					setCurrentPage(page);
					setTotalPages(1);
				}
			} catch (err) {
				const anyErr = err as any;
				const isAbort =
					anyErr?.name === 'AbortError' ||
					anyErr?.name === 'CanceledError' ||
					anyErr?.code === 'ERR_CANCELED' ||
					anyErr?.message === 'canceled';
				if (isAbort) {
					logger.debug('[useAdminProperties] request cancelled');
				} else if (err instanceof Error) {
					logger.error('[useAdminProperties] fetch error', err);
					setError(err.message);
				} else {
					logger.error(
						'[useAdminProperties] fetch unknown error',
						err,
					);
					setError(String(err));
				}
			} finally {
				setLoading(false);
			}
		};

		fetchProperties();
		return () => controller.abort();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		filters.search,
		filters.status,
		filters.agentId,
		filters.network,
		filters.propertyType,
		filters.postType,
		filters.page,
		filters.limit,
		reloadKey,
	]);

	return {
		properties,
		loading,
		error,
		totalItems,
		currentPage,
		totalPages,
		refetch,
	};
}
