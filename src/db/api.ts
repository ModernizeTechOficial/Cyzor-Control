import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.ts";
import { db } from "./index.ts";
import { companies, products, projects, tasks, ideas, documents, financeEntries, sprints, milestones, aiMemories, notifications, agendaEvents, users, workspaceMembers, workspaces, flows, notes } from "./schema.ts";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { getUserSaaSState } from "./queries.ts";

const apiRouter = Router();

apiRouter.use((req, res, next) => {
  console.log(`[apiRouter Request] ${req.method} ${req.url}`);
  next();
});

// Helper to get active workspace ID
async function getActiveWorkspaceId(uid: string) {
  const state = await getUserSaaSState(uid);
  return state?.activeWorkspace?.id;
}

apiRouter.use(requireAuth);
apiRouter.use(async (req: AuthRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized: No user found in request" });
    }
    const wsId = await getActiveWorkspaceId(req.user.uid);
    if (!wsId) return res.status(403).json({ error: "No active workspace" });
    req.workspaceId = wsId;
    next();
  } catch (error) {
    console.error("Workspace resolution error:", error);
    res.status(500).json({ error: "Error resolving workspace" });
  }
});

import { processAIChat, generateProactiveInsights, getAIInstance } from './aiModel.ts';

// --- AI CHAT ---
apiRouter.post("/ai/chat", async (req: AuthRequest, res) => {
  try {
    const { prompt, history } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const text = await processAIChat(prompt, req.workspaceId!, history || []);
    res.json({ text });
  } catch (error: any) {
    console.error("Error in /api/ai/chat route:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

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
    const { name, cnpj, industry, size, website, status } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Company name is required" });
    }
    const data = await db.insert(companies).values({
      workspaceId: req.workspaceId!,
      name,
      cnpj: cnpj || null,
      industry: industry || null,
      size: size || null,
      website: website || null,
      status: status || 'Ativo'
    }).returning();
    res.json(data[0]);
  } catch (error) {
    console.error("Error creating company:", error);
    res.status(500).json({ error: "Failed to create company" });
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
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        companyName: companies.name
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
    const { name, priority, dueDate, companyId, productId, status, budget, owner } = req.body;
    
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
      owner: owner || 'Sem dono'
    }).returning();
    
    res.json(data[0]);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});
apiRouter.put("/projects/:id", async (req: AuthRequest, res) => {
  const { name, description, status, priority, dueDate, team, history, comments, criteria, velocity, progress, budget, companyId, owner } = req.body;
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
  if (owner !== undefined) updateValues.owner = owner;

  const data = await db.update(projects).set(updateValues).where(and(eq(projects.id, Number(req.params.id)), eq(projects.workspaceId, req.workspaceId!))).returning();
  res.json(data[0]);
});

// --- IDEAS ---
apiRouter.get("/ideas", async (req: AuthRequest, res) => {
  const data = await db.select().from(ideas).where(eq(ideas.workspaceId, req.workspaceId!));
  res.json(data);
});
apiRouter.post("/ideas", async (req: AuthRequest, res) => {
  const data = await db.insert(ideas).values({ ...req.body, workspaceId: req.workspaceId!, authorUid: req.user!.uid }).returning();
  res.json(data[0]);
});

apiRouter.put("/ideas/:id", async (req: AuthRequest, res) => {
  const data = await db.update(ideas).set(req.body).where(and(eq(ideas.id, Number(req.params.id)), eq(ideas.workspaceId, req.workspaceId!))).returning();
  res.json(data[0]);
});

// --- PRODUCTS ---
apiRouter.get("/products", async (req: AuthRequest, res) => {
  const data = await db.select().from(products).where(eq(products.workspaceId, req.workspaceId!));
  res.json(data);
});
apiRouter.post("/products", async (req: AuthRequest, res) => {
  const data = await db.insert(products).values({ ...req.body, workspaceId: req.workspaceId! }).returning();
  res.json(data[0]);
});
apiRouter.put("/products/:id", async (req: AuthRequest, res) => {
  const data = await db.update(products).set(req.body).where(and(eq(products.id, Number(req.params.id)), eq(products.workspaceId, req.workspaceId!))).returning();
  res.json(data[0]);
});

