import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser, getUserSaaSState, updateUserActiveWorkspace, getUserWorkspaces } from "./src/db/queries.ts";
import apiRouter from "./src/db/api.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Debug logger for API requests
  app.use("/api", (req, res, next) => {
    console.log(`[API Request] ${req.method} ${req.url}`);
    next();
  });

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Cyzor Control SaaS API" });
  });

  // API Route: Extended Database Healthcheck
  app.get("/api/health/db", async (req, res) => {
    try {
      const fs = require('fs');
      const dbPath = process.env.DATABASE_PATH || 'database/database.sqlite';
      const fileExists = fs.existsSync(dbPath);
      let fileSizeInBytes = 0;
      if (fileExists) {
        fileSizeInBytes = fs.statSync(dbPath).size;
      }
      
      const { db } = require('./src/db/index.ts');
      const { sql } = require('drizzle-orm');
      
      const journalMode = await db.get(sql`PRAGMA journal_mode`);
      const foreignKeys = await db.get(sql`PRAGMA foreign_keys`);
      const integrityCheck = await db.get(sql`PRAGMA integrity_check`);

      res.json({
        status: "ok",
        database: "SQLite",
        file_exists: fileExists,
        size_bytes: fileSizeInBytes,
        journal_mode: journalMode ? Object.values(journalMode)[0] : "unknown",
        foreign_keys: foreignKeys ? Object.values(foreignKeys)[0] : "unknown",
        integrity_check: integrityCheck ? Object.values(integrityCheck)[0] : "unknown"
      });
    } catch (error: any) {
      res.status(500).json({
        status: "error",
        error: error.message
      });
    }
  });

  // API Route: Synchronize signed-in user inside SQLite
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid, email, name, picture } = req.user!;
      const userRecord = await getOrCreateUser(uid, email || "", name, picture);
      res.json({ status: "success", user: userRecord });
    } catch (error: any) {
      console.error("Error in /api/auth/sync route:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Fetch SaaS state (Plan & Active Workspace)
  app.get("/api/auth/state", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid } = req.user!;
      const state = await getUserSaaSState(uid);
      res.json({ status: "success", state });
    } catch (error: any) {
      console.error("Error in /api/auth/state GET route:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // API Route: Update SaaS state (Active Workspace)

  app.put("/api/auth/state", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid } = req.user!;
      const { activeWorkspaceId } = req.body;
      if (activeWorkspaceId) {
        await updateUserActiveWorkspace(uid, activeWorkspaceId);
      }
      const state = await getUserSaaSState(uid);
      res.json({ status: "success", state });
    } catch (error: any) {
      console.error("Error in /api/auth/state PUT route:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  app.get("/api/workspaces", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { uid } = req.user!;
      const workspaces = await getUserWorkspaces(uid);
      res.json({ status: "success", workspaces });
    } catch (error: any) {
      console.error("Error fetching workspaces:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Mount modular routes that require an active workspace
  app.use("/api", apiRouter);

  // AI Node Generation
  app.post("/api/flow-builder/generate-node", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt, context } = req.body;
      const { generateNodeDefinition } = await import("./src/lib/gemini.ts");
      const nodeDef = await generateNodeDefinition(prompt, context);
      res.json({ status: "success", node: nodeDef });
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Serve static/compiled frontend under Vite dev middleware or standard static server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SaaS Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
