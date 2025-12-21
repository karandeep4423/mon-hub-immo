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
import { requireActiveSubscription } from '../middleware/subscription';
import { requireOwnership, requireRole } from '../middleware/authorize';
import { Property } from '../models/Property';
import { updatePropertyStatusValidation } from '../middleware/validation';

const router = Router();

// Public routes (rate limiting applied globally in server.ts)
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Property creation with direct S3 upload (no multer)
// Images are uploaded directly to S3 via presigned URLs, then property is created with image keys
router.post(
	'/create-property',
	authenticateToken,
	requireActiveSubscription,
	requireRole(['agent', 'apporteur', 'admin']),
	createProperty,
);

// Protected routes (require authentication + active subscription)
router.use(authenticateToken, requireActiveSubscription);

// Property update with direct S3 upload (no multer)
// Images are uploaded directly to S3 via presigned URLs
router.put('/:id/update', requireOwnership(Property), updateProperty);

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
