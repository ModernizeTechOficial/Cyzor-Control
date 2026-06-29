import { Activity, Rocket, Package, AlertCircle, RefreshCw, MoreHorizontal } from 'lucide-react';

export default function ProductActivity() {
  const activities = [
    { id: 1, type: 'deploy', text: 'Deploy realizado com sucesso', project: 'App Mobile v2.0', time: 'Há 10 min', icon: Rocket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 2, type: 'version', text: 'Nova versão publicada (v2.4.0)', project: 'Cyzor ERP', time: 'Há 2h', icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 3, type: 'error', text: 'Falha no build do ambiente', project: 'Portal RH - Staging', time: 'Há 5h', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 4, type: 'update', text: 'Atualização de dependências', project: 'Analytics Service', time: 'Há 1 dia', icon: RefreshCw, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[28px] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.01)] h-fit relative overflow-hidden">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-sm font-bold text-[#111111] flex items-center gap-2">
          <Activity size={18} className="text-[#64748B]" />
          Atividades Recentes
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-[#FAFAFA] text-[#64748B] transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6 relative z-10">
        {activities.map((act, i) => (
          <div key={act.id} className="flex gap-4 relative group cursor-default">
            {/* Timeline Line */}
            {i !== activities.length - 1 && (
              <div className="absolute left-5 top-12 bottom-[-24px] w-[2px] bg-[#0F172A05] group-hover:bg-[#0F172A0F] transition-colors" />
            )}
            
            <div className={`w-10 h-10 rounded-2xl ${act.bg} flex items-center justify-center shrink-0 border border-[#0F172A05] z-10 group-hover:scale-110 transition-transform duration-300`}>
              <act.icon size={18} className={act.color} />
            </div>
            
            <div className="pt-1">
              <p className="text-sm font-semibold text-[#111111] mb-0.5">{act.text}</p>
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <span className="font-medium">{act.project}</span>
                <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                <span>{act.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-8 py-3 rounded-xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] text-xs font-bold uppercase tracking-widest hover:bg-white hover:border-[#0F172A15] transition-all relative z-10">
        Ver todos os logs
      </button>
    </div>
  );
}
