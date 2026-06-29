import { Activity, Download, Users, Key, Server, Rocket, MoreHorizontal } from 'lucide-react';

export default function ProductMetrics() {
  const metrics = [
    { label: 'Receita', value: 'R$ 84.5k', trend: '+12%', up: true, icon: Activity },
    { label: 'Downloads', value: '12.4k', trend: '+5%', up: true, icon: Download },
    { label: 'Clientes Ativos', value: '842', trend: '+18', up: true, icon: Users },
    { label: 'Licenças', value: '1.2k', trend: '-2', up: false, icon: Key },
    { label: 'Instâncias', value: '45', trend: 'Estável', up: true, icon: Server },
    { label: 'Deploys Mensais', value: '128', trend: '+24', up: true, icon: Rocket },
  ];

  return (
    <div className="bg-[#111111] rounded-[28px] p-6 sm:p-8 shadow-[0_20px_40px_rgb(0,0,0,0.1)] relative overflow-hidden text-white h-fit group">
      {/* Background visual elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full mix-blend-screen pointer-events-none" />
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="text-sm font-bold flex items-center gap-2 text-white/90">
          <Activity size={18} className="text-white/50" />
          Métricas Globais
        </h3>
        <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-white/50">
              <m.icon size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">{m.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-lg font-bold text-white tracking-tight">{m.value}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${m.up ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {m.trend}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
