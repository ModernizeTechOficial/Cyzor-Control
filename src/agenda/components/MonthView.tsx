import { AgendaEvent } from '../types/agenda';
import { Plus } from 'lucide-react';
import { safeToISOString } from '../../lib/dateUtils';

interface MonthViewProps {
  selectedDate: string;
  events: AgendaEvent[];
  onEventClick: (event: AgendaEvent) => void;
  onQuickAdd: (date: string, hour: string) => void;
  setSelectedDate: (date: string) => void;
}

export default function MonthView({ selectedDate, events, onEventClick, onQuickAdd, setSelectedDate }: MonthViewProps) {
  // Extract year and month of current selected date
  const parts = selectedDate.split('-');
  const currentYear = parseInt(parts[0]);
  const currentMonthIndex = parseInt(parts[1]) - 1; // 0-indexed

  const monthLabels = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonthGrid = (year: number, monthIndex: number) => {
    // Weekday index of first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, monthIndex, 1);
    const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Align to Monday as first column

    const grid = [];
    
    // Get last day of previous month
    const prevMonthLast = new Date(year, monthIndex, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      grid.push({
        date: new Date(year, monthIndex - 1, prevMonthLast - i),
        isCurrentMonth: false
      });
    }

    // Get length of current month
    const currentLength = new Date(year, monthIndex + 1, 0).getDate();
    for (let i = 1; i <= currentLength; i++) {
      grid.push({
        date: new Date(year, monthIndex, i),
        isCurrentMonth: true
      });
    }

    // Pad remaining space for a neat 42-day calendar grid (6 rows of 7 days)
    const paddingNeeded = 42 - grid.length;
    for (let i = 1; i <= paddingNeeded; i++) {
      grid.push({
        date: new Date(year, monthIndex + 1, i),
        isCurrentMonth: false
      });
    }

    return grid;
  };

  const daysGrid = getDaysInMonthGrid(currentYear, currentMonthIndex);
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const getEventsForFormattedDate = (formattedDate: string) => {
    return events.filter(e => e.date === formattedDate);
  };

  const getEventBulletColor = (category: string) => {
    switch (category) {
      case 'Projetos': return 'bg-[#111111]';
      case 'Comercial': return 'bg-emerald-500';
      case 'Financeiro': return 'bg-violet-500';
      case 'RH': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] flex flex-col h-full min-h-[600px]">
      <div className="flex justify-between items-baseline mb-6 pb-4 border-b border-[#0F172A0F]">
        <h3 className="text-xl font-bold text-[#111111]">
          {monthLabels[currentMonthIndex]} <span className="text-[#64748B] font-medium">{currentYear}</span>
        </h3>
        <span className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest">Calendário Mensal</span>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2 text-center">
        {weekDays.map(d => (
          <div key={d} className="text-xs font-bold text-[#64748B] py-1.5 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 flex-1">
        {daysGrid.map((cell, index) => {
          const formattedCellDate = safeToISOString(cell.date)?.split('T')[0] ?? '';
          const isSelected = formattedCellDate === selectedDate;
          const isToday = cell.date instanceof Date && !isNaN(cell.date.getTime()) && cell.date.toDateString() === new Date().toDateString();
          const dayEvents = formattedCellDate ? getEventsForFormattedDate(formattedCellDate) : [];

          return (
            <div
              key={index}
              onClick={() => formattedCellDate && setSelectedDate(formattedCellDate)}
              className={`flex flex-col border rounded-2xl p-2 min-h-[90px] md:min-h-[110px] transition-all cursor-pointer group hover:bg-[#FAFAFA]/50 ${
                cell.isCurrentMonth ? 'border-[#0F172A0F]' : 'border-neutral-50 bg-[#FAFAFA]/30 opacity-40'
              } ${isSelected ? 'border-[#111111] bg-neutral-50/50' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${
                  isToday 
                    ? 'bg-[#111111] text-white shadow-sm' 
                    : isSelected 
                      ? 'border border-[#111111] text-[#111111]' 
                      : 'text-[#111111] group-hover:bg-[#FAFAFA]'
                }`}>
                  {cell.date instanceof Date && !isNaN(cell.date.getTime()) ? cell.date.getDate() : '?'}
                </span>

                {formattedCellDate && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onQuickAdd(formattedCellDate, '09:00');
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#64748B] hover:text-[#111111]"
                    title="Criar evento"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {/* Event pills/bullets */}
              <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[60px] custom-scrollbar pr-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className={`text-[9px] font-semibold px-1.5 py-0.5 rounded truncate leading-tight flex items-center gap-1 border hover:scale-[1.02] transition-transform ${
                      event.category === 'Projetos' 
                        ? 'bg-neutral-900 border-neutral-950 text-white' 
                        : 'bg-white border-[#0F172A0D] text-[#111111] hover:border-[#111111]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEventBulletColor(event.category)}`} />
                    <span className="truncate">{event.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[8px] font-bold text-[#64748B] bg-[#FAFAFA] border border-[#0F172A0F] px-1 py-0.5 rounded text-center">
                    +{dayEvents.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