// --- SPRINTS ---
apiRouter.get("/sprints", async (req: AuthRequest, res) => {
  const { projectId } = req.query;
  
  const conditions = [eq(projects.workspaceId, req.workspaceId!)];
  if (projectId) {
    conditions.push(eq(sprints.projectId, Number(projectId)));
  }
  
  const data = await db.select().from(sprints).innerJoin(projects, eq(sprints.projectId, projects.id)).where(and(...conditions));
  res.json(data.map(d => ({
      ...d.sprints,
      startDate: d.sprints.startDate,
      endDate: d.sprints.endDate
  })));
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
      // Verify workspace
      const existing = await db.select().from(sprints)
        .innerJoin(projects, eq(sprints.projectId, projects.id))
        .where(and(eq(sprints.id, sprintId), eq(projects.workspaceId, req.workspaceId!)));
      
      if (existing.length === 0) {
        return res.status(403).json({ error: "Sprint not found or not in workspace" });
      }

      const updateValues: any = {};
      if (name !== undefined) updateValues.name = name;
      if (goal !== undefined) updateValues.goal = goal;
      if (status !== undefined) updateValues.status = status;
      if (startDate !== undefined) updateValues.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateValues.endDate = endDate ? new Date(endDate) : null;

      const data = await db.update(sprints).set(updateValues).where(eq(sprints.id, sprintId)).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating sprint:", error);
    res.status(500).json({ error: "Failed to update sprint" });
  }
});

apiRouter.delete("/sprints/:id", async (req: AuthRequest, res) => {
    const sprintId = Number(req.params.id);
    try {
        const existing = await db.select().from(sprints)
          .innerJoin(projects, eq(sprints.projectId, projects.id))
          .where(and(eq(sprints.id, sprintId), eq(projects.workspaceId, req.workspaceId!)));
        
        if (existing.length === 0) {
          return res.status(403).json({ error: "Sprint not found or not in workspace" });
        }

        await db.delete(sprints).where(eq(sprints.id, sprintId));
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting sprint:", error);
        res.status(500).json({ error: "Failed to delete sprint" });
    }
});

// --- TASKS ---
apiRouter.get("/tasks", async (req: AuthRequest, res) => {
  const data = await db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      sprintId: tasks.sprintId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      priority: tasks.priority,
      assigneeUid: tasks.assigneeUid,
      dueDate: tasks.dueDate,
      tags: tasks.tags,
      subtasks: tasks.subtasks,
      taskComments: tasks.taskComments,
      dependencies: tasks.dependencies,
      order: tasks.order,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(eq(projects.workspaceId, req.workspaceId!));
  res.json(data);
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
          projectId: Number(projectId), 
          sprintId: sprintId ? Number(sprintId) : null,
          title, 
          description,
          status: status || 'TODO', 
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
      res.json(data[0]);
  } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Failed to create task", details: error });
  }
});
apiRouter.put("/tasks/:id", async (req: AuthRequest, res) => {
  const taskId = Number(req.params.id);
  const existingTask = await db.select({ projectId: tasks.projectId })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.id, taskId), eq(projects.workspaceId, req.workspaceId!)));
  
  if (existingTask.length === 0) {
    return res.status(403).json({ error: "Task not found or not in workspace" });
  }

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

  const data = await db.update(tasks).set(updateValues).where(eq(tasks.id, taskId)).returning();
  res.json(data[0]);
});

apiRouter.delete("/tasks/:id", async (req: AuthRequest, res) => {
  const taskId = Number(req.params.id);
  try {
      const existingTask = await db.select({ projectId: tasks.projectId })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(and(eq(tasks.id, taskId), eq(projects.workspaceId, req.workspaceId!)));
      
      if (existingTask.length === 0) {
        return res.status(403).json({ error: "Task not found" });
      }

      await db.delete(tasks).where(eq(tasks.id, taskId));
      res.json({ success: true });
  } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
  }
});

// --- FINANCE ---
apiRouter.get("/finance", async (req: AuthRequest, res) => {
  const data = await db.select().from(financeEntries).where(eq(financeEntries.workspaceId, req.workspaceId!));
  res.json(data);
});
apiRouter.post("/finance", async (req: AuthRequest, res) => {
  try {
    const { description, amount, type, category, date, companyId, projectId, status, isRecurrent, dueDate } = req.body;
    const data = await db.insert(financeEntries).values({ 
        workspaceId: req.workspaceId!,
        description,
        amount: amount.toString(),
        type,
        category,
        date: new Date(date),
        companyId: companyId ? Number(companyId) : null,
        projectId: projectId ? Number(projectId) : null,
        status,
        isRecurrent: !!isRecurrent,
        dueDate: dueDate ? new Date(dueDate) : null
    }).returning();
    res.json(data[0]);
  } catch (error) {
    console.error("Error in POST /finance:", error);
    res.status(500).json({ error: "Failed to create finance entry" });
  }
});

