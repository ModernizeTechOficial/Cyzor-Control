import { Router } from "express";
import multer from "multer";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { tenantMiddleware, TenantRequest } from "../middleware/tenant.ts";
import { BESIntegrationService } from "../services/BESIntegrationService.ts";
import { BusinessEventTranslator } from "../services/BusinessEventTranslator.ts";
import { TechnicalEvent } from "../types/domainEvents.ts";
import { MissionService } from "../services/MissionService.ts";
import { db } from "./index.ts";
import { companies, clients, products, projects, tasks, ideas, documents, financeEntries, sprints, milestones, aiMemories, notifications, agendaEvents, users, workspaceMembers, workspaces, workspaceTeams, workspaceDepartments, flows, notes, deploys, productLicenses, workspaceInvitations, auditLogs, entityComments, entityApprovals, roadmaps, entityTemplates, timelineActivities, professionalProfiles, professionalEvolutionEvents, professionalGoals, professionalCertifications, platformSettings } from "./schema.ts";
import { eq, and, desc, sql, or, inArray, gte, lte, not } from "drizzle-orm";
import { getUserSaaSState } from "./queries.ts";
import { hasPermission, getMemberRole, sanitizePermissionsForRole, validateRolePermissionAssignment, isWorkspaceRole, WorkspaceRole } from "./permissions.ts";
import { enforcePermission } from '../middleware/permission.ts';
import { authorizationEngine, policyEngine, moduleRegistry, featureFlagService } from '../lib/bos/index.ts';

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { "User-Agent": "aistudio-build" } }
});
import { sendProjectNotificationEmail, sendWorkspaceInvitationEmail, testSmtpConnection } from "./mail.ts";
import { onboardingService } from '../services/OnboardingService.ts';
import { generateNodeDefinition, executeOperationalAgent } from "../lib/gemini.ts";
import { randomUUID } from 'crypto';

const apiRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

apiRouter.post("/upload", upload.single('file'), (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }
    const base64 = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
    res.json({ url: dataUrl });
  } catch (error: any) {
    console.error("Erro no upload:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- AUDIT LOG HELPER ---
async function logAction(req: AuthRequest, action: string, tableName: string, recordId: string, oldValues?: any, newValues?: any) {
  try {
    await db.insert(auditLogs).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId,
      userId: req.user!.uid,
      action,
      tableName,
      recordId: recordId.toString(),
      oldValues,
      newValues,
      ipAddress: req.ip
    });
  } catch (err) {
    console.error("Error creating audit log:", err);
  }
}

apiRouter.use((req, res, next) => {
  console.log(`[apiRouter Request] ${req.method} ${req.url}`);
  next();
});

// --- NAVIGATION BADGES ---
apiRouter.get("/navigation/badges", requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    
    // 1. Projects badge: Projects that are not completed or cancelled
    const activeProjects = await db.select().from(projects).where(
      and(
        eq(projects.workspaceId, workspaceId),
        not(inArray(sql`UPPER(${projects.status})`, ['CONCLUÍDO', 'CANCELADO']))
      )
    );
    
    // 2. Finance badge: Recent entries (e.g., from the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentFinance = await db.select().from(financeEntries).where(
      and(
        eq(financeEntries.workspaceId, workspaceId),
        gte(financeEntries.date, thirtyDaysAgo)
      )
    );

    // 3. AI Insights badge: Recommendations/Risks from AI memory or just recent ones
    // For now, let's count active memories that are highly important
    const importantMemories = await db.select().from(aiMemories).where(
      and(
        eq(aiMemories.workspaceId, workspaceId),
        gte(aiMemories.importance, 8)
      )
    );

    res.json({
      projetos: activeProjects.length,
      financeiro: recentFinance.length,
      ia: importantMemories.length || 3 // Fallback if no memories found for visual feedback
    });
  } catch (error: any) {
    console.error("Error fetching navigation badges:", error);
    res.status(500).json({ error: "Failed to fetch navigation badges" });
  }
});

apiRouter.get("/branding", async (req, res) => {
  try {
    const { stripeConfig } = await import('./schema.ts');
    const config = await db.select().from(stripeConfig).limit(1);
    if (config.length > 0) {
      res.json({
        globalLogoUrl: config[0].globalLogoUrl,
        globalIconUrl: config[0].globalIconUrl,
        loginHeroUrl: config[0].loginHeroUrl,
        globalLogoSize: config[0].globalLogoSize,
        globalIconSize: config[0].globalIconSize,
        globalAppName: config[0].globalAppName
      });
    } else {
      res.json({
        globalLogoUrl: null,
        globalIconUrl: null,
        loginHeroUrl: null,
        globalLogoSize: '40',
        globalIconSize: '20',
        globalAppName: 'CYZOR'
      });
    }
  } catch (error: any) {
    console.error("Error fetching branding:", error);
    res.status(500).json({ error: error.message });
  }
});

// Onboarding endpoint: ensures complete account structure and marks setup complete
apiRouter.post('/onboarding', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.uid;
    const { name, cnpj, country, language, segment, logoUrl } = req.body || {};

    if (!name || !country || !language || !segment) {
      return res.status(400).json({ error: 'Missing required onboarding fields' });
    }

    const result = await onboardingService.ensureAccount(
      {
        uid: userId,
        email: req.user!.email || '',
        displayName: req.user!.displayName || name,
        photoUrl: req.user!.photoURL,
      },
      {
        name,
        cnpj,
        country,
        language,
        segment: segment || 'general',
        logoUrl,
      }
    );

    await onboardingService.completeSetup(result.workspaceId, result.userId, {
      businessType: segment,
      stage: 'growth',
    });

    res.json({ success: true, result });
  } catch (error: any) {
    console.error('Error in /onboarding:', error);
    res.status(500).json({ error: error.message || 'Failed to complete onboarding' });
  }
});

// Lightweight auth sync endpoint: allows client to sync Firebase user to local DB
// NOTE: This is intentionally permissive for local/dev environments — it upserts
// a user record based on the payload sent by the client. If you run in production
// consider protecting this route with proper token verification.
apiRouter.post('/auth/sync', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { uid, email, name, picture } = req.body || {};
    if (!uid) return res.status(400).json({ error: 'uid is required' });

    const user = await getOrCreateUser(uid, email || '', name, picture);
    res.json({ user });
  } catch (error) {
    console.error('Error in /auth/sync:', error);
    res.status(500).json({ error: 'Failed to sync auth user' });
  }
});

apiRouter.get('/invite/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'Invitation token is required' });

    const [invitation] = await db.select()
      .from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.token, token), eq(workspaceInvitations.status, 'PENDING')))
      .limit(1);

    if (!invitation) return res.status(404).json({ error: 'Convite inválido ou já utilizado' });

    if (new Date(invitation.expiresAt) < new Date()) {
      await db.update(workspaceInvitations)
        .set({ status: 'EXPIRED' })
        .where(eq(workspaceInvitations.id, invitation.id));
      return res.status(410).json({ error: 'O convite expirou' });
    }

    const [workspace] = await db.select({ id: workspaces.id, name: workspaces.name }).from(workspaces).where(eq(workspaces.id, invitation.workspaceId)).limit(1);
    if (!workspace) return res.status(404).json({ error: 'Workspace associado ao convite não encontrado' });

    res.json({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      teamName: invitation.teamName,
      department: invitation.department,
      cargo: invitation.cargo,
      workspaceId: invitation.workspaceId,
      workspaceName: workspace.name,
      expiresAt: invitation.expiresAt,
      status: invitation.status,
      inviterUid: invitation.inviterUid,
      createdAt: invitation.createdAt,
    });
  } catch (error) {
    console.error('Error fetching invite preview:', error);
    res.status(500).json({ error: 'Failed to fetch invite preview' });
  }
});

apiRouter.get('/auth/effective-permissions', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const context = {
      userId: req.user!.uid,
      tenantId: req.tenantId as string,
      workspaceId: req.workspaceId as number,
      tenant: req.user?.tenant ? { id: req.user.tenant.id, name: req.user.tenant.name, slug: req.user.tenant.slug, plan: req.user.tenant.plan } : undefined,
    };
    const result = await authorizationEngine.getEffectivePermissions(context);
    return res.json({ permissions: Array.from(result.combined) });
  } catch (error: any) {
    console.error('Error fetching effective permissions:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch effective permissions' });
  }
});

apiRouter.get('/auth/accessible-modules', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const context = {
      userId: req.user!.uid,
      tenantId: req.tenantId as string,
      workspaceId: req.workspaceId as number,
      tenant: req.user?.tenant ? { id: req.user.tenant.id, name: req.user.tenant.name, slug: req.user.tenant.slug, plan: req.user.tenant.plan } : undefined,
    };

    const accessibleSlugs = await authorizationEngine.getAccessibleModules(context);
    const allModules = await moduleRegistry.getAllModules(context.tenantId, context.workspaceId);
    const modules = Array.isArray(allModules)
      ? allModules.filter((m) => accessibleSlugs.includes(m.slug) || m.isSystem)
      : [];

    return res.json({ modules });
  } catch (error: any) {
    console.error('Error fetching accessible modules:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch accessible modules' });
  }
});

// --- ONBOARDING API (client-safe)
apiRouter.post('/onboarding', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const { name, cnpj, country, language, segment, logoUrl } = req.body || {};
    const firebaseUser = {
      uid: req.user!.uid,
      email: req.user!.email || '',
      displayName: req.user!.name || req.user!.displayName || (req.user!.email || '').split('@')[0],
      photoUrl: (req.user as any)?.picture || (req.user as any)?.photoURL || null,
    };

    const result = await onboardingService.ensureAccount(firebaseUser, {
      name: name || `${firebaseUser.displayName}'s Company`,
      cnpj: cnpj || undefined,
      country: country || 'BR',
      language: language || 'pt-BR',
      segment: segment || 'general',
      logoUrl: logoUrl || undefined,
    });

    // Complete setup (mark onboarding finished)
    await onboardingService.completeSetup(result.workspaceId, result.userId, {
      businessType: segment || 'general',
      stage: 'growth',
    });

    return res.json(result);
  } catch (error: any) {
    console.error('[api onboarding] Error:', error);
    return res.status(500).json({ error: error?.message || 'Onboarding failed' });
  }
});

apiRouter.get('/auth/features/:featureKey', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const featureKey = req.params.featureKey;
    const enabled = await featureFlagService.isEnabled(featureKey, req.tenantId as string, req.workspaceId as number);
    return res.json({ enabled });
  } catch (error: any) {
    console.error('Error checking feature flag:', error);
    return res.status(500).json({ error: error.message || 'Failed to check feature flag' });
  }
});

apiRouter.get('/auth/modules', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const context = {
      userId: req.user!.uid,
      tenantId: req.tenantId as string,
      workspaceId: req.workspaceId as number,
    };
    const modules = await moduleRegistry.getAllModules(context.tenantId, context.workspaceId);
    return res.json({ modules: modules.map(m => ({ id: m.slug, name: m.name, icon: m.icon, category: m.category })) });
  } catch (error: any) {
    console.error('Error fetching modules:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch modules' });
  }
});

apiRouter.get('/auth/can', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const permission = String(req.query.permission || '');
    if (!permission) return res.status(400).json({ error: 'Permission is required' });
    const resourceType = typeof req.query.resourceType === 'string' ? req.query.resourceType : undefined;
    const resourceId = req.query.resourceId !== undefined ? Number(req.query.resourceId) : undefined;
    const context = {
      userId: req.user!.uid,
      tenantId: req.tenantId as string,
      workspaceId: req.workspaceId as number,
      tenant: req.user?.tenant ? { id: req.user.tenant.id, name: req.user.tenant.name, slug: req.user.tenant.slug, plan: req.user.tenant.plan } : undefined,
    };
    const result = await authorizationEngine.can(context, permission, resourceType, resourceId);
    return res.json({ allowed: result.allowed, reason: result.reason || null, permissions: Array.from(result.permissions) });
  } catch (error: any) {
    console.error('Error checking permission:', error);
    return res.status(500).json({ error: error.message || 'Failed to check permission' });
  }
});

apiRouter.get('/auth/policy', requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) => {
  try {
    const resource = String(req.query.resource || '');
    const action = String(req.query.action || '');
    if (!resource || !action) return res.status(400).json({ error: 'Resource and action are required' });
    const context = {
      userId: req.user!.uid,
      tenantId: req.tenantId as string,
      workspaceId: req.workspaceId as number,
      tenant: req.user?.tenant ? { id: req.user.tenant.id, name: req.user.tenant.name, slug: req.user.tenant.slug, plan: req.user.tenant.plan } : undefined,
    };
    const result = await policyEngine.can(context, resource, action);
    return res.json({ allowed: result.allowed, reason: result.reason || null, permissions: Array.from(result.permissions) });
  } catch (error: any) {
    console.error('Error checking policy:', error);
    return res.status(500).json({ error: error.message || 'Failed to check policy' });
  }
});

apiRouter.post('/invite/:token/accept', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { token } = req.params;
    if (!token) return res.status(400).json({ error: 'Invitation token is required' });

    const [invitation] = await db.select().from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.token, token), eq(workspaceInvitations.status, 'PENDING')))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({ error: 'Convite inválido ou já utilizado' });
    }

    if (invitation.email && invitation.email.trim()) {
      const normalizedInvitationEmail = invitation.email.trim().toLowerCase();
      const userEmail = req.user?.email?.trim().toLowerCase();
      if (!userEmail || userEmail !== normalizedInvitationEmail) {
        return res.status(403).json({ error: 'Faça login com o mesmo e-mail do convite para aceitar.' });
      }
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await db.update(workspaceInvitations)
        .set({ status: 'EXPIRED' })
        .where(eq(workspaceInvitations.id, invitation.id));
      return res.status(410).json({ error: 'O convite expirou' });
    }

    const [workspace] = await db.select({ id: workspaces.id, name: workspaces.name }).from(workspaces).where(eq(workspaces.id, invitation.workspaceId)).limit(1);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace associado ao convite não encontrado' });
    }

    const [existingMembership] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, invitation.workspaceId), eq(workspaceMembers.userUid, req.user!.uid)))
      .limit(1);

    if (!existingMembership) {
      await db.insert(workspaceMembers).values({
        tenantId: invitation.tenantId,
        workspaceId: invitation.workspaceId,
        userUid: req.user!.uid,
        role: invitation.role,
        cargo: invitation.cargo || 'Convidado',
        department: invitation.department || 'Geral',
        teamName: invitation.teamName || 'Equipe convidada',
        status: 'Ativo'
      });
    }

    const [updatedInvitation] = await db.update(workspaceInvitations)
      .set({ status: 'ACCEPTED' })
      .where(eq(workspaceInvitations.id, invitation.id))
      .returning();

    await logAction(req, 'ACCEPT_INVITE', 'workspace_invitations', invitation.id.toString(), invitation, updatedInvitation[0] || updatedInvitation);

    const [userRecord] = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRecord) {
      await db.update(users).set({ activeWorkspaceId: invitation.workspaceId }).where(eq(users.uid, req.user!.uid));
    }

    res.json({ success: true, workspaceId: invitation.workspaceId, accepted: true });
  } catch (error) {
    console.error('Error accepting invitation token:', error);
    res.status(500).json({ error: 'Failed to accept invitation token' });
  }
});

apiRouter.use(requireAuth);
apiRouter.use(tenantMiddleware as any);

apiRouter.post("/workspace/invitations/accept", async (req: AuthRequest, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Invitation token is required" });

    const [invitation] = await db.select().from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.token, token), eq(workspaceInvitations.status, 'PENDING')))
      .limit(1);

    if (!invitation) {
      return res.status(404).json({ error: "Convite inválido ou já utilizado" });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      await db.update(workspaceInvitations)
        .set({ status: 'EXPIRED' })
        .where(eq(workspaceInvitations.id, invitation.id));
      return res.status(400).json({ error: "O convite expirou" });
    }

    const [existingMember] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, invitation.workspaceId), eq(workspaceMembers.userUid, req.user!.uid)))
      .limit(1);

    if (!existingMember) {
      const acceptedRole = isWorkspaceRole(invitation.role) ? invitation.role as WorkspaceRole : WorkspaceRole.MEMBER;
      const entryPermissions = sanitizePermissionsForRole(acceptedRole, invitation.permissions || []);
      await db.insert(workspaceMembers).values({
        tenantId: invitation.tenantId,
        workspaceId: invitation.workspaceId,
        userUid: req.user!.uid,
        role: acceptedRole,
        cargo: invitation.cargo || 'Convidado',
        department: invitation.department || 'Geral',
        teamName: invitation.teamName || 'Equipe convidada',
        permissions: entryPermissions,
        status: 'Ativo'
      });
    }

    const [updatedInvitation] = await db.update(workspaceInvitations)
      .set({ status: 'ACCEPTED' })
      .where(eq(workspaceInvitations.id, invitation.id))
      .returning();

    await logAction(req, 'ACCEPT_INVITE', 'workspace_invitations', invitation.id.toString(), invitation, updatedInvitation[0] || updatedInvitation);

    const [userRecord] = await db.select().from(users).where(eq(users.uid, req.user!.uid)).limit(1);
    if (userRecord && !userRecord.activeWorkspaceId) {
      await db.update(users).set({ activeWorkspaceId: invitation.workspaceId }).where(eq(users.uid, req.user!.uid));
    }

    res.json({ success: true, workspaceId: invitation.workspaceId, accepted: true });
  } catch (error) {
    console.error("Error accepting invitation:", error);
    res.status(500).json({ error: "Failed to accept invitation" });
  }
});

