import { AgendaEvent } from '../types/agenda';
import { Clock, CheckSquare, Sparkles, Coffee, Briefcase, Video, MapPin } from 'lucide-react';

interface DailyAgendaPanelProps {
  events: AgendaEvent[];
  selectedDate: string;
  onEventClick: (event: AgendaEvent) => void;
}

export default function DailyAgendaPanel({ events, selectedDate, onEventClick }: DailyAgendaPanelProps) {
  // Filter events of selectedDate
  const todayEvents = events
    .filter(e => e.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const totalEvents = todayEvents.length;
  const completedEvents = todayEvents.filter(e => e.status === 'Concluído').length;
  const progressPercent = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;

  // Format date helper: "Hoje, 20 Março" or "Quarta, 21 Março"
  const formatDateText = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const capitalizedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);
      const dayMonth = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
      
      if (isToday) {
        return `Hoje, ${dayMonth}`;
      }
      return `${capitalizedWeekday}, ${dayMonth}`;
    } catch {
      return dateString;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'reuniao': return <Video size={14} className="text-[#111111]" />;
      case 'call': return <Video size={14} className="text-[#111111]" />;
      case 'lembrete': return <CheckSquare size={14} className="text-[#64748B]" />;
      default: return <Briefcase size={14} className="text-[#111111]" />;
    }
  };

  return (
    <div id="daily-agenda-panel" className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <div className="border-b border-[#0F172A0F] pb-6 mb-6">
        <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest mb-2 flex items-center gap-2">
          <Clock size={14} className="text-[#111111]" />
          Progresso do Dia
        </h3>
        <div className="flex justify-between items-baseline mb-3">
          <span className="text-xl font-bold text-[#111111]">{formatDateText(selectedDate)}</span>
          <span className="text-xs font-bold text-[#111111]">{completedEvents}/{totalEvents} concluídos</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#111111] rounded-full transition-all duration-500" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 max-h-[450px] custom-scrollbar">
        {todayEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center mb-3">
              <Coffee size={20} className="text-[#64748B]" />
            </div>
            <p className="text-sm font-semibold text-[#111111]">Nenhum compromisso marcado</p>
            <p className="text-xs text-[#64748B] mt-1 max-w-[200px]">Aproveite este dia para focar no seu trabalho individual.</p>
          </div>
        ) : (
          todayEvents.map(event => {
            const isCompleted = event.status === 'Concluído';
            const isTimeBlock = event.isTimeBlock;
            
            return (
              <div 
                key={event.id}
                onClick={() => onEventClick(event)}
                className={`group border rounded-[18px] p-4 transition-all hover:border-[#111111] cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                  isCompleted 
                    ? 'bg-[#FAFAFA]/70 border-[#0F172A0F] opacity-70' 
                    : isTimeBlock 
                      ? 'bg-blue-50/20 border-blue-100/60' 
                      : 'bg-[#FFFFFF] border-[#0F172A0F] shadow-[0_4px_12px_rgba(0,0,0,0.01)]'
                }`}
              >
                {/* Visual marker bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                  isCompleted 
                    ? 'bg-[#64748B]' 
                    : isTimeBlock 
                      ? 'bg-blue-500' 
                      : event.category === 'Comercial' 
                        ? 'bg-emerald-500' 
                        : event.category === 'Financeiro' 
                          ? 'bg-violet-500' 
                          : 'bg-[#111111]'
                }`} />

                <div className="flex justify-between items-start gap-2 pl-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono font-bold text-[#111111]">
                      {event.startTime}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      ({event.endTime})
                    </span>
                  </div>
                  
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    isCompleted 
                      ? 'bg-[#FAFAFA] text-[#64748B] border border-[#0F172A0F]' 
                      : event.status === 'Em andamento' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-neutral-100 text-neutral-800'
                  }`}>
                    {event.status}
                  </span>
                </div>

                <div className="pl-2">
                  <h4 className={`text-sm font-semibold text-[#111111] tracking-tight group-hover:text-black leading-snug ${isCompleted ? 'line-through text-[#64748B]' : ''}`}>
                    {event.title}
                  </h4>
                  {event.location && (
                    <div className="flex items-center gap-1 text-[11px] text-[#64748B] mt-1.5">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate max-w-[170px]">{event.location}</span>
                    </div>
                  )}
                </div>

                {/* Sub info */}
                {(event.linkedProject || event.linkedCompany) && (
                  <div className="pl-2 mt-1 pt-2 border-t border-[#0F172A0F] flex items-center justify-between text-[10px] font-medium text-[#64748B]">
                    <span className="truncate max-w-[130px]">
                      {event.linkedProject ? `Proj: ${event.linkedProject.name}` : `Clie: ${event.linkedCompany?.name}`}
                    </span>
                    {event.checklist.length > 0 && (
                      <span className="text-[9px] font-mono text-[#111111] bg-[#FAFAFA] border border-[#0F172A0F] px-1 rounded">
                        {event.checklist.filter(c => c.completed).length}/{event.checklist.length} check
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-[#0F172A0F] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-[#111111]" />
          <span className="text-xs font-semibold text-[#111111] tracking-wide">Foco Produtivo</span>
        </div>
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest bg-[#FAFAFA] border border-[#0F172A0F] px-2 py-1 rounded-lg">
          {events.filter(e => e.date === selectedDate && e.isTimeBlock).length > 0 ? 'Foco Reservado' : 'Agenda Livre'}
        </span>
      </div>
    </div>
  );
}
