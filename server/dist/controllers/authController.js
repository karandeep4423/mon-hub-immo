"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.resendVerificationCode = exports.verifyEmail = exports.login = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
const emailService_1 = require("../utils/emailService");
// Sign up controller with code-based email verification
const signup = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { firstName, lastName, email, password, phone, userType } = req.body;
        // Check if user already exists
        const existingUser = await User_1.User.findOne({ email });
        if (existingUser) {
            if (existingUser.isEmailVerified) {
                res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
                return;
            }
            else {
                // User exists but not verified, update and resend code
                const verificationCode = emailService_1.emailService.generateVerificationCode();
                const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
                existingUser.emailVerificationCode = verificationCode;
                existingUser.emailVerificationExpires = verificationExpires;
                await existingUser.save();
                // Send verification email
                try {
                    const emailTemplate = emailService_1.emailService.getVerificationCodeTemplate(`${existingUser.firstName} ${existingUser.lastName}`, verificationCode);
                    await emailService_1.emailService.sendEmail({
                        to: email,
                        subject: `${verificationCode} is your verification code`,
                        html: emailTemplate
                    });
                }
                catch (emailError) {
                    console.error('Email sending error:', emailError);
                }
                res.status(200).json({
                    success: true,
                    message: 'A new verification code has been sent to your email.'
                });
                return;
            }
        }
        // Generate verification code (6-digit)
        const verificationCode = emailService_1.emailService.generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create new user
        const user = new User_1.User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: userType || 'buyer',
            isEmailVerified: false,
            emailVerificationCode: verificationCode,
            emailVerificationExpires: verificationExpires
        });
        await user.save();
        // Send verification email with code
        try {
            const emailTemplate = emailService_1.emailService.getVerificationCodeTemplate(`${firstName} ${lastName}`, verificationCode);
            await emailService_1.emailService.sendEmail({
                to: email,
                subject: `${verificationCode} is your verification code`,
                html: emailTemplate
            });
        }
        catch (emailError) {
            console.error('Email sending error:', emailError);
            // Continue with registration even if email fails
        }
        res.status(201).json({
            success: true,
            message: 'User created successfully. Please check your email for the verification code.',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isEmailVerified: user.isEmailVerified,
                profileImage: user.profileImage
            }
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.signup = signup;
// Updated login controller - automatically sends verification email for unverified users
const login = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, password } = req.body;
        // Find user by email and include password
        const user = await User_1.User.findOne({ email }).select('+password');
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(400).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Check if email is verified
        if (!user.isEmailVerified) {
            // Generate new verification code for unverified user
            const verificationCode = emailService_1.emailService.generateVerificationCode();
            const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
            // Update user with new verification code
            user.emailVerificationCode = verificationCode;
            user.emailVerificationExpires = verificationExpires;
            await user.save();
            // Send verification email automatically
            try {
                const emailTemplate = emailService_1.emailService.getVerificationCodeTemplate(`${user.firstName} ${user.lastName}`, verificationCode);
                await emailService_1.emailService.sendEmail({
                    to: email,
                    subject: `${verificationCode} is your verification code`,
                    html: emailTemplate
                });
                res.status(401).json({
                    success: false,
                    message: 'Please verify your email address before logging in. A new verification code has been sent to your email.',
                    requiresVerification: true,
                    email: user.email,
                    codeSent: true
                });
                return;
            }
            catch (emailError) {
                console.error('Email sending error:', emailError);
                res.status(401).json({
                    success: false,
                    message: 'Please verify your email address before logging in. Failed to send verification code - please try the resend option.',
                    requiresVerification: true,
                    email: user.email,
                    codeSent: false
                });
                return;
            }
        }
        // Generate token for verified user
        const token = (0, jwt_1.generateToken)(user._id.toString());
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isEmailVerified: user.isEmailVerified,
                profileImage: user.profileImage
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.login = login;
// Verify email with code
const verifyEmail = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email, code } = req.body;
        // Find user with valid code
        const user = await User_1.User.findOne({
            email,
            emailVerificationCode: code,
            emailVerificationExpires: { $gt: new Date() }
        });
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code'
            });
            return;
        }
        // Update user verification status
        user.isEmailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        // Generate login token
        const loginToken = (0, jwt_1.generateToken)(user._id.toString());
        res.json({
            success: true,
            message: 'Email verified successfully. You are now logged in.',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isEmailVerified: user.isEmailVerified,
                profileImage: user.profileImage
            },
            token: loginToken
        });
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.verifyEmail = verifyEmail;
// Resend verification code - still useful for cases where user explicitly requests it
const resendVerificationCode = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { email } = req.body;
        const user = await User_1.User.findOne({ email });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        if (user.isEmailVerified) {
            res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
            return;
        }
        // Generate new verification code
        const verificationCode = emailService_1.emailService.generateVerificationCode();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Update user
        user.emailVerificationCode = verificationCode;
        user.emailVerificationExpires = verificationExpires;
        await user.save();
        // Send verification email
        try {
            const emailTemplate = emailService_1.emailService.getVerificationCodeTemplate(`${user.firstName} ${user.lastName}`, verificationCode);
            await emailService_1.emailService.sendEmail({
                to: email,
                subject: `${verificationCode} is your verification code`,
                html: emailTemplate
            });
        }
        catch (emailError) {
            console.error('Email sending error:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email'
            });
            return;
        }
        res.json({
            success: true,
            message: 'Verification code sent successfully'
        });
    }
    catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.resendVerificationCode = resendVerificationCode;
// Get user profile controller
const getProfile = async (req, res) => {
    try {
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        res.json({
            success: true,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isEmailVerified: user.isEmailVerified,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.getProfile = getProfile;
// Update profile controller
const updateProfile = async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
            return;
        }
        const { firstName, lastName, phone, profileImage } = req.body;
        const user = await User_1.User.findById(req.userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        // Update fields if provided
        if (firstName !== undefined)
            user.firstName = firstName;
        if (lastName !== undefined)
            user.lastName = lastName;
        if (phone !== undefined)
            user.phone = phone;
        if (profileImage !== undefined)
            user.profileImage = profileImage;
        await user.save();
        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                userType: user.userType,
                isEmailVerified: user.isEmailVerified,
                profileImage: user.profileImage
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.updateProfile = updateProfile;
