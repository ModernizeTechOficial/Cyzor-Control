import { motion } from "motion/react";
import { Clock, Plus } from "lucide-react";

interface KanbanTask {
  id: string;
  title: string;
  category: string;
  time: string;
}

export default function KanbanCompact({ columns }: { columns: { title: string, tasks: KanbanTask[] }[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((col, i) => (
        <div key={i} className="flex flex-col gap-5">
          <div className="flex items-center justify-between px-3">
             <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em]">{col.title}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#0F172A05] text-[9px] font-black text-[#64748B]">{col.tasks.length}</span>
             </div>
             <div className="w-8 h-px bg-[#F1F5F9] flex-1 ml-4" />
          </div>

          <div className="flex flex-col gap-3">
            {col.tasks.map((task) => (
              <motion.div 
                key={task.id}
                whileHover={{ x: 4, scale: 1.01 }}
                className="bg-white border border-[#0F172A08] rounded-2xl p-5 shadow-[0_2px_10px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_15px_30px_rgb(0,0,0,0.03)] group cursor-default relative overflow-hidden"
              >
                {/* Subtle indicator for today's tasks */}
                {col.title === 'Hoje' && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-sm ${
                        task.category === 'Dev' ? 'bg-[#111111] text-white' : 
                        task.category === 'Mkt' ? 'bg-blue-100 text-blue-700' : 
                        'bg-[#F8FAFC] text-[#64748B]'
                     }`}>
                        {task.category}
                     </span>
                     <span className="text-[10px] font-bold text-[#64748B] opacity-50 flex items-center gap-1">
                        <Clock size={10} />
                        {task.time}
                     </span>
                  </div>
                  <h5 className="text-[13px] font-bold text-[#111111] tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                    {task.title}
                  </h5>
                  
                  <div className="flex items-center justify-between pt-2">
                     <div className="flex -space-x-1.5">
                        {[1,2].map(u => (
                           <div key={u} className="w-5 h-5 rounded-full border border-white bg-[#F8FAFC] shadow-sm overflow-hidden">
                              <img src={`https://i.pravatar.cc/100?u=${u+50}`} alt="" className="w-full h-full object-cover opacity-80" />
                           </div>
                        ))}
                     </div>
                     <button className="opacity-0 group-hover:opacity-100 transition-all text-[9px] font-black text-blue-600 uppercase tracking-widest">
                        Detalhes
                     </button>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <button className="w-full py-4 border-2 border-dashed border-[#F1F5F9] rounded-2xl flex items-center justify-center gap-2 text-[#64748B] hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/20 transition-all group">
               <Plus size={16} className="group-hover:rotate-90 transition-transform" />
               <span className="text-[10px] font-black uppercase tracking-widest">Nova Task</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
