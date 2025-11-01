import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { PendingVerification } from '../models/PendingVerification';
import {
	generateToken,
	generateRefreshToken,
	verifyRefreshToken,
} from '../utils/jwt';
import {
	sendEmail,
	generateVerificationCode,
	getVerificationCodeTemplate,
	getPasswordResetTemplate,
	getPasswordResetConfirmationTemplate,
	getAccountLockedTemplate,
} from '../utils/emailService';
import { AuthRequest } from '../types/auth';
import { signupSchema } from '../validation/schemas';
import { S3Service } from '../services/s3Service';
import { logger } from '../utils/logger';
import {
	sanitizeString,
	sanitizeEmail,
	sanitizePhone,
} from '../utils/sanitize';
import { compareVerificationCode } from '../utils/timingSafe';
import {
	setAuthCookies,
	clearAuthCookies,
	setAccessTokenCookie,
	getRefreshTokenFromCookies,
	getAccessTokenFromCookies,
} from '../utils/cookieHelper';
import { blacklistToken } from '../utils/redisClient';
import {
	isPasswordInHistory,
	updatePasswordHistory,
} from '../utils/passwordHistory';
import { logSecurityEvent } from '../utils/securityLogger';

// Helper function to upload identity card to S3
const uploadIdentityCardToTemp = async (
	file: Express.Multer.File,
	email: string,
): Promise<string | undefined> => {
	try {
		const s3Service = new S3Service();
		const result = await s3Service.uploadObject({
			buffer: file.buffer,
			originalName: file.originalname,
			userId: email,
			folder: 'temp',
			contentType: file.mimetype,
		});
		logger.debug(
			'[AuthController] Identity card uploaded to temp',
			result.key,
		);
		return result.key;
	} catch (uploadError) {
		logger.error(
			'[AuthController] Identity card upload failed',
			uploadError,
		);
		return undefined;
	}
};

