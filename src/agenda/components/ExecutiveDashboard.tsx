import { AgendaEvent } from '../types/agenda';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, BarChart3, Clock, Milestone, Library, Laptop } from 'lucide-react';

interface ExecutiveDashboardProps {
  events: AgendaEvent[];
}

export default function ExecutiveDashboard({ events }: ExecutiveDashboardProps) {
  // 1. Calculate General Aggregations
  const totalEvents = events.length;
  const totalMeetings = events.filter(e => e.type === 'reuniao' || e.type === 'call').length;
  const timeBlocks = events.filter(e => e.isTimeBlock);
  const homeOfficeCount = timeBlocks.filter(e => e.timeBlockType === 'home_office').length;
  const absencesCount = timeBlocks.filter(e => e.timeBlockType === 'ausencia' || e.timeBlockType === 'ferias').length;
  
  // 2. Prepare Data for Category Breakdown Chart
  const categoryCounts: Record<string, number> = {};
  events.forEach(e => {
    categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Premium corporate colors mapping
  const CATEGORY_COLORS: Record<string, string> = {
    'Projetos': '#111111',       // Black/Deep Charcoal
    'Comercial': '#10B981',      // Emerald Green
    'Financeiro': '#8B5CF6',     // Violet Purple
    'RH': '#F59E0B',             // Amber Yellow
    'Marketing': '#EC4899',      // Rose Pink
    'Tecnologia': '#3B82F6',     // Bright Blue
    'Administrativo': '#64748B',  // Slate Gray
  };

  const getColorsForPie = (data: typeof categoryData) => {
    return data.map(item => CATEGORY_COLORS[item.name] || '#94A3B8');
  };

  // 3. Prepare Data for Resource Utilization
  const resourceCounts: Record<string, number> = {};
  events.forEach(e => {
    e.reservedResources.forEach(res => {
      resourceCounts[res] = (resourceCounts[res] || 0) + 1;
    });
  });

  const resourceData = Object.entries(resourceCounts)
    .map(([name, value]) => ({ name, quantidade: value }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // 4. Prepare Data for Event Types (Meetings, Calls, Deliveries, etc.)
  const typeCounts: Record<string, number> = {};
  events.forEach(e => {
    if (!e.isTimeBlock) {
      typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
    }
  });

  const typeData = Object.entries(typeCounts).map(([name, total]) => ({
    name: name.toUpperCase(),
    total,
  }));

  return (
    <div className="flex flex-col gap-6 md:gap-10">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 flex flex-col justify-between min-h-[150px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Compromissos Corporativos</span>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#0F172A0D]">
              <Milestone size={16} className="text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#111111] tracking-tight">{totalEvents}</span>
            <span className="text-xs text-[#64748B] block mt-1">Total de registros ativos alocados</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 flex flex-col justify-between min-h-[150px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Reuniões / Calls</span>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#0F172A0D]">
              <Users size={16} className="text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#111111] tracking-tight">{totalMeetings}</span>
            <span className="text-xs text-[#64748B] block mt-1">Relações técnicas ou comerciais</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 flex flex-col justify-between min-h-[150px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Home Offices Ativos</span>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#0F172A0D]">
              <Laptop size={16} className="text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#111111] tracking-tight">{homeOfficeCount}</span>
            <span className="text-xs text-[#64748B] block mt-1">Profissionais vinculados de casa</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 flex flex-col justify-between min-h-[150px] shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Ausências / Afastamentos</span>
            <div className="w-9 h-9 rounded-full bg-[#FAFAFA] flex items-center justify-center border border-[#0F172A0D]">
              <Clock size={16} className="text-[#111111]" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#111111] tracking-tight">{absencesCount}</span>
            <span className="text-xs text-[#64748B] block mt-1">Férias ou licenças cadastradas</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Chart 1: Category Breakdown */}
        <div className="bg-white border border-[#0F172A0F] rounded-[30px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold uppercase text-[#111111] tracking-wider mb-6 flex items-center gap-2">
            <BarChart3 size={15} />
            Alocação por Setor / Categoria
          </h3>
          <div className="h-[280px] w-full flex items-center justify-center">
            {categoryData.length === 0 ? (
              <span className="text-xs text-[#64748B]">Indisponível</span>
            ) : (
              <ResponsiveContainer width="95%" height="95%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', borderColor: '#0F172A0F', fontSize: '11px', fontFamily: 'monospace' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    iconSize={10} 
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Resource Utilization */}
        <div className="bg-white border border-[#0F172A0F] rounded-[30px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
          <h3 className="text-sm font-bold uppercase text-[#111111] tracking-wider mb-6 flex items-center gap-2">
            <Library size={15} />
            Uso de Salas de Reunião e Recursos
          </h3>
          <div className="h-[280px] w-full">
            {resourceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#64748B] italic">
                Nenhum recurso ou sala física reservada neste período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 9, fontWeight: 'bold', fill: '#64748B' }} 
                    axisLine={false} 
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 9, fill: '#64748B' }} 
                    axisLine={false} 
                    tickLine={false} 
                    allowDecimals={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#FAFAFA' }}
                    contentStyle={{ borderRadius: '12px', borderColor: '#0F172A0F', fontSize: '11px' }}
                  />
                  <Bar dataKey="quantidade" fill="#111111" radius={[10, 10, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Event Types summary Table */}
      <div className="bg-white border border-[#0F172A0F] rounded-[30px] p-6 lg:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-wider mb-5">Volume por Tipo Operacional</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold text-[#111111]">
            <thead>
              <tr className="border-b border-[#0F172A0F] text-[#64748B] text-[10px] uppercase tracking-wider">
                <th className="pb-3 font-bold">Tipo Operacional</th>
                <th className="pb-3 text-right font-bold">Incidências Totais</th>
                <th className="pb-3 text-right font-bold">Alocação Relativa (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A0A]">
              {typeData.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-center text-[#64748B]">Indisponível</td>
                </tr>
              ) : (
                typeData.map((item, idx) => {
                  const percent = totalEvents > 0 ? Math.round((item.total / totalEvents) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-[#FAFAFA]/50 transition-colors">
                      <td className="py-3 font-bold">{item.name}</td>
                      <td className="py-3 text-right font-mono font-bold text-[#111111]">{item.total}</td>
                      <td className="py-3 text-right font-mono">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 h-1.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-full overflow-hidden">
                            <div className="h-full bg-[#111111]" style={{ width: `${percent}%` }} />
                          </div>
                          <span>{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
