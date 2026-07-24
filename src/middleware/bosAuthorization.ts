import { Request, Response, NextFunction } from 'express';
import { authorizationEngine, AuthorizationContext } from '../../lib/bos/authorization/AuthorizationEngine';

// ============================================================================
// BOS AUTHORIZATION MIDDLEWARE
// ============================================================================

export function bosAuthorize(permission: string, resourceType?: string) {
  return async (req: Request & { user?: any; workspaceId?: number; tenantId?: string }, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
      }

      const workspaceId = req.workspaceId || Number(req.params.id) || Number(req.body?.workspaceId) || Number(req.query?.workspaceId);
      const tenantId = req.tenantId;

      if (!workspaceId || !tenantId) {
        return res.status(403).json({ error: 'Forbidden: Missing context' });
      }

      const context: AuthorizationContext = {
        userId: user.uid,
        tenantId,
        workspaceId,
      };

      const resourceId = req.params.id ? Number(req.params.id) : undefined;

      const result = await authorizationEngine.can(context, permission, resourceType, resourceId);

      if (!result.allowed) {
        return res.status(403).json({ 
          error: 'Forbidden: Insufficient permissions',
          required: permission,
          reason: result.reason,
        });
      }

      next();
    } catch (error: any) {
      console.error('[bosAuthorize] Error:', error);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
}

export function bosRequireFeature(featureKey: string) {
  return async (req: Request & { user?: any; workspaceId?: number; tenantId?: string }, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Missing authentication' });
      }

      const workspaceId = req.workspaceId;
      const tenantId = req.tenantId;

      if (!workspaceId || !tenantId) {
        return res.status(403).json({ error: 'Forbidden: Missing context' });
      }

      const context: AuthorizationContext = {
        userId: user.uid,
        tenantId,
        workspaceId,
      };

      const hasFeature = await authorizationEngine.hasFeature(context, featureKey);

      if (!hasFeature) {
        return res.status(403).json({
          error: 'Forbidden: Feature not enabled',
          feature: featureKey,
        });
      }

      next();
    } catch (error: any) {
      console.error('[bosRequireFeature] Error:', error);
      res.status(500).json({ error: 'Feature check failed' });
    }
  };
}
