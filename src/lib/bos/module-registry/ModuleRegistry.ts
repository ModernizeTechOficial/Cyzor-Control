import { db } from '../../../db/index';
import { modules, resources, permissions, featureFlags, tenants, workspaces } from '../../../db/schema';
import { and, or, eq, sql, desc, asc } from 'drizzle-orm';

// ============================================================================
// TYPES
// ============================================================================

export type ModuleSlug = string;
export type ResourceSlug = string;
export type ActionSlug = string;

export interface ModuleManifest {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  version: string;
  status: 'active' | 'beta' | 'deprecated';
  isSystem?: boolean;
  dependencies: string[];
  routes: ModuleRoute[];
  menus: ModuleMenu[];
  widgets: ModuleWidget[];
  resources: ModuleResourceDefinition[];
  actions: ModuleActionDefinition[];
  events: ModuleEvent[];
  automations: ModuleAutomation[];
  aiTools: ModuleAITool[];
  dashboard: ModuleDashboardConfig;
  permissions: string[];
}

export interface ModuleRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  permission?: string;
  component?: string;
}

export interface ModuleMenu {
  id: string;
  label: string;
  icon: string;
  path: string;
  permission?: string;
  order: number;
  children?: ModuleMenu[];
}

export interface ModuleWidget {
  id: string;
  type: string;
  title: string;
  permission?: string;
  size: 'small' | 'medium' | 'large';
  order: number;
}

export interface ModuleResourceDefinition {
  slug: string;
  name: string;
  tableName?: string;
  actions: ActionSlug[];
}

export interface ModuleActionDefinition {
  slug: ActionSlug;
  name: string;
  description?: string;
}

export interface ModuleEvent {
  name: string;
  description?: string;
  payload: Record<string, any>;
}

export interface ModuleAutomation {
  trigger: string;
  action: string;
  description?: string;
}

export interface ModuleAITool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface ModuleDashboardConfig {
  widgets: string[];
  defaultLayout: 'grid' | 'list';
}

export interface RegisteredModule {
  id: number;
  slug: string;
  name: string;
  description?: string;
  icon: string;
  category: string;
  version: string;
  status: string;
  isSystem: boolean;
  dependencies: string[];
  manifest: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MODULE REGISTRY - Auto-discovery and lifecycle management
// ============================================================================

export class ModuleRegistry {
  private moduleCache: Map<string, RegisteredModule> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  // -------------------------------------------------------------------------
  // REGISTRATION
  // -------------------------------------------------------------------------

  async registerModule(manifest: ModuleManifest, tenantId: string, workspaceId?: number): Promise<RegisteredModule> {
    const [module] = await db.insert(modules).values({
      slug: manifest.slug,
      name: manifest.name,
      description: manifest.description || null,
      icon: manifest.icon || 'box',
      category: manifest.category || 'general',
      version: manifest.version || '1.0.0',
      status: manifest.status || 'active',
      isSystem: manifest.slug === 'core' || manifest.slug === 'auth' || manifest.slug === 'workspace',
      dependencies: manifest.dependencies || [],
      manifest: manifest as any,
      tenantId,
    }).returning();

    // Register resources
    for (const resourceDef of manifest.resources) {
      await this.registerResource(module.slug, resourceDef, tenantId);
    }

    // Register feature flag
    await db.insert(featureFlags).values({
      key: `${manifest.slug}_module_enabled`,
      name: `${manifest.name} habilitado`,
      description: `Habilita o módulo ${manifest.name}`,
      isEnabled: true,
      scope: 'workspace',
      workspaceId: workspaceId || 0,
      tenantId,
      metadata: { moduleSlug: manifest.slug },
    }).onConflictDoNothing();

    // Cache
    const registeredModule: RegisteredModule = {
      id: module.id,
      slug: module.slug,
      name: module.name,
      description: module.description,
      icon: module.icon,
      category: module.category,
      version: module.version,
      status: module.status,
      isSystem: module.isSystem,
      dependencies: module.dependencies as string[],
      manifest: module.manifest as any,
      tenantId: module.tenantId,
      createdAt: module.createdAt,
      updatedAt: module.updatedAt,
    };

    this.moduleCache.set(module.slug, registeredModule);

    return registeredModule;
  }

