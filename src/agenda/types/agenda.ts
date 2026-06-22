export type EventType = 
  | 'compromisso' 
  | 'reuniao' 
  | 'visita' 
  | 'entrega' 
  | 'call' 
  | 'evento' 
  | 'lembrete' 
  | 'treinamento' 
  | 'apresentacao' 
  | 'outro';

export type EventCategory = 
  | 'Administrativo' 
  | 'Comercial' 
  | 'Financeiro' 
  | 'Projetos' 
  | 'RH' 
  | 'Operacional' 
  | 'Jurídico' 
  | 'Marketing' 
  | 'Tecnologia' 
  | 'Personalizado';

export type EventStatus = 
  | 'Agendado' 
  | 'Confirmado' 
  | 'Em andamento' 
  | 'Concluído' 
  | 'Cancelado' 
  | 'Adiado';

export type ReminderOption = 
  | '5m' // 5 minutos antes
  | '15m' // 15 minutos antes
  | '30m' // 30 minutos antes
  | '1h' // 1 hora antes
  | '1d' // 1 dia antes
  | 'personalizado'
  | 'none';

export type RecurrenceType = 
  | 'none'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'personalizado';

export type TimeBlockType =
  | 'ferias'
  | 'ausencia'
  | 'viagem'
  | 'bloqueio'
  | 'home_office'
  | 'none';

export interface Participant {
  name: string;
  role: string;
  avatar: string;
  area?: string;
  email?: string;
}

export interface AgendaComment {
  id: string;
  author: string;
  text: string;
  time: string;
}

export interface AgendaAttachment {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'imagem' | 'planilha' | 'documento' | 'link';
  url?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AgendaHistoryItem {
  id: string;
  user: string;
  action: string;
  time: string;
}

export interface AgendaEvent {
  id: string;
  title: string;
  description: string;
  date: string; // Formato YYYY-MM-DD
  startTime: string; // Formato HH:MM
  endTime: string; // Formato HH:MM
  owner: string;
  participants: Participant[];
  location: string;
  type: EventType;
  category: EventCategory;
  status: EventStatus;
  reminder: ReminderOption;
  recurrence: RecurrenceType;
  recurrenceDescription?: string;
  
  // Event linkages
  linkedProject?: { id: number; name: string };
  linkedCompany?: { id: number; name: string };
  linkedTask?: { id: number; name: string };
  
  // Interactive features
  comments: AgendaComment[];
  attachments: AgendaAttachment[];
  checklist: ChecklistItem[];
  history: AgendaHistoryItem[];
  
  // Rooms and Resources
  reservedResources: string[]; // ex: ['Sala 03', 'Projetor', 'Notebook']
  
  // Time Block settings (Home Office, Absence etc)
  isTimeBlock: boolean;
  timeBlockType: TimeBlockType;
}

export type CalendarViewType = 'dia' | 'semana' | 'mes' | 'agenda' | 'timeline' | 'tarefas';
