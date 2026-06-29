import { Package, MoreHorizontal, Edit3, ArrowRight, CloudLightning } from 'lucide-react';

interface ProductTableProps {
  products: any[];
  onSelect: (product: any) => void;
  onEdit: (product: any, e: React.MouseEvent) => void;
  selectedIds: string[];
  toggleSelection: (id: string, e: React.MouseEvent) => void;
}

export default function ProductTable({
  products, onSelect, onEdit, selectedIds, toggleSelection
}: ProductTableProps) {

  const getStatusStyle = (status: string) => {
    if(!status) return 'bg-slate-50 text-slate-600 border-slate-200/50';
    switch (status.toLowerCase()) {
      case 'produção': return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      case 'em desenvolvimento':
      case 'desenvolvimento': return 'bg-orange-50 text-orange-600 border-orange-100/50';
      case 'beta': return 'bg-blue-50 text-blue-600 border-blue-100/50';
      case 'arquivado': return 'bg-slate-50 text-slate-500 border-slate-200/50';
      case 'erro': return 'bg-rose-50 text-rose-600 border-rose-100/50';
      default: return 'bg-slate-50 text-slate-600 border-slate-200/50';
    }
  };

  const formatStatus = (status: string) => {
    if(!status) return 'N/A';
    switch (status.toLowerCase()) {
      case 'produção': return 'Publicado';
      case 'em desenvolvimento':
      case 'desenvolvimento': return 'Em Dev';
      case 'beta': return 'Beta';
      case 'arquivado': return 'Arquivado';
      case 'erro': return 'Erro';
      default: return status;
    }
  };

  return (
    <div className="bg-white border border-[#0F172A08] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-[#0F172A08] text-[11px] font-bold uppercase text-[#64748B] tracking-widest">
              <th className="px-6 py-5 w-12 text-center">
                <input type="checkbox" className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" />
              </th>
              <th className="py-5 font-bold">Produto</th>
              <th className="py-5 font-bold">Empresa</th>
              <th className="py-5 font-bold">Métricas</th>
              <th className="py-5 font-bold">Receita</th>
              <th className="py-5 font-bold">Status</th>
              <th className="px-6 py-5 font-bold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#0F172A05]">
            {products.map((p) => (
              <tr 
                key={p.id} 
                onClick={() => onSelect(p)}
                className="hover:bg-[#FAFAFA]/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(p.id)}
                    onChange={(e) => toggleSelection(p.id, e as any)}
                    className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" 
                  />
                </td>
                <td className="py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#111111] rounded-[14px] flex items-center justify-center shadow-sm shrink-0">
                      <span className="font-display font-bold text-white text-base">{p.logo}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111111] text-sm group-hover:text-blue-600 transition-colors">{p.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">v2.4.0</span>
                        <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">React</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <span className="text-sm font-semibold text-[#111111]">{p.empresa}</span>
                </td>
                <td className="py-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">Projetos</p>
                    <p className="text-sm font-semibold text-[#111111]">{p.projectsCount || 0}</p>
                  </div>
                </td>
                <td className="py-5">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B]">MRR</p>
                    <p className="text-sm font-bold text-[#111111]">{p.revenue}</p>
                  </div>
                </td>
                <td className="py-5">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(p.status)}`}>
                    {formatStatus(p.status)}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 rounded-xl text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Deploy"
                    >
                      <CloudLightning size={16} />
                    </button>
                    <button 
                      onClick={(e) => onEdit(p, e)}
                      className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); }}
                      className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                      title="Opções"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    <div className="w-[1px] h-4 bg-[#0F172A0F] mx-2" />
                    <button 
                      className="p-2 rounded-xl text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                      title="Acessar"
                    >
                      <ArrowRight size={18} />
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