// Sign up controller with code-based email verification
export const signup = async (req: Request, res: Response): Promise<void> => {
	try {
		// Validate request body using Zod
		const parsed = signupSchema.safeParse(req.body);

		if (!parsed.success) {
			logger.error(
				'[AuthController] Zod validation errors',
				parsed.error.errors,
			);
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: parsed.error.errors.map((err) => ({
					field: err.path.join('.'),
					message: err.message,
				})),
			});
			return;
		}

		const { firstName, lastName, email, password, phone, userType } =
			parsed.data;

		// Sanitize inputs to prevent XSS attacks
		const sanitizedFirstName = sanitizeString(firstName);
		const sanitizedLastName = sanitizeString(lastName);
		const sanitizedEmail = sanitizeEmail(email);
		const sanitizedPhone = phone ? sanitizePhone(phone) : undefined;

		// Check if email already exists in User collection (verified users)
		const existingUser = await User.findOne({ email: sanitizedEmail });
		if (existingUser) {
			res.status(400).json({
				success: false,
				message:
					'Un compte existe déjà avec cet email. Veuillez vous connecter.',
			});
			return;
		}

		// Check if email already exists in PendingVerification (unverified signups)
		const existingPending = await PendingVerification.findOne({
			email: sanitizedEmail,
		});
		if (existingPending) {
			// Pending verification exists, update it and resend code
			const verificationCode = generateVerificationCode();
			const verificationExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000,
			);

			existingPending.emailVerificationCode = verificationCode;
			existingPending.emailVerificationExpires = verificationExpires;
			// Update password in case user changed it
			existingPending.password = password;
			// Update other fields in case they changed
			existingPending.firstName = sanitizedFirstName;
			existingPending.lastName = sanitizedLastName;
			existingPending.phone = sanitizedPhone;

			// Handle new identity card upload if provided
			if (userType === 'agent' && req.file) {
				const s3Service = new S3Service();

				// Delete old temp file if it exists
				if (existingPending.identityCardTempKey) {
					try {
						await s3Service.deleteImage(
							existingPending.identityCardTempKey,
						);
					} catch (deleteError) {
						logger.error(
							'[AuthController] Failed to delete old temp file',
							deleteError,
						);
					}
				}

				// Upload new file
				const newKey = await uploadIdentityCardToTemp(req.file, email);
				if (newKey) {
					existingPending.identityCardTempKey = newKey;
				}
			}

			await existingPending.save();

			// Send verification email
			try {
				const emailTemplate = getVerificationCodeTemplate(
					`${existingPending.firstName} ${existingPending.lastName}`,
					verificationCode,
				);

				await sendEmail({
					to: email,
					subject: `${verificationCode} est votre code de vérification`,
					html: emailTemplate,
				});
			} catch (emailError) {
				logger.error(
					'[AuthController] Email sending error',
					emailError,
				);
			}

			res.status(200).json({
				success: true,
				message:
					'Un nouveau code de vérification a été envoyé à votre email.',
			});
			return;
		}

		// Generate verification code (6-digit)
		const verificationCode = generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Handle identity card upload for agents (optional during signup)
		let identityCardTempKey: string | undefined;
		if (userType === 'agent' && req.file) {
			identityCardTempKey = await uploadIdentityCardToTemp(
				req.file,
				email,
			);
		}

		// Create new pending verification (NOT User yet)
		const pendingPayload = {
			firstName: sanitizedFirstName,
			lastName: sanitizedLastName,
			email: sanitizedEmail,
			password,
			phone: sanitizedPhone,
			userType,
			emailVerificationCode: verificationCode,
			emailVerificationExpires: verificationExpires,
			identityCardTempKey, // Store temp S3 key
		};

		logger.debug('[AuthController] Creating pending verification', {
			email: pendingPayload.email,
			userType: pendingPayload.userType,
		});

		const pendingVerification = new PendingVerification(pendingPayload);
		await pendingVerification.save();

		// Send verification email with code
		try {
			const emailTemplate = getVerificationCodeTemplate(
				`${sanitizedFirstName} ${sanitizedLastName}`,
				verificationCode,
			);

			await sendEmail({
				to: sanitizedEmail,
				subject: `${verificationCode} est votre code de vérification - MonHubImmo`,
				html: emailTemplate,
			});
		} catch (emailError) {
			logger.error('[AuthController] Email sending error', emailError);
			// Continue with registration even if email fails
		}

		res.status(201).json({
			success: true,
			message:
				'Inscription en attente. Veuillez vérifier votre email pour le code de vérification.',
		});
	} catch (error) {
		// Surface Mongoose validation errors as 400 to aid diagnosis
		if (error instanceof mongoose.Error.ValidationError) {
			logger.error(
				'[AuthController] Signup validation error (Mongoose)',
				error,
			);
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: Object.values(error.errors).map((e) => ({
					field: e.path,
					message: e.message,
				})),
			});
			return;
		}

		logger.error('[AuthController] Signup error', error);
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

		// Find user by email and include password + security fields
		const user = await User.findOne({ email }).select(
			'+password +failedLoginAttempts +accountLockedUntil',
		);
		if (!user) {
			// Log failed login attempt (user not found)
			logger.warn('[AuthController] Failed login - user not found', {
				email,
			});

			res.status(400).json({
				success: false,
				message: 'Invalid credentials',
			});
			return;
		}

		// Check if account is locked
		if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
			const minutesLeft = Math.ceil(
				(user.accountLockedUntil.getTime() - Date.now()) / 60000,
			);
			res.status(403).json({
				success: false,
				message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}.`,
				lockedUntil: user.accountLockedUntil,
			});
			return;
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			// Increment failed login attempts
			const failedAttempts = (user.failedLoginAttempts || 0) + 1;
			const updateData: {
				failedLoginAttempts: number;
				accountLockedUntil?: Date;
			} = {
				failedLoginAttempts: failedAttempts,
			};

			// Lock account after 5 failed attempts
			if (failedAttempts >= 5) {
				const lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
				updateData.accountLockedUntil = lockUntil;

				// Log account locked event
				await logSecurityEvent({
					userId: (user._id as unknown as string).toString(),
					eventType: 'account_locked',
					req,
					metadata: {
						email,
						reason: 'Too many failed login attempts',
						lockedUntil: lockUntil,
					},
				});

				// Send account locked email notification
				try {
					const unlockTimeFormatted = lockUntil.toLocaleString(
						'fr-FR',
						{
							dateStyle: 'short',
							timeStyle: 'short',
						},
					);
					const emailTemplate = getAccountLockedTemplate(
						`${user.firstName} ${user.lastName}`,
						30, // lock duration in minutes
						unlockTimeFormatted,
					);

					await sendEmail({
						to: email,
						subject:
							'🔐 Alerte de sécurité : Compte temporairement verrouillé - MonHubImmo',
						html: emailTemplate,
					});
					logger.info('[AuthController] Account locked email sent', {
						email,
					});
				} catch (emailError) {
					logger.error(
						'[AuthController] Failed to send account locked email',
						emailError,
					);
					// Continue even if email fails - account is still locked
				}
			}

			await User.updateOne(
				{ _id: user._id },
				{ $set: updateData },
				{ runValidators: false },
			);

			// Log failed login attempt
			await logSecurityEvent({
				userId: (user._id as unknown as string).toString(),
				eventType: 'login_failure',
				req,
				metadata: {
					email,
					attemptsRemaining: Math.max(0, 5 - failedAttempts),
					reason: 'Invalid password',
				},
			});

			// Log security event
			logger.warn('[AuthController] Failed login attempt', {
				email,
				failedAttempts,
				locked: failedAttempts >= 5,
			});

			res.status(400).json({
				success: false,
				message:
					failedAttempts >= 5
						? 'Too many failed attempts. Account locked for 30 minutes.'
						: 'Invalid credentials',
			});
			return;
		}

		// Check if email is verified
		if (!user.isEmailVerified) {
			// Generate new verification code for unverified user
			const verificationCode = generateVerificationCode();
			const verificationExpires = new Date(
				Date.now() + 24 * 60 * 60 * 1000,
			);

			await User.updateOne(
				{ _id: user._id },
				{
					$set: {
						emailVerificationCode: verificationCode,
						emailVerificationExpires: verificationExpires,
					},
				},
				{ runValidators: false },
			);

			try {
				const emailTemplate = getVerificationCodeTemplate(
					`${user.firstName} ${user.lastName}`,
					verificationCode,
				);

				await sendEmail({
					to: email,
					subject: `${verificationCode} est votre code de vérification - MonHubImmo`,
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
				logger.error(
					'[AuthController] Email sending error',
					emailError,
				);
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

		// Successful login - reset failed attempts and lock
		await User.updateOne(
			{ _id: user._id },
			{
				$set: {
					failedLoginAttempts: 0,
				},
				$unset: {
					accountLockedUntil: '',
				},
			},
			{ runValidators: false },
		);

		// Log successful login
		await logSecurityEvent({
			userId: (user._id as unknown as string).toString(),
			eventType: 'login_success',
			req,
			metadata: {
				email,
			},
		});

		// Generate token for verified user
		const token = generateToken((user._id as unknown as string).toString());
		const refreshToken = generateRefreshToken(
			(user._id as unknown as string).toString(),
		);

		// Set tokens in httpOnly cookies
		setAuthCookies(res, token, refreshToken);

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
			refreshToken, // Send refresh token
			// Add these flags to help frontend routing
			requiresProfileCompletion:
				user.userType === 'agent' && !user.profileCompleted,
		});
	} catch (error) {
		logger.error('[AuthController] Login error', error);
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
				message: 'Validation échouée',
				errors: errors.array(),
			});
			return;
		}

		const { email, code } = req.body;

		// Find pending verification - first by email and expiration
		const pendingVerification = await PendingVerification.findOne({
			email,
			emailVerificationExpires: { $gt: new Date() },
		});

		// Use timing-safe comparison for the code
		if (
			!pendingVerification ||
			!compareVerificationCode(
				code,
				pendingVerification.emailVerificationCode,
			)
		) {
			// Log failed verification attempt
			if (pendingVerification) {
				await logSecurityEvent({
					eventType: 'failed_verification_attempt',
					req,
					metadata: { email },
				});
			}

			res.status(400).json({
				success: false,
				message:
					'Code de vérification invalide ou expiré. Veuillez réessayer.',
			});
			return;
		}

		// Check if user already exists (shouldn't happen, but safety check)
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			// Clean up pending verification
			await pendingVerification.deleteOne();

			res.status(400).json({
				success: false,
				message: 'Un compte existe déjà avec cet email.',
			});
			return;
		}

		// Create real User from PendingVerification
		const newUser = new User({
			firstName: pendingVerification.firstName,
			lastName: pendingVerification.lastName,
			email: pendingVerification.email,
			password: pendingVerification.password,
			phone: pendingVerification.phone,
			userType: pendingVerification.userType,
			isEmailVerified: true,
			profileCompleted: false,
		});

		await newUser.save();

		// Handle identity card move from temp to permanent location
		if (pendingVerification.identityCardTempKey) {
			try {
				const s3Service = new S3Service();
				const userId = (newUser._id as unknown as string).toString();

				// Extract file extension from temp key
				const ext =
					pendingVerification.identityCardTempKey.split('.').pop() ||
					'jpg';
				const permanentKey = `users/${userId}/identity-card.${ext}`;

				// Copy from temp to permanent location
				const result = await s3Service.copyObject(
					pendingVerification.identityCardTempKey,
					permanentKey,
				);

				// Update user's professionalInfo with permanent identity card
				newUser.professionalInfo = {
					...newUser.professionalInfo,
					identityCard: {
						url: result.url,
						key: result.key,
						uploadedAt: new Date(),
					},
				};
				await newUser.save();

				// Delete temp file (cleanup)
				await s3Service.deleteImage(
					pendingVerification.identityCardTempKey,
				);
				logger.debug(
					'[AuthController] Identity card moved from temp to permanent',
					result.key,
				);
			} catch (s3Error) {
				logger.error(
					'[AuthController] Failed to move identity card',
					s3Error,
				);
				// Don't fail the entire verification if S3 operations fail
				// User can re-upload identity card later
			}
		}

		// Delete pending verification (cleanup)
		await pendingVerification.deleteOne();

		// Log successful email verification
		await logSecurityEvent({
			userId: (newUser._id as unknown as string).toString(),
			eventType: 'email_verified',
			req,
			metadata: { email: newUser.email },
		});

		// Generate login token
		const loginToken = generateToken(
			(newUser._id as unknown as string).toString(),
		);
		const loginRefreshToken = generateRefreshToken(
			(newUser._id as unknown as string).toString(),
		);

		// Set tokens in httpOnly cookies
		setAuthCookies(res, loginToken, loginRefreshToken);

		res.json({
			success: true,
			message:
				'Email vérifié avec succès. Vous êtes maintenant connecté.',
			user: {
				_id: newUser._id,
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
				phone: newUser.phone,
				userType: newUser.userType,
				isEmailVerified: newUser.isEmailVerified,
				profileImage: newUser.profileImage,
				profileCompleted: newUser.profileCompleted,
				professionalInfo: newUser.professionalInfo,
			},
			token: loginToken,
			refreshToken: loginRefreshToken,
			requiresProfileCompletion:
				newUser.userType === 'agent' && !newUser.profileCompleted,
		});
	} catch (error) {
		logger.error('[AuthController] Email verification error', error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur interne',
		});
	}
};

// Resend verification code - works with PendingVerification
export const resendVerificationCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			res.status(400).json({
				success: false,
				message: 'Échec de validation',
				errors: errors.array(),
			});
			return;
		}

		const { email } = req.body;

		// Check if user is already verified
		const existingUser = await User.findOne({ email });
		if (existingUser && existingUser.isEmailVerified) {
			res.status(400).json({
				success: false,
				message: "L'email est déjà vérifié",
			});
			return;
		}

		// Find pending verification
		const pendingVerification = await PendingVerification.findOne({
			email,
		});
		if (!pendingVerification) {
			res.status(404).json({
				success: false,
				message:
					'Aucune inscription en attente de vérification trouvée',
			});
			return;
		}

		// Generate new verification code
		const verificationCode = generateVerificationCode();
		const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

		// Update pending verification
		await PendingVerification.updateOne(
			{ _id: pendingVerification._id },
			{
				$set: {
					emailVerificationCode: verificationCode,
					emailVerificationExpires: verificationExpires,
				},
			},
		);

		// Send verification email
		try {
			const emailTemplate = getVerificationCodeTemplate(
				`${pendingVerification.firstName} ${pendingVerification.lastName}`,
				verificationCode,
			);

			await sendEmail({
				to: email,
				subject: `${verificationCode} est votre code de vérification - MonHubImmo`,
				html: emailTemplate,
			});
		} catch (emailError) {
			logger.error('[AuthController] Email sending error', emailError);
			res.status(500).json({
				success: false,
				message: "Échec de l'envoi de l'email de vérification",
			});
			return;
		}

		res.json({
			success: true,
			message: 'Code de vérification renvoyé avec succès',
		});
	} catch (error) {
		logger.error('[AuthController] Resend verification error', error);
		res.status(500).json({
			success: false,
			message: 'Erreur serveur interne',
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
		const resetCode = generateVerificationCode();
		const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

		// Update user with reset code (atomic without full validation)
		await User.updateOne(
			{ _id: user._id },
			{
				$set: {
					passwordResetCode: resetCode,
					passwordResetExpires: resetExpires,
				},
			},
			{ runValidators: false },
		);

		// Send password reset email
		try {
			const emailTemplate = getPasswordResetTemplate(
				`${user.firstName} ${user.lastName}`,
				resetCode,
			);

			await sendEmail({
				to: email,
				subject: `${resetCode} est votre code de réinitialisation - MonHubImmo`,
				html: emailTemplate,
			});

			// Log password reset request
			await logSecurityEvent({
				userId: (user._id as unknown as string).toString(),
				eventType: 'password_reset_request',
				req,
				metadata: { email },
			});

			res.json({
				success: true,
				message:
					'Password reset code has been sent to your email address.',
			});
		} catch (emailError) {
			logger.error('[AuthController] Email sending error', emailError);
			// Clear the reset code if email fails (atomic update)
			await User.updateOne(
				{ _id: user._id },
				{ $unset: { passwordResetCode: '', passwordResetExpires: '' } },
				{ runValidators: false },
			);

			res.status(500).json({
				success: false,
				message:
					'Failed to send password reset email. Please try again.',
			});
		}
	} catch (error) {
		if (error instanceof mongoose.Error.ValidationError) {
			logger.error(
				'[AuthController] Forgot password validation error (Mongoose)',
				error,
			);
			res.status(400).json({
				success: false,
				message: 'Validation failed',
				errors: Object.values(error.errors).map((e) => ({
					field: e.path,
					message: e.message,
				})),
			});
			return;
		}

		logger.error('[AuthController] Forgot password error', error);
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

		// Find user by email with unexpired reset code
		const user = await User.findOne({
			email,
			passwordResetExpires: { $gt: new Date() },
		}).select('+passwordResetCode +password +passwordHistory');

		// Use timing-safe comparison for the code
		if (!user || !compareVerificationCode(code, user.passwordResetCode)) {
			res.status(400).json({
				success: false,
				message: 'Invalid or expired reset code',
			});
			return;
		}

		// Check if new password was used in the last 5 passwords
		const inHistory = await isPasswordInHistory(
			newPassword,
			user.passwordHistory || [],
		);
		if (inHistory) {
			res.status(400).json({
				success: false,
				message:
					'Cannot reuse any of your last 5 passwords. Please choose a different password.',
			});
			return;
		}

		// Update password history before changing password
		if (user.password) {
			user.passwordHistory = updatePasswordHistory(
				user.password,
				user.passwordHistory || [],
			);
		}

		// Update password and clear reset fields
		user.password = newPassword; // This will be hashed by your User model pre-save hook
		user.passwordResetCode = undefined;
		user.passwordResetExpires = undefined;
		await user.save();

		// Log successful password reset
		await logSecurityEvent({
			userId: (user._id as unknown as string).toString(),
			eventType: 'password_reset_success',
			req,
			metadata: { email },
		});

		// Generate login token for immediate login after password reset
		const loginToken = generateToken(
			(user._id as unknown as string).toString(),
		);
		const loginRefreshToken = generateRefreshToken(
			(user._id as unknown as string).toString(),
		);

		// Set tokens in httpOnly cookies
		setAuthCookies(res, loginToken, loginRefreshToken);

		// Send confirmation email
		try {
			const emailTemplate = getPasswordResetConfirmationTemplate(
				`${user.firstName} ${user.lastName}`,
			);

			await sendEmail({
				to: email,
				subject: 'Mot de passe réinitialisé avec succès - MonHubImmo',
				html: emailTemplate,
			});
		} catch (emailError) {
			logger.error(
				'[AuthController] Confirmation email error',
				emailError,
			);
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
			refreshToken: loginRefreshToken,
		});
	} catch (error) {
		logger.error('[AuthController] Reset password error', error);
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
		logger.error('[AuthController] Get profile error', error);
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

		const { firstName, lastName, phone, profileImage, professionalInfo } =
			req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		// Sanitize and update basic info
		if (firstName !== undefined) user.firstName = sanitizeString(firstName);
		if (lastName !== undefined) user.lastName = sanitizeString(lastName);
		if (phone !== undefined) user.phone = sanitizePhone(phone);
		if (profileImage !== undefined) {
			// Don't sanitize URLs - just trim whitespace
			user.profileImage = profileImage.trim();
		}

		// Update professional info for agents
		if (user.userType === 'agent' && professionalInfo) {
			// Initialize professionalInfo if it doesn't exist
			if (!user.professionalInfo) {
				user.professionalInfo = {};
			}

			// Only update fields that are provided (not undefined)
			if (professionalInfo.city !== undefined) {
				user.professionalInfo.city = sanitizeString(
					professionalInfo.city,
				);
			}
			if (professionalInfo.postalCode !== undefined) {
				user.professionalInfo.postalCode = sanitizeString(
					professionalInfo.postalCode,
				);
			}
			if (professionalInfo.network !== undefined) {
				user.professionalInfo.network = sanitizeString(
					professionalInfo.network,
				);
			}
			if (professionalInfo.siretNumber !== undefined) {
				user.professionalInfo.siretNumber = sanitizeString(
					professionalInfo.siretNumber,
				);
			}
			if (professionalInfo.personalPitch !== undefined) {
				user.professionalInfo.personalPitch = sanitizeString(
					professionalInfo.personalPitch,
				);
			}
			if (
				professionalInfo.coveredCities &&
				Array.isArray(professionalInfo.coveredCities)
			) {
				user.professionalInfo.coveredCities =
					professionalInfo.coveredCities.map((city: string) =>
						sanitizeString(city),
					);
			}
			if (professionalInfo.interventionRadius !== undefined) {
				user.professionalInfo.interventionRadius =
					professionalInfo.interventionRadius;
			}
			if (professionalInfo.yearsExperience !== undefined) {
				user.professionalInfo.yearsExperience =
					professionalInfo.yearsExperience;
			}
			if (professionalInfo.mandateTypes !== undefined) {
				user.professionalInfo.mandateTypes =
					professionalInfo.mandateTypes;
			}
			if (professionalInfo.collaborateWithAgents !== undefined) {
				user.professionalInfo.collaborateWithAgents =
					professionalInfo.collaborateWithAgents;
			}
			if (professionalInfo.shareCommission !== undefined) {
				user.professionalInfo.shareCommission =
					professionalInfo.shareCommission;
			}
			if (professionalInfo.independentAgent !== undefined) {
				user.professionalInfo.independentAgent =
					professionalInfo.independentAgent;
			}
			if (professionalInfo.alertsEnabled !== undefined) {
				user.professionalInfo.alertsEnabled =
					professionalInfo.alertsEnabled;
			}
			if (professionalInfo.alertFrequency !== undefined) {
				user.professionalInfo.alertFrequency =
					professionalInfo.alertFrequency;
			}
			// Note: identityCard is NOT updated here - only set during initial profile completion
		}

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
				professionalInfo: user.professionalInfo,
				profileCompleted: user.profileCompleted,
			},
		});
	} catch (error) {
		logger.error('[AuthController] Update profile error', error);
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

		const { professionalInfo, profileImage, identityCard } = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		logger.info(
			'[AuthController] Complete profile request:',
			JSON.stringify({ professionalInfo, profileImage }, null, 2),
		);

		// Update professional info for agents with sanitization
		if (user.userType === 'agent' && professionalInfo) {
			const sanitizedProfessionalInfo: Record<string, unknown> = {};

			// Sanitize string fields in professionalInfo
			if (professionalInfo.city) {
				sanitizedProfessionalInfo.city = sanitizeString(
					professionalInfo.city,
				);
			}
			if (professionalInfo.postalCode) {
				sanitizedProfessionalInfo.postalCode = sanitizeString(
					professionalInfo.postalCode,
				);
			}
			if (professionalInfo.network) {
				sanitizedProfessionalInfo.network = sanitizeString(
					professionalInfo.network,
				);
			}
			if (professionalInfo.siretNumber) {
				sanitizedProfessionalInfo.siretNumber = sanitizeString(
					professionalInfo.siretNumber,
				);
			}
			if (professionalInfo.personalPitch) {
				sanitizedProfessionalInfo.personalPitch = sanitizeString(
					professionalInfo.personalPitch,
				);
			}
			if (professionalInfo.interventionRadius !== undefined) {
				sanitizedProfessionalInfo.interventionRadius =
					professionalInfo.interventionRadius;
			}
			if (professionalInfo.yearsExperience !== undefined) {
				sanitizedProfessionalInfo.yearsExperience =
					professionalInfo.yearsExperience;
			}
			if (professionalInfo.collaborateWithAgents !== undefined) {
				sanitizedProfessionalInfo.collaborateWithAgents =
					professionalInfo.collaborateWithAgents;
			}
			if (professionalInfo.shareCommission !== undefined) {
				sanitizedProfessionalInfo.shareCommission =
					professionalInfo.shareCommission;
			}
			if (professionalInfo.independentAgent !== undefined) {
				sanitizedProfessionalInfo.independentAgent =
					professionalInfo.independentAgent;
			}
			if (professionalInfo.alertsEnabled !== undefined) {
				sanitizedProfessionalInfo.alertsEnabled =
					professionalInfo.alertsEnabled;
			}
			if (professionalInfo.alertFrequency) {
				sanitizedProfessionalInfo.alertFrequency =
					professionalInfo.alertFrequency;
			}

			// Handle arrays - convert object notation to arrays if needed
			if (professionalInfo.coveredCities) {
				const cities = Array.isArray(professionalInfo.coveredCities)
					? professionalInfo.coveredCities
					: Object.values(professionalInfo.coveredCities);
				sanitizedProfessionalInfo.coveredCities = cities.map(
					(city: string) => sanitizeString(city),
				);
			}
			if (professionalInfo.mandateTypes) {
				const mandates = Array.isArray(professionalInfo.mandateTypes)
					? professionalInfo.mandateTypes
					: Object.values(professionalInfo.mandateTypes);
				sanitizedProfessionalInfo.mandateTypes = mandates;
			}

			// Merge with existing professionalInfo, but don't spread undefined values
			if (!user.professionalInfo) {
				user.professionalInfo = {};
			}
			Object.assign(user.professionalInfo, sanitizedProfessionalInfo);
		}

		// Add identity card info if provided (already sanitized URLs from S3)
		if (
			user.userType === 'agent' &&
			identityCard?.url &&
			identityCard?.key
		) {
			if (!user.professionalInfo) {
				user.professionalInfo = {};
			}
			user.professionalInfo.identityCard = {
				url: identityCard.url.trim(), // S3 URLs don't need HTML escaping
				key: identityCard.key.trim(),
				uploadedAt: new Date(),
			};
		}

		if (profileImage) {
			user.profileImage = profileImage.trim(); // URLs don't need HTML escaping
		}

		// Only mark profile as completed if required fields are present
		if (
			user.userType === 'agent' &&
			user.professionalInfo?.city &&
			user.professionalInfo?.postalCode &&
			user.professionalInfo?.network
		) {
			user.profileCompleted = true;
		} else if (user.userType !== 'agent') {
			// Non-agents complete profile by just submitting
			user.profileCompleted = true;
		}

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
		// Log detailed error information
		if (error instanceof mongoose.Error.ValidationError) {
			logger.error(
				'[AuthController] Validation error in completeProfile:',
				JSON.stringify(
					Object.values(error.errors).map((e) => ({
						field: e.path,
						message: e.message,
						value: 'value' in e ? e.value : undefined,
					})),
					null,
					2,
				),
			);
			res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: Object.values(error.errors).map((e) => ({
					field: e.path,
					message: e.message,
				})),
			});
			return;
		}
		logger.error('[AuthController] Complete profile error', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Get all agents for public listing
export const getAllAgents = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const agents = await User.find({
			userType: 'agent',
			profileCompleted: true,
			isEmailVerified: true,
		})
			.select(
				'firstName lastName email phone profileImage professionalInfo createdAt',
			)
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			data: agents,
		});
	} catch (error) {
		logger.error('[AuthController] Error fetching agents', error);
		res.status(500).json({ success: false, message: 'Server error' });
	}
};

// Update search preferences
export const updateSearchPreferences = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { preferredRadius, lastSearchLocations } = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		// Update search preferences
		if (!user.searchPreferences) {
			user.searchPreferences = {};
		}

		if (preferredRadius !== undefined) {
			user.searchPreferences.preferredRadius = preferredRadius;
		}

		if (lastSearchLocations !== undefined) {
			user.searchPreferences.lastSearchLocations = lastSearchLocations;
		}

		await user.save();

		res.json({
			success: true,
			message: 'Search preferences updated successfully',
			searchPreferences: user.searchPreferences,
		});
	} catch (error) {
		logger.error('[AuthController] Update search preferences error', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

// Refresh access token using refresh token
export const refreshAccessToken = async (req: Request, res: Response) => {
	try {
		// Get refresh token from cookies or request body
		let refreshToken = getRefreshTokenFromCookies(req.cookies);

		if (!refreshToken) {
			refreshToken = req.body.refreshToken;
		}

		if (!refreshToken) {
			return res.status(400).json({
				success: false,
				message: 'Refresh token is required',
			});
		}

		// Verify refresh token
		const decoded = verifyRefreshToken(refreshToken);

		// Generate new access token
		const newAccessToken = generateToken(decoded.userId);

		// Set new access token in cookie
		setAccessTokenCookie(res, newAccessToken);

		res.json({
			success: true,
			token: newAccessToken,
		});
	} catch (error) {
		logger.error('[AuthController] Refresh token error', error);
		res.status(401).json({
			success: false,
			message: 'Invalid or expired refresh token',
		});
	}
};

// Logout - clears auth cookies
export const logout = async (req: Request, res: Response) => {
	try {
		// Get tokens from cookies before clearing them
		const accessToken = getAccessTokenFromCookies(req.cookies);
		const refreshToken = getRefreshTokenFromCookies(req.cookies);

		// Extract userId from token if available (before blacklisting)
		let userId: string | undefined;
		if (accessToken) {
			try {
				const decoded = jwt.verify(
					accessToken,
					process.env.JWT_SECRET || '',
				) as { id: string };
				userId = decoded.id;
			} catch {
				// Token might be invalid, continue with logout
			}
		}

		// Blacklist both tokens (if they exist)
		// Access token: 15 minutes = 900 seconds
		// Refresh token: 30 days = 2592000 seconds
		if (accessToken) {
			await blacklistToken(accessToken, 900);
		}
		if (refreshToken) {
			await blacklistToken(refreshToken, 2592000);
		}

		// Log logout event if we have userId
		if (userId) {
			await logSecurityEvent({
				userId,
				eventType: 'logout',
				req,
			});
		}

		// Clear auth cookies
		clearAuthCookies(res);

		res.json({
			success: true,
			message: 'Logged out successfully',
		});
	} catch (error) {
		logger.error('[AuthController] Logout error', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};

/**
 * Change password for authenticated users
 * Enforces password history (cannot reuse last 5 passwords)
 */
export const changePassword = async (
	req: AuthRequest,
	res: Response,
): Promise<void> => {
	try {
		const { currentPassword, newPassword } = req.body;

		// Validate inputs
		if (!currentPassword || !newPassword) {
			res.status(400).json({
				success: false,
				message: 'Current password and new password are required',
			});
			return;
		}

		// Find user with password and password history
		const user = await User.findById(req.userId).select(
			'+password +passwordHistory',
		);
		if (!user) {
			res.status(404).json({
				success: false,
				message: 'User not found',
			});
			return;
		}

		// Verify current password
		const isCurrentPasswordValid =
			await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			res.status(400).json({
				success: false,
				message: 'Current password is incorrect',
			});
			return;
		}

		// Check if new password was used in the last 5 passwords
		const inHistory = await isPasswordInHistory(
			newPassword,
			user.passwordHistory || [],
		);
		if (inHistory) {
			res.status(400).json({
				success: false,
				message:
					'Cannot reuse any of your last 5 passwords. Please choose a different password.',
			});
			return;
		}

		// Update password history before changing password
		if (user.password) {
			user.passwordHistory = updatePasswordHistory(
				user.password,
				user.passwordHistory || [],
			);
		}

		// Update password (will be hashed by pre-save hook)
		user.password = newPassword;
		await user.save();

		// Log password change
		await logSecurityEvent({
			userId: (user._id as unknown as string).toString(),
			eventType: 'password_change',
			req,
			metadata: { email: user.email },
		});

		res.json({
			success: true,
			message: 'Password changed successfully',
		});
	} catch (error) {
		logger.error('[AuthController] Change password error', error);
		res.status(500).json({
			success: false,
			message: 'Internal server error',
		});
	}
};
