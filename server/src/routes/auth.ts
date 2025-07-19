import { Router } from 'express';
import { body } from 'express-validator';
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

const router = Router();

// Validation middleware
const validateSignup = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must contain only letters and spaces'),
  
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must contain only letters and spaces'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  
  body('password')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('userType')
    .optional()
    .isIn(['buyer', 'seller', 'agent'])
    .withMessage('User type must be either buyer or seller'),
];

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateVerifyCode = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification code must be 6 digits')
    .isNumeric()
    .withMessage('Verification code must contain only numbers'),
];

const validateResendCode = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('First name must contain only letters and spaces'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Last name must contain only letters and spaces'),
  
  body('phone')
    .optional({ checkFalsy: true })
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('profileImage')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Profile image must be a valid URL'),
];

// Add these validation middlewares
const validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const validateResetPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('code')
    .isLength({ min: 6, max: 6 })
    .withMessage('Reset code must be 6 digits')
    .isNumeric()
    .withMessage('Reset code must contain only numbers'),
    
  body('newPassword')
    .isLength({ min: 6, max: 128 })
    .withMessage('Password must be between 6 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
];

const validateCompleteProfile = [
  body('professionalInfo.postalCode')
    .optional()
    .isLength({ min: 5, max: 5 })
    .withMessage('Code postal must be 5 digits'),
  
  body('professionalInfo.city')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('City must be between 2 and 100 characters'),
  
  body('professionalInfo.interventionRadius')
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage('Intervention radius must be between 1 and 200 km'),
  
  body('professionalInfo.siretNumber')
    .optional()
    .isLength({ min: 14, max: 14 })
    .withMessage('SIRET number must be 14 digits'),
  
  body('professionalInfo.yearsExperience')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Years of experience must be between 0 and 50'),
];

// Add this route
router.post('/complete-profile', authenticateToken, validateCompleteProfile, completeProfile);

// Auth routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/forgot-password', validateForgotPassword, forgotPassword);
router.post('/reset-password', validateResetPassword, resetPassword);

// Email verification routes
router.post('/verify-email', validateVerifyCode, verifyEmail);
router.post('/resend-verification', validateResendCode, resendVerificationCode);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateUpdateProfile, updateProfile);

export default router;
