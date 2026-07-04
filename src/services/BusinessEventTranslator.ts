import { TechnicalEvent, BusinessEvent } from "../types/domainEvents.ts";

export class BusinessEventTranslator {
  static translate(technicalEvent: TechnicalEvent): BusinessEvent | null {
    switch (technicalEvent.type) {
      case 'TASK_COMPLETED':
        return { 
            type: 'FEATURE_VALIDATED', 
            payload: { workspaceId: technicalEvent.payload.workspaceId, entityId: technicalEvent.payload.taskId } 
        };
      
      case 'INVOICE_PAID':
        return {
            type: 'REVENUE_GENERATED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, amount: 0 }
        };

      case 'CUSTOMER_CREATED':
        return {
            type: 'CUSTOMER_ACQUIRED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, clientId: technicalEvent.payload.clientId }
        };

      case 'PROJECT_CREATED':
        return {
            type: 'BUSINESS_MILESTONE_REACHED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, milestoneId: technicalEvent.payload.projectId }
        };

      case 'GOAL_COMPLETED':
        return {
            type: 'BUSINESS_MILESTONE_REACHED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, milestoneId: technicalEvent.payload.goalId }
        };

      case 'SPRINT_FINISHED':
        return {
            type: 'DELIVERY_COMPLETED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, entityId: technicalEvent.payload.sprintId }
        };

      case 'PLANNING_FINISHED':
        return {
            type: 'PLANNING_APPROVED',
            payload: { workspaceId: technicalEvent.payload.workspaceId, planningId: technicalEvent.payload.planningId }
        };

      default:
        return null;
    }
  }
}
