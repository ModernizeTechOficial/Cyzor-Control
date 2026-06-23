import { mysqlTable, int, text, timestamp, boolean, decimal, json, varchar } from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';

// USERS
export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  uid: varchar('uid', { length: 255 }).notNull().unique(), // Firebase Auth UID
  email: varchar('email', { length: 255 }).notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  currentPlan: text('current_plan'),
  activeWorkspaceId: int('active_workspace_id'), // Will foreign key down below
  phone: text('phone'),
  role: text('role'),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// WORKSPACES
export const workspaces = mysqlTable('workspaces', {
  id: int('id').primaryKey().autoincrement(),
  name: text('name').notNull(),
  ownerUid: varchar('owner_uid', { length: 255 }).notNull().references(() => users.uid, { onDelete: 'cascade' }),
  plan: text('plan'),
  settings: json('settings'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// WORKSPACE MEMBERS
export const workspaceMembers = mysqlTable('workspace_members', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: varchar('user_uid', { length: 255 }).notNull().references(() => users.uid, { onDelete: 'cascade' }),
  role: text('role').notNull(), // OWNER, ADMIN, MEMBER
  createdAt: timestamp('created_at').defaultNow(),
});

// COMPANIES (Empresas)
export const companies = mysqlTable('companies', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  cnpj: text('cnpj'),
  industry: text('industry'),
  size: text('size'),
  website: text('website'),
  status: text('status'), // Ativo, Inativo
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// PRODUCTS
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: int('company_id').references(() => companies.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status'),
  launchDate: timestamp('launch_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// PROJECTS
export const projects = mysqlTable('projects', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  companyId: int('company_id').references(() => companies.id, { onDelete: 'set null' }),
  productId: int('product_id').references(() => products.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status'), // Planejamento, Em Andamento, Pausado, Concluído
  priority: text('priority'), // Baixa, Média, Alta, Crítica
  progress: int('progress').default(0),
  startDate: timestamp('start_date'),
  dueDate: timestamp('due_date'),
  team: json('team'),
  history: json('history'),
  comments: json('comments'),
  criteria: json('criteria'),
  velocity: json('velocity'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// SPRINTS
export const sprints = mysqlTable('sprints', {
  id: int('id').primaryKey().autoincrement(),
  projectId: int('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  goal: text('goal'), // Added goal column
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  status: text('status'), // PLANNED, ACTIVE, COMPLETED
  createdAt: timestamp('created_at').defaultNow(),
});

// TASKS (Kanban)
export const tasks = mysqlTable('tasks', {
  id: int('id').primaryKey().autoincrement(),
  // Existing fields
  projectId: int('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  sprintId: int('sprint_id').references(() => sprints.id, { onDelete: 'set null' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status'), // BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE
  priority: text('priority'),
  assigneeUid: varchar('assignee_uid', { length: 255 }).references(() => users.uid, { onDelete: 'set null' }),
  dueDate: timestamp('due_date'),
  order: int('order').default(0), // Position in Kanban column
  tags: json('tags'), // New field
  subtasks: json('subtasks'), // New field
  taskComments: json('task_comments'), // New field
  dependencies: json('dependencies'), // New field
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// IDEAS
export const ideas = mysqlTable('ideas', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status'), // Nova, Em Análise, Aprovada, Rejeitada, Convertida
  priority: text('priority'),
  tags: json('tags'), // array of strings
  authorUid: varchar('author_uid', { length: 255 }).references(() => users.uid, { onDelete: 'set null' }),
  convertedToProjectId: int('converted_to_project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// DOCUMENTS
export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'), // Markdown or HTML
  folder: text('folder'), // Used as Category in UI
  type: text('type'), // FILE, URL
  url: text('url'),
  size: text('size'),
  tags: json('tags'),
  authorUid: varchar('author_uid', { length: 255 }).references(() => users.uid, { onDelete: 'set null' }),
  projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
  isFavorite: boolean('is_favorite').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

export const aiMemories = mysqlTable('ai_memories', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  category: text('category').notNull(), // Perfil, Empresa, Projetos, etc.
  content: text('content').notNull(),
  importance: int('importance').default(5), // 1-10
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow()
});

// FINANCE ENTRIES
export const financeEntries = mysqlTable('finance_entries', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // RECEITA, DESPESA
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description').notNull(),
  category: text('category'),
  date: timestamp('date').notNull(),
  status: text('status'), // PAGO, PENDENTE, ATRASADO
  companyId: int('company_id').references(() => companies.id, { onDelete: 'set null' }),
  projectId: int('project_id').references(() => projects.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});

// AI HISTORY
export const aiHistory = mysqlTable('ai_history', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  userUid: varchar('user_uid', { length: 255 }).notNull().references(() => users.uid, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  contextType: text('context_type'), // e.g. 'general', 'project_12', 'document_10'
  createdAt: timestamp('created_at').defaultNow(),
});

// NOTIFICATIONS
export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type'), // info, success, warning, error
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// AGENDA EVENTS
export const agendaEvents = mysqlTable('agenda_events', {
  id: int('id').primaryKey().autoincrement(),
  workspaceId: int('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(), // YYYY-MM-DD
  startTime: text('start_time').notNull(), // HH:MM
  endTime: text('end_time').notNull(), // HH:MM
  owner: text('owner').notNull(),
  participants: json('participants'),
  location: text('location'),
  type: text('type'),
  category: text('category'),
  status: text('status'),
  reminder: text('reminder'),
  recurrence: text('recurrence'),
  recurrenceDescription: text('recurrence_description'),
  linkedProjectId: int('linked_project_id').references(() => projects.id, { onDelete: 'set null' }),
  linkedCompanyId: int('linked_company_id').references(() => companies.id, { onDelete: 'set null' }),
  linkedTaskId: int('linked_task_id').references(() => tasks.id, { onDelete: 'set null' }),
  comments: json('comments'),
  attachments: json('attachments'),
  checklist: json('checklist'),
  history: json('history'),
  reservedResources: json('reserved_resources'),
  isTimeBlock: boolean('is_time_block').default(false),
  timeBlockType: text('time_block_type'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
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
export const milestones = mysqlTable('milestones', {
  id: int('id').primaryKey().autoincrement(),
  projectId: int('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  date: timestamp('date'),
  status: text('status'), // PENDENTE, CONCLUIDO
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
