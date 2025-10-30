import bcrypt from 'bcryptjs';

/**
 * Check if a password has been used in the user's password history
 * @param newPassword - The new password to check (plain text)
 * @param passwordHistory - Array of previous password hashes with timestamps
 * @returns Promise<boolean> - true if password was used before, false otherwise
 */
export const isPasswordInHistory = async (
	newPassword: string,
	passwordHistory: Array<{ hash: string; changedAt: Date }> = [],
): Promise<boolean> => {
	// Check each historical password hash
	for (const historyEntry of passwordHistory) {
		const matches = await bcrypt.compare(newPassword, historyEntry.hash);
		if (matches) {
			return true; // Password was used before
		}
	}
	return false; // Password is not in history
};

/**
 * Add current password hash to history and maintain last 5 entries
 * @param currentPasswordHash - The current password hash to add to history
 * @param existingHistory - Existing password history array
 * @returns Updated password history (max 5 entries, newest first)
 */
export const updatePasswordHistory = (
	currentPasswordHash: string,
	existingHistory: Array<{ hash: string; changedAt: Date }> = [],
): Array<{ hash: string; changedAt: Date }> => {
	// Add current password to history
	const updatedHistory = [
		{
			hash: currentPasswordHash,
			changedAt: new Date(),
		},
		...existingHistory,
	];

	// Keep only last 5 passwords
	return updatedHistory.slice(0, 5);
};
