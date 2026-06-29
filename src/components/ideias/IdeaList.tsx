import { MessageSquare, Paperclip, MoreHorizontal, Zap } from 'lucide-react';

interface IdeaListProps {
  ideas: any[];
  onIdeaClick: (idea: any) => void;
  selectedIds: string[];
  toggleSelection: (id: string, e: React.MouseEvent) => void;
}

export default function IdeaList({ ideas, onIdeaClick, selectedIds, toggleSelection }: IdeaListProps) {
  
  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'alta': return 'text-rose-600 bg-rose-50 border-rose-100/50';
      case 'média': return 'text-amber-600 bg-amber-50 border-amber-100/50';
      case 'baixa': return 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
      default: return 'text-slate-600 bg-slate-50 border-slate-100/50';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'capturadas': return 'bg-slate-100 text-slate-600 border-slate-200/50';
      case 'avaliacao': return 'bg-indigo-100 text-indigo-700 border-indigo-200/50';
      case 'pesquisa': return 'bg-blue-100 text-blue-700 border-blue-200/50';
      case 'mvp': return 'bg-purple-100 text-purple-700 border-purple-200/50';
      case 'lancadas': return 'bg-emerald-100 text-emerald-700 border-emerald-200/50';
      case 'arquivadas': return 'bg-neutral-100 text-neutral-600 border-neutral-200/50';
      default: return 'bg-slate-100 text-slate-600 border-slate-200/50';
    }
  };

  const formatStatus = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'capturadas': return 'Capturada';
      case 'avaliacao': return 'Em Avaliação';
      case 'pesquisa': return 'Em Pesquisa';
      case 'mvp': return 'MVP';
      case 'lancadas': return 'Lançada';
      case 'arquivadas': return 'Arquivada';
      default: return status;
    }
  };

  if (ideas.length === 0) {
    return (
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col items-center justify-center text-center min-h-[400px]">
        <h3 className="text-xl font-display font-bold text-[#111111] mb-2">Nenhuma ideia encontrada</h3>
        <p className="text-[#64748B] text-sm max-w-sm">Tente ajustar os filtros ou crie uma nova ideia.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#0F172A08] text-[11px] font-bold uppercase text-[#64748B] tracking-widest">
              <th className="px-6 py-5 w-12 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" />
              </th>
              <th className="py-5 font-bold">Ideia</th>
              <th className="py-5 font-bold">Status</th>
              <th className="py-5 font-bold">Prioridade</th>
              <th className="py-5 font-bold">Score</th>
              <th className="py-5 font-bold">Responsável</th>
              <th className="px-6 py-5 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F172A05]">
            {ideas.map((idea) => (
              <tr 
                key={idea.id} 
                onClick={() => onIdeaClick(idea)}
                className="hover:bg-[#FAFAFA]/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(idea.id)}
                    onChange={(e) => toggleSelection(idea.id, e as any)}
                    className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" 
                  />
                </td>
                <td className="py-5 pr-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{idea.emoji || '💡'}</span>
                    <div>
                      <h4 className="font-bold text-[#111111] text-sm group-hover:text-blue-600 transition-colors line-clamp-1">{idea.name}</h4>
                      <p className="text-xs text-[#64748B] font-medium line-clamp-1 mt-0.5 max-w-[300px]">{idea.desc || 'Sem descrição.'}</p>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(idea.column)}`}>
                    {formatStatus(idea.column)}
                  </span>
                </td>
                <td className="py-5">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(idea.prioridade || 'Média')}`}>
                    {idea.prioridade || 'Média'}
                  </span>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-sm font-bold text-[#111111]">{idea.score || 80}</span>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500">JD</div>
                    </div>
                    <span className="text-xs font-semibold text-[#111111]">João D.</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                      title="Opções"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
