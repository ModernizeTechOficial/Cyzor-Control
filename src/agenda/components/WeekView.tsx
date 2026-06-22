import { AgendaEvent } from '../types/agenda';
import { Plus, Video, MapPin, CheckSquare } from 'lucide-react';
import { safeToISOString } from '../../lib/dateUtils';

interface WeekViewProps {
  selectedDate: string;
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  onQuickAdd: (date: string, hour: string) => void;
  setSelectedDate: (date: string) => void;
}

export default function WeekView({ selectedDate, events, onEventClick, onQuickAdd, setSelectedDate }: WeekViewProps) {
  // Helper to calculate days of the week containing selectedDate
  const getDaysOfWeek = (dateString: string) => {
    try {
      const parts = dateString.split('-');
      const baseDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      const dayIndex = baseDate.getDay(); // 0 is Sunday, 1 is Monday ...
      
      // Calculate start of week (Monday)
      const mondayOffset = dayIndex === 0 ? -6 : 1 - dayIndex;
      const startOfWeek = new Date(baseDate);
      startOfWeek.setDate(baseDate.getDate() + mondayOffset);
      
      const weekdays = [];
      for (let i = 0; i < 7; i++) {
        const nextDay = new Date(startOfWeek);
        nextDay.setDate(startOfWeek.getDate() + i);
        weekdays.push(nextDay);
      }
      return weekdays;
    } catch {
      // Fallback to today and next 6 days
      const fallback = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        fallback.push(d);
      }
      return fallback;
    }
  };

  const weekdays = getDaysOfWeek(selectedDate);

  const getEventsForDay = (day: Date) => {
    // if (!(day instanceof Date) || isNaN(day.getTime())) return [];
    const formattedDay = safeToISOString(day)?.split('T')[0] ?? '';
    return events
      .filter(e => e.date === formattedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getCategoryColor = (event: AgendaEvent) => {
    if (event.isTimeBlock) {
      return 'border-[#3B82F633] bg-blue-50 hover:bg-blue-100/70 text-blue-950 font-medium border-l-4';
    }
    switch (event.category) {
      case 'Projetos':
        return 'border-neutral-900 bg-neutral-900 hover:bg-black text-white';
      case 'Comercial':
        return 'border-emerald-100 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-950 font-medium border-l-4';
      case 'Financeiro':
        return 'border-violet-100 bg-violet-50 hover:bg-violet-100/70 text-violet-950 font-medium border-l-4';
      case 'RH':
        return 'border-amber-100 bg-amber-50 hover:bg-amber-100/70 text-amber-950 font-medium border-l-4';
      case 'Marketing':
        return 'border-rose-100 bg-rose-50 hover:bg-rose-100/70 text-rose-950 font-medium border-l-4';
      case 'Tecnologia':
        return 'border-blue-100 bg-blue-50 hover:bg-blue-100/70 text-blue-950 font-medium border-l-4';
      case 'Administrativo':
        return 'border-slate-100 bg-slate-50 hover:bg-slate-100/70 text-slate-950 font-medium border-l-4';
      default:
        return 'border-[#0F172A14] bg-[#FAFAFA] hover:bg-slate-100/70 text-[#111111] border-l-4';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col min-h-[600px] w-full">
      <div className="overflow-x-auto pb-4 -mx-2 px-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-stretch flex-1 min-w-0 md:min-w-[950px] xl:min-w-0">
          {weekdays.map((day, idx) => {
            const safeDate = day instanceof Date && !isNaN(day.getTime());
            const formattedDay = safeDate ? day.toISOString().split('T')[0] : '';
            const isSelected = formattedDay === selectedDate;
            const isToday = safeDate && day.toDateString() === new Date().toDateString();
            const dayEvents = safeDate ? getEventsForDay(day) : [];

            return (
              <div 
                key={idx}
                className={`flex flex-col border rounded-[22px] p-4 transition-all duration-300 min-h-[420px] ${
                  isSelected 
                    ? 'border-[#111111] bg-neutral-50/40 shadow-[0_4px_20px_rgba(0,0,0,0.01)]' 
                    : 'border-[#0F172A0F] bg-white hover:bg-[#FAFAFA]/40'
                }`}
              >
                {/* Day Header */}
                <div 
                  onClick={() => formattedDay && setSelectedDate(formattedDay)}
                  className="flex flex-col items-center justify-center cursor-pointer border-b border-[#0F172A0D] pb-3 mb-4 text-center group"
                >
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#111111] transition-colors">
                    {safeDate ? day.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '') : '?'}
                  </span>
                  
                  <div className={`mt-1.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold transition-all ${
                    isToday 
                      ? 'bg-[#111111] text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)]' 
                      : isSelected 
                        ? 'border border-[#111111] text-[#111111]' 
                        : 'text-[#111111] group-hover:bg-[#FAFAFA]'
                  }`}>
                    {safeDate ? day.getDate() : '?'}
                  </div>
                </div>

                {/* Day Events stack */}
                <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[420px] custom-scrollbar pr-1">
                  {dayEvents.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-[11px] text-[#64748B] font-medium py-8 opacity-60">
                      Sem agenda
                    </div>
                  ) : (
                    dayEvents.map(event => {
                      const isCompleted = event.status === 'Concluído';
                      
                      return (
                        <div
                          key={event.id}
                          onClick={() => onEventClick(event)}
                          className={`border rounded-xl p-3 cursor-pointer text-left transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[95px] ${getCategoryColor(event)} ${isCompleted ? 'opacity-50' : 'shadow-[0_2px_8px_rgba(0,0,0,0.01)]'}`}
                        >
                          <div>
                            <div className="text-[9px] font-mono font-bold uppercase opacity-80 flex items-center justify-between">
                              <span>{event.startTime} - {event.endTime}</span>
                              {event.isTimeBlock && <span className="text-[8px] bg-sky-200/55 text-sky-950 px-1 rounded font-sans uppercase">Bloq</span>}
                            </div>
                            
                            <h5 className="text-xs font-bold mt-1.5 line-clamp-2 leading-snug tracking-tight">
                              {event.title}
                            </h5>
                          </div>
                          
                          {event.location && event.location !== 'Web' && (
                            <span className="text-[9.5px] block mt-1.5 truncate opacity-75 font-semibold">
                              📍 {event.location}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add at bottom */}
                <button 
                  onClick={() => formattedDay && onQuickAdd(formattedDay, '09:00')}
                  className="mt-4 w-full py-2 hover:bg-[#FAFAFA] border border-dashed border-[#0F172A0D] rounded-xl text-[10px] font-bold text-[#64748B] uppercase tracking-wider hover:text-[#111111] transition-all flex items-center justify-center gap-1"
                >
                  <Plus size={11} />
                  Adicionar
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
