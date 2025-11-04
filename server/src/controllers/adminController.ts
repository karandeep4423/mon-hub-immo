import { Request, Response } from 'express';
import { User } from '../models/User';
import { Property } from '../models/Property';
import { Collaboration } from '../models/Collaboration';
import { SecurityLog } from '../models/SecurityLog'; // Assume existe pour logs connexions
import { AuthRequest } from '../types/auth';
import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { logger } from '../utils/logger';

// ... (autres fonctions comme getDashboardStats si déjà là)

// Liste users avec filtres et sorts (nom, réseau, statut)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { name, network, status, sortBy = 'annoncesAsc' } = req.query; // status = userType
    const filter: any = {};
    if (name) filter.$or = [{ firstName: { $regex: name as string, $options: 'i' } }, { lastName: { $regex: name as string, $options: 'i' } }];
    if (network) filter['professionalInfo.network'] = network;
    if (status) filter.userType = status;

    const users = await User.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'properties',
          localField: '_id',
          foreignField: 'owner',
          as: 'properties',
        },
      },
      {
        $lookup: {
          from: 'collaborations',
          localField: '_id',
          foreignField: 'postOwnerId',
          as: 'collaborationsOwner',
        },
      },
      {
        $lookup: {
          from: 'collaborations',
          localField: '_id',
          foreignField: 'collaboratorId',
          as: 'collaborationsCollaborator',
        },
      },
      {
        $addFields: {
          annoncesCount: { $size: '$properties' },
          collabInProgress: {
            $size: {
              $filter: {
                input: { $concatArrays: ['$collaborationsOwner', '$collaborationsCollaborator'] },
                as: 'collab',
                cond: { $in: ['$$collab.status', ['pending', 'accepted', 'active']] },
              },
            },
          },
          collabClosed: {
            $size: {
              $filter: {
                input: { $concatArrays: ['$collaborationsOwner', '$collaborationsCollaborator'] },
                as: 'collab',
                cond: { $in: ['$$collab.status', ['completed', 'cancelled', 'rejected']] },
              },
            },
          },
        },
      },
      {
        $sort: sortBy === 'annoncesAsc' ? { annoncesCount: 1 } : { annoncesCount: -1 }, // Ou collabAsc/collabDesc
      },
      { $project: { properties: 0, collaborationsOwner: 0, collaborationsCollaborator: 0 } }, // Clean up
    ]);

    res.json({ success: true, users });
  } catch (error) {
    logger.error('[Admin] Get users error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Validation manuelle
export const validateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isEmailVerified = true;
    user.profileCompleted = true;
    await user.save();
    res.json({ success: true, message: 'User validated' });
  } catch (error) {
    logger.error('[Admin] Validate user error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Visualisation profile (détails)
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('firstName lastName email phone userType professionalInfo createdAt');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    logger.error('[Admin] Get user profile error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Historique activité
export const getUserActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const annoncesCount = await Property.countDocuments({ owner: userId });
    const collabInProgress = await Collaboration.countDocuments({
      $or: [{ postOwnerId: userId }, { collaboratorId: userId }],
      status: { $in: ['pending', 'accepted', 'active'] },
    });
    const collabClosed = await Collaboration.countDocuments({
      $or: [{ postOwnerId: userId }, { collaboratorId: userId }],
      status: { $in: ['completed', 'cancelled', 'rejected'] },
    });
    const connexionsCount = await SecurityLog.countDocuments({ userId, eventType: 'login_success' }); // Assume eventType pour connexions

    res.json({ success: true, activity: { annoncesCount, collabInProgress, collabClosed, connexionsCount } });
  } catch (error) {
    logger.error('[Admin] Get user activity error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Suspend user (ajoute champ suspended: true dans User? Modifie User.ts si besoin)
export const suspendUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body; // Optionnel
    await User.findByIdAndUpdate(userId, { suspended: true }); // Ajoute suspended: Boolean dans User schema si pas là
    // Log event
    res.json({ success: true, message: 'User suspended' });
  } catch (error) {
    logger.error('[Admin] Suspend user error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Réinitialiser (e.g., reset pw code)
export const resetUserPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    // Génère code reset, envoie email (reuse forgotPassword logic)
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false });
    // ... (génère code, update user, envoie email)
    res.json({ success: true, message: 'Password reset initiated' });
  } catch (error) {
    logger.error('[Admin] Reset user password error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Supprimer
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    // Optionnel: Cascade delete properties/collabs
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    logger.error('[Admin] Delete user error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Export CSV (déjà là, mais complet)
export const exportUsersCSV = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('firstName lastName email userType professionalInfo createdAt');
    const csvWriter = createObjectCsvWriter({
      path: '/tmp/users.csv', // Temp file
      header: [
        { id: 'firstName', title: 'Prénom' },
        { id: 'lastName', title: 'Nom' },
        { id: 'email', title: 'Email' },
        { id: 'userType', title: 'Type' },
        { id: 'professionalInfo.network', title: 'Réseau' },
        { id: 'createdAt', title: 'Date inscription' },
      ],
    });
    await csvWriter.writeRecords(users.map(u => u.toObject())); // Flatten si besoin
    res.download('/tmp/users.csv', 'users.csv', () => fs.unlinkSync('/tmp/users.csv'));
  } catch (error) {
    logger.error('[Admin] Export CSV error', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Import CSV (déjà là, mais complet)
 