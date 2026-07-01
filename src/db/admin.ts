import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { db } from "./index.ts";
import { tenants, users, companies, products, projects, userTenants, financeEntries, tasks, ideas, workspaces } from "./schema.ts";
import { eq, sql, desc, count } from "drizzle-orm";

export const adminRouter = Router();

// Middleware to ensure user is platform admin
export const requirePlatformAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const [userRecord] = await db.select().from(users).where(eq(users.uid, req.user.uid)).limit(1);
    if (!userRecord || !userRecord.isPlatformAdmin) {
      return res.status(403).json({ error: "Forbidden: Platform Admin only" });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

adminRouter.use(requireAuth);
adminRouter.use(requirePlatformAdmin as any);

// --- METRICS ---
adminRouter.get("/metrics", async (req: AuthRequest, res) => {
  try {
    const [tenantsCount] = await db.select({ value: count() }).from(tenants);
    const [usersCount] = await db.select({ value: count() }).from(users);
    const [companiesCount] = await db.select({ value: count() }).from(companies);
    const [projectsCount] = await db.select({ value: count() }).from(projects);
    const [productsCount] = await db.select({ value: count() }).from(products);
    const [tasksCount] = await db.select({ value: count() }).from(tasks);
    const [ideasCount] = await db.select({ value: count() }).from(ideas);

    // Sum of amount for RECEITA
    const revenueResult = await db.select({
      sum: sql<string>`sum(amount)`
    }).from(financeEntries).where(eq(financeEntries.type, 'RECEITA'));
    const totalRevenue = parseFloat(revenueResult[0]?.sum || '0');

    // Sum of amount for DESPESA
    const expenseResult = await db.select({
      sum: sql<string>`sum(amount)`
    }).from(financeEntries).where(eq(financeEntries.type, 'DESPESA'));
    const totalExpense = parseFloat(expenseResult[0]?.sum || '0');

    // Grouped monthly revenue & expense trends
    const monthlyTrends = await db.select({
      month: sql<string>`to_char(${financeEntries.date}, 'YYYY-MM')`,
      revenue: sql<string>`coalesce(sum(case when ${financeEntries.type} = 'RECEITA' then ${financeEntries.amount} else 0 end), 0)`,
      expense: sql<string>`coalesce(sum(case when ${financeEntries.type} = 'DESPESA' then ${financeEntries.amount} else 0 end), 0)`,
    })
    .from(financeEntries)
    .groupBy(sql`to_char(${financeEntries.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${financeEntries.date}, 'YYYY-MM')`);

    // Map trends to UI chart format
    const formattedTrends = monthlyTrends.map((t) => ({
      month: t.month,
      revenue: parseFloat(t.revenue || '0'),
      expense: parseFloat(t.expense || '0'),
    }));

    res.json({
      status: "success",
      metrics: {
        totalTenants: tenantsCount.value,
        totalUsers: usersCount.value,
        totalCompanies: companiesCount.value,
        totalProjects: projectsCount.value,
        totalProducts: productsCount.value,
        totalTasks: tasksCount.value,
        totalIdeas: ideasCount.value,
        totalRevenue,
        totalExpense,
        trends: formattedTrends
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- TENANTS ---
adminRouter.get("/tenants", async (req: AuthRequest, res) => {
  try {
    const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
    res.json(allTenants);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/tenants/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, slug, plan, status } = req.body;
    const updated = await db.update(tenants)
      .set({
        name,
        slug,
        plan,
        status,
        updatedAt: new Date()
      })
      .where(eq(tenants.id, id))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/tenants/:id", async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    await db.delete(tenants).where(eq(tenants.id, id));
    res.json({ success: true, message: "Tenant deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- USERS ---
adminRouter.get("/users", async (req: AuthRequest, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/users/:uid", async (req: AuthRequest, res) => {
  try {
    const { uid } = req.params;
    const { displayName, email, role, isPlatformAdmin, currentPlan } = req.body;
    const updated = await db.update(users)
      .set({
        displayName: displayName || null,
        email,
        role: role || null,
        isPlatformAdmin: isPlatformAdmin !== undefined ? isPlatformAdmin : false,
        currentPlan: currentPlan || 'Pro',
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/users/:uid", async (req: AuthRequest, res) => {
  try {
    const { uid } = req.params;
    await db.delete(users).where(eq(users.uid, uid));
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- COMPANIES (Client Companies) ---
adminRouter.get("/companies", async (req: AuthRequest, res) => {
  try {
    const allCompanies = await db.select({
      id: companies.id,
      name: companies.name,
      cnpj: companies.cnpj,
      industry: companies.industry,
      size: companies.size,
      website: companies.website,
      status: companies.status,
      createdAt: companies.createdAt,
      workspaceId: companies.workspaceId,
      workspaceName: workspaces.name,
      tenantId: companies.tenantId,
      tenantName: tenants.name,
    })
    .from(companies)
    .leftJoin(workspaces, eq(companies.workspaceId, workspaces.id))
    .leftJoin(tenants, eq(companies.tenantId, tenants.id))
    .orderBy(desc(companies.createdAt));

    res.json(allCompanies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.post("/companies", async (req: AuthRequest, res) => {
  try {
    const { name, cnpj, industry, size, website, status, workspaceId } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    // Default to the first workspace if not provided
    let targetWorkspaceId = workspaceId;
    let targetTenantId = null;

    if (!targetWorkspaceId) {
      const [firstWorkspace] = await db.select().from(workspaces).limit(1);
      if (!firstWorkspace) {
        return res.status(400).json({ error: "No workspaces exist to associate this company with." });
      }
      targetWorkspaceId = firstWorkspace.id;
      targetTenantId = firstWorkspace.tenantId;
    } else {
      const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, targetWorkspaceId)).limit(1);
      if (ws) {
        targetTenantId = ws.tenantId;
      }
    }

    const newCompany = await db.insert(companies).values({
      name,
      cnpj: cnpj || null,
      industry: industry || null,
      size: size || null,
      website: website || null,
      status: status || 'Ativo',
      workspaceId: targetWorkspaceId,
      tenantId: targetTenantId,
    }).returning();

    res.json(newCompany[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.put("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, cnpj, industry, size, website, status } = req.body;
    const updated = await db.update(companies)
      .set({
        name,
        cnpj: cnpj || null,
        industry: industry || null,
        size: size || null,
        website: website || null,
        status: status || 'Ativo',
        updatedAt: new Date()
      })
      .where(eq(companies.id, id))
      .returning();
    res.json(updated[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.delete("/companies/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(companies).where(eq(companies.id, id));
    res.json({ success: true, message: "Company deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- FINANCE (All) ---
adminRouter.get("/finance", async (req: AuthRequest, res) => {
  try {
    const allFinance = await db.select().from(financeEntries).orderBy(desc(financeEntries.createdAt));
    res.json(allFinance);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
