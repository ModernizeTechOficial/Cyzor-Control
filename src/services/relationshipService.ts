import { db } from '../db/index.ts';
import { entityRelationships } from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';

export interface Relationship {
  sourceType: string;
  sourceId: number;
  targetType: string;
  targetId: number;
  relationshipType: string;
  workspaceId: number;
  tenantId: string;
}

export const relationshipService = {
  async createRelationship(data: Relationship) {
    return await db.insert(entityRelationships).values(data);
  },

  async getRelationshipsForEntity(type: string, id: number) {
    // Find all relationships where this entity is source OR target
    // For simplicity, let's just return relationships where it is source for now
    return await db.select().from(entityRelationships).where(
      or(
        and(eq(entityRelationships.sourceType, type), eq(entityRelationships.sourceId, id)),
        and(eq(entityRelationships.targetType, type), eq(entityRelationships.targetId, id))
      )
    );
  }
};
import { or } from 'drizzle-orm';
