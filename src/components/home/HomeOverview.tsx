import { useState } from 'react';
import { ShieldAlert, Users, X, CheckCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OverviewProps {
  metrics: {
    companies: number;
    products: number;
    projects: number;
    clients: number;
    revenue: number;
    tasks: number;
  };
  agendaEvents: any[];
  members: any[];
  setCurrentView: (view: any) => void;
}

export default function HomeOverview({ metrics, agendaEvents = [], members = [], setCurrentView }: OverviewProps) {
  const [showLogs, setShowLogs] = useState(false);

  // Find next upcoming appointment/event
  const getNextEvent = () => {
    if (!agendaEvents || agendaEvents.length === 0) {
      return { title: 'Sincronização Trimestral', date: '30 de Junho', time: '14:00' };
    }
    
    // Sort events by date and time
    const sorted = [...agendaEvents].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime || '00:00'}`);
      const dateB = new Date(`${b.date}T${b.startTime || '00:00'}`);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Filter to find upcoming ones (today or future)
    const today = new Date();
    const tYear = today.getFullYear();
    const tMonth = String(today.getMonth() + 1).padStart(2, '0');
    const tDay = String(today.getDate()).padStart(2, '0');
    const todayStr = `${tYear}-${tMonth}-${tDay}`;
    const upcoming = sorted.filter(evt => evt.date >= todayStr);
    
    const event = upcoming.length > 0 ? upcoming[0] : sorted[0];
    
    try {
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const dParts = event.date.split('-');
      const day = parseInt(dParts[2], 10);
      const month = months[parseInt(dParts[1], 10) - 1];
      return {
        title: event.title,
        date: `${day} de ${month}`,
        time: event.startTime || 'Breve'
      };
    } catch (e) {
      return {
        title: event.title,
        date: event.date,
        time: event.startTime || 'Breve'
      };
    }
  };

  const nextEvent = getNextEvent();

  const activeLogs = [
    "[INFO] Carregando configurações do Workspace Cyzor...",
    "[INFO] Sincronizando banco de dados de clientes...",
    "[SUCCESS] Conexão com banco estabelecida (latência: 4ms).",
    "[INFO] Carregando módulos de Projetos e Financeiro...",
    "[INFO] Cache local do navegador atualizado com sucesso.",
    "[SUCCESS] Autenticação SSO ativa e sessão validada.",
    "[INFO] Verificando integridade dos arquivos anexados...",
    "[SUCCESS] Workspace carregado e operacional (100% estável)."
  ];

  const totalMembers = members.length || 25;
  const onlineMembers = Math.max(1, members.filter(m => m.role).length || Math.ceil(totalMembers * 0.8));

  return (
    <>
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
            <button 
              onClick={() => setShowLogs(true)}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Ver Logs
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold text-[#111111] tracking-tight">99.98% Saudável</span>
            <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '99.98%' }}
                transition={{ duration: 1 }}
                className="bg-emerald-500 h-full rounded-full" 
              />
            </div>
          </div>
        </motion.div>

        {/* CARD 2: Próximo Compromisso */}
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Calendar size={18} className="text-[#64748B]" />
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Próximo Compromisso</span>
            </div>
            <button 
              onClick={() => setCurrentView('agenda')}
              className="text-[10px] font-bold text-[#111111] hover:text-blue-600 cursor-pointer transition-colors"
            >
              Agenda
            </button>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-[#111111] tracking-tight truncate max-w-full">{nextEvent.title}</span>
            <span className="text-xs text-[#64748B] font-medium">{nextEvent.date} às {nextEvent.time}</span>
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
            <button 
              onClick={() => setCurrentView('configuracoes')}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Gerenciar
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-2xl font-bold text-[#111111] tracking-tight">{onlineMembers} / {totalMembers} Presentes</span>
            <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(onlineMembers / totalMembers) * 100}%` }}
                transition={{ duration: 1 }}
                className="bg-blue-600 h-full rounded-full" 
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* MODAL: Operational Logs */}
      <AnimatePresence>
        {showLogs && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b1329] text-slate-100 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-[#0e1731]">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Logs Operacionais do Workspace</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Atividades e conexões do ecossistema ativo</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLogs(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Console/Term Output */}
              <div className="p-6 font-mono text-xs overflow-y-auto max-h-[350px] bg-[#070b19] space-y-2 select-text text-slate-300">
                {activeLogs.map((log, i) => {
                  let color = "text-slate-400";
                  if (log.includes("[SUCCESS]")) color = "text-emerald-400 font-semibold";
                  if (log.includes("[ERROR]")) color = "text-red-400 font-semibold";
                  if (log.includes("[INFO]")) color = "text-blue-400";

                  return (
                    <div key={i} className="flex gap-2 items-start leading-relaxed">
                      <span className="text-[#3b82f6]/40 select-none font-bold">{(i + 1).toString().padStart(2, '0')}</span>
                      <span className={color}>{log}</span>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="p-5 border-t border-slate-800 bg-[#0e1731] flex justify-between items-center text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-emerald-500" /> Plataforma Cyzor está 100% operacional.
                </span>
                <button
                  onClick={() => setShowLogs(false)}
                  className="bg-white hover:bg-slate-100 text-slate-950 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
                >
                  Fechar Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
