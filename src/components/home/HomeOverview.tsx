import { ShieldAlert, Cpu, Users } from 'lucide-react';
import { motion } from 'motion/react';

interface KPIProps {
  metrics: {
    companies: number;
    products: number;
    projects: number;
    clients: number;
    revenue: number;
    deploys: number;
  };
}

export default function HomeOverview({ metrics }: KPIProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CARD 1: Status Operacional */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <ShieldAlert size={18} className="text-[#64748B]" />
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Status Operacional</span>
          </div>
          <span className="text-[10px] font-bold text-[#111111] hover:text-blue-600 cursor-pointer transition-colors">Ver Logs</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold text-[#111111] tracking-tight">94.2% Saudável</span>
          <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '94.2%' }}
              transition={{ duration: 1 }}
              className="bg-emerald-500 h-full rounded-full" 
            />
          </div>
        </div>
      </motion.div>

      {/* CARD 2: Próximo Deploy */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Cpu size={18} className="text-[#64748B]" />
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Próximo Deploy</span>
          </div>
          <span className="text-[10px] font-bold text-[#111111] hover:text-blue-600 cursor-pointer transition-colors">Agendar</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-[#111111] tracking-tight">v2.4.0 (Core)</span>
          <span className="text-xs text-[#64748B] font-medium">Hoje, em 40 minutos</span>
        </div>
      </motion.div>

      {/* CARD 3: Membros Ativos */}
      <motion.div
        whileHover={{ y: -2 }}
        className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Users size={18} className="text-[#64748B]" />
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Equipe Online</span>
          </div>
          <span className="text-[10px] font-bold text-[#111111] hover:text-blue-600 cursor-pointer transition-colors">Gerenciar</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-2xl font-bold text-[#111111] tracking-tight">21 / 25 Presentes</span>
          <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(21/25)*100}%` }}
              transition={{ duration: 1 }}
              className="bg-blue-600 h-full rounded-full" 
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
