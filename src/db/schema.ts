import { sqliteTable, text, integer, real as decimal, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';

// USERS
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  currentPlan: text('current_plan').default('Pro'),
  activeWorkspaceId: integer('active_workspace_id'), // Will foreign key down below
  phone: text('phone'),
  role: text('role'),
  settings: text('settings', { mode: "json" }).default({}),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  emailIdx: index('users_email_idx').on(t.email),
  uidIdx: index('users_uid_idx').on(t.uid),
}));

// WORKSPACES
export const workspaces = sqliteTable('workspaces', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  ownerUid: text('owner_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  plan: text('plan').default('Pro'),
  settings: text('settings', { mode: "json" }).default({}),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  ownerIdx: index('workspaces_owner_idx').on(t.ownerUid),
}));

// WORKSPACE MEMBERS
export const workspaceMembers = sqliteTable('workspace_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  role: text('role').notNull().default('MEMBER'), // OWNER, ADMIN, MEMBER
  cargo: text('cargo').default('Colaborador'), // Job title / function (e.g. Desenvolvedor, QA, PM)
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsUserIdx: index('ws_members_ws_user_idx').on(t.workspaceId, t.userUid),
  userIdx: index('ws_members_user_idx').on(t.userUid),
}));

// COMPANIES (Empresas)
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  industry: text('industry'),
  size: text('size'),
  website: text('website'),
  status: text('status').default('Ativo'), // Ativo, Inativo
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('companies_ws_idx').on(t.workspaceId),
}));

// CLIENTS (Clientes)
export const clients = sqliteTable('clients', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  status: text('status').default('Ativo'), // Ativo, Inativo, Lead
  notes: text('notes'),
  role: text('role'), // Cargo
  tags: text('tags', { mode: 'json' }).default([]),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('clients_ws_idx').on(t.workspaceId),
}));

// PRODUCTS
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('Em Desenvolvimento'),
  launchDate: integer('launch_date', { mode: "timestamp_ms" }),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('products_ws_idx').on(t.workspaceId),
  compIdx: index('products_comp_idx').on(t.companyId),
}));

// PROJECTS
export const projects = sqliteTable('projects', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  owner: text('owner').default('Sem dono'),
  status: text('status').default('Em Andamento'), // Planejamento, Em Andamento, Pausado, Concluído
  priority: text('priority').default('Média'), // Baixa, Média, Alta, Crítica
  progress: integer('progress').default(0),
  budget: decimal('budget').default(0),
  startDate: integer('start_date', { mode: "timestamp_ms" }),
  dueDate: integer('due_date', { mode: "timestamp_ms" }),
  team: text('team', { mode: "json" }).default([]),
  history: text('history', { mode: "json" }).default([]),
  comments: text('comments', { mode: "json" }).default([]),
  criteria: text('criteria', { mode: "json" }).default([]),
  velocity: text('velocity', { mode: "json" }).default([]),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('projects_ws_idx').on(t.workspaceId),
}));

// SPRINTS
export const sprints = sqliteTable('sprints', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goal: text('goal'), // Added goal column
  startDate: integer('start_date', { mode: "timestamp_ms" }),
  endDate: integer('end_date', { mode: "timestamp_ms" }),
  status: text('status').default('PLANNED'), // PLANNED, ACTIVE, COMPLETED
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  projIdx: index('sprints_proj_idx').on(t.projectId),
}));

// TASKS (Kanban)
export const tasks = sqliteTable('tasks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Existing fields
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sprintId: integer('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('BACKLOG'), // BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE
  priority: text('priority').default('Média'),
  assigneeUid: text('assignee_uid').references(() => users.uid, { onDelete: 'set null' }),
  dueDate: integer('due_date', { mode: "timestamp_ms" }),
  order: integer('order').default(0), // Position in Kanban column
  tags: text('tags', { mode: "json" }).default([]), // New field
  subtasks: text('subtasks', { mode: "json" }).default([]), // New field
  taskComments: text('task_comments', { mode: "json" }).default([]), // New field
  dependencies: text('dependencies', { mode: "json" }).default([]), // New field
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  projIdx: index('tasks_proj_idx').on(t.projectId),
  sprintIdx: index('tasks_sprint_idx').on(t.sprintId),
}));

