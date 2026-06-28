import { Plus, Rocket, Building2, Users, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';
import { View } from '../../types';

export default function QuickActions({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const actions = [
    { label: 'Novo Projeto', icon: Plus, color: 'text-blue-600', bg: 'bg-blue-50', view: 'projetos' },
    { label: 'Nova Empresa', icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50', view: 'empresas' },
    { label: 'Novo Cliente', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', view: 'crm' },
    { label: 'Nova Ideia', icon: Lightbulb, color: 'text-amber-600', bg: 'bg-amber-50', view: 'sandbox' },
    { label: 'Deploy', icon: Rocket, color: 'text-red-600', bg: 'bg-red-50', view: 'infra' },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
      {actions.map((action, i) => (
        <motion.button
          key={i}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView(action.view as View)}
          className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#0F172A08] rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap group"
        >
          <div className={`w-8 h-8 ${action.bg} ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <action.icon size={16} strokeWidth={2.5} />
          </div>
          <span className="text-[12px] font-bold text-[#111111] tracking-tight">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
