import { db } from '../../db/index.ts';
import { auditLogs, permissionAuditLog, users, tenants, workspaces } from '../../db/schema.ts';
import { and, eq, sql, desc, asc } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE' | 'ROLE_CHANGE' | 'FEATURE_TOGGLE';
export type AuditTargetType = 'user' | 'role' | 'permission' | 'module' | 'entity' | 'system';

export interface AuditEntry {
  id: number;
  tenantId: string;
  workspaceId?: number;
  userId?: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface PermissionAuditEntry {
  id: number;
  tenantId: string;
  workspaceId?: number;
  actorUid: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface CreateAuditInput {
  tenantId: string;
  workspaceId?: number;
  userId?: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// ============================================================================
// AUDIT SERVICE - Centralized audit logging
// ============================================================================

export class AuditService {
  // -------------------------------------------------------------------------
  // ENTITY AUDIT
  // -------------------------------------------------------------------------

  async logEntityChange(input: CreateAuditInput): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId || null,
        userId: input.userId || null,
        action: input.action,
        tableName: input.tableName,
        recordId: input.recordId,
        oldValues: input.oldValues || null,
        newValues: input.newValues || null,
        ipAddress: input.ipAddress || null,
      });
    } catch (error) {
      console.error('[AuditService] Error logging entity change:', error);
    }
  }

  async logLogin(userId: string, tenantId: string, workspaceId: number, ipAddress?: string): Promise<void> {
    await this.logEntityChange({
      tenantId,
      workspaceId,
      userId,
      action: 'LOGIN',
      tableName: 'users',
      recordId: userId,
      ipAddress,
    });
  }

  async logLogout(userId: string, tenantId: string, workspaceId: number, ipAddress?: string): Promise<void> {
    await this.logEntityChange({
      tenantId,
      workspaceId,
      userId,
      action: 'LOGOUT',
      tableName: 'users',
      recordId: userId,
      ipAddress,
    });
  }

  // -------------------------------------------------------------------------
  // PERMISSION AUDIT
  // -------------------------------------------------------------------------

  async logPermissionChange(
    actorUid: string,
    action: string,
    targetType: string,
    targetId: string,
    oldValue: any,
    newValue: any,
    ipAddress?: string,
    userAgent?: string,
    tenantId?: string,
    workspaceId?: number
  ): Promise<void> {
    try {
      await db.insert(permissionAuditLog).values({
        tenantId: tenantId || '',
        workspaceId: workspaceId || null,
        actorUid,
        action,
        targetType,
        targetId,
        oldValue: oldValue ? { ...oldValue } : null,
        newValue: newValue ? { ...newValue } : null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      });
    } catch (error) {
      console.error('[AuditService] Error logging permission change:', error);
    }
  }

  // -------------------------------------------------------------------------
  // QUERIES
  // -------------------------------------------------------------------------

  async getEntityAuditLog(
    tenantId: string,
    tableName: string,
    recordId: string,
    limit: number = 50
  ): Promise<AuditEntry[]> {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.tenantId, tenantId),
          eq(auditLogs.tableName, tableName),
          eq(auditLogs.recordId, recordId)
        )
      )
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return logs;
  }

  async getPermissionAuditLog(
    tenantId: string,
    targetType?: string,
    limit: number = 100
  ): Promise<PermissionAuditEntry[]> {
    const conditions = [eq(permissionAuditLog.tenantId, tenantId)];

    if (targetType) {
      conditions.push(eq(permissionAuditLog.targetType, targetType));
    }

    const logs = await db
      .select()
      .from(permissionAuditLog)
      .where(and(...conditions))
      .orderBy(desc(permissionAuditLog.createdAt))
      .limit(limit);

    return logs;
  }

  async getRecentActivity(tenantId: string, limit: number = 20): Promise<any[]> {
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.tenantId, tenantId))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return logs;
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const auditService = new AuditService();
