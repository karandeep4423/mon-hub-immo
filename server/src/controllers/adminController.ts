// controllers/adminController.ts
import { User } from '../models/User';
import { Property } from '../models/Property'; // ou ton modèle d'annonces
import { Collaboration } from '../models/Collaboration'; // idem pour collaborations
import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';
import { SecurityLog } from '../models/SecurityLog';
import crypto from 'crypto';
import { logSecurityEvent } from '../utils/securityLogger';
import { sendEmail, getAccountValidatedTemplate, getInviteTemplate } from '../utils/emailService';

export const getAdminUsers = async (req: Request, res: Response) => {
  // Lecture des filtres via req.query
  const { name, userType, network, isValidated, isBlocked } = req.query;
  // Construction dynamique des filtres
  let filter: any = {};
    if (typeof name === "string" && name.trim() !== "") {
    filter.$or = [
        { firstName: new RegExp(name, "i") },
        { lastName: new RegExp(name, "i") }
    ];
    }

  if (userType) filter.userType = userType;
  if (isValidated !== undefined) filter.isValidated = isValidated === 'true';
  if (isBlocked !== undefined) filter.isBlocked = isBlocked === 'true';
  if (network) filter["professionalInfo.network"] = network;

  // On récupère les users filtrés
  const users = await User.find(filter).lean();

  // Calcul statistiques par user
  const userIds = users.map(u => u._id);
  // Annonces
  const propsCounts = await Property.aggregate([
    { $match: { agentId: { $in: userIds } } },
    { $group: { _id: "$agentId", count: { $sum: 1 } } }
  ]);
  // Collabs actives/clôturées
  const collabCounts = await Collaboration.aggregate([
    { $match: { agentId: { $in: userIds } } },
    { $group: {
        _id: "$agentId",
        active: { $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] }},
        closed: { $sum: { $cond: [{ $eq: ["$status", "closed"] }, 1, 0] }},
      }
    }
  ]);
  // Connection counts (login successes) from security logs
  const connectionCounts = await SecurityLog.aggregate([
    { $match: { userId: { $in: userIds }, eventType: 'login_success' } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
  ]);
  // On map les stats sur chaque user
  // Build lookup maps keyed by string userId to avoid ObjectId/string mismatches
  const propsMap: Record<string, number> = {};
  for (const p of propsCounts) {
    const k = String(p._id);
    propsMap[k] = p.count || 0;
  }
  const collabMapActive: Record<string, number> = {};
  const collabMapClosed: Record<string, number> = {};
  for (const c of collabCounts) {
    const k = String(c._id);
    collabMapActive[k] = c.active || 0;
    collabMapClosed[k] = c.closed || 0;
  }
  const connMap: Record<string, number> = {};
  for (const cc of connectionCounts) {
    const k = String(cc._id);
    connMap[k] = cc.count || 0;
  }

  const usersWithStats = users.map(u => {
    const uid = String((u as any)._id);
    return ({
      ...u,
      propertiesCount: propsMap[uid] || 0,
      collaborationsActive: collabMapActive[uid] || 0,
      collaborationsClosed: collabMapClosed[uid] || 0,
      connectionsCount: connMap[uid] || 0,
      lastActive: (u as any).lastSeen ? (new Date((u as any).lastSeen)).toISOString() : undefined,
      // derive status for admin UI
      status: ((u as any).isBlocked ? 'blocked' : (u as any).isValidated ? 'active' : 'pending'),
    });
  });

  res.json(usersWithStats);
};

export const validateUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  const { value } = req.body;
  const adminId = req.userId;

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  user.isValidated = !!value;
  user.validatedAt = value ? new Date() : undefined;
  user.validatedBy = value
    ? (adminId ? new mongoose.Types.ObjectId(adminId) : undefined)
    : undefined;
  await user.save();

  // Log security event for validation/unvalidation
  await logSecurityEvent({
    userId: (user._id as unknown as string).toString(),
    eventType: 'account_validated',
    req,
    metadata: { validatedBy: adminId, value: !!value },
  });
  // If user validated -> send confirmation email
  if (value) {
    try {
      const emailHtml = getAccountValidatedTemplate(
        `${user.firstName} ${user.lastName}`,
        user.email,
      );
      await sendEmail({
        to: user.email,
        subject: 'Votre compte MonHubImmo est validé',
        html: emailHtml,
      });
    } catch (emailError) {
      // Log but don't fail the response
      await logSecurityEvent({
        userId: (user._id as unknown as string).toString(),
        eventType: 'account_validated',
        req,
        metadata: { error: String(emailError) },
      });
    }
  }

  res.json({ success: true, user });
};

