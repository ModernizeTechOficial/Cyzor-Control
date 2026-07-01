import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  Check, 
  Lock, 
  Activity,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../hooks/useBranding';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onUpgrade }: WelcomeModalProps) {
  const { dbUser } = useAuth();
  const { appName, logoUrl } = useBranding();
  
  const currentPlan = dbUser?.currentPlan || 'free';
  const isPaid = currentPlan.toLowerCase() !== 'free';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Deep blur overlay for maximum visual refinement */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md"
          />
          
          {/* Main Card Canvas */}
          <motion.div
            initial={{ scale: 0.97, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.97, opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-[0_32px_80px_-20px_rgba(0,0,0,0.12)] border border-[#ECECEF] overflow-hidden flex flex-col z-10"
          >
            {/* Top Minimalist Header Bar */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-950 flex items-center justify-center border border-zinc-900 shadow-sm overflow-hidden select-none">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-5 h-5 object-contain" />
                  ) : (
                    <span className="text-white font-extrabold text-xs tracking-tight">{appName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black tracking-wider text-zinc-950 uppercase font-mono">{appName} SYSTEMS</span>
                  <span className="text-[9px] text-zinc-400 font-medium">Console de Operações</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700 font-mono uppercase tracking-wider select-none">
                  <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                  Sessão Segura
                </span>
                
                <button 
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FAFAFB] hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 border border-[#ECECEF] transition-all"
                  aria-label="Fechar"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Core Body Container */}
            <div className="p-8 md:p-10 space-y-8">
              
              {/* Dynamic Personalized Hero */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 text-indigo-600">
                  <Sparkles size={14} className="animate-pulse" />
                  <span className="text-[10px] font-extrabold font-mono tracking-widest uppercase">Acesso Autorizado</span>
                </div>
                
                <div>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-950 tracking-tight leading-none mb-2">
                    Bem-vindo de volta, <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 via-indigo-950 to-indigo-600">{dbUser?.displayName?.split(' ')[0] || 'Diego'}</span>
                  </h2>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed max-w-xl">
                    Seu cockpit operacional de monitoramento, infraestrutura e finanças foi carregado. Suas chaves de segurança e microsserviços estão prontos para execução de alta performance.
                  </p>
                </div>
              </div>

              {/* Advanced System Overview Bento (Clean Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Bento Card 1: Subscription Tier status */}
                <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[24px] p-5 hover:border-zinc-300 transition-all flex flex-col justify-between h-40">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                      <Zap size={16} className="text-indigo-600" />
                    </div>
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-xl font-mono ${isPaid ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-800'}`}>
                      Plano {currentPlan}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">STATUS DA CONTA</span>
                    <h3 className="text-sm font-bold text-zinc-950">
                      {isPaid ? 'Assinatura Pro Corporativa Ativa' : 'Período de Testes Corporativo'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {isPaid ? 'Acesso ilimitado e whitelabel ativado.' : 'Sua licença possui 14 dias de acesso completo.'}
                    </p>
                  </div>
                </div>

                {/* Bento Card 2: Security Credentials */}
                <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[24px] p-5 hover:border-zinc-300 transition-all flex flex-col justify-between h-40">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-zinc-950/5 border border-zinc-950/10 flex items-center justify-center">
                      <ShieldCheck size={16} className="text-zinc-900" />
                    </div>
                    <span className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 bg-zinc-900 text-white rounded-xl font-mono">
                      E2E Encrypted
                    </span>
                  </div>

                  <div className="space-y-1 mt-4">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block font-mono">SEGURANÇA CORPORATIVA</span>
                    <h3 className="text-sm font-bold text-zinc-950">Privacidade Blindada</h3>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Chaves de API ocultas no backend e dados blindados via Google Cloud Firebase.
                    </p>
                  </div>
                </div>

                {/* Bento Card 3: Connected Integrations list */}
                <div className="bg-[#FAFAFB] border border-[#ECECEF] rounded-[24px] p-5 hover:border-zinc-300 transition-all flex flex-col justify-between h-36 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-zinc-950/5 border border-zinc-950/10 flex items-center justify-center">
                        <Layers size={16} className="text-zinc-900" />
                      </div>
                      <span className="text-xs font-bold text-zinc-950">Módulos Corporativos Sincronizados</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                      <span className="text-[9px] font-bold text-zinc-500 font-mono uppercase tracking-wider">Sync OK</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-indigo-600 shrink-0" strokeWidth={3} />
                      <span className="text-[10px] text-zinc-600 font-medium font-mono">Financeiro</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-indigo-600 shrink-0" strokeWidth={3} />
                      <span className="text-[10px] text-zinc-600 font-medium font-mono">IA CoPilot</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-indigo-600 shrink-0" strokeWidth={3} />
                      <span className="text-[10px] text-zinc-600 font-medium font-mono">Projetos</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Check size={12} className="text-indigo-600 shrink-0" strokeWidth={3} />
                      <span className="text-[10px] text-zinc-600 font-medium font-mono">Workspaces</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Dynamic Action Call to Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-zinc-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-widest">
                    <UserCheck size={12} className="text-zinc-400" />
                    Identificação de Sessão
                  </div>
                  <span className="text-xs text-zinc-500 font-medium block">
                    Conectado como <span className="text-zinc-950 font-semibold">{dbUser?.email}</span>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                  {!isPaid && (
                    <button
                      onClick={onUpgrade}
                      className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 text-center"
                    >
                      ATIVAR PLANO PRO
                    </button>
                  )}

                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/15 active:scale-95"
                  >
                    <span>ACESSAR COCKPIT</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

            </div>

            {/* Premium Cryptographic Footer Bar */}
            <div className="bg-[#FAFAFB] border-t border-[#ECECEF] px-8 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock size={10} className="text-zinc-400" />
                <span className="text-[9px] font-mono text-zinc-400 tracking-wider uppercase font-semibold">CYZOR_ENCRYPTION_LAYER_ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-zinc-400">
                <Activity size={10} className="text-emerald-500 animate-pulse" />
                <span>SERVER: ONLINE</span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
