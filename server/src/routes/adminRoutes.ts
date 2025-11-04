import express from 'express';
import multer from 'multer';
import { isAdmin } from '../middleware/authMiddleware';
import * as adminController from '../controllers/adminController';

const upload = multer({ dest: '/tmp/' }); // Temp pour CSV

const router = express.Router();
router.use(isAdmin);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:userId/profile', adminController.getUserProfile);
router.get('/users/:userId/activity', adminController.getUserActivity);
router.post('/users/validate/:userId', adminController.validateUser);
router.post('/users/suspend/:userId', adminController.suspendUser);
router.post('/users/reset-password/:userId', adminController.resetUserPassword);
router.delete('/users/:userId', adminController.deleteUser);
router.get('/users/export', adminController.exportUsersCSV);
 
// ... (autres routes pour properties/collabs)

export default router;