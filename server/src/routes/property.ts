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
import { requireOwnership, requireRole } from '../middleware/authorize';
import { Property } from '../models/Property';
import { updatePropertyStatusValidation } from '../middleware/validation';
import { uploadProperty } from '../middleware/uploadMiddleware';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public routes with rate limiting
router.get('/', generalLimiter, getProperties);
router.get('/:id', generalLimiter, getPropertyById);

// Combined property creation with image upload
// Both agents and apporteurs can create properties
router.post(
	'/create-property',
	authenticateToken,
	requireRole(['agent', 'apporteur']),
	uploadProperty,
	createProperty,
);

// Protected routes (require authentication)
router.use(authenticateToken);

// Combined property update with image upload
// Ownership verified by middleware
router.put(
	'/:id/update',
	requireOwnership(Property),
	uploadProperty,
	updateProperty,
);

// Delete property - ownership verified by middleware
router.delete('/:id', requireOwnership(Property), deleteProperty);

// User-specific routes
router.get('/my/properties', getMyProperties);
router.get('/my/stats', getPropertyStats);

// Status management - ownership verified by middleware
router.patch(
	'/:id/status',
	requireOwnership(Property),
	updatePropertyStatusValidation,
	updatePropertyStatus,
);

export default router;
