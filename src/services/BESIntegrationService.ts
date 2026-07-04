import { updateBesScore } from "../db/bes.ts";
import { BusinessEvent } from "../types/domainEvents.ts";
import { ACTIONS } from "../utils/besCalculator.ts";

export class BESIntegrationService {
  static async processBusinessEvent(event: BusinessEvent) {
    try {
      let actionType: keyof typeof ACTIONS | null = null;
      
      switch (event.type) {
          case 'FEATURE_VALIDATED': actionType = 'COMPLETE_TASK'; break;
          case 'REVENUE_GENERATED': actionType = 'REGISTER_REVENUE'; break;
          case 'CUSTOMER_ACQUIRED': actionType = 'ADD_CLIENT'; break;
          case 'BUSINESS_MILESTONE_REACHED': actionType = 'COMPLETE_PROJECT'; break;
          case 'DELIVERY_COMPLETED': actionType = 'FINISH_SPRINT'; break;
          case 'PLANNING_APPROVED': actionType = 'COMPLETE_DOCUMENTATION'; break;
          case 'PRODUCT_RELEASED': actionType = 'COMPLETE_PROJECT'; break;
      }

      if (actionType) {
        // We need to pass the entityId if available in payload
        const entityId = (event.payload as any).entityId || (event.payload as any).clientId || (event.payload as any).milestoneId || (event.payload as any).sprintId || (event.payload as any).planningId;
        await updateBesScore(event.payload.workspaceId, actionType, entityId);
      }
    } catch (error) {
      console.error("BESIntegrationService Error:", error);
    }
  }
}