  async unregisterModule(slug: string, tenantId: string): Promise<void> {
    await db.delete(modules).where(and(eq(modules.slug, slug), eq(modules.tenantId, tenantId)));
    this.moduleCache.delete(slug);
  }

  // -------------------------------------------------------------------------
  // RESOURCE REGISTRATION
  // -------------------------------------------------------------------------

  async registerResource(
    moduleSlug: string,
    resourceDef: ModuleResourceDefinition,
    tenantId: string
  ): Promise<void> {
    await db.insert(resources).values({
      slug: resourceDef.slug,
      moduleSlug,
      name: resourceDef.name,
      tableName: resourceDef.tableName || null,
      isActive: true,
      tenantId,
    }).onConflictDoNothing();

    // Register permissions for each action
    for (const action of resourceDef.actions) {
      const permissionSlug = `${resourceDef.slug}.${action}`;
      await this.registerPermission(
        moduleSlug,
        resourceDef.slug,
        action,
        `Permissão para ${action} em ${resourceDef.name}`,
        tenantId
      );
    }
  }

  // -------------------------------------------------------------------------
  // PERMISSION REGISTRATION
  // -------------------------------------------------------------------------

  async registerPermission(
    moduleSlug: string,
    resourceSlug: string,
    action: ActionSlug,
    description: string,
    tenantId: string
  ): Promise<void> {
    const permissionSlug = `${resourceSlug}.${action}`;

    const [existing] = await db
      .select()
      .from(permissions)
      .where(eq(permissions.slug, permissionSlug))
      .limit(1);

    if (!existing) {
      await db.insert(permissions).values({
        slug: permissionSlug,
        module: moduleSlug,
        resource: resourceSlug,
        action,
        description,
        isSystem: false,
        isActive: true,
      }).onConflictDoNothing();
    }
  }

  // -------------------------------------------------------------------------
  // MODULE DISCOVERY
  // -------------------------------------------------------------------------

