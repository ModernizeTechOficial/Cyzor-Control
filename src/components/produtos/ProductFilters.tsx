import { Search, Filter, LayoutGrid, List, ArrowDownAZ, KanbanSquare } from 'lucide-react';

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  companyFilter: string;
  setCompanyFilter: (v: string) => void;
  viewMode: 'table' | 'grid' | 'kanban';
  setViewMode: (v: 'table' | 'grid' | 'kanban') => void;
  companies?: any[];
}

export default function ProductFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  companyFilter, setCompanyFilter,
  viewMode, setViewMode,
  companies = []
}: ProductFiltersProps) {
  
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:max-w-[300px]">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar produtos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-[#111111] placeholder:text-slate-400 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-[#111111] outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="ALL">Todos Status</option>
            <option value="PRODUÇÃO">Publicado</option>
            <option value="EM DESENVOLVIMENTO">Em desenvolvimento</option>
            <option value="BETA">Beta</option>
            <option value="PLANEJAMENTO">Planejamento</option>
            <option value="ARQUIVADO">Arquivado</option>
          </select>
          <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Company Filter */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-xs font-bold text-[#111111] outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
          >
            <option value="ALL">Todas Empresas</option>
            {companies.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
          <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#111111] font-bold text-xs transition-all shadow-sm">
          <ArrowDownAZ size={14} className="text-slate-500" />
          <span>Ordenar por</span>
        </button>

        {/* View Mode */}
        <div className="flex items-center bg-slate-50/50 border border-slate-200 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Tabela"
          >
            <List size={14} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Grid"
          >
            <LayoutGrid size={14} strokeWidth={2.5} />
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            title="Kanban"
          >
            <KanbanSquare size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
