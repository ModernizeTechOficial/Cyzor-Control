import { Plus, Workflow, Trash2, Calendar, User, Database, Globe, Layout, Layers, GitBranch } from 'lucide-react';
import { Flow, SystemType } from '../types';
import StandardHeader from '../../../components/layout/StandardHeader';

interface ProjectListProps {
  flows: Flow[];
  onCreateFlow: (type: SystemType) => void;
  onSelectFlow: (flow: Flow) => void;
  onDeleteFlow: (id: number) => void;
}

export default function ProjectList({ flows, onCreateFlow, onSelectFlow, onDeleteFlow }: ProjectListProps) {
  const projectTypes: { type: SystemType, label: string, icon: any, color: string }[] = [
    { type: 'flow', label: 'Fluxo', icon: Workflow, color: 'bg-blue-500' },
    { type: 'database', label: 'Bancos', icon: Database, color: 'bg-emerald-500' },
    { type: 'infographic', label: 'Infográficos', icon: Layout, color: 'bg-amber-500' },
    { type: 'api', label: 'APIs', icon: Globe, color: 'bg-purple-500' },
  ];

  const getIcon = (type: SystemType) => {
    const item = projectTypes.find(t => t.type === type);
    return item ? item.icon : Workflow;
  };

  const getColor = (type: SystemType) => {
    const item = projectTypes.find(t => t.type === type);
    return item ? item.color : 'bg-blue-500';
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-10 bg-[#FAFAFA] overflow-y-auto custom-scrollbar flex flex-col gap-10">
      <div className="w-full flex flex-col gap-10">
        <StandardHeader 
          title="Visual Systems Studio"
          subtitle="Arquitete sistemas, modele dados e simule APIs em um ambiente visual premium."
          actions={projectTypes.map(pt => ({
            label: pt.label,
            icon: pt.icon,
            onClick: () => onCreateFlow(pt.type),
            variant: 'secondary'
          }))}
        />

        {flows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 border border-dashed border-[#0F172A0F] rounded-[40px] bg-white shadow-sm">
            <div className="w-24 h-24 rounded-[36px] bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-[#111111]/10 mb-8 animate-pulse">
              <Layers size={48} />
            </div>
            <h3 className="text-[#111111] font-bold text-2xl mb-3 tracking-tight">Comece sua obra-prima</h3>
            <p className="text-[#64748B] text-sm max-w-sm text-center mb-10 leading-relaxed font-medium">
              Escolha um dos módulos acima para criar seu primeiro projeto de arquitetura visual.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {flows.map((flow) => {
              const Icon = getIcon(flow.type);
              const colorClass = getColor(flow.type);
              
              return (
                <div 
                  key={flow.id}
                  onClick={() => onSelectFlow(flow)}
                  className="group relative bg-white border border-[#0F172A08] rounded-2xl p-4 hover:border-blue-500/30 transition-all cursor-pointer hover:shadow-lg shadow-sm flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${colorClass}/10 flex items-center justify-center text-${colorClass.replace('bg-', '')}-600 group-hover:scale-105 transition-transform shrink-0`}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-[#64748B]/60 mb-0.5">{flow.type}</div>
                        <h3 className="text-[#111111] font-bold text-[15px] line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">{flow.name}</h3>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
                          onDeleteFlow(flow.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500/40 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-[#0F172A08] mt-auto">
                    <div className="flex items-center gap-1.5 text-[#64748B]/60">
                      <Calendar size={12} />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {new Date(flow.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold text-[#64748B] bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#0F172A08] tracking-wide">
                         {flow.flowJson?.nodes?.length || 0} nodes
                       </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
