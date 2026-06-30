import { Router, Request, Response, NextFunction } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { db } from "./index.ts";
import { tenants, users, companies, products, projects, userTenants, financeEntries } from "./schema.ts";
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
    
    res.json({
      status: "success",
      metrics: {
        totalTenants: tenantsCount.value,
        totalUsers: usersCount.value,
        totalCompanies: companiesCount.value,
        totalProjects: projectsCount.value,
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

// --- USERS ---
adminRouter.get("/users", async (req: AuthRequest, res) => {
  try {
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    res.json(allUsers);
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
