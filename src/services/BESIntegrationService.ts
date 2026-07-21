import { BusinessEvent } from "../types/domainEvents.ts";
import { ProfessionalEvolutionEngine } from "./ProfessionalEvolutionEngine.ts";

export class BESIntegrationService {
  static async processBusinessEvent(event: BusinessEvent) {
    try {
      await ProfessionalEvolutionEngine.processEvent({
        ...event,
        payload: {
          ...event.payload,
          userUid: (event.payload as any).userUid || null,
          tenantId: (event.payload as any).tenantId || null
        }
      });
    } catch (error) {
      console.error("BESIntegrationService Error:", error);
    }
  }
}
