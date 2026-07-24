import { db } from '../db/index.ts';
import * as schema from '../db/schema.ts';
import { eq, and } from 'drizzle-orm';
import { authorizationEngine } from '../lib/bos/authorization/AuthorizationEngine';
import { roleEngine } from '../lib/bos/authorization/RoleEngine';
import { moduleRegistry } from '../lib/bos/module-registry/ModuleRegistry';
import { featureFlagService } from '../lib/bos/feature-flags/FeatureFlagService';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// ONBOARDING SERVICE - Centralized, idempotent, self-healing
// ============================================================================

export class OnboardingService {
  // -------------------------------------------------------------------------
  // MAIN ENTRY POINT
  // -------------------------------------------------------------------------

  async ensureAccount(
    firebaseUser: { uid: string; email: string; displayName?: string; photoUrl?: string },
    companyData?: Partial<OnboardingCompanyInput>
  ): Promise<OnboardingResult> {
    const userId = firebaseUser.uid;
    const email = firebaseUser.email || '';
    const displayName = firebaseUser.displayName || email.split('@')[0] || 'Usuário';

    // 1. Ensure user exists
    const user = await this.ensureUser(userId, email, displayName, firebaseUser.photoUrl);

    // 2. Ensure tenant exists
    const { tenant, isNewTenant } = await this.ensureTenant(userId, displayName);

    // 3. Ensure workspace exists (1:1 with tenant initially)
    const { workspace, isNewWorkspace } = await this.ensurePrimaryWorkspace(tenant.id, userId, displayName);

    // 4. Ensure company exists
    const companyName = companyData?.name || `${displayName}'s Company`;
    const { company, isNewCompany } = await this.ensureCompany(tenant.id, workspace.id, companyName, companyData);

    // 5. Ensure membership exists
    const membership = await this.ensureOwnership(tenant.id, workspace.id, userId);

    // 6. Ensure active references are set
    await this.ensureActiveReferences(userId, tenant.id, workspace.id, company.id);

    // 7. Seed BOS roles and modules (idempotent)
    await this.seedBosResources(tenant.id, workspace.id);

    // 8. Initialize workspace missions (idempotent)
    await this.initializeWorkspaceMissions(workspace.id);

    // 9. Apply segment template if new workspace
    if (isNewWorkspace && companyData?.segment) {
      await this.applySegmentTemplate(workspace.id, tenant.id, companyData.segment);
    }

    return {
      tenantId: tenant.id,
      workspaceId: workspace.id,
      companyId: company.id,
      userId,
      membershipId: membership.id,
      isNewTenant,
      isNewWorkspace,
      isNewCompany,
      isNewUser: user.createdAt > new Date(Date.now() - 60000), // created within last minute
    };
  }

  // -------------------------------------------------------------------------
  // SELF-HEALING
  // -------------------------------------------------------------------------

  async healAccount(userId: string): Promise<OnboardingResult | null> {
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
        return await this.ensureAccount({ uid: userId, email: userRecord.email || '', displayName: userRecord.displayName || 'User' });
      }

