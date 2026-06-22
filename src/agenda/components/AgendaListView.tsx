import { AgendaEvent } from '../types/agenda';
import { Video, MapPin, CheckSquare, Shield, Clock, MessageSquare, Paperclip, CheckCircle } from 'lucide-react';

interface AgendaListViewProps {
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  selectedDate: string;
}

export default function AgendaListView({ events, onEventClick, selectedDate }: AgendaListViewProps) {
  // Group events by date
  // Sort dates chronologically starting from selectedDate (or all dates)
  const sortedEvents = [...events].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const getUniqueDates = () => {
    const dates = new Set(sortedEvents.map(e => e.date));
    return Array.from(dates).sort();
  };

  const datesToRender = getUniqueDates();

  const formatDateText = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const isToday = date.toDateString() === new Date().toDateString();
      const weekday = date.toLocaleDateString('pt-BR', { weekday: 'long' });
      const dayMonth = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
      
      return `${isToday ? 'Hoje, ' : ''}${dayMonth} (${weekday})`;
    } catch {
      return dateString;
    }
  };

  const getEventBadgeClass = (category: string) => {
    switch (category) {
      case 'Projetos': return 'bg-neutral-900 border-neutral-950 text-white';
      case 'Comercial': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Financeiro': return 'bg-violet-50 text-violet-800 border-violet-200';
      case 'RH': return 'bg-amber-50 text-amber-800 border-amber-200';
      default: return 'bg-neutral-50 text-neutral-800 border-neutral-200';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-center pb-6 border-b border-[#0F172A0F] mb-6">
        <h3 className="text-xl font-bold text-[#111111]">Centro de Organização Diária</h3>
        <span className="text-xs text-[#64748B] font-semibold">{events.length} Eventos Cadastrados</span>
      </div>

      <div className="flex-1 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar flex flex-col gap-8">
        {datesToRender.length === 0 ? (
          <div className="text-center py-16 text-[#64748B]">
            <p className="font-semibold text-[#111111]">Nenhum compromisso cadastrado</p>
            <p className="text-xs mt-1">Utilize o botão "Novo Compromisso" para adicionar à sua agenda.</p>
          </div>
        ) : (
          datesToRender.map(dateString => {
            const dateEvents = sortedEvents.filter(e => e.date === dateString);

            return (
              <div key={dateString} className="flex flex-col gap-4">
                <h4 className="text-sm font-bold text-[#111111] uppercase tracking-wider bg-[#FAFAFA] border border-[#0F172A0F] px-4 py-2.5 rounded-xl flex items-center justify-between">
                  <span>{formatDateText(dateString)}</span>
                  <span className="text-[10px] bg-white border border-[#0F172A0F] px-2 py-0.5 rounded-full lowercase font-mono">
                    {dateEvents.length} {dateEvents.length === 1 ? 'evento' : 'eventos'}
                  </span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateEvents.map(event => {
                    const isCompleted = event.status === 'Concluído';
                    const completedChecklist = event.checklist.filter(c => c.completed).length;

                    return (
                      <div
                        key={event.id}
                        onClick={() => onEventClick(event)}
                        className={`group border rounded-[22px] p-5 cursor-pointer transition-all duration-300 hover:border-[#111111] hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] flex flex-col justify-between ${
                          isCompleted 
                            ? 'bg-[#FAFAFA]/60 border-[#0F172A0F] opacity-60' 
                            : event.isTimeBlock 
                              ? 'bg-blue-50/10 border-blue-100' 
                              : 'bg-white border-[#0F172A0F]'
                        }`}
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-mono font-bold text-[#111111]">
                              {event.startTime} - {event.endTime}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${getEventBadgeClass(event.category)}`}>
                              {event.category}
                            </span>
                          </div>

                          <h5 className={`text-base font-bold text-[#111111] tracking-tight leading-tight group-hover:text-black ${isCompleted ? 'line-through' : ''}`}>
                            {event.title}
                          </h5>

                          <p className="text-xs text-[#64748B] line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        </div>

                        {/* Event tags & details */}
                        <div className="mt-4 pt-4 border-t border-[#0F172A0D] flex flex-wrap justify-between items-center gap-2">
                          <div className="flex items-center gap-3 text-[11px] text-[#64748B] font-medium">
                            {event.location && (
                              <span className="flex items-center gap-1 max-w-[140px] truncate">
                                <MapPin size={12} className="shrink-0 text-[#111111]" />
                                {event.location}
                              </span>
                            )}
                            {event.linkedProject && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="shrink-0" />
                                {event.linkedProject.name}
                              </span>
                            )}
                          </div>

                          {/* Quick statistics checklist, comments, files */}
                          <div className="flex items-center gap-2.5">
                            {event.checklist.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-[#111111] font-mono font-bold bg-[#FAFAFA] border border-[#0F172A0F] px-1.5 py-0.5 rounded">
                                <CheckSquare size={10} />
                                {completedChecklist}/{event.checklist.length}
                              </span>
                            )}
                            {event.comments.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B] font-semibold">
                                <MessageSquare size={10} />
                                {event.comments.length}
                              </span>
                            )}
                            {event.attachments.length > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-[#64748B]">
                                <Paperclip size={10} />
                                {event.attachments.length}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
