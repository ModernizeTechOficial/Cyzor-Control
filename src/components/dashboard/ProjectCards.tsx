import { motion } from "motion/react";
import { Users, Calendar, ArrowUpRight, MoreHorizontal, Plus } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  members: number;
  deadline: string;
}

export default function ProjectCards({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {projects.map((project, index) => (
        <motion.div 
          key={project.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.5, ease: "circOut" }}
          whileHover={{ y: -5, scale: 1.01 }}
          className="bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_30px_60px_rgb(0,0,0,0.05)] group cursor-default relative overflow-hidden"
        >
          {/* Subtle background glow on hover */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="flex flex-col gap-1.5">
              <h4 className="text-[15px] font-bold text-[#111111] group-hover:text-blue-600 transition-colors tracking-tight leading-tight">{project.name}</h4>
              <div className="flex items-center gap-2">
                 <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-md ${
                   project.status === 'Produção' ? 'bg-green-500 text-white shadow-[0_2px_8px_rgba(34,197,94,0.3)]' : 
                   project.status === 'Desenvolvimento' ? 'bg-[#111111] text-white shadow-[0_2px_8px_rgba(17,17,17,0.3)]' : 
                   'bg-[#F8FAFC] text-[#64748B]'
                 }`}>
                   {project.status}
                 </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5 relative z-10">
             <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                   <span className="text-[8px] font-black text-[#64748B] uppercase tracking-[0.2em]">Health</span>
                   <span className="text-[14px] font-bold text-[#111111] tracking-tighter">{project.progress}%</span>
                </div>
                <div className="w-full h-1 bg-[#F8FAFC] rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1.5, delay: 0.5, ease: "circOut" }}
                    className="h-full bg-[#111111] rounded-full shadow-[0_0_8px_rgba(17,17,17,0.2)]"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#0F172A05]">
                <div className="flex flex-col gap-1">
                   <span className="text-[8px] font-black text-[#64748B] uppercase tracking-widest opacity-40">Equipe</span>
                   <span className="text-[11px] font-bold text-[#111111] tracking-tight">{project.members} membros</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                   <span className="text-[8px] font-black text-[#64748B] uppercase tracking-widest opacity-40">Prazo</span>
                   <span className="text-[11px] font-bold text-[#111111] tracking-tight">{project.deadline}</span>
                </div>
             </div>
          </div>
        </motion.div>
      ))}
      
      {/* 4th Card Placeholder for Balance if needed, or simply let the 4th item show if provided */}
      {projects.length < 4 && (
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="hidden lg:flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[#F1F5F9] rounded-[24px] p-5 text-[#64748B] hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/20 transition-all group"
        >
           <Plus size={24} className="group-hover:rotate-90 transition-transform" />
           <span className="text-[10px] font-black uppercase tracking-widest">Novo Projeto Operacional</span>
        </motion.div>
      )}
    </div>
  );
}
