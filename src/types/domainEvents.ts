interface BaseEventPayload {
  workspaceId: number;
  userUid?: string;
  tenantId?: string;
}

export type TechnicalEvent = 
  | { type: 'TASK_COMPLETED'; payload: BaseEventPayload & { taskId: number } }
  | { type: 'PROJECT_CREATED'; payload: BaseEventPayload & { projectId: number } }
  | { type: 'INVOICE_PAID'; payload: BaseEventPayload & { financeEntryId: number } }
  | { type: 'CUSTOMER_CREATED'; payload: BaseEventPayload & { clientId: number } }
  | { type: 'COMPANY_CREATED'; payload: BaseEventPayload }
  | { type: 'GOAL_COMPLETED'; payload: BaseEventPayload & { goalId: number } }
  | { type: 'SPRINT_FINISHED'; payload: BaseEventPayload & { sprintId: number } }
  | { type: 'PLANNING_FINISHED'; payload: BaseEventPayload & { planningId: number } };

export type BusinessEvent = 
  | { type: 'FEATURE_VALIDATED'; payload: BaseEventPayload & { entityId: number } }
  | { type: 'REVENUE_GENERATED'; payload: BaseEventPayload & { amount: number } }
  | { type: 'CUSTOMER_ACQUIRED'; payload: BaseEventPayload & { clientId: number } }
  | { type: 'COMPANY_CREATED'; payload: BaseEventPayload }
  | { type: 'BUSINESS_MILESTONE_REACHED'; payload: BaseEventPayload & { milestoneId: number } }
  | { type: 'DELIVERY_COMPLETED'; payload: BaseEventPayload & { entityId: number } }
  | { type: 'PLANNING_APPROVED'; payload: BaseEventPayload & { planningId: number } }
  | { type: 'PRODUCT_RELEASED'; payload: BaseEventPayload & { productId: number } };
