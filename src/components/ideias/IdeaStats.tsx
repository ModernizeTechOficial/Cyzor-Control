import React from 'react';
import { Lightbulb, FlaskConical, Box, Percent } from 'lucide-react';
import MetricCard from '../MetricCard';

interface IdeaStatsProps {
  totalIdeas: number;
  emAvaliacao: number;
  emPesquisa: number;
  mvp: number;
  lancadas: number;
  arquivadas: number;
}

export default function IdeaStats({ totalIdeas, emAvaliacao, emPesquisa, mvp }: IdeaStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard
        title="Total de Ideias"
        value={totalIdeas.toString()}
        trend="+12 capturadas"
        trendUp={true}
        contextText="novas ideias catalogadas no workspace este mês"
        icon={Lightbulb}
      />
      <MetricCard
        title="Em Avaliação / Pesquisa"
        value={(emAvaliacao + emPesquisa).toString()}
        trend="Em progresso"
        trendUp={true}
        contextText="ideias aguardando avaliação técnica e viabilidade"
        icon={FlaskConical}
      />
      <MetricCard
        title="MVP Planejado"
        value={mvp.toString()}
        trend="+2"
        trendUp={true}
        contextText="ideias prontas para prototipagem de produto"
        icon={Box}
      />
      <MetricCard
        title="Taxa de Aprovação"
        value="24%"
        trend="Critério Alto"
        trendUp={false}
        contextText="ideias validadas e promovidas para o roadmap"
        icon={Percent}
      />
    </div>
  );
}
