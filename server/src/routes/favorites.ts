import { Router } from 'express';
import {
	toggleFavorite,
	getUserFavorites,
	checkFavoriteStatus,
	getUserFavoriteIds,
	toggleSearchAdFavorite,
	checkSearchAdFavoriteStatus,
	getUserFavoriteSearchAdIds,
	getUserMixedFavorites,
} from '../controllers/favoritesController';
import { authenticateToken } from '../middleware/auth';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply authentication middleware and rate limiting to all routes
router.use(generalLimiter);
router.use(authenticateToken);

// Toggle favorite status for a property
router.post('/properties/:propertyId/toggle', toggleFavorite);

// Toggle favorite status for a search ad
router.post('/search-ads/:searchAdId/toggle', toggleSearchAdFavorite);

// Get user's favorite properties
router.get('/', getUserFavorites);

// Get user's mixed favorites (properties + search ads)
router.get('/mixed', getUserMixedFavorites);

// Check if a specific property is favorited by user
router.get('/status/:propertyId', checkFavoriteStatus);

// Check if a specific search ad is favorited by user
router.get('/search-ads/status/:searchAdId', checkSearchAdFavoriteStatus);

// Get user's favorite property IDs (for bulk status checks)
router.get('/ids', getUserFavoriteIds);

// Get user's favorite search ad IDs (for bulk status checks)
router.get('/search-ads/ids', getUserFavoriteSearchAdIds);

export default router;
