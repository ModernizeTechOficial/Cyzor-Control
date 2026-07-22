import { db } from './index.ts';
import { assignments, workspaceMembers } from './schema.ts';
import { and, eq } from 'drizzle-orm';

export type VisibilityScope = 'Private' | 'Project Members' | 'Specific Members' | 'Specific Team' | 'Specific Department' | 'Organization' | 'Owner Only' | 'Managers' | 'Custom';

export async function createAssignment(data: any) {
  const result = await db.insert(assignments).values(data as any).returning();
  return result[0];
}

export async function removeAssignment(id: number) {
  await db.update(assignments).set({ status: 'REMOVED', updatedAt: new Date() }).where(eq(assignments.id, id));
}

export async function getAssignmentsForResource(workspaceId: number, resourceType: string, resourceId: number) {
  return db.select().from(assignments).where(and(eq(assignments.workspaceId, workspaceId), eq(assignments.resourceType, resourceType), eq(assignments.resourceId, resourceId)));
}

export async function userHasAssignmentPermission(userUid: string, workspaceId: number, resourceType: string | null, resourceId: number | null, permission: string): Promise<boolean> {
  try {
    const [member] = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.userUid, userUid), eq(workspaceMembers.workspaceId, workspaceId))).limit(1);
    if (!member) return false;
    if (member.status !== 'Ativo') return false;

    // If resource provided, check assignments for that resource
    if (resourceType && resourceId) {
      const rows = await db.select().from(assignments).where(and(eq(assignments.workspaceId, workspaceId), eq(assignments.resourceType, resourceType), eq(assignments.resourceId, resourceId)));
      for (const a of rows) {
        // direct member assignment
        if (a.memberId && a.memberId === member.id) {
          const perms = Array.isArray(a.permissionSet) ? a.permissionSet : [];
          if (perms.includes(permission)) return true;
        }
        // visibility: if assignment is Organization and permission is a view action
        if (a.visibilityScope === 'Organization' && permission.startsWith('view')) return true;
      }
    }

    // No resource-specific assignment found, fallback to workspace role/explicit permissions
    // Use existing permissions.hasPermission in other module (caller may check both)
    return false;
  } catch (err) {
    console.error('Error in userHasAssignmentPermission:', err);
    return false;
  }
}

export default {
  createAssignment,
  removeAssignment,
  getAssignmentsForResource,
  userHasAssignmentPermission
};