// IDEAS
export const ideas = sqliteTable('ideas', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('Nova'), // Nova, Em Análise, Aprovada, Rejeitada, Convertida
  priority: text('priority').default('Média'),
  tags: text('tags', { mode: "json" }).default([]), // array of strings
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'set null' }),
  convertedToProjectId: integer('converted_to_project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('ideas_ws_idx').on(t.workspaceId),
}));

// DOCUMENTS
export const documents = sqliteTable('documents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'), // Markdown or HTML
  folder: text('folder'), // Used as Category in UI
  type: text('type').default('FILE'), // FILE, URL
  url: text('url'),
  size: text('size'),
  tags: text('tags', { mode: "json" }).default([]),
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  isFavorite: integer('is_favorite', { mode: "boolean" }).default(false),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('documents_ws_idx').on(t.workspaceId),
}));

// NOTES (Google Keep clone)
export const notes = sqliteTable('notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  color: text('color').default('bg-white'),
  isPinned: integer('is_pinned', { mode: "boolean" }).default(false),
  tags: text('tags', { mode: "json" }).default([]),
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'set null' }),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('notes_ws_idx').on(t.workspaceId),
}));

// FLOWS (Visual Systems Studio)
export const flows = sqliteTable('flow_builder_flows', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull().default('flow'), // flow, database, infographic, api
  flowJson: text('flow_json', { mode: "json" }).notNull().default({ nodes: [], edges: [] }),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('flows_ws_idx').on(t.workspaceId),
}));

