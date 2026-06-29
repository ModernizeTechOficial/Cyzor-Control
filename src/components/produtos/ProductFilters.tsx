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
}

export default function ProductFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  companyFilter, setCompanyFilter,
  viewMode, setViewMode
}: ProductFiltersProps) {
  
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-[#0F172A08] p-4 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:max-w-[300px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input 
            type="text" 
            placeholder="Pesquisar produtos..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-[#111111] placeholder:text-[#64748B] outline-none focus:bg-white focus:border-[#0F172A15] focus:shadow-sm transition-all"
          />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-[#111111] outline-none focus:bg-white focus:border-[#0F172A15] transition-all cursor-pointer"
          >
            <option value="ALL">Todos Status</option>
            <option value="PRODUÇÃO">Publicado</option>
            <option value="EM DESENVOLVIMENTO">Em desenvolvimento</option>
            <option value="BETA">Beta</option>
            <option value="PLANEJAMENTO">Planejamento</option>
            <option value="ARQUIVADO">Arquivado</option>
          </select>
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>

        {/* Company Filter */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-[#111111] outline-none focus:bg-white focus:border-[#0F172A15] transition-all cursor-pointer"
          >
            <option value="ALL">Todas Empresas</option>
            <option value="Cyzor">Cyzor</option>
            {/* Outras empresas devem vir das props idealmente, mockando por enquanto */}
          </select>
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] font-bold text-sm hover:bg-white hover:border-[#0F172A15] transition-all">
          <ArrowDownAZ size={16} className="text-[#64748B]" />
          Ordenar por
        </button>

        {/* View Mode */}
        <div className="flex items-center bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl p-1">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
            title="Tabela"
          >
            <List size={16} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
            title="Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button 
            onClick={() => setViewMode('kanban')}
            className={`p-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#111111]' : 'text-[#64748B] hover:text-[#111111]'}`}
            title="Kanban"
          >
            <KanbanSquare size={16} />
          </button>
        </div>
      </div>

    </div>
  );
}