apiRouter.put("/finance/:id", async (req: AuthRequest, res) => {
  const entryId = Number(req.params.id);
  const { description, amount, type, category, date, companyId, projectId, status, isRecurrent, dueDate } = req.body;
  try {
      const existing = await db.select().from(financeEntries)
        .where(and(eq(financeEntries.id, entryId), eq(financeEntries.workspaceId, req.workspaceId!)));
      
      if (existing.length === 0) {
        return res.status(403).json({ error: "Finance entry not found or not in workspace" });
      }

      const updateValues: any = {
          description,
          amount: amount.toString(),
          type,
          category,
          date: date ? new Date(date) : null,
          companyId: companyId ? Number(companyId) : null,
          projectId: projectId ? Number(projectId) : null,
          status,
          isRecurrent: !!isRecurrent,
          dueDate: dueDate ? new Date(dueDate) : null,
          updatedAt: new Date()
      };

      const data = await db.update(financeEntries).set(updateValues).where(eq(financeEntries.id, entryId)).returning();
      res.json(data[0]);
  } catch (error) {
      console.error("Error updating finance entry:", error);
      res.status(500).json({ error: "Failed to update finance entry" });
  }
});

// --- MILESTONES ---
apiRouter.get("/milestones", async (req: AuthRequest, res) => {
  const { projectId } = req.query;
  
  const conditions = [eq(projects.workspaceId, req.workspaceId!)];
  if (projectId) {
    conditions.push(eq(milestones.projectId, Number(projectId)));
  }
  
  const data = await db.select().from(milestones).innerJoin(projects, eq(milestones.projectId, projects.id)).where(and(...conditions));
  res.json(data.map(d => ({
      ...d.milestones
  })));
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
      const existing = await db.select().from(milestones)
        .innerJoin(projects, eq(milestones.projectId, projects.id))
        .where(and(eq(milestones.id, milestoneId), eq(projects.workspaceId, req.workspaceId!)));
      
      if (existing.length === 0) {
        return res.status(403).json({ error: "Milestone not found or not in workspace" });
      }

      const updateValues: any = {};
      if (name !== undefined) updateValues.name = name;
      if (status !== undefined) updateValues.status = status;
      if (description !== undefined) updateValues.description = description;
      if (date !== undefined) updateValues.date = date ? new Date(date) : null;

      const data = await db.update(milestones).set(updateValues).where(eq(milestones.id, milestoneId)).returning();
      res.json(data[0]);
  } catch (error) {
    console.error("Error updating milestone:", error);
    res.status(500).json({ error: "Failed to update milestone" });
  }
});

apiRouter.delete("/milestones/:id", async (req: AuthRequest, res) => {
    const milestoneId = Number(req.params.id);
    try {
        const existing = await db.select().from(milestones)
          .innerJoin(projects, eq(milestones.projectId, projects.id))
          .where(and(eq(milestones.id, milestoneId), eq(projects.workspaceId, req.workspaceId!)));
        
        if (existing.length === 0) {
          return res.status(403).json({ error: "Milestone not found or not in workspace" });
        }

        await db.delete(milestones).where(eq(milestones.id, milestoneId));
        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting milestone:", error);
        res.status(500).json({ error: "Failed to delete milestone" });
    }
});

