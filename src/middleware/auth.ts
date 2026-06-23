import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.ts';

export interface AuthUser {
  uid: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
  workspaceId?: number;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing token' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const JWT_SECRET = env.jwtSecret;
    const decodedToken = jwt.verify(token, JWT_SECRET) as AuthUser;
    req.user = decodedToken;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ 
        error: 'Unauthorized: Token expired', 
        code: 'auth/id-token-expired' 
      });
      return;
    }
    console.error('Error verifying JWT token:', error);
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
