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
  completeProfile
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
  completeProfileValidation
} from '../middleware/validation';

const router = Router();

// Auth routes
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Email verification routes
router.post('/verify-email', verifyEmailValidation, verifyEmail);
router.post('/resend-verification', resendVerificationValidation, resendVerificationCode);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);
router.post('/complete-profile', authenticateToken, completeProfileValidation, completeProfile);

export default router;