  async getModule(slug: string, tenantId: string): Promise<RegisteredModule | null> {
    const cacheKey = `${tenantId}:${slug}`;
    const cached = this.moduleCache.get(cacheKey);
    if (cached) return cached;

    const [module] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.slug, slug), eq(modules.tenantId, tenantId)))
      .limit(1);

    if (!module) return null;

    const registered: RegisteredModule = {
      ...module,
      dependencies: module.dependencies as string[],
      manifest: module.manifest as any,
    };
    this.moduleCache.set(cacheKey, registered);

    return registered;
  }

  async getAllModules(tenantId: string, workspaceId?: number): Promise<RegisteredModule[]> {
    const allModules = await db
      .select()
      .from(modules)
      .where(and(eq(modules.tenantId, tenantId), eq(modules.status, 'active')));

    return allModules.map((m) => ({
      ...m,
      dependencies: m.dependencies as string[],
      manifest: m.manifest as any,
    }));
  }

  async getActiveModules(tenantId: string): Promise<RegisteredModule[]> {
    return this.getAllModules(tenantId);
  }

  async getModuleResources(moduleSlug: string, tenantId: string): Promise<any[]> {
    const moduleResources = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.moduleSlug, moduleSlug),
          eq(resources.tenantId, tenantId),
          eq(resources.isActive, true)
        )
      );

    return moduleResources;
  }

  async getModulePermissions(moduleSlug: string, tenantId: string): Promise<string[]> {
    const modulePerms = await db
      .select({ slug: permissions.slug })
      .from(permissions)
      .where(
        and(
          eq(permissions.module, moduleSlug),
          eq(permissions.isActive, true)
        )
      );

    return modulePerms.map((p) => p.slug);
  }

  // -------------------------------------------------------------------------
  // MODULE MANIFEST REGISTRATION
  // -------------------------------------------------------------------------

  async registerBuiltinModules(tenantId: string): Promise<void> {
    const builtinModules: ModuleManifest[] = [
      {
        id: 'core',
        slug: 'core',
        name: 'Núcleo',
        description: 'Funcionalidades centrais do sistema',
        icon: 'cpu',
        category: 'system',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: [],
        routes: [],
        menus: [],
        widgets: [],
        resources: [],
        actions: [],
        events: [],
        automations: [],
        aiTools: [],
        dashboard: { widgets: [], defaultLayout: 'grid' },
        permissions: ['core.access'],
      },
      {
        id: 'workspace',
        slug: 'workspace',
        name: 'Workspace',
        description: 'Gerenciamento de workspaces',
        icon: 'folder',
        category: 'system',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: ['core'],
        routes: [],
        menus: [],
        widgets: [],
        resources: [
          {
            slug: 'workspaces',
            name: 'Workspaces',
            tableName: 'workspaces',
            actions: ['view', 'create', 'edit', 'delete', 'manage'],
          },
        ],
        actions: [
          { slug: 'view', name: 'Visualizar' },
          { slug: 'create', name: 'Criar' },
          { slug: 'edit', name: 'Editar' },
          { slug: 'delete', name: 'Excluir' },
          { slug: 'manage', name: 'Gerenciar' },
        ],
        events: [],
        automations: [],
        aiTools: [],
        dashboard: { widgets: [], defaultLayout: 'grid' },
        permissions: ['workspaces.view', 'workspaces.create', 'workspaces.edit', 'workspaces.delete', 'workspaces.manage'],
      },
      {
        id: 'auth',
        slug: 'auth',
        name: 'Autenticação',
        description: 'Gerenciamento de usuários e autenticação',
        icon: 'lock',
        category: 'system',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: ['core'],
        routes: [],
        menus: [],
        widgets: [],
        resources: [
          {
            slug: 'users',
            name: 'Usuários',
            tableName: 'users',
            actions: ['view', 'create', 'edit', 'delete', 'manage'],
          },
          {
            slug: 'members',
            name: 'Membros',
            tableName: 'workspace_members',
            actions: ['view', 'invite', 'edit', 'remove', 'manage'],
          },
        ],
        actions: [
          { slug: 'view', name: 'Visualizar' },
          { slug: 'create', name: 'Criar' },
          { slug: 'edit', name: 'Editar' },
          { slug: 'delete', name: 'Excluir' },
          { slug: 'invite', name: 'Convidar' },
          { slug: 'remove', name: 'Remover' },
          { slug: 'manage', name: 'Gerenciar' },
        ],
        events: [],
        automations: [],
        aiTools: [],
        dashboard: { widgets: [], defaultLayout: 'grid' },
        permissions: [
          'users.view', 'users.create', 'users.edit', 'users.delete', 'users.manage',
          'members.view', 'members.invite', 'members.edit', 'members.remove', 'members.manage',
        ],
      },
      {
        id: 'finance',
        slug: 'finance',
        name: 'Financeiro',
        description: 'Gestão financeira e contábil',
        icon: 'dollar-sign',
        category: 'business',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: ['core', 'auth'],
        routes: [],
        menus: [{ id: 'financeiro', label: 'Financeiro', icon: 'dollar-sign', path: '/financeiro', order: 3 }],
        widgets: [],
        resources: [
          {
            slug: 'finance.entries',
            name: 'Lançamentos',
            tableName: 'finance_entries',
            actions: ['view', 'create', 'edit', 'delete', 'export', 'import', 'approve'],
          },
          {
            slug: 'finance.categories',
            name: 'Categorias',
            tableName: null,
            actions: ['view', 'create', 'edit', 'delete', 'manage'],
          },
        ],
        actions: [
          { slug: 'view', name: 'Visualizar' },
          { slug: 'create', name: 'Criar' },
          { slug: 'edit', name: 'Editar' },
          { slug: 'delete', name: 'Excluir' },
          { slug: 'export', name: 'Exportar' },
          { slug: 'import', name: 'Importar' },
          { slug: 'approve', name: 'Aprovar' },
          { slug: 'manage', name: 'Gerenciar' },
        ],
        events: [
          { name: 'InvoicePaid', description: 'Quando uma conta é paga', payload: { entryId: 'number' } },
          { name: 'InvoiceCreated', description: 'Quando um lançamento é criado', payload: { entryId: 'number' } },
        ],
        automations: [],
        aiTools: [
          {
            name: 'analyze_financial_health',
            description: 'Analisa a saúde financeira da empresa',
            parameters: { period: 'string', type: 'string' },
          },
        ],
        dashboard: { widgets: ['finance-summary', 'recent-transactions'], defaultLayout: 'grid' },
        permissions: [
          'finance.entries.view', 'finance.entries.create', 'finance.entries.edit', 'finance.entries.delete', 'finance.entries.export', 'finance.entries.import', 'finance.entries.approve',
          'finance.categories.view', 'finance.categories.create', 'finance.categories.edit', 'finance.categories.delete', 'finance.categories.manage',
        ],
      },
      {
        id: 'crm',
        slug: 'crm',
        name: 'CRM',
        description: 'Gestão de relacionamento com clientes',
        icon: 'users',
        category: 'business',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: ['core', 'auth'],
        routes: [],
        menus: [{ id: 'crm', label: 'CRM', icon: 'users', path: '/crm', order: 1 }],
        widgets: [],
        resources: [
          {
            slug: 'crm.clients',
            name: 'Clientes',
            tableName: 'clients',
            actions: ['view', 'create', 'edit', 'delete', 'export', 'import'],
          },
          {
            slug: 'crm.contacts',
            name: 'Contatos',
            tableName: null,
            actions: ['view', 'create', 'edit', 'delete'],
          },
          {
            slug: 'crm.leads',
            name: 'Leads',
            tableName: null,
            actions: ['view', 'create', 'edit', 'delete', 'convert'],
          },
        ],
        actions: [
          { slug: 'view', name: 'Visualizar' },
          { slug: 'create', name: 'Criar' },
          { slug: 'edit', name: 'Editar' },
          { slug: 'delete', name: 'Excluir' },
          { slug: 'export', name: 'Exportar' },
          { slug: 'import', name: 'Importar' },
          { slug: 'convert', name: 'Converter' },
          { slug: 'manage', name: 'Gerenciar' },
        ],
        events: [
          { name: 'LeadCreated', description: 'Quando um lead é criado', payload: { clientId: 'number' } },
          { name: 'LeadConverted', description: 'Quando um lead é convertido', payload: { clientId: 'number' } },
        ],
        automations: [],
        aiTools: [
          {
            name: 'analyze_client_behavior',
            description: 'Analisa comportamento e histórico do cliente',
            parameters: { clientId: 'number' },
          },
        ],
        dashboard: { widgets: ['crm-funnel', 'recent-clients'], defaultLayout: 'grid' },
        permissions: [
          'crm.clients.view', 'crm.clients.create', 'crm.clients.edit', 'crm.clients.delete', 'crm.clients.export', 'crm.clients.import',
          'crm.contacts.view', 'crm.contacts.create', 'crm.contacts.edit', 'crm.contacts.delete',
          'crm.leads.view', 'crm.leads.create', 'crm.leads.edit', 'crm.leads.delete', 'crm.leads.convert',
        ],
      },
      {
        id: 'projects',
        slug: 'projects',
        name: 'Projetos',
        description: 'Gestão de projetos e tarefas',
        icon: 'folder-open',
        category: 'business',
        version: '1.0.0',
        status: 'active',
        isSystem: true,
        dependencies: ['core', 'auth'],
        routes: [],
        menus: [{ id: 'projetos', label: 'Projetos', icon: 'folder-open', path: '/projetos', order: 2 }],
        widgets: [],
        resources: [
          {
            slug: 'projects.projects',
            name: 'Projetos',
            tableName: 'projects',
            actions: ['view', 'create', 'edit', 'delete', 'archive', 'export'],
          },
          {
            slug: 'projects.tasks',
            name: 'Tarefas',
            tableName: 'tasks',
            actions: ['view', 'create', 'edit', 'delete', 'assign', 'comment', 'export'],
          },
          {
            slug: 'projects.sprints',
            name: 'Sprints',
            tableName: 'sprints',
            actions: ['view', 'create', 'edit', 'delete', 'manage'],
          },
        ],
        actions: [
          { slug: 'view', name: 'Visualizar' },
          { slug: 'create', name: 'Criar' },
          { slug: 'edit', name: 'Editar' },
          { slug: 'delete', name: 'Excluir' },
          { slug: 'archive', name: 'Arquivar' },
          { slug: 'export', name: 'Exportar' },
          { slug: 'assign', name: 'Atribuir' },
          { slug: 'comment', name: 'Comentar' },
          { slug: 'manage', name: 'Gerenciar' },
        ],
        events: [
          { name: 'ProjectCreated', description: 'Quando um projeto é criado', payload: { projectId: 'number' } },
          { name: 'TaskCompleted', description: 'Quando uma tarefa é concluída', payload: { taskId: 'number' } },
        ],
        automations: [],
        aiTools: [
          {
            name: 'analyze_project_health',
            description: 'Analisa a saúde e progresso do projeto',
            parameters: { projectId: 'number' },
          },
        ],
        dashboard: { widgets: ['project-progress', 'task-board'], defaultLayout: 'grid' },
        permissions: [
          'projects.projects.view', 'projects.projects.create', 'projects.projects.edit', 'projects.projects.delete', 'projects.projects.archive', 'projects.projects.export',
          'projects.tasks.view', 'projects.tasks.create', 'projects.tasks.edit', 'projects.tasks.delete', 'projects.tasks.assign', 'projects.tasks.comment', 'projects.tasks.export',
          'projects.sprints.view', 'projects.sprints.create', 'projects.sprints.edit', 'projects.sprints.delete', 'projects.sprints.manage',
        ],
      },
    ];

    for (const moduleManifest of builtinModules) {
      const existing = await db
        .select()
        .from(modules)
        .where(
          and(
            eq(modules.slug, moduleManifest.slug),
            eq(modules.tenantId, tenantId)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        await this.registerModule(moduleManifest, tenantId);
      }
    }
  }

  // -------------------------------------------------------------------------
  // MODULE LIFECYCLE
  // -------------------------------------------------------------------------

  async enableModule(slug: string, tenantId: string, workspaceId?: number): Promise<void> {
    const [module] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.slug, slug), eq(modules.tenantId, tenantId)))
      .limit(1);

    if (!module) throw new Error('Module not found');

    await db.update(modules).set({ status: 'active', updatedAt: new Date() }).where(eq(modules.id, module.id));

    // Enable feature flag
    await db.insert(featureFlags).values({
      key: `${slug}_module_enabled`,
      name: `${module.name} habilitado`,
      description: `Habilita o módulo ${module.name}`,
      isEnabled: true,
      scope: 'workspace',
      workspaceId: workspaceId || 0,
      tenantId,
      metadata: { moduleSlug: slug },
    }).onConflictDoUpdate({
      target: [featureFlags.key, featureFlags.workspaceId],
      set: { isEnabled: true, updatedAt: new Date() },
    });

    this.moduleCache.delete(`${tenantId}:${slug}`);
  }

  async disableModule(slug: string, tenantId: string, workspaceId?: number): Promise<void> {
    const [module] = await db
      .select()
      .from(modules)
      .where(and(eq(modules.slug, slug), eq(modules.tenantId, tenantId)))
      .limit(1);

    if (!module) throw new Error('Module not found');

    await db.update(modules).set({ status: 'inactive', updatedAt: new Date() }).where(eq(modules.id, module.id));

    // Disable feature flag
    await db.insert(featureFlags).values({
      key: `${slug}_module_enabled`,
      name: `${module.name} habilitado`,
      description: `Habilita o módulo ${module.name}`,
      isEnabled: false,
      scope: 'workspace',
      workspaceId: workspaceId || 0,
      tenantId,
      metadata: { moduleSlug: slug },
    }).onConflictDoUpdate({
      target: [featureFlags.key, featureFlags.workspaceId],
      set: { isEnabled: false, updatedAt: new Date() },
    });

    this.moduleCache.delete(`${tenantId}:${slug}`);
  }

  // -------------------------------------------------------------------------
  // DASHBOARD WIDGETS
  // -------------------------------------------------------------------------

  async getDashboardWidgets(tenantId: string, workspaceId: number): Promise<any[]> {
    const activeModules = await this.getActiveModules(tenantId);
    const widgets: any[] = [];

    for (const module of activeModules) {
      if (module.manifest?.dashboard?.widgets) {
        for (const widgetId of module.manifest.dashboard.widgets) {
          widgets.push({
            id: `${module.slug}-${widgetId}`,
            module: module.slug,
            widgetId,
            title: widgetId,
            size: 'medium',
          });
        }
      }
    }

    return widgets.sort((a, b) => a.module.localeCompare(b.module));
  }

  // -------------------------------------------------------------------------
  // CLEAR CACHE
  // -------------------------------------------------------------------------

  clearCache(): void {
    this.moduleCache.clear();
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

export const moduleRegistry = new ModuleRegistry();
