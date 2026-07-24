export enum ProvisioningState {
  AUTHENTICATED = 'AUTHENTICATED',
  PROVISIONING = 'PROVISIONING',
  SETUP_REQUIRED = 'SETUP_REQUIRED',
  TOUR_REQUIRED = 'TOUR_REQUIRED',
  READY = 'READY',
  ERROR = 'ERROR',
}

export interface ProvisioningStatus {
  state: ProvisioningState;
  workspaceId?: number;
  tenantId?: string;
  companyId?: number;
  membershipId?: number;
  error?: {
    stage: string;
    reason: string;
    sql?: string;
    constraint?: string;
    stack?: string;
  };
}
