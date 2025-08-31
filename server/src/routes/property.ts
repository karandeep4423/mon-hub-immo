import { Router } from 'express';
import {
	getProperties,
	getPropertyById,
	createProperty,
	updateProperty,
	deleteProperty,
	getMyProperties,
	updatePropertyStatus,
	getPropertyStats,
} from '../controllers/propertyController';
import { authenticateToken } from '../middleware/auth';
import {
	createPropertyValidation,
	updatePropertyValidation,
	updatePropertyStatusValidation,
} from '../middleware/validation';

const router = Router();

// Public routes
router.get('/', getProperties);
router.get('/:id', getPropertyById);

// Protected routes (require authentication)
router.use(authenticateToken);

// Property CRUD operations
router.post('/', createPropertyValidation, createProperty);
router.put('/:id', updatePropertyValidation, updateProperty);
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
