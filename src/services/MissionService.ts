import { db } from "../db/index.ts";
import { missions, workspaceMissionProgress } from "../db/schema.ts";
import { eq, and } from "drizzle-orm";

export class MissionService {
  static async seedMissions() {
    const existing = await db.select().from(missions).limit(1);
    if (existing.length === 0) {
        await db.insert(missions).values([
            { name: 'Validar Ideia', description: 'Definir problema, público e proposta de valor.', checklist: [{id: '1', text: 'Definir problema'}, {id: '2', text: 'Definir público'}], order: 1 },
            { name: 'Planejar Projeto', description: 'Criar backlog, escopo e MVP.', checklist: [{id: '1', text: 'Criar backlog'}], order: 2 },
        ]);
    }
  }

  static async initializeWorkspaceMissions(workspaceId: number) {
      await this.seedMissions();
      const firstMission = await db.select().from(missions).orderBy(missions.order).limit(1);
      if (firstMission.length > 0) {
          await db.insert(workspaceMissionProgress).values({
              workspaceId,
              missionId: firstMission[0].id,
              status: 'IN_PROGRESS'
          });
      }
  }

  static async getActiveMission(workspaceId: number) {
    const progress = await db.select().from(workspaceMissionProgress)
      .where(and(eq(workspaceMissionProgress.workspaceId, workspaceId), eq(workspaceMissionProgress.status, 'IN_PROGRESS')))
      .limit(1);
    
    if (progress.length > 0) {
        const mission = await db.select().from(missions).where(eq(missions.id, progress[0].missionId)).limit(1);
        return { ...mission[0], progress: progress[0] };
    }
    return null;
  }
}
