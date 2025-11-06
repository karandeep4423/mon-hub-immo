// controllers/adminController.ts
import { User } from '../models/User';
import { Property } from '../models/Property'; // ou ton modèle d'annonces
import { Collaboration } from '../models/Collaboration'; // idem pour collaborations
import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import mongoose from 'mongoose';

export const getAdminUsers = async (req: Request, res: Response) => {
  // Lecture des filtres via req.query
  const { name, userType, network, isValidated } = req.query;
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
  // On map les stats sur chaque user
  const usersWithStats = users.map(u => ({
    ...u,
    propertiesCount: propsCounts.find(pc => pc._id.equals(u._id))?.count || 0,
    collaborationsActive: collabCounts.find(c => c._id.equals(u._id))?.active || 0,
    collaborationsClosed: collabCounts.find(c => c._id.equals(u._id))?.closed || 0,
  }));

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

  res.json({ success: true, user });
};

