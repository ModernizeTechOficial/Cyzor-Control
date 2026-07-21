export type EvolutionEventType =
  | 'TASK_COMPLETED'
  | 'PROJECT_COMPLETED'
  | 'DOCUMENTATION_CREATED'
  | 'IDEA_APPROVED'
  | 'AUTOMATION_CREATED'
  | 'MEETING_JOINED'
  | 'CUSTOMER_SATISFIED'
  | 'LEAD_CONVERTED'
  | 'COURSE_COMPLETED'
  | 'BUG_RESOLVED'
  | 'CUSTOMER_CREATED'
  | 'FEATURE_VALIDATED'
  | 'REVENUE_GENERATED'
  | 'DELIVERY_COMPLETED'
  | 'PLANNING_APPROVED'
  | 'PRODUCT_RELEASED'
  | 'COMPANY_CREATED'
  | 'CUSTOMER_ACQUIRED'
  | 'BUSINESS_MILESTONE_REACHED';

export interface EvolutionEventPayload {
  workspaceId: number;
  tenantId?: string;
  userUid?: string;
  entityId?: number;
  productId?: number;
  clientId?: number;
  amount?: number;
  planningId?: number;
  sprintId?: number;
  milestoneId?: number;
  [key: string]: any;
}

export interface EvolutionEvent {
  type: EvolutionEventType;
  payload: EvolutionEventPayload;
  label?: string;
  description?: string;
}

export interface EvolutionSkillDelta {
  skillCode: string;
  delta: number;
}

export interface EvolutionRuleDefinition {
  id?: number;
  tenantId: string;
  workspaceId: number;
  name: string;
  eventType: EvolutionEventType;
  xpDelta: number;
  skillDeltas: EvolutionSkillDelta[];
  achievementKeys: string[];
  active: boolean;
  criteria?: Record<string, any>;
}

export interface ProfessionalProfileOverview {
  userUid: string;
  workspaceId: number;
  title: string;
  level: number;
  xpTotal: number;
  xpMonth: number;
  xpWeek: number;
  xpToday: number;
  nextLevelXp: number;
  competenceSummary: Record<string, number>;
  achievements: Array<{ key: string; name: string; awardedAt: string }>;
  recentEvents: Array<{ id: number; eventType: string; xpDelta: number; description: string; createdAt: string }>;
}

export interface ProfessionalGoal {
  id: number;
  title: string;
  description?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETE';
  targetDate?: string;
  progress: number;
}

export interface ProfessionalCertification {
  id: number;
  name: string;
  issuer?: string;
  obtainedAt?: string;
  expiresAt?: string;
  credentialUrl?: string;
  notes?: string;
}

