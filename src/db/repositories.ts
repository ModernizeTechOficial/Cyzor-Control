import { db } from './index.ts';
import { getTenantContext } from './context.ts';
import * as schema from './schema.ts';
import { eq, and, desc, sql } from 'drizzle-orm';

// --- AUDIT LOG UTILITY ---

export const auditLogRepository = {
  async log(params: {
    action: 'CREATE' | 'UPDATE' | 'DELETE' | string;
    table: string;
    recordId: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
  }) {
    try {
      const context = getTenantContext();
      await db.insert(schema.auditLogs).values({
        tenantId: context.tenantId,
        userId: context.userId,
        action: params.action,
        tableName: params.table,
        recordId: params.recordId,
        oldValues: params.oldValues || null,
        newValues: params.newValues || null,
        ipAddress: params.ipAddress || null,
      });
    } catch (err: any) {
      console.warn(`[AuditLog Warning] Failed to save audit log: ${err.message}`);
    }
  },

  async findAll() {
    const context = getTenantContext();
    return db.select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.tenantId, context.tenantId))
      .orderBy(desc(schema.auditLogs.createdAt));
  }
};

// --- BASE REPOSITORY FACTORY ---
// Generates standard multi-tenant scoped CRUD methods for any given pgTable

function createRepository(
  table: any,
  tableName: string
) {
  return {
    async findAll() {
      const context = getTenantContext();
      return db.select().from(table).where(eq((table as any).tenantId, context.tenantId));
    },

    async findById(id: number) {
      const context = getTenantContext();
      const [result] = await db.select()
        .from(table)
        .where(
          and(
            eq((table as any).id, id),
            eq((table as any).tenantId, context.tenantId)
          )
        )
        .limit(1);
      return result || null;
    },

    async create(data: any) {
      const context = getTenantContext();
      const payload = {
        ...data,
        tenantId: context.tenantId,
      };

      const [inserted] = (await db.insert(table).values(payload).returning()) as any[];

      await auditLogRepository.log({
        action: 'CREATE',
        table: tableName,
        recordId: String((inserted as any).id),
        newValues: inserted,
      });

      return inserted;
    },

    async update(id: number, data: any) {
      const context = getTenantContext();
      
      // Load old record first for audit log and tenant isolation validation
      const oldRecord = await this.findById(id);
      if (!oldRecord) {
        throw new Error(`Record not found or access denied in ${tableName}`);
      }

      const payload = {
        ...data,
        updatedAt: new Date(),
      };
      // Explicitly delete any tenantId payload manipulation attempts to preserve isolation
      delete (payload as any).tenantId;

      const [updated] = (await db.update(table)
        .set(payload)
        .where(
          and(
            eq((table as any).id, id),
            eq((table as any).tenantId, context.tenantId)
          )
        )
        .returning()) as any[];

      await auditLogRepository.log({
        action: 'UPDATE',
        table: tableName,
        recordId: String(id),
        oldValues: oldRecord,
        newValues: updated,
      });

      return updated;
    },

    async delete(id: number) {
      const context = getTenantContext();

      // Validate tenant owns this record first
      const oldRecord = await this.findById(id);
      if (!oldRecord) {
        throw new Error(`Record not found or access denied in ${tableName}`);
      }

      await db.delete(table)
        .where(
          and(
            eq((table as any).id, id),
            eq((table as any).tenantId, context.tenantId)
          )
        );

      await auditLogRepository.log({
        action: 'DELETE',
        table: tableName,
        recordId: String(id),
        oldValues: oldRecord,
      });

      return true;
    },

    async count() {
      const context = getTenantContext();
      const [result] = await db.select({ count: sql<number>`count(*)` })
        .from(table)
        .where(eq((table as any).tenantId, context.tenantId));
      return result?.count || 0;
    }
  };
}

// --- CONCRETE REPOSITORIES ---

export const tenantRepository = {
  async findById(id: string) {
    const [result] = await db.select().from(schema.tenants).where(eq(schema.tenants.id, id)).limit(1);
    return result || null;
  },

  async findBySlug(slug: string) {
    const [result] = await db.select().from(schema.tenants).where(eq(schema.tenants.slug, slug)).limit(1);
    return result || null;
  },

  async create(data: { name: string; slug: string; plan?: string }) {
    const [result] = await db.insert(schema.tenants).values({
      name: data.name,
      slug: data.slug,
      plan: data.plan || 'Free',
    }).returning();
    return result;
  },

  async update(id: string, data: Partial<typeof schema.tenants.$inferInsert>) {
    const [result] = await db.update(schema.tenants)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schema.tenants.id, id))
      .returning();
    return result;
  },

  async registerUserToTenant(userId: string, tenantId: string, role = 'MEMBER', isOwner = false) {
    const [result] = await db.insert(schema.userTenants).values({
      userId,
      tenantId,
      role,
      isOwner,
    }).returning();
    return result;
  },

  async findUserTenants(userId: string) {
    return db.select()
      .from(schema.userTenants)
      .innerJoin(schema.tenants, eq(schema.userTenants.tenantId, schema.tenants.id))
      .where(eq(schema.userTenants.userId, userId));
  },

  async isUserInTenant(userId: string, tenantId: string) {
    const [membership] = await db.select()
      .from(schema.userTenants)
      .where(
        and(
          eq(schema.userTenants.userId, userId),
          eq(schema.userTenants.tenantId, tenantId)
        )
      )
      .limit(1);
    return !!membership;
  }
};

