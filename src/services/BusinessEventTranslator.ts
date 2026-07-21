import { TechnicalEvent, BusinessEvent } from "../types/domainEvents.ts";

export class BusinessEventTranslator {
  static translate(technicalEvent: TechnicalEvent): BusinessEvent | null {
    const basePayload = {
      workspaceId: technicalEvent.payload.workspaceId,
      userUid: technicalEvent.payload.userUid,
      tenantId: technicalEvent.payload.tenantId
    };

    switch (technicalEvent.type) {
      case 'TASK_COMPLETED':
        return {
            type: 'FEATURE_VALIDATED',
            payload: { ...basePayload, entityId: technicalEvent.payload.taskId }
        };

      case 'INVOICE_PAID':
        return {
            type: 'REVENUE_GENERATED',
            payload: { ...basePayload, amount: 0 }
        };

      case 'CUSTOMER_CREATED':
        return {
            type: 'CUSTOMER_ACQUIRED',
            payload: { ...basePayload, clientId: technicalEvent.payload.clientId }
        };

      case 'COMPANY_CREATED':
        return {
            type: 'COMPANY_CREATED',
            payload: { ...basePayload }
        };

      case 'PROJECT_CREATED':
        return {
            type: 'BUSINESS_MILESTONE_REACHED',
            payload: { ...basePayload, milestoneId: technicalEvent.payload.projectId }
        };

      case 'GOAL_COMPLETED':
        return {
            type: 'BUSINESS_MILESTONE_REACHED',
            payload: { ...basePayload, milestoneId: technicalEvent.payload.goalId }
        };

      case 'SPRINT_FINISHED':
        return {
            type: 'DELIVERY_COMPLETED',
            payload: { ...basePayload, entityId: technicalEvent.payload.sprintId }
        };

      case 'PLANNING_FINISHED':
        return {
            type: 'PLANNING_APPROVED',
            payload: { ...basePayload, planningId: technicalEvent.payload.planningId }
        };

      default:
        return null;
    }
  }
}
