import { AgendaEvent } from '../types/agenda';

const getOffsetDate = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split('T')[0];
};

export const MOCK_PARTICIPANTS = [
  { name: 'Sarah J.', role: 'Head of Design', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Design', email: 'sarah@cyzor.com' },
  { name: 'Mike R.', role: 'Tech Lead', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Tecnologia', email: 'mike@cyzor.com' },
  { name: 'Ana P.', role: 'Product Manager', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Produto', email: 'ana@cyzor.com' },
  { name: 'Carlos T.', role: 'Operations Director', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Operações', email: 'carlos@cyzor.com' },
  { name: 'Julia M.', role: 'Marketing Specialist', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Marketing', email: 'julia@cyzor.com' },
  { name: 'Alex B.', role: 'Security Architect', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwXDXg1KcX6TY_nnpByK4zlImijL4JDNtHoN9XN3T9dq_tZcudbqWHjzev0Aw2WyeiOpOEzJdhRD_AzC_4s9nK3O_s2r_MlMb3q0m9i683ZXuMBlVDWtCJr9Gsp9NsgmanSPnOoZpC6h2_PPyre2mt0LCtpGGrIKe4QKM0JrkxMXkrP9hkh3N8A0s9CXjqnxGXNgdFbKBE8aHzl4m_ivnii89mcRJm1sM5PlnnsosvDkFBYt_L58ZCBER132IVQQDtnWKcZUCbOJ0', area: 'Tecnologia', email: 'alex@cyzor.com' },
];

export const MOCK_RESOURCES = [
  'Sala Reuniões VIP 01',
  'Sala Reuniões 02',
  'Sala de Focus 04',
  'Auditório Principal',
  'Projetor 4K - Portátil',
  'Kit Videoconferência Jabra',
  'Notebook Dell XPS (Reserva)',
  'Carro Corporativo 01 (Cruze)',
];

export const MOCK_PROJECTS = [
  { id: 1, name: 'Redesign Dashboard' },
  { id: 2, name: 'API V3' },
  { id: 3, name: 'Mobile App' },
  { id: 4, name: 'Integração ERP' },
  { id: 5, name: 'Landing Page Q4' },
  { id: 6, name: 'Security Audit' },
];

export const MOCK_COMPANIES = [
  { id: 1, name: 'Alpha Technologies' },
  { id: 2, name: 'Nexus Group' },
  { id: 3, name: 'Zenith Health' },
  { id: 4, name: 'Omni Logistics' },
  { id: 5, name: 'Quantum Finance' },
];

export const INITIAL_EVENTS: AgendaEvent[] = [
  {
    id: 'evt-1',
    title: 'Daily Meeting - Redesign Dashboard',
    description: 'Sincronização diária rápida para alinhamento dos impedimentos e progresso do protótipo.',
    date: getOffsetDate(0), // Hoje
    startTime: '09:00',
    endTime: '09:30',
    owner: 'Sarah J.',
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[1], MOCK_PARTICIPANTS[2]],
    location: 'Google Meet',
    type: 'reuniao',
    category: 'Projetos',
    status: 'Concluído',
    reminder: '15m',
    recurrence: 'daily',
    recurrenceDescription: 'Diário, dias úteis',
    linkedProject: MOCK_PROJECTS[0],
    linkedCompany: MOCK_COMPANIES[0],
    comments: [
      { id: 'c-1', author: 'Mike R.', text: 'Estou finalizando o backend para testar a integração na tela.', time: 'Hoje, 09:15' },
      { id: 'c-2', author: 'Sarah J.', text: 'Excelente! Vou liberar o Figma finalizado até meio dia.', time: 'Hoje, 09:25' }
    ],
    attachments: [
      { id: 'at-1', name: 'Layout_v2.pdf', size: '4.2 MB', type: 'pdf' },
    ],
    checklist: [
      { id: 'chk-1', text: 'Validar protótipo com cliente', completed: true },
      { id: 'chk-2', text: 'Liberar fluxo de navegação no Figma', completed: true },
      { id: 'chk-3', text: 'Estruturação de Schema Database', completed: false },
    ],
    history: [
      { id: 'h-1', user: 'Sarah J.', action: 'Criou o compromisso', time: 'Ontem, 16:30' },
      { id: 'h-2', user: 'Sarah J.', action: 'Marcou item do checklist como Concluído', time: 'Hoje, 09:10' }
    ],
    reservedResources: [],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
  {
    id: 'evt-2',
    title: 'Review e Planejamento Sprint #24',
    description: 'Apresentação dos resultados da sprint #23 e planejamento macro para a sprint #24.',
    date: getOffsetDate(0), // Hoje
    startTime: '14:00',
    endTime: '15:30',
    owner: 'Ana P.',
    participants: [MOCK_PARTICIPANTS[0], MOCK_PARTICIPANTS[1], MOCK_PARTICIPANTS[2], MOCK_PARTICIPANTS[3]],
    location: 'Sala Reuniões VIP 01',
    type: 'reuniao',
    category: 'Administrativo',
    status: 'Confirmado',
    reminder: '30m',
    recurrence: 'weekly',
    recurrenceDescription: 'Todas as quartas-feiras',
    linkedProject: MOCK_PROJECTS[2],
    linkedCompany: MOCK_COMPANIES[2],
    comments: [
      { id: 'c-3', author: 'Ana P.', text: 'Por favor tragam as estimativas prontas das histórias para agilizarmos.', time: 'Ontem, 10:00' }
    ],
    attachments: [
      { id: 'at-2', name: 'Sprint_23_Results.xlsx', size: '1.1 MB', type: 'planilha' },
    ],
    checklist: [
      { id: 'chk-4', text: 'Demonstrar build do Mobile App para Zenith Health', completed: false },
      { id: 'chk-5', text: 'Coletar feedback das features de Telemetria', completed: false },
      { id: 'chk-6', text: 'Definir datas das próximas entregas', completed: false }
    ],
    history: [
      { id: 'h-3', user: 'Ana P.', action: 'Criou o compromisso', time: '2 dias atrás' },
      { id: 'h-4', user: 'Ana P.', action: 'Reservou a Sala Reuniões VIP 01', time: '2 dias atrás' }
    ],
    reservedResources: ['Sala Reuniões VIP 01', 'Projetor 4K - Portátil'],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
  {
    id: 'evt-3',
    title: 'Pedro M. - Ausência Médica',
    description: 'Consulta oftalmológica rotineira.',
    date: getOffsetDate(0), // Hoje
    startTime: '10:00',
    endTime: '12:00',
    owner: 'Pedro M.',
    participants: [],
    location: 'Externa',
    type: 'compromisso',
    category: 'RH',
    status: 'Confirmado',
    reminder: 'none',
    recurrence: 'none',
    comments: [],
    attachments: [],
    checklist: [],
    history: [
      { id: 'h-5', user: 'Admin', action: 'Bloqueou agenda do profissional', time: 'Semana passada' }
    ],
    reservedResources: [],
    isTimeBlock: true,
    timeBlockType: 'ausencia',
  },
  {
    id: 'evt-4',
    title: 'Call de Integração ERP e Omni Logistics',
    description: 'Ajuste de escopo técnico nos canais de WebSockets com o time técnico da Omni.',
    date: getOffsetDate(0), // Hoje
    startTime: '16:00',
    endTime: '17:00',
    owner: 'Mike R.',
    participants: [MOCK_PARTICIPANTS[1], MOCK_PARTICIPANTS[3]],
    location: 'Microsoft Teams',
    type: 'call',
    category: 'Tecnologia',
    status: 'Agendado',
    reminder: '15m',
    recurrence: 'none',
    linkedProject: MOCK_PROJECTS[3],
    linkedCompany: MOCK_COMPANIES[3],
    comments: [],
    attachments: [],
    checklist: [
      { id: 'chk-7', text: 'Validar payloads de webhook recebidos', completed: false }
    ],
    history: [
      { id: 'h-6', user: 'Mike R.', action: 'Criou o compromisso', time: 'Hoje, 08:30' }
    ],
    reservedResources: [],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
  {
    id: 'evt-5',
    title: 'Apresentação Comercial: Zenith Health',
    description: 'Pitch comercial sobre os módulos premium de auditoria financeira no ecossistema.',
    date: getOffsetDate(1), // Amanhã
    startTime: '10:30',
    endTime: '11:45',
    owner: 'Carlos T.',
    participants: [MOCK_PARTICIPANTS[3], MOCK_PARTICIPANTS[4]],
    location: 'Sala Reuniões 02',
    type: 'apresentacao',
    category: 'Comercial',
    status: 'Agendado',
    reminder: '1h',
    recurrence: 'none',
    linkedCompany: MOCK_COMPANIES[2],
    comments: [],
    attachments: [
      { id: 'at-3', name: 'Proposal_Premium_v4.pdf', size: '8.7 MB', type: 'pdf' }
    ],
    checklist: [
      { id: 'chk-8', text: 'Imprimir propostas comerciais resumidas', completed: false },
      { id: 'chk-9', text: 'Checar áudio/vídeo do projetor da sala 02', completed: false }
    ],
    history: [
      { id: 'h-7', user: 'Carlos T.', action: 'Reservou Sala Reuniões 02', time: 'Ontem, 11:30' }
    ],
    reservedResources: ['Sala Reuniões 02', 'Kit Videoconferência Jabra'],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
  {
    id: 'evt-6',
    title: 'Home Office - Sarah J.',
    description: 'Trabalho focado em layouts de protótipos e fluxo do módulo de Agenda de Cyzor.',
    date: getOffsetDate(1), // Amanhã
    startTime: '08:00',
    endTime: '18:00',
    owner: 'Sarah J.',
    participants: [],
    location: 'Remoto',
    type: 'outro',
    category: 'Administrativo',
    status: 'Confirmado',
    reminder: 'none',
    recurrence: 'none',
    comments: [],
    attachments: [],
    checklist: [],
    history: [],
    reservedResources: [],
    isTimeBlock: true,
    timeBlockType: 'home_office',
  },
  {
    id: 'evt-7',
    title: 'Security Audit - Kickoff Técnico',
    description: 'Alinhamento com auditores externos sobre o escopo de análise do código fonte.',
    date: getOffsetDate(3), // Próximos dias
    startTime: '11:00',
    endTime: '12:30',
    owner: 'Alex B.',
    participants: [MOCK_PARTICIPANTS[1], MOCK_PARTICIPANTS[5]],
    location: 'Sala Reuniões VIP 01',
    type: 'reuniao',
    category: 'Tecnologia',
    status: 'Agendado',
    reminder: '30m',
    recurrence: 'none',
    linkedProject: MOCK_PROJECTS[5],
    linkedCompany: MOCK_COMPANIES[4],
    comments: [],
    attachments: [],
    checklist: [
      { id: 'chk-10', text: 'Compartilhar repositório git no modo somente leitura', completed: false }
    ],
    history: [],
    reservedResources: ['Sala Reuniões VIP 01'],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
  {
    id: 'evt-8',
    title: 'Prazo Limpo: Entrega Final Landing Page Q4',
    description: 'Data limite para publicação oficial das landing pages optimizadas nas infraestruturas da Alpha.',
    date: getOffsetDate(5), // Próxima semana
    startTime: '23:59',
    endTime: '23:59',
    owner: 'Julia M.',
    participants: [MOCK_PARTICIPANTS[4]],
    location: 'Ambiente de Produção',
    type: 'entrega',
    category: 'Marketing',
    status: 'Agendado',
    reminder: '1d',
    recurrence: 'none',
    linkedProject: MOCK_PROJECTS[4],
    linkedCompany: MOCK_COMPANIES[0],
    comments: [],
    attachments: [],
    checklist: [],
    history: [],
    reservedResources: [],
    isTimeBlock: false,
    timeBlockType: 'none',
  },
];
