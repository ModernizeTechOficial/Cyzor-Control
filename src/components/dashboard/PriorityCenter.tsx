import { motion } from "motion/react";
import { AlertTriangle, Clock, MessageSquare, ShieldCheck, ChevronRight, Target, ArrowRight } from "lucide-react";

interface PriorityItem {
  id: string;
  title: string;
  category: 'Critical' | 'Task' | 'Decision' | 'Risk';
  priority: 'high' | 'medium' | 'low';
  tag: string;
}

export default function PriorityCenter({ items }: { items: PriorityItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, i) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: "circOut" }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="bg-white border border-[#0F172A08] rounded-3xl p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.03)] group cursor-default relative overflow-hidden h-full flex flex-col justify-between"
        >
          {/* Subtle status indicator bar */}
          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
            item.priority === 'high' ? 'bg-red-500 shadow-[2px_0_15px_rgba(239,68,68,0.4)]' : 
            item.priority === 'medium' ? 'bg-orange-400' : 'bg-blue-500'
          }`} />

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-start">
               <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.3em] opacity-40">{item.category}</span>
               <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                  item.priority === 'high' ? 'bg-red-50 text-red-600 border border-red-100' : 
                  'bg-[#F8FAFC] text-[#64748B] border border-[#0F172A08]'
               }`}>
                  {item.priority === 'high' ? 'High Impact' : 'Priority'}
               </div>
            </div>

            <h4 className="text-[17px] font-bold text-[#111111] tracking-tight leading-[1.2] group-hover:text-blue-600 transition-colors">
              {item.title}
            </h4>
          </div>

          <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#0F172A05]">
             <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#FAFAFA] border border-[#0F172A08] flex items-center justify-center">
                   <Target size={12} className="text-[#64748B]" />
                </div>
                <span className="text-[11px] font-bold text-[#64748B] tracking-tight">{item.tag}</span>
             </div>
             <button className="p-2 hover:bg-black hover:text-white rounded-xl transition-all border border-transparent hover:border-[#0F172A08] group-hover:shadow-lg">
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
             </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
