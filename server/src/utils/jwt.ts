import jwt from 'jsonwebtoken';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET) {
	throw new Error('JWT_SECRET must be defined in environment variables');
}

if (!JWT_REFRESH_SECRET) {
	throw new Error(
		'JWT_REFRESH_SECRET must be defined in environment variables',
	);
}

// Short-lived access token (15 minutes)
const ACCESS_TOKEN_EXPIRE = '15m';
// Long-lived refresh token (30 days)
const REFRESH_TOKEN_EXPIRE = '30d';

// Common JWT options
const SIGN_OPTIONS: SignOptions = {
	algorithm: 'HS256',
};

const VERIFY_OPTIONS: VerifyOptions = {
	algorithms: ['HS256'],
};

export const generateToken = (userId: string): string => {
	const options: SignOptions = {
		...SIGN_OPTIONS,
		expiresIn: ACCESS_TOKEN_EXPIRE,
	};
	return jwt.sign({ userId }, JWT_SECRET, options);
};

export const generateRefreshToken = (userId: string): string => {
	const options: SignOptions = {
		...SIGN_OPTIONS,
		expiresIn: REFRESH_TOKEN_EXPIRE,
	};
	return jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, options);
};

export const verifyToken = (token: string): { userId: string } => {
	return jwt.verify(token, JWT_SECRET, VERIFY_OPTIONS) as { userId: string };
};

export const verifyRefreshToken = (
	token: string,
): { userId: string; type: string } => {
	const decoded = jwt.verify(token, JWT_REFRESH_SECRET, VERIFY_OPTIONS) as {
		userId: string;
		type: string;
	};

	// Ensure it's actually a refresh token
	if (decoded.type !== 'refresh') {
		throw new Error('Invalid token type');
	}

	return decoded;
};
