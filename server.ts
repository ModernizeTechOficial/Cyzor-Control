import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { requireAuth, AuthRequest } from "./src/middleware/auth";
import { getOrCreateUser, getUserSaaSState, updateUserActiveWorkspace, getUserWorkspaces } from "./src/db/queries";
import apiRouter from "./src/db/api";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(helmet({ contentSecurityPolicy: false })); // Disabled CSP for React DEV
  app.use(cors());
  app.use(cookieParser());
  
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: "Too many requests, please try again later."
  });
  app.use("/api/", limiter);

  // Middleware to parse JSON bodies
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Route: Healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Cyzor Control SaaS API" });
  });

  // Local JWT Auth Router
  const authRouter = (await import("./src/api/auth")).default;
  app.use("/api/auth/v2", authRouter);

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

  // API Route: AI Generation
  app.post("/api/gemini", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { prompt } = req.body;
      if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
      }
      
      const { getAIProvider } = await import("./src/ai/AIProvider");
      const aiProvider = getAIProvider();

      const response = await aiProvider.chat([{ role: "user", content: prompt }]);
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
