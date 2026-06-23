export interface Task {
  id: number;
  name: string;
  assignee: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  column: 'todo' | 'in_progress' | 'review' | 'done';
  sprintId?: number;
  tags?: string[];
  dueDate?: string;
  dependencies?: number[]; // IDs of tasks it is dependent on
  description?: string;
  subtasks?: Array<{ id: number; name: string; isCompleted: boolean }>;
  taskComments?: Array<{ id: number; author: string; text: string; time: string }>;
}

export interface Sprint {
  id: number;
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'Planejada' | 'Ativa' | 'Finalizada';
}

export interface ProjectMember {
  name: string;
  role: string;
  allocation: number; // workload e.g. 80 (%)
  avatar: string;
}

export interface Milestone {
  id: number;
  title: string;
  desc: string;
  date: string;
  status: 'Concluído' | 'Em Andamento' | 'Pendente';
}

export interface ProjectDoc {
  id: number;
  title: string;
  category: 'Contratos' | 'Escopo' | 'Planejamento' | 'Design' | 'Técnicos';
  size: string;
  uploadedBy: string;
  date: string;
  url?: string;
  content?: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  time: string;
}

export interface Activity {
  id: number;
  user: string;
  action: string;
  time: string;
}

export interface ProjectExtended {
  id: number;
  name: string;
  company: string;
  owner: string;
  priority: string;
  deadline: string;
  column: string;
  description?: string;
  progress?: number;
  criteria?: Array<{ id: number; text: string; completed: boolean }>;
  
  // Extended fields
  hasFullData?: boolean;
  tasks?: Task[];
  sprints?: Sprint[];
  currentSprintId?: number;
  milestones?: Milestone[];
  team?: ProjectMember[];
  docs?: ProjectDoc[];
  comments?: Comment[];
  history?: Activity[];
  velocity?: Array<{ sprint: string; pts: number }>;
}
