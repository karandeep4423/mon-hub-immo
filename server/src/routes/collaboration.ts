import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireCollaborationAccess } from '../middleware/authorize';
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

// ============================================================================
// PROTECTED ROUTES (All collaboration routes require authentication)
// ============================================================================

// Apply authentication middleware to all routes
router.use(authenticateToken);

// @route   POST api/collaboration
// @desc    Propose a new collaboration
// @access  Private (authenticated users)
router.post(
	'/',
	validate(proposeCollaborationSchema, 'body'),
	proposeCollaborationValidation,
	proposeCollaboration,
);

// @route   GET api/collaboration
// @desc    Get current user's collaborations
// @access  Private (authenticated users)
router.get('/', getUserCollaborations);

// @route   GET api/collaboration/property/:propertyId
// @desc    Get collaborations for a specific property
// @access  Private (authenticated users)
router.get(
	'/property/:propertyId',
	...propertyParamValidation,
	getCollaborationsByProperty,
);

// @route   GET api/collaboration/search-ad/:searchAdId
// @desc    Get collaborations for a specific search ad
// @access  Private (authenticated users)
router.get(
	'/search-ad/:searchAdId',
	...searchAdParamValidation,
	getCollaborationsBySearchAd,
);

// ============================================================================
// COLLABORATION ACCESS ROUTES (Owner or Collaborator only)
// ============================================================================

// @route   POST api/collaboration/:id/respond
// @desc    Respond to a collaboration proposal (accept/reject)
// @access  Private (owner or collaborator)
router.post(
	'/:id/respond',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	respondToCollaborationValidation,
	respondToCollaboration,
);

// @route   POST api/collaboration/:id/notes
// @desc    Add a note to a collaboration
// @access  Private (owner or collaborator)
router.post(
	'/:id/notes',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	addCollaborationNoteValidation,
	addCollaborationNote,
);

// @route   DELETE api/collaboration/:id/cancel
// @desc    Cancel a collaboration
// @access  Private (owner or collaborator)
router.delete(
	'/:id/cancel',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	cancelCollaboration,
);

// @route   PUT api/collaboration/:id/progress-status
// @desc    Update collaboration progress status
// @access  Private (owner or collaborator)
router.put(
	'/:id/progress-status',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	updateProgressStatusValidation,
	updateProgressStatus,
);

// @route   POST api/collaboration/:id/sign
// @desc    Sign collaboration contract
// @access  Private (owner or collaborator)
router.post(
	'/:id/sign',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	signCollaboration,
);

// @route   POST api/collaboration/:id/complete
// @desc    Mark collaboration as complete
// @access  Private (owner or collaborator)
router.post(
	'/:id/complete',
	...collaborationParamValidation,
	requireCollaborationAccess(),
	completeCollaboration,
);

export default router;
