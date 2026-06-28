import { ProjectExtended, Task, Sprint, Milestone, ProjectMember, ProjectDoc, Comment, Activity } from '../types/project';

export const getProjectPrepopulated = (p: any): ProjectExtended => {
  if (p && p.hasFullData) return p;

  // Tasks based on projects
  let defaultTasks: Task[] = [];
  let defaultSprints: Sprint[] = [
    { id: 1, name: 'Sprint 01', goal: 'Configuração Inicial e Alinhamento de Protótipos', startDate: '01 Jun', endDate: '14 Jun', status: 'Finalizada' },
    { id: 2, name: 'Sprint 02', goal: 'Integração de APIs Core e UI Componentization', startDate: '15 Jun', endDate: '28 Jun', status: 'Ativa' },
    { id: 3, name: 'Sprint 03', goal: 'Testes de Integração e Homologação de Segurança', startDate: '29 Jun', endDate: '12 Jul', status: 'Planejada' },
  ];
  let defaultMilestones: Milestone[] = [];
  let defaultTeam: ProjectMember[] = [];
  let defaultDocs: ProjectDoc[] = [];
  let defaultComments: Comment[] = [];
  let defaultHistory: Activity[] = [];

  const defaultVelocity = [
    { sprint: 'Sprint 01', pts: 32 },
    { sprint: 'Sprint 02', pts: 41 },
    { sprint: 'Sprint 03', pts: 38 }
  ];

  if (p.name.toLowerCase().includes('dashboard') || p.name.includes('Redesign')) {
    defaultTasks = [
      { id: 101, name: 'Criar Mockups de Alta Fidelidade no Figma', assignee: 'Sarah J.', priority: 'Alta', column: 'done', sprintId: 1, tags: ['UI/UX', 'Design'], dueDate: '10 Jun', dependencies: [] },
      { id: 102, name: 'Estruturar Layout Base e Menu Lateral Responsivo', assignee: 'Julia M.', priority: 'Média', column: 'done', sprintId: 1, tags: ['Frontend'], dueDate: '14 Jun', dependencies: [101] },
      { id: 103, name: 'Integrar Gráficos com Recharts & Data Provider', assignee: 'Sarah J.', priority: 'Alta', column: 'in_progress', sprintId: 2, tags: ['Frontend', 'Charts'], dueDate: '22 Jun', dependencies: [102] },
      { id: 104, name: 'Criar Filtro de Fluxos de Data Global', assignee: 'Mike R.', priority: 'Média', column: 'todo', sprintId: 2, tags: ['Frontend', 'Filtro'], dueDate: '26 Jun', dependencies: [103] },
      { id: 105, name: 'Ajustar Otimização de Performance e Memoização', assignee: 'Julia M.', priority: 'Baixa', column: 'todo', sprintId: 3, tags: ['Refactor'], dueDate: '02 Jul', dependencies: [103] },
    ];
    defaultMilestones = [
      { id: 101, title: 'Definição de Design System', desc: 'Aprovação dos componentes visuais e paleta', date: '08 Jun', status: 'Concluído' },
      { id: 102, title: 'Protótipos Homologados', desc: 'Mockups validados pelo comitê regional', date: '15 Jun', status: 'Concluído' },
      { id: 103, title: 'Versão de Pré-produção', desc: 'Integração de APIs concluída e testes de UX', date: '28 Jun', status: 'Em Andamento' },
      { id: 104, title: 'Publicação Oficial (Go Live)', desc: 'Deploy final em produção com verificação SSL', date: '10 Jul', status: 'Pendente' },
    ];
    defaultTeam = [
      { name: 'Sarah J.', role: 'Lead UI/UX Designer', allocation: 90, avatar: 'SJ' },
      { name: 'Julia M.', role: 'Lead Frontend Developer', allocation: 70, avatar: 'JM' },
      { name: 'Mike R.', role: 'Senior Backend Architect', allocation: 40, avatar: 'MR' },
    ];
    defaultDocs = [
      { id: 101, title: 'Termo de Aceite de Escopo - Dashboard Redesign', category: 'Contratos', size: '1.8 MB', uploadedBy: 'Sarah J.', date: '01 Jun 2026' },
      { id: 102, title: 'Especificação de Fluxos, Widgets & Gráficos', category: 'Escopo', size: '2.5 MB', uploadedBy: 'Sarah J.', date: '04 Jun 2026' },
      { id: 103, title: 'UX Design System Guide & StyleGuide', category: 'Design', size: '12.4 MB', uploadedBy: 'Julia M.', date: '11 Jun 2026' },
    ];
    defaultComments = [
      { id: 101, author: 'Sarah J.', text: 'Protótipos aprovados na reunião de ontem. Interface pronta para codificação.', time: 'Ontem, 16:30' },
      { id: 102, author: 'Julia M.', text: 'Excelente! Já registrei o setup base e os estilos iniciais do Tailwind.', time: 'Ontem, 17:00' },
    ];
    defaultHistory = [
      { id: 101, user: 'Sarah J.', action: 'criou e modelou o backlog da iniciativa', time: '01 Jun, 10:00' },
      { id: 102, user: 'Julia M.', action: 'anexou o documento do StyleGuide', time: '11 Jun, 14:15' },
      { id: 103, user: 'Sarah J.', action: 'moveu tarefa "Figma mockups" para Concluído', time: '12 Jun, 09:30' },
    ];
  } else if (p.name.toLowerCase().includes('api v3') || p.name.includes('API')) {
    defaultTasks = [
      { id: 201, name: 'Definição do Schema de Modelagem SQL', assignee: 'Alex B.', priority: 'Alta', column: 'done', sprintId: 1, tags: ['Database'], dueDate: '05 Jun', dependencies: [] },
      { id: 202, name: 'Estruturação da Documentação Swagger (OpenAPI)', assignee: 'Mike R.', priority: 'Média', column: 'done', sprintId: 1, tags: ['Backend'], dueDate: '10 Jun', dependencies: [201] },
      { id: 203, name: 'Integração de Autenticação OAuth2 Server-side', assignee: 'Mike R.', priority: 'Alta', column: 'in_progress', sprintId: 2, tags: ['Security', 'OAuth'], dueDate: '20 Jun', dependencies: [202] },
      { id: 204, name: 'Construção do Endpoint de Estatísticas da API', assignee: 'Carlos T.', priority: 'Média', column: 'todo', sprintId: 2, tags: ['Backend'], dueDate: '26 Jun', dependencies: [203] },
      { id: 205, name: 'Performance Stress Tests usando K6', assignee: 'Alex B.', priority: 'Alta', column: 'todo', sprintId: 3, tags: ['DevOps', 'stress'], dueDate: '02 Jul', dependencies: [203] },
    ];
    defaultMilestones = [
      { id: 201, title: 'Schema de Banco Homologado', desc: 'Migrações SQLite revisadas por DBA', date: '06 Jun', status: 'Concluído' },
      { id: 202, title: 'Assinatura dos Endpoints (Swagger)', desc: 'Validado pelos integradores externos', date: '12 Jun', status: 'Concluído' },
      { id: 203, title: 'Staging Integration complete', desc: 'Serviços conectados e prontos para teste de carga', date: '25 Jun', status: 'Em Andamento' },
      { id: 204, title: 'Lançamento e Chaveamento V3', desc: 'Deploy final e desativação do gateway V2', date: '15 Jul', status: 'Pendente' },
    ];
    defaultTeam = [
      { name: 'Mike R.', role: 'Senior Backend Engineer', allocation: 100, avatar: 'MR' },
      { name: 'Alex B.', role: 'DevOps / SQLite DBA', allocation: 60, avatar: 'AB' },
      { name: 'Carlos T.', role: 'QA Engine Specialist', allocation: 50, avatar: 'CT' },
    ];
    defaultDocs = [
      { id: 201, title: 'Plano de Modelagem e Migração SQLite', category: 'Técnicos', size: '1.2 MB', uploadedBy: 'Alex B.', date: '04 Jun 2026' },
      { id: 202, title: 'Guia de Integração e Chaves OAuth2', category: 'Técnicos', size: '3.1 MB', uploadedBy: 'Mike R.', date: '11 Jun 2026' },
    ];
    defaultComments = [
      { id: 201, author: 'Mike R.', text: 'O gateway OAuth2 funcionou nos testes integrados locais. Tudo pronto para portar.', time: 'Ontem, 08:30' },
      { id: 202, author: 'Alex B.', text: 'Excelente. Já preparei as variáveis de ambiente no Kubernetes.', time: 'Ontem, 11:20' },
    ];
    defaultHistory = [
      { id: 201, user: 'Mike R.', action: 'configurou o repositório inicial e OpenAPI specs', time: '02 Jun, 09:00' },
      { id: 202, user: 'Alex B.', action: 'executou a migration inicial no banco dev', time: '05 Jun, 16:50' },
    ];
  } else {
    // Other projects default mock templates
    defaultTasks = [
      { id: 301, name: 'Análise de Escopo e Arquitetura Inicial', assignee: p.owner || 'Sarah J.', priority: 'Alta', column: 'done', sprintId: 1, tags: ['Planejamento'], dueDate: '15 Out', dependencies: [] },
      { id: 302, name: 'Configuração de Staging no Provedor Cloud', assignee: 'Alex B.', priority: 'Média', column: 'done', sprintId: 1, tags: ['Infra'], dueDate: '20 Out', dependencies: [301] },
      { id: 303, name: 'Desenvolvimento das Core Views do Módulo', assignee: p.owner || 'Sarah J.', priority: 'Alta', column: 'in_progress', sprintId: 2, tags: ['Desenvolvimento'], dueDate: '10 Nov', dependencies: [302] },
      { id: 304, name: 'Implementação de Fluxos de Mockups', assignee: 'Julia M.', priority: 'Média', column: 'todo', sprintId: 2, tags: ['Frontend'], dueDate: '15 Nov', dependencies: [303] },
      { id: 305, name: 'Fase de Homologação com Stakeholders', assignee: 'Carlos T.', priority: 'Baixa', column: 'todo', sprintId: 3, tags: ['QA'], dueDate: '30 Nov', dependencies: [304] },
    ];
    defaultMilestones = [
      { id: 301, title: 'Requisitos Fechados', desc: 'Escritura das regras de negócio do escopo', date: '15 Out', status: 'Concluído' },
      { id: 302, title: 'Cloud Setup', desc: 'Deploy seguro e homologação de chaves', date: '25 Out', status: 'Concluído' },
      { id: 303, title: 'Fase Beta Inicial', desc: 'Consumo funcional pelo comitê interno', date: '10 Nov', status: 'Em Andamento' },
      { id: 304, title: 'Implantação em Produção', desc: 'Disponibilização da rota estável', date: '30 Nov', status: 'Pendente' },
    ];
    defaultTeam = [
      { name: p.owner || 'Sarah J.', role: 'Líder Técnico / Gestor', allocation: 80, avatar: (p.owner || 'S').charAt(0) },
      { name: 'Alex B.', role: 'DevOps / SRE', allocation: 40, avatar: 'AB' },
      { name: 'Julia M.', role: 'Frontend Engineer', allocation: 50, avatar: 'JM' },
      { name: 'Carlos T.', role: 'QA Automation', allocation: 30, avatar: 'CT' },
    ];
    defaultDocs = [
      { id: 301, title: 'Documento de Escopo Assinado', category: 'Contratos', size: '2.4 MB', uploadedBy: p.owner || 'Sarah J.', date: '15 Out 2026' },
      { id: 302, title: 'Plano de Redundância e Backup Cloud', category: 'Planejamento', size: '1.5 MB', uploadedBy: 'Alex B.', date: '21 Out 2026' },
    ];
    defaultComments = [
      { id: 301, author: 'Alex B.', text: 'Staging está de pé. Podem comitar à vontade para verificações automáticas.', time: 'Ontem' },
    ];
    defaultHistory = [
      { id: 301, user: p.owner || 'Sarah J.', action: 'iniciou e delegou o backlog', time: '15 Out' },
    ];
  }

  return {
    id: p.id,
    name: p.name,
    company: p.company,
    owner: p.owner,
    priority: p.priority,
    deadline: p.deadline,
    column: p.column,
    description: p.description || `Este projeto visa planejar e implementar o ${p.name} alinhado às diretrizes técnicas de ponta da ${p.company}. A meta é obter 100% de estabilidade operacional, otimizando fluxos de trabalho e arquitetura com menor latência possível.`,
    criteria: p.criteria || [
      { id: 1, text: 'Definição e alinhamento do Design System', completed: true },
      { id: 2, text: 'Garantir cobertura mínima de testes de 80%', completed: true },
      { id: 3, text: 'Implementar auditoria de logs e chaves seguras', completed: false },
      { id: 4, text: 'Validar experiência de fluxo com coordenadores', completed: false },
    ],
    hasFullData: true,
    tasks: p.tasks || defaultTasks,
    sprints: p.sprints || defaultSprints,
    currentSprintId: p.currentSprintId || 2,
    milestones: p.milestones || defaultMilestones,
    team: p.team || defaultTeam,
    docs: p.docs || defaultDocs,
    comments: p.comments || defaultComments,
    history: p.history || defaultHistory,
    velocity: p.velocity || defaultVelocity,
  };
};
