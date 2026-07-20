import { motion } from 'motion/react';
import { Target, Activity, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  dueDate?: string;
}

export default function ProjectPulse({ projects }: { projects: Project[] }) {
  const activeProjects = projects.filter(p => p.status !== 'Concluido' && p.status !== 'CONCLUÍDO').slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'em andamento': return 'text-blue-600 bg-blue-50';
      case 'atrasado': return 'text-rose-600 bg-rose-50';
      case 'planejado': return 'text-slate-600 bg-slate-50';
      default: return 'text-indigo-600 bg-indigo-50';
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1.5 leading-none">Visão de Entrega</span>
          <h3 className="text-xl font-display font-black text-slate-900 tracking-tight">Pulso de Projetos Ativos</h3>
        </div>
        <button className="p-2 hover:bg-white rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100">
          <MoreHorizontal size={20} className="text-slate-400" />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {activeProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Target className="w-7 h-7 text-slate-300 mb-2" />
            <p className="text-[12px] font-medium text-slate-500">Nenhum projeto ativo.</p>
          </div>
        ) : (
          activeProjects.map((project, idx) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col gap-2.5 group cursor-pointer hover:-translate-y-1 hover:bg-slate-50/50 p-2 -mx-2 rounded-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-all">
                    <Activity size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{project.name}</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${getStatusColor(project.status)}`}>
                        {project.status || 'Ativo'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-xs font-black text-slate-900">{project.progress || 0}%</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden relative shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 + idx * 0.1 }}
                  className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full shadow-[0_0_12px_rgba(79,70,229,0.8)]"
                />
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-white/80 backdrop-blur-sm shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center text-[8px] font-black text-slate-600 hover:z-20 hover:-translate-y-1 transition-transform cursor-pointer relative z-10">
                   {String.fromCharCode(64 + i)}
                 </div>
               ))}
            </div>
            <span className="text-[9px] font-bold text-slate-400 ml-1">Equipe ativa</span>
         </div>
         <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
            <CheckCircle2 size={10} />
            <span className="text-[8px] font-black uppercase tracking-widest">Saúde: Alta</span>
         </div>
      </div>
    </div>
  );
}