      const [membership] = await db.select().from(schema.workspaceMembers).where(
        and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId))
      ).limit(1);

      if (!membership) {
        const newMembership = await db.insert(schema.workspaceMembers).values({
          tenantId: tenant.id,
          workspaceId,
          userUid: userId,
          role: 'OWNER',
          cargo: 'Proprietário',
          department: 'Administração',
          teamName: 'Owner',
          status: 'Ativo',
        }).returning();
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
      console.error('[OnboardingService] Error healing account:', error);
      return null;
    }
  }

  // -------------------------------------------------------------------------
  // USER
  // -------------------------------------------------------------------------

  private async ensureUser(uid: string, email: string, displayName: string, photoUrl?: string) {
    const [existing] = await db.select().from(schema.users).where(eq(schema.users.uid, uid)).limit(1);
    
    if (existing) {
      await db.update(schema.users)
        .set({ displayName, email, photoUrl: photoUrl || existing.photoUrl, updatedAt: new Date() })
        .where(eq(schema.users.uid, uid));
      return existing;
    }

    const [user] = await db.insert(schema.users).values({
      uid,
      email,
      displayName,
      photoUrl,
      currentPlan: 'free',
      trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      settings: {},
    }).returning();

    return user;
  }

  // -------------------------------------------------------------------------
  // TENANT
  // -------------------------------------------------------------------------

  private async ensureTenant(userId: string, displayName: string): Promise<{ tenant: any; isNewTenant: boolean }> {
    // Check if user already has a tenant
    const [userTenant] = await db.select().from(schema.userTenants).where(eq(schema.userTenants.userId, userId)).limit(1);
    
    if (userTenant) {
      const [tenant] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, userTenant.tenantId)).limit(1);
      if (tenant) return { tenant, isNewTenant: false };
    }

    // Create new tenant
    const slug = `tenant-${userId.toLowerCase()}-${Date.now()}`;
    const [tenant] = await db.insert(schema.tenants).values({
      name: `${displayName}'s Organization`,
      slug,
      plan: 'Pro',
      status: 'Active',
    }).returning();

    return { tenant, isNewTenant: true };
  }

  // -------------------------------------------------------------------------
  // WORKSPACE
  // -------------------------------------------------------------------------

  private async ensurePrimaryWorkspace(tenantId: string, userId: string, displayName: string): Promise<{ workspace: any; isNewWorkspace: boolean }> {
    // Check if tenant already has a primary workspace
    const [existing] = await db.select().from(schema.workspaces).where(eq(schema.workspaces.tenantId, tenantId)).limit(1);
    
    if (existing) {
      return { workspace: existing, isNewWorkspace: false };
    }

    // Create primary workspace
    const [workspace] = await db.insert(schema.workspaces).values({
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

  // -------------------------------------------------------------------------
  // COMPANY
  // -------------------------------------------------------------------------

  private async ensureCompany(
    tenantId: string,
    workspaceId: number,
    name: string,
    data?: Partial<OnboardingCompanyInput>
  ): Promise<{ company: any; isNewCompany: boolean }> {
    const [existing] = await db.select().from(schema.companies).where(eq(schema.companies.workspaceId, workspaceId)).limit(1);
    
    if (existing) {
      return { company: existing, isNewCompany: false };
    }

    const [company] = await db.insert(schema.companies).values({
      tenantId,
      workspaceId,
      name: data?.name || `${name} Matriz`,
      cnpj: data?.cnpj || null,
      status: 'Ativo',
      logoUrl: data?.logoUrl || null,
    }).returning();

    return { company, isNewCompany: true };
  }

  // -------------------------------------------------------------------------
  // MEMBERSHIP
  // -------------------------------------------------------------------------

  private async ensureOwnership(tenantId: string, workspaceId: number, userId: string) {
    let existing: any = null;
    try {
      [existing] = await db.select().from(schema.workspaceMembers).where(
        and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId))
      ).limit(1);
    } catch (err: any) {
      // If the DB is missing newer columns (e.g. onboarding_completed), fall back to a safer minimal select
      if (err && (err.code === '42703' || String(err.message || '').includes('onboarding_completed'))) {
        try {
          [existing] = await db.select({ id: schema.workspaceMembers.id, tenantId: schema.workspaceMembers.tenantId, workspaceId: schema.workspaceMembers.workspaceId, userUid: schema.workspaceMembers.userUid, role: schema.workspaceMembers.role }).from(schema.workspaceMembers).where(
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

    const [membership] = await db.insert(schema.workspaceMembers).values({
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

  // -------------------------------------------------------------------------
  // ACTIVE REFERENCES
  // -------------------------------------------------------------------------

  private async ensureActiveReferences(userId: string, tenantId: string, workspaceId: number, companyId: number) {
    await db.update(schema.users)
      .set({
        activeWorkspaceId: workspaceId,
        activeTenantId: tenantId,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.uid, userId));

    // Ensure userTenants association
    const [userTenant] = await db.select().from(schema.userTenants).where(
      and(eq(schema.userTenants.userId, userId), eq(schema.userTenants.tenantId, tenantId))
    ).limit(1);

    if (!userTenant) {
      await db.insert(schema.userTenants).values({
        userId,
        tenantId,
        role: 'OWNER',
        isOwner: true,
      });
    }
  }

  // -------------------------------------------------------------------------
  // BOS RESOURCES
  // -------------------------------------------------------------------------

  private async seedBosResources(tenantId: string, workspaceId: number) {
    try {
      await roleEngine.seedSystemRoles(tenantId);
    } catch (error) {
      console.warn('[OnboardingService] Could not seed BOS roles:', error);
    }

    try {
      await moduleRegistry.registerBuiltinModules(tenantId);
    } catch (error) {
      console.warn('[OnboardingService] Could not seed BOS modules:', error);
    }

    try {
      const context = {
        userId: '',
        tenantId,
        workspaceId,
      };
      
      // Seed default feature flags
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
      console.warn('[OnboardingService] Could not seed feature flags:', error);
    }

    // Invalidate caches
    authorizationEngine.invalidateAll();
  }

  // -------------------------------------------------------------------------
  // MISSIONS
  // -------------------------------------------------------------------------

  private async initializeWorkspaceMissions(workspaceId: number) {
    try {
      const { MissionService } = await import('../services/MissionService.ts');
      await MissionService.initializeWorkspaceMissions(workspaceId);
    } catch (error) {
      console.warn('[OnboardingService] Could not initialize missions:', error);
    }
  }

  // -------------------------------------------------------------------------
  // TEMPLATES
  // -------------------------------------------------------------------------

  private async applySegmentTemplate(workspaceId: number, tenantId: string, segment: BusinessSegment) {
    try {
      const { WorkspaceTemplateService } = await import('../services/WorkspaceTemplateService.ts');
      await WorkspaceTemplateService.applyTemplate(workspaceId, segment, tenantId);
    } catch (error) {
      console.warn('[OnboardingService] Could not apply segment template:', error);
    }
  }

  // -------------------------------------------------------------------------
  // SETUP COMPLETION
  // -------------------------------------------------------------------------

  async completeSetup(workspaceId: number, userId: string, setupData?: { businessType?: string; stage?: string }) {
    await db.update(schema.workspaces)
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

    await db.update(schema.workspaceMembers)
      .set({ onboardingCompleted: true })
      .where(and(eq(schema.workspaceMembers.workspaceId, workspaceId), eq(schema.workspaceMembers.userUid, userId)));

    authorizationEngine.invalidateAll();
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const onboardingService = new OnboardingService();
