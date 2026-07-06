import { motion } from "motion/react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface IndicatorProps {
  label: string;
  score: number;
  trend: 'up' | 'down';
  trendValue: string;
  sparkData: { value: number }[];
}

function HealthIndicator({ label, score, trend, trendValue, sparkData }: IndicatorProps) {
  return (
    <div className="group flex flex-col gap-4 p-5 bg-[#FAFAFA] border border-transparent hover:border-[#0F172A08] hover:bg-white rounded-[20px] hover:shadow-[0_8px_30px_rgb(0,0,0,0.015)] transition-all duration-500 cursor-default">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-[#64748B] uppercase tracking-[0.2em]">{label}</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#111111] tracking-tighter">{score}%</span>
            <div className={`flex items-center gap-0.5 text-[9px] font-black ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
               {trend === 'up' ? '↑' : '↓'} {trendValue}
            </div>
          </div>
        </div>
        <div className="h-6 w-12 opacity-30 group-hover:opacity-100 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={trend === 'up' ? '#10b981' : '#ef4444'} 
                strokeWidth={2} 
                dot={false} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="w-full h-1 bg-[#111111]/05 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className={`h-full rounded-full ${score > 90 ? 'bg-[#111111]' : score > 70 ? 'bg-blue-600' : 'bg-orange-500'}`}
        />
      </div>
    </div>
  );
}

export default function BusinessOverview({ stats }: { stats?: any[] }) {
  const defaultData = [
    { label: "Receita", score: 94, trend: 'up', trendValue: '+12%', spark: [{value: 30}, {value: 45}, {value: 40}, {value: 60}, {value: 55}, {value: 70}] },
    { label: "Projetos", score: 88, trend: 'up', trendValue: '+5%', spark: [{value: 40}, {value: 35}, {value: 50}, {value: 45}, {value: 60}, {value: 55}] },
    { label: "Deploy", score: 96, trend: 'up', trendValue: 'Stable', spark: [{value: 50}, {value: 55}, {value: 52}, {value: 58}, {value: 60}, {value: 62}] },
    { label: "Equipe", score: 92, trend: 'up', trendValue: '+2%', spark: [{value: 30}, {value: 40}, {value: 35}, {value: 45}, {value: 40}, {value: 50}] },
    { label: "Performance", score: 85, trend: 'down', trendValue: '-3%', spark: [{value: 70}, {value: 65}, {value: 68}, {value: 60}, {value: 55}, {value: 50}] },
    { label: "IA Score", score: 94, trend: 'up', trendValue: '+1.4', spark: [{value: 40}, {value: 50}, {value: 45}, {value: 60}, {value: 65}, {value: 70}] },
  ];

  const data = stats || defaultData;
  const arrayData = Array.isArray(data) ? data : [];
  const overallHealth = arrayData.length > 0 
    ? Math.round(arrayData.reduce((acc, curr) => acc + curr.score, 0) / arrayData.length)
    : 0;

  return (
    <section className="bg-white border border-[#0F172A08] rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden group/main">
      {/* HUD-like corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] pointer-events-none">
         <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
            <path d="M100 0L100 100L0 100" stroke="#111" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="100" cy="0" r="40" stroke="#111" strokeWidth="0.5" />
         </svg>
      </div>

      <div className="flex flex-col gap-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Operational Health</span>
            <h3 className="text-2xl font-display font-bold text-[#111111] tracking-tight">Business Overview</h3>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest opacity-60">Status Geral</span>
                <div className="flex items-center gap-3">
                   <span className="text-3xl font-bold text-[#111111] tracking-tighter">{overallHealth}%</span>
                   <div className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-md border border-green-100/50">{overallHealth > 90 ? 'Optimal' : 'Stable'}</div>
                </div>
             </div>
             <div className="w-px h-10 bg-[#F1F5F9]" />
             <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest opacity-60">Variação Mensal</span>
                <div className="flex items-center gap-1 text-green-600">
                   <span className="text-lg font-bold tracking-tighter">+4.2%</span>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, i) => (
            <HealthIndicator 
              key={i}
              label={item.label}
              score={item.score}
              trend={item.trend as any}
              trendValue={item.trendValue}
              sparkData={item.spark}
            />
          ))}
        </div>
        
        <div className="pt-2 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-[#F8FAFC] overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${i+10}`} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                 ))}
              </div>
              <span className="text-[11px] font-bold text-[#64748B] tracking-tight">Equipe técnica monitorando <span className="text-[#111111]">12 sistemas</span> ativos.</span>
           </div>
           <button className="text-[10px] font-black text-[#111111] uppercase tracking-[0.2em] hover:underline transition-all">Ver Métricas Detalhadas</button>
        </div>
      </div>
    </section>
  );
}
