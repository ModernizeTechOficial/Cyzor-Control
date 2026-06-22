import { AgendaEvent } from '../types/agenda';
import { Plus, Video, MapPin, CheckSquare, Shield, Clock, ExternalLink } from 'lucide-react';

interface DayViewProps {
  selectedDate: string;
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  onQuickAdd: (date: string, hour: string) => void;
}

export default function DayView({ selectedDate, events, onEventClick, onQuickAdd }: DayViewProps) {
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 8; // From 08:00 to 19:00
    return `${h.toString().padStart(2, '0')}:00`;
  });

  const dayEvents = events.filter(e => e.date === selectedDate);

  const getEventsForHour = (hour: string) => {
    const hourInt = parseInt(hour.split(':')[0]);
    return dayEvents.filter(e => {
      const startH = parseInt(e.startTime.split(':')[0]);
      const endH = parseInt(e.endTime.split(':')[0]);
      
      // If event lands or stretches on this starting hour slot
      return (startH <= hourInt && endH > hourInt) || (startH === hourInt && e.startTime.split(':')[1] !== '59');
    });
  };

  const getEventStyle = (event: AgendaEvent) => {
    if (event.isTimeBlock) {
      return 'bg-blue-50 border-blue-100 hover:border-blue-300 text-blue-900';
    }
    switch (event.category) {
      case 'Projetos':
        return 'bg-[#111111] text-white border-[#111111] hover:bg-black';
      case 'Comercial':
        return 'bg-emerald-50 border-emerald-100 hover:border-emerald-300 text-emerald-900';
      case 'Financeiro':
        return 'bg-violet-50 border-violet-100 hover:border-violet-300 text-violet-900';
      case 'RH':
        return 'bg-amber-50 border-amber-100 hover:border-amber-300 text-amber-900';
      case 'Marketing':
        return 'bg-rose-50 border-rose-100 hover:border-rose-300 text-rose-900';
      default:
        return 'bg-neutral-50 border-neutral-200 text-neutral-800 hover:border-neutral-400';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center pb-6 border-b border-[#0F172A0F] mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#111111]" />
          <span className="text-sm font-bold text-[#111111] uppercase tracking-wider">Compromissos Agendados</span>
        </div>
        <span className="text-xs text-[#64748B] font-semibold">{dayEvents.length} no dia {selectedDate.split('-').reverse().join('/')}</span>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-[#0F172A0F]/60 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar">
        {hours.map(hour => {
          const matchedEvents = getEventsForHour(hour);
          const hourLabel = hour;

          return (
            <div key={hour} className="flex gap-4 py-4 md:py-6 group/row items-stretch min-h-[90px] shrink-0">
              {/* Hour Column */}
              <div className="w-[60px] md:w-[80px] shrink-0 font-mono text-sm font-bold text-[#64748B] flex flex-col justify-start pt-1">
                <span>{hourLabel}</span>
                <button 
                  onClick={() => onQuickAdd(selectedDate, hour)}
                  className="mt-2 text-[10px] text-left text-[#111111] font-bold uppercase tracking-wider opacity-0 group-hover/row:opacity-100 transition-opacity flex items-center gap-1 hover:underline"
                >
                  <Plus size={10} />
                  Agendar
                </button>
              </div>

              {/* Events Grid Column */}
              <div className="flex-1 flex flex-col gap-2">
                {matchedEvents.length === 0 ? (
                  <div className="h-full flex items-center text-xs text-[#64748B] opacity-0 group-hover/row:opacity-40 transition-all font-medium py-2">
                    Livre
                  </div>
                ) : (
                  matchedEvents.map((event, idx) => {
                    const isCompleted = event.status === 'Concluído';
                    
                    return (
                      <div
                        key={`${event.id}-${idx}`}
                        onClick={() => onEventClick(event)}
                        className={`flex flex-col md:flex-row justify-between rounded-[16px] border p-4 transition-all duration-300 cursor-pointer ${getEventStyle(event)} ${isCompleted ? 'opacity-60' : 'shadow-[0_4px_16px_rgba(0,0,0,0.01)]'}`}
                      >
                        <div className="flex-1 min-w-0 pr-4 flex flex-col justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono font-bold tracking-wider">
                                {event.startTime} - {event.endTime}
                              </span>
                              <span className="text-[10px] uppercase font-bold tracking-widest opacity-80">
                                · {event.category}
                              </span>
                            </div>
                            <h4 className={`text-sm md:text-base font-bold tracking-tight ${isCompleted ? 'line-through' : ''}`}>
                              {event.title}
                            </h4>
                            <p className="text-xs mt-1.5 opacity-90 line-clamp-1">
                              {event.description}
                            </p>
                          </div>

                          {/* Detail indicators */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs font-semibold opacity-90">
                            {event.location && (
                              <span className="flex items-center gap-1.5">
                                <MapPin size={12} className="shrink-0" />
                                {event.location}
                              </span>
                            )}
                            {event.linkedProject && (
                              <span className="flex items-center gap-1.5 underline">
                                <Clock size={12} className="shrink-0" />
                                Proj: {event.linkedProject.name}
                              </span>
                            )}
                            {event.reservedResources.length > 0 && (
                              <span className="flex items-center gap-1.5">
                                <Shield size={12} className="shrink-0" />
                                Rec: {event.reservedResources.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Right columns - status, participants */}
                        <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center mt-3 md:mt-0 gap-3 border-t md:border-t-0 border-[#0F172A0D] pt-3 md:pt-0 shrink-0">
                          <span className={`text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                            event.status === 'Confirmado' ? 'bg-emerald-100/50 text-emerald-950 border-emerald-200' :
                            event.status === 'Em andamento' ? 'bg-blue-100 text-blue-950 border-blue-200' :
                            event.status === 'Concluído' ? 'bg-neutral-100/80 text-neutral-600 border-neutral-300' :
                            'bg-neutral-50/50 text-neutral-800'
                          }`}>
                            {event.status}
                          </span>

                          <div className="flex -space-x-1 hover:space-x-1.5 transition-all">
                            {event.participants.map((p, pIdx) => (
                              <img
                                key={pIdx}
                                src={p.avatar}
                                alt={p.name}
                                className="w-6 h-6 rounded-full border-2 border-white pointer-events-none"
                                title={`${p.name} (${p.role})`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
