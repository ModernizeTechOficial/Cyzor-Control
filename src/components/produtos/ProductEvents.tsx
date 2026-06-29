import { Calendar, Rocket, RefreshCw, DownloadCloud, MoreHorizontal } from 'lucide-react';

export default function ProductEvents() {
  const events = [
    { id: 1, title: 'Deploy Agendado', product: 'App Vendas v3.0', date: 'Hoje, 23:00', type: 'deploy', icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, title: 'Renovação de Trial', product: 'Acme Corp (ERP)', date: 'Amanhã', type: 'renewal', icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, title: 'Atualização Disponível', product: 'Analytics Dash', date: '12 Jun', type: 'update', icon: DownloadCloud, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

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
        {events.map(event => (
          <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAFAFA] border border-transparent hover:border-[#0F172A08] hover:bg-white transition-all cursor-default group">
            <div className={`w-10 h-10 rounded-xl ${event.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
              <event.icon size={18} className={event.color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-0.5">
                <p className="text-sm font-semibold text-[#111111] truncate pr-2">{event.title}</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${
                  event.date.includes('Hoje') ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {event.date}
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium truncate">{event.product}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
