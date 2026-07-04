import { updateBesScore } from "../db/bes.ts";
import { ACTIONS } from "../utils/besCalculator.ts";

export class BESIntegrationService {
  static async trackOperationalEvent(
    workspaceId: number,
    actionType: keyof typeof ACTIONS,
    entityId?: number
  ) {
    try {
      // The logic to bridge operational events to BES scores
      // updateBesScore already handles anti-inflation (check if action happened)
      await updateBesScore(workspaceId, actionType, entityId);
    } catch (error) {
      console.error("BESIntegrationService Error:", error);
    }
  }
}
