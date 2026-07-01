import React, { useState } from 'react';
import { Menu, Bell, Search, LogOut, Sparkles, Command, Check, CircleAlert } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { View } from '../../../types.ts';

interface AdminTopbarProps {
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setCurrentView: (view: View) => void;
}

export default function AdminTopbar({ isSidebarCollapsed, toggleSidebar, setCurrentView }: AdminTopbarProps) {
  const { user } = useAuth();
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <header className="h-16 bg-white border-b border-[#ECECEF] flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-zinc-950"
          title="Toggle Sidebar"
        >
          <Menu size={16} />
        </button>
        
        {/* Breadcrumb / OS Header */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
          <span className="text-zinc-400 font-semibold select-none">platform_hq</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-800 font-bold">dashboard</span>
          <span className="ml-3 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full border border-indigo-100 flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Live HQ Active
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-[#FAFAFB] border border-[#ECECEF] rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500/10 focus-within:border-indigo-500/30 transition-all w-80 max-w-sm shadow-inner ml-4">
          <Search size={14} className="text-zinc-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar instâncias, tenants, logs..." 
            className="bg-transparent border-none outline-none text-[11px] text-zinc-800 w-full placeholder:text-zinc-400 font-medium"
          />
          <kbd className="text-[9px] bg-white text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-[#ECECEF] select-none shrink-0 shadow-sm flex items-center gap-0.5">
            <Command size={8} />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* IA Assistant Quick Insight Trigger */}
        <button 
          onClick={() => setShowAiModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 text-[11px] font-bold transition-all shadow-sm group animate-in fade-in"
        >
          <Sparkles size={12} className="text-indigo-600 animate-pulse group-hover:scale-110 transition-transform" />
          <span>CYZOR AI Insights</span>
        </button>

        {/* Return to Tenant View */}
        <button 
          onClick={() => setCurrentView('dashboard')} 
          className="text-[11px] font-bold tracking-tight px-3 py-1.5 rounded-xl bg-zinc-950 text-white hover:bg-zinc-800 transition-all shadow-sm flex items-center gap-1.5"
        >
          <LogOut size={11} />
          <span>Ir para a App</span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotificationModal(!showNotificationModal)}
            className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500 hover:text-zinc-950 relative"
          >
            <Bell size={16} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
          </button>

          {showNotificationModal && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#ECECEF] rounded-2xl shadow-xl z-50 p-4 animate-in slide-in-from-top-2 duration-200 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECECEF] mb-3">
                <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">Notificações Recentes</span>
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">HQ Ativa</span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900">Backup diário concluído</p>
                    <p className="text-[10px] text-zinc-500">18 SaaS Databases sincronizados com sucesso.</p>
                  </div>
                </div>
                <div className="flex gap-2.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-900">Assinatura Pro criada</p>
                    <p className="text-[10px] text-zinc-500">Workspace "Inovação Tech" migrou para o plano Pro via Stripe.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-[#ECECEF]" />

        {/* Profile */}
        <div className="flex items-center gap-2.5">
          <img 
            src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} 
            alt="User profile" 
            className="w-7 h-7 rounded-full bg-zinc-100 border border-[#ECECEF]" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* IA Assistant Modal Backdrop */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-[#ECECEF] max-w-lg w-full overflow-hidden shadow-2xl animate-in scale-in-95 duration-200">
            <div className="p-6 bg-[#FAFAFB] border-b border-[#ECECEF] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-indigo-600 animate-pulse" size={18} />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-800 font-mono">Cyzor AI Core Insights</h3>
              </div>
              <button 
                onClick={() => setShowAiModal(false)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600 bg-white border border-[#ECECEF] px-2.5 py-1 rounded-xl shadow-sm"
              >
                Fechar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                <p className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Check size={14} className="text-indigo-600" />
                  Diagnóstico Automático da Infraestrutura
                </p>
                <p className="text-[11px] text-indigo-800 leading-relaxed mt-1">
                  Não existem anomalias nos microsserviços. Os clusters regionais estão operando com 99.99% de disponibilidade e latência média global de 42ms.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-mono">Sugestões de Growth</h4>
                <div className="p-3 bg-[#FAFAFB] border border-[#ECECEF] rounded-xl flex gap-3">
                  <CircleAlert size={16} className="text-zinc-600 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-600">
                    O workspace <span className="font-bold text-zinc-900">Alpha Softwares</span> consumiu 94% do limite de armazenamento de arquivos. Sugira o upgrade para o plano Enterprise.
                  </p>
                </div>
                <div className="p-3 bg-[#FAFAFB] border border-[#ECECEF] rounded-xl flex gap-3">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-zinc-600">
                    Sua receita mensal recorrente (MRR) aumentou em <span className="font-bold text-zinc-900">18.4%</span> esta semana devido a novas adesões de planos Pro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