export const aiMemories = sqliteTable('ai_memories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // Perfil, Empresa, Projetos, etc.
  content: text('content').notNull(),
  importance: integer('importance').default(5), // 1-10
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`)
}, (t) => ({
  wsIdx: index('ai_memories_ws_idx').on(t.workspaceId),
}));

// FINANCE ENTRIES
export const financeEntries = sqliteTable('finance_entries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // RECEITA, DESPESA
  amount: decimal('amount').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  date: integer('date', { mode: "timestamp_ms" }).notNull(),
  status: text('status').default('PENDENTE'), // PAGO, PENDENTE, ATRASADO
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  isRecurrent: integer('is_recurrent', { mode: "boolean" }).default(false),
  dueDate: integer('due_date', { mode: "timestamp_ms" }),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('finance_ws_idx').on(t.workspaceId),
  dateIdx: index('finance_date_idx').on(t.date),
}));

// AI HISTORY
export const aiHistory = sqliteTable('ai_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  contextType: text('context_type'), // e.g. 'general', 'project_12', 'document_10'
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('ai_history_ws_idx').on(t.workspaceId),
}));

// NOTIFICATIONS
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').default('info'), // info, success, warning, error
  isRead: integer('is_read', { mode: "boolean" }).default(false),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('notifications_ws_idx').on(t.workspaceId),
}));

// AGENDA EVENTS
export const agendaEvents = sqliteTable('agenda_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').default(''),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  owner: text('owner').notNull(),
  participants: text('participants', { mode: "json" }).default([]),
  location: text('location').default(''),
  type: text('type').default('compromisso'),
  category: text('category').default('Administrativo'),
  status: text('status').default('Agendado'),
  reminder: text('reminder').default('none'),
  recurrence: text('recurrence').default('none'),
  recurrenceDescription: text('recurrence_description').default(''),
  linkedProjectId: integer('linked_project_id').references(() => projects.id, { onDelete: 'set null' }),
  linkedCompanyId: integer('linked_company_id').references(() => companies.id, { onDelete: 'set null' }),
  linkedTaskId: integer('linked_task_id').references(() => tasks.id, { onDelete: 'set null' }),
  comments: text('comments', { mode: "json" }).default([]),
  attachments: text('attachments', { mode: "json" }).default([]),
  checklist: text('checklist', { mode: "json" }).default([]),
  history: text('history', { mode: "json" }).default([]),
  reservedResources: text('reserved_resources', { mode: "json" }).default([]),
  isTimeBlock: integer('is_time_block', { mode: "boolean" }).default(false),
  timeBlockType: text('time_block_type').default('none'),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
  updatedAt: integer('updated_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('agenda_ws_idx').on(t.workspaceId),
  dateIdx: index('agenda_date_idx').on(t.date),
}));

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many, one }) => ({
  workspacesOwned: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerUid], references: [users.uid] }),
  members: many(workspaceMembers),
  companies: many(companies),
  clients: many(clients),
  products: many(products),
  projects: many(projects),
  ideas: many(ideas),
  documents: many(documents),
  notes: many(notes),
  financeEntries: many(financeEntries),
  aiHistory: many(aiHistory),
  notifications: many(notifications),
  agendaEvents: many(agendaEvents),
  flows: many(flows),
}));

export const clientsRelations = relations(clients, ({ one }) => ({
  workspace: one(workspaces, { fields: [clients.workspaceId], references: [workspaces.id] }),
  company: one(companies, { fields: [clients.companyId], references: [companies.id] }),
}));

export const flowsRelations = relations(flows, ({ one }) => ({
  workspace: one(workspaces, { fields: [flows.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [flows.userUid], references: [users.uid] }),
}));

export const agendaEventsRelations = relations(agendaEvents, ({ one }) => ({
  workspace: one(workspaces, { fields: [agendaEvents.workspaceId], references: [workspaces.id] }),
  project: one(projects, { fields: [agendaEvents.linkedProjectId], references: [projects.id] }),
  company: one(companies, { fields: [agendaEvents.linkedCompanyId], references: [companies.id] }),
  task: one(tasks, { fields: [agendaEvents.linkedTaskId], references: [tasks.id] }),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({ one }) => ({
  workspace: one(workspaces, { fields: [workspaceMembers.workspaceId], references: [workspaces.id] }),
  user: one(users, { fields: [workspaceMembers.userUid], references: [users.uid] }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [companies.workspaceId], references: [workspaces.id] }),
  products: many(products),
  projects: many(projects),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [products.workspaceId], references: [workspaces.id] }),
  company: one(companies, { fields: [products.companyId], references: [companies.id] }),
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  workspace: one(workspaces, { fields: [projects.workspaceId], references: [workspaces.id] }),
  company: one(companies, { fields: [projects.companyId], references: [companies.id] }),
  product: one(products, { fields: [projects.productId], references: [products.id] }),
  tasks: many(tasks),
  sprints: many(sprints),
  milestones: many(milestones),
}));

// MILESTONES (Marcos do Projeto)
export const milestones = sqliteTable('milestones', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: integer('date', { mode: "timestamp_ms" }),
  status: text('status').default('PENDENTE'), // PENDENTE, CONCLUIDO
  description: text('description'),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
});

export const deploys = sqliteTable('deploys', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  version: text('version').notNull(),
  status: text('status').default('success'), // success, failed, in_progress
  userUid: text('user_uid').references(() => users.uid, { onDelete: 'set null' }),
  duration: text('duration'), // e.g. "1m 24s"
  logs: text('logs'),
  createdAt: integer('created_at', { mode: "timestamp_ms" }).default(sql`(unixepoch() * 1000)`),
}, (t) => ({
  wsIdx: index('deploys_ws_idx').on(t.workspaceId),
  prodIdx: index('deploys_prod_idx').on(t.productId),
}));

export const sprintsRelations = relations(sprints, ({ one, many }) => ({
  project: one(projects, { fields: [sprints.projectId], references: [projects.id] }),
  tasks: many(tasks),
}));

export const milestonesRelations = relations(milestones, ({ one }) => ({
  project: one(projects, { fields: [milestones.projectId], references: [projects.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, { fields: [tasks.projectId], references: [projects.id] }),
  sprint: one(sprints, { fields: [tasks.sprintId], references: [sprints.id] }),
  assignee: one(users, { fields: [tasks.assigneeUid], references: [users.uid] }),
}));
