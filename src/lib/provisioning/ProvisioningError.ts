export interface ProvisioningErrorContext {
  stage: string;
  sql?: string;
  constraint?: string;
  workspaceId?: number;
  tenantId?: string;
  userUid?: string;
  companyId?: number;
  membershipId?: number;
  reason: string;
  params?: Record<string, any>;
  dbResponse?: any;
  stack?: string;
}

export class ProvisioningError extends Error {
  readonly context: ProvisioningErrorContext;

  constructor(context: ProvisioningErrorContext) {
    super(`[ProvisioningError] Stage: ${context.stage} | Reason: ${context.reason}`);
    this.name = 'ProvisioningError';
    this.context = context;
    if (context.stack) {
      this.stack = context.stack;
    } else {
      Error.captureStackTrace(this, ProvisioningError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
    };
  }
}
