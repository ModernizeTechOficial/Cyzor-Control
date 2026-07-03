import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import MetricCard from "../MetricCard";

export default function KPISection({ metrics }: { metrics: any }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard 
        title="Organizações"
        value={metrics.companies.toString()}
        trend={{ value: "+1", type: 'up', label: "+1 este mês" }}
        contextText="novas empresas cadastradas no ecossistema."
        icon={metrics.icons.Building2}
        sparkData={[{value: 10}, {value: 15}, {value: 8}, {value: 22}, {value: 18}, {value: 25}]}
      />
      <MetricCard 
        title="Projetos"
        value={metrics.projects.toString()}
        trend={{ value: "+12%", type: 'up', label: "+2 ativos" }}
        contextText="projetos em fase de desenvolvimento e entrega."
        icon={metrics.icons.Package}
        sparkData={[{value: 30}, {value: 25}, {value: 35}, {value: 32}, {value: 45}, {value: 40}]}
      />
      <MetricCard 
        title="Receita"
        value={`R$ ${metrics.revenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
        trend={{ value: "+14%", type: 'up', label: "+14%" }}
        contextText="de crescimento comparado ao período anterior."
        icon={metrics.icons.CreditCard}
        sparkData={[{value: 10}, {value: 40}, {value: 30}, {value: 60}, {value: 50}, {value: 80}]}
      />
      <MetricCard 
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