// Block a user (admin)
export const blockUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });
  const adminId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    user.isBlocked = true;
    user.blockedAt = new Date();
    user.blockedBy = adminId ? new mongoose.Types.ObjectId(adminId) : undefined;
    await user.save();

    // log security event
    await logSecurityEvent({
      userId: (userId as unknown as string),
      eventType: 'account_blocked',
      req,
      metadata: { blockedBy: adminId },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to block user', details: (error as Error).message });
  }
};

// Unblock a user (admin)
export const unblockUser = async (req: AuthRequest, res: Response) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });
  const adminId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    user.isBlocked = false;
    user.blockedAt = undefined;
    user.blockedBy = undefined;
    await user.save();

    // log security event
    await logSecurityEvent({
      userId: (userId as unknown as string),
      eventType: 'account_unblocked',
      req,
      metadata: { unblockedBy: adminId },
    });

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unblock user', details: (error as Error).message });
  }
};

// Get detailed user profile for admin (with simple related counts)
export const getAdminUserProfile = async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  const user = await User.findById(userId).lean();
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

  // related counts
  const propertiesCount = await Property.countDocuments({ agentId: user._id });
  const collaborationsCount = await Collaboration.countDocuments({ agentId: user._id });

  res.json({ ...user, propertiesCount, collaborationsCount });
};

