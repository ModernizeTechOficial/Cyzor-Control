export type TechnicalEvent = 
  | { type: 'TASK_COMPLETED'; payload: { taskId: number; workspaceId: number } }
  | { type: 'PROJECT_CREATED'; payload: { projectId: number; workspaceId: number } }
  | { type: 'INVOICE_PAID'; payload: { financeEntryId: number; workspaceId: number } }
  | { type: 'CUSTOMER_CREATED'; payload: { clientId: number; workspaceId: number } }
  | { type: 'GOAL_COMPLETED'; payload: { goalId: number; workspaceId: number } }
  | { type: 'SPRINT_FINISHED'; payload: { sprintId: number; workspaceId: number } }
  | { type: 'PLANNING_FINISHED'; payload: { planningId: number; workspaceId: number } };

export type BusinessEvent = 
  | { type: 'FEATURE_VALIDATED'; payload: { workspaceId: number; entityId: number } }
  | { type: 'REVENUE_GENERATED'; payload: { workspaceId: number; amount: number } }
  | { type: 'CUSTOMER_ACQUIRED'; payload: { workspaceId: number; clientId: number } }
  | { type: 'BUSINESS_MILESTONE_REACHED'; payload: { workspaceId: number; milestoneId: number } }
  | { type: 'DELIVERY_COMPLETED'; payload: { workspaceId: number; entityId: number } }
  | { type: 'PLANNING_APPROVED'; payload: { workspaceId: number; planningId: number } }
  | { type: 'PRODUCT_RELEASED'; payload: { workspaceId: number; productId: number } };