// --- DOCUMENTS ---
apiRouter.get("/documents", async (req: AuthRequest, res) => {
  const { projectId } = req.query;
  
  const conditions = [eq(documents.workspaceId, req.workspaceId!)];
  if (projectId) {
    conditions.push(eq(documents.projectId, Number(projectId)));
  }
  
  const data = await db.select().from(documents).where(and(...conditions));
  res.json(data);
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
apiRouter.get("/notes", async (req: AuthRequest, res) => {
  try {
    const data = await db.select().from(notes).where(eq(notes.workspaceId, req.workspaceId!)).orderBy(desc(notes.updatedAt));
    res.json(data);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

apiRouter.post("/notes", async (req: AuthRequest, res) => {
  try {
    const { title, content, color, isPinned, tags } = req.body;
    const [inserted] = await db.insert(notes).values({
      workspaceId: req.workspaceId!,
      authorUid: req.user!.uid,
      title: title || "",
      content: content || "",
      color: color || "bg-white",
      isPinned: isPinned || false,
      tags: tags || [],
    }).returning();
    res.json(inserted);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
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

apiRouter.delete("/notes/:id", async (req: AuthRequest, res) => {
  try {
    const noteId = Number(req.params.id);
    await db.delete(notes).where(and(eq(notes.id, noteId), eq(notes.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// --- FLOW BUILDER ---
apiRouter.get("/flow-builder", async (req: AuthRequest, res) => {
  try {
    const data = await db.select().from(flows).where(eq(flows.workspaceId, req.workspaceId!));
    res.json(data);
  } catch (error) {
    console.error("Error fetching flows:", error);
    res.status(500).json({ error: "Failed to fetch flows" });
  }
});

apiRouter.get("/flow-builder/:id", async (req: AuthRequest, res) => {
  try {
    const [data] = await db.select().from(flows).where(and(eq(flows.id, Number(req.params.id)), eq(flows.workspaceId, req.workspaceId!)));
    if (!data) return res.status(404).json({ error: "Flow not found" });
    res.json(data);
  } catch (error) {
    console.error("Error fetching flow:", error);
    res.status(500).json({ error: "Failed to fetch flow" });
  }
});

import { generateNodeDefinition } from "../lib/gemini";

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

// --- WORKSPACE MEMBERS ---
apiRouter.get("/workspace/members", async (req: AuthRequest, res) => {
  try {
    const list = await db.select({
      uid: users.uid,
      email: users.email,
      displayName: users.displayName,
      photoUrl: users.photoUrl,
      role: workspaceMembers.role,
    })
    .from(workspaceMembers)
    .innerJoin(users, eq(workspaceMembers.userUid, users.uid))
    .where(eq(workspaceMembers.workspaceId, req.workspaceId!));
    
    res.json(list);
  } catch (error) {
    console.error("Error fetching workspace members:", error);
    res.status(500).json({ error: "Failed to fetch workspace members" });
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
    const data = await db.update(companies).set({
      ...req.body,
      updatedAt: new Date()
    }).where(and(eq(companies.id, compId), eq(companies.workspaceId, req.workspaceId!))).returning();
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
    const { role } = req.body;
    const { userUid } = req.params;
    await db.update(workspaceMembers).set({ role }).where(and(eq(workspaceMembers.userUid, userUid), eq(workspaceMembers.workspaceId, req.workspaceId!)));
    res.json({ success: true });
  } catch (error) {
    console.error("Error setting member role:", error);
    res.status(500).json({ error: "Failed to update member role" });
  }
});

apiRouter.delete("/workspace/members/:userUid", async (req: AuthRequest, res) => {
  try {
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
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const [usr] = await db.select().from(users).where(eq(users.email, email));
    if (!usr) {
      return res.status(404).json({ error: "User with this email is not registered in the database." });
    }
    const [existing] = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, req.workspaceId!), eq(workspaceMembers.userUid, usr.uid)));
    if (existing) {
      return res.status(400).json({ error: "User is already a member of this workspace" });
    }
    await db.insert(workspaceMembers).values({
      workspaceId: req.workspaceId!,
      userUid: usr.uid,
      role: role || "MEMBER"
    });
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
    const [updated] = await db.update(workspaces).set({
      name: body.name,
      settings: body.settings || {},
      updatedAt: new Date()
    }).where(eq(workspaces.id, req.workspaceId!)).returning();
    res.json(updated);
  } catch (error) {
    console.error("Error updating workspace settings:", error);
    res.status(500).json({ error: "Failed to update workspace settings" });
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

    const detailedList = [];
    for (const ws of list) {
      const [companiesCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(companies).where(eq(companies.workspaceId, ws.id));
      const [projectsCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(projects).where(eq(projects.workspaceId, ws.id));
      const [productsCount] = await db.select({ count: sql<number>`CAST(count(*) AS INTEGER)` }).from(products).where(eq(products.workspaceId, ws.id));

      detailedList.push({
        ...ws,
        stats: {
          companies: companiesCount?.count || 0,
          projects: projectsCount?.count || 0,
          products: productsCount?.count || 0
        }
      });
    }

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
    const [membership] = await db.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, wsId), eq(workspaceMembers.userUid, req.user!.uid)));
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

// Final catch-all for apiRouter
apiRouter.use((req, res) => {
  console.log(`[apiRouter 404] ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found in apiRouter` });
});

export default apiRouter;
