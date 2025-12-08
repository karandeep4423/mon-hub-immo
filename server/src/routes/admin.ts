// routes/admin.ts
import express from 'express';
import {
	getAdminUsers,
	validateUser,
	getAdminUserProfile,
	getAdminUserStats,
	createAdminUser,
	updateAdminUser,
	deleteAdminUser,
	importUsersFromCSV,
	getAdminStats,
	blockUser,
	unblockUser,
	sendPaymentReminder,
	grantAdminAccess,
	revokeAdminAccess,
	deleteAdminCollaboration,
} from '../controllers/adminController';
import {
	getAdminProperties,
	deleteAdminProperty,
	updateAdminProperty,
} from '../controllers/propertyController';
import {
	deleteAdminSearchAd,
	updateAdminSearchAd,
} from '../controllers/searchAdController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { uploadCSV } from '../middleware/uploadMiddleware';

const router = express.Router();

// Middleware : authentifier + vérifier rôle admin
router.use(authenticateToken, requireAdmin);

// GET - liste filtrée & stats
router.get('/users', getAdminUsers);

// GET - dashboard aggregated stats
router.get('/stats', getAdminStats);

// GET - profil détaillé
router.get('/users/:id', getAdminUserProfile);

// GET - per-user stats
router.get('/users/:id/stats', getAdminUserStats);

// GET - liste de toutes les propriétés pour l'admin
router.get('/properties', getAdminProperties);

// PUT - update a property (admin)
router.put('/properties/:id', updateAdminProperty);

// DELETE - supprimer une propriété
router.delete('/properties/:id', deleteAdminProperty);

// PUT - update a search ad (admin)
router.put('/search-ads/:id', updateAdminSearchAd);

// DELETE - supprimer une annonce de recherche (admin)
router.delete('/search-ads/:id', deleteAdminSearchAd);

// DELETE - supprimer une collaboration (admin)
router.delete('/collaborations/:id', deleteAdminCollaboration);

// PUT - valider/refuser un utilisateur
router.put('/users/:id/validate', validateUser);

router.post('/users/create', createAdminUser);

router.put('/users/:id', updateAdminUser);

// Admin - block/unblock users
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// Admin - grant/revoke manual access (override for payment)
router.post('/users/:id/grant-access', grantAdminAccess);
router.post('/users/:id/revoke-access', revokeAdminAccess);

// POST - send payment reminder to user
router.post('/users/:id/send-payment-reminder', sendPaymentReminder);

// DELETE - delete user (admin)
router.delete('/users/:id', deleteAdminUser);

// POST - import users from CSV
router.post('/users/import', uploadCSV, importUsersFromCSV);

export default router;
