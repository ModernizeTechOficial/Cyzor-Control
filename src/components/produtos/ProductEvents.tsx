import { useState, useEffect } from 'react';
import { Calendar, Rocket, RefreshCw, DownloadCloud, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function ProductEvents() {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch('/api/milestones', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          // get upcoming milestones
          const upcoming = data
            .filter(m => m.status !== 'Concluído')
            .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())
            .slice(0, 3);
          setEvents(upcoming);
        }
      })
      .catch(e => console.error("Error fetching events:", e));
  }, [token]);

  const formatDate = (d: string) => {
    if (!d) return 'Sem data';
    const date = new Date(d);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return 'Hoje';
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) return 'Amanhã';

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] h-fit">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
          <Calendar size={18} className="text-[#64748B]" />
          Próximos Eventos
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-[#FAFAFA] text-[#64748B] transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {events.length === 0 ? (
          <p className="text-xs text-[#64748B]">Nenhum evento futuro programado.</p>
        ) : events.map(event => {
          const dateStr = formatDate(event.targetDate);
          return (
            <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-[#0F172A08] hover:bg-white transition-all cursor-default group">
              <div className={`w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                <Rocket size={18} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-sm font-semibold text-[#111111] truncate pr-2">{event.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                    dateStr === 'Hoje' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {dateStr}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-medium truncate">{event.description || 'Marco do projeto'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
