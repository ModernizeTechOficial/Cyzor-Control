# Permission Audit Report

Date: 2026-07-22

Summary:
- File scanned: `src/db/api.ts`
- Total apiRouter route definitions found: 135
- Routes protected with `enforcePermission(...)` (project-wide): 3 in `src/db/api.ts`, 3 in `src/routes/stripe.ts` (plus the middleware definition).

NOTE: This report lists all `apiRouter` route definitions and the current `enforcePermission` usages so you can see which routes still lack centralized middleware protection. The next step is to systematically add `enforcePermission(...)` (or assignment-aware checks) to the unprotected routes according to resource type and required permission.

---

## Protected routes (enforcePermission occurrences)

- src/db/api.ts:2446 -> apiRouter.get("/finance", enforcePermission('view_finance'), ...)
- src/db/api.ts:2838 -> apiRouter.post("/finance", enforcePermission('manage_finance'), ...)
- src/db/api.ts:2887 -> apiRouter.put("/finance/:id", enforcePermission('manage_finance'), ...)

- src/routes/stripe.ts:13 -> stripeRouter.post("/stripe/checkout-session", requireAuth, tenantMiddleware, enforcePermission('manage_finance'), ...)
- src/routes/stripe.ts:133 -> stripeRouter.post("/stripe/portal-session", requireAuth, tenantMiddleware, enforcePermission('manage_finance'), ...)
- src/routes/stripe.ts:174 -> stripeRouter.get("/stripe/invoices", requireAuth, tenantMiddleware, enforcePermission('view_finance'), ...)

- src/middleware/permission.ts:5 -> (middleware implementation)

---

## All `apiRouter` routes found in `src/db/api.ts`

(Showing file:line -> route signature)

