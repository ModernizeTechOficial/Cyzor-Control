import { Building2, DollarSign, FolderGit2, Users } from 'lucide-react';
import MetricCard from '../MetricCard';

interface CompanyStatsProps {
  totalCompanies: number;
  activeCompanies: number;
  totalRevenue: number;
  totalProjects: number;
  totalClients: number;
}

export default function CompanyStats({ totalCompanies, activeCompanies, totalRevenue, totalProjects, totalClients }: CompanyStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <MetricCard 
        title="Empresas"
        value={totalCompanies}
        trend="+12 este mês"
        trendUp={true}
        sub={`${activeCompanies} ativas no momento`}
        icon={Building2}
        color="text-blue-600"
        bg="bg-blue-50/50"
      />
      <MetricCard 
        title="Receita"
        value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        trend="↑ 18%"
        trendUp={true}
        sub="Comparado ao mês anterior"
        icon={DollarSign}
        color="text-emerald-600"
        bg="bg-emerald-50/50"
      />
      <MetricCard 
        title="Projetos"
        value={totalProjects}
        trend="+4 concluídos"
        trendUp={true}
        sub="Em andamento no ecossistema"
        icon={FolderGit2}
        color="text-purple-600"
        bg="bg-purple-50/50"
      />
      <MetricCard 
        title="Clientes"
        value={totalClients}
        trend="+2 hoje"
        trendUp={true}
        sub="Usuários ativos na plataforma"
        icon={Users}
        color="text-amber-600"
        bg="bg-amber-50/50"
      />
    </div>
  );
}

