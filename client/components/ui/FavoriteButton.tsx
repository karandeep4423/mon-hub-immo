import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useSWRConfig } from 'swr';
import { swrKeys } from '@/lib/swrKeys';
import { LoadingSpinner } from './LoadingSpinner';
import { logger } from '@/lib/utils/logger';
import { Features } from '@/lib/constants';

interface FavoriteButtonProps {
	itemId: string;
	itemType: 'property' | 'searchAd';
	onToggle?: (isFavorite: boolean) => void;
	size?: 'sm' | 'md' | 'lg';
	showLabel?: boolean;
	className?: string;
	// Legacy prop for backward compatibility
	propertyId?: string;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
	itemId,
	itemType,
	propertyId, // Legacy prop
	onToggle,
	size = 'md',
	showLabel = false,
	className = '',
}) => {
	// Handle legacy propertyId prop
	const actualItemId = itemId ?? propertyId!;
	const actualItemType: 'property' | 'searchAd' = itemType ?? 'property';
	const { user } = useAuth();
	const {
		isFavorite: isStoreFavorite,
		toggleFavorite,
		toggleSearchAdFavorite,
		initializeFavorites,
		isInitialized,
	} = useFavoritesStore();
	const { mutate } = useSWRConfig();
	const [isLoading, setIsLoading] = useState(false);

	// Check if user is authenticated
	const isAuthenticated = !!user;

	// Get favorite status from store or fallback to initial value
	// For non-authenticated users, always show as not favorite
	const isFavorite =
		isAuthenticated && isInitialized
			? isStoreFavorite(actualItemType, actualItemId)
			: false;

	// Size variants for the button
	const sizeClasses = {
		sm: 'w-6 h-6 text-xs',
		md: 'w-8 h-8 text-sm',
		lg: 'w-10 h-10 text-base',
	};

	// Size variants for the heart icon
	const iconSizeClasses = {
		sm: 'w-3 h-3',
		md: 'w-4 h-4',
		lg: 'w-5 h-5',
	};

	useEffect(() => {
		if (isAuthenticated && !isInitialized) {
			initializeFavorites();
		}
	}, [isAuthenticated, isInitialized, initializeFavorites]);

	const handleToggleFavorite = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isAuthenticated) {
			// Redirect to login or show auth modal
			window.location.href = Features.Auth.AUTH_ROUTES.LOGIN;
			return;
		}

		setIsLoading(true);

		try {
			// Toggle favorite via Zustand store (handles API call)
			const newIsFavorite =
				actualItemType === 'property'
					? await toggleFavorite(actualItemId)
					: await toggleSearchAdFavorite(actualItemId);

			// Invalidate SWR caches for affected resources
			if (user) {
				// Invalidate favorites list
				mutate(swrKeys.favorites.list(user._id));

				// Invalidate the specific resource (property or search ad)
				if (actualItemType === 'property') {
					mutate(swrKeys.properties.detail(actualItemId));
					mutate(
						(key) => Array.isArray(key) && key[0] === 'properties',
					);
				} else {
					mutate(swrKeys.searchAds.detail(actualItemId));
					mutate(
						(key) => Array.isArray(key) && key[0] === 'searchAds',
					);
				}

				logger.debug(
					`[FavoriteButton] Cache invalidated for ${actualItemType} ${actualItemId}`,
				);
			}

			// Call onToggle callback if provided
			onToggle?.(newIsFavorite);
		} catch (error) {
			logger.error('[FavoriteButton] Toggle failed:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// Always show the button, but handle authentication on click
	return (
		<button
			onClick={handleToggleFavorite}
			disabled={isLoading}
			className={`
				${sizeClasses[size]}
				${className}
				inline-flex items-center justify-center
				rounded-full
				transition-all duration-200
				hover:scale-110
				focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50
				${
					isFavorite
						? 'bg-red-500 text-white shadow-md hover:bg-red-600'
						: 'bg-white/80 text-gray-600 hover:text-red-500 hover:bg-white shadow-sm border border-gray-200'
				}
				${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
				${!isAuthenticated ? 'hover:bg-brand-50 hover:text-brand hover:border-brand-200' : ''}
			`}
			title={
				!isAuthenticated
					? 'Connectez-vous pour ajouter aux favoris'
					: isFavorite
						? 'Retirer des favoris'
						: 'Ajouter aux favoris'
			}
		>
			{isLoading ? (
				<LoadingSpinner size="sm" />
			) : (
				<svg
					className={iconSizeClasses[size]}
					fill={isFavorite ? 'currentColor' : 'none'}
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={isFavorite ? '0' : '2'}
						d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
					/>
				</svg>
			)}
			{showLabel && (
				<span className="ml-1">
					{isFavorite ? 'Favori' : 'Favoris'}
				</span>
			)}
		</button>
	);
};
