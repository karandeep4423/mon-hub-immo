// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Typage pour req avec utilisateur attaché
export interface AuthRequest extends Request {
  user?: IUser & { _id: any }; // _id typé any pour simplifier .toString()
  userId?: string;
}

// Middleware pour authentifier le token JWT
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Récupérer le token dans les headers ou cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    // Chercher l'utilisateur dans la base
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid token' });

    // Attacher l'utilisateur à la requête
    req.user = user;
    req.userId =user.id;

    next();
  } catch (err) {
    console.error('JWT authentication error:', err);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

// Middleware pour vérifier si l'utilisateur est admin
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  if (req.user.userType !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
};
