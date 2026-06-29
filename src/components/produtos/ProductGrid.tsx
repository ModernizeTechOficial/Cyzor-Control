import { Package, MoreHorizontal, Edit3, ArrowRight, Clock, LayoutGrid, DollarSign, CloudLightning } from 'lucide-react';

interface ProductGridProps {
  products: any[];
  onSelect: (product: any) => void;
  onEdit: (product: any, e: React.MouseEvent) => void;
  selectedIds: string[];
  toggleSelection: (id: string, e: React.MouseEvent) => void;
}

export default function ProductGrid({ products, onSelect, onEdit, selectedIds, toggleSelection }: ProductGridProps) {

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

  if (products.length === 0) {
    return (
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-6 border border-[#0F172A08]">
          <Package size={40} className="text-[#64748B]/30" />
        </div>
        <h3 className="text-xl font-display font-bold text-[#111111] mb-2">Nenhum produto encontrado</h3>
        <p className="text-[#64748B] text-sm max-w-sm mb-6">Você ainda não possui produtos cadastrados ou nenhum corresponde aos filtros atuais.</p>
        <button className="px-6 py-3 bg-[#111111] text-white font-bold text-sm rounded-2xl hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
          Criar primeiro produto
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map(p => (
        <div 
          key={p.id} 
          onClick={() => onSelect(p)}
          className="bg-white border border-[#0F172A08] rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col relative"
        >
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button className="p-2 text-[#64748B] hover:bg-[#FAFAFA] rounded-xl transition-colors opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); /* Menu */ }}>
              <MoreHorizontal size={18} />
            </button>
            <input 
              type="checkbox" 
              checked={selectedIds.includes(p.id)}
              onChange={(e) => toggleSelection(p.id, e as any)}
              onClick={(e) => e.stopPropagation()}
              className="w-5 h-5 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" 
            />
          </div>

          <div className="flex items-start gap-4 mb-6 pr-16">
            <div className="w-14 h-14 bg-[#111111] rounded-[18px] flex items-center justify-center shadow-md shrink-0">
              <span className="font-display font-bold text-white text-xl">{p.logo}</span>
            </div>
            <div>
              <h4 className="font-bold text-[#111111] text-lg leading-tight mb-1">{p.name}</h4>
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">{p.empresa}</span>
            </div>
          </div>

          <p className="text-sm text-[#64748B] line-clamp-2 min-h-[40px] mb-5 font-medium leading-relaxed">
            {p.desc || 'Nenhuma descrição fornecida para este produto.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
             <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(p.status)}`}>
               {formatStatus(p.status)}
             </span>
             <span className="px-2.5 py-1 rounded-md bg-[#FAFAFA] text-[#64748B] text-[10px] font-bold uppercase tracking-wider border border-[#0F172A08]">
               v2.4.0
             </span>
             <span className="px-2.5 py-1 rounded-md bg-[#FAFAFA] text-[#64748B] text-[10px] font-bold uppercase tracking-wider border border-[#0F172A08]">
               React
             </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6 mt-auto pt-4 border-t border-[#0F172A05]">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-1.5"><LayoutGrid size={12} /> Projetos</p>
              <p className="text-sm font-bold text-[#111111]">{p.projectsCount || 0}</p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] flex items-center gap-1.5"><DollarSign size={12} /> Receita</p>
              <p className="text-sm font-bold text-[#111111]">{p.revenue}</p>
            </div>
          </div>

          <div className="flex justify-between items-center gap-2 pt-4 border-t border-[#0F172A08]">
             <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B]">
               <Clock size={12} />
               <span>Atualizado {p.updated}</span>
             </div>
             
             <div className="flex gap-1">
               <button 
                 onClick={(e) => onEdit(p, e)}
                 className="flex items-center justify-center p-2 rounded-xl bg-[#FAFAFA] text-[#64748B] hover:text-[#111111] hover:bg-[#F1F5F9] transition-all"
                 title="Editar"
               >
                 <Edit3 size={14} />
               </button>
               <button 
                 onClick={(e) => { e.stopPropagation(); }}
                 className="flex items-center justify-center p-2 rounded-xl bg-[#111111] text-white hover:bg-black transition-all shadow-sm"
                 title="Deploy"
               >
                 <CloudLightning size={14} />
               </button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
}
