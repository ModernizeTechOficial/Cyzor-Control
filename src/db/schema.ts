import { pgTable, serial, text, timestamp, boolean, integer, decimal, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// USERS
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  currentPlan: text('current_plan').default('Pro'),
  activeWorkspaceId: integer('active_workspace_id'), // Will foreign key down below
  phone: text('phone'),
  role: text('role'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// WORKSPACES
export const workspaces = pgTable('workspaces', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  ownerUid: text('owner_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  plan: text('plan').default('Pro'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// WORKSPACE MEMBERS
export const workspaceMembers = pgTable('workspace_members', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  role: text('role').notNull().default('MEMBER'), // OWNER, ADMIN, MEMBER
  createdAt: timestamp('created_at').defaultNow(),
});

// COMPANIES (Empresas)
export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  industry: text('industry'),
  size: text('size'),
  website: text('website'),
  status: text('status').default('Ativo'), // Ativo, Inativo
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// PRODUCTS
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('Em Desenvolvimento'),
  launchDate: timestamp('launch_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// PROJECTS
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('Em Andamento'), // Planejamento, Em Andamento, Pausado, Concluído
  priority: text('priority').default('Média'), // Baixa, Média, Alta, Crítica
  progress: integer('progress').default(0),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  team: jsonb('team').default([]),
  history: jsonb('history').default([]),
  comments: jsonb('comments').default([]),
  criteria: jsonb('criteria').default([]),
  velocity: jsonb('velocity').default([]),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// SPRINTS
export const sprints = pgTable('sprints', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goal: text('goal'), // Added goal column
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: text('status').default('PLANNED'), // PLANNED, ACTIVE, COMPLETED
  createdAt: timestamp('created_at').defaultNow(),
});

// TASKS (Kanban)
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  // Existing fields
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sprintId: integer('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('BACKLOG'), // BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE
  priority: text('priority').default('Média'),
  assigneeUid: text('assignee_uid').references(() => users.uid, { onDelete: 'set null' }),
  dueDate: timestamp('due_date'),
  order: integer('order').default(0), // Position in Kanban column
  tags: jsonb('tags').default([]), // New field
  subtasks: jsonb('subtasks').default([]), // New field
  taskComments: jsonb('task_comments').default([]), // New field
  dependencies: jsonb('dependencies').default([]), // New field
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// IDEAS
export const ideas = pgTable('ideas', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('Nova'), // Nova, Em Análise, Aprovada, Rejeitada, Convertida
  priority: text('priority').default('Média'),
  tags: jsonb('tags').default([]), // array of strings
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'set null' }),
  convertedToProjectId: integer('converted_to_project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// DOCUMENTS
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'), // Markdown or HTML
  folder: text('folder'), // Used as Category in UI
  type: text('type').default('FILE'), // FILE, URL
  url: text('url'),
  size: text('size'),
  tags: jsonb('tags').default([]),
  authorUid: text('author_uid').references(() => users.uid, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const aiMemories = pgTable('ai_memories', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // Perfil, Empresa, Projetos, etc.
  content: text('content').notNull(),
  importance: integer('importance').default(5), // 1-10
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// FINANCE ENTRIES
export const financeEntries = pgTable('finance_entries', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // RECEITA, DESPESA
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  category: text('category'),
  date: timestamp('date').notNull(),
  status: text('status').default('PENDENTE'), // PAGO, PENDENTE, ATRASADO
  companyId: integer('company_id').references(() => companies.id, { onDelete: 'set null' }),
  projectId: integer('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// AI HISTORY
export const aiHistory = pgTable('ai_history', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: text('user_uid').notNull().references(() => users.uid, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  contextType: text('context_type'), // e.g. 'general', 'project_12', 'document_10'
  createdAt: timestamp('created_at').defaultNow(),
});

// NOTIFICATIONS
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').default('info'), // info, success, warning, error
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// AGENDA EVENTS
export const agendaEvents = pgTable('agenda_events', {
  id: serial('id').primaryKey(),
  workspaceId: integer('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').default(''),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  owner: text('owner').notNull(),
  participants: jsonb('participants').default([]),
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
  comments: jsonb('comments').default([]),
  attachments: jsonb('attachments').default([]),
  checklist: jsonb('checklist').default([]),
  history: jsonb('history').default([]),
  reservedResources: jsonb('reserved_resources').default([]),
  isTimeBlock: boolean('is_time_block').default(false),
  timeBlockType: text('time_block_type').default('none'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many, one }) => ({
  workspacesOwned: many(workspaces),
  workspaceMemberships: many(workspaceMembers),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  owner: one(users, { fields: [workspaces.ownerUid], references: [users.uid] }),
  members: many(workspaceMembers),
  companies: many(companies),
  products: many(products),
  projects: many(projects),
  ideas: many(ideas),
  documents: many(documents),
  financeEntries: many(financeEntries),
  aiHistory: many(aiHistory),
  notifications: many(notifications),
  agendaEvents: many(agendaEvents),
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
export const milestones = pgTable('milestones', {
  id: serial('id').primaryKey(),
  projectId: integer('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: timestamp('date'),
  status: text('status').default('PENDENTE'), // PENDENTE, CONCLUIDO
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

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
