import { Request, Response, NextFunction } from 'express';
import { hasPermission } from '../db/permissions';
import { userHasAssignmentPermission } from '../db/assignments';

export function enforcePermission(permission: string) {
  return async (req: Request & { user?: any; workspaceId?: number }, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      // Resolve workspaceId from middleware, params, body or query
      const resolvedWorkspaceId = (req as any).workspaceId || Number((req as any).params?.id) || Number((req as any).body?.workspaceId) || Number((req as any).query?.workspaceId);
      if (!user || !resolvedWorkspaceId) return res.status(403).json({ error: 'Access denied' });

      // First: role / workspace-level permissions
      const okRole = await hasPermission(user.uid, resolvedWorkspaceId, permission as any);
      if (okRole) return next();

      // Second: resource-scoped assignments. Try to extract resourceType/resourceId from request
      const resourceType = (req as any).body?.resourceType || (req as any).params?.resourceType || (req as any).body?.entityType || null;
      const resourceId = (req as any).body?.resourceId || (req as any).params?.resourceId || (req as any).params?.id || null;

      if (resourceType && resourceId) {
        const okAssign = await userHasAssignmentPermission(user.uid, resolvedWorkspaceId, String(resourceType), Number(resourceId), permission);
        if (okAssign) return next();
      }

      return res.status(403).json({ error: 'Insufficient permissions' });
    } catch (err) {
      console.error('Error in enforcePermission middleware:', err);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

export default enforcePermission;
