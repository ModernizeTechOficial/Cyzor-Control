import { Request, Response, NextFunction } from 'express';
import { getAdminAuth } from '../lib/firebase-admin.ts';
import { DecodedIdToken } from 'firebase-admin/auth';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  workspaceId?: number;
  tenantId?: string;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Unauthorized: Invalid token format' });
  }

  try {
    const authInstance = getAdminAuth();
    if (!authInstance) {
      throw new Error('Firebase Admin Auth not initialized');
    }
    const decodedToken = await authInstance.verifyIdToken(token);
    req.user = decodedToken;
    // Verbose debug: log essential decoded token claims (avoid logging raw token)
    try {
      console.log(`[Auth] Verified token for uid=${decodedToken.uid}, email=${decodedToken.email}, auth_time=${decodedToken.auth_time}`);
      if ((decodedToken as any).firebase) {
        // Print provider info if present
        console.log('[Auth] firebase provider info:', (decodedToken as any).firebase.sign_in_provider);
      }
      // Print custom claims if any
      const customClaims = { ...decodedToken } as any;
      delete customClaims.iat;
      delete customClaims.exp;
      delete customClaims.auth_time;
      delete customClaims.sub;
      delete customClaims.aud;
      console.log('[Auth] token claims snapshot:', Object.keys(customClaims));
    } catch (e) {
      console.warn('[Auth] Failed to log decoded token details:', e);
    }
    next();
  } catch (error: any) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        error: 'Unauthorized: Token expired', 
        code: 'auth/id-token-expired' 
      });
    }
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
