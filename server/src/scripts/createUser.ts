import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User';
import { sendEmail, getPasswordResetTemplate, getAccountValidatedTemplate, generateVerificationCode } from '../utils/emailService';
import { logger } from '../utils/logger';

type Args = Record<string, any>;

const parseArgs = (): Args => {
  const args = process.argv.slice(2);
  const out: Args = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const k = a.replace(/^--/, '');
      const v = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
      i += v === 'true' || v === 'false' ? 0 : 1;
      // assign
      (out as any)[k] = v === 'true' ? true : v === 'false' ? false : v;
    }
  }
  return out;
};

const main = async () => {
  const args = parseArgs();

  if (!args.email) {
    console.log('Usage: ts-node src/scripts/createUser.ts --email user@example.com [--firstName John] [--lastName Doe] [--userType agent|apporteur] [--password secret] [--validate true] [--sendInvite true|false]');
    process.exit(1);
  }

  const mongo = process.env.MONGO_URI || 'mongodb://localhost:27017/monhubimmo';
  logger.info('[createUser] Connecting to MongoDB...');
  await mongoose.connect(mongo, { dbName: process.env.MONGO_DB || undefined } as any);

  const email = String(args.email).toLowerCase();
  const firstName = String(args.firstName || '');
  const lastName = String(args.lastName || '');
  const userType = String(args.userType || 'apporteur');
  const password = args.password ? String(args.password) : undefined;
  const isValidated = args.validate === true || String(args.validate) === 'true';
  const sendInvite = typeof args.sendInvite === 'undefined' ? !password : args.sendInvite === true || String(args.sendInvite) === 'true';

  const existing = await User.findOne({ email });
  if (existing) {
    logger.error('[createUser] User already exists:', email);
    process.exit(1);
  }

  const newUser = new User({
    email,
    firstName,
    lastName,
    userType,
    isValidated,
    professionalInfo: {},
    ...(password ? { password } : {}),
  } as any);

  if (sendInvite && !password) {
    const code = generateVerificationCode();
    newUser.passwordResetCode = code;
    newUser.passwordResetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
  }

  await newUser.save();
  logger.info('[createUser] Created user:', newUser.email, 'id=', (newUser._id as any).toString());

  // Send invite if requested
  if (sendInvite && !password) {
    try {
      const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/reset-password?email=${encodeURIComponent(newUser.email)}`;
      const html = getPasswordResetTemplate(`${newUser.firstName} ${newUser.lastName}`, String(newUser.passwordResetCode), inviteUrl);
      await sendEmail({ to: newUser.email, subject: 'MonHubImmo - Code pour définir votre mot de passe', html });
      logger.info('[createUser] Invite email sent to', newUser.email);
    } catch (err) {
      logger.error('[createUser] Failed to send invite email', (err as Error).message);
    }
  }

  // If validated flag provided send validated email
  if (isValidated) {
    try {
      const html = getAccountValidatedTemplate(`${newUser.firstName} ${newUser.lastName}`, newUser.email);
      await sendEmail({ to: newUser.email, subject: 'Votre compte MonHubImmo est validé', html });
      logger.info('[createUser] Validation email sent to', newUser.email);
    } catch (err) {
      logger.error('[createUser] Failed to send validation email', (err as Error).message);
    }
  }

  logger.info('[createUser] Done.');
  await mongoose.disconnect();
  process.exit(0);
};

main().catch((err) => {
  // Log full error for debugging in scripts
  console.error('[createUser] Fatal error:', err);
  logger.error('[createUser] Fatal error:', (err as Error).message);
  process.exit(1);
});
