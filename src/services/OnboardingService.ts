import { db, schema } from '../db/index.ts';
import { safeInsertWorkspaceMember } from '../db/queries.ts';
import { eq, and } from 'drizzle-orm';
import { authorizationEngine } from '../lib/bos/authorization/AuthorizationEngine';
import { roleEngine } from '../lib/bos/authorization/RoleEngine';
import { moduleRegistry } from '../lib/bos/module-registry/ModuleRegistry';
import { featureFlagService } from '../lib/bos/feature-flags/FeatureFlagService';
import { auditService } from '../lib/bos/audit/AuditService';
import { startProvisioningTrace, getProvisioningLogger, endProvisioningTrace } from '../lib/provisioning/ProvisioningLogger.ts';

export type BusinessSegment = 'saas' | 'services' | 'ecommerce' | 'general';
export type BusinessStage = 'idea' | 'validation' | 'development' | 'launch' | 'growth' | 'mature';

export interface OnboardingCompanyInput {
  name: string;
  cnpj?: string;
  country: string;
  language: string;
  segment: BusinessSegment;
  logoUrl?: string;
}

export interface OnboardingResult {
  tenantId: string;
  workspaceId: number;
  companyId: number;
  userId: string;
  membershipId: number;
  isNewTenant: boolean;
  isNewWorkspace: boolean;
  isNewCompany: boolean;
  isNewUser: boolean;
}

export class OnboardingService {
  async ensureAccount(
    firebaseUser: { uid: string; email: string; displayName?: string; photoUrl?: string },
    companyData?: Partial<OnboardingCompanyInput>
  ): Promise<OnboardingResult> {
    const userId = firebaseUser.uid;
    const email = firebaseUser.email || '';
    const displayName = firebaseUser.displayName || email.split('@')[0] || 'Usuário';
    const logger = startProvisioningTrace(userId);
    const startTime = Date.now();

    try {
      logger.info('ENSURE_ACCOUNT', 'Starting onboarding flow', {
        params: { userId, email, displayName, companyData }
      });

      const result = await db.transaction(async (tx) => {
        const step1Start = Date.now();
        const user = await this.ensureUser(tx, userId, email, displayName, firebaseUser.photoUrl);
        logger.info('STEP_1', 'User ensured', { 
          createdIds: { userId: user.id, uid: user.uid },
          params: { isNew: user.createdAt > new Date(Date.now() - 60000) },
          durationMs: Date.now() - step1Start 
        });

        const step2Start = Date.now();
        const { tenant, isNewTenant } = await this.ensureTenant(tx, userId, displayName);
        logger.info('STEP_2', 'Tenant ensured', { 
          createdIds: { tenantId: tenant.id },
          params: { isNew: isNewTenant },
          durationMs: Date.now() - step2Start 
        });

        const step3Start = Date.now();
        const { workspace, isNewWorkspace } = await this.ensurePrimaryWorkspace(tx, tenant.id, userId, displayName);
        logger.info('STEP_3', 'Workspace ensured', { 
          createdIds: { workspaceId: workspace.id, tenantId: workspace.tenantId },
          params: { isNew: isNewWorkspace },
          durationMs: Date.now() - step3Start 
        });

        const step4Start = Date.now();
        const companyName = companyData?.name || `${displayName}'s Company`;
        const { company, isNewCompany } = await this.ensureCompany(tx, tenant.id, workspace.id, companyName, companyData);
        logger.info('STEP_4', 'Company ensured', { 
          createdIds: { companyId: company.id },
          params: { isNew: isNewCompany },
          durationMs: Date.now() - step4Start 
        });

        const step5Start = Date.now();
        const membership = await this.ensureOwnership(tx, tenant.id, workspace.id, userId);
        logger.info('STEP_5', 'Ownership ensured', { 
          createdIds: { membershipId: membership.id },
          durationMs: Date.now() - step5Start 
        });

        const step6Start = Date.now();
        await this.ensureActiveReferences(tx, userId, tenant.id, workspace.id, company.id);
        logger.info('STEP_6', 'Active references ensured', { 
          durationMs: Date.now() - step6Start 
        });

        await auditService.logEntityChange({
          tenantId: tenant.id,
          workspaceId: workspace.id,
          userId,
          action: 'ONBOARDING_COMPLETED',
          tableName: 'workspaces',
          recordId: String(workspace.id),
          newValues: { tenantId: tenant.id, workspaceId: workspace.id, companyId: company.id, segment: companyData?.segment },
        });

        logger.info('ONBOARDING_COMPLETE', 'Onboarding completed successfully', {
          createdIds: { 
            tenantId: tenant.id, 
            workspaceId: workspace.id, 
            companyId: company.id,
            membershipId: membership.id 
          },
          durationMs: Date.now() - startTime
        });

        return {
          tenantId: tenant.id,
          workspaceId: workspace.id,
          companyId: company.id,
          userId,
          membershipId: membership.id,
          isNewTenant,
          isNewWorkspace,
          isNewCompany,
          isNewUser: user.createdAt > new Date(Date.now() - 60000),
        };
      });

      return result;

    } catch (error) {
      const provisioningError = logger.createProvisioningError(
        'ensureAccount',
        'Onboarding transaction failed',
        error,
        { userUid: userId }
      );
      throw provisioningError;
    } finally {
      endProvisioningTrace(false);
    }
  }

