import { MoreHorizontal, Plus } from 'lucide-react';

interface ProductKanbanProps {
  products: any[];
  onSelect: (product: any) => void;
}

export default function ProductKanban({ products, onSelect }: ProductKanbanProps) {
  const columns = [
    { id: 'PLANEJAMENTO', title: 'Planejamento', color: 'bg-slate-100 text-slate-600 border-slate-200' },
    { id: 'DESENVOLVIMENTO', title: 'Desenvolvimento', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'BETA', title: 'Beta', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'PRODUÇÃO', title: 'Publicado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  ];

  const getProductsByStatus = (statusId: string) => {
    return products.filter(p => {
      const s = p.status?.toUpperCase() || 'PRODUÇÃO';
      if (statusId === 'DESENVOLVIMENTO' && (s === 'EM DESENVOLVIMENTO' || s === 'DESENVOLVIMENTO')) return true;
      return s === statusId;
    });
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-none min-h-[500px]">
      {columns.map(col => {
        const colProducts = getProductsByStatus(col.id);
        return (
          <div key={col.id} className="flex-1 min-w-[320px] max-w-[380px] flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${col.color}`}>
                  {col.title}
                </span>
                <span className="text-xs font-bold text-[#64748B] bg-white border border-[#0F172A08] px-2 py-0.5 rounded-full shadow-sm">
                  {colProducts.length}
                </span>
              </div>
              <div className="flex gap-1">
                <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#0F172A08] transition-all">
                  <Plus size={16} />
                </button>
                <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#0F172A08] transition-all">
                  <MoreHorizontal size={16} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {colProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => onSelect(p)}
                  className="bg-white border border-[#0F172A08] rounded-[20px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center shadow-sm shrink-0">
                      <span className="font-display font-bold text-white text-sm">{p.logo}</span>
                    </div>
                    <button className="p-1 text-[#64748B] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <h4 className="font-bold text-[#111111] text-sm mb-1">{p.name}</h4>
                  <p className="text-xs text-[#64748B] font-medium mb-4 line-clamp-2">{p.desc || 'Nenhuma descrição.'}</p>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-[#0F172A05]">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{p.empresa}</span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white"></div>
                      <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white"></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {colProducts.length === 0 && (
                <div className="h-24 border-2 border-dashed border-[#0F172A0F] rounded-[20px] flex items-center justify-center text-[#64748B] text-xs font-medium">
                  Arraste cards para cá
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
