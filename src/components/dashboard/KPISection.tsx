import { motion } from "motion/react";
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPIProps {
  title: string;
  value: string;
  trend: {
    value: string;
    type: 'up' | 'down' | 'neutral';
    label: string;
  };
  contextText: string;
  icon: LucideIcon;
  sparkData?: { value: number }[];
}

function KPICard({ title, value, trend, contextText, icon: Icon, sparkData }: KPIProps) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white border border-[#0F172A08] rounded-[32px] p-6 flex flex-col gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] transition-all hover:shadow-[0_20px_40px_rgb(0,0,0,0.03)] group cursor-default relative overflow-hidden"
    >
      {/* Subtle light effect on hover */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex justify-between items-start relative z-10">
        <div className="w-11 h-11 rounded-2xl bg-[#F8FAFC] border border-[#0F172A08] flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all duration-500">
          <Icon size={18} className="text-[#111111]" strokeWidth={1.5} />
        </div>
        
        {sparkData && (
          <div className="h-8 w-20 opacity-30 group-hover:opacity-100 transition-all duration-700">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#111111" 
                  strokeWidth={2} 
                  dot={false} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 relative z-10">
        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.2em]">{title}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-[#111111] tracking-tighter">{value}</span>
          
          <motion.div 
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black tracking-tighter ${
            trend.type === 'up' ? 'text-green-600 bg-green-50/50' : 
            trend.type === 'down' ? 'text-red-600 bg-red-50/50' : 
            'text-[#64748B] bg-[#F8FAFC]'
          }`}>
            {trend.type === 'up' && <TrendingUp size={9} strokeWidth={3} />}
            {trend.type === 'down' && <TrendingDown size={9} strokeWidth={3} />}
            {trend.type === 'neutral' && <Minus size={9} strokeWidth={3} />}
            {trend.value}
          </motion.div>
        </div>
      </div>

      <div className="flex flex-col gap-1 pt-4 border-t border-[#0F172A05] relative z-10">
        <span className="text-[11px] font-bold text-[#64748B] tracking-tight leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
          <span className="text-[#111111]">{trend.label}</span> {contextText}
        </span>
      </div>
    </motion.div>
  );
}

export default function KPISection({ metrics }: { metrics: any }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <KPICard 
        title="Organizações"
        value={metrics.companies.toString()}
        trend={{ value: "+1", type: 'up', label: "+1 este mês" }}
        contextText="novas empresas cadastradas no ecossistema."
        icon={metrics.icons.Building2}
        sparkData={[{value: 10}, {value: 15}, {value: 8}, {value: 22}, {value: 18}, {value: 25}]}
      />
      <KPICard 
        title="Projetos"
        value={metrics.projects.toString()}
        trend={{ value: "+12%", type: 'up', label: "+2 ativos" }}
        contextText="projetos em fase de desenvolvimento e entrega."
        icon={metrics.icons.Package}
        sparkData={[{value: 30}, {value: 25}, {value: 35}, {value: 32}, {value: 45}, {value: 40}]}
      />
      <KPICard 
        title="Receita"
        value={`R$ ${metrics.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
        trend={{ value: "+14%", type: 'up', label: "+14%" }}
        contextText="de crescimento comparado ao período anterior."
        icon={metrics.icons.CreditCard}
        sparkData={[{value: 10}, {value: 40}, {value: 30}, {value: 60}, {value: 50}, {value: 80}]}
      />
      <KPICard 
        title="Ideias"
        value={metrics.ideas.toString()}
        trend={{ value: "Stable", type: 'neutral', label: "5 em backlog" }}
        contextText="aguardando validação técnica e estratégica."
        icon={metrics.icons.Lightbulb}
        sparkData={[{value: 20}, {value: 20}, {value: 25}, {value: 22}, {value: 20}, {value: 24}]}
      />
    </section>
  );
}
