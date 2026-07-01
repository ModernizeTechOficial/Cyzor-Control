import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Server, 
  Users, 
  CreditCard, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  ChevronRight, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { useEvents, PlatformEvent } from '../../context/EventContext.tsx';

interface EventDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  category: 'deploys' | 'users' | 'billing' | 'infrastructure' | 'logs' | 'all';
  onNavigateToView?: (view: string) => void;
}

export default function EventDrawer({ isOpen, onClose, category, onNavigateToView }: EventDrawerProps) {
  const { getEventsByCategory, events } = useEvents();

  const activeEvents = category === 'all' 
    ? events 
    : getEventsByCategory(category as any);

  // Helper to resolve Category Label & Colors
  const getCategoryMeta = () => {
    switch (category) {
      case 'deploys':
        return { label: 'Deploys & Workspaces', icon: Server, color: 'text-indigo-600' };
      case 'users':
        return { label: 'Usuários & Clientes', icon: Users, color: 'text-[#06B6D4]' };
      case 'billing':
        return { label: 'Faturamento & Stripe', icon: CreditCard, color: 'text-emerald-600' };
      case 'infrastructure':
        return { label: 'Infraestrutura Cloud', icon: Cpu, color: 'text-amber-500' };
      case 'logs':
        return { label: 'Logs & Auditoria', icon: Activity, color: 'text-[#8B5CF6]' };
      default:
        return { label: 'Eventos em Tempo Real', icon: Activity, color: 'text-indigo-600' };
    }
  };

  const meta = getCategoryMeta();
  const IconHeader = meta.icon;

  // Helper for Status Badge styling
  const getStatusStyle = (status: PlatformEvent['status']) => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          icon: CheckCircle2,
          iconColor: 'text-emerald-500'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-100 text-amber-800',
          icon: AlertTriangle,
          iconColor: 'text-amber-500'
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-100 text-rose-700',
          icon: XCircle,
          iconColor: 'text-rose-500'
        };
      default:
        return {
          bg: 'bg-zinc-50 border-zinc-200 text-zinc-700',
          icon: Info,
          iconColor: 'text-indigo-500'
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10005] flex justify-end">
          {/* Smooth blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/20 backdrop-blur-sm"
          />

          {/* Drawer Body Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative w-full max-w-md bg-white h-full shadow-[0_0_50px_rgba(0,0,0,0.08)] border-l border-[#ECECEF] flex flex-col z-10"
          >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#ECECEF] bg-[#FAFAFB]">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white border border-[#ECECEF] shadow-sm ${meta.color}`}>
                  <IconHeader size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-950 tracking-tight leading-tight">
                    {meta.label}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-mono font-medium uppercase tracking-wider mt-0.5">
                    Centro de Observabilidade
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white border border-[#ECECEF] hover:bg-zinc-50 text-zinc-400 hover:text-zinc-900 transition-all flex items-center justify-center active:scale-95 shadow-sm"
              >
                <X size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Events Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-zinc-200">
              {activeEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-400">
                    <Activity size={20} className="stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 font-mono uppercase tracking-wider">Nenhum evento recente</h4>
                    <p className="text-[11px] text-zinc-500 max-w-[200px] mt-1">
                      Nenhuma atividade operacional foi registrada neste canal até o momento.
                    </p>
                  </div>
                </div>
              ) : (
                activeEvents.map((item) => {
                  const statusMeta = getStatusStyle(item.status);
                  const StatusIcon = statusMeta.icon;

                  return (
                    <div 
                      key={item.id}
                      className="group relative bg-white border border-[#ECECEF] hover:border-zinc-300 rounded-[20px] p-4 transition-all duration-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm flex gap-3.5"
                    >
                      {/* Left icon container */}
                      <div className="shrink-0 pt-0.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${statusMeta.bg} border shadow-sm`}>
                          <StatusIcon size={14} className={statusMeta.iconColor} />
                        </div>
                      </div>

                      {/* Content column */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-zinc-950 tracking-tight leading-tight break-words">
                            {item.title}
                          </h4>
                          <span className="text-[9px] text-zinc-400 font-semibold font-mono shrink-0 flex items-center gap-1">
                            <Clock size={10} />
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                          {item.description}
                        </p>

                        {/* Extra metadata and actions */}
                        <div className="flex items-center justify-between pt-1.5 border-t border-zinc-50 text-[10px]">
                          {item.workspaceName && (
                            <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-50 border border-[#ECECEF] px-2 py-0.5 rounded-lg truncate max-w-[180px]">
                              {item.workspaceName}
                            </span>
                          )}

                          {item.linkTo && onNavigateToView && (
                            <button
                              onClick={() => {
                                onNavigateToView(item.linkTo!);
                                onClose();
                              }}
                              className="text-indigo-600 hover:text-indigo-900 font-bold flex items-center gap-0.5 transition-all active:translate-x-0.5 ml-auto"
                            >
                              <span>Gerenciar</span>
                              <ChevronRight size={12} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Cryptographic System Bar */}
            <div className="bg-[#FAFAFB] border-t border-[#ECECEF] p-4 flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1 uppercase tracking-wider font-semibold">
                SYSTEM CORRELATOR ACTIVE
              </span>
              <span className="text-zinc-500 font-bold bg-zinc-200/50 px-1.5 py-0.5 rounded">
                Real-Time OK
              </span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
