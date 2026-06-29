import { Search, Plus, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function HomeHeader() {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <header className="flex flex-col gap-6 mb-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#111111]">{getGreeting()}, {user?.name || 'Usuário'}</h1>
          <p className="text-sm text-[#64748B]">Bem-vindo ao seu Command Center.</p>
        </div>
        <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg"><Search size={18} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><Bell size={18} /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg"><User size={18} /></button>
            <button className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider">
                <Plus size={14} /> Criar
            </button>
        </div>
      </div>
      
      <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-[#64748B] border-b border-slate-100 pb-4">
        <span>Empresa: Cyzor Corp</span>
        <span className="text-slate-300">|</span>
        <span>Workspace: Principal</span>
        <span className="text-slate-300">|</span>
        <span>Plano: Enterprise</span>
        <span className="text-slate-300">|</span>
        <span>Ambiente: Produção</span>
      </div>
    </header>
  );
}
