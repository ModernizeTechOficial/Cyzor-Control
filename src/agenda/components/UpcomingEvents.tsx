import { AgendaEvent } from '../types/agenda';
import { Sparkles, Calendar, ArrowRight, CheckCircle2, Circle } from 'lucide-react';

interface UpcomingEventsProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
}

export default function UpcomingEvents({ events, onEventClick }: UpcomingEventsProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Get forthcoming events (excluding today) and sorted
  const forthcoming = events
    .filter(e => e.date > todayStr)
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    })
    .slice(0, 5); // display top 5

  const formatDateText = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', weekday: 'short' });
    } catch {
      return dateString;
    }
  };

  return (
    <div id="upcoming-events" className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest mb-6 border-b border-[#0F172A0F] pb-4 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Calendar size={14} className="text-[#111111]" />
          Próximos Compromissos
        </span>
        <span className="text-[10px] font-bold text-[#111111]">{forthcoming.length} Agendados</span>
      </h3>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 max-h-[450px] custom-scrollbar">
        {forthcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
            <span className="text-sm font-semibold text-[#111111]">Tudo em dia para os próximos dias</span>
            <p className="text-xs text-[#64748B] mt-1 max-w-[180px]">Nenhuma entrega ou reunião agendada no momento.</p>
          </div>
        ) : (
          forthcoming.map(event => {
            const hasChecklist = event.checklist.length > 0;
            const completedCheck = event.checklist.filter(c => c.completed).length;
            const isCompleted = event.status === 'Concluído';

            return (
              <div 
                key={event.id}
                onClick={() => onEventClick(event)}
                className="group flex gap-4 p-4 rounded-2xl border border-[#0F172A0F] hover:border-[#111111] hover:bg-[#FAFAFA] transition-all cursor-pointer items-start"
              >
                {/* Date vertical banner */}
                <div className="flex flex-col items-center justify-center min-w-[50px] bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-2 group-hover:bg-[#FFFFFF] transition-colors">
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    {formatDateText(event.date).split(' ')[0]}
                  </span>
                  <span className="text-sm font-extrabold text-[#111111] mt-0.5">
                    {formatDateText(event.date).split(' ')[1]}
                  </span>
                  <span className="text-[10px] text-[#64748B] uppercase font-medium">
                    {formatDateText(event.date).split(' ')[2]}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[11px] font-mono text-[#64748B] font-semibold">
                      {event.startTime} - {event.endTime}
                    </span>
                    <span className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                      event.category === 'Projetos' 
                        ? 'bg-[#111111] text-white' 
                        : event.category === 'Comercial' 
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                          : 'bg-[#FAFAFA] text-[#64748B] border border-[#0F172A0F]'
                    }`}>
                      {event.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-[#111111] tracking-tight truncate leading-snug">
                    {event.title}
                  </h4>

                  {/* Checklist Summary */}
                  {hasChecklist && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        {completedCheck === event.checklist.length ? (
                          <CheckCircle2 size={11} className="text-[#111111] shrink-0" />
                        ) : (
                          <Circle size={11} className="text-[#64748B] shrink-0" />
                        )}
                        Checklist: {completedCheck}/{event.checklist.length}
                      </span>
                    </div>
                  )}

                  {/* Participants Row */}
                  {event.participants.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {event.participants.slice(0, 3).map((p, idx) => (
                          <img 
                            key={idx}
                            src={p.avatar}
                            alt={p.name}
                            className="inline-block h-5 w-5 rounded-full ring-2 ring-white border border-[#0F172A0F]" 
                            title={p.name}
                          />
                        ))}
                      </div>
                      {event.participants.length > 3 && (
                        <span className="text-[9px] font-bold text-[#64748B] bg-[#FAFAFA] border border-[#0F172A0F] px-1 rounded">
                          +{event.participants.length - 3}
                        </span>
                      )}
                      <span className="text-[10px] leading-none text-[#64748B] ml-1">
                        {event.participants[0].name} e equipe
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 pt-6 border-t border-[#0F172A0F] flex items-center justify-between text-xs text-[#64748B] font-semibold cursor-pointer hover:text-[#111111] group">
        <span>Foco total ao portfólio corporativo</span>
        <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform text-[#111111]" />
      </div>
    </div>
  );
}
