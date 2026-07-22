import { getProfessionalEvolutionInfo } from '../../utils/professionalEvolutionCalculator';

export type AdaptivePersona = 'Executive' | 'Developer' | 'Commercial' | 'HR' | 'Financial' | 'Operations';
export type AdaptiveMoment = 'Onboarding' | 'Sprint' | 'Financial Close' | 'Growth' | 'Execution' | 'Stability';
export type AdaptiveContext = 'Critical' | 'Approval' | 'Meeting' | 'Delivery' | 'Routine';

export interface AdaptivePriorityCard {
  title: string;
  type: string;
  dueLabel: string;
  progress: number;
  teamSize: number;
  urgency: string;
  actionView: string;
}

export interface AdaptiveDailyBriefing {
  greeting: string;
  summary: string;
  keyStats: Array<{ label: string; value: string; accent?: boolean }>;
}

export interface AdaptiveObjectiveItem {
  title: string;
  progress: number;
  impact: string;
  horizon: 'Hoje' | 'Semana' | 'Mês' | 'Trimestre';
}

export interface AdaptiveFeedItem {
  id: string;
  headline: string;
  detail: string;
  timeLabel: string;
  type: 'completion' | 'approval' | 'update' | 'achievement';
}

export interface AdaptiveShortcut {
  label: string;
  description: string;
  view: string;
}

export interface AdaptiveWorkspaceProfile {
  persona: AdaptivePersona;
  moment: AdaptiveMoment;
  context: AdaptiveContext;
  priorityCard: AdaptivePriorityCard;
  dailyBriefing: AdaptiveDailyBriefing;
  objectives: AdaptiveObjectiveItem[];
  activityFeed: AdaptiveFeedItem[];
  shortcuts: AdaptiveShortcut[];
  agendaTimeline: AdaptiveFeedItem[];
  teamHighlights: AdaptiveFeedItem[];
  projectSummary: Array<{ label: string; value: string; status: string }>;
}