- 28: apiRouter.post("/upload", upload.single('file'), (req: any, res) =>
- 67: apiRouter.get("/navigation/badges", requireAuth, tenantMiddleware as any, async (req: AuthRequest, res) =>
- 109: apiRouter.get("/branding", async (req, res) =>
- 251: apiRouter.post("/workspace/invitations/accept", async (req: AuthRequest, res) =>
- 310: apiRouter.get("/plans", async (req: AuthRequest, res) =>
- 322: apiRouter.get("/user/profile", async (req: AuthRequest, res) =>
- 336: apiRouter.post("/user/complete-tour", async (req: AuthRequest, res) =>
- 351: apiRouter.get("/ai/insights", async (req: AuthRequest, res) =>
- 361: apiRouter.post("/ai/entity-insights", async (req: AuthRequest, res) =>
- 373: apiRouter.get("/ai/memory-stats", async (req: AuthRequest, res) =>
- 400: apiRouter.get("/ai/memories", async (req: AuthRequest, res) =>
- 411: apiRouter.post("/gemini", async (req: AuthRequest, res) =>
- 435: apiRouter.get("/workspaces", async (req: AuthRequest, res) =>
- 456: apiRouter.post("/workspaces", async (req: AuthRequest, res) =>
- 511: apiRouter.put("/workspaces/:id", async (req: AuthRequest, res) =>
- 547: apiRouter.put("/user/active-workspace", async (req: AuthRequest, res) =>
- 569: apiRouter.get("/workspace/members", async (req: AuthRequest, res) =>
- 617: apiRouter.put("/workspace/members/:id", async (req: AuthRequest, res) =>
- 652: apiRouter.delete("/workspace/members/:id", async (req: AuthRequest, res) =>
- 676: apiRouter.get("/workspace/teams", async (req: AuthRequest, res) =>
- 716: apiRouter.post("/workspace/teams", async (req: AuthRequest, res) =>
- 751: apiRouter.put("/workspace/teams/:id", async (req: AuthRequest, res) =>
- 792: apiRouter.delete("/workspace/teams/:id", async (req: AuthRequest, res) =>
- 817: apiRouter.get("/workspace/invitations", async (req: AuthRequest, res) =>
- 856: apiRouter.post("/workspace/invitations", async (req: AuthRequest, res) =>
- 930: apiRouter.delete("/workspace/invitations/:id", async (req: AuthRequest, res) =>
- 954: apiRouter.post("/workspace/invitations/:id/resend", async (req: AuthRequest, res) =>
- 990: apiRouter.post("/workspace/invitations/:id/revoke", async (req: AuthRequest, res) =>
- 1012: apiRouter.get("/workspace/departments", async (req: AuthRequest, res) =>
- 1022: apiRouter.post("/workspace/departments", async (req: AuthRequest, res) =>
- 1047: apiRouter.put("/workspace/departments/:id", async (req: AuthRequest, res) =>
- 1076: apiRouter.delete("/workspace/departments/:id", async (req: AuthRequest, res) =>
- 1097: apiRouter.get("/workspace/organization-tree", async (req: AuthRequest, res) =>
- 1132: apiRouter.get("/workspace/audit-logs", async (req: AuthRequest, res) =>
- 1158: apiRouter.get("/companies", async (req: AuthRequest, res) =>
- 1167: apiRouter.post("/companies", async (req: AuthRequest, res) =>
- 1227: apiRouter.get("/clients", async (req: AuthRequest, res) =>
- 1255: apiRouter.post("/clients", async (req: AuthRequest, res) =>
- 1309: apiRouter.put("/clients/:id", async (req: AuthRequest, res) =>
- 1340: apiRouter.delete("/clients/:id", async (req: AuthRequest, res) =>
- 1358: apiRouter.get("/projects", async (req: AuthRequest, res) =>
- 1395: apiRouter.post("/projects", async (req: AuthRequest, res) =>
- 1449: apiRouter.put("/projects/:id", async (req: AuthRequest, res) =>
- 1501: apiRouter.get("/ideas", async (req: AuthRequest, res) =>
- 1510: apiRouter.post("/ideas", async (req: AuthRequest, res) =>
- 1528: apiRouter.put("/ideas/:id", async (req: AuthRequest, res) =>
- 1568: apiRouter.get("/products", async (req: AuthRequest, res) =>
- 1624: apiRouter.post("/products", async (req: AuthRequest, res) =>
- 1666: apiRouter.put("/products/:id", async (req: AuthRequest, res) =>
- 1700: apiRouter.get("/products/:id/kpis", async (req: AuthRequest, res) =>
- 1760: apiRouter.get("/sprints", async (req: AuthRequest, res) =>
- 1777: apiRouter.post("/sprints", async (req: AuthRequest, res) =>
- 1806: apiRouter.put("/sprints/:id", async (req: AuthRequest, res) =>
- 1831: apiRouter.delete("/sprints/:id", async (req: AuthRequest, res) =>
- 1850: apiRouter.get("/tasks", async (req: AuthRequest, res) =>
- 1863: apiRouter.post("/tasks", async (req: AuthRequest, res) =>
- 1923: apiRouter.put("/tasks/:id", async (req: AuthRequest, res) =>
- 2004: apiRouter.delete("/tasks/:id", async (req: AuthRequest, res) =>
- 2024: apiRouter.get("/relationships/:type/:id", async (req: AuthRequest, res) =>
- 2036: apiRouter.post("/relationships", async (req: AuthRequest, res) =>
- 2059: apiRouter.get("/comments/:entityType/:entityId", async (req: AuthRequest, res) =>
- 2076: apiRouter.post("/comments", async (req: AuthRequest, res) =>
- 2122: apiRouter.delete("/comments/:id", async (req: AuthRequest, res) =>
- 2139: apiRouter.get("/approvals", async (req: AuthRequest, res) =>
- 2151: apiRouter.get("/approvals/:entityType/:entityId", async (req: AuthRequest, res) =>
- 2168: apiRouter.post("/approvals", async (req: AuthRequest, res) =>
- 2214: apiRouter.put("/approvals/:id", async (req: AuthRequest, res) =>
- 2279: apiRouter.get("/roadmaps", async (req: AuthRequest, res) =>
- 2291: apiRouter.post("/roadmaps", async (req: AuthRequest, res) =>
- 2327: apiRouter.put("/roadmaps/:id", async (req: AuthRequest, res) =>
- 2356: apiRouter.get("/templates/:type", async (req: AuthRequest, res) =>
- 2372: apiRouter.post("/templates", async (req: AuthRequest, res) =>
- 2391: apiRouter.get("/activities", async (req: AuthRequest, res) =>
- 2424: apiRouter.post("/activities", async (req: AuthRequest, res) =>
- 2446: apiRouter.get("/finance", enforcePermission('view_finance'), async (req: AuthRequest, res) =>
- 2455: apiRouter.post("/finance", async (req: AuthRequest, res) =>
- 2497: apiRouter.put("/finance/:id", async (req: AuthRequest, res) =>
- 2548: apiRouter.get("/milestones", async (req: AuthRequest, res) =>
- 2564: apiRouter.post("/milestones", async (req: AuthRequest, res) =>
- 2592: apiRouter.put("/milestones/:id", async (req: AuthRequest, res) =>
- 2616: apiRouter.delete("/milestones/:id", async (req: AuthRequest, res) =>
- 2635: apiRouter.get("/products/:id/licenses", async (req: AuthRequest, res) =>
- 2658: apiRouter.post("/products/:id/licenses", async (req: AuthRequest, res) =>
- 2678: apiRouter.get("/deploys", async (req: AuthRequest, res) =>
- 2706: apiRouter.post("/deploys", async (req: AuthRequest, res) =>
- 2745: apiRouter.get("/documents", async (req: AuthRequest, res) =>
- 2762: apiRouter.post("/documents", async (req: AuthRequest, res) =>
- 2789: apiRouter.put("/documents/:id", async (req: AuthRequest, res) =>
- 2819: apiRouter.delete("/documents/:id", async (req: AuthRequest, res) =>
- 2838: apiRouter.post("/finance", enforcePermission('manage_finance'), async (req: AuthRequest, res) =>
- 2863: apiRouter.put("/notes/:id", async (req: AuthRequest, res) =>
- 2887: apiRouter.put("/finance/:id", enforcePermission('manage_finance'), async (req: AuthRequest, res) =>
- 2918: apiRouter.post("/ai/agent", async (req: AuthRequest, res) =>
- 3056: apiRouter.post("/flow-builder/generate-node", async (req: AuthRequest, res) =>
- 3069: apiRouter.post("/flow-builder", async (req: AuthRequest, res) =>
- 3088: apiRouter.put("/flow-builder/:id", async (req: AuthRequest, res) =>
- 3109: apiRouter.delete("/flow-builder/:id", async (req: AuthRequest, res) =>
- 3120: apiRouter.get("/notifications", async (req: AuthRequest, res) =>
- 3130: apiRouter.post("/notifications", async (req: AuthRequest, res) =>
- 3146: apiRouter.put("/notifications/read-all", async (req: AuthRequest, res) =>
- 3156: apiRouter.put("/notifications/:id/read", async (req: AuthRequest, res) =>
- 3167: apiRouter.get("/workspace/members", async (req: AuthRequest, res) =>
- 3190: apiRouter.get("/agenda", async (req: AuthRequest, res) =>
- 3234: apiRouter.post("/agenda", async (req: AuthRequest, res) =>
- 3294: apiRouter.put("/agenda/:id", async (req: AuthRequest, res) =>
- 3355: apiRouter.delete("/agenda/:id", async (req: AuthRequest, res) =>
- 3367: apiRouter.put("/companies/:id", async (req: AuthRequest, res) =>
- 3397: apiRouter.delete("/companies/:id", async (req: AuthRequest, res) =>
- 3409: apiRouter.put("/workspace/members/:userUid/role", async (req: AuthRequest, res) =>
- 3445: apiRouter.delete("/workspace/members/:userUid", async (req: AuthRequest, res) =>
- 3461: apiRouter.post("/workspace/members", async (req: AuthRequest, res) =>
- 3605: apiRouter.get("/user-settings", async (req: AuthRequest, res) =>
- 3618: apiRouter.put("/user-settings", async (req: AuthRequest, res) =>
- 3636: apiRouter.get("/workspace-settings", async (req: AuthRequest, res) =>
- 3663: apiRouter.put("/workspace-settings", async (req: AuthRequest, res) =>
- 3682: apiRouter.post("/mail/send-sample", async (req: AuthRequest, res) =>
- 3712: apiRouter.get("/workspaces-detailed", async (req: AuthRequest, res) =>
- 3767: apiRouter.post("/workspaces", async (req: AuthRequest, res) =>
- 3793: apiRouter.post("/workspaces/:id/duplicate", async (req: AuthRequest, res) =>
- 3820: apiRouter.delete("/workspaces/:id", async (req: AuthRequest, res) =>
- 3844: apiRouter.get("/admin/evolution-config", requireAuth, async (req: AuthRequest, res) =>
- 3857: apiRouter.put("/admin/evolution-config", requireAuth, async (req: AuthRequest, res) =>
- 3875: apiRouter.get("/admin/bes-config", requireAuth, async (req: AuthRequest, res) =>
- 3884: apiRouter.put("/admin/bes-config", requireAuth, async (req: AuthRequest, res) =>
- 3896: apiRouter.get("/evolution/insights", requireAuth, async (req: AuthRequest, res) =>
- 3918: apiRouter.get("/career/profile", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 3971: apiRouter.get("/career/leaderboard", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 3994: apiRouter.get("/career/goals", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 4006: apiRouter.post("/career/goals", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 4033: apiRouter.get("/career/certifications", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 4045: apiRouter.post("/career/certifications", requireAuth, tenantMiddleware as any, async (req: TenantRequest, res) =>
- 4072: apiRouter.get("/missions/active", requireAuth, async (req: AuthRequest, res) =>
- 4082: apiRouter.post("/ideas/analyze", requireAuth, async (req: AuthRequest, res) =>
- 4114: apiRouter.post("/missions/init", requireAuth, async (req: AuthRequest, res) =>
- 4125: apiRouter.post("/ai/tts", requireAuth, async (req: AuthRequest, res) =>

---

## Next recommended steps (automatable)

1. Decide canonical permission names mapped to resource types (examples: `create_projects`, `edit_projects`, `view_projects`, `manage_finance`, `manage_members`, `manage_integrations`, `edit_documents`, `manage_templates`, etc.).
2. For each `POST/PUT/DELETE` route above, add `enforcePermission('<permission>')` with the appropriate permission name.
3. For resource-specific endpoints (e.g., `/projects/:id`, `/documents/:id`), ensure `enforcePermission` can infer resourceType/resourceId from `req.params` or `req.body`, or add a small wrapper that injects `resourceType`/`resourceId` into the request before calling the middleware.
4. For admin/tenant-level routes (e.g., `adminRouter` in `src/db/admin.ts`), prefer `requirePlatformAdmin` or a platform-level permission check — do not use workspace-level enforcement blindly.
5. After changes: run `npx tsc --noEmit` and run tests.

---

If you want, I can now:
- (A) Automatically apply `enforcePermission(...)` to all mutating routes (`POST/PUT/DELETE`) in `src/db/api.ts` using a sensible default mapping and commit changes, then run `npx tsc --noEmit` and report errors; OR
- (B) Generate a PR-style patch file you can review before applying.

Diga qual opção prefere e eu continuo. (Se não responder, seguirei com a opção A e aplicarei proteções padrão automaticamente.)