apiRouter.get("/plans", async (req: AuthRequest, res) => {
  try {
    const { plans } = await import('./schema.ts');
    const { desc } = await import('drizzle-orm');
    const allPlans = await db.select().from(plans).where(eq(plans.isActive, true)).orderBy(desc(plans.createdAt));
    res.json(allPlans);
  } catch (error: any) {
    console.error("Error fetching plans:", error);
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get("/user/profile", async (req: AuthRequest, res) => {
  try {
    const { users } = await import('./schema.ts');
    const user = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (user.length > 0) {
      res.json(user[0]);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post("/user/complete-tour", async (req: AuthRequest, res) => {
  try {
    const { users } = await import('./schema.ts');
    await db.update(users).set({ tourCompleted: true }).where(eq(users.uid, req.user.uid));
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.use(tenantMiddleware as any);

// Auto-enforce permissions for mutating routes (POST/PUT/DELETE)
apiRouter.use((req: any, res: any, next: any) => {
  try {
    const method = req.method.toUpperCase();
    if (!['POST', 'PUT', 'DELETE'].includes(method)) return next();

    const segments = (req.path || req.url || '').split('/').filter(Boolean);
    const resource = segments[0] || '';
    let permission = '';

    if (resource === 'workspace' || resource === 'workspaces') {
      const sub = segments[1] || '';
      if (sub === 'members' || sub === 'invitations') permission = 'manage_members';
      else if (sub === 'teams' || sub === 'departments') permission = 'manage_organization';
      else permission = 'manage_workspaces';
    } else {
      switch (resource) {
        case 'projects': permission = 'manage_projects'; break;
        case 'clients': permission = 'manage_clients'; break;
        case 'companies': permission = 'manage_companies'; break;
        case 'ideas': permission = 'manage_ideas'; break;
        case 'products': permission = 'manage_products'; break;
        case 'tasks': permission = 'manage_tasks'; break;
        case 'sprints': permission = 'manage_sprints'; break;
        case 'templates': case 'entityTemplates': permission = 'manage_templates'; break;
        case 'documents': permission = 'manage_documents'; break;
        case 'deploys': permission = 'manage_deploys'; break;
        case 'finance': permission = 'manage_finance'; break;
        case 'approvals': permission = 'manage_approvals'; break;
        case 'comments': permission = 'manage_comments'; break;
        case 'activities': permission = 'manage_activities'; break;
        case 'notifications': permission = 'manage_notifications'; break;
        case 'agenda': permission = 'manage_agenda'; break;
        case 'milestones': permission = 'manage_milestones'; break;
        default: permission = 'manage_workspace';
      }
    }

    if (permission) {
      // Call enforcePermission middleware dynamically
      return (enforcePermission(permission) as any)(req, res, next);
    }
    return next();
  } catch (err) {
    console.error('Auto permission middleware error:', err);
    return next();
  }
});

import { processAIChat, generateProactiveInsights, getAIInstance, generateEntityInsights } from './aiModel.ts';

// --- AI INSIGHTS ---
apiRouter.get("/ai/insights", async (req: AuthRequest, res) => {
  try {
    const insights = await generateProactiveInsights(req.workspaceId!);
    res.json(insights);
  } catch (error: any) {
    console.error("Error in /api/ai/insights route:", error);
    res.status(500).json({ error: "Failed to generate insights" });
  }
});

apiRouter.post("/ai/entity-insights", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityData } = req.body;
    const insights = await generateEntityInsights(req.workspaceId!, entityType, entityData);
    res.json({ insights });
  } catch (error: any) {
    console.error("Error in /api/ai/entity-insights route:", error);
    res.status(500).json({ error: "Failed to generate entity insights" });
  }
});

// --- AI MEMORY STATS ---
apiRouter.get("/ai/memory-stats", async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const companiesList = await db.select().from(companies).where(eq(companies.workspaceId, workspaceId));
    const productsList = await db.select().from(products).where(eq(products.workspaceId, workspaceId));
    const projectsList = await db.select().from(projects).where(eq(projects.workspaceId, workspaceId));
    const ideasList = await db.select().from(ideas).where(eq(ideas.workspaceId, workspaceId));
    const docsList = await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
    
    // We already query the finance sync status in general if it exists
    const financesCount = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, workspaceId));

    res.json({
      companies: companiesList.length,
      products: productsList.length,
      projects: projectsList.filter(p => !['CANCELLED', 'COMPLETED'].includes(p.status)).length,
      ideas: ideasList.length,
      documents: docsList.length,
      financeSync: financesCount.length > 0
    });
  } catch (error: any) {
    console.error("Error fetching memory stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// --- AI MEMORIES ---
apiRouter.get("/ai/memories", async (req: AuthRequest, res) => {
  try {
    const memories = await db.select().from(aiMemories).where(eq(aiMemories.workspaceId, req.workspaceId!)).orderBy(desc(aiMemories.importance));
    res.json(memories);
  } catch (error: any) {
    console.error("Error fetching memories:", error);
    res.status(500).json({ error: "Failed to fetch memories" });
  }
});

// --- GEMINI DIRECT ---
apiRouter.post("/gemini", async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = await getAIInstance(req.workspaceId!);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini route:", error);
    if (error.message && error.message.includes("503")) {
      res.status(503).json({ error: "O serviço de IA está sobrecarregado no momento. Tente novamente em alguns segundos." });
    } else {
      res.status(500).json({ error: error.message || "Erro interno ao processar pela IA" });
    }
  }
});

// --- WORKSPACES ---
apiRouter.get("/workspaces", async (req: AuthRequest, res) => {
  try {
    const data = await db.select({
      id: workspaces.id,
      name: workspaces.name,
      ownerUid: workspaces.ownerUid,
      settings: workspaces.settings,
      createdAt: workspaces.createdAt,
      role: workspaceMembers.role
    })
    .from(workspaces)
    .innerJoin(workspaceMembers, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userUid, req.user!.uid));
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ error: "Failed to fetch workspaces" });
  }
});

apiRouter.post("/workspaces", async (req: AuthRequest, res) => {
  try {
    const { name, description, segment } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });

    const [newWs] = await db.insert(workspaces).values({
      name,
      tenantId: req.tenantId as any,
      ownerUid: req.user!.uid,
      settings: { description, segment: segment || 'General', stage: segment === 'SaaS' ? 'Produto' : (segment === 'Serviços' ? 'Clientes' : 'Ideia'), besScore: 120, besMaturity: 1.2, professionalEvolution: { xpTotal: 120 } }
    }).returning();

    // Add owner as member
    await db.insert(workspaceMembers).values({
      workspaceId: newWs.id,
      userUid: req.user!.uid,
      tenantId: req.tenantId as any,
      role: 'OWNER',
      cargo: 'Proprietário'
    });

    // Ensure a Company exists for this Workspace (one-to-one)
    try {
      const [existingCompany] = await db.select().from(companies).where(eq(companies.workspaceId, newWs.id)).limit(1);
      if (!existingCompany) {
        const [newCompany] = await db.insert(companies).values({
          workspaceId: newWs.id,
          tenantId: req.tenantId as any,
          name: `${newWs.name} Matriz`,
          status: 'Ativo'
        }).returning();
        await logAction(req, 'CREATE', 'companies', String(newCompany.id), null, newCompany);
      }
    } catch (err) {
      // If uniqueness constraint or other race occurs, log and continue — workspace created successfully
      console.warn('Warning while auto-creating company for workspace:', err?.message || err);
    }

    if (segment && ['SaaS', 'Serviços', 'E-commerce'].includes(segment)) {
      try {
        const { WorkspaceTemplateService } = await import("../services/WorkspaceTemplateService.ts");
        await WorkspaceTemplateService.applyTemplate(newWs.id, segment, req.tenantId as any);
      } catch (err) {
        console.error("Failed to apply workspace segment template:", err);
      }
    }

    await logAction(req, 'CREATE', 'workspaces', newWs.id.toString(), null, newWs);
    res.json(newWs);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

apiRouter.put("/workspaces/:id", async (req: AuthRequest, res) => {
  try {
    const wsId = Number(req.params.id);
    const { name, settings } = req.body;
    
    const canManageSettings = await hasPermission(req.user!.uid, wsId, 'manage_settings');
    if (!canManageSettings) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Fetch existing workspace
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, wsId)).limit(1);
    if (!ws) return res.status(404).json({ error: "Workspace not found" });

    const updateValues: any = {};
    if (name !== undefined) updateValues.name = name;
    if (settings !== undefined) {
      updateValues.settings = {
        ...(ws.settings as any || {}),
        ...settings
      };
    }

    const [updatedWs] = await db.update(workspaces)
      .set(updateValues)
      .where(eq(workspaces.id, wsId))
      .returning();

    await logAction(req, 'UPDATE', 'workspaces', wsId.toString(), ws, updatedWs);
    res.json(updatedWs);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ error: "Failed to update workspace" });
  }
});

apiRouter.put("/user/active-workspace", async (req: AuthRequest, res) => {
  try {
    const { workspaceId } = req.body;
    if (!workspaceId) return res.status(400).json({ error: "workspaceId is required" });

    // Verify membership
    const [membership] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userUid, req.user!.uid)))
      .limit(1);

    if (!membership) return res.status(403).json({ error: "Not a member of this workspace" });

    await db.update(users).set({ activeWorkspaceId: workspaceId }).where(eq(users.uid, req.user!.uid));
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating active workspace:", error);
    res.status(500).json({ error: "Failed to update active workspace" });
  }
});

