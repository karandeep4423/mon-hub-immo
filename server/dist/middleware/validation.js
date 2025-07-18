"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileValidation = exports.loginValidation = exports.signupValidation = void 0;
const express_validator_1 = require("express-validator");
exports.signupValidation = [
    (0, express_validator_1.body)('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    (0, express_validator_1.body)('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address')
        .isLength({ max: 255 })
        .withMessage('Email cannot exceed 255 characters'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    (0, express_validator_1.body)('phone')
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),
    (0, express_validator_1.body)('userType')
        .optional()
        .isIn(['buyer', 'seller', 'agent'])
        .withMessage('User type must be buyer, seller, or agent')
];
exports.loginValidation = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 1 })
        .withMessage('Password cannot be empty')
];
exports.updateProfileValidation = [
    (0, express_validator_1.body)('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),
    (0, express_validator_1.body)('phone')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
        .isLength({ max: 20 })
        .withMessage('Phone number cannot exceed 20 characters'),
    (0, express_validator_1.body)('profileImage')
        .optional()
        .isURL()
        .withMessage('Profile image must be a valid URL')
];