export const companyRepository = {
  ...createRepository(schema.companies, 'companies'),
  async findByCnpj(cnpj: string) {
    const context = getTenantContext();
    const [result] = await db.select()
      .from(schema.companies)
      .where(and(eq(schema.companies.cnpj, cnpj), eq(schema.companies.tenantId, context.tenantId)))
      .limit(1);
    return result || null;
  }
};

export const clientRepository = {
  ...createRepository(schema.clients, 'clients'),
  async findByEmail(email: string) {
    const context = getTenantContext();
    const [result] = await db.select()
      .from(schema.clients)
      .where(and(eq(schema.clients.email, email), eq(schema.clients.tenantId, context.tenantId)))
      .limit(1);
    return result || null;
  }
};

export const productRepository = createRepository(schema.products, 'products');

export const projectRepository = {
  ...createRepository(schema.projects, 'projects'),
  async findWithProgress() {
    const context = getTenantContext();
    return db.select()
      .from(schema.projects)
      .where(eq(schema.projects.tenantId, context.tenantId))
      .orderBy(desc(schema.projects.createdAt));
  }
};

export const sprintRepository = {
  ...createRepository(schema.sprints, 'sprints'),
  async findByProjectId(projectId: number) {
    const context = getTenantContext();
    return db.select()
      .from(schema.sprints)
      .where(
        and(
          eq(schema.sprints.projectId, projectId),
          eq(schema.sprints.tenantId, context.tenantId)
        )
      );
  }
};

export const taskRepository = {
  ...createRepository(schema.tasks, 'tasks'),
  async findByProjectId(projectId: number) {
    const context = getTenantContext();
    return db.select()
      .from(schema.tasks)
      .where(
        and(
          eq(schema.tasks.projectId, projectId),
          eq(schema.tasks.tenantId, context.tenantId)
        )
      );
  },

  async findBySprintId(sprintId: number) {
    const context = getTenantContext();
    return db.select()
      .from(schema.tasks)
      .where(
        and(
          eq(schema.tasks.sprintId, sprintId),
          eq(schema.tasks.tenantId, context.tenantId)
        )
      );
  }
};

export const ideaRepository = createRepository(schema.ideas, 'ideas');
export const documentRepository = createRepository(schema.documents, 'documents');
export const noteRepository = createRepository(schema.notes, 'notes');
export const flowRepository = createRepository(schema.flows, 'flow_builder_flows');
export const aiMemoryRepository = createRepository(schema.aiMemories, 'ai_memories');
export const aiProviderRepository = createRepository(schema.aiProviders, 'ai_providers');

export const financeRepository = {
  ...createRepository(schema.financeEntries, 'finance_entries'),
  async getSummary() {
    const context = getTenantContext();
    const entries = await this.findAll();
    
    let totalIncome = 0;
    let totalExpense = 0;
    
    for (const entry of entries) {
      const val = parseFloat(entry.amount || '0');
      if (entry.type === 'RECEITA') {
        totalIncome += val;
      } else if (entry.type === 'DESPESA') {
        totalExpense += val;
      }
    }
    
    return {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      entriesCount: entries.length,
    };
  }
};

export const notificationRepository = {
  ...createRepository(schema.notifications, 'notifications'),
  async markAllAsRead() {
    const context = getTenantContext();
    return db.update(schema.notifications)
      .set({ isRead: true })
      .where(eq(schema.notifications.tenantId, context.tenantId))
      .returning();
  }
};

export const agendaRepository = {
  ...createRepository(schema.agendaEvents, 'agenda_events'),
  async findByDate(dateStr: string) {
    const context = getTenantContext();
    return db.select()
      .from(schema.agendaEvents)
      .where(
        and(
          eq(schema.agendaEvents.date, dateStr),
          eq(schema.agendaEvents.tenantId, context.tenantId)
        )
      );
  }
};

export const deployRepository = createRepository(schema.deploys, 'deploys');
export const milestoneRepository = createRepository(schema.milestones, 'milestones');