// --- WORKSPACE MEMBERS & TEAM ---
apiRouter.get("/workspace/members", async (req: AuthRequest, res) => {
  try {
    console.log(`[Members] Request by user=${req.user?.uid || 'anonymous'} workspaceId=${req.workspaceId} tenantId=${req.tenantId} AuthHeader=${!!req.headers.authorization}`);
    const data = await db.select({
      id: workspaceMembers.id,
      userUid: workspaceMembers.userUid,
      uid: users.uid,
      role: workspaceMembers.role,
      cargo: workspaceMembers.cargo,
      createdAt: workspaceMembers.createdAt,
      userName: users.displayName,
      userEmail: users.email,
      userPhoto: users.photoUrl
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userUid, users.uid))
    .where(eq(workspaceMembers.workspaceId, req.workspaceId!));

    // If the older schema lacks managerUid, skip fetching manager names
    const firstRow: any = data[0] as any;
    const managerUids: string[] = (firstRow && Object.prototype.hasOwnProperty.call(firstRow, 'managerUid'))
      ? Array.from(new Set((data as any).map((m: any) => m.managerUid).filter(Boolean))) as string[]
      : [];

    let managerMap: Record<string, string> = {};
    if (managerUids.length > 0) {
      const managers = await db.select({ uid: users.uid, displayName: users.displayName, email: users.email })
        .from(users)
        .where(inArray(users.uid, managerUids));
      managers.forEach(m => {
        managerMap[m.uid] = m.displayName || m.email;
      });
    }

    const membersWithDetails = (data as any).map((m: any) => ({
      ...m,
      managerName: m.managerUid ? managerMap[m.managerUid] || 'Gestor' : undefined,
      // keep backward-compatible shape: expose managerUid if it exists
      managerUid: Object.prototype.hasOwnProperty.call(m, 'managerUid') ? m.managerUid : undefined
    }));
    
    res.json(membersWithDetails);
  } catch (error) {
    console.error("Error fetching members:", error && (error.stack || error.message || error));
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

apiRouter.put("/workspace/members/:id", async (req: AuthRequest, res) => {
  try {
    const { role, cargo, department, teamName, managerUid, permissions, status, careerLevel } = req.body;
    const memberId = Number(req.params.id);

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [oldMember] = await db.select({ id: workspaceMembers.id }).from(workspaceMembers).where(eq(workspaceMembers.id, memberId)).limit(1);
    if (!oldMember) return res.status(404).json({ error: "Member not found" });

    const updateValues: any = {};
    if (role !== undefined) updateValues.role = role;
    if (cargo !== undefined) updateValues.cargo = cargo;
    if (department !== undefined) updateValues.department = department;
    if (teamName !== undefined) updateValues.teamName = teamName;
    if (managerUid !== undefined) updateValues.managerUid = managerUid;
    if (permissions !== undefined) updateValues.permissions = permissions;
    if (status !== undefined) updateValues.status = status;
    if (careerLevel !== undefined) updateValues.careerLevel = careerLevel;

    if (Object.keys(updateValues).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const [updated] = await db.update(workspaceMembers)
      .set(updateValues)
      .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.workspaceId, req.workspaceId!)))
      .returning();

    await logAction(req, 'UPDATE_MEMBER_ASSIGNMENT', 'workspace_members', memberId.toString(), oldMember, updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating member:", error);
    res.status(500).json({ error: "Failed to update member" });
  }
});

apiRouter.delete("/workspace/members/:id", async (req: AuthRequest, res) => {
  try {
    const memberId = Number(req.params.id);

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [deleted] = await db.delete(workspaceMembers)
      .where(and(eq(workspaceMembers.id, memberId), eq(workspaceMembers.workspaceId, req.workspaceId!)))
      .returning();

    if (deleted) {
      await logAction(req, 'DELETE', 'workspace_members', memberId.toString(), deleted, null);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

// --- WORKSPACE TEAMS ---
apiRouter.get("/workspace/teams", async (req: AuthRequest, res) => {
  try {
    const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const settings = (workspace?.settings || {}) as any;
    const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];

    const memberMap = new Map<string, any>();
    const members = await db.select({
      id: workspaceMembers.id,
      userUid: workspaceMembers.userUid,
      role: workspaceMembers.role,
      cargo: workspaceMembers.cargo,
      createdAt: workspaceMembers.createdAt,
      userName: users.displayName,
      userEmail: users.email,
      userPhoto: users.photoUrl,
    })
      .from(workspaceMembers)
      .innerJoin(users, eq(workspaceMembers.userUid, users.uid))
      .where(eq(workspaceMembers.workspaceId, req.workspaceId!));

    members.forEach((member) => memberMap.set(String(member.id), member));

    const enrichedTeams = teams.map((team: any) => {
      const ownerMember = memberMap.get(String(team.ownerId || '')) || members.find((member) => member.userUid === team.ownerUid);
      return {
        ...team,
        owner: ownerMember?.userName || team.owner || 'A definir',
        memberIds: Array.isArray(team.memberIds) ? team.memberIds : [],
      };
    });

    res.json(enrichedTeams);
  } catch (error) {
    console.error("Error fetching workspace teams:", error);
    res.status(500).json({ error: "Failed to fetch workspace teams" });
  }
});

apiRouter.post("/workspace/teams", async (req: AuthRequest, res) => {
  try {
    const { name, description, ownerId, memberIds } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "O nome do time é obrigatório." });

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const settings = (workspace?.settings || {}) as any;
    const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];

    const createdTeam = {
      id: `team-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || 'Time criado pelo console operacional de workspaces.',
      ownerId: ownerId || req.user!.uid,
      memberIds: Array.isArray(memberIds) ? memberIds.map(Number).filter(Boolean) : [],
      createdAt: new Date().toISOString(),
    };

    await db.update(workspaces)
      .set({ settings: { ...settings, organizationalTeams: [createdTeam, ...teams] } })
      .where(eq(workspaces.id, req.workspaceId!));

    await logAction(req, 'CREATE', 'workspace_teams', createdTeam.id, null, createdTeam);
    res.status(201).json(createdTeam);
  } catch (error) {
    console.error("Error creating workspace team:", error);
    res.status(500).json({ error: "Failed to create workspace team" });
  }
});

apiRouter.put("/workspace/teams/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, description, ownerId, memberIds } = req.body;

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const settings = (workspace?.settings || {}) as any;
    const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];
    const targetIndex = teams.findIndex((team: any) => team.id === id);

    if (targetIndex === -1) {
      return res.status(404).json({ error: "Team not found" });
    }

    const current = teams[targetIndex];
    const updatedTeam = {
      ...current,
      name: name?.trim() || current.name,
      description: description?.trim() || current.description,
      ownerId: ownerId ?? current.ownerId,
      memberIds: Array.isArray(memberIds) ? memberIds.map(Number).filter(Boolean) : current.memberIds || [],
    };

    teams[targetIndex] = updatedTeam;
    await db.update(workspaces)
      .set({ settings: { ...settings, organizationalTeams: teams } })
      .where(eq(workspaces.id, req.workspaceId!));

    await logAction(req, 'UPDATE', 'workspace_teams', id, current, updatedTeam);
    res.json(updatedTeam);
  } catch (error) {
    console.error("Error updating workspace team:", error);
    res.status(500).json({ error: "Failed to update workspace team" });
  }
});

apiRouter.delete("/workspace/teams/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [workspace] = await db.select({ settings: workspaces.settings }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const settings = (workspace?.settings || {}) as any;
    const teams = Array.isArray(settings.organizationalTeams) ? settings.organizationalTeams : [];
    const filteredTeams = teams.filter((team: any) => team.id !== id);

    await db.update(workspaces)
      .set({ settings: { ...settings, organizationalTeams: filteredTeams } })
      .where(eq(workspaces.id, req.workspaceId!));

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace team:", error);
    res.status(500).json({ error: "Failed to delete workspace team" });
  }
});

// --- INVITATIONS ---
apiRouter.get("/workspace/invitations", async (req: AuthRequest, res) => {
  try {
    const canManageInvites = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageInvites) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;

    const data = await db.select({
      id: workspaceInvitations.id,
      email: workspaceInvitations.email,
      role: workspaceInvitations.role,
      teamName: workspaceInvitations.teamName,
      department: workspaceInvitations.department,
      cargo: workspaceInvitations.cargo,
      permissions: workspaceInvitations.permissions,
      status: workspaceInvitations.status,
      token: workspaceInvitations.token,
      expiresAt: workspaceInvitations.expiresAt,
      createdAt: workspaceInvitations.createdAt,
      inviterName: users.displayName
    })
    .from(workspaceInvitations)
    .leftJoin(users, eq(workspaceInvitations.inviterUid, users.uid))
    .where(eq(workspaceInvitations.workspaceId, req.workspaceId!));
    
    const invitations = data.map((inv) => ({
      ...inv,
      inviteLink: inv.status === 'PENDING' ? `${origin}/invite/${inv.token}` : undefined
    }));

    res.json(invitations);
  } catch (error) {
    console.error("Error fetching invitations:", error);
    res.status(500).json({ error: "Failed to fetch invitations" });
  }
});

apiRouter.post("/workspace/invitations", async (req: AuthRequest, res) => {
  try {
    const { email, role, teamName, department, cargo, permissions } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: "Email do convidado é obrigatório" });
    }

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const selectedRole = isWorkspaceRole(String(role).toUpperCase()) ? (String(role).toUpperCase() as WorkspaceRole) : WorkspaceRole.MEMBER;
    const permissionValidation = validateRolePermissionAssignment(selectedRole, permissions);
    if (!permissionValidation.valid) {
      return res.status(400).json({ error: `As permissões ${permissionValidation.invalidPermissions.join(', ')} não são válidas para o cargo ${selectedRole}.` });
    }

    const sanitizedPermissions = sanitizePermissionsForRole(selectedRole, permissions);
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const [invitation] = await db.insert(workspaceInvitations).values({
      workspaceId: req.workspaceId!,
      tenantId: req.tenantId as any,
      email,
      role: role || 'MEMBER',
      teamName: teamName || null,
      department: department || null,
      cargo: cargo || null,
      permissions: sanitizedPermissions,
      inviterUid: req.user!.uid,
      token,
      expiresAt
    }).returning();

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const inviteLink = `${origin}/invite/${token}`;
    const invitationWithLink = {
      ...invitation,
      inviteLink
    };

    const [workspace] = await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const workspaceName = workspace?.name || 'Cyzor Control';
    const inviterName = req.user?.displayName || 'Administrador';

    const emailResult = await sendWorkspaceInvitationEmail({
      to: email,
      inviterName,
      workspaceName,
      inviteLink,
      role: role || 'MEMBER',
      teamName,
      department,
      cargo,
      workspaceId: req.workspaceId!
    });

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error);
      return res.status(500).json({ error: 'Failed to send invitation email', details: emailResult.error });
    }

    await logAction(req, 'INVITE', 'workspace_invitations', invitation.id.toString(), null, invitation);
    res.json({ ...invitationWithLink, emailSent: true });
  } catch (error) {
    console.error("Error creating invitation:", error);
    res.status(500).json({ error: "Failed to create invitation" });
  }
});

apiRouter.delete("/workspace/invitations/:id", async (req: AuthRequest, res) => {
  try {
    const invId = Number(req.params.id);

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const [deleted] = await db.update(workspaceInvitations)
      .set({ status: 'CANCELLED' })
      .where(and(eq(workspaceInvitations.id, invId), eq(workspaceInvitations.workspaceId, req.workspaceId!)))
      .returning();

    if (deleted) {
      await logAction(req, 'CANCEL_INVITE', 'workspace_invitations', invId.toString(), null, deleted);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error cancelling invitation:", error);
    res.status(500).json({ error: "Failed to cancel invitation" });
  }
});

apiRouter.post("/workspace/invitations/:id/resend", async (req: AuthRequest, res) => {
  try {
    const invId = Number(req.params.id);
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) return res.status(403).json({ error: "Insufficient permissions" });

    const [invitation] = await db.select().from(workspaceInvitations)
      .where(and(eq(workspaceInvitations.id, invId), eq(workspaceInvitations.workspaceId, req.workspaceId!)))
      .limit(1);

    if (!invitation) return res.status(404).json({ error: "Convite não encontrado" });

    const origin = req.headers.origin || `${req.protocol}://${req.get('host')}`;
    const inviteLink = `${origin}/invite/${invitation.token}`;
    const [workspace] = await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);

    const emailResult = await sendWorkspaceInvitationEmail({
      to: invitation.email,
      inviterName: req.user?.displayName || 'Administrador',
      workspaceName: workspace?.name || 'Cyzor Control',
      inviteLink,
      role: invitation.role,
      teamName: invitation.teamName || undefined,
      department: invitation.department || undefined,
      cargo: invitation.cargo || undefined,
      workspaceId: req.workspaceId!
    });

    await logAction(req, 'RESEND_INVITE', 'workspace_invitations', invId.toString(), null, invitation);
    res.json({ success: true, emailSent: emailResult.success });
  } catch (error) {
    console.error("Error resending invitation:", error);
    res.status(500).json({ error: "Failed to resend invitation" });
  }
});

apiRouter.post("/workspace/invitations/:id/revoke", async (req: AuthRequest, res) => {
  try {
    const invId = Number(req.params.id);
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) return res.status(403).json({ error: "Insufficient permissions" });

    const [revoked] = await db.update(workspaceInvitations)
      .set({ status: 'REVOKED' })
      .where(and(eq(workspaceInvitations.id, invId), eq(workspaceInvitations.workspaceId, req.workspaceId!)))
      .returning();

    if (revoked) {
      await logAction(req, 'REVOKE_INVITE', 'workspace_invitations', invId.toString(), null, revoked);
    }
    res.json({ success: true, invitation: revoked });
  } catch (error) {
    console.error("Error revoking invitation:", error);
    res.status(500).json({ error: "Failed to revoke invitation" });
  }
});

// --- DEPARTMENTS ---
apiRouter.get("/workspace/departments", async (req: AuthRequest, res) => {
  try {
    const depts = await db.select().from(workspaceDepartments).where(eq(workspaceDepartments.workspaceId, req.workspaceId!));
    res.json(depts);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

apiRouter.post("/workspace/departments", async (req: AuthRequest, res) => {
  try {
    const { name, description, leadUid, healthScore } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: "Nome do departamento é obrigatório" });

    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) return res.status(403).json({ error: "Insufficient permissions" });

    const [created] = await db.insert(workspaceDepartments).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      name: name.trim(),
      description: description?.trim() || null,
      leadUid: leadUid || null,
      healthScore: Number(healthScore) || 85,
    }).returning();

    await logAction(req, 'CREATE', 'workspace_departments', created.id.toString(), null, created);
    res.status(201).json(created);
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ error: "Failed to create department" });
  }
});

apiRouter.put("/workspace/departments/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { name, description, leadUid, healthScore } = req.body;
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) return res.status(403).json({ error: "Insufficient permissions" });

    const [oldDept] = await db.select().from(workspaceDepartments).where(eq(workspaceDepartments.id, id)).limit(1);
    if (!oldDept) return res.status(404).json({ error: "Department not found" });

    const [updated] = await db.update(workspaceDepartments)
      .set({
        name: name !== undefined ? name.trim() : oldDept.name,
        description: description !== undefined ? description : oldDept.description,
        leadUid: leadUid !== undefined ? leadUid : oldDept.leadUid,
        healthScore: healthScore !== undefined ? Number(healthScore) : oldDept.healthScore,
        updatedAt: new Date()
      })
      .where(and(eq(workspaceDepartments.id, id), eq(workspaceDepartments.workspaceId, req.workspaceId!)))
      .returning();

    await logAction(req, 'UPDATE', 'workspace_departments', id.toString(), oldDept, updated);
    res.json(updated);
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Failed to update department" });
  }
});

apiRouter.delete("/workspace/departments/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) return res.status(403).json({ error: "Insufficient permissions" });

    const [deleted] = await db.delete(workspaceDepartments)
      .where(and(eq(workspaceDepartments.id, id), eq(workspaceDepartments.workspaceId, req.workspaceId!)))
      .returning();

    if (deleted) {
      await logAction(req, 'DELETE', 'workspace_departments', id.toString(), deleted, null);
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Failed to delete department" });
  }
});

// --- ORGANIZATION TREE ---
apiRouter.get("/workspace/organization-tree", async (req: AuthRequest, res) => {
  try {
    const [workspace] = await db.select({ name: workspaces.name }).from(workspaces).where(eq(workspaces.id, req.workspaceId!)).limit(1);
    const depts = await db.select().from(workspaceDepartments).where(eq(workspaceDepartments.workspaceId, req.workspaceId!));
    const teams = await db.select().from(workspaceTeams).where(eq(workspaceTeams.workspaceId, req.workspaceId!));
    const members = await db.select({
      id: workspaceMembers.id,
      userUid: workspaceMembers.userUid,
      role: workspaceMembers.role,
      cargo: workspaceMembers.cargo,
      userName: users.displayName,
      userEmail: users.email,
      userPhoto: users.photoUrl
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userUid, users.uid))
    .where(eq(workspaceMembers.workspaceId, req.workspaceId!));

    res.json({
      organizationName: workspace?.name || 'Empresa',
      departments: depts,
      teams: teams,
      members: members
    });
  } catch (error) {
    console.error("Error building organization tree:", error);
    res.status(500).json({ error: "Failed to build organization tree" });
  }
});

// --- AUDIT LOG ---
apiRouter.get("/workspace/audit-logs", async (req: AuthRequest, res) => {
  try {
    const data = await db.select({
      id: auditLogs.id,
      action: auditLogs.action,
      tableName: auditLogs.tableName,
      recordId: auditLogs.recordId,
      createdAt: auditLogs.createdAt,
      userName: users.displayName,
      userEmail: users.email,
      userPhoto: users.photoUrl
    })
    .from(auditLogs)
    .leftJoin(users, eq(auditLogs.userId, users.uid))
    .where(eq(auditLogs.workspaceId, req.workspaceId!))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// --- COMPANIES ---
apiRouter.get("/companies", async (req: AuthRequest, res) => {
  try {
    const data = await db.select().from(companies).where(eq(companies.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching companies:", error);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});
apiRouter.post("/companies", async (req: AuthRequest, res) => {
  try {
    console.log("POST /companies called", { workspaceId: req.workspaceId, body: req.body });
    const { name, cnpj, industry, size, website, linkedin, instagram, facebook, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }
    if (!req.workspaceId) {
      return res.status(400).json({ error: "Workspace ID is missing" });
    }

    // If a Company already exists for this workspace, return it (idempotent)
    const [existing] = await db.select().from(companies).where(eq(companies.workspaceId, req.workspaceId)).limit(1);
    if (existing) {
      return res.json(existing);
    }

    const data = await db.insert(companies).values({
      workspaceId: req.workspaceId,
      tenantId: req.tenantId as any,
      name,
      cnpj: cnpj || null,
      industry: industry || null,
      size: size || null,
      website: website || null,
      linkedin: linkedin || null,
      instagram: instagram || null,
      facebook: facebook || null,
      status: status || 'Ativo'
    }).returning();

    const technicalEvent: TechnicalEvent = {
      type: 'COMPANY_CREATED',
      payload: { workspaceId: req.workspaceId, userUid: req.user?.uid || undefined, tenantId: req.tenantId }
    };
    const businessEvent = BusinessEventTranslator.translate(technicalEvent);
    if (businessEvent) {
      await BESIntegrationService.processBusinessEvent(businessEvent);
    }

    try {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Nova Empresa Cadastrada",
        description: `A empresa "${name}" foi cadastrada com sucesso.`,
        type: "info"
      });
    } catch (e) {
      console.error("Error creating company notification:", e);
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company", details: error.message });
  }
});

// --- CLIENTS ---
apiRouter.get("/clients", async (req: AuthRequest, res) => {
  try {
    const data = await db
      .select({
        id: clients.id,
        workspaceId: clients.workspaceId,
        name: clients.name,
        email: clients.email,
        phone: clients.phone,
        companyId: clients.companyId,
        status: clients.status,
        notes: clients.notes,
        role: clients.role,
        tags: clients.tags,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        companyName: companies.name
      })
      .from(clients)
      .leftJoin(companies, eq(clients.companyId, companies.id))
      .where(eq(clients.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ error: "Failed to fetch clients" });
  }
});

apiRouter.post("/clients", async (req: AuthRequest, res) => {
  try {
    const { name, email, phone, companyId, status, notes, role, tags } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Client name is required" });
    }
    const data = await db.insert(clients).values({
      workspaceId: req.workspaceId!,
      name,
      email: email || null,
      phone: phone || null,
      companyId: companyId ? Number(companyId) : null,
      status: status || 'Ativo',
      notes: notes || null,
      role: role || null,
      tags: tags || []
    }).returning();
  
    // Instrument technical event
    const technicalEvent: TechnicalEvent = { 
        type: 'CUSTOMER_CREATED', 
        payload: { clientId: data[0].id, workspaceId: req.workspaceId!, userUid: req.user?.uid || undefined, tenantId: req.tenantId }
    };
    const businessEvent = BusinessEventTranslator.translate(technicalEvent);
    if (businessEvent) {
        await BESIntegrationService.processBusinessEvent(businessEvent);
    }

    try {
      const { EventCascadeService } = await import("../services/EventCascadeService.ts");
      await EventCascadeService.handleClientCreated(req.workspaceId!, data[0].id, name, req.tenantId as any);
    } catch (err) {
      console.error("Failed to run client creation cascade:", err);
    }
  
    try {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Novo Cliente Cadastrado",
        description: `O contato de "${name}" foi cadastrado no workspace.`,
        type: "info"
      });
    } catch (e) {
      console.error("Error creating client notification:", e);
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ error: "Failed to create client" });
  }
});

apiRouter.put("/clients/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, companyId, status, notes, role, tags } = req.body;
    const updateValues: any = {};
    if (name !== undefined) updateValues.name = name;
    if (email !== undefined) updateValues.email = email;
    if (phone !== undefined) updateValues.phone = phone;
    if (companyId !== undefined) updateValues.companyId = companyId ? Number(companyId) : null;
    if (status !== undefined) updateValues.status = status;
    if (notes !== undefined) updateValues.notes = notes;
    if (role !== undefined) updateValues.role = role;
    if (tags !== undefined) updateValues.tags = tags;
    updateValues.updatedAt = new Date();

    const data = await db
      .update(clients)
      .set(updateValues)
      .where(and(eq(clients.id, Number(id)), eq(clients.workspaceId, req.workspaceId!)))
      .returning();
    
    if (data.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ error: "Failed to update client" });
  }
});

