import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { generateToken } from '../utils/jwt';
import { emailService } from '../utils/emailService';
import { AuthRequest } from '../types/auth';

// Sign up controller with code-based email verification
export const signup = async (req: Request, res: Response): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { firstName, lastName, email, password, phone, userType } =
			req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			if (existingUser.isEmailVerified) {
				res.status(400).json({
					success: false,
					message: 'User already exists with this email',
				});
				return;
			} else {
				// User exists but not verified, update and resend code
				const verificationCode =
					emailService.generateVerificationCode();
				const verificationExpires = new Date(
					Date.now() + 24 * 60 * 60 * 1000,
				);

				existingUser.emailVerificationCode = verificationCode;
				existingUser.emailVerificationExpires = verificationExpires;
				await existingUser.save();

				// Send verification email
				try {
					const emailTemplate =
						emailService.getVerificationCodeTemplate(
							`${existingUser.firstName} ${existingUser.lastName}`,
							verificationCode,
						);

					await emailService.sendEmail({
						to: email,
						subject: `${verificationCode} is your verification code`,
						html: emailTemplate,
					});
				} catch (emailError) {
					console.error('Email sending error:', emailError);
				}

				res.status(200).json({
					success: true,
					message:
						'A new verification code has been sent to your email.',
				});
				return;
			}
		}

		// Generate verification code (6-digit)
		const verificationCode = emailService.generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Create new user
		const user = new User({
			firstName,
			lastName,
			email,
			password,
			phone,
			userType: userType,
			isEmailVerified: false,
			emailVerificationCode: verificationCode,
			emailVerificationExpires: verificationExpires,
		});

		await user.save();

		// Send verification email with code
		try {
			const emailTemplate = emailService.getVerificationCodeTemplate(
				`${firstName} ${lastName}`,
				verificationCode,
			);

			await emailService.sendEmail({
				to: email,
				subject: `${verificationCode} is your verification code`,
				html: emailTemplate,
			});
		} catch (emailError) {
			console.error('Email sending error:', emailError);
			// Continue with registration even if email fails
		}

		res.status(201).json({
			success: true,
			message:
				'User created successfully. Please check your email for the verification code.',
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				userType: user.userType,
				isEmailVerified: user.isEmailVerified,
				profileImage: user.profileImage,
			},
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// controllers/authController.ts - Update the login function
export const login = async (req: Request, res: Response): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { email, password } = req.body;

		// Find user by email and include password
		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			res.status(400).json({
				success: false,
				message: 'Invalid credentials',
			});
			return;
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			res.status(400).json({
				success: false,
				message: 'Invalid credentials',
			});
			return;
		}

		// Check if email is verified
		if (!user.isEmailVerified) {
			// Generate new verification code for unverified user
			const verificationCode = emailService.generateVerificationCode();
			const verificationExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000,
			);

			user.emailVerificationCode = verificationCode;
			user.emailVerificationExpires = verificationExpires;
			await user.save();

			try {
				const emailTemplate = emailService.getVerificationCodeTemplate(
					`${user.firstName} ${user.lastName}`,
					verificationCode,
				);

				await emailService.sendEmail({
					to: email,
					subject: `${verificationCode} is your verification code`,
					html: emailTemplate,
				});

				res.status(401).json({
					success: false,
					message:
						'Please verify your email address before logging in. A new verification code has been sent to your email.',
					requiresVerification: true,
					email: user.email,
					codeSent: true,
				});
				return;
			} catch (emailError) {
				console.error('Email sending error:', emailError);
				res.status(401).json({
					success: false,
					message:
						'Please verify your email address before logging in. Failed to send verification code - please try the resend option.',
					requiresVerification: true,
					email: user.email,
					codeSent: false,
				});
				return;
			}
		}

		// Generate token for verified user
		const token = generateToken((user._id as unknown as string).toString());

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
				profileImage: user.profileImage,
				profileCompleted: user.profileCompleted || false, // Add this field
				professionalInfo: user.professionalInfo, // Add this field
			},
			token,
			// Add these flags to help frontend routing
			requiresProfileCompletion:
				user.userType === 'agent' && !user.profileCompleted,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Verify email with code
