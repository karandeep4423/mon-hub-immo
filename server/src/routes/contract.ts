import { Router } from 'express';
import { param } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
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
router.get('/:id', contractParamValidation, getContract);

// Update contract content
router.put(
	'/:id',
	contractParamValidation,
	updateContractValidation,
	updateContract,
);

// Sign contract
router.post('/:id/sign', contractParamValidation, signContract);

export default router;
