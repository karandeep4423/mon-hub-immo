import { useMemo } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api';
import SearchAdApi, { type SearchAdFilters } from '@/lib/api/searchAdApi';
import { swrKeys } from '@/lib/swrKeys';

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
	mainImage?: {
		url: string;
		key: string;
	};
}

interface SearchAdItem {
	_id: string;
	title?: string;
	location?: { cities?: string[] };
	city?: string;
	maxBudget?: number;
	minBudget?: number;
	status?: string;
	author?: Property['owner'];
	createdAt?: string;
}

interface RawProperty {
	_id: string;
	title?: string;
	price?: number;
	surface?: number;
	propertyType?: string;
	status?: string;
	city?: string;
	location?: string;
	owner?: Property['owner'];
	createdAt?: string;
	views?: number;
	transactionType?: string;
	mainImage?: {
		url: string;
		key: string;
	};
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

async function fetchAdminProperties(filters: Filters): Promise<{
	properties: Property[];
	totalItems: number;
	currentPage: number;
	totalPages: number;
}> {
	const page = filters.page || 1;
	const limit = filters.limit || 10;

	// Branch: fetch ALL (both properties and search ads)
	if (filters.postType === '') {
		const searchFilters: SearchAdFilters = {
			search: filters.search,
			propertyType: filters.propertyType,
		};

		const params = new URLSearchParams();
		if (filters.search) params.append('search', String(filters.search));
		if (filters.status) params.append('status', String(filters.status));
		if (filters.agentId) params.append('agentId', String(filters.agentId));
		if (filters.network) params.append('network', String(filters.network));
		if (filters.propertyType)
			params.append('propertyType', String(filters.propertyType));
		params.append('page', '1');
		params.append('limit', '1000');

		const [searchAdsResult, propertiesResult] = await Promise.all([
			SearchAdApi.getAllSearchAds(searchFilters),
			api.get(`/admin/properties?${params.toString()}`),
		]);

		// Map search ads
		const mappedSearchAds = (searchAdsResult as SearchAdItem[]).map(
			(ad) => {
				const title = ad.title || 'Recherche';
				const city = ad.location?.cities?.join(', ') || ad.city || '';
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
			},
		);

		// Map properties
		const rawProperties: RawProperty[] =
			propertiesResult.data.data?.properties || [];
		const mappedProperties: Property[] = rawProperties.map((p) => ({
			_id: p._id,
			title: p.title || '',
			price: p.price || 0,
			surface: p.surface || 0,
			propertyType: p.propertyType || '',
			status: p.status || 'active',
			city: p.city || '',
			location: p.location,
			owner: p.owner,
			createdAt: p.createdAt || new Date().toISOString(),
			views: p.views,
			type: 'property',
			transactionType: p.transactionType ?? '',
			mainImage: p.mainImage,
		}));

		// Combine and sort by createdAt (newest first)
		const combined = [...mappedProperties, ...mappedSearchAds].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime(),
		);

		const total = combined.length;
		const totalPagesCalc = Math.max(1, Math.ceil(total / limit));
		const startIdx = (page - 1) * limit;
		const pageSlice = combined.slice(startIdx, startIdx + limit);

		return {
			properties: pageSlice,
			totalItems: total,
			currentPage: page,
			totalPages: totalPagesCalc,
		};
	}

	// Branch: search ads only
	if (filters.postType === 'search') {
		const searchFilters: SearchAdFilters = {
			search: filters.search,
			propertyType: filters.propertyType,
		};
		const allSearchAds = (await SearchAdApi.getAllSearchAds(
			searchFilters,
		)) as SearchAdItem[];
		// Sort by createdAt descending (newest first)
		const sortedAds = [...allSearchAds].sort(
			(a, b) =>
				new Date(b.createdAt || '0').getTime() -
				new Date(a.createdAt || '0').getTime(),
		);
		const total = sortedAds.length;
		const totalPagesCalc = Math.max(1, Math.ceil(total / limit));
		const startIdx = (page - 1) * limit;
		const pageSlice = sortedAds.slice(startIdx, startIdx + limit);
		const mapped = pageSlice.map((ad) => {
			const title = ad.title || 'Recherche';
			const city = ad.location?.cities?.join(', ') || ad.city || '';
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

		return {
			properties: mapped,
			totalItems: total,
			currentPage: page,
			totalPages: totalPagesCalc,
		};
	}

	// Branch: normal properties only
	const params = new URLSearchParams();
	if (filters.search) params.append('search', String(filters.search));
	if (filters.status) params.append('status', String(filters.status));
	if (filters.agentId) params.append('agentId', String(filters.agentId));
	if (filters.network) params.append('network', String(filters.network));
	if (filters.propertyType)
		params.append('propertyType', String(filters.propertyType));
	params.append('page', String(page));
	params.append('limit', String(limit));

	const response = await api.get(`/admin/properties?${params.toString()}`);
	const data = response.data;
	// Sort by createdAt descending (newest first)
	const rawProps: RawProperty[] = data.data?.properties || [];
	const sortedProperties: Property[] = rawProps
		.map((p) => ({
			_id: p._id,
			title: p.title || '',
			price: p.price || 0,
			surface: p.surface || 0,
			propertyType: p.propertyType || '',
			status: p.status || 'active',
			city: p.city || '',
			location: p.location,
			owner: p.owner,
			createdAt: p.createdAt || new Date().toISOString(),
			views: p.views,
			type: 'property',
			transactionType: p.transactionType ?? '',
			mainImage: p.mainImage,
		}))
		.sort(
			(a, b) =>
				new Date(b.createdAt).getTime() -
				new Date(a.createdAt).getTime(),
		);

	const pagination = data.data?.pagination;
	return {
		properties: sortedProperties,
		totalItems: pagination?.totalItems || sortedProperties.length,
		currentPage: pagination?.currentPage || page,
		totalPages: pagination?.totalPages || 1,
	};
}

export function useAdminProperties(
	initialFilters: Filters,
): UseAdminPropertiesResult {
	const filtersKey = JSON.stringify(initialFilters);
	const swrKey = useMemo(
		() =>
			swrKeys.admin.properties(initialFilters as Record<string, unknown>),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[filtersKey],
	);

	const {
		data,
		isLoading: loading,
		error,
		mutate,
	} = useSWR(swrKey, () => fetchAdminProperties(initialFilters), {
		revalidateOnFocus: false,
		keepPreviousData: true,
	});

	return {
		properties: data?.properties ?? [],
		loading,
		error: error?.message ?? null,
		totalItems: data?.totalItems ?? null,
		currentPage: data?.currentPage ?? null,
		totalPages: data?.totalPages ?? null,
		refetch: mutate,
	};
}