apiRouter.delete("/clients/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const data = await db
      .delete(clients)
      .where(and(eq(clients.id, Number(id)), eq(clients.workspaceId, req.workspaceId!)))
      .returning();
    if (data.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.json({ success: true, deleted: data[0] });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ error: "Failed to delete client" });
  }
});

// --- PROJECTS ---
apiRouter.get("/projects", async (req: AuthRequest, res) => {
  try {
    const data = await db
      .select({
        id: projects.id,
        workspaceId: projects.workspaceId,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        priority: projects.priority,
        owner: projects.owner,
        budget: projects.budget,
        dueDate: projects.dueDate,
        team: projects.team,
        history: projects.history,
        comments: projects.comments,
        criteria: projects.criteria,
        velocity: projects.velocity,
        progress: projects.progress,
        companyId: projects.companyId,
        productId: projects.productId,
        logoUrl: projects.logoUrl,
        coverUrl: projects.coverUrl,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        companyName: companies.name,
        companyLogoUrl: companies.logoUrl
      })
      .from(projects)
      .leftJoin(companies, eq(projects.companyId, companies.id))
      .where(eq(projects.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});
apiRouter.post("/projects", async (req: AuthRequest, res) => {
  console.log("POST /api/projects called with body:", req.body);
  try {
    const { name, priority, dueDate, companyId, productId, status, budget, owner, logoUrl, coverUrl } = req.body;
    
    // Basic validation
    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    // Insert only validated fields
    const data = await db.insert(projects).values({ 
      name,
      workspaceId: req.workspaceId!,
      priority: priority || 'Média',
      status: status || 'planejamento',
      dueDate: dueDate ? new Date(dueDate) : null,
      companyId: companyId ? Number(companyId) : null,
      productId: productId ? Number(productId) : null,
      budget: budget || '0',
      owner: owner || 'Sem dono',
      logoUrl: logoUrl || null,
      coverUrl: coverUrl || null
    }).returning();
    
    // Instrument technical event
    const technicalEvent: TechnicalEvent = { 
        type: 'PROJECT_CREATED', 
        payload: { projectId: data[0].id, workspaceId: req.workspaceId!, userUid: req.user?.uid || undefined, tenantId: req.tenantId }
    };
    const businessEvent = BusinessEventTranslator.translate(technicalEvent);
    if (businessEvent) {
        await BESIntegrationService.processBusinessEvent(businessEvent);
    }
    
    try {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Novo Projeto Criado",
        description: `O projeto "${name}" foi criado por ${req.user!.displayName || req.user!.email || 'Membro'}.`,
        type: "info"
      });
    } catch (e) {
      console.error("Error creating project notification:", e);
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});
// --- PROJECTS ---
apiRouter.put("/projects/:id", async (req: AuthRequest, res) => {
  try {
    const { name, description, status, priority, dueDate, team, history, comments, criteria, velocity, progress, budget, companyId, productId, owner, logoUrl, coverUrl } = req.body;
    const updateValues: any = {};
    if (name !== undefined) updateValues.name = name;
    if (description !== undefined) updateValues.description = description;
    if (status !== undefined) updateValues.status = status;
    if (priority !== undefined) updateValues.priority = priority;
    if (dueDate !== undefined) updateValues.dueDate = dueDate ? new Date(dueDate) : null;
    if (team !== undefined) updateValues.team = team;
    if (history !== undefined) updateValues.history = history;
    if (comments !== undefined) updateValues.comments = comments;
    if (criteria !== undefined) updateValues.criteria = criteria;
    if (velocity !== undefined) updateValues.velocity = velocity;
    if (progress !== undefined) updateValues.progress = progress !== null ? Number(progress) : 0;
    if (budget !== undefined) updateValues.budget = budget;
    if (companyId !== undefined) updateValues.companyId = companyId ? Number(companyId) : null;
    if (productId !== undefined) updateValues.productId = productId ? Number(productId) : null;
    if (owner !== undefined) updateValues.owner = owner;
    if (logoUrl !== undefined) updateValues.logoUrl = logoUrl;
    if (coverUrl !== undefined) updateValues.coverUrl = coverUrl;

    const data = await db.update(projects).set(updateValues).where(and(eq(projects.id, Number(req.params.id)), eq(projects.workspaceId, req.workspaceId!))).returning();
    
    try {
      if (status !== undefined) {
        await db.insert(notifications).values({
          tenantId: req.tenantId as any,
          workspaceId: req.workspaceId!,
          title: "Status do Projeto Atualizado",
          description: `O projeto "${data[0].name}" agora está em "${status}".`,
          type: "success"
        });

        const sLower = status.toLowerCase();
        if (sLower === 'concluido' || sLower === 'concluído' || sLower === 'completed') {
          const { EventCascadeService } = await import("../services/EventCascadeService.ts");
          await EventCascadeService.handleProjectCompleted(req.workspaceId!, data[0].id, data[0].name, req.tenantId as any);
        }
      }
    } catch (e) {
      console.error("Error creating project update notification / running cascade:", e);
    }

    res.json(data[0]);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// --- IDEAS ---
apiRouter.get("/ideas", async (req: AuthRequest, res) => {
  try {
    const data = await db.select().from(ideas).where(eq(ideas.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching ideas:", error);
    res.status(500).json({ error: "Failed to fetch ideas" });
  }
});
apiRouter.post("/ideas", async (req: AuthRequest, res) => {
  const data = await db.insert(ideas).values({ ...req.body, workspaceId: req.workspaceId!, authorUid: req.user!.uid }).returning();
  
  try {
    await db.insert(notifications).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      title: "Nova Ideia Capturada",
      description: `A ideia "${data[0].title}" foi adicionada por ${req.user!.displayName || req.user!.email || 'Membro'}.`,
      type: "info"
    });
  } catch (e) {
    console.error("Error creating idea notification:", e);
  }

  res.json(data[0]);
});

apiRouter.put("/ideas/:id", async (req: AuthRequest, res) => {
  const data = await db.update(ideas).set(req.body).where(and(eq(ideas.id, Number(req.params.id)), eq(ideas.workspaceId, req.workspaceId!))).returning();
  
  try {
    if (req.body.status) {
      const statusLabels: Record<string, string> = {
        capturadas: 'Capturada',
        avaliacao: 'Em Avaliação',
        pesquisa: 'Pesquisa',
        mvp: 'MVP',
        lancadas: 'Lançada'
      };
      const label = statusLabels[req.body.status.toLowerCase()] || req.body.status;
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Ideia Movida no Funil",
        description: `A ideia "${data[0].title}" foi movida para "${label}".`,
        type: "success"
      });
    } else if (req.body.tags) {
      const qTag = req.body.tags.find((t: string) => ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].includes(t));
      if (qTag) {
        await db.insert(notifications).values({
          tenantId: req.tenantId as any,
          workspaceId: req.workspaceId!,
          title: "Ideia Agendada no Roadmap",
          description: `A ideia "${data[0].title}" foi planejada para o trimestre ${qTag}.`,
          type: "success"
        });
      }
    }
  } catch (e) {
    console.error("Error updating idea notification:", e);
  }

  res.json(data[0]);
});

// --- PRODUCTS ---
apiRouter.get("/products", async (req: AuthRequest, res) => {
  try {
    const prods = await db.select().from(products).where(eq(products.workspaceId, req.workspaceId!));
    
    // Get companies map
    const comps = await db.select().from(companies).where(eq(companies.workspaceId, req.workspaceId!));
    const companyMap = comps.reduce((acc, c) => ({ ...acc, [c.id]: c.name }), {} as Record<number, string>);

    // Get projects count map
    const projs = await db.select({ id: projects.id, productId: projects.productId }).from(projects).where(eq(projects.workspaceId, req.workspaceId!));
    const projectCountMap: Record<number, number> = {};
    const productToProjectIds: Record<number, number[]> = {};
    projs.forEach(p => {
      if (p.productId) {
        projectCountMap[p.productId] = (projectCountMap[p.productId] || 0) + 1;
        if (!productToProjectIds[p.productId]) productToProjectIds[p.productId] = [];
        productToProjectIds[p.productId].push(p.id);
      }
    });

    // Get revenue map
    const allFinance = await db.select({
        amount: financeEntries.amount,
        projectId: financeEntries.projectId,
        type: financeEntries.type,
        status: financeEntries.status
    }).from(financeEntries).where(and(eq(financeEntries.workspaceId, req.workspaceId!), eq(financeEntries.type, 'RECEITA'), eq(financeEntries.status, 'PAGO')));
    
    const projectRevenueMap: Record<number, number> = {};
    allFinance.forEach(f => {
      if (f.projectId) {
        projectRevenueMap[f.projectId] = (projectRevenueMap[f.projectId] || 0) + Number(f.amount || 0);
      }
    });

    const enrichedProds = prods.map(p => {
      const projIds = productToProjectIds[p.id] || [];
      const revenue = projIds.reduce((sum, pid) => sum + (projectRevenueMap[pid] || 0), 0);
      
      return {
        ...p,
        empresa: p.companyId ? companyMap[p.companyId] : 'Empresa Interna',
        companyName: p.companyId ? companyMap[p.companyId] : 'Empresa Interna',
        projectsCount: projectCountMap[p.id] || 0,
        revenue: revenue >= 1000 ? `R$ ${(revenue / 1000).toFixed(1)}k` : `R$ ${revenue.toFixed(0)}`,
        logo: p.name?.charAt(0) || 'P'
      };
    });

    res.json(enrichedProds);
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

apiRouter.post("/products", async (req: AuthRequest, res) => {
  try {
    const { name, description, status, companyId, launchDate, type, targetAudience, pricingModel, features, logoUrl, coverUrl } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Product name is required" });
    }

    const data = await db.insert(products).values({
      workspaceId: req.workspaceId!,
      tenantId: req.tenantId as any,
      name,
      description: description || null,
      status: status || 'Em Desenvolvimento',
      companyId: companyId ? Number(companyId) : null,
      launchDate: launchDate ? new Date(launchDate) : null,
      type: type || 'SaaS',
      targetAudience: targetAudience || null,
      pricingModel: pricingModel || null,
      features: features || [],
      logoUrl: logoUrl || null,
      coverUrl: coverUrl || null
    }).returning();

    try {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Novo Produto Adicionado",
        description: `O produto "${name}" foi adicionado ao portfólio.`,
        type: "info"
      });
    } catch (e) {
      console.error("Error creating product notification:", e);
    }

    res.json(data[0]);
  } catch (error: any) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

apiRouter.put("/products/:id", async (req: AuthRequest, res) => {
  try {
    const productId = Number(req.params.id);
    const { name, description, status, companyId, launchDate, type, targetAudience, pricingModel, features, logoUrl, coverUrl } = req.body;
    
    const updateValues: any = {};
    if (name !== undefined) updateValues.name = name;
    if (description !== undefined) updateValues.description = description;
    if (status !== undefined) updateValues.status = status;
    if (companyId !== undefined) updateValues.companyId = companyId ? Number(companyId) : null;
    if (launchDate !== undefined) updateValues.launchDate = launchDate ? new Date(launchDate) : null;
    if (type !== undefined) updateValues.type = type;
    if (targetAudience !== undefined) updateValues.targetAudience = targetAudience;
    if (pricingModel !== undefined) updateValues.pricingModel = pricingModel;
    if (features !== undefined) updateValues.features = features;
    if (logoUrl !== undefined) updateValues.logoUrl = logoUrl;
    if (coverUrl !== undefined) updateValues.coverUrl = coverUrl;
    updateValues.updatedAt = new Date();

    const data = await db.update(products)
      .set(updateValues)
      .where(and(eq(products.id, productId), eq(products.workspaceId, req.workspaceId!)))
      .returning();
      
    if (data.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(data[0]);
  } catch (error: any) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
});

apiRouter.get("/products/:id/kpis", async (req: AuthRequest, res) => {
  const productId = Number(req.params.id);
  try {
    // 1. Check product existence
    const [prod] = await db.select().from(products)
      .where(and(eq(products.id, productId), eq(products.workspaceId, req.workspaceId!)));
    if (!prod) return res.status(404).json({ error: "Product not found" });

    // 2. Projects count
    const projList = await db.select({ id: projects.id, createdAt: projects.createdAt }).from(projects)
      .where(and(eq(projects.productId, productId), eq(projects.workspaceId, req.workspaceId!)));
    const projectsCount = projList.length;

    // 3. Deploys count
    const deploysList = await db.select({ id: deploys.id, createdAt: deploys.createdAt }).from(deploys)
      .where(and(eq(deploys.productId, productId), eq(deploys.workspaceId, req.workspaceId!)));
    const deploysCount = deploysList.length;
    
    // Sort deploys by creation to find the latest
    deploysList.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    const lastDeployTime = deploysList.length > 0 ? new Date(deploysList[0].createdAt!).getTime() : null;
    let lastDeployStr = 'Nenhum';
    if (lastDeployTime) {
      const diffHrs = Math.floor((Date.now() - lastDeployTime) / (1000 * 60 * 60));
      lastDeployStr = diffHrs > 24 ? `Há ${Math.floor(diffHrs/24)}d` : `Há ${diffHrs}h`;
    }

    // 4. Finance (Revenue)
    const projectIds = projList.map(p => p.id);
    let revenue = 0;
    if (projectIds.length > 0) {
      const finList = await db.select().from(financeEntries)
        .where(and(
          eq(financeEntries.workspaceId, req.workspaceId!),
          eq(financeEntries.type, 'RECEITA'),
          eq(financeEntries.status, 'PAGO'),
          inArray(financeEntries.projectId, projectIds)
        ));
      revenue = finList.reduce((sum, f) => sum + Number(f.amount || 0), 0);
    }

    // 5. Tasks/Ideas count as approximation for "Clients" / "Licenses" since we don't have those tables
    // Just mock the others or return 0 for what we don't have
    
    // Actually now we have licenses
    const licenseList = await db.select().from(productLicenses).where(and(eq(productLicenses.productId, productId), eq(productLicenses.workspaceId, req.workspaceId!)));
    
    res.json({
      projects: { count: projectsCount },
      revenue: { total: revenue },
      deploys: { count: deploysCount, lastDeploy: lastDeployStr },
      licenses: { count: licenseList.length }
    });
  } catch (error) {
    console.error("Error fetching product KPIs:", error);
    res.status(500).json({ error: "Failed to fetch product KPIs" });
  }
});

// --- SPRINTS ---
apiRouter.get("/sprints", async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.query;
    
    const conditions = [eq(sprints.workspaceId, req.workspaceId!)];
    if (projectId) {
      conditions.push(eq(sprints.projectId, Number(projectId)));
    }
    
    const data = await db.select().from(sprints).where(and(...conditions));
    res.json(data);
  } catch (error) {
    console.error("Error fetching sprints:", error);
    res.status(500).json({ error: "Failed to fetch sprints" });
  }
});

apiRouter.post("/sprints", async (req: AuthRequest, res) => {
  const { projectId, name, goal, startDate, endDate, status } = req.body;
  if (!projectId || !name) {
    return res.status(400).json({ error: "projectId and name are required" });
  }

  try {
      const proj = await db.select().from(projects).where(and(eq(projects.id, Number(projectId)), eq(projects.workspaceId, req.workspaceId!)));
      if (proj.length === 0) {
        return res.status(403).json({ error: "Project not found or not in workspace" });
      }
    
      const data = await db.insert(sprints).values({ 
          workspaceId: req.workspaceId!,
          tenantId: req.tenantId as any,
          projectId: Number(projectId), 
          name, 
          goal,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          status: status || 'PLANNED'
      }).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error creating sprint:", error);
    res.status(500).json({ error: "Failed to create sprint", details: error });
  }
});

apiRouter.put("/sprints/:id", async (req: AuthRequest, res) => {
  const sprintId = Number(req.params.id);
  const { name, goal, startDate, endDate, status } = req.body;

  try {
      const updateValues: any = {};
      if (name !== undefined) updateValues.name = name;
      if (goal !== undefined) updateValues.goal = goal;
      if (status !== undefined) updateValues.status = status;
      if (startDate !== undefined) updateValues.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateValues.endDate = endDate ? new Date(endDate) : null;

      const data = await db.update(sprints)
        .set(updateValues)
        .where(and(eq(sprints.id, sprintId), eq(sprints.workspaceId, req.workspaceId!)))
        .returning();

      if (data.length === 0) return res.status(404).json({ error: "Sprint not found" });
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating sprint:", error);
    res.status(500).json({ error: "Failed to update sprint" });
  }
});

apiRouter.delete("/sprints/:id", async (req: AuthRequest, res) => {
    const sprintId = Number(req.params.id);
    try {
        const deleted = await db.delete(sprints)
          .where(and(eq(sprints.id, sprintId), eq(sprints.workspaceId, req.workspaceId!)))
          .returning();
        
        if (deleted.length === 0) {
          return res.status(404).json({ error: "Sprint not found" });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting sprint:", error);
        res.status(500).json({ error: "Failed to delete sprint" });
    }
});

// --- TASKS ---
apiRouter.get("/tasks", async (req: AuthRequest, res) => {
  try {
    const data = await db
      .select()
      .from(tasks)
      .where(eq(tasks.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

apiRouter.post("/tasks", async (req: AuthRequest, res) => {
  const { projectId, sprintId, title, description, status, priority, assigneeUid, dueDate, tags, subtasks, taskComments } = req.body;
  if (!projectId) {
    return res.status(400).json({ error: "projectId is required" });
  }
  
  try {
      const proj = await db.select().from(projects).where(and(eq(projects.id, Number(projectId)), eq(projects.workspaceId, req.workspaceId!)));
      if (proj.length === 0) {
        return res.status(403).json({ error: "Project not found or not in workspace" });
      }
      
      const values: any = { 
          workspaceId: req.workspaceId!,
          tenantId: req.tenantId as any,
          projectId: Number(projectId), 
          sprintId: sprintId ? Number(sprintId) : null,
          title, 
          description,
          status: status || 'BACKLOG', 
          priority: priority || 'MEDIUM' 
      };
      
      if (assigneeUid && assigneeUid !== 'Não atribuído') {
          const usersFound = await db.select().from(users).where(or(eq(users.uid, assigneeUid), eq(users.displayName, assigneeUid)));
          if (usersFound.length > 0) {
              values.assigneeUid = usersFound[0].uid;
          }
      }

      if (dueDate) {
          const date = new Date(dueDate);
          if (!isNaN(date.getTime())) values.dueDate = date;
      }

      if (tags) values.tags = tags;
      if (subtasks) values.subtasks = subtasks;
      if (taskComments) values.taskComments = taskComments;
      
      const data = await db.insert(tasks).values(values).returning();

      try {
        await db.insert(notifications).values({
          tenantId: req.tenantId as any,
          workspaceId: req.workspaceId!,
          title: "Nova Tarefa Criada",
          description: `A tarefa "${title}" foi criada por ${req.user!.displayName || req.user!.email || 'Membro'}.`,
          type: "info"
        });
      } catch (e) {
        console.error("Error creating task notification:", e);
      }

      res.json(data[0]);
  } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task", details: error });
  }
});

apiRouter.put("/tasks/:id", async (req: AuthRequest, res) => {
  const taskId = Number(req.params.id);
  
  const { title, description, status, priority, assigneeUid, dueDate, tags, subtasks, taskComments, sprintId, dependencies } = req.body;
  const updateValues: any = {};
  
  if (title !== undefined) updateValues.title = title;
  if (description !== undefined) updateValues.description = description;
  if (status !== undefined) updateValues.status = status;
  if (priority !== undefined) updateValues.priority = priority;
  if (sprintId !== undefined) updateValues.sprintId = sprintId ? Number(sprintId) : null;                
  if (dependencies !== undefined) updateValues.dependencies = dependencies;
  
  if (assigneeUid !== undefined) {
      if (assigneeUid && assigneeUid !== 'Não atribuído' && assigneeUid.length > 20) {
          updateValues.assigneeUid = assigneeUid;
      } else if (assigneeUid === 'Não atribuído' || assigneeUid === '') {
          updateValues.assigneeUid = null;
      }
  }
  
  if (dueDate !== undefined) {
      if (dueDate && dueDate !== 'Breve' && dueDate !== '') {
          const date = new Date(dueDate);
          if (!isNaN(date.getTime())) {
              updateValues.dueDate = date;
          } else {
              updateValues.dueDate = null;
          }
      } else {
          updateValues.dueDate = null;
      }
  }

  if (tags !== undefined) updateValues.tags = tags;
  if (subtasks !== undefined) updateValues.subtasks = subtasks;
  if (taskComments !== undefined) updateValues.taskComments = taskComments;

  const data = await db.update(tasks)
    .set(updateValues)
    .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, req.workspaceId!)))
    .returning();

  if (data.length === 0) return res.status(404).json({ error: "Task not found" });

  if (status === 'DONE') {
      const technicalEvent: TechnicalEvent = { 
          type: 'TASK_COMPLETED', 
          payload: { taskId: taskId, workspaceId: req.workspaceId!, userUid: req.user?.uid || undefined, tenantId: req.tenantId } 
      };
      const businessEvent = BusinessEventTranslator.translate(technicalEvent);
      if (businessEvent) {
          await BESIntegrationService.processBusinessEvent(businessEvent);
      }
  }

  try {
    if (status !== undefined) {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Tarefa Movida",
        description: `A tarefa "${data[0].title}" foi movida para "${status}".`,
        type: "success"
      });
    } else if (assigneeUid !== undefined && updateValues.assigneeUid) {
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Responsável Atribuído",
        description: `A tarefa "${data[0].title}" foi atribuída a um novo membro.`,
        type: "info"
      });
    }
  } catch (e) {
    console.error("Error creating task update notification:", e);
  }

  res.json(data[0]);
});

apiRouter.delete("/tasks/:id", async (req: AuthRequest, res) => {
  const taskId = Number(req.params.id);
  try {
      const deleted = await db.delete(tasks)
        .where(and(eq(tasks.id, taskId), eq(tasks.workspaceId, req.workspaceId!)))
        .returning();
      
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ success: true });
  } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
  }
});