// Create an admin user (basic)
export const createAdminUser = async (req: AuthRequest, res: Response) => {
  try {
    const payload = req.body || {};
    // Minimal required fields: email
    if (!payload.email) return res.status(400).json({ error: 'Email required' });

    const existing = await User.findOne({ email: payload.email });
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const newUser = new User({
      firstName: payload.firstName || '',
      lastName: payload.lastName || '',
      email: payload.email,
      userType: payload.userType || 'apporteur',
      isValidated: payload.isValidated ?? false,
      validatedAt: payload.isValidated ? new Date() : undefined,
      validatedBy: payload.isValidated && req.userId ? new mongoose.Types.ObjectId(req.userId) : undefined,
      professionalInfo: payload.professionalInfo || undefined,
      phone: payload.phone || undefined,
      profileImage: payload.profileImage || undefined,
      // If admin provided a password at creation time, use it; otherwise we'll set an invite token below
      ...(payload.password ? { password: payload.password } : {}),
    });
    // Determine invite behavior
    const sendInvite = payload.sendInvite === undefined ? !payload.password : !!payload.sendInvite;
    if (sendInvite && !payload.password) {
      const token = crypto.randomBytes(24).toString('hex');
      newUser.passwordResetCode = token;
      newUser.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
    }

    await newUser.save();

    // If we created an invite token, send invite email
    if (sendInvite && !payload.password) {
      try {
        const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/set-password?token=${newUser.passwordResetCode}&email=${encodeURIComponent(newUser.email)}`;
        const html = getInviteTemplate(`${newUser.firstName} ${newUser.lastName}`, inviteUrl);
        await sendEmail({ to: newUser.email, subject: 'Invitation MonHubImmo - Définissez votre mot de passe', html });
        await logSecurityEvent({ userId: (newUser._id as unknown as string).toString(), eventType: 'invite_sent', req, metadata: {} });
      } catch (err) {
        await logSecurityEvent({ userId: (newUser._id as unknown as string).toString(), eventType: 'invite_sent', req, metadata: { error: String(err) } });
      }
    }

    const adminId = req.userId;

    if (newUser.isValidated) {
      try {
        // send account validated email
        const emailHtml = getAccountValidatedTemplate(
          `${newUser.firstName} ${newUser.lastName}`,
          newUser.email,
        );
        await sendEmail({
          to: newUser.email,
          subject: 'Votre compte MonHubImmo est validé',
          html: emailHtml,
        });
      } catch (emailError) {
        // log the issue but continue
        await logSecurityEvent({
          userId: (newUser._id as unknown as string).toString(),
          eventType: 'account_validated',
          req,
          metadata: { error: String(emailError) },
        });
      }

      // Log validation event as admin validated the account upon creation
      await logSecurityEvent({
        userId: (newUser._id as unknown as string).toString(),
        eventType: 'account_validated',
        req,
        metadata: { validatedBy: adminId, via: 'admin_create' },
      });
    }
    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', details: (err as Error).message });
  }
};

// Update an admin user
export const updateAdminUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  const payload = req.body || {};
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });

    Object.assign(user, payload);
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user', details: (err as Error).message });
  }
};

// Delete admin user
export const deleteAdminUser = async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) return res.status(400).json({ error: 'Missing user id' });

  try {
    await User.findByIdAndDelete(userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', details: (err as Error).message });
  }
};

// Import users from CSV (expects middleware to provide `req.file.buffer`)
export const importUsersFromCSV = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - multer file
    const file = (req as any).file;
    if (!file || !file.buffer) return res.status(400).json({ error: 'No CSV file uploaded' });

    // Admin flags available on form body
    const sendInviteDefault = req.body.sendInviteDefault === 'true' || req.body.sendInviteDefault === true;
    const validateDefault = req.body.validateDefault === 'true' || req.body.validateDefault === true;
    const defaultUserType = (req.body.defaultUserType as string) || 'apporteur';
    const updateIfExists = req.body.updateIfExists === 'true' || req.body.updateIfExists === true;

    const text = file.buffer.toString('utf8');
    const lines = text.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    if (lines.length === 0) return res.status(400).json({ error: 'CSV empty' });

    const header = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
    // accept common headers; optional ones included
    const required = ['email', 'firstname', 'lastname'];

    // Result bookkeeping
    const created: any[] = [];
    const updated: any[] = [];
    const skipped: Array<{ line: number; reason: string }> = [];
    const errors: string[] = [];

    // Helper: basic email validation
    const isValidEmail = (e: string) => typeof e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c: string) => c.trim());
      if (cols.length === 0) continue;
      const row: any = {};
      header.forEach((h: string, idx: number) => { row[h] = cols[idx] ?? ''; });

      // Normalize fields
      const email = (row.email || '').toLowerCase();
      if (!email || !isValidEmail(email)) {
        skipped.push({ line: i + 1, reason: 'Invalid or missing email' });
        continue;
      }

      // Check for existing user
      let existing = await User.findOne({ email });
      if (existing && !updateIfExists) {
        skipped.push({ line: i + 1, reason: 'User already exists' });
        continue;
      }

      // Build user object
      const userPayload: any = {
        firstName: row.firstname || '',
        lastName: row.lastname || '',
        email,
        userType: row.usertype || defaultUserType,
        phone: row.phone || undefined,
        professionalInfo: row.network ? { network: row.network } : undefined,
        isValidated: typeof row.isvalidated !== 'undefined' ? (String(row.isvalidated).toLowerCase() === 'true') : validateDefault,
      };

      // If admin provided password in CSV (not recommended), set it; it will be hashed by pre-save hook
      if (row.password) {
        userPayload.password = row.password;
      }

      // If user exists and updateIfExists true -> update fields
      if (existing && updateIfExists) {
        Object.assign(existing, userPayload);
        await existing.save();
        updated.push({ id: existing._id, email });
        // If admin wants to invite on update and no password present, set invite
        const sendInvite = typeof row.sendinvite !== 'undefined' ? (String(row.sendinvite).toLowerCase() === 'true') : sendInviteDefault;
        if (sendInvite && !existing.password) {
          const token = crypto.randomBytes(24).toString('hex');
          existing.passwordResetCode = token;
          existing.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
          await existing.save();
          // Send invite email
          try {
            const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/set-password?token=${existing.passwordResetCode}&email=${encodeURIComponent(existing.email)}`;
            const html = getInviteTemplate(`${existing.firstName} ${existing.lastName}`, inviteUrl);
            await sendEmail({ to: existing.email, subject: 'Invitation MonHubImmo - Définissez votre mot de passe', html });
            await logSecurityEvent({ userId: (existing._id as unknown as string).toString(), eventType: 'invite_sent', req, metadata: {} });
          } catch (err) {
            errors.push(`Failed to send invite to ${existing.email}: ${(err as Error).message}`);
          }
        }
        continue;
      }

      // Otherwise, create new user
      const u = new User(userPayload);

      const sendInvite = typeof row.sendinvite !== 'undefined' ? (String(row.sendinvite).toLowerCase() === 'true') : sendInviteDefault;
      // If we should send an invite and the admin did not provide a password
      if (sendInvite && !row.password) {
        const token = crypto.randomBytes(24).toString('hex');
        u.passwordResetCode = token;
        u.passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      }

      // If row explicitly sets isvalidated = true, mark validated (admin explicit validation)
      // If validateDefault true (admin opted to auto-validate), set validated
      u.isValidated = userPayload.isValidated;

      try {
        await u.save();
        created.push({ id: u._id, email: u.email });

        // Send invite if configured
        if (sendInvite) {
          try {
            const inviteUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/set-password?token=${u.passwordResetCode}&email=${encodeURIComponent(u.email)}`;
            const html = getInviteTemplate(`${u.firstName} ${u.lastName}`, inviteUrl);
            await sendEmail({ to: u.email, subject: 'Invitation MonHubImmo - Définissez votre mot de passe', html });
            await logSecurityEvent({ userId: (u._id as unknown as string).toString(), eventType: 'invite_sent', req, metadata: {} });
          } catch (err) {
            errors.push(`Failed to send invite to ${u.email}: ${(err as Error).message}`);
          }
        }
      } catch (err) {
        skipped.push({ line: i + 1, reason: `DB error: ${(err as Error).message}` });
      }
    }

    res.json({ success: true, createdCount: created.length, updatedCount: updated.length, skipped, errors, created });
  } catch (err) {
    res.status(500).json({ error: 'Failed to import CSV', details: (err as Error).message });
  }
};

// Simple aggregated stats for admin dashboard
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    // Users (agents) stats
    const agentsTotal = await User.countDocuments({ userType: 'agent' });
    const agentsActive = await User.countDocuments({ userType: 'agent', isValidated: true, isBlocked: { $ne: true } });
    const agentsPending = await User.countDocuments({ userType: 'agent', isValidated: false, isBlocked: { $ne: true } });
    const agentsUnsubscribed = await User.countDocuments({ userType: 'agent', isBlocked: true });
    // Apporteurs (lead providers)
    const apporteursTotal = await User.countDocuments({ userType: 'apporteur' });
    const apporteursActive = await User.countDocuments({ userType: 'apporteur', isValidated: true, isBlocked: { $ne: true } });
    const apporteursPending = await User.countDocuments({ userType: 'apporteur', isValidated: false, isBlocked: { $ne: true } });

    // Properties
    const propertiesActive = await Property.countDocuments({ status: 'active' });
    const propertiesArchived = await Property.countDocuments({ status: 'archived' });
    // Properties currently in collaboration (distinct postIds from Collaboration)
    const propertiesInCollabDistinct = await Collaboration.distinct('postId', { postType: 'Property', status: { $in: ['pending', 'accepted', 'active'] } });
    const propertiesInCollab = propertiesInCollabDistinct ? propertiesInCollabDistinct.length : 0;

    // Collaborations
    const collabOpen = await Collaboration.countDocuments({ status: { $in: ['pending', 'accepted', 'active'] } });
    const collabClosed = await Collaboration.countDocuments({ status: { $in: ['completed', 'cancelled'] } });

    // Fees total (sum of completed collaborations' commission if present)
    const feesAgg = await Collaboration.aggregate([
      { $match: { commission: { $exists: true, $ne: null }, status: { $in: ['completed'] } } },
      {
        $group: {
          _id: null,
          total: { $sum: '$commission' },
        },
      },
    ]);
    const feesTotal = feesAgg && feesAgg.length > 0 ? feesAgg[0].total : 0;

    // Top networks: group users by professionalInfo.network
    const topNetworksAgg = await User.aggregate([
      { $match: { 'professionalInfo.network': { $exists: true, $ne: '' } } },
      { $group: { _id: '$professionalInfo.network', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topNetworks = topNetworksAgg.map((r) => ({ name: r._id, count: r.count }));

    // Top regions: group properties by city or location field
    const topRegionsAgg = await Property.aggregate([
      { $match: { city: { $exists: true, $ne: '' } } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topRegions = topRegionsAgg.map((r) => ({ name: r._id, count: r.count }));

    const stats = {
      agentsTotal,
      agentsActive,
      agentsPending,
      agentsUnsubscribed,
      apporteursTotal,
      apporteursActive,
      apporteursPending,
      propertiesActive,
      propertiesArchived,
      propertiesInCollab,
      collabOpen,
      collabClosed,
      feesTotal,
      topNetworks,
      topRegions,
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute stats', details: (err as Error).message });
  }
};

