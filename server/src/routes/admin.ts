// routes/admin.ts
import express from 'express';
import { getAdminUsers, validateUser } from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = express.Router();

// Middleware : authentifier + vérifier rôle admin
router.use(authenticateToken, requireAdmin);

// GET - liste filtrée & stats
router.get('/users', getAdminUsers);

// PUT - valider/refuser un utilisateur
router.put('/users/:id/validate', validateUser);

export default router;
