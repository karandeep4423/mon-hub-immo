import { Router } from 'express';
import {
	signup,
	login,
	verifyEmail,
	resendVerificationCode,
	getProfile,
	updateProfile,
	forgotPassword,
	resetPassword,
	completeProfile,
	getAllAgents,
	updateSearchPreferences,
	refreshAccessToken,
	logout,
	changePassword,
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../validation/middleware';
import {
	loginSchema,
	verifyEmailSchema,
	resendVerificationSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	updateProfileSchema,
	completeProfileSchema,
} from '../validation/schemas';
import { uploadIdentityDoc } from '../middleware/uploadMiddleware';
import {
	authLimiter,
	passwordResetLimiter,
	emailVerificationLimiter,
} from '../middleware/rateLimiter';

const router = Router();

// Auth routes with rate limiting
router.post('/signup', authLimiter, uploadIdentityDoc, signup);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post(
	'/forgot-password',
	passwordResetLimiter,
	validate(forgotPasswordSchema),
	forgotPassword,
);
router.post(
	'/reset-password',
	passwordResetLimiter,
	validate(resetPasswordSchema),
	resetPassword,
);

// Email verification routes with rate limiting
router.post(
	'/verify-email',
	emailVerificationLimiter,
	validate(verifyEmailSchema),
	verifyEmail,
);
router.post(
	'/resend-verification',
	emailVerificationLimiter,
	validate(resendVerificationSchema),
	resendVerificationCode,
);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put(
	'/profile',
	authenticateToken,
	validate(updateProfileSchema),
	updateProfile,
);
router.post(
	'/complete-profile',
	authenticateToken,
	validate(completeProfileSchema),
	completeProfile,
);

// Change password (protected)
router.post('/change-password', authenticateToken, changePassword);

// Public route to get all agents
router.get('/agents', getAllAgents);

// Update search preferences (protected)
router.patch('/search-preferences', authenticateToken, updateSearchPreferences);

// Refresh access token
router.post('/refresh', refreshAccessToken);

// Logout
router.post('/logout', logout);

export default router;
