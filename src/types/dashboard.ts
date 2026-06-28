export interface DashboardMetrics {
  companies: number;
  projects: number;
  ideas: number;
  revenue: number;
}

export interface DashboardInsight {
  id: string;
  type: 'high' | 'medium' | 'low';
  message: string;
  time: string;
}

export interface DashboardActivity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
}

export interface DashboardTask {
  id: string;
  title: string;
  category: string;
  time: string;
}

export interface DashboardIdea {
  id: string;
  name: string;
  score: number;
  potential: string;
  status: string;
}

export interface DashboardProject {
  id: string;
  name: string;
  status: string;
  progress: number;
  members: number;
  deadline: string;
}
