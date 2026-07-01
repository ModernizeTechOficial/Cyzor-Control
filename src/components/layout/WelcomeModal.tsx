import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, CheckCircle2, Rocket, ArrowRight, X, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBranding } from '../../hooks/useBranding';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onUpgrade }: WelcomeModalProps) {
  const { dbUser } = useAuth();
  const { appName, logoUrl, logoSize } = useBranding();
  
  const currentPlan = dbUser?.currentPlan || 'free';
  const isPaid = currentPlan.toLowerCase() !== 'free';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0F172A60] backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.15)] border border-[#0F172A0F] overflow-hidden flex flex-col md:flex-row"
          >
            {/* Left Decorative Sidebar (Tech Style) */}
            <div className="w-full md:w-48 bg-[#111111] p-8 flex flex-col items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
                <div className="grid grid-cols-4 gap-1 p-4">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
                  ))}
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-xl">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ height: '32px' }} className="object-contain" />
                  ) : (
                    <span className="text-white font-black text-2xl uppercase">{appName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Cyzor_ID</span>
                </div>
              </div>

              <div className="relative z-10 flex flex-col gap-2 w-full">
                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-blue-500" 
                  />
                </div>
                <span className="text-[8px] font-mono text-white/30 text-center uppercase tracking-widest">System_Sync_092</span>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 sm:p-12 bg-white relative">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all z-10 border border-gray-100"
              >
                <X size={20} />
              </button>

              <div className="text-left">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Bem-vindo à Central</span>
                </div>

                <h2 className="text-4xl font-black text-[#111111] mb-4 tracking-tighter leading-tight">
                  Olá, <span className="text-blue-600">{dbUser?.displayName?.split(' ')[0] || 'Gestor'}</span>
                </h2>
                
                <p className="text-[#64748B] mb-10 leading-relaxed font-medium text-lg max-w-sm">
                  Seu ambiente operacional está pronto. Vamos elevar o nível da sua gestão estratégica.
                </p>

                {/* Status Dashboard Panel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                  <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F] group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                        <Zap size={16} className={!isPaid ? "text-amber-500" : "text-blue-500"} />
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${!isPaid ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                        {currentPlan.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status do Plano</p>
                    <p className="text-sm font-bold text-[#111111]">
                      {!isPaid ? 'Período de Teste Ativo' : 'Assinatura Pro Ativa'}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#FAFAFA] border border-[#0F172A0F] group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm border border-gray-100">
                        <Rocket size={16} className="text-blue-500" />
                      </div>
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-blue-100"></div>
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-100"></div>
                      </div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Acesso Global</p>
                    <p className="text-sm font-bold text-[#111111]">Recursos Desbloqueados</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {!isPaid ? (
                    <button
                      onClick={onUpgrade}
                      className="w-full sm:w-auto px-8 h-14 bg-[#111111] hover:bg-black text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-black/10 active:scale-[0.98]"
                    >
                      Ativar Plano Pro
                      <ArrowRight size={18} />
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-8 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                    >
                      Acessar Dashboard
                      <ArrowRight size={18} />
                    </button>
                  )}
                  
                  {!isPaid && (
                    <button
                      onClick={onClose}
                      className="w-full sm:w-auto px-8 h-14 rounded-2xl font-bold text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all flex items-center justify-center"
                    >
                      Continuar no Trial
                    </button>
                  )}
                </div>

                {!isPaid && (
                  <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={16} className="text-amber-500" />
                    </div>
                    <p className="text-[11px] text-[#94A3B8] font-medium leading-relaxed">
                      Sua conta possui <span className="text-amber-600 font-bold">14 dias de acesso premium</span>. <br /> Experimente a inteligência artificial sem compromisso.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
