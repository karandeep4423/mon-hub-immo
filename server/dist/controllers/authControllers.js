"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
// Sign up controller
const signup = async (req, res) => {
    try {
        // Check validation errors
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
            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }
        // Create new user
        const user = new User_1.User({
            firstName,
            lastName,
            email,
            password,
            phone,
            userType: userType || 'buyer'
        });
        await user.save();
        // Generate token
        const token = (0, jwt_1.generateToken)(user._id.toString());
        res.status(201).json({
            success: true,
            message: 'User created successfully',
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
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.signup = signup;
// Login controller
const login = async (req, res) => {
    try {
        // Check validation errors
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
        // Generate token
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
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (phone)
            user.phone = phone;
        if (profileImage)
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
