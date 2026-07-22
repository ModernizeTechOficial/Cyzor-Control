import { getProfessionalEvolutionInfo } from '../../utils/professionalEvolutionCalculator';

export type AdaptiveWorkspaceType = 'OWNER' | 'MANAGER' | 'EMPLOYEE' | 'PERSONAL';
export type AdaptiveRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'CUSTOM';
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

export interface AdaptiveWidgetDefinition {
  id: string;
  name: string;
  priority: number;
  permissions: string[];
  workspaceAllowed: AdaptiveWorkspaceType[];
  persona: AdaptivePersona[];
  department?: string[];
  position: 'hero' | 'priority' | 'pendencies' | 'agenda' | 'career' | 'team' | 'projects' | 'objectives' | 'feed' | 'insights';
  weight: number;
  responsive: string;
  conditions: string[];
}

export interface AdaptiveWorkspaceProfile {
  workspaceType: AdaptiveWorkspaceType;
  workspaceTypeLabel: string;
  role: AdaptiveRole;
  department: string;
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
  personaHighlights: Array<{ label: string; value: string; status: string }>;
  widgetLayout: AdaptiveWidgetDefinition[];
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

const getCurrentMembership = (members: any[] = [], user: any) => {
  const currentUid = user?.uid || user?.id;
  const currentEmail = user?.email?.toLowerCase();

  return members.find((member) => {
    const memberUid = member?.userUid || member?.uid || member?.id;
    const memberEmail = member?.email?.toLowerCase();
    return memberUid === currentUid || memberEmail === currentEmail;
  }) || null;
};

const determineWorkspaceType = (user: any, activeWorkspace: any, members: any[]): AdaptiveWorkspaceType => {
  if (!user || !activeWorkspace) return 'PERSONAL';

  const currentMembership = getCurrentMembership(members, user);
  const roleHint = normalizeString(currentMembership?.role || activeWorkspace?.settings?.role || activeWorkspace?.settings?.workspaceRole || '');
  const cargoHint = normalizeString(currentMembership?.cargo || activeWorkspace?.settings?.department || user?.jobTitle || '');

  if (roleHint.includes('owner') || activeWorkspace?.ownerUid === user?.uid) return 'OWNER';
  if (/admin|manager|coordenador|coordinate|lider|lead|director|executive/i.test(roleHint) || /manager|coordenador|lider|head|director|executive/i.test(cargoHint)) return 'MANAGER';
  if (currentMembership?.role || roleHint || cargoHint) return 'EMPLOYEE';

  return 'PERSONAL';
};

const determineRole = (user: any, activeWorkspace: any, members: any[]): AdaptiveRole => {
  const currentMembership = getCurrentMembership(members, user);
  const roleHint = normalizeString(currentMembership?.role || activeWorkspace?.settings?.role || activeWorkspace?.settings?.workspaceRole || '');

  if (/owner/i.test(roleHint) || activeWorkspace?.ownerUid === user?.uid) return 'OWNER';
  if (/admin/i.test(roleHint)) return 'ADMIN';
  if (/manager|coordenador|lider|director|head/i.test(roleHint)) return 'MANAGER';
  if (currentMembership || activeWorkspace) return 'MEMBER';
  return 'CUSTOM';
};

const determineDepartment = (user: any, activeWorkspace: any, members: any[]): string => {
  const currentMembership = getCurrentMembership(members, user);
  const hint = normalizeString(currentMembership?.cargo || activeWorkspace?.settings?.department || user?.jobTitle || activeWorkspace?.settings?.role || '');

  if (/dev|desenvolv|engenharia|software|tech|programador|engineer/i.test(hint)) return 'Engineering';
  if (/financeir|finance|contas|receita|fluxo/i.test(hint)) return 'Finance';
  if (/rh|human|talent|people/i.test(hint)) return 'HR';
  if (/comercial|sales|vendas|crm|cliente|lead/i.test(hint)) return 'Commercial';
  if (/opera|operations|operational|process/i.test(hint)) return 'Operations';
  return currentMembership?.cargo || 'General';
};

const determinePersona = (user: any, dbUser: any, activeWorkspace: any, tasks: any[], projects: any[], finance: any[], notifications: any[], members: any[]): AdaptivePersona => {
  const currentMembership = getCurrentMembership(members, user);
  const hint = normalizeString(currentMembership?.cargo || activeWorkspace?.settings?.role || dbUser?.role || activeWorkspace?.settings?.department || dbUser?.department || user?.jobTitle || user?.displayName || '');

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

  return currentMembership?.cargo ? 'Operations' : 'Executive';
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

const buildDailyBriefing = (user: any, tasks: any[], agendaEvents: any[], notifications: any[], projects: any[], finance: any[], workspaceType: AdaptiveWorkspaceType, persona: AdaptivePersona): AdaptiveDailyBriefing => {
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

  const workspaceSummaryByType: Record<AdaptiveWorkspaceType, string> = {
    OWNER: `Você está no centro de comando da empresa. Fique atento a ${approvals} aprovações, ${risk} projetos críticos e ao balanço de ${Number(revenue || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em movimento.`,
    MANAGER: `Seu foco hoje é liderar execução e desempenho da equipe com ${criticalTasks} tarefas críticas e ${meetings} reuniões relevantes no calendário.`,
    EMPLOYEE: `Hoje seu ritmo está concentrado em entregar ${criticalTasks} prioridades, manter ${meetings} compromissos e desbloquear pendências do dia.`,
    PERSONAL: `Seu espaço pessoal está organizado para foco, objetivos e documentação com ${criticalTasks} prioridades de execução.`,
  };

  return {
    greeting,
    summary: workspaceSummaryByType[workspaceType] || workspaceSummaryByType.EMPLOYEE,
    keyStats: [
      { label: 'Tarefas críticas', value: `${criticalTasks}` },
      { label: 'Reuniões hoje', value: `${meetings}` },
      { label: 'Aprovações', value: `${approvals}` },
      { label: persona === 'Financial' ? 'Receita monitorada' : 'XP do dia', value: persona === 'Financial' ? `R$ ${Number(revenue || 0).toLocaleString('pt-BR')}` : `${Math.max(120, overdueTasks * 40 + criticalTasks * 25)} XP`, accent: true }
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

const buildShortcuts = (projects: any[], finance: any[], agendaEvents: any[], tasks: any[], workspaceType: AdaptiveWorkspaceType) => {
  const shortcuts: AdaptiveShortcut[] = [];

  if (workspaceType === 'OWNER') {
    shortcuts.push({ label: 'Business Overview', description: 'Visão executiva da companhia.', view: 'empresas' });
    shortcuts.push({ label: 'Financeiro', description: 'Fluxo, pagamentos e caixa.', view: 'financeiro' });
    shortcuts.push({ label: 'Projetos Estratégicos', description: 'Entregas e riscos críticos.', view: 'projetos' });
    shortcuts.push({ label: 'Equipe', description: 'Capacidade e saúde da organização.', view: 'equipe' });
    shortcuts.push({ label: 'Agenda Executiva', description: 'Compromissos e decisões.', view: 'agenda' });
  } else if (workspaceType === 'MANAGER') {
    shortcuts.push({ label: 'Equipe', description: 'Status e performance da sua área.', view: 'equipe' });
    shortcuts.push({ label: 'Projetos', description: 'Entregas e risco da equipe.', view: 'projetos' });
    shortcuts.push({ label: 'Agenda', description: 'Reuniões e alinhamentos.', view: 'agenda' });
    shortcuts.push({ label: 'Career Hub', description: 'Evolução da equipe e objetivos.', view: 'career-hub' });
    shortcuts.push({ label: 'Aprovações', description: 'Pendências de decisão.', view: 'projetos' });
  } else if (workspaceType === 'PERSONAL') {
    shortcuts.push({ label: 'Projetos', description: 'Organização pessoal e entregas.', view: 'projetos' });
    shortcuts.push({ label: 'Agenda', description: 'Compromissos pessoais.', view: 'agenda' });
    shortcuts.push({ label: 'Career Hub', description: 'Desenvolvimento individual.', view: 'career-hub' });
    shortcuts.push({ label: 'Documentação', description: 'Base e memory do seu trabalho.', view: 'documentacao' });
    shortcuts.push({ label: 'IA', description: 'Assistência contextual.', view: 'ia' });
  } else {
    shortcuts.push({ label: 'Minha Prioridade', description: 'Tarefas e foco do dia.', view: 'projetos' });
    shortcuts.push({ label: 'Agenda', description: 'Reuniões e entregas.', view: 'agenda' });
    shortcuts.push({ label: 'Projetos', description: 'Status das iniciativas do seu papel.', view: 'projetos' });
    shortcuts.push({ label: 'Career Hub', description: 'Seu crescimento profissional.', view: 'career-hub' });
    shortcuts.push({ label: 'Documentação', description: 'Artigos recentes e contexto.', view: 'documentacao' });
  }

  if (finance.length > 0 && workspaceType !== 'PERSONAL' && workspaceType !== 'EMPLOYEE') {
    shortcuts.push({ label: 'Financeiro', description: 'Monitoramento financeiro estratégico.', view: 'financeiro' });
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

const buildPersonaHighlights = (persona: AdaptivePersona, tasks: any[], projects: any[], finance: any[], members: any[], notifications: any[], agendaEvents: any[]) => {
  const openTasks = tasks.filter((task) => !isDoneStatus(task?.status));
  const blockedProjects = projects.filter((project) => /bloquead|risco|atrasad/i.test(normalizeString(project?.status))).length;
  const activeProjects = projects.filter((project) => !isDoneStatus(project?.status)).length;
  const approvalCount = notificationsWithType(notifications, 'approval').length;
  const nextMeetings = agendaEvents.filter((event) => {
    const date = parseRecordDate(event?.date);
    if (!date) return false;
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }).length;
  const revenue = finance.reduce((sum, item) => sum + Number(item?.amount || 0), 0);

  if (persona === 'Developer') {
    return [
      { label: 'Tarefas abertas', value: `${openTasks.length}`, status: 'Entrega' },
      { label: 'Riscos/bugs', value: `${openTasks.filter((task) => /bug|risco|falha|erro/i.test(normalizeString(task?.title || task?.description || ''))).length}`, status: 'Crítico' },
      { label: 'Sprint ativa', value: `${activeProjects}`, status: 'Execução' }
    ];
  }

  if (persona === 'Commercial') {
    return [
      { label: 'Pipeline', value: `${projects.length}`, status: 'Oportunidade' },
      { label: 'Reuniões próximas', value: `${nextMeetings}`, status: 'Relacionamento' },
      { label: 'Ações críticas', value: `${approvalCount}`, status: 'Conversão' }
    ];
  }

  if (persona === 'HR') {
    return [
      { label: 'Pessoas no time', value: `${members.length}`, status: 'Capacidade' },
      { label: 'Ações de RH', value: `${notifications.length}`, status: 'Clima' },
      { label: 'Foco de desenvolvimento', value: `${openTasks.length}`, status: 'People' }
    ];
  }

  if (persona === 'Financial') {
    return [
      { label: 'Receita monitorada', value: `R$ ${revenue.toLocaleString('pt-BR')}`, status: 'Fluxo' },
      { label: 'Aprovações pendentes', value: `${approvalCount}`, status: 'Decisão' },
      { label: 'Projetos bloqueados', value: `${blockedProjects}`, status: 'Risco' }
    ];
  }

  if (persona === 'Operations') {
    return [
      { label: 'Projetos ativos', value: `${activeProjects}`, status: 'Operação' },
      { label: 'Bloqueios', value: `${blockedProjects}`, status: 'Crítico' },
      { label: 'Agenda em 3 dias', value: `${nextMeetings}`, status: 'Coordenação' }
    ];
  }

  return [
    { label: 'Prioridade atual', value: `${openTasks.length}`, status: 'Direção' },
    { label: 'Projetos em execução', value: `${activeProjects}`, status: 'Estratégia' },
    { label: 'Ações de decisão', value: `${approvalCount}`, status: 'Governança' }
  ];
};

const buildWidgetCatalog = (workspaceType: AdaptiveWorkspaceType, persona: AdaptivePersona, department: string): AdaptiveWidgetDefinition[] => {
  const widgetBase: AdaptiveWidgetDefinition[] = [
    { id: 'hero', name: 'Hero Principal', priority: 100, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'hero', weight: 100, responsive: 'all', conditions: ['always'] },
    { id: 'priority-current', name: 'Prioridade Atual', priority: 95, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'priority', weight: 95, responsive: 'lg', conditions: ['hasPriority'] },
    { id: 'pendencies', name: 'Pendências', priority: 90, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'pendencies', weight: 90, responsive: 'md', conditions: ['hasPending'] },
    { id: 'agenda', name: 'Agenda', priority: 85, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'agenda', weight: 85, responsive: 'md', conditions: ['hasAgenda'] },
    { id: 'career-hub', name: 'Career Hub', priority: 80, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'career', weight: 80, responsive: 'sm', conditions: ['always'] },
    { id: 'team', name: 'Equipe', priority: 75, permissions: ['manager', 'owner', 'admin'], workspaceAllowed: ['OWNER', 'MANAGER'], persona: ['Executive', 'HR', 'Operations'], position: 'team', weight: 75, responsive: 'lg', conditions: ['hasTeam'] },
    { id: 'projects', name: 'Projetos', priority: 70, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'Operations'], position: 'projects', weight: 70, responsive: 'md', conditions: ['hasProjects'] },
    { id: 'objectives', name: 'Objetivos', priority: 65, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'objectives', weight: 65, responsive: 'md', conditions: ['hasObjectives'] },
    { id: 'feed', name: 'Feed Corporativo', priority: 60, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'feed', weight: 60, responsive: 'lg', conditions: ['hasFeed'] },
    { id: 'insights', name: 'Insights', priority: 55, permissions: ['all'], workspaceAllowed: ['OWNER', 'MANAGER', 'EMPLOYEE', 'PERSONAL'], persona: ['Executive', 'Developer', 'Commercial', 'HR', 'Financial', 'Operations'], position: 'insights', weight: 55, responsive: 'lg', conditions: ['hasInsights'] },
  ];

  const personaLayoutByRole: Record<AdaptivePersona, AdaptiveWidgetDefinition['position'][]> = {
    Executive: ['hero', 'priority', 'projects', 'objectives', 'feed', 'insights', 'agenda', 'team'],
    Developer: ['hero', 'priority', 'projects', 'pendencies', 'objectives', 'feed', 'insights', 'agenda'],
    Commercial: ['hero', 'priority', 'projects', 'objectives', 'feed', 'insights', 'agenda'],
    HR: ['hero', 'team', 'objectives', 'career', 'feed', 'insights', 'agenda'],
    Financial: ['hero', 'priority', 'pendencies', 'agenda', 'projects', 'feed', 'insights'],
    Operations: ['hero', 'priority', 'projects', 'agenda', 'feed', 'insights', 'team'],
  };

  const personaSpecificRules: AdaptiveWidgetDefinition[] = [];

  if (persona === 'Developer') {
    personaSpecificRules.push(
      { id: 'developer-sprint', name: 'Sprint', priority: 92, permissions: ['developer'], workspaceAllowed: ['EMPLOYEE'], persona: ['Developer'], position: 'projects', weight: 92, responsive: 'md', conditions: ['hasSprint'] },
      { id: 'developer-bugs', name: 'Bugs / Riscos', priority: 88, permissions: ['developer'], workspaceAllowed: ['EMPLOYEE'], persona: ['Developer'], position: 'pendencies', weight: 88, responsive: 'md', conditions: ['hasBugs'] }
    );
  }

  if (persona === 'Commercial') {
    personaSpecificRules.push(
      { id: 'commercial-pipeline', name: 'Pipeline', priority: 92, permissions: ['sales'], workspaceAllowed: ['EMPLOYEE'], persona: ['Commercial'], position: 'projects', weight: 92, responsive: 'md', conditions: ['hasPipeline'] },
      { id: 'commercial-leads', name: 'Leads', priority: 88, permissions: ['sales'], workspaceAllowed: ['EMPLOYEE'], persona: ['Commercial'], position: 'priority', weight: 88, responsive: 'md', conditions: ['hasLeads'] }
    );
  }

  if (persona === 'HR') {
    personaSpecificRules.push(
      { id: 'hr-evaluations', name: 'Avaliações', priority: 92, permissions: ['hr'], workspaceAllowed: ['EMPLOYEE'], persona: ['HR'], position: 'team', weight: 92, responsive: 'md', conditions: ['hasEvaluations'] },
      { id: 'hr-training', name: 'Treinamentos', priority: 88, permissions: ['hr'], workspaceAllowed: ['EMPLOYEE'], persona: ['HR'], position: 'career', weight: 88, responsive: 'md', conditions: ['hasTraining'] }
    );
  }

  if (persona === 'Financial') {
    personaSpecificRules.push(
      { id: 'finance-approvals', name: 'Aprovações Financeiras', priority: 92, permissions: ['finance'], workspaceAllowed: ['EMPLOYEE'], persona: ['Financial'], position: 'pendencies', weight: 92, responsive: 'md', conditions: ['hasApprovals'] },
      { id: 'finance-payments', name: 'Pagamentos', priority: 88, permissions: ['finance'], workspaceAllowed: ['EMPLOYEE'], persona: ['Financial'], position: 'agenda', weight: 88, responsive: 'md', conditions: ['hasPayments'] }
    );
  }

  const departmentSpecific = department.toLowerCase();
  const allowedPositions = new Set(personaLayoutByRole[persona] || personaLayoutByRole.Executive);

  const widgets = [...widgetBase, ...personaSpecificRules].filter((widget) => {
    if (!widget.workspaceAllowed.includes(workspaceType)) return false;
    if (!widget.persona.includes(persona)) return false;
    if (!allowedPositions.has(widget.position)) return false;
    if (widget.department && !widget.department.some((item) => item.toLowerCase() === departmentSpecific)) {
      return false;
    }
    return true;
  });

  return widgets.sort((a, b) => {
    const aIndex = personaLayoutByRole[persona].indexOf(a.position);
    const bIndex = personaLayoutByRole[persona].indexOf(b.position);
    return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex) || b.priority - a.priority;
  });
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
  const workspaceType = determineWorkspaceType(user, activeWorkspace, members);
  const role = determineRole(user, activeWorkspace, members);
  const department = determineDepartment(user, activeWorkspace, members);
  const persona = determinePersona(user, dbUser, activeWorkspace, tasks, projects, finance, notifications, members);
  const moment = determineMoment(activeWorkspace, tasks, finance, agendaEvents, projects, notifications);
  const context = determineContext(tasks, agendaEvents, notifications);
  const priorityCard = buildPriorityCard(tasks, projects, members);
  const dailyBriefing = buildDailyBriefing(user, tasks, agendaEvents, notifications, projects, finance, workspaceType, persona);
  const objectives = buildObjectives(tasks, projects);
  const activityFeed = buildActivityFeed(notifications, tasks, projects);
  const agendaTimeline = buildAgendaTimeline(agendaEvents);
  const teamHighlights = buildTeamHighlights(notifications, members);
  const shortcuts = buildShortcuts(projects, finance, agendaEvents, tasks, workspaceType);
  const projectSummary = buildProjectSummary(projects);
  const personaHighlights = buildPersonaHighlights(persona, tasks, projects, finance, members, notifications, agendaEvents);
  const widgetLayout = buildWidgetCatalog(workspaceType, persona, department);

  return {
    workspaceType,
    workspaceTypeLabel: {
      OWNER: 'Owner Workspace',
      MANAGER: 'Manager Workspace',
      EMPLOYEE: 'Employee Workspace',
      PERSONAL: 'Personal Workspace'
    }[workspaceType],
    role,
    department,
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
    projectSummary,
    personaHighlights,
    widgetLayout
  };
}
