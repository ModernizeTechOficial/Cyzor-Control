import { ProvisioningError, ProvisioningErrorContext } from './ProvisioningError';

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

interface StepLog {
  step: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  durationMs?: number;
  params?: Record<string, any>;
  sql?: string;
  dbResponse?: any;
  constraint?: string;
  createdIds?: Record<string, any>;
  error?: unknown;
  stack?: string;
}

class ProvisioningLogger {
  private logs: StepLog[] = [];
  private traceId: string;
  private userId?: string;

  constructor(traceId: string, userId?: string) {
    this.traceId = traceId;
    this.userId = userId;
  }

  private formatLog(entry: StepLog) {
    const prefix = `[Provisioning][${this.traceId}] ${entry.level}`;
    const meta = [
      entry.step ? `Step: ${entry.step}` : null,
      entry.durationMs != null ? `Duration: ${entry.durationMs}ms` : null,
      this.userId ? `UserUid: ${this.userId}` : null,
    ].filter(Boolean).join(' | ');

    const header = `${prefix} ${meta} — ${entry.message}`;

    const details: string[] = [];
    if (entry.params) {
      details.push(`  Params: ${JSON.stringify(entry.params, null, 2)}`);
    }
    if (entry.sql) {
      details.push(`  SQL: ${entry.sql}`);
    }
    if (entry.dbResponse) {
      details.push(`  DBResponse: ${JSON.stringify(entry.dbResponse, null, 2)}`);
    }
    if (entry.constraint) {
      details.push(`  Constraint: ${entry.constraint}`);
    }
    if (entry.createdIds) {
      details.push(`  CreatedIds: ${JSON.stringify(entry.createdIds, null, 2)}`);
    }
    if (entry.stack) {
      details.push(`  Stack: ${entry.stack}`);
    }

    return [header, ...details].join('\n');
  }

  info(step: string, message: string, extra?: Partial<Omit<StepLog, 'step' | 'level' | 'message' | 'timestamp'>>) {
    const entry: StepLog = {
      step,
      level: 'INFO',
      message,
      timestamp: new Date().toISOString(),
      ...extra,
    };
    this.logs.push(entry);
    console.log(this.formatLog(entry));
  }

  warn(step: string, message: string, extra?: Partial<Omit<StepLog, 'step' | 'level' | 'message' | 'timestamp'>>) {
    const entry: StepLog = {
      step,
      level: 'WARN',
      message,
      timestamp: new Date().toISOString(),
      ...extra,
    };
    this.logs.push(entry);
    console.warn(this.formatLog(entry));
  }

  error(step: string, message: string, error: unknown, extra?: Partial<Omit<StepLog, 'step' | 'level' | 'message' | 'timestamp'>>) {
    const err = error instanceof Error ? error : new Error(String(error));
    const constraint = (err as any).constraint || (err as any).constraintName || (err as any).code;
    const entry: StepLog = {
      step,
      level: 'ERROR',
      message,
      timestamp: new Date().toISOString(),
      constraint,
      stack: err.stack,
      ...extra,
    };
    this.logs.push(entry);
    console.error(this.formatLog(entry));
  }

  createProvisioningError(stage: string, reason: string, error: unknown, extra?: Partial<ProvisioningErrorContext> & { createdIds?: Record<string, any> }): ProvisioningError {
    this.error(stage, `Provisioning failed: ${reason}`, error, {
      params: extra?.params,
      sql: extra?.sql,
      dbResponse: extra?.dbResponse,
      createdIds: extra?.createdIds,
      constraint: extra?.constraint,
    });

    const err = error instanceof Error ? error : new Error(String(error));

    return new ProvisioningError({
      stage,
      reason,
      sql: extra?.sql,
      constraint: extra?.constraint || (err as any).constraint || (err as any).constraintName || (err as any).code,
      workspaceId: extra?.workspaceId,
      tenantId: extra?.tenantId,
      userUid: extra?.userUid,
      companyId: extra?.companyId,
      membershipId: extra?.membershipId,
      params: extra?.params,
      dbResponse: extra?.dbResponse,
      stack: err.stack,
    });
  }

  getLogs(): StepLog[] {
    return [...this.logs];
  }

  getTraceId(): string {
    return this.traceId;
  }
}

let currentLogger: ProvisioningLogger | null = null;

export function startProvisioningTrace(userId?: string): ProvisioningLogger {
  const traceId = `prov_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  currentLogger = new ProvisioningLogger(traceId, userId);
  currentLogger.info('TRACE_START', `Provisioning trace started${userId ? ` for user ${userId}` : ''}`);
  return currentLogger;
}

export function getProvisioningLogger(): ProvisioningLogger | null {
  return currentLogger;
}

export function endProvisioningTrace(success: boolean) {
  if (currentLogger) {
    currentLogger.info('TRACE_END', `Provisioning trace ended. Success: ${success}`);
    currentLogger = null;
  }
}
