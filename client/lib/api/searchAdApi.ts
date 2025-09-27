import { api } from '@/lib/api';
import { SearchAd } from '@/types/searchAd';
import { CreateSearchAdPayload } from '@/types/createSearchAd';

const searchAdApi = {
	createSearchAd: async (
		adData: CreateSearchAdPayload,
	): Promise<SearchAd> => {
		const { data } = await api.post('/search-ads', adData);
		return data.data;
	},

	getMySearchAds: async (): Promise<SearchAd[]> => {
		const { data } = await api.get('/search-ads/my-ads');
		return data.data;
	},

	getSearchAdById: async (id: string): Promise<SearchAd> => {
		const { data } = await api.get(`/search-ads/${id}`);
		return data.data;
	},

	updateSearchAd: async (
		id: string,
		adData: Partial<CreateSearchAdPayload>,
	): Promise<SearchAd> => {
		const { data } = await api.put(`/search-ads/${id}`, adData);
		return data.data;
	},

	updateSearchAdStatus: async (
		id: string,
		status: SearchAd['status'],
	): Promise<SearchAd> => {
		const { data } = await api.patch(`/search-ads/${id}/status`, {
			status,
		});
		return data.data;
	},

	deleteSearchAd: async (id: string): Promise<void> => {
		await api.delete(`/search-ads/${id}`);
	},

	// Get all search ads for home page
	getAllSearchAds: async (): Promise<SearchAd[]> => {
		const { data } = await api.get('/search-ads');
		return data.data;
	},
};

export default searchAdApi;
