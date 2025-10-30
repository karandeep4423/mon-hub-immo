import { Router } from 'express';
import {
	getProperties,
	getPropertyById,
	deleteProperty,
	getMyProperties,
	updatePropertyStatus,
	getPropertyStats,
	createProperty,
	updateProperty,
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth';
import { updatePropertyStatusValidation } from '../middleware/validation';
import { uploadProperty } from '../middleware/uploadMiddleware';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.get('/', generalLimiter, getProperties);
router.get('/:id', generalLimiter, getPropertyById);

// Combined property creation with image upload
router.post(
	'/create-property',
	authenticateToken,
	uploadProperty,
	createProperty,
);

// Protected routes (require authentication)
router.use(authenticateToken);

// Combined property update with image upload
router.put('/:id/update', uploadProperty, updateProperty);
router.delete('/:id', deleteProperty);

// User-specific routes
router.get('/my/properties', getMyProperties);
router.get('/my/stats', getPropertyStats);

// Status management
router.patch(
	'/:id/status',
	updatePropertyStatusValidation,
	updatePropertyStatus,
);

export default router;