  async healAccount(userId: string): Promise<OnboardingResult | null> {
    const logger = startProvisioningTrace(userId);
    try {
      const [userRecord] = await db.select().from(schema.users).where(eq(schema.users.uid, userId)).limit(1);
      if (!userRecord) return null;

      const workspaceId = userRecord.activeWorkspaceId;
      if (!workspaceId) return null;

      const [workspace] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, workspaceId)).limit(1);
      if (!workspace) return null;

      const tenantId = workspace.tenantId;
      const [tenant] = tenantId ? await db.select().from(schema.tenants).where(eq(schema.tenants.id, tenantId)).limit(1) : [];
      if (!tenant) {
        const [newTenant] = await db.insert(schema.tenants).values({
          name: workspace.name,
          slug: `tenant-${workspaceId}-${Date.now()}`,
          plan: workspace.plan || 'Pro',
        }).returning();
        
        await db.update(schema.workspaces).set({ tenantId: newTenant.id }).where(eq(schema.workspaces.id, workspaceId));
        
        try {
          await auditService.logEntityChange({
            tenantId: newTenant.id,
            workspaceId: workspaceId,
            userId,
            action: 'TENANT_HEALED',
            tableName: 'tenants',
            recordId: newTenant.id,
          });
        } catch {}
        
        return await this.ensureAccount({ uid: userId, email: userRecord.email || '', displayName: userRecord.displayName || 'User' });
      }

      const [company] = await db.select().from(schema.companies).where(eq(schema.companies.workspaceId, workspaceId)).limit(1);
      if (!company) {
        const [newCompany] = await db.insert(schema.companies).values({
          tenantId: tenant.id,
          workspaceId,
          name: `${workspace.name} Matriz`,
          status: 'Ativo',
        }).returning();
        
        try {
          await auditService.logEntityChange({
            tenantId: tenant.id,
            workspaceId: workspaceId,
            userId,
            action: 'COMPANY_HEALED',
            tableName: 'companies',
            recordId: String(newCompany[0].id),
          });
        } catch {}

        return await this.ensureAccount({ uid: userId, email: userRecord.email || '', displayName: userRecord.displayName || 'User' });
      }

