import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { requireAuth, AuthRequest } from "./src/middleware/auth";
import { getOrCreateUser, getUserSaaSState, updateUserActiveWorkspace, getUserWorkspaces } from "./src/db/queries";
import apiRouter from "./src/db/api";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Cyzor Control SaaS API" });
  });

  // API Route: Synchronize signed-in user inside Postgres
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

  // API Route: Gemini AI
  app.post("/api/gemini", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { "User-Agent": "aistudio-build" } },
      });
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Error in /api/gemini route:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Mount modular routes that require an active workspace
  app.use("/api", apiRouter);

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
