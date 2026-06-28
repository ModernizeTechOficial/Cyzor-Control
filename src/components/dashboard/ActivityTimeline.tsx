import { motion } from "motion/react";
import { Clock, Plus } from "lucide-react";
import { User, Rocket, Building2, Sparkles, Server, MoreHorizontal, ChevronRight } from "lucide-react";

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  type: 'deploy' | 'company' | 'ai' | 'server';
}

export default function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'deploy': return <Rocket size={12} strokeWidth={3} />;
      case 'company': return <Building2 size={12} strokeWidth={3} />;
      case 'ai': return <Sparkles size={12} strokeWidth={3} />;
      case 'server': return <Server size={12} strokeWidth={3} />;
      default: return <User size={12} strokeWidth={3} />;
    }
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[32px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden group/card">
      <div className="flex flex-col gap-6 relative z-10">
        <div className="flex items-center justify-between">
           <div className="flex flex-col gap-0.5">
              <h3 className="text-lg font-display font-bold text-[#111111] tracking-tight leading-tight">Timeline</h3>
              <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em]">Activity Feed</span>
           </div>
        </div>

        <div className="relative flex flex-col gap-6">
           {/* Timeline Line with Gradient */}
           <div className="absolute left-[15px] top-4 bottom-4 w-px bg-gradient-to-b from-[#F1F5F9] via-[#F1F5F9] to-transparent" />

           {activities.slice(0, 3).map((activity, i) => (
             <motion.div 
               key={activity.id}
               initial={{ opacity: 0, x: -10 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1, duration: 0.5, ease: "circOut" }}
               className="relative flex items-start gap-5 group"
             >
                <div className="relative z-10 w-8 h-8 rounded-full bg-[#FAFAFA] border border-[#F1F5F9] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-white group-hover:border-[#111111]/10 transition-all duration-500">
                   <div className="text-[#64748B] group-hover:text-[#111111] transition-colors">
                      {getIcon(activity.type)}
                   </div>
                </div>

                <div className="flex flex-col gap-0.5 pr-4">
                   <p className="text-[13px] font-bold text-[#111111] leading-tight tracking-tight">
                      {activity.user} <span className="opacity-60 font-medium">{activity.action}</span>
                   </p>
                   <span className="text-[9px] font-black text-[#64748B] uppercase tracking-widest opacity-40">{activity.time}</span>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
}
