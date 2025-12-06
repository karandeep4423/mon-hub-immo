import { create } from 'zustand';
import { FavoritesService } from '@/lib/api/favoritesApi';
import { logger } from '@/lib/utils/logger';
import { useAuthStore } from './authStore';

interface FavoritesState {
	// Backward-compatible property favorites set
	favoriteIds: Set<string>;
	// New sets
	favoritePropertyIds: Set<string>;
	favoriteSearchAdIds: Set<string>;

	isLoading: boolean;
	isInitialized: boolean;

	// Actions
	initializeFavorites: () => Promise<void>;
	// Property favorites (legacy)
	toggleFavorite: (propertyId: string) => Promise<boolean>;
	addToFavorites: (propertyId: string) => void;
	removeFromFavorites: (propertyId: string) => void;

	// SearchAd favorites
	toggleSearchAdFavorite: (searchAdId: string) => Promise<boolean>;

	// Unified check
	isFavorite: (type: 'property' | 'searchAd', id: string) => boolean;

	reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
	favoriteIds: new Set(),
	favoritePropertyIds: new Set(),
	favoriteSearchAdIds: new Set(),
	isLoading: false,
	isInitialized: false,

	initializeFavorites: async () => {
		const { isInitialized, isLoading } = get();

		if (isInitialized || isLoading) {
			return;
		}

		// Check if user can access favorites (must be paid agent or apporteur or admin)
		const user = useAuthStore.getState().user;
		if (!user) {
			return;
		}

		// Skip favorites fetch for agents with incomplete profile or no subscription
		if (user.userType === 'agent') {
			if (
				!user.profileCompleted ||
				(!user.isPaid && !user.accessGrantedByAdmin)
			) {
				logger.debug(
					'[FavoritesStore] Skipping favorites - agent profile incomplete or not paid',
				);
				set({ isInitialized: true });
				return;
			}
		}

		set({ isLoading: true });

		try {
			const [propIdsRes, adIdsRes] = await Promise.all([
				FavoritesService.getUserFavoriteIds(),
				FavoritesService.getUserFavoriteSearchAdIds(),
			]);
			set({
				favoriteIds: new Set(propIdsRes.favoriteIds), // legacy alias
				favoritePropertyIds: new Set(propIdsRes.favoriteIds),
				favoriteSearchAdIds: new Set(adIdsRes.favoriteIds),
				isInitialized: true,
				isLoading: false,
			});
		} catch (error) {
			logger.error('Error initializing favorites', error);
			set({
				favoriteIds: new Set(),
				favoritePropertyIds: new Set(),
				favoriteSearchAdIds: new Set(),
				isInitialized: true,
				isLoading: false,
			});
		}
	},

	toggleFavorite: async (propertyId: string) => {
		try {
			const response = await FavoritesService.toggleFavorite(propertyId);
			const { favoriteIds, favoritePropertyIds } = get();
			const newFavoriteIds = new Set(favoriteIds);
			const newFavoritePropertyIds = new Set(favoritePropertyIds);

			if (response.isFavorite) {
				newFavoriteIds.add(propertyId);
				newFavoritePropertyIds.add(propertyId);
			} else {
				newFavoriteIds.delete(propertyId);
				newFavoritePropertyIds.delete(propertyId);
			}

			set({
				favoriteIds: newFavoriteIds,
				favoritePropertyIds: newFavoritePropertyIds,
			});
			return response.isFavorite;
		} catch (error) {
			logger.error('Error toggling favorite', error);
			throw error;
		}
	},

	// Toggle favorite for search ad
	toggleSearchAdFavorite: async (searchAdId: string) => {
		try {
			const response =
				await FavoritesService.toggleSearchAdFavorite(searchAdId);
			const { favoriteSearchAdIds } = get();
			const newSet = new Set(favoriteSearchAdIds);
			if (response.isFavorite) newSet.add(searchAdId);
			else newSet.delete(searchAdId);
			set({ favoriteSearchAdIds: newSet });
			return response.isFavorite;
		} catch (error) {
			logger.error('Error toggling search ad favorite', error);
			throw error;
		}
	},

	// Unified check
	isFavorite: (type: 'property' | 'searchAd', id: string) => {
		if (type === 'property') return get().favoritePropertyIds.has(id);
		return get().favoriteSearchAdIds.has(id);
	},

	addToFavorites: (propertyId: string) => {
		const { favoriteIds, favoritePropertyIds } = get();
		const newFavoriteIds = new Set(favoriteIds);
		const newFavoritePropertyIds = new Set(favoritePropertyIds);
		newFavoriteIds.add(propertyId);
		newFavoritePropertyIds.add(propertyId);
		set({
			favoriteIds: newFavoriteIds,
			favoritePropertyIds: newFavoritePropertyIds,
		});
	},

	removeFromFavorites: (propertyId: string) => {
		const { favoriteIds, favoritePropertyIds } = get();
		const newFavoriteIds = new Set(favoriteIds);
		const newFavoritePropertyIds = new Set(favoritePropertyIds);
		newFavoriteIds.delete(propertyId);
		newFavoritePropertyIds.delete(propertyId);
		set({
			favoriteIds: newFavoriteIds,
			favoritePropertyIds: newFavoritePropertyIds,
		});
	},

	reset: () => {
		set({
			favoriteIds: new Set(),
			favoritePropertyIds: new Set(),
			favoriteSearchAdIds: new Set(),
			isLoading: false,
			isInitialized: false,
		});
	},
}));
