// routes/admin.ts
import express from 'express';
import { getAdminUsers, validateUser, getAdminUserProfile, createAdminUser, updateAdminUser, deleteAdminUser, importUsersFromCSV, getAdminStats, blockUser, unblockUser } from '../controllers/adminController';
import { getAdminProperties } from '../controllers/propertyController';
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

// GET - liste de toutes les propriétés pour l'admin
router.get('/properties', getAdminProperties);

// PUT - valider/refuser un utilisateur
router.put('/users/:id/validate', validateUser);

router.post('/users/create', createAdminUser);

router.put('/users/:id', updateAdminUser);

// Admin - block/unblock users
router.post('/users/:id/block', blockUser);
router.post('/users/:id/unblock', unblockUser);

// DELETE - delete user (admin)
router.delete('/users/:id', deleteAdminUser);

// POST - import users from CSV
router.post('/users/import', uploadCSV, importUsersFromCSV);

export default router;
