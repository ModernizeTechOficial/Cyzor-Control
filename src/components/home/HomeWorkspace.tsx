import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, Clock, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface TaskCardProps {
  title: string;
  dueDate: string;
  daysRemaining: number;
  progress: number;
  type: string;
  typeColor: string;
  typeBg: string;
}

const TaskCard = ({ title, dueDate, daysRemaining, progress, type, typeColor, typeBg }: TaskCardProps) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    className="bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between"
  >
    <div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-mono text-[#64748B] flex items-center gap-1.5">
          <CalendarIcon size={12} /> {dueDate}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeBg} ${typeColor}`}>
          {type}
        </span>
      </div>
      <h4 className="text-sm font-bold text-[#111111] leading-snug mb-1 tracking-tight">{title}</h4>
      <p className="text-[11px] text-[#64748B] font-medium">{daysRemaining} dias restantes</p>
    </div>
    <div className="mt-4">
      <div className="w-full bg-[#FAFAFA] h-1.5 rounded-full overflow-hidden">
        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${progress}%` }} />
      </div>
    </div>
  </motion.div>
);

export default function HomeWorkspace({ projects }: { projects: any[] }) {
  const [selectedDay, setSelectedDay] = useState<number>(29);

  // June 2026 starts on a Monday (1st) and has 30 days.
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const totalDays = 30;
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  // Highlight days with events
  const eventDays = [5, 14, 20, 26, 29];

  const getEventsForDay = (day: number) => {
    switch (day) {
      case 5:
        return [{ title: "Homologação de Clientes", time: "14:00", type: "Revisão" }];
      case 14:
        return [{ title: "Deploy de Segurança", time: "10:30", type: "Segurança" }];
      case 20:
        return [{ title: "Planejamento Trimestral", time: "09:00", type: "Planejamento" }];
      case 26:
        return [{ title: "Sincronização de Banco", time: "16:00", type: "Operacional" }];
      case 29:
        return [
          { title: "Review de Core API", time: "11:00", type: "Homologação" },
          { title: "Sincronização de Projetos", time: "15:30", type: "Sinc" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h3 className="text-base font-bold text-[#111111] tracking-tight">Cronograma & Operações</h3>
      
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Premium Calendar Widget */}
        <div className="xl:col-span-5 bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-[#111111]">Junho 2026</span>
              <span className="text-xs text-[#64748B] font-medium">Visualização Mensal</span>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-3 gap-x-2 text-center mb-6">
              {daysOfWeek.map(day => (
                <span key={day} className="text-xs font-bold text-[#94A3B8] tracking-wider uppercase">{day}</span>
              ))}
              
              {days.map(day => {
                const isSelected = selectedDay === day;
                const hasEvent = eventDays.includes(day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className="relative flex flex-col items-center justify-center p-2 focus:outline-none group"
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${isSelected ? 'bg-[#111111] text-white font-bold' : 'text-[#334155] hover:bg-slate-50'}`}>
                      {day}
                    </span>
                    {hasEvent && (
                      <span className={`absolute bottom-0 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-blue-400' : 'bg-blue-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Events Preview */}
          <div className="border-t border-[#0F172A05] pt-4 mt-auto">
            <h5 className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">Compromissos do dia {selectedDay}</h5>
            <div className="space-y-2.5">
              <AnimatePresence mode="wait">
                {getEventsForDay(selectedDay).length > 0 ? (
                  getEventsForDay(selectedDay).map((evt, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      className="flex items-center justify-between p-3 bg-[#FAFAFA] rounded-xl border border-[#0F172A03]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-7 bg-blue-600 rounded-full" />
                        <div>
                          <p className="text-xs font-bold text-[#111111] leading-tight">{evt.title}</p>
                          <p className="text-[10px] text-[#64748B] font-medium mt-0.5">{evt.time}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-0.5 rounded border border-[#0F172A05]">
                        {evt.type}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-[#94A3B8] font-medium italic py-2"
                  >
                    Nenhum compromisso agendado para esta data.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 Task Cards Grid */}
        <div className="xl:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TaskCard
            title="Gateway API Integration"
            dueDate="29 Junho"
            daysRemaining={5}
            progress={85}
            type="Produção"
            typeColor="text-emerald-700"
            typeBg="bg-emerald-50"
          />
          <TaskCard
            title="SaaS Analytics Engine"
            dueDate="02 Julho"
            daysRemaining={10}
            progress={40}
            type="Homologação"
            typeColor="text-blue-700"
            typeBg="bg-blue-50"
          />
          <TaskCard
            title="Auth SSO Integration"
            dueDate="05 Julho"
            daysRemaining={2}
            progress={95}
            type="Crítico"
            typeColor="text-red-700"
            typeBg="bg-red-50"
          />
          <TaskCard
            title="Refatoração UI/UX Home"
            dueDate="12 Julho"
            daysRemaining={15}
            progress={15}
            type="Estável"
            typeColor="text-slate-700"
            typeBg="bg-slate-100"
          />
        </div>
      </div>
    </div>
  );
}
