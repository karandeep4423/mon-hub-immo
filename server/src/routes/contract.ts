import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { requireCollaborationAccess } from '../middleware/authorize';
import { updateContractValidation } from '../middleware/validation';
import {
	signContract,
	updateContract,
	getContract,
} from '../controllers/contractController';

const router = Router();

const contractParamValidation = [
	param('id').isMongoId().withMessage('ID de collaboration invalide'),
];

// All contract routes require authentication
router.use(authenticateToken);

// Get contract details
// @route   GET api/contract/:id
// @desc    Get contract for collaboration
// @access  Private (collaboration participants only)
router.get(
	'/:id',
	contractParamValidation,
	requireCollaborationAccess(),
	getContract,
);

// Update contract content
// @route   PUT api/contract/:id
// @desc    Update contract content
// @access  Private (collaboration participants only)
router.put(
	'/:id',
	contractParamValidation,
	updateContractValidation,
	requireCollaborationAccess(),
	updateContract,
);

// Sign contract
// @route   POST api/contract/:id/sign
// @desc    Sign the collaboration contract
// @access  Private (collaboration participants only)
router.post(
	'/:id/sign',
	contractParamValidation,
	requireCollaborationAccess(),
	signContract,
);

export default router;
