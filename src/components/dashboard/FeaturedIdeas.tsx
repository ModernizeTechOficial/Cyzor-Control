import { motion } from "motion/react";
import { Lightbulb, TrendingUp, ChevronRight, ArrowUpRight, Plus } from "lucide-react";

interface Idea {
  id: string;
  name: string;
  score: number;
  potential: string;
  status: string;
}

export default function FeaturedIdeas({ ideas }: { ideas: Idea[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {ideas.slice(0, 3).map((idea, i) => (
        <motion.div 
          key={idea.id}
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4, ease: "circOut" }}
          whileHover={{ y: -5, scale: 1.02 }}
          className="bg-white border border-[#0F172A08] rounded-[24px] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_25px_50px_rgb(0,0,0,0.04)] group cursor-default relative overflow-hidden"
        >
          {/* Subtle pattern background for Sandbox feel */}
          <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

          <div className="flex flex-col gap-5 relative z-10">
            <div className="flex justify-between items-start">
               <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600 group-hover:bg-[#111111] group-hover:text-white transition-all duration-500">
                  <Lightbulb size={16} strokeWidth={3} />
               </div>
               <div className="flex flex-col items-end">
                  <span className="text-[8px] font-black text-[#64748B] uppercase tracking-[0.2em] opacity-40">Score IA</span>
                  <span className="text-15px font-bold text-[#111111] tracking-tighter">{idea.score}%</span>
               </div>
            </div>

            <div className="flex flex-col gap-1">
               <h4 className="text-[14px] font-bold text-[#111111] tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
                {idea.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{idea.potential} Impact</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#0F172A05]">
               <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest opacity-40">{idea.status}</span>
               <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                  Launch
               </button>
            </div>
          </div>
        </motion.div>
      ))}
      
      <motion.button 
        whileHover={{ scale: 1.01 }}
        className="bg-[#FAFAFA] border-2 border-dashed border-[#F1F5F9] rounded-[24px] p-6 flex flex-col items-center justify-center gap-3 text-[#64748B] hover:border-blue-200 hover:text-blue-600 hover:bg-white transition-all group"
      >
        <Plus size={20} strokeWidth={3} />
        <span className="text-[9px] font-black uppercase tracking-[0.2em]">New Concept</span>
      </motion.button>
    </div>
  );
}
