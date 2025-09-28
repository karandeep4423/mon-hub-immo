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
} from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import {
	signupValidation,
	loginValidation,
	verifyEmailValidation,
	resendVerificationValidation,
	updateProfileValidation,
	forgotPasswordValidation,
	resetPasswordValidation,
	completeProfileValidation,
} from '../middleware/validation';

const router = Router();

// Debug middleware for production issues
router.use((req, res, next) => {
	console.log(`Auth route ${req.method} ${req.path}:`, {
		contentType: req.headers['content-type'],
		contentLength: req.headers['content-length'],
		hasBody: !!req.body,
		bodyType: typeof req.body,
	});
	next();
});

// Auth routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Email verification routes
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post(
	'/resend-verification',
	resendVerificationValidation,
	resendVerificationCode,
);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put(
	'/profile',
	authenticateToken,
	updateProfileValidation,
	updateProfile,
);
router.post(
	'/complete-profile',
	authenticateToken,
	completeProfileValidation,
	completeProfile,
);

export default router;
