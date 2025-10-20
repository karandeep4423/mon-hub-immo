import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
	proposeCollaborationValidation,
	respondToCollaborationValidation,
	addCollaborationNoteValidation,
	updateProgressStatusValidation,
} from '../middleware/validation';
import { validate } from '../validation/middleware';
import {
	proposeCollaborationSchema,
	collaborationIdParam,
	propertyIdParam,
	searchAdIdParam,
} from '../validation/schemas';
import {
	proposeCollaboration,
	getUserCollaborations,
	respondToCollaboration,
	addCollaborationNote,
	getCollaborationsByProperty,
	getCollaborationsBySearchAd,
	cancelCollaboration,
	updateProgressStatus,
	signCollaboration,
	completeCollaboration,
} from '../controllers/collaborationController';

const router = Router();

// Zod param validators
const collaborationParamValidation = [
	validate(collaborationIdParam, 'params'),
] as const;
const propertyParamValidation = [validate(propertyIdParam, 'params')] as const;
const searchAdParamValidation = [validate(searchAdIdParam, 'params')] as const;

router.use(authenticateToken);

// Keep existing express-validator temporarily, add Zod body validation
router.post(
	'/',
	validate(proposeCollaborationSchema, 'body'),
	proposeCollaborationValidation,
	proposeCollaboration,
);
router.get('/', getUserCollaborations);
router.post(
	'/:id/respond',
	...collaborationParamValidation,
	respondToCollaborationValidation,
	respondToCollaboration,
);
router.post(
	'/:id/notes',
	...collaborationParamValidation,
	addCollaborationNoteValidation,
	addCollaborationNote,
);
router.get(
	'/property/:propertyId',
	...propertyParamValidation,
	getCollaborationsByProperty,
);

router.get(
	'/search-ad/:searchAdId',
	...searchAdParamValidation,
	getCollaborationsBySearchAd,
);

router.delete(
	'/:id/cancel',
	...collaborationParamValidation,
	cancelCollaboration,
);

router.put(
	'/:id/progress-status',
	...collaborationParamValidation,
	updateProgressStatusValidation,
	updateProgressStatus,
);

router.post('/:id/sign', ...collaborationParamValidation, signCollaboration);

router.post(
	'/:id/complete',
	...collaborationParamValidation,
	completeCollaboration,
);

export default router;