const parseRecordDate = (value?: string) => {
  if (!value) return null;
  const normalized = value.replace(/\//g, '-').trim();
  const parts = normalized.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!Number.isNaN(year) && !Number.isNaN(month) && !Number.isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isDoneStatus = (status?: string) => {
  if (!status) return false;
  return /conclu[ií]do|feito|done|completed/i.test(status);
};

const normalizeString = (value?: string) => {
  return (value || '').toLowerCase();
};

const determinePersona = (user: any, dbUser: any, activeWorkspace: any, tasks: any[], projects: any[], finance: any[], notifications: any[]): AdaptivePersona => {
  const hint = normalizeString(activeWorkspace?.settings?.role || dbUser?.role || activeWorkspace?.settings?.department || dbUser?.department || user?.jobTitle || user?.displayName || '');

  if (/ceo|cio|cto|cfo|executive|presidente|president|diretor|director|admin/i.test(hint)) return 'Executive';
  if (/financeir|finance|cfo|faturamento|contas|fluxo/i.test(hint) || finance.length > 6) return 'Financial';
  if (/rh|recursos humanos|people|talent|treinamento/i.test(hint)) return 'HR';
  if (/comercial|vendas|sales|crm|leads|cliente/i.test(hint) || projects.some((p) => /pipeline|cliente|sales|reuni/i.test(normalizeString(p?.name)))) return 'Commercial';
  if (/dev|desenvolv|engenharia|software|tech|programador|programmer|bug|sprint/i.test(hint) || tasks.some((t) => /bug|deploy|commit|pull request|pr|sprint|release/i.test(normalizeString(t?.title || t?.description || t?.type)))) return 'Developer';
  if (/operação|operacional|operations|operational|processo|process/i.test(hint)) return 'Operations';

  const projectSignals = projects.map((p) => normalizeString(p?.name || '')).join(' ');
  if (/financeiro|fluxo|receita|despesa|faturamento/.test(projectSignals)) return 'Financial';
  if (/sprint|bug|release|deploy|pull request|repo|github/.test(projectSignals)) return 'Developer';
  if (/pipeline|cliente|lead|oportunidade/.test(projectSignals)) return 'Commercial';
  if (/onboarding|treinamento|feedback/.test(projectSignals)) return 'HR';

  return 'Operations';
};

const determineMoment = (activeWorkspace: any, tasks: any[], finance: any[], agendaEvents: any[], projects: any[], notifications: any[]): AdaptiveMoment => {
  if (!activeWorkspace?.settings?.onboardingCompleted) return 'Onboarding';

  const overdueTasks = tasks.filter((task) => !isDoneStatus(task?.status) && parseRecordDate(task?.dueDate || task?.deadline) && parseRecordDate(task?.dueDate || task?.deadline)! < new Date()).length;
  const criticalApprovals = notificationsWithType(notifications, 'approval').length;
  const today = new Date();
  const nearDueProjects = projectsWithDueSoon(projects, 7).length;
  const upcomingMeetings = agendaEvents.filter((event) => {
    const date = parseRecordDate(event?.date);
    if (!date) return false;
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }).length;

  if (overdueTasks > 2 || nearDueProjects > 1) return 'Execution';
  if (criticalApprovals > 0) return 'Financial Close';
  if (upcomingMeetings > 2) return 'Sprint';
  if (finance.filter((item) => Number(item?.amount || 0) > 0).length > 8) return 'Growth';
  return 'Stability';
};

const notificationsWithType = (notifications: any[] = [], keyword: string) => {
  return notifications.filter((notification) => {
    const candidate = normalizeString(notification?.type || notification?.title || notification?.message || '');
    return candidate.includes(keyword.toLowerCase());
  });
};

const projectsWithDueSoon = (projects: any[] = [], horizonDays = 7) => {
  const today = new Date();
  return projects.filter((project) => {
    const dueDate = parseRecordDate(project?.dueDate || project?.deadline || project?.due);
    if (!dueDate) return false;
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= horizonDays;
  });
};

const determineContext = (tasks: any[], agendaEvents: any[], notifications: any[]): AdaptiveContext => {
  const overdue = tasks.some((task) => !isDoneStatus(task?.status) && parseRecordDate(task?.dueDate || task?.deadline) && parseRecordDate(task?.dueDate || task?.deadline)! < new Date());
  const approvals = notificationsWithType(notifications, 'approval').length > 0;
  const meetings = agendaEvents.some((event) => {
    const date = parseRecordDate(event?.date);
    return date ? date >= new Date() && date <= new Date(Date.now() + 1000 * 60 * 60 * 24 * 2) : false;
  });
  const deliveries = tasks.some((task) => /release|deploy|entrega|deploy/i.test(normalizeString(task?.title || task?.description || '')));

  if (overdue) return 'Critical';
  if (approvals) return 'Approval';
  if (meetings) return 'Meeting';
  if (deliveries) return 'Delivery';
  return 'Routine';
};

const formatCountdown = (dueDate: Date | null) => {
  if (!dueDate) return 'Sem prazo';
  const now = new Date();
  const days = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return `${Math.abs(days)} dias atrás`;
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Amanhã';
  return `Em ${days} dias`;
};

const buildPriorityCard = (tasks: any[], projects: any[], members: any[]): AdaptivePriorityCard => {
  const today = new Date();
  const openTasks = tasks.filter((task) => !isDoneStatus(task?.status));
  const sortedTasks = [...openTasks].sort((a, b) => {
    const priorityWeight = { Alta: 4, High: 4, Média: 2, Media: 2, Baixa: 1, Low: 1 };
    const aPriority = priorityWeight[a?.priority] || 0;
    const bPriority = priorityWeight[b?.priority] || 0;
    return bPriority - aPriority;
  });
  const urgentTask = sortedTasks.find((task) => /alta|high|critical|crítica|critico/i.test(normalizeString(task?.priority || task?.title || task?.description || '')));

  const lateTask = openTasks.find((task) => {
    const date = parseRecordDate(task?.dueDate || task?.deadline);
    return date && date < today;
  });

  const activeProject = projects.filter((project) => !isDoneStatus(project?.status));
  const soonProject = projectsWithDueSoon(projects, 5)[0];
  const highRiskProject = activeProject.find((project) => project?.status && /atrasad|bloquead|risco/i.test(normalizeString(project?.status)));

  if (lateTask) {
    const due = parseRecordDate(lateTask?.dueDate || lateTask?.deadline);
    return {
      title: lateTask?.title || 'Ação urgente de tarefa',
      type: 'Tarefa Atrasada',
      dueLabel: formatCountdown(due),
      progress: Number(lateTask?.progress || 0),
      teamSize: members.length,
      urgency: 'Crítico',
      actionView: 'projetos'
    };
  }

  if (urgentTask) {
    const due = parseRecordDate(urgentTask?.dueDate || urgentTask?.deadline);
    return {
      title: urgentTask?.title || 'Ação prioritária',
      type: 'Tarefa Crítica',
      dueLabel: formatCountdown(due),
      progress: Number(urgentTask?.progress || 0),
      teamSize: members.length,
      urgency: 'Alta',
      actionView: 'projetos'
    };
  }

  if (highRiskProject) {
    const due = parseRecordDate(highRiskProject?.dueDate || highRiskProject?.deadline);
    return {
      title: highRiskProject?.name || 'Projeto crítico',
      type: 'Projeto em risco',
      dueLabel: formatCountdown(due),
      progress: Number(highRiskProject?.progress || 0),
      teamSize: highRiskProject?.teamSize || members.length,
      urgency: 'Risco',
      actionView: 'projetos'
    };
  }

  if (soonProject) {
    const due = parseRecordDate(soonProject?.dueDate || soonProject?.deadline);
    return {
      title: soonProject?.name || 'Entrega próxima',
      type: 'Prazo próximo',
      dueLabel: formatCountdown(due),
      progress: Number(soonProject?.progress || 0),
      teamSize: soonProject?.teamSize || members.length,
      urgency: 'Médio',
      actionView: 'projetos'
    };
  }

  return {
    title: 'Acompanhar entregas estratégicas',
    type: 'Prioridade Geral',
    dueLabel: 'Esta semana',
    progress: 68,
    teamSize: members.length,
    urgency: 'Normal',
    actionView: 'projetos'
  };
};

const buildDailyBriefing = (user: any, tasks: any[], agendaEvents: any[], notifications: any[], projects: any[], finance: any[]): AdaptiveDailyBriefing => {
  const greeting = `Bom dia ${user?.displayName || user?.email?.split('@')[0] || 'Colaborador'}`;
  const overdueTasks = tasks.filter((task) => !isDoneStatus(task?.status) && parseRecordDate(task?.dueDate || task?.deadline) && parseRecordDate(task?.dueDate || task?.deadline)! < new Date()).length;
  const criticalTasks = tasks.filter((task) => /alta|high|critical|crítica|critico/i.test(normalizeString(task?.priority || ''))).length;
  const meetings = agendaEvents.filter((event) => {
    const date = parseRecordDate(event?.date);
    return date && date >= new Date() && date <= new Date(Date.now() + 1000 * 60 * 60 * 24);
  }).length;
  const approvals = notificationsWithType(notifications, 'approval').length;
  const risk = projects.filter((project) => /risco|atrasad|bloquead/.test(normalizeString(project?.status))).length;
  const revenue = finance.filter((entry) => normalizeString(entry?.type || '').includes('receita')).reduce((sum, entry) => sum + Number(entry?.amount || 0), 0);

  return {
    greeting,
    summary: `Hoje você tem ${criticalTasks} itens críticos, ${meetings} reuniões agendadas e ${approvals} aprovações pendentes. São ${overdueTasks} pendências atrasadas e ${risk} projetos com atenção prioritária.`,
    keyStats: [
      { label: 'Tarefas críticas', value: `${criticalTasks}` },
      { label: 'Reuniões hoje', value: `${meetings}` },
      { label: 'Aprovações', value: `${approvals}` },
      { label: 'Receita monitorada', value: `R$ ${Number(revenue || 0).toLocaleString('pt-BR')}`, accent: true }
    ]
  };
};

const buildObjectives = (tasks: any[], projects: any[]) => {
  const openTasks = tasks.filter((task) => !isDoneStatus(task?.status));
  const topTasks = openTasks.slice(0, 3).map((task, index): AdaptiveObjectiveItem => ({
    title: task?.title || `Meta ${index + 1}`,
    progress: Number(task?.progress || 0),
    impact: /alta|high/i.test(normalizeString(task?.priority || '')) ? 'Alto' : 'Médio',
    horizon: task?.dueDate ? 'Semana' : index === 0 ? 'Hoje' : 'Mês'
  }));
  const openProjects = projects.filter((project) => !isDoneStatus(project?.status)).slice(0, 2).map((project, index): AdaptiveObjectiveItem => ({
    title: project?.name || `Projeto ${index + 1}`,
    progress: Number(project?.progress || 0),
    impact: /risco|atrasad|bloquead/.test(normalizeString(project?.status)) ? 'Alto' : 'Médio',
    horizon: (/próximo|soon|amanhã/i.test(normalizeString(project?.dueDate || project?.deadline || '')) ? 'Semana' : 'Mês') as 'Hoje' | 'Semana' | 'Mês' | 'Trimestre'
  }));

  return [...topTasks, ...openProjects].slice(0, 4);
};

const buildActivityFeed = (notifications: any[], tasks: any[], projects: any[]): AdaptiveFeedItem[] => {
  const notificationItems: AdaptiveFeedItem[] = notifications.slice(-5).map((notification: any, index: number) => ({
    id: `notif-${index}-${notification?.id || 'x'}`,
    headline: notification?.title || notification?.message || 'Atualização importante',
    detail: notification?.detail || notification?.summary || 'Ação relevante disponível.',
    timeLabel: notification?.time || notification?.createdAt || 'Agora',
    type: /aprov/i.test(normalizeString(notification?.type || notification?.title || notification?.message)) ? 'approval' : 'update'
  }));

  if (notificationItems.length >= 4) return notificationItems;

  const taskItems: AdaptiveFeedItem[] = tasks.filter((task) => !isDoneStatus(task?.status)).slice(0, 4 - notificationItems.length).map((task: any, index: number) => ({
    id: `task-${index}-${task?.id || 'x'}`,
    headline: task?.title || 'Tarefa em atraso',
    detail: `Prioridade ${task?.priority || 'Normal'} • ${task?.status || 'Aberta'}`,
    timeLabel: task?.dueDate || task?.deadline || 'Sem prazo',
    type: /alta|high|critical/i.test(normalizeString(task?.priority || '')) ? 'completion' : 'update'
  }));

  return [...notificationItems, ...taskItems].slice(0, 6) as AdaptiveFeedItem[];
};

const buildAgendaTimeline = (agendaEvents: any[]): AdaptiveFeedItem[] => {
  const now = new Date();
  return agendaEvents
    .map((event: any, index: number): AdaptiveFeedItem => ({
      id: `agenda-${index}-${event?.id || 'x'}`,
      headline: event?.title || 'Evento de agenda',
      detail: event?.description || event?.type || 'Compromisso agendado',
      timeLabel: event?.startTime ? `${event.startTime} • ${event.date}` : event?.date || 'Sem data',
      type: 'update'
    }))
    .filter((item) => parseRecordDate(item.timeLabel) ? parseRecordDate(item.timeLabel)! >= now : true)
    .slice(0, 5);
};

const buildTeamHighlights = (notifications: any[], members: any[]): AdaptiveFeedItem[] => {
  const performance: AdaptiveFeedItem[] = notifications.filter((notification) => /concluiu|terminou|aprovou|ganhou|evoluiu/i.test(normalizeString(notification?.title || notification?.message || ''))).slice(-4).map((notification: any, index: number) => ({
    id: `team-${index}-${notification?.id || 'x'}`,
    headline: notification?.title || 'Equipe atualizou',
    detail: notification?.message || notification?.summary || 'Nova atividade de equipe registrada.',
    timeLabel: notification?.time || notification?.createdAt || 'Recentemente',
    type: /ganhou|concluiu|evoluiu/i.test(normalizeString(notification?.title || notification?.message || '')) ? 'achievement' : 'update'
  }));

  if (performance.length > 0) return performance;

  return members.slice(0, 4).map((member: any, index: number) => ({
    id: `member-${index}-${member?.id || 'x'}`,
    headline: member?.name || member?.email || 'Novo integrante',
    detail: member?.role ? `${member.role} • ativo` : 'Atualização de equipe disponível',
    timeLabel: 'Hoje',
    type: 'update'
  }));
};

const buildShortcuts = (projects: any[], finance: any[], agendaEvents: any[], tasks: any[]) => {
  const shortcuts: AdaptiveShortcut[] = [];
  if (projects.length > 0) shortcuts.push({ label: 'Projetos', description: 'Acesse entregas e status de sprint.', view: 'projetos' });
  if (finance.length > 0) shortcuts.push({ label: 'Financeiro', description: 'Ver fluxo de receitas e despesas.', view: 'financeiro' });
  if (agendaEvents.length > 0) shortcuts.push({ label: 'Agenda', description: 'Reuniões e prazos do dia.', view: 'agenda' });
  if (tasks.some((task) => /aprov/i.test(normalizeString(task?.title || task?.description || '')))) shortcuts.push({ label: 'Aprovações', description: 'Itens que precisam da sua decisão.', view: 'projetos' });
  if (shortcuts.length < 4) {
    shortcuts.push({ label: 'Career Hub', description: 'Seu desenvolvimento e ranking profissional.', view: 'career-hub' });
  }
  if (shortcuts.length < 4) {
    shortcuts.push({ label: 'Equipe', description: 'Ver o estado da sua equipe.', view: 'equipe' });
  }
  return shortcuts.slice(0, 5);
};

const buildProjectSummary = (projects: any[]) => {
  const active = projects.filter((project) => !isDoneStatus(project?.status)).length;
  const blocked = projects.filter((project) => /bloquead|risco|atrasad/i.test(normalizeString(project?.status))).length;
  const completed = projects.filter((project) => isDoneStatus(project?.status)).length;

  return [
    { label: 'Em andamento', value: `${active}`, status: 'Atenção' },
    { label: 'Bloqueados', value: `${blocked}`, status: 'Crítico' },
    { label: 'Concluídos recentemente', value: `${completed}`, status: 'Estável' }
  ];
};

export function buildAdaptiveWorkspaceProfile(inputs: {
  user: any;
  dbUser: any;
  activeWorkspace: any;
  projects: any[];
  tasks: any[];
  finance: any[];
  agendaEvents: any[];
  clients: any[];
  members: any[];
  ideas: any[];
  notifications: any[];
}): AdaptiveWorkspaceProfile {
  const { user, dbUser, activeWorkspace, projects, tasks, finance, agendaEvents, notifications, members } = inputs;
  const persona = determinePersona(user, dbUser, activeWorkspace, tasks, projects, finance, notifications);
  const moment = determineMoment(activeWorkspace, tasks, finance, agendaEvents, projects, notifications);
  const context = determineContext(tasks, agendaEvents, notifications);
  const priorityCard = buildPriorityCard(tasks, projects, members);
  const dailyBriefing = buildDailyBriefing(user, tasks, agendaEvents, notifications, projects, finance);
  const objectives = buildObjectives(tasks, projects);
  const activityFeed = buildActivityFeed(notifications, tasks, projects);
  const agendaTimeline = buildAgendaTimeline(agendaEvents);
  const teamHighlights = buildTeamHighlights(notifications, members);
  const shortcuts = buildShortcuts(projects, finance, agendaEvents, tasks);
  const projectSummary = buildProjectSummary(projects);

  return {
    persona,
    moment,
    context,
    priorityCard,
    dailyBriefing,
    objectives,
    activityFeed,
    agendaTimeline,
    teamHighlights,
    shortcuts,
    projectSummary
  };
}
