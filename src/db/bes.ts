import { db } from "./index.ts";
import { workspaces, workspaceBesActions } from "./schema.ts";
import { eq, and } from "drizzle-orm";
import { ACTIONS } from "../utils/besCalculator.ts";

export async function updateBesScore(workspaceId: number, actionType: keyof typeof ACTIONS, entityId?: number) {
  // 1. Check if action already happened for this entity/workspace
  const [existingAction] = await db
    .select()
    .from(workspaceBesActions)
    .where(
      and(
        eq(workspaceBesActions.workspaceId, workspaceId),
        eq(workspaceBesActions.actionType, actionType),
        entityId ? eq(workspaceBesActions.entityId, entityId) : undefined
      )
    )
    .limit(1);

  if (existingAction) return; // Already counted

  // 2. Record the action
  await db.insert(workspaceBesActions).values({
    workspaceId,
    actionType,
    entityId
  });

  // 3. Update the score
  const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (!ws) return;

  const points = ACTIONS[actionType] || 0;
  const currentSettings = (ws.settings as any) || {};
  const currentBes = currentSettings.besScore || 0;
  
  const newBes = currentBes + points;
  
  // Also calculate maturity percentage (simplified for now)
  const newMaturity = Math.min(100, (newBes / 15000) * 100); 

  await db.update(workspaces).set({
    settings: {
      ...currentSettings,
      besScore: newBes,
      besMaturity: newMaturity
    }
  }).where(eq(workspaces.id, workspaceId));

  try {
    const { EventCascadeService } = await import("../services/EventCascadeService.ts");
    await EventCascadeService.handleBesScoreMilestone(workspaceId, newBes, currentBes, ws.tenantId as any);
  } catch (err) {
    console.error("Failed to run BES milestone cascade:", err);
  }
}