// --- RELATIONSHIPS ---
apiRouter.get("/relationships/:type/:id", async (req: AuthRequest, res) => {
  try {
    const { type, id } = req.params;
    const { relationshipService } = await import('../services/relationshipService.ts');
    const relationships = await relationshipService.getRelationshipsForEntity(type, Number(id));
    res.json(relationships);
  } catch (error) {
    console.error("Error fetching relationships:", error);
    res.status(500).json({ error: "Failed to fetch relationships" });
  }
});

apiRouter.post("/relationships", async (req: AuthRequest, res) => {
  try {
    const { sourceType, sourceId, targetType, targetId, relationshipType } = req.body;
    const { relationshipService } = await import('../services/relationshipService.ts');
    
    const [relationship] = await relationshipService.createRelationship({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      sourceType,
      sourceId: Number(sourceId),
      targetType,
      targetId: Number(targetId),
      relationshipType
    });
    
    res.json(relationship);
  } catch (error) {
    console.error("Error creating relationship:", error);
    res.status(500).json({ error: "Failed to create relationship" });
  }
});

// --- GLOBAL COMMENTS SYSTEM ---
apiRouter.get("/comments/:entityType/:entityId", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId } = req.params;
    const comments = await db.select().from(entityComments).where(
      and(
        eq(entityComments.workspaceId, req.workspaceId!),
        eq(entityComments.entityType, entityType),
        eq(entityComments.entityId, Number(entityId))
      )
    ).orderBy(desc(entityComments.createdAt));
    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

apiRouter.post("/comments", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId, content, parentId, reactions, attachments } = req.body;
    const [comment] = await db.insert(entityComments).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType,
      entityId: Number(entityId),
      userId: req.user!.uid,
      authorName: req.user!.displayName || req.user!.email || "Membro",
      authorAvatar: req.user!.photoURL || "",
      content,
      parentId: parentId ? Number(parentId) : null,
      reactions: reactions || [],
      attachments: attachments || []
    }).returning();

    // Generate notification for other users or creator (mock simulation / live notification)
    await db.insert(notifications).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      title: "Novo comentário",
      description: `${req.user!.displayName || req.user!.email} comentou em ${entityType} #${entityId}: "${content.substring(0, 30)}..."`,
      type: "comment"
    });

    // Register activity
    await db.insert(timelineActivities).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType,
      entityId: Number(entityId),
      entityName: `${entityType} #${entityId}`,
      action: "commented",
      userName: req.user!.displayName || req.user!.email || "Membro",
      userAvatar: req.user!.photoURL || "",
      description: `Comentou em ${entityType} #${entityId}`
    });

    res.json(comment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: "Failed to create comment" });
  }
});

apiRouter.delete("/comments/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(entityComments).where(
      and(
        eq(entityComments.id, id),
        eq(entityComments.workspaceId, req.workspaceId!)
      )
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// --- SYSTEM OF APPROVALS ---
apiRouter.get("/approvals", async (req: AuthRequest, res) => {
  try {
    const approvalsList = await db.select().from(entityApprovals).where(
      eq(entityApprovals.workspaceId, req.workspaceId!)
    ).orderBy(desc(entityApprovals.createdAt));
    res.json(approvalsList);
  } catch (error) {
    console.error("Error fetching approvals:", error);
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
});

apiRouter.get("/approvals/:entityType/:entityId", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId } = req.params;
    const approvalsList = await db.select().from(entityApprovals).where(
      and(
        eq(entityApprovals.workspaceId, req.workspaceId!),
        eq(entityApprovals.entityType, entityType),
        eq(entityApprovals.entityId, Number(entityId))
      )
    ).orderBy(desc(entityApprovals.createdAt));
    res.json(approvalsList);
  } catch (error) {
    console.error("Error fetching entity approvals:", error);
    res.status(500).json({ error: "Failed to fetch approvals" });
  }
});

apiRouter.post("/approvals", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId, title, approvers, dueDate } = req.body;
    const [approval] = await db.insert(entityApprovals).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType,
      entityId: Number(entityId),
      title,
      requesterUid: req.user!.uid,
      requesterName: req.user!.displayName || req.user!.email || "Membro",
      status: "PENDING",
      approvers: approvers || [],
      history: [],
      dueDate: dueDate ? new Date(dueDate) : null
    }).returning();

    // Create notifications for approvers
    await db.insert(notifications).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      title: "Solicitação de Aprovação",
      description: `Nova solicitação de aprovação criada: "${title}" para ${entityType}`,
      type: "approval"
    });

    // Register activity
    await db.insert(timelineActivities).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType,
      entityId: Number(entityId),
      entityName: title,
      action: "approval_requested",
      userName: req.user!.displayName || req.user!.email || "Membro",
      userAvatar: req.user!.photoURL || "",
      description: `Solicitou aprovação para ${entityType}: "${title}"`
    });

    res.json(approval);
  } catch (error) {
    console.error("Error creating approval:", error);
    res.status(500).json({ error: "Failed to create approval" });
  }
});

apiRouter.put("/approvals/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { status, comment } = req.body;
    
    const existing = await db.select().from(entityApprovals).where(
      and(
        eq(entityApprovals.id, id),
        eq(entityApprovals.workspaceId, req.workspaceId!)
      )
    );
    if (!existing.length) {
      return res.status(404).json({ error: "Approval not found" });
    }

    const currentApproval = existing[0];
    const currentHistory = (currentApproval.history as any[]) || [];
    const newHistoryEntry = {
      uid: req.user!.uid,
      name: req.user!.displayName || req.user!.email || "Membro",
      status,
      comment: comment || "",
      date: new Date().toISOString()
    };

    const [updated] = await db.update(entityApprovals).set({
      status,
      history: [...currentHistory, newHistoryEntry]
    }).where(
      and(
        eq(entityApprovals.id, id),
        eq(entityApprovals.workspaceId, req.workspaceId!)
      )
    ).returning();

    // Create notification
    await db.insert(notifications).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      title: `Aprovação ${status}`,
      description: `A solicitação "${currentApproval.title}" foi ${status} por ${req.user!.displayName || req.user!.email}`,
      type: "approval"
    });

    // Register activity
    await db.insert(timelineActivities).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType: currentApproval.entityType,
      entityId: currentApproval.entityId,
      entityName: currentApproval.title,
      action: status === "APPROVED" ? "approved" : "rejected",
      userName: req.user!.displayName || req.user!.email || "Membro",
      userAvatar: req.user!.photoURL || "",
      description: `Aprovou/Rejeitou com status ${status}: "${currentApproval.title}"`
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating approval:", error);
    res.status(500).json({ error: "Failed to update approval" });
  }
});

// --- ROADMAPS ---
apiRouter.get("/roadmaps", async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(roadmaps).where(
      eq(roadmaps.workspaceId, req.workspaceId!)
    ).orderBy(desc(roadmaps.createdAt));
    res.json(list);
  } catch (error) {
    console.error("Error fetching roadmaps:", error);
    res.status(500).json({ error: "Failed to fetch roadmaps" });
  }
});

apiRouter.post("/roadmaps", async (req: AuthRequest, res) => {
  try {
    const { productId, title, description, status, priority, progress, responsibleUid, dependencies } = req.body;
    const [item] = await db.insert(roadmaps).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      productId: productId ? Number(productId) : null,
      title,
      description: description || "",
      status: status || "PLANNING",
      priority: priority || "MEDIUM",
      progress: progress ? Number(progress) : 0,
      responsibleUid: responsibleUid || null,
      dependencies: dependencies || []
    }).returning();

    // Register activity
    await db.insert(timelineActivities).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType: "product",
      entityId: productId ? Number(productId) : null,
      entityName: title,
      action: "created",
      userName: req.user!.displayName || req.user!.email || "Membro",
      userAvatar: req.user!.photoURL || "",
      description: `Criou iniciativa no Roadmap: "${title}"`
    });

    res.json(item);
  } catch (error) {
    console.error("Error creating roadmap initiative:", error);
    res.status(500).json({ error: "Failed to create roadmap initiative" });
  }
});

apiRouter.put("/roadmaps/:id", async (req: AuthRequest, res) => {
  try {
    const id = Number(req.params.id);
    const { title, description, status, priority, progress, responsibleUid, dependencies } = req.body;
    
    const [updated] = await db.update(roadmaps).set({
      title,
      description,
      status,
      priority,
      progress: progress ? Number(progress) : 0,
      responsibleUid: responsibleUid || null,
      dependencies: dependencies || [],
      updatedAt: new Date()
    }).where(
      and(
        eq(roadmaps.id, id),
        eq(roadmaps.workspaceId, req.workspaceId!)
      )
    ).returning();

    res.json(updated);
  } catch (error) {
    console.error("Error updating roadmap:", error);
    res.status(500).json({ error: "Failed to update roadmap" });
  }
});

// --- TEMPLATES ---
apiRouter.get("/templates/:type", async (req: AuthRequest, res) => {
  try {
    const { type } = req.params;
    const list = await db.select().from(entityTemplates).where(
      and(
        eq(entityTemplates.workspaceId, req.workspaceId!),
        eq(entityTemplates.type, type)
      )
    );
    res.json(list);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ error: "Failed to fetch templates" });
  }
});

apiRouter.post("/templates", async (req: AuthRequest, res) => {
  try {
    const { type, name, description, structureJson } = req.body;
    const [template] = await db.insert(entityTemplates).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      type,
      name,
      description: description || "",
      structureJson: structureJson || {}
    }).returning();
    res.json(template);
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ error: "Failed to create template" });
  }
});

// --- TIMELINE ACTIVITIES ---
apiRouter.get("/activities", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId } = req.query;
    let query = db.select().from(timelineActivities).where(
      eq(timelineActivities.workspaceId, req.workspaceId!)
    );
    
    // Add dynamic filters if provided
    if (entityType && entityId) {
      query = db.select().from(timelineActivities).where(
        and(
          eq(timelineActivities.workspaceId, req.workspaceId!),
          eq(timelineActivities.entityType, entityType as string),
          eq(timelineActivities.entityId, Number(entityId))
        )
      );
    } else if (entityType) {
      query = db.select().from(timelineActivities).where(
        and(
          eq(timelineActivities.workspaceId, req.workspaceId!),
          eq(timelineActivities.entityType, entityType as string)
        )
      );
    }
    
    const list = await query.orderBy(desc(timelineActivities.createdAt));
    res.json(list);
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ error: "Failed to fetch activities" });
  }
});

apiRouter.post("/activities", async (req: AuthRequest, res) => {
  try {
    const { entityType, entityId, entityName, action, description } = req.body;
    const [activity] = await db.insert(timelineActivities).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      entityType,
      entityId: entityId ? Number(entityId) : null,
      entityName: entityName || "",
      action,
      userName: req.user!.displayName || req.user!.email || "Membro",
      userAvatar: req.user!.photoURL || "",
      description
    }).returning();
    res.json(activity);
  } catch (error) {
    console.error("Error logging activity:", error);
    res.status(500).json({ error: "Failed to log activity" });
  }
});

// --- FINANCE ---
apiRouter.get("/finance", requireAuth, tenantMiddleware as any, enforcePermission('view_finance'), async (req: AuthRequest, res) => {
  try {
    const data = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching finance entries:", error);
    res.status(500).json({ error: "Failed to fetch finance entries" });
  }
});

