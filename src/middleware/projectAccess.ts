import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.ts';
import { db } from '../db/index.ts';
import { userProjectRestrictions } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { getUserProjectRestrictions } from '../db/queries.ts';

export interface ProjectRequest extends AuthRequest {
  allowedProjectIds?: Set<number>;
}

export const projectAccessMiddleware = async (
  req: ProjectRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication' });
    }

    const userId = req.user.uid;
    const workspaceId = req.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Missing workspace context' });
    }

    const restrictions = await getUserProjectRestrictions(userId, workspaceId);
    
    if (restrictions.length === 0) {
      return next();
    }

    const allowedProjectIds = new Set(restrictions.map(r => r.projectId));
    req.allowedProjectIds = allowedProjectIds;

    const pathParts = req.path.split('/').filter(Boolean);
    let targetProjectId: number | undefined;

    if (pathParts[0] === 'projects' && pathParts[1]) {
      targetProjectId = Number(pathParts[1]);
    } else if (req.body?.projectId) {
      targetProjectId = Number(req.body.projectId);
    } else if (req.body?.id) {
      targetProjectId = Number(req.body.id);
    }

    if (targetProjectId && !allowedProjectIds.has(targetProjectId)) {
      return res.status(403).json({ 
        error: 'Access denied: You do not have permission to access this project',
        code: 'PROJECT_ACCESS_DENIED',
        allowedProjects: Array.from(allowedProjectIds)
      });
    }

    next();
  } catch (error: any) {
    console.error('[Project Access Middleware Error] Failed to verify project access:', error);
    res.status(500).json({ error: 'Internal server error verifying project access' });
  }
};

export const projectOwnerOrAccessMiddleware = async (
  req: ProjectRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Missing user authentication' });
    }

    const userId = req.user.uid;
    const workspaceId = req.workspaceId;
    
    if (!workspaceId) {
      return res.status(400).json({ error: 'Missing workspace context' });
    }

    const restrictions = await getUserProjectRestrictions(userId, workspaceId);
    
    if (restrictions.length === 0) {
      return next();
    }

    const allowedProjectIds = new Set(restrictions.map(r => r.projectId));
    req.allowedProjectIds = allowedProjectIds;

    const pathParts = req.path.split('/').filter(Boolean);
    let targetProjectId: number | undefined;

    if (pathParts[0] === 'projects' && pathParts[1]) {
      targetProjectId = Number(pathParts[1]);
    } else if (req.body?.projectId) {
      targetProjectId = Number(req.body.projectId);
    } else if (req.body?.id) {
      targetProjectId = Number(req.body.id);
    }

    if (targetProjectId && !allowedProjectIds.has(targetProjectId)) {
      return res.status(403).json({ 
        error: 'Access denied: You do not have permission to access this project',
        code: 'PROJECT_ACCESS_DENIED',
        allowedProjects: Array.from(allowedProjectIds)
      });
    }

    next();
  } catch (error: any) {
    console.error('[Project Access Middleware Error] Failed to verify project access:', error);
    res.status(500).json({ error: 'Internal server error verifying project access' });
  }
};
