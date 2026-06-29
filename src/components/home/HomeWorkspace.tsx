import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Layers, 
  MapPin, 
  Users, 
  Video, 
  Tag, 
  Briefcase, 
  CheckSquare, 
  Plus 
} from 'lucide-react';

interface EventCardProps {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  type?: string;
  category?: string;
  location?: string;
  participants?: any[];
  linkedProject?: { id: number; name: string };
  checklist?: any[];
  status?: string;
}

const formatDateToPt = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return `${day} de ${months[monthIdx]}`;
};

const getCategoryStyles = (category: string = '', type: string = '') => {
  const norm = (category || type || '').toLowerCase();
  if (norm.includes('comercial') || norm.includes('vendas') || norm.includes('cliente')) {
    return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100/50', dot: 'bg-emerald-500' };
  }
  if (norm.includes('desenvolvimento') || norm.includes('tech') || norm.includes('dev') || norm.includes('engenharia') || norm.includes('api') || norm.includes('sprint')) {
    return { bg: 'bg-blue-50 text-blue-700 border-blue-100/50', dot: 'bg-blue-500' };
  }
  if (norm.includes('design') || norm.includes('reuni') || norm.includes('sinc') || norm.includes('meeting') || norm.includes('planejamento')) {
    return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-100/50', dot: 'bg-indigo-500' };
  }
  if (norm.includes('financeiro') || norm.includes('faturamento') || norm.includes('pagamento') || norm.includes('custo')) {
    return { bg: 'bg-amber-50 text-amber-700 border-amber-100/50', dot: 'bg-amber-500' };
  }
  if (norm.includes('crít') || norm.includes('critico') || norm.includes('urgente') || norm.includes('suporte') || norm.includes('segurança')) {
    return { bg: 'bg-rose-50 text-rose-700 border-rose-100/50', dot: 'bg-rose-500' };
  }
  if (norm.includes('marketing') || norm.includes('social') || norm.includes('branding')) {
    return { bg: 'bg-purple-50 text-purple-700 border-purple-100/50', dot: 'bg-purple-500' };
  }
  // Default to slate
  return { bg: 'bg-slate-50 text-slate-700 border-slate-100/50', dot: 'bg-slate-500' };
};