// --- MILESTONES ---
apiRouter.get("/milestones", async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.query;
    const conditions = [eq(milestones.workspaceId, req.workspaceId!)];
    if (projectId) {
      conditions.push(eq(milestones.projectId, Number(projectId)));
    }
    
    const data = await db.select().from(milestones).where(and(...conditions));
    res.json(data);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    res.status(500).json({ error: "Failed to fetch milestones" });
  }
});

apiRouter.post("/milestones", async (req: AuthRequest, res) => {
  const { projectId, name, date, status, description } = req.body;
  if (!projectId || !name) {
    return res.status(400).json({ error: "projectId and name are required" });
  }

  try {
      const proj = await db.select().from(projects).where(and(eq(projects.id, Number(projectId)), eq(projects.workspaceId, req.workspaceId!)));
      if (proj.length === 0) {
        return res.status(403).json({ error: "Project not found or not in workspace" });
      }

      const data = await db.insert(milestones).values({ 
          workspaceId: req.workspaceId!,
          tenantId: req.tenantId as any,
          projectId: Number(projectId), 
          name, 
          date: date ? new Date(date) : null,
          status: status || 'PENDENTE',
          description
      }).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error creating milestone:", error);
    res.status(500).json({ error: "Failed to create milestone" });
  }
});

apiRouter.put("/milestones/:id", async (req: AuthRequest, res) => {
  const milestoneId = Number(req.params.id);
  const { name, date, status, description } = req.body;

  try {
      const updateValues: any = {};
      if (name !== undefined) updateValues.name = name;
      if (status !== undefined) updateValues.status = status;
      if (description !== undefined) updateValues.description = description;
      if (date !== undefined) updateValues.date = date ? new Date(date) : null;

      const data = await db.update(milestones)
        .set(updateValues)
        .where(and(eq(milestones.id, milestoneId), eq(milestones.workspaceId, req.workspaceId!)))
        .returning();

      if (data.length === 0) return res.status(404).json({ error: "Milestone not found" });
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

apiRouter.delete("/milestones/:id", async (req: AuthRequest, res) => {
    const milestoneId = Number(req.params.id);
    try {
        const deleted = await db.delete(milestones)
          .where(and(eq(milestones.id, milestoneId), eq(milestones.workspaceId, req.workspaceId!)))
          .returning();
        
        if (deleted.length === 0) {
          return res.status(404).json({ error: "Milestone not found" });
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting milestone:", error);
        res.status(500).json({ error: "Failed to delete milestone" });
    }
});

// --- PRODUCT LICENSES ---
apiRouter.get("/products/:id/licenses", async (req: AuthRequest, res) => {
  try {
    const { productLicenses } = await import("./schema.ts");
    const data = await db.select({
      id: productLicenses.id,
      key: productLicenses.key,
      status: productLicenses.status,
      type: productLicenses.type,
      startsAt: productLicenses.startsAt,
      expiresAt: productLicenses.expiresAt,
      companyId: productLicenses.companyId,
      companyName: companies.name
    })
    .from(productLicenses)
    .leftJoin(companies, eq(productLicenses.companyId, companies.id))
    .where(and(eq(productLicenses.productId, Number(req.params.id)), eq(productLicenses.workspaceId, req.workspaceId!)));
    res.json(data);
  } catch (error) {
    console.error("Error fetching product licenses:", error);
    res.status(500).json({ error: "Failed to fetch licenses" });
  }
});

apiRouter.post("/products/:id/licenses", async (req: AuthRequest, res) => {
  try {
    const { productLicenses } = await import("./schema.ts");
    const { key, status, type, expiresAt, companyId } = req.body;
    const data = await db.insert(productLicenses).values({
      workspaceId: req.workspaceId!,
      tenantId: req.tenantId as any,
      productId: Number(req.params.id),
      key: key || `LIC-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status: status || 'Ativa',
      type: type || 'Comercial',
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      companyId: companyId ? Number(companyId) : null
    }).returning();
    res.json(data[0]);
  } catch (error: any) {
    console.error("Error creating license:", error);
    res.status(500).json({ error: "Failed to create license" });
  }
});
apiRouter.get("/deploys", async (req: AuthRequest, res) => {
  const { productId } = req.query;
  const conditions = [eq(deploys.workspaceId, req.workspaceId!)];
  if (productId) conditions.push(eq(deploys.productId, Number(productId)));
  
  try {
    const data = await db.select({
      id: deploys.id,
      version: deploys.version,
      status: deploys.status,
      duration: deploys.duration,
      logs: deploys.logs,
      createdAt: deploys.createdAt,
      userUid: deploys.userUid,
      userName: users.displayName
    })
    .from(deploys)
    .leftJoin(users, eq(deploys.userUid, users.uid))
    .where(and(...conditions))
    .orderBy(desc(deploys.createdAt));
    
    res.json(data);
  } catch (error) {
    console.error("Error fetching deploys:", error);
    res.status(500).json({ error: "Failed to fetch deploys" });
  }
});

apiRouter.post("/deploys", async (req: AuthRequest, res) => {
  try {
    const { productId, version, status, duration, logs } = req.body;
    if (!productId || !version) {
      return res.status(400).json({ error: "productId and version are required" });
    }
    const [newDeploy] = await db.insert(deploys).values({
      workspaceId: req.workspaceId!,
      productId: Number(productId),
      version,
      status: status || 'success',
      duration: duration || '0s',
      logs: logs || '',
      userUid: req.user!.uid
    }).returning();

    try {
      const prodList = await db.select().from(products).where(eq(products.id, Number(productId)));
      const productName = prodList[0]?.name || `Produto #${productId}`;
      
      await db.insert(notifications).values({
        tenantId: req.tenantId as any,
        workspaceId: req.workspaceId!,
        title: "Deploy Concluído",
        description: `Novo deploy da versão v${version} de "${productName}" finalizado com status "${status}".`,
        type: status === 'failed' ? 'error' : 'success'
      });
    } catch (e) {
      console.error("Error creating deploy notification:", e);
    }

    res.json(newDeploy);
  } catch (error) {
    console.error("Error creating deploy:", error);
    res.status(500).json({ error: "Failed to create deploy" });
  }
});

// --- DOCUMENTS ---
apiRouter.get("/documents", async (req: AuthRequest, res) => {
  try {
    const { projectId } = req.query;
    
    const conditions = [eq(documents.workspaceId, req.workspaceId!)];
    if (projectId) {
      conditions.push(eq(documents.projectId, Number(projectId)));
    }
    
    const data = await db.select().from(documents).where(and(...conditions));
    res.json(data);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

apiRouter.post("/documents", async (req: AuthRequest, res) => {
  const { projectId, title, content, type, folder, url, size, isFavorite } = req.body;
  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
      console.log("Creating document with body:", req.body);
      const data = await db.insert(documents).values({ 
          workspaceId: req.workspaceId!,
          projectId: projectId ? Number(projectId) : null, 
          title, 
          content: content || '',
          type: type || 'FILE',
          folder: folder || 'Planejamento',
          url: url || '',
          size: size || '0 KB',
          authorUid: req.user?.uid,
          isFavorite: isFavorite || false
      }).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(500).json({ error: "Failed to create document", details: error });
  }
});

apiRouter.put("/documents/:id", async (req: AuthRequest, res) => {
  const docId = Number(req.params.id);
  const { title, content, type, folder, url, size, isFavorite } = req.body;

  try {
      const existing = await db.select().from(documents)
        .where(and(eq(documents.id, docId), eq(documents.workspaceId, req.workspaceId!)));
      
      if (existing.length === 0) {
        return res.status(403).json({ error: "Document not found or not in workspace" });
      }

      const updateValues: any = {};
      if (title !== undefined) updateValues.title = title;
      if (content !== undefined) updateValues.content = content;
      if (type !== undefined) updateValues.type = type;
      if (folder !== undefined) updateValues.folder = folder;
      if (url !== undefined) updateValues.url = url;
      if (size !== undefined) updateValues.size = size;
      if (isFavorite !== undefined) updateValues.isFavorite = isFavorite;
      updateValues.updatedAt = new Date();

      const data = await db.update(documents).set(updateValues).where(eq(documents.id, docId)).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({ error: "Failed to update document", details: error });
  }
});

apiRouter.delete("/documents/:id", async (req: AuthRequest, res) => {
    const docId = Number(req.params.id);
    try {
        const existing = await db.select().from(documents)
          .where(and(eq(documents.id, docId), eq(documents.workspaceId, req.workspaceId!)));
        
        if (existing.length === 0) {
          return res.status(403).json({ error: "Document not found or not in workspace" });
        }

        await db.delete(documents).where(eq(documents.id, docId));
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).json({ error: "Failed to delete document" });
    }
});

// --- NOTES ---
apiRouter.post("/finance", enforcePermission('manage_finance'), async (req: AuthRequest, res) => {
  try {
    const { description, amount, type, category, date, companyId, projectId, status, isRecurrent, dueDate, paymentDate } = req.body;
    const data = await db.insert(financeEntries).values({
      tenantId: req.tenantId as any,
      workspaceId: req.workspaceId!,
      description,
      amount,
      type,
      category,
      date: date ? new Date(date) : null,
      companyId: companyId ? Number(companyId) : null,
      projectId: projectId ? Number(projectId) : null,
      status: status || 'PENDING',
      isRecurrent: !!isRecurrent,
      dueDate: dueDate ? new Date(dueDate) : null,
      paymentDate: paymentDate ? new Date(paymentDate) : null
    }).returning();
    res.json(data[0]);
  } catch (error) {
    console.error("Error creating finance entry:", error);
    res.status(500).json({ error: "Failed to create finance entry" });
  }
});

apiRouter.put("/notes/:id", async (req: AuthRequest, res) => {
  try {
    const noteId = Number(req.params.id);
    const { title, content, color, isPinned, tags } = req.body;
    
    const [updated] = await db.update(notes).set({
      title,
      content,
      color,
      isPinned,
      tags,
      updatedAt: new Date(),
    })
    .where(and(eq(notes.id, noteId), eq(notes.workspaceId, req.workspaceId!)))
    .returning();
    
    if (!updated) return res.status(404).json({ error: "Note not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

apiRouter.put("/finance/:id", enforcePermission('manage_finance'), async (req: AuthRequest, res) => {
  const entryId = Number(req.params.id);
  const { description, amount, type, category, date, companyId, projectId, status, isRecurrent, dueDate, paymentDate } = req.body;
  try {
      const existing = await db.select().from(financeEntries)
        .where(and(eq(financeEntries.id, entryId), eq(financeEntries.workspaceId, req.workspaceId!)));
      if (existing.length === 0) {
        return res.status(404).json({ error: "Finance entry not found" });
      }
      const updateValues: any = {};
      if (description !== undefined) updateValues.description = description;
      if (amount !== undefined) updateValues.amount = amount;
      if (type !== undefined) updateValues.type = type;
      if (category !== undefined) updateValues.category = category;
      if (date !== undefined) updateValues.date = date ? new Date(date) : null;
      if (companyId !== undefined) updateValues.companyId = companyId ? Number(companyId) : null;
      if (projectId !== undefined) updateValues.projectId = projectId ? Number(projectId) : null;
      if (status !== undefined) updateValues.status = status;
      if (isRecurrent !== undefined) updateValues.isRecurrent = !!isRecurrent;
      if (dueDate !== undefined) updateValues.dueDate = dueDate ? new Date(dueDate) : null;
      if (paymentDate !== undefined) updateValues.paymentDate = paymentDate ? new Date(paymentDate) : null;
      updateValues.updatedAt = new Date();

      const data = await db.update(financeEntries).set(updateValues).where(eq(financeEntries.id, entryId)).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating finance entry:", error);
    res.status(500).json({ error: "Failed to update finance entry" });
  }
});

apiRouter.post("/ai/agent", async (req: AuthRequest, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // 1. Gather context data of the workspace to ground the AI
    const [dbProjects, dbTasks, dbClients, dbProducts, dbFinance] = await Promise.all([
      db.select().from(projects).where(eq(projects.workspaceId, req.workspaceId!)),
      db.select().from(tasks).where(eq(tasks.workspaceId, req.workspaceId!)),
      db.select().from(clients).where(eq(clients.workspaceId, req.workspaceId!)),
      db.select().from(products).where(eq(products.workspaceId, req.workspaceId!)),
      db.select().from(financeEntries).where(eq(financeEntries.workspaceId, req.workspaceId!))
    ]);

    const totalRevenue = dbFinance
      .filter((f: any) => f.type === 'RECEITA')
      .reduce((sum, f) => sum + parseFloat(f.amount || "0"), 0);

    const totalExpenses = dbFinance
      .filter((f: any) => f.type === 'DESPESA')
      .reduce((sum, f) => sum + parseFloat(f.amount || "0"), 0);

    const contextData = {
      projects: dbProjects.map(p => ({ id: p.id, name: p.name, status: p.status, budget: p.budget })),
      tasks: dbTasks.map(t => ({ id: t.id, title: t.title, column: t.status, priority: t.priority })),
      clients: dbClients.map(c => ({ id: c.id, name: c.name })),
      products: dbProducts.map(p => ({ id: p.id, name: p.name })),
      totalRevenue,
      totalExpenses
    };

    // 2. Call Gemini
    const aiResult = await executeOperationalAgent(prompt, contextData);

    const { action, parameters, explanation } = aiResult;
    let executedObject = null;

    // 3. Execute DB mutations if requested
    if (action === "CREATE_PROJECT" && parameters.name) {
      const [newProj] = await db.insert(projects).values({
        workspaceId: req.workspaceId!,
        name: parameters.name,
        budget: parameters.budget || "0",
        priority: parameters.priority || "Média",
        status: parameters.status || "planejamento",
        description: parameters.description || "",
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }).returning();
      executedObject = newProj;

      await db.insert(notifications).values({
        workspaceId: req.workspaceId!,
        tenantId: req.tenantId as any,
        title: "Projeto Criado via IA",
        description: `Olimpo AI registrou o projeto "${newProj.name}" com orçamento de R$ ${parseFloat(newProj.budget || "0").toLocaleString('pt-BR')}.`,
        type: "success"
      });
    } 
    else if (action === "CREATE_TASK" && parameters.title) {
      const [newTask] = await db.insert(tasks).values({
        workspaceId: req.workspaceId!,
        projectId: dbProjects[0]?.id || 0, // Relies on a project id context
        title: parameters.title,
        priority: parameters.priority || "Média",
        description: parameters.description || "",
        status: (parameters.column || "TODO").toUpperCase()
      }).returning();
      executedObject = newTask;

      await db.insert(notifications).values({
        workspaceId: req.workspaceId!,
        tenantId: req.tenantId as any,
        title: "Tarefa Criada via IA",
        description: `Olimpo AI inseriu a tarefa "${newTask.title}" no Kanban de operações.`,
        type: "success"
      });
    }
    else if (action === "UPDATE_TASK_STATUS" && parameters.taskId && parameters.column) {
      const [updated] = await db.update(tasks).set({ 
        status: (parameters.column || "TODO").toUpperCase()
      })
      .where(and(eq(tasks.id, Number(parameters.taskId)), eq(tasks.workspaceId, req.workspaceId!)))
      .returning();
      executedObject = updated;

      if (updated) {
        await db.insert(notifications).values({
          workspaceId: req.workspaceId!,
          tenantId: req.tenantId as any,
          title: "Tarefa Atualizada via IA",
          description: `Olimpo AI moveu a tarefa "${updated.title}" para a coluna "${parameters.column}".`,
          type: "success"
        });
      }
    }
    else if (action === "UPDATE_PROJECT_STATUS" && parameters.projectId && parameters.status) {
      const [updated] = await db.update(projects).set({ 
        status: parameters.status 
      })
      .where(and(eq(projects.id, Number(parameters.projectId)), eq(projects.workspaceId, req.workspaceId!)))
      .returning();
      executedObject = updated;

      if (updated) {
        await db.insert(notifications).values({
          workspaceId: req.workspaceId!,
          tenantId: req.tenantId as any,
          title: "Projeto Atualizado via IA",
          description: `Olimpo AI atualizou o projeto "${updated.name}" para o status "${parameters.status}".`,
          type: "success"
        });

        // Trigger Event Cascade if completed
        const sLower = parameters.status.toLowerCase();
        if (sLower === 'concluido' || sLower === 'concluído' || sLower === 'completed') {
          try {
            const { EventCascadeService } = await import("../services/EventCascadeService.ts");
            await EventCascadeService.handleProjectCompleted(req.workspaceId!, updated.id, updated.name, req.tenantId as any);
          } catch (err) {
            console.error("Failed to run completed cascade via AI action:", err);
          }
        }
      }
    }

    res.json({
      action,
      parameters,
      explanation,
      executedObject
    });

  } catch (error: any) {
    console.error("AI Operational Agent Route Error:", error);
    res.status(500).json({ error: "Failed to process AI agent instruction", details: error.message });
  }
});

apiRouter.post("/flow-builder/generate-node", async (req: AuthRequest, res) => {
  try {
    const { prompt, context } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    
    const nodeDef = await generateNodeDefinition(prompt, context);
    res.json(nodeDef);
  } catch (error) {
    console.error("Error generating node:", error);
    res.status(500).json({ error: "Failed to generate node definition" });
  }
});

apiRouter.post("/flow-builder", async (req: AuthRequest, res) => {
  try {
    const { name, type, flowJson } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    
    const [newFlow] = await db.insert(flows).values({
      workspaceId: req.workspaceId!,
      userUid: req.user!.uid,
      name,
      type: type || 'flow',
      flowJson: flowJson || { nodes: [], edges: [] }
    }).returning();
    res.json(newFlow);
  } catch (error) {
    console.error("Error creating flow:", error);
    res.status(500).json({ error: "Failed to create flow" });
  }
});

apiRouter.put("/flow-builder/:id", async (req: AuthRequest, res) => {
  try {
    const { name, type, flowJson } = req.body;
    const updateValues: any = { updatedAt: new Date() };
    if (name !== undefined) updateValues.name = name;
    if (type !== undefined) updateValues.type = type;
    if (flowJson !== undefined) updateValues.flowJson = flowJson;

    const [updated] = await db.update(flows)
      .set(updateValues)
      .where(and(eq(flows.id, Number(req.params.id)), eq(flows.workspaceId, req.workspaceId!)))
      .returning();
    
    if (!updated) return res.status(404).json({ error: "Flow not found" });
    res.json(updated);
  } catch (error) {
    console.error("Error updating flow:", error);
    res.status(500).json({ error: "Failed to update flow" });
  }
});

apiRouter.delete("/flow-builder/:id", async (req: AuthRequest, res) => {
  try {
    await db.delete(flows).where(and(eq(flows.id, Number(req.params.id)), eq(flows.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting flow:", error);
    res.status(500).json({ error: "Failed to delete flow" });
  }
});

// --- NOTIFICATIONS ---
apiRouter.get("/notifications", async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(notifications).where(eq(notifications.workspaceId, req.workspaceId!)).orderBy(desc(notifications.createdAt));
    res.json(list);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

apiRouter.post("/notifications", async (req: AuthRequest, res) => {
  try {
    const { title, description, type } = req.body;
    const [newNotif] = await db.insert(notifications).values({
      workspaceId: req.workspaceId!,
      title,
      description,
      type: type || 'info'
    }).returning();
    res.json(newNotif);
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

apiRouter.put("/notifications/read-all", async (req: AuthRequest, res) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.workspaceId, req.workspaceId!));
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});

apiRouter.put("/notifications/:id/read", async (req: AuthRequest, res) => {
  try {
    await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, Number(req.params.id)), eq(notifications.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// --- AGENDA / EVENTS ---
apiRouter.get("/agenda", async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(agendaEvents).where(eq(agendaEvents.workspaceId, req.workspaceId!));
    
    const allProjects = await db.select().from(projects).where(eq(projects.workspaceId, req.workspaceId!));
    const allCompanies = await db.select().from(companies).where(eq(companies.workspaceId, req.workspaceId!));
    
    const projectMap = new Map(allProjects.map(p => [p.id, p]));
    const companyMap = new Map(allCompanies.map(c => [c.id, c]));
    
    const formatted = list.map(evt => ({
      id: String(evt.id),
      title: evt.title,
      description: evt.description,
      date: evt.date,
      startTime: evt.startTime,
      endTime: evt.endTime,
      owner: evt.owner,
      participants: evt.participants || [],
      location: evt.location || "",
      type: evt.type,
      category: evt.category,
      status: evt.status,
      reminder: evt.reminder,
      recurrence: evt.recurrence,
      recurrenceDescription: evt.recurrenceDescription,
      linkedProject: evt.linkedProjectId ? { id: evt.linkedProjectId, name: projectMap.get(evt.linkedProjectId)?.name || "" } : undefined,
      linkedCompany: evt.linkedCompanyId ? { id: evt.linkedCompanyId, name: companyMap.get(evt.linkedCompanyId)?.name || "" } : undefined,
      comments: evt.comments || [],
      attachments: evt.attachments || [],
      checklist: evt.checklist || [],
      history: evt.history || [],
      reservedResources: evt.reservedResources || [],
      isTimeBlock: evt.isTimeBlock,
      timeBlockType: evt.timeBlockType,
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error("Error fetching agenda:", error);
    res.status(500).json({ error: "Failed to fetch agenda events" });
  }
});

apiRouter.post("/agenda", async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    
    let linkedProjectId: number | null = null;
    if (body.linkedProject?.id) {
      const projId = Number(body.linkedProject.id);
      const [existsProj] = await db.select().from(projects).where(and(eq(projects.id, projId), eq(projects.workspaceId, req.workspaceId!)));
      if (existsProj) {
        linkedProjectId = existsProj.id;
      }
    }

    let linkedCompanyId: number | null = null;
    if (body.linkedCompany?.id) {
      const compId = Number(body.linkedCompany.id);
      const [existsComp] = await db.select().from(companies).where(and(eq(companies.id, compId), eq(companies.workspaceId, req.workspaceId!)));
      if (existsComp) {
        linkedCompanyId = existsComp.id;
      }
    }

    const [inserted] = await db.insert(agendaEvents).values({
      workspaceId: req.workspaceId!,
      title: body.title,
      description: body.description || "",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      owner: body.owner,
      participants: body.participants || [],
      location: body.location || "",
      type: body.type || 'compromisso',
      category: body.category || 'Administrativo',
      status: body.status || 'Agendado',
      reminder: body.reminder || 'none',
      recurrence: body.recurrence || 'none',
      recurrenceDescription: body.recurrenceDescription || "",
      linkedProjectId,
      linkedCompanyId,
      linkedTaskId: body.linkedTask?.id ? Number(body.linkedTask.id) : null,
      comments: body.comments || [],
      attachments: body.attachments || [],
      checklist: body.checklist || [],
      history: body.history || [],
      reservedResources: body.reservedResources || [],
      isTimeBlock: !!body.isTimeBlock,
      timeBlockType: body.timeBlockType || 'none',
    }).returning();
    
    res.json({
      ...body,
      id: String(inserted.id)
    });
  } catch (error) {
    console.error("Error creating agenda event:", error);
    res.status(500).json({ error: "Failed to create agenda event" });
  }
});

apiRouter.put("/agenda/:id", async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.id);
    const body = req.body;
    
    let linkedProjectId: number | null = null;
    if (body.linkedProject?.id) {
      const projId = Number(body.linkedProject.id);
      const [existsProj] = await db.select().from(projects).where(and(eq(projects.id, projId), eq(projects.workspaceId, req.workspaceId!)));
      if (existsProj) {
        linkedProjectId = existsProj.id;
      }
    }

    let linkedCompanyId: number | null = null;
    if (body.linkedCompany?.id) {
      const compId = Number(body.linkedCompany.id);
      const [existsComp] = await db.select().from(companies).where(and(eq(companies.id, compId), eq(companies.workspaceId, req.workspaceId!)));
      if (existsComp) {
        linkedCompanyId = existsComp.id;
      }
    }

    await db.update(agendaEvents).set({
      title: body.title,
      description: body.description || "",
      date: body.date,
      startTime: body.startTime,
      endTime: body.endTime,
      owner: body.owner,
      participants: body.participants || [],
      location: body.location || "",
      type: body.type,
      category: body.category,
      status: body.status,
      reminder: body.reminder || 'none',
      recurrence: body.recurrence || 'none',
      recurrenceDescription: body.recurrenceDescription || "",
      linkedProjectId,
      linkedCompanyId,
      linkedTaskId: body.linkedTask?.id ? Number(body.linkedTask.id) : null,
      comments: body.comments || [],
      attachments: body.attachments || [],
      checklist: body.checklist || [],
      history: body.history || [],
      reservedResources: body.reservedResources || [],
      isTimeBlock: !!body.isTimeBlock,
      timeBlockType: body.timeBlockType || 'none',
      updatedAt: new Date()
    }).where(and(eq(agendaEvents.id, eventId), eq(agendaEvents.workspaceId, req.workspaceId!)));
    
    res.json({
      ...body,
      id: String(eventId)
    });
  } catch (error) {
    console.error("Error updating agenda event:", error);
    res.status(500).json({ error: "Failed to update agenda event" });
  }
});

apiRouter.delete("/agenda/:id", async (req: AuthRequest, res) => {
  try {
    const eventId = Number(req.params.id);
    await db.delete(agendaEvents).where(and(eq(agendaEvents.id, eventId), eq(agendaEvents.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting agenda event:", error);
    res.status(500).json({ error: "Failed to delete agenda event" });
  }
});

// --- COMPANIES UPDATE & DELETE ---
apiRouter.put("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const compId = Number(req.params.id);
    const { name, cnpj, industry, size, website, linkedin, instagram, facebook, status, logoUrl, coverUrl } = req.body;
    
    const updateValues: any = { updatedAt: new Date() };
    if (name !== undefined) updateValues.name = name;
    if (cnpj !== undefined) updateValues.cnpj = cnpj;
    if (industry !== undefined) updateValues.industry = industry;
    if (size !== undefined) updateValues.size = size;
    if (website !== undefined) updateValues.website = website;
    if (linkedin !== undefined) updateValues.linkedin = linkedin;
    if (instagram !== undefined) updateValues.instagram = instagram;
    if (facebook !== undefined) updateValues.facebook = facebook;
    if (status !== undefined) updateValues.status = status;
    if (logoUrl !== undefined) updateValues.logoUrl = logoUrl;
    if (coverUrl !== undefined) updateValues.coverUrl = coverUrl;

    const data = await db.update(companies)
      .set(updateValues)
      .where(and(eq(companies.id, compId), eq(companies.workspaceId, req.workspaceId!)))
      .returning();
      
    res.json(data[0]);
  } catch (error) {
    console.error("Error updating company:", error);
    res.status(500).json({ error: "Failed to update company" });
  }
});

apiRouter.delete("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const compId = Number(req.params.id);
    await db.delete(companies).where(and(eq(companies.id, compId), eq(companies.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).json({ error: "Failed to delete company" });
  }
});

// --- WORKSPACE MEMBERS ADMIN OPTIONS ---
apiRouter.put("/workspace/members/:userUid/role", async (req: AuthRequest, res) => {
  try {
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { role, cargo } = req.body;
    const { userUid } = req.params;
    const updates: any = {};

    if (role !== undefined) {
      const selectedRole = isWorkspaceRole(String(role).toUpperCase()) ? (String(role).toUpperCase() as WorkspaceRole) : null;
      if (!selectedRole) {
        return res.status(400).json({ error: "Invalid role provided." });
      }
      updates.role = selectedRole;
    }

    if (cargo !== undefined) updates.cargo = cargo;
    
    await db.update(workspaceMembers)
      .set(updates)
      .where(and(eq(workspaceMembers.userUid, userUid), eq(workspaceMembers.workspaceId, req.workspaceId!)));
      
    if (cargo !== undefined) {
      await db.update(users).set({ role: cargo }).where(eq(users.uid, userUid));
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error setting member role:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

apiRouter.delete("/workspace/members/:userUid", async (req: AuthRequest, res) => {
  try {
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { userUid } = req.params;
    await db.delete(workspaceMembers).where(and(eq(workspaceMembers.userUid, userUid), eq(workspaceMembers.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

apiRouter.post("/workspace/members", async (req: AuthRequest, res) => {
  try {
    const canManageMembers = await hasPermission(req.user!.uid, req.workspaceId!, 'manage_members');
    if (!canManageMembers) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    const { email, role, displayName, cargo, projectId } = req.body;
    if (!email) {
      return res.status(400).json({ error: "O e-mail é obrigatório." });
    }
    
    const selectedRole = isWorkspaceRole(String(role).toUpperCase()) ? (String(role).toUpperCase() as WorkspaceRole) : WorkspaceRole.MEMBER;

    // Check if user exists in the system
    let usr = null;
    const [existingUsr] = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUsr) {
      usr = existingUsr;
    } else {
      // If user does not exist, we dynamically create them (real employee provisioning like Jira!)
      const generatedUid = "invited_" + email.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Math.floor(Math.random() * 1000);
      const [newUsr] = await db.insert(users).values({
        uid: generatedUid,
        email: email,
        displayName: displayName || email?.split('@')[0],
        role: cargo || "Colaborador",
      }).returning();
      usr = newUsr;
    }

    // Check if user is already in this workspace
    const [existingMember] = await db.select()
      .from(workspaceMembers)
      .where(and(eq(workspaceMembers.workspaceId, req.workspaceId!), eq(workspaceMembers.userUid, usr.uid)));
      
    if (existingMember) {
      return res.status(400).json({ error: "O usuário já é colaborador neste workspace." });
    }

    // Add member to workspace
    await db.insert(workspaceMembers).values({
      workspaceId: req.workspaceId!,
      userUid: usr.uid,
      role: role || "MEMBER",
      cargo: cargo || "Colaborador"
    });

    // Get Workspace Name
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, req.workspaceId!));
    const workspaceName = workspace ? workspace.name : "Cyzor Workspace";
    const assignedBy = req.user?.displayName || req.user?.email || "Administrador";

    // Handle Project Assignment & Team integration
    let assignedProject = null;
    if (projectId) {
      const [proj] = await db.select().from(projects).where(and(eq(projects.id, Number(projectId)), eq(projects.workspaceId, req.workspaceId!)));
      assignedProject = proj;
    } else {
      // Auto-assign to first project in workspace if exists
      const [firstProj] = await db.select().from(projects).where(eq(projects.workspaceId, req.workspaceId!)).limit(1);
      assignedProject = firstProj;
    }

    if (assignedProject) {
      const currentTeam = assignedProject.team || [];
      const isAlreadyInTeam = currentTeam.some((m: any) => m.email === email);
      if (!isAlreadyInTeam) {
        const initials = (displayName || usr.displayName || email?.split('@')[0])
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        
        const newMember = {
          name: displayName || usr.displayName || email?.split('@')[0],
          role: cargo || "Colaborador",
          email: email,
          avatar: initials,
          allocation: 100
        };
        const updatedTeam = [...currentTeam, newMember];
        
        const log = {
          id: Date.now(),
          user: assignedBy,
          action: `adicionou o membro "${newMember.name}" como ${newMember.role}`,
          time: "Agora"
        };
        
        await db.update(projects).set({
          team: updatedTeam,
          history: [log, ...(assignedProject.history || [])]
        }).where(eq(projects.id, assignedProject.id));
      }

      // Send professional notification e-mail
      await sendProjectNotificationEmail({
        to: email,
        userName: displayName || usr.displayName || email?.split('@')[0],
        projectName: assignedProject.name,
        role: cargo || "Colaborador",
        workspaceName,
        assignedBy,
        workspaceId: req.workspaceId!,
      });
    } else {
      // If no project exists at all in the workspace, we dynamically create an initial one for them to join (Jira-style)
      const [newProj] = await db.insert(projects).values({
        workspaceId: req.workspaceId!,
        name: "Onboarding & Atividades Gerais",
        description: "Projeto padrão para onboarding e rastreamento das primeiras atividades do novo colaborador.",
        status: "Em Andamento",
        priority: "Média",
        team: [{
          name: displayName || usr.displayName || email?.split('@')[0],
          role: cargo || "Colaborador",
          email: email,
          avatar: (displayName || email).charAt(0).toUpperCase(),
          allocation: 100
        }]
      }).returning();

      await sendProjectNotificationEmail({
        to: email,
        userName: displayName || usr.displayName || email?.split('@')[0],
        projectName: newProj.name,
        role: cargo || "Colaborador",
        workspaceName,
        assignedBy,
        workspaceId: req.workspaceId!,
      });
    }

    res.json({ success: true, userUid: usr.uid });
  } catch (error: any) {
    console.error("Error adding workspace member:", error);
    res.status(500).json({ error: error.message || "Failed to add workspace member" });
  }
});

// --- PERSISTENT USER SETTINGS ---
apiRouter.get("/user-settings", async (req: AuthRequest, res) => {
  try {
    const [userRecord] = await db.select().from(users).where(eq(users.uid, req.user!.uid));
    if (!userRecord) {
      return res.status(404).json({ error: "User profile not found in database" });
    }
    res.json(userRecord);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    res.status(500).json({ error: "Failed to fetch user settings" });
  }
});

apiRouter.put("/user-settings", async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    const [updated] = await db.update(users).set({
      displayName: body.displayName,
      phone: body.phone,
      role: body.role,
      settings: body.settings || {},
      updatedAt: new Date()
    }).where(eq(users.uid, req.user!.uid)).returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating user settings:", error);
    res.status(500).json({ error: "Failed to update user settings" });
  }
});

// --- PERSISTENT WORKSPACE SETTINGS ---
apiRouter.get("/workspace-settings", async (req: AuthRequest, res) => {
  try {
    const [workspaceRecord] = await db.select().from(workspaces).where(eq(workspaces.id, req.workspaceId!));
    if (!workspaceRecord) {
      return res.status(404).json({ error: "Workspace record not found" });
    }

    const [companiesCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(companies).where(eq(companies.workspaceId, req.workspaceId!));
    const [projectsCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(projects).where(eq(projects.workspaceId, req.workspaceId!));
    const [productsCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(products).where(eq(products.workspaceId, req.workspaceId!));
    const [membersCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(workspaceMembers).where(eq(workspaceMembers.workspaceId, req.workspaceId!));

    res.json({
      workspace: workspaceRecord,
      stats: {
        companies: companiesCount?.count || 0,
        projects: projectsCount?.count || 0,
        products: productsCount?.count || 0,
        members: membersCount?.count || 0
      }
    });
  } catch (error) {
    console.error("Error fetching workspace settings:", error);
    res.status(500).json({ error: "Failed to fetch workspace settings" });
  }
});

apiRouter.put("/workspace-settings", async (req: AuthRequest, res) => {
  try {
    const body = req.body;
    const settings = { ...(body.settings || {}) };
    if (settings.smtp) {
      delete settings.smtp;
    }
    const [updated] = await db.update(workspaces).set({
      name: body.name,
      settings,
      updatedAt: new Date()
    }).where(eq(workspaces.id, req.workspaceId!)).returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating workspace settings:", error);
    res.status(500).json({ error: "Failed to update workspace settings" });
  }
});

apiRouter.post("/mail/send-sample", async (req: AuthRequest, res) => {
  try {
    const { to } = req.body;
    if (!to) {
      return res.status(400).json({ error: "Destinatário de teste é obrigatório." });
    }

    // Load first project in workspace if any
    const [project] = await db.select().from(projects).where(eq(projects.workspaceId, req.workspaceId!)).limit(1);
    const projectName = project ? project.name : "Projeto Exemplo Alpha";
    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, req.workspaceId!));
    const workspaceName = workspace ? workspace.name : "Cyzor Control Workspace";

    const result = await sendProjectNotificationEmail({
      to,
      userName: "Membro de Teste",
      projectName,
      role: "Engenheiro de Software Sênior",
      workspaceName,
      assignedBy: req.user?.displayName || "Administrador do Sistema",
      workspaceId: req.workspaceId!
    });

    res.json(result);
  } catch (err: any) {
    console.error("Send sample email error route:", err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
});

apiRouter.get("/workspaces-detailed", async (req: AuthRequest, res) => {
  try {
    const list = await db.select({
      id: workspaces.id,
      name: workspaces.name,
      plan: workspaces.plan,
      role: workspaceMembers.role,
      createdAt: workspaces.createdAt,
      settings: workspaces.settings
    })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
    .where(eq(workspaceMembers.userUid, req.user!.uid));

    if (list.length === 0) {
      return res.json([]);
    }

    const wsIds = list.map(ws => ws.id);

    const compCounts = await db.select({
      workspaceId: companies.workspaceId,
      count: sql<number>`CAST(count(*) AS INTEGER)`
    }).from(companies).where(inArray(companies.workspaceId, wsIds)).groupBy(companies.workspaceId);

    const projCounts = await db.select({
      workspaceId: projects.workspaceId,
      count: sql<number>`CAST(count(*) AS INTEGER)`
    }).from(projects).where(inArray(projects.workspaceId, wsIds)).groupBy(projects.workspaceId);

    const prodCounts = await db.select({
      workspaceId: products.workspaceId,
      count: sql<number>`CAST(count(*) AS INTEGER)`
    }).from(products).where(inArray(products.workspaceId, wsIds)).groupBy(products.workspaceId);

    const compMap = new Map(compCounts.map(c => [c.workspaceId, c.count]));
    const projMap = new Map(projCounts.map(c => [c.workspaceId, c.count]));
    const prodMap = new Map(prodCounts.map(c => [c.workspaceId, c.count]));

    const detailedList = list.map(ws => ({
      ...ws,
      stats: {
        companies: compMap.get(ws.id) || 0,
        projects: projMap.get(ws.id) || 0,
        products: prodMap.get(ws.id) || 0
      }
    }));

    res.json(detailedList);
  } catch (error) {
    console.error("Error fetching detailed workspaces:", error);
    res.status(500).json({ error: "Failed to fetch detailed workspaces" });
  }
});

apiRouter.post("/workspaces", async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Workspace name is required" });
    }
    const [newWorkspace] = await db.insert(workspaces).values({
      name,
      ownerUid: req.user!.uid,
      plan: "Pro",
      settings: {}
    }).returning();

    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userUid: req.user!.uid,
      role: "OWNER"
    });

    res.json(newWorkspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ error: "Failed to create workspace" });
  }
});

apiRouter.post("/workspaces/:id/duplicate", async (req: AuthRequest, res) => {
  try {
    const wsId = Number(req.params.id);
    const [source] = await db.select().from(workspaces).where(eq(workspaces.id, wsId));
    if (!source) {
      return res.status(404).json({ error: "Workspace not found" });
    }
    const [newWorkspace] = await db.insert(workspaces).values({
      name: `${source.name} (Cópia)`,
      ownerUid: req.user!.uid,
      plan: source.plan,
      settings: source.settings || {}
    }).returning();

    await db.insert(workspaceMembers).values({
      workspaceId: newWorkspace.id,
      userUid: req.user!.uid,
      role: "OWNER"
    });

    res.json(newWorkspace);
  } catch (error) {
    console.error("Error duplicating workspace:", error);
    res.status(500).json({ error: "Failed to duplicate workspace" });
  }
});

apiRouter.delete("/workspaces/:id", async (req: AuthRequest, res) => {
  try {
    const wsId = Number(req.params.id);
    const [membership] = await db.select({ id: workspaceMembers.id, role: workspaceMembers.role }).from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, wsId), eq(workspaceMembers.userUid, req.user!.uid)));
    if (!membership || membership.role !== "OWNER") {
      return res.status(403).json({ error: "Only the owner can delete a workspace" });
    }
    await db.delete(workspaces).where(eq(workspaces.id, wsId));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    res.status(500).json({ error: "Failed to delete workspace" });
  }
});

// Global error handler for apiRouter
apiRouter.use((err: any, req: any, res: any, next: any) => {
  console.error("API Router Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

apiRouter.get("/admin/evolution-config", requireAuth, async (req: AuthRequest, res) => {
  try {
    // Prefer the new 'evolution_config' key, but fall back to legacy 'bes_config' for compatibility
    let configRow = await db.select().from(platformSettings).where(eq(platformSettings.key, 'evolution_config')).limit(1);
    if (!configRow || configRow.length === 0) {
      configRow = await db.select().from(platformSettings).where(eq(platformSettings.key, 'bes_config')).limit(1);
    }
    res.json(configRow[0]?.value || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch evolution config" });
  }
});

apiRouter.put("/admin/evolution-config", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { config } = req.body;
    // Upsert into the new key and keep the legacy key in sync for backward compatibility
    await db.insert(platformSettings)
      .values({ key: 'evolution_config', value: config })
      .onConflictDoUpdate({ target: platformSettings.key, set: { value: config, updatedAt: new Date() } });

    await db.insert(platformSettings)
      .values({ key: 'bes_config', value: config })
      .onConflictDoUpdate({ target: platformSettings.key, set: { value: config, updatedAt: new Date() } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update evolution config" });
  }
});

// Legacy BIS routes kept for compatibility
apiRouter.get("/admin/bes-config", requireAuth, async (req: AuthRequest, res) => {
  try {
    const config = await db.select().from(platformSettings).where(eq(platformSettings.key, 'bes_config')).limit(1);
    res.json(config[0]?.value || {});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch BES config" });
  }
});

apiRouter.put("/admin/bes-config", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { config } = req.body;
    await db.insert(platformSettings)
      .values({ key: 'bes_config', value: config })
      .onConflictDoUpdate({ target: platformSettings.key, set: { value: config, updatedAt: new Date() } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update BES config" });
  }
});

apiRouter.get("/evolution/insights", requireAuth, async (req: AuthRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    
    // Determine evolution XP (prefer professionalEvolution, fall back to legacy besScore)
    const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
    const evolutionXp = (ws?.settings as any)?.professionalEvolution?.xpTotal ?? (ws?.settings as any)?.besScore ?? 0;

    // Get Core metrics
    const completedTasks = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(and(eq(tasks.workspaceId, workspaceId), eq(tasks.status, 'DONE')));

    res.json({
      evolutionXp,
      coreMetrics: {
        completedTasks: Number(completedTasks[0].count)
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch BES insights" });
  }
});

apiRouter.get("/career/profile", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const userUid = req.user!.uid;
    const tenantId = req.tenantId!;

    let [profile] = await db.select().from(professionalProfiles).where(and(eq(professionalProfiles.workspaceId, workspaceId), eq(professionalProfiles.userUid, userUid))).limit(1);

    if (!profile) {
      const [newProfile] = await db.insert(professionalProfiles).values({
        tenantId,
        workspaceId,
        userUid,
        title: 'Aprendiz',
        level: 1,
        xpTotal: 0,
        xpMonth: 0,
        xpWeek: 0,
        xpToday: 0,
        nextLevelXp: 100,
        competencies: {},
        achievements: [],
        statistics: {},
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      profile = newProfile;
    }

    const recentEvents = await db.select({
      id: professionalEvolutionEvents.id,
      eventType: professionalEvolutionEvents.eventType,
      xpDelta: professionalEvolutionEvents.xpDelta,
      achievementKeys: professionalEvolutionEvents.achievementKeys,
      createdAt: professionalEvolutionEvents.createdAt,
      payload: professionalEvolutionEvents.payload
    })
    .from(professionalEvolutionEvents)
    .where(and(eq(professionalEvolutionEvents.workspaceId, workspaceId), eq(professionalEvolutionEvents.userUid, userUid)))
    .orderBy(desc(professionalEvolutionEvents.createdAt))
    .limit(10);

    res.json({
      profile,
      recentEvents
    });
  } catch (err) {
    console.error('Error fetching career profile:', err);
    res.status(500).json({ error: 'Failed to fetch career profile' });
  }
});

apiRouter.get("/career/leaderboard", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;

    const leaderboard = await db.select({
      userUid: professionalProfiles.userUid,
      level: professionalProfiles.level,
      xpTotal: professionalProfiles.xpTotal,
      title: professionalProfiles.title,
      competencies: professionalProfiles.competencies
    })
    .from(professionalProfiles)
    .where(eq(professionalProfiles.workspaceId, workspaceId))
    .orderBy(desc(professionalProfiles.xpTotal))
    .limit(10);

    res.json({ leaderboard });
  } catch (err) {
    console.error('Error fetching career leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch career leaderboard' });
  }
});

apiRouter.get("/career/goals", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const userUid = req.user!.uid;
    const goals = await db.select().from(professionalGoals).where(and(eq(professionalGoals.workspaceId, workspaceId), eq(professionalGoals.userUid, userUid))).orderBy(desc(professionalGoals.updatedAt));
    res.json({ goals });
  } catch (err) {
    console.error('Error fetching career goals:', err);
    res.status(500).json({ error: 'Failed to fetch career goals' });
  }
});

apiRouter.post("/career/goals", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const tenantId = req.tenantId!;
    const userUid = req.user!.uid;
    const { title, description, targetDate, status, progress } = req.body;
    if (!title) return res.status(400).json({ error: 'Goal title is required' });

    const [goal] = await db.insert(professionalGoals).values({
      tenantId,
      workspaceId,
      userUid,
      title,
      description: description || null,
      targetDate: targetDate ? new Date(targetDate) : null,
      status: status || 'OPEN',
      progress: progress ?? 0,
      metadata: {}
    }).returning();

    res.json({ goal });
  } catch (err) {
    console.error('Error creating career goal:', err);
    res.status(500).json({ error: 'Failed to create career goal' });
  }
});

apiRouter.get("/career/certifications", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const userUid = req.user!.uid;
    const certifications = await db.select().from(professionalCertifications).where(and(eq(professionalCertifications.workspaceId, workspaceId), eq(professionalCertifications.userUid, userUid))).orderBy(desc(professionalCertifications.obtainedAt));
    res.json({ certifications });
  } catch (err) {
    console.error('Error fetching certifications:', err);
    res.status(500).json({ error: 'Failed to fetch certifications' });
  }
});

apiRouter.post("/career/certifications", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) => {
  try {
    const workspaceId = req.workspaceId!;
    const tenantId = req.tenantId!;
    const userUid = req.user!.uid;
    const { name, issuer, obtainedAt, expiresAt, credentialUrl, notes } = req.body;
    if (!name) return res.status(400).json({ error: 'Certification name is required' });

    const [certification] = await db.insert(professionalCertifications).values({
      tenantId,
      workspaceId,
      userUid,
      name,
      issuer: issuer || null,
      obtainedAt: obtainedAt ? new Date(obtainedAt) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      credentialUrl: credentialUrl || null,
      notes: notes || null
    }).returning();

    res.json({ certification });
  } catch (err) {
    console.error('Error creating certification:', err);
    res.status(500).json({ error: 'Failed to create certification' });
  }
});

apiRouter.get("/missions/active", requireAuth, async (req: AuthRequest, res) => {
    try {
        await MissionService.seedMissions();
        const mission = await MissionService.getActiveMission(req.workspaceId!);
        res.json(mission);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active mission" });
    }
});

apiRouter.post("/ideas/analyze", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { title, description, workspaceId } = req.body;
        const prompt = `Analise a seguinte ideia de negócio e retorne um JSON estruturado com os campos: problema, solucao, publico, diferenciais, riscos.
        Ideia: ${title}
        Descrição: ${description}`;

        const model = "gemini-3.5-flash";
        const result = await ai.models.generateContent({
            model: model,
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });
        const text = result.text;
        // Remove markdown formatting
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonString);

        const newIdea = await db.insert(ideas).values({
            tenantId: req.tenantId as any,
            workspaceId: parseInt(workspaceId),
            title,
            description,
            analysis
        }).returning();

        res.json(newIdea[0]);
    } catch (err) {
        console.error("Error analyzing idea:", err);
        res.status(500).json({ error: "Failed to analyze idea" });
    }
});

apiRouter.post("/missions/init", requireAuth, async (req: AuthRequest, res) => {
    try {
        const { workspaceId } = req.body;
        await MissionService.initializeWorkspaceMissions(workspaceId);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to initialize missions" });
    }
});

// ElevenLabs Text-to-Speech proxy endpoint with fallback
apiRouter.post("/ai/tts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { text, voiceId } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY || "sk_40b8d4a80692c0288aa15ba7394ec572551db33ef324a749";
    if (!apiKey) {
      return res.status(200).json({ error: "ELEVENLABS_API_KEY is not configured", fallback: true });
    }

    // Default Portuguese-friendly high-quality ElevenLabs voice (ZqvIIuD5aI9JFejebHiH as default)
    const selectedVoiceId = voiceId || process.env.ELEVENLABS_VOICE_ID || "ZqvIIuD5aI9JFejebHiH";

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ElevenLabs Proxy] API error:", errorText);
      let parsedError = errorText;
      try {
        const parsed = JSON.parse(errorText);
        parsedError = parsed.detail?.message || parsed.message || errorText;
      } catch (e) {}
      return res.status(response.status || 400).json({ error: parsedError });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": buffer.length,
    });
    res.send(buffer);
  } catch (err: any) {
    console.error("[ElevenLabs Proxy] TTS exception:", err);
    res.status(500).json({ error: err.message });
  }
});

// Final catch-all for apiRouter
apiRouter.use((req, res) => {
  console.log(`[apiRouter 404] ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found in apiRouter` });
});

export default apiRouter;
