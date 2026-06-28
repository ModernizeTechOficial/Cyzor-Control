import { motion } from "motion/react";
import { CreditCard, Package, Users, Server, ChevronRight } from "lucide-react";

interface Alert {
  id: string;
  category: 'Financeiro' | 'Projetos' | 'Clientes' | 'Infraestrutura';
  message: string;
  time: string;
}

export default function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const getIcon = (category: string) => {
    switch (category) {
      case 'Financeiro': return <CreditCard size={14} strokeWidth={2.5} />;
      case 'Projetos': return <Package size={14} strokeWidth={2.5} />;
      case 'Clientes': return <Users size={14} strokeWidth={2.5} />;
      case 'Infraestrutura': return <Server size={14} strokeWidth={2.5} />;
      default: return <Server size={14} strokeWidth={2.5} />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {['Financeiro', 'Projetos', 'Infraestrutura'].map((cat) => (
        <div key={cat} className="bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] hover:shadow-[0_12px_24px_rgb(0,0,0,0.02)] transition-all group cursor-default relative overflow-hidden">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#0F172A0F] flex items-center justify-center group-hover:scale-110 transition-transform ${
                  cat === 'Financeiro' ? 'text-emerald-500' : 
                  cat === 'Projetos' ? 'text-blue-500' : 
                  'text-[#111111]'
                }`}>
                  {getIcon(cat)}
                </div>
                <h4 className="text-[9px] font-black text-[#111111] uppercase tracking-[0.2em]">{cat}</h4>
              </div>
              <span className="text-[9px] font-black text-[#64748B] bg-[#F8FAFC] px-2 py-0.5 rounded-md">
                {alerts.filter(a => a.category === cat).length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              {alerts.filter(a => a.category === cat).slice(0, 1).map((alert) => (
                <motion.div 
                  key={alert.id} 
                  whileHover={{ x: 2 }}
                  className="flex flex-col gap-1 cursor-pointer group/item"
                >
                  <p className="text-[12px] font-bold text-[#111111] leading-tight tracking-tight group-hover/item:text-blue-600 transition-colors line-clamp-1">{alert.message}</p>
                  <span className="text-[8px] font-black text-[#64748B] uppercase tracking-widest opacity-40">{alert.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