      const [membership] = await db.select().from(schema.workspaceMembers).where(
        and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId))
      ).limit(1);

      if (!membership) {
        const [newMembership] = await safeInsertWorkspaceMember({
          workspaceId: workspace.id,
          userUid: userId,
          role: 'OWNER',
          cargo: 'Proprietário',
          department: 'Administração',
          teamName: 'Owner',
          status: 'Ativo',
          tenantId: tenant.id,
        });
        
        try {
          await auditService.logEntityChange({
            tenantId: tenant.id,
            workspaceId: workspaceId,
            userId,
            action: 'MEMBERSHIP_HEALED',
            tableName: 'workspace_members',
            recordId: String(newMembership[0].id),
          });
        } catch {}

        return {
          tenantId: tenant.id,
          workspaceId,
          companyId: company.id,
          userId,
          membershipId: newMembership[0].id,
          isNewTenant: false,
          isNewWorkspace: false,
          isNewCompany: false,
          isNewUser: false,
        };
      }

      try {
        await auditService.logEntityChange({
          tenantId: tenant.id,
          workspaceId: workspaceId,
          userId,
          action: 'ACCOUNT_HEALED',
          tableName: 'workspaces',
          recordId: String(workspaceId),
          newValues: { tenantId: tenant.id, workspaceId: workspaceId, companyId: company.id },
        });
      } catch {}

      return {
        tenantId: tenant.id,
        workspaceId,
        companyId: company.id,
        userId,
        membershipId: membership.id,
        isNewTenant: false,
        isNewWorkspace: false,
        isNewCompany: false,
        isNewUser: false,
      };
    } catch (error) {
      logger.error('HEAL_ACCOUNT', 'Error healing account', error);
      return null;
    }
  }

  private async ensureUser(tx: any, uid: string, email: string, displayName: string, photoUrl?: string) {
    const [existing] = await tx.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
    
    if (existing) {
      await tx.update(schema.users)
        .set({ displayName, email, photoUrl: photoUrl || existing.photoUrl, updatedAt: new Date() })
        .where(eq(schema.users.uid, uid));
      return existing;
    }

    const [user] = await tx.insert(schema.users).values({
      uid,
      email,
      displayName,
      photoUrl,
      currentPlan: 'free',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      settings: {},
    }).returning();

    return user;
  }

  private async ensureTenant(tx: any, userId: string, displayName: string): Promise<{ tenant: any; isNewTenant: boolean }> {
    const [userTenant] = await tx.select().from(schema.userTenants).where(eq(schema.userTenants.userId, userId)).limit(1);
    
    if (userTenant) {
      const [tenant] = await tx.select().from(schema.tenants).where(eq(schema.tenants.id, userTenant.tenantId)).limit(1);
      if (tenant) return { tenant, isNewTenant: false };
    }

    const slug = `tenant-${userId.toLowerCase()}-${Date.now()}`;
    const [tenant] = await tx.insert(schema.tenants).values({
      name: `${displayName}'s Organization`,
      slug,
      plan: 'Pro',
      status: 'Active',
    }).returning();

    return { tenant, isNewTenant: true };
  }

  private async ensurePrimaryWorkspace(tx: any, tenantId: string, userId: string, displayName: string): Promise<{ workspace: any; isNewWorkspace: boolean }> {
    const [existing] = await tx.select().from(schema.workspaces).where(eq(schema.workspaces.tenantId, tenantId)).limit(1);
    
    if (existing) {
      return { workspace: existing, isNewWorkspace: false };
    }

    const [workspace] = await tx.insert(schema.workspaces).values({
      tenantId,
      name: `${displayName}'s Workspace`,
      ownerUid: userId,
      plan: 'Pro',
      settings: {
        onboardingCompleted: false,
        businessName: displayName,
        createdAt: new Date().toISOString(),
      },
    }).returning();

    return { workspace, isNewWorkspace: true };
  }

  private async ensureCompany(tx: any, tenantId: string, workspaceId: number, name: string, data?: Partial<OnboardingCompanyInput>): Promise<{ company: any; isNewCompany: boolean }> {
    const [existing] = await tx.select().from(schema.companies).where(eq(schema.companies.workspaceId, workspaceId)).limit(1);
    
    if (existing) {
      return { company: existing, isNewCompany: false };
    }

    const [company] = await tx.insert(schema.companies).values({
      tenantId,
      workspaceId,
      name: data?.name || `${name} Matriz`,
      cnpj: data?.cnpj || null,
      status: 'Ativo',
      logoUrl: data?.logoUrl || null,
    }).returning();

    return { company, isNewCompany: true };
  }

  private async ensureOwnership(tx: any, tenantId: string, workspaceId: number, userId: string) {
    let existing: any = null;
    try {
      [existing] = await tx.select().from(schema.workspaceMembers).where(
        and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId))
      ).limit(1);
    } catch (err: any) {
      if (err && (err.code === '42703' || String(err.message || '').includes('onboarding_completed'))) {
        try {
          [existing] = await tx.select({ 
            id: schema.workspaceMembers.id, 
            tenantId: schema.workspaceMembers.tenantId, 
            workspaceId: schema.workspaceMembers.workspaceId, 
            userUid: schema.workspaceMembers.userUid, 
            role: schema.workspaceMembers.role 
          }).from(schema.workspaceMembers).where(
            and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId))
          ).limit(1);
        } catch (err2) {
          console.error('[ensureOwnership] Fallback select also failed:', err2);
          throw err2;
        }
      } else {
        throw err;
      }
    }

    if (existing) return existing;

    const [membership] = await tx.insert(schema.workspaceMembers).values({
      tenantId,
      workspaceId,
      userUid: userId,
      role: 'OWNER',
      cargo: 'Proprietário',
      department: 'Administração',
      teamName: 'Owner',
      status: 'Ativo',
      permissions: [],
      onboardingCompleted: false,
      xp: 0,
      careerLevel: 'Pleno',
    }).returning();

    return membership;
  }

  private async ensureActiveReferences(tx: any, userId: string, tenantId: string, workspaceId: number, companyId: number) {
    await tx.update(schema.users)
      .set({
        activeWorkspaceId: workspaceId,
        activeTenantId: tenantId,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.uid, userId));

    const [userTenant] = await tx.select().from(schema.userTenants).where(
      and(eq(schema.userTenants.userId, userId), eq(schema.userTenants.tenantId, tenantId))
    ).limit(1);

    if (!userTenant) {
      await tx.insert(schema.userTenants).values({
        userId,
        tenantId,
        role: 'OWNER',
        isOwner: true,
      });
    }
  }

  private async seedBosResources(tenantId: string, workspaceId: number) {
    const logger = getProvisioningLogger();
    try {
      await roleEngine.seedSystemRoles(tenantId);
    } catch (error) {
      logger?.warn('SEED_BOS_ROLES', 'Could not seed BOS roles', { params: { error: error instanceof Error ? error.message : String(error) } });
    }

    try {
      await moduleRegistry.registerBuiltinModules(tenantId);
    } catch (error) {
      logger?.warn('SEED_BOS_MODULES', 'Could not seed BOS modules', { params: { error: error instanceof Error ? error.message : String(error) } });
    }

    try {
      const context = {
        userId: '',
        tenantId,
        workspaceId,
      };
      
      await featureFlagService.createFlag({
        key: 'finance_module_enabled',
        name: 'Financeiro habilitado',
        isEnabled: true,
        scope: 'workspace',
        workspaceId,
        tenantId,
      });

      await featureFlagService.createFlag({
        key: 'crm_module_enabled',
        name: 'CRM habilitado',
        isEnabled: true,
        scope: 'workspace',
        workspaceId,
        tenantId,
      });

      await featureFlagService.createFlag({
        key: 'projects_module_enabled',
        name: 'Projetos habilitado',
        isEnabled: true,
        scope: 'workspace',
        workspaceId,
        tenantId,
      });
    } catch (error) {
      logger?.warn('SEED_FEATURE_FLAGS', 'Could not seed feature flags', { params: { error: error instanceof Error ? error.message : String(error) } });
    }

    authorizationEngine.invalidateAll();
  }

  private async initializeWorkspaceMissions(workspaceId: number) {
    const logger = getProvisioningLogger();
    try {
      const { MissionService } = await import('../services/MissionService.ts');
      await MissionService.initializeWorkspaceMissions(workspaceId);
    } catch (error) {
      logger?.warn('INIT_MISSIONS', 'Could not initialize missions', { params: { error: error instanceof Error ? error.message : String(error) } });
    }
  }

  private async applySegmentTemplate(workspaceId: number, tenantId: string, segment: BusinessSegment) {
    const logger = getProvisioningLogger();
    try {
      const { WorkspaceTemplateService } = await import('../services/WorkspaceTemplateService.ts');
      await WorkspaceTemplateService.applyTemplate(workspaceId, segment, tenantId);
    } catch (error) {
      logger?.warn('APPLY_TEMPLATE', 'Could not apply segment template', { params: { error: error instanceof Error ? error.message : String(error) } });
    }
  }

  async completeSetup(workspaceId: number, userId: string, setupData?: { businessType?: string; stage?: string }) {
    await db.transaction(async (tx) => {
      await tx.update(schema.workspaces)
        .set({
          settings: {
            onboardingCompleted: true,
            businessType: setupData?.businessType || 'general',
            stage: setupData?.stage || 'growth',
            completedAt: new Date().toISOString(),
          },
          updatedAt: new Date(),
        })
        .where(eq(schema.workspaces.id, workspaceId));

      await tx.update(schema.workspaceMembers)
        .set({ onboardingCompleted: true })
        .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId)));
    });

    authorizationEngine.invalidateAll();
  }
}

export const onboardingService = new OnboardingService();