export const verifyEmail = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { email, code } = req.body;

		// Find user with valid code
		const user = await User.findOne({
			email,
			emailVerificationCode: code,
			emailVerificationExpires: { $gt: new Date() },
		});

		if (!user) {
			res.status(400).json({
				success: false,
				message: 'Invalid or expired verification code',
			});
			return;
		}

		// Update user verification status
		user.isEmailVerified = true;
		user.emailVerificationCode = undefined;
		user.emailVerificationExpires = undefined;
		await user.save();

		// Generate login token
		const loginToken = generateToken(
			(user._id as unknown as string).toString(),
		);

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
				profileImage: user.profileImage,
				profileCompleted: user.profileCompleted || false, // Add this
				professionalInfo: user.professionalInfo, // Add this
			},
			token: loginToken,
			// Add flag for frontend routing
			requiresProfileCompletion:
				user.userType === 'agent' && !user.profileCompleted,
		});
	} catch (error) {
		console.error('Email verification error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Resend verification code - still useful for cases where user explicitly requests it
export const resendVerificationCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { email } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		if (user.isEmailVerified) {
			res.status(400).json({
				success: false,
				message: 'Email is already verified',
			});
			return;
		}

		// Generate new verification code
		const verificationCode = emailService.generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Update user
		user.emailVerificationCode = verificationCode;
		user.emailVerificationExpires = verificationExpires;
		await user.save();

		// Send verification email
		try {
			const emailTemplate = emailService.getVerificationCodeTemplate(
				`${user.firstName} ${user.lastName}`,
				verificationCode,
			);

			await emailService.sendEmail({
				to: email,
				subject: `${verificationCode} is your verification code`,
				html: emailTemplate,
			});
		} catch (emailError) {
			console.error('Email sending error:', emailError);
			res.status(500).json({
				success: false,
				message: 'Failed to send verification email',
			});
			return;
		}

		res.json({
			success: true,
			message: 'Verification code sent successfully',
		});
	} catch (error) {
		console.error('Resend verification error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Add this function to your authController.ts
export const forgotPassword = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { email } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			// For security, we don't reveal whether the email exists or not
			res.json({
				success: true,
				message:
					'If an account with that email exists, we have sent you a password reset code.',
			});
			return;
		}

		// Generate password reset code (6-digit)
		const resetCode = emailService.generateVerificationCode();
		const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

		// Update user with reset code
		user.passwordResetCode = resetCode;
		user.passwordResetExpires = resetExpires;
		await user.save();

		// Send password reset email
		try {
			const emailTemplate = emailService.getPasswordResetTemplate(
				`${user.firstName} ${user.lastName}`,
				resetCode,
			);

			await emailService.sendEmail({
				to: email,
				subject: `${resetCode} is your password reset code`,
				html: emailTemplate,
			});

			res.json({
				success: true,
				message:
					'Password reset code has been sent to your email address.',
			});
		} catch (emailError) {
			console.error('Email sending error:', emailError);
			// Clear the reset code if email fails
			user.passwordResetCode = undefined;
			user.passwordResetExpires = undefined;
			await user.save();

			res.status(500).json({
				success: false,
				message:
					'Failed to send password reset email. Please try again.',
			});
		}
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Add this function to your authController.ts
export const resetPassword = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { email, code, newPassword } = req.body;

		// Find user with valid reset code
		const user = await User.findOne({
			email,
			passwordResetCode: code,
			passwordResetExpires: { $gt: new Date() },
		});

		if (!user) {
			res.status(400).json({
				success: false,
				message: 'Invalid or expired reset code',
			});
			return;
		}

		// Update password and clear reset fields
		user.password = newPassword; // This will be hashed by your User model pre-save hook
		user.passwordResetCode = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// Generate login token for immediate login after password reset
		const loginToken = generateToken(
			(user._id as unknown as string).toString(),
		);

		// Send confirmation email
		try {
			const emailTemplate =
				emailService.getPasswordResetConfirmationTemplate(
					`${user.firstName} ${user.lastName}`,
				);

			await emailService.sendEmail({
				to: email,
				subject: 'Password Successfully Reset - HubImmo',
				html: emailTemplate,
			});
		} catch (emailError) {
			console.error('Confirmation email error:', emailError);
			// Continue even if confirmation email fails
		}

		res.json({
			success: true,
			message:
				'Password has been successfully reset. You are now logged in.',
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				userType: user.userType,
				isEmailVerified: user.isEmailVerified,
				profileImage: user.profileImage,
			},
			token: loginToken,
		});
	} catch (error) {
		console.error('Reset password error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Get user profile controller
export const getProfile = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const user = await User.findById(req.userId);

		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
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
				updatedAt: user.updatedAt,
				professionalInfo: user.professionalInfo,
				profileCompleted: user.profileCompleted || false, // Add this field
			},
		});
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Update profile controller
export const updateProfile = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { firstName, lastName, phone, profileImage } = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		// Update fields if provided
		if (firstName !== undefined) user.firstName = firstName;
		if (lastName !== undefined) user.lastName = lastName;
		if (phone !== undefined) user.phone = phone;
		if (profileImage !== undefined) user.profileImage = profileImage;

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
				profileImage: user.profileImage,
			},
		});
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// controllers/authController.ts - Add this new function
export const completeProfile = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: errors.array(),
			});
			return;
		}

		const { professionalInfo, profileImage } = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		// Update professional info for agents
		if (user.userType === 'agent' && professionalInfo) {
			user.professionalInfo = {
				...user.professionalInfo,
				...professionalInfo,
			};
		}

		if (profileImage) {
			user.profileImage = profileImage;
		}

		user.profileCompleted = true;
		await user.save();

		res.json({
			success: true,
			message: 'Profile completed successfully',
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phone: user.phone,
				userType: user.userType,
				isEmailVerified: user.isEmailVerified,
				profileImage: user.profileImage,
				professionalInfo: user.professionalInfo,
				profileCompleted: user.profileCompleted,
			},
		});
	} catch (error) {
		console.error('Complete profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
