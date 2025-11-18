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
    setPasswordFromInvite,
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
	setPasswordSchema,
	updateProfileSchema,
	completeProfileSchema,
} from '../validation/schemas';
import { uploadIdentityDoc } from '../middleware/uploadMiddleware';
	
import {
	passwordResetLimiter,
	emailVerificationLimiter,
} from '../middleware/rateLimiter';
import { checkLoginRateLimit } from '../middleware/loginRateLimiter';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (No authentication required)
// ============================================================================

// Auth routes with rate limiting
router.post('/signup', emailVerificationLimiter, uploadIdentityDoc, signup);
router.post('/login', checkLoginRateLimit, validate(loginSchema), login);
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

router.post('/set-password', validate(setPasswordSchema), setPasswordFromInvite);

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

// Public route to get all agents
router.get('/agents', getAllAgents);

// Note: previously duplicate route removed
router.post('/refresh', refreshAccessToken);

// Logout (public - clears cookies)
router.post('/logout', logout);

// ============================================================================
// PROTECTED ROUTES (Authentication required)
// ============================================================================

// Apply authentication middleware to all routes below
router.use(authenticateToken);

// User profile management
router.get('/profile', getProfile);
router.put('/profile', validate(updateProfileSchema), updateProfile);
router.post(
	'/complete-profile',
	validate(completeProfileSchema),
	completeProfile,
);

// Password management
router.post('/change-password', changePassword);

// Search preferences
router.patch('/search-preferences', updateSearchPreferences);

export default router;
