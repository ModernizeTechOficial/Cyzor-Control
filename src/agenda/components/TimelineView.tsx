import { AgendaEvent } from '../types/agenda';
import { Calendar, Video, MapPin, CheckCircle, ShieldAlert, FileText, ArrowUpRight } from 'lucide-react';

interface TimelineViewProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
}

export default function TimelineView({ events, onEventClick }: TimelineViewProps) {
  // Sort events chronologically
  const sorted = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const formatDateText = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const isToday = date.toDateString() === new Date().toDateString();
      return `${isToday ? 'Hoje, ' : ''}${date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center pb-6 border-b border-[#0F172A0F] mb-8">
        <h3 className="text-xl font-bold text-[#111111]">Timeline Cronológica</h3>
        <span className="text-xs text-[#64748B] font-semibold">{events.length} Marcos/Entregas</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar relative pl-6 border-l border-[#0F172A0F]/90 ml-4 flex flex-col gap-10">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">Sem agenda programada</div>
        ) : (
          sorted.map((event, idx) => {
            const isCompleted = event.status === 'Concluído';
            const isTimeBlock = event.isTimeBlock;
            
            return (
              <div key={event.id} className="relative group/item">
                {/* Timeline ball indicator */}
                <div className={`absolute -left-[31px] top-1.5 w-[11px] h-[11px] rounded-full border-2 transition-all duration-300 group-hover/item:scale-125 ${
                  isCompleted 
                    ? 'bg-[#111111] border-[#111111]' 
                    : isTimeBlock 
                      ? 'bg-blue-500 border-white ring-4 ring-blue-50' 
                      : event.category === 'Comercial' 
                        ? 'bg-emerald-500 border-white ring-4 ring-emerald-50' 
                        : 'bg-white border-[#111111] ring-4 ring-neutral-50'
                }`} />

                {/* Card representation */}
                <div 
                  onClick={() => onEventClick(event)}
                  className="bg-white hover:bg-[#FAFAFA]/50 border border-[#0F172A0F] rounded-[24px] p-5 md:p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] hover:border-[#111111] transition-all cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:-translate-x-1"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <span className="text-xs font-bold text-[#111111] bg-[#FAFAFA] border border-[#0F172A0F] px-2.5 py-1 rounded-xl">
                        {formatDateText(event.date)} · {event.startTime} - {event.endTime}
                      </span>
                      <span className={`text-[10px] font-mono uppercase tracking-wider font-bold`}>
                        {event.category}
                      </span>
                    </div>

                    <h4 className={`text-base font-bold text-[#111111] tracking-tight leading-snug flex items-center gap-2 ${isCompleted ? 'line-through text-[#64748B]' : ''}`}>
                      {event.title}
                      <ArrowUpRight size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity text-[#111111]" />
                    </h4>

                    {event.description && (
                      <p className="text-xs text-[#64748B] mt-2 line-clamp-2 max-w-[550px]">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 flex-wrap mt-4 text-xs font-semibold text-[#64748B]">
                      {event.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-[#111111]" />
                          {event.location}
                        </span>
                      )}
                      {event.linkedCompany && (
                        <span className="underline">
                          Empresa: {event.linkedCompany.name}
                        </span>
                      )}
                      {event.participants.length > 0 && (
                        <span>
                          {event.participants.length} participantes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Banner */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-auto shrink-0 border-t md:border-t-0 border-[#0F172A0D] pt-3 md:pt-0 gap-2 font-semibold">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                      isCompleted 
                        ? 'bg-neutral-100 text-neutral-600 border-neutral-200' 
                        : event.status === 'Confirmado' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-white text-[#111111] border-[#111111]'
                    }`}>
                      {event.status}
                    </span>
                    
                    {event.owner && (
                      <span className="text-[10px] text-[#64748B]">
                        Resp: {event.owner}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