const EventCard = ({
  title,
  description,
  date,
  startTime,
  endTime,
  type,
  category,
  location,
  participants = [],
  linkedProject,
  checklist = []
}: EventCardProps) => {
  const styles = getCategoryStyles(category, type);
  const formattedDate = formatDateToPt(date);
  
  const completedChecklistItems = checklist ? checklist.filter((item: any) => item.completed || item.checked).length : 0;
  const totalChecklistItems = checklist ? checklist.length : 0;

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.015 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_32px_rgba(15,23,42,0.04)] flex flex-col justify-between h-full group transition-all"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${styles.bg}`}>
            {category || type || 'Compromisso'}
          </span>
          <span className="text-[10px] text-[#64748B] font-mono flex items-center gap-1 bg-[#FAFAFA] border border-[#0F172A03] px-2 py-1 rounded-lg">
            <Clock size={11} className="text-slate-400" />
            {startTime} {endTime ? `- ${endTime}` : ''}
          </span>
        </div>

        <h4 className="text-sm font-extrabold text-[#111111] leading-snug mb-1.5 tracking-tight group-hover:text-blue-600 transition-colors">
          {title}
        </h4>

        {description ? (
          <p className="text-xs text-[#64748B] leading-relaxed line-clamp-2 mb-3 font-medium">
            {description}
          </p>
        ) : (
          <p className="text-xs text-[#94A3B8] italic leading-relaxed mb-3 font-medium">
            Sem descrição adicional.
          </p>
        )}
      </div>

      <div className="space-y-2.5 pt-3 border-t border-[#0F172A04] mt-3">
        {/* Date */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#1e293b]">
          <CalendarIcon size={12} className="text-blue-500" />
          <span>{formattedDate || 'Sem data'}</span>
        </div>

        {/* Metadata widgets */}
        <div className="flex flex-wrap gap-x-3.5 gap-y-1.5 pt-0.5 text-[11px] text-[#64748B] font-semibold">
          {location && (
            <span className="flex items-center gap-1 bg-slate-50/50 px-2 py-0.5 rounded border border-slate-100/50">
              {location.toLowerCase().includes('meet') || location.toLowerCase().includes('zoom') || location.toLowerCase().includes('virtual') || location.toLowerCase().includes('online') ? (
                <Video size={11} className="text-blue-500" />
              ) : (
                <MapPin size={11} className="text-rose-500" />
              )}
              <span className="max-w-[110px] truncate">{location}</span>
            </span>
          )}

          {participants && participants.length > 0 && (
            <span className="flex items-center gap-1 bg-slate-50/50 px-2 py-0.5 rounded border border-slate-100/50">
              <Users size={11} className="text-indigo-500" />
              <span>{participants.length} {participants.length === 1 ? 'part.' : 'parts.'}</span>
            </span>
          )}

          {linkedProject && linkedProject.name && (
            <span className="flex items-center gap-1 text-blue-600 font-semibold bg-blue-50/40 px-2 py-0.5 rounded border border-blue-100/30">
              <Briefcase size={10} className="text-blue-500" />
              <span className="max-w-[90px] truncate">{linkedProject.name}</span>
            </span>
          )}

          {totalChecklistItems > 0 && (
            <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50/40 px-2 py-0.5 rounded border border-emerald-100/30">
              <CheckSquare size={11} className="text-emerald-500" />
              <span>{completedChecklistItems}/{totalChecklistItems}</span>
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function HomeWorkspace({ 
  projects, 
  tasks = [], 
  agendaEvents = [], 
  setCurrentView 
}: { 
  projects: any[]; 
  tasks: any[]; 
  agendaEvents: any[]; 
  setCurrentView: (view: any) => void;
}) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number>(now.getDate());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Offset of empty cells to align with daysOfWeek (Monday-first)
  const getFirstDayOffset = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };
  const offsetCount = getFirstDayOffset(currentYear, currentMonth);
  const offsetCells = Array.from({ length: offsetCount }, (_, i) => i);

  // Parse dynamic event days from SQLite agenda events for the current displayed month & year (timezone-safe)
  const dynamicEventDays = agendaEvents
    .filter(evt => {
      const dParts = evt.date.split('-');
      if (dParts.length === 3) {
        const year = parseInt(dParts[0], 10);
        const month = parseInt(dParts[1], 10) - 1; // 0-indexed
        return year === currentYear && month === currentMonth;
      }
      return false;
    })
    .map(evt => parseInt(evt.date.split('-')[2], 10));

  const eventDays = Array.from(new Set(dynamicEventDays));

  const getEventsForDay = (day: number) => {
    // Find matching real events (timezone-safe string splitting)
    const realEventsForDay = agendaEvents.filter(evt => {
      const dParts = evt.date.split('-');
      if (dParts.length === 3) {
        const year = parseInt(dParts[0], 10);
        const month = parseInt(dParts[1], 10) - 1; // 0-indexed
        const dDay = parseInt(dParts[2], 10);
        return year === currentYear && month === currentMonth && dDay === day;
      }
      return false;
    });

    return realEventsForDay.map(evt => ({
      title: evt.title,
      time: evt.startTime || "Breve",
      type: evt.type || "Evento"
    }));
  };

  // Sort and filter top 4 upcoming/recent events in the database to display as complete cards on the right
  const today = new Date();
  const tYear = today.getFullYear();
  const tMonth = String(today.getMonth() + 1).padStart(2, '0');
  const tDay = String(today.getDate()).padStart(2, '0');
  const todayStr = `${tYear}-${tMonth}-${tDay}`;

  // Sort: upcoming events first (by date ascending), then past events (by date descending)
  const sortedEvents = [...agendaEvents].sort((a, b) => {
    return a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime);
  });

  const upcomingEvents = sortedEvents.filter(evt => evt.date >= todayStr);
  const pastEvents = sortedEvents.filter(evt => evt.date < todayStr).reverse();

  // Highlight/Feature up to 4 real database agenda events
  const displayEvents = [...upcomingEvents, ...pastEvents].slice(0, 4);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#111111] tracking-tight">Cronograma & Operações</h3>
        <button 
          onClick={() => setCurrentView('agenda')}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50/50 hover:bg-blue-50 px-3.5 py-1.5 rounded-xl border border-blue-100 cursor-pointer"
        >
          Ir para Agenda
        </button>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Premium Calendar Widget */}
        <div className="xl:col-span-5 bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-5 h-fit">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-[#111111] capitalize">{monthNames[currentMonth]} {currentYear}</span>
              <span className="text-xs text-[#64748B] font-medium">Visualização Mensal</span>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
              {daysOfWeek.map(day => (
                <span key={day} className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase">{day}</span>
              ))}
              
              {offsetCells.map(offsetIdx => (
                <div key={`offset-${offsetIdx}`} className="w-8 h-8" />
              ))}
              
              {days.map(day => {
                const isSelected = selectedDay === day;
                const hasEvent = eventDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="relative flex flex-col items-center justify-center p-2 focus:outline-none group cursor-pointer"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isSelected ? 'bg-[#111111] text-white font-bold' : 'text-[#334155] hover:bg-slate-50'}`}>
                      {day}
                    </span>
                    {hasEvent && (
                      <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Events Preview */}
          <div className="border-t border-[#0F172A05] pt-4">
            <h5 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Compromissos do dia {selectedDay}</h5>
            <div className="space-y-2.5">
              <AnimatePresence mode="wait">
                {getEventsForDay(selectedDay).length > 0 ? (
                  getEventsForDay(selectedDay).map((evt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#0F172A03]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-blue-600 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-[#111111] leading-tight">{evt.title}</p>
                          <p className="text-[10px] text-[#64748B] font-medium mt-0.5">{evt.time}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-[#0F172A05]">
                        {evt.type}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-[#94A3B8] font-medium italic py-2"
                  >
                    Nenhum compromisso agendado para esta data.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Real Agenda Event Cards Grid or Empty State */}
        <div className="xl:col-span-7 h-fit self-start">
          {displayEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  date={event.date}
                  startTime={event.startTime}
                  endTime={event.endTime}
                  type={event.type}
                  category={event.category}
                  location={event.location}
                  participants={event.participants}
                  linkedProject={event.linkedProject}
                  checklist={event.checklist}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#0F172A08] rounded-[24px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center text-center min-h-[300px]">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-[#0F172A05]">
                <Layers size={20} className="text-slate-400" />
              </div>
              <h4 className="text-sm font-bold text-[#111111] mb-1">Sem Compromissos Conectados</h4>
              <p className="text-xs text-[#64748B] max-w-[280px] leading-relaxed mb-4">
                Não há nenhum compromisso ou entrega cadastrado no ecossistema de agendas da sua plataforma.
              </p>
              <button 
                onClick={() => setCurrentView('agenda')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors bg-blue-50/50 hover:bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 cursor-pointer flex items-center gap-1.5"
              >
                <Plus size={14} /> Criar Primeiro Compromisso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
