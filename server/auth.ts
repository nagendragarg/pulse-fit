import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, UserRole, User } from './db.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'pulsefit-super-secure-production-jwt-token-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function generateToken(user: User): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      return res.status(403).json({ error: 'Session expired or invalid token. Please sign in again.' });
    }
    req.user = decoded as TokenPayload;

    // Check if user is still active in database
    const userInDb = db.getUserById(req.user.userId);
    if (!userInDb) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    if (userInDb.status === 'INACTIVE') {
      return res.status(403).json({ error: 'Your account has been deactivated by an administrator.' });
    }

    next();
  });
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden: Access requires ${allowedRoles.join(' or ')} permission level. Your role is ${req.user.role}.`,
      });
    }

    next();
  };
}
