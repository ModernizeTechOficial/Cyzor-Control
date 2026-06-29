import { Building2, MoreHorizontal, Edit3, ArrowRight, Activity, Clock } from 'lucide-react';

interface CompanyTableProps {
  companies: any[];
  finance: any[];
  onSelect: (company: any) => void;
  onEdit: (company: any, e: React.MouseEvent) => void;
  selectedCompanyIds: string[];
  toggleSelection: (id: string, e: React.MouseEvent) => void;
  viewMode: 'table' | 'grid';
}

export default function CompanyTable({
  companies, finance, onSelect, onEdit, selectedCompanyIds, toggleSelection, viewMode
}: CompanyTableProps) {

  const getRevenue = (companyId: string) => {
    return finance
      .filter(f => f.companyId === companyId && f.type === 'RECEITA')
      .reduce((sum, f) => sum + Number(f.amount), 0);
  };

  const getStatusStyle = (status: string) => {
    const s = status?.toUpperCase() || 'ACTIVE';
    if (s === 'AT_RISK' || s === 'EM RISCO') return 'bg-rose-50 text-rose-600 border border-rose-100/50';
    if (s === 'INACTIVE' || s === 'INATIVO') return 'bg-slate-50 text-slate-500 border border-slate-200/50';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-100/50';
  };

  const formatStatus = (status: string) => {
    const s = status?.toUpperCase() || 'ACTIVE';
    if (s === 'AT_RISK' || s === 'EM RISCO') return 'Em Risco';
    if (s === 'INACTIVE' || s === 'INATIVO') return 'Inativo';
    return 'Ativo';
  };

  if (companies.length === 0) {
    return (
      <div className="bg-white border border-[#0F172A08] rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-6 border border-[#0F172A08]">
          <Building2 size={40} className="text-[#64748B]/30" />
        </div>
        <h3 className="text-xl font-display font-bold text-[#111111] mb-2">Nenhuma empresa encontrada</h3>
        <p className="text-[#64748B] text-sm max-w-sm mb-6">Você ainda não possui empresas cadastradas ou nenhuma corresponde aos filtros atuais.</p>
        <button className="px-6 py-3 bg-[#111111] text-white font-bold text-sm rounded-2xl hover:bg-black transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)]">
          Criar primeira empresa
        </button>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map(c => (
          <div 
            key={c.id} 
            onClick={() => onSelect(c)}
            className="bg-white border border-[#0F172A08] rounded-[28px] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FAFAFA] rounded-2xl border border-[#0F172A08] flex items-center justify-center shadow-sm">
                  <Building2 size={20} className="text-[#111111]" />
                </div>
                <div>
                  <h4 className="font-bold text-[#111111] text-base">{c.name}</h4>
                  <span className="text-xs font-medium text-[#64748B]">{c.industry || 'Tecnologia'}</span>
                </div>
              </div>
              <button className="p-2 text-[#64748B] hover:bg-[#FAFAFA] rounded-xl transition-colors" onClick={(e) => { e.stopPropagation(); /* Menu */ }}>
                <MoreHorizontal size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2 mb-6">
               <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                 {formatStatus(c.status)}
               </span>
               <span className="px-2.5 py-1 rounded-md bg-[#FAFAFA] text-[#64748B] text-[10px] font-bold uppercase tracking-wider border border-[#0F172A08]">
                 Enterprise
               </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Receita</p>
                <p className="text-sm font-bold text-[#111111]">
                  R$ {getRevenue(c.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Projetos</p>
                <p className="text-sm font-bold text-[#111111]">{c.projects || 0}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0F172A08] flex justify-between items-center text-[#64748B] text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                <span>Atualizado há 2h</span>
              </div>
              <button 
                onClick={(e) => onEdit(c, e)}
                className="flex items-center gap-1.5 hover:text-[#111111] transition-colors"
              >
                <Edit3 size={14} />
                <span>Editar</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:block bg-white border border-[#0F172A08] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-[#0F172A08] text-[11px] font-bold uppercase text-[#64748B] tracking-widest">
                <th className="px-6 py-5 w-12 text-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" />
                </th>
                <th className="py-5 font-bold">Empresa</th>
                <th className="py-5 font-bold">Métricas</th>
                <th className="py-5 font-bold">Receita</th>
                <th className="py-5 font-bold">Status</th>
                <th className="px-6 py-5 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A05]">
              {companies.map((c) => (
                <tr 
                  key={c.id} 
                  onClick={() => onSelect(c)}
                  className="hover:bg-[#FAFAFA]/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedCompanyIds.includes(c.id)}
                      onChange={(e) => toggleSelection(c.id, e as any)}
                      className="w-4 h-4 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" 
                    />
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#FAFAFA] rounded-[14px] border border-[#0F172A08] flex items-center justify-center shadow-sm shrink-0">
                        <Building2 size={18} className="text-[#111111]" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111111] text-sm group-hover:text-blue-600 transition-colors">{c.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-medium text-[#64748B]">{c.industry || 'Tecnologia'}</span>
                          <span className="w-1 h-1 rounded-full bg-[#0F172A15]" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Enterprise</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Projetos</p>
                        <p className="text-sm font-semibold text-[#111111] flex items-center gap-1.5">
                           {c.projects || 0}
                           <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 rounded-sm">+2</span>
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">Produtos</p>
                        <p className="text-sm font-semibold text-[#111111]">{c.products || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">MRR</p>
                      <p className="text-sm font-bold text-[#111111]">
                        R$ {getRevenue(c.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                      {formatStatus(c.status)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => onEdit(c, e)}
                        className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors"
                        title="Editar"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
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
      
      {/* Mobile Card View (shown only on small screens when viewMode is 'table') */}
      <div className="block lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {companies.map(c => (
          <div 
            key={c.id} 
            onClick={() => onSelect(c)}
            className="bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-pointer flex flex-col relative"
          >
            <div className="absolute top-4 right-4 z-10">
              <input 
                type="checkbox" 
                checked={selectedCompanyIds.includes(c.id)}
                onChange={(e) => toggleSelection(c.id, e as any)}
                onClick={(e) => e.stopPropagation()}
                className="w-5 h-5 rounded border-[#0F172A15] text-[#111111] focus:ring-[#111111] accent-[#111111] cursor-pointer" 
              />
            </div>
            
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-10 h-10 bg-[#FAFAFA] rounded-xl border border-[#0F172A08] flex items-center justify-center shrink-0">
                <Building2 size={16} className="text-[#111111]" />
              </div>
              <div>
                <h4 className="font-bold text-[#111111] text-sm">{c.name}</h4>
                <span className="text-[11px] font-medium text-[#64748B]">{c.industry || 'Tecnologia'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5">
               <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(c.status)}`}>
                 {formatStatus(c.status)}
               </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#64748B] mb-0.5">Receita</p>
                <p className="text-xs font-bold text-[#111111]">
                  R$ {getRevenue(c.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-[#64748B] mb-0.5">Projetos</p>
                <p className="text-xs font-bold text-[#111111]">{c.projects || 0}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
