import { Users, Bot, HardDrive, Server, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export default function WorkspaceStatus({ stats }: { stats?: any }) {
  const status = [
    { label: 'Usuários no Workspace', value: stats?.members?.toString() || '0', icon: Users, color: 'text-blue-500' },
    { label: 'Agentes IA Ativos', value: '08', icon: Bot, color: 'text-purple-500' },
    { label: 'Backup Cloud', value: 'Sucesso', icon: HardDrive, color: 'text-emerald-500' },
    { label: 'Status Servidor', value: '99.9%', icon: Server, color: 'text-emerald-500' },
    { label: 'Latência API', value: '14ms', icon: Activity, color: 'text-amber-500' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-[#0F172A08] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] h-full relative overflow-hidden group"
    >
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#111_1px,transparent_1px)] [background-size:16px_16px]" />
      
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight">Workspace Status</h3>
            <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em]">Operational Health Details</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Stable</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {status.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#FAFAFA] border border-transparent hover:border-[#0F172A08] hover:bg-white rounded-2xl transition-all group/item">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white border border-[#0F172A08] ${item.color} group-hover/item:scale-110 transition-transform`}>
                  <item.icon size={16} strokeWidth={2.5} />
                </div>
                <span className="text-[13px] font-bold text-[#64748B] group-hover/item:text-[#111111] transition-colors">{item.label}</span>
              </div>
              <span className="text-[13px] font-black text-[#111111] tracking-tight">{item.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-[#0F172A05]">
           <div className="flex items-center justify-between">
              <div className="flex flex-col">
                 <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest opacity-40">Data Center</span>
                 <span className="text-[11px] font-bold text-[#111111]">AWS us-east-1</span>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest opacity-40">Uptime</span>
                 <span className="text-[11px] font-bold text-[#111111]">142 dias</span>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
