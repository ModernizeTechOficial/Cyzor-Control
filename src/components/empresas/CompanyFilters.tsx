import { Search, Filter, LayoutGrid, List, ArrowDownAZ } from 'lucide-react';

interface CompanyFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  segmentFilter: string;
  setSegmentFilter: (v: string) => void;
  viewMode: 'table' | 'grid';
  setViewMode: (v: 'table' | 'grid') => void;
}

export default function CompanyFilters({
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  segmentFilter, setSegmentFilter,
  viewMode, setViewMode
}: CompanyFiltersProps) {
  
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-[#0F172A08] p-4 rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)]">
      
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:max-w-[350px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar empresas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-bold text-[#111111] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos Status</option>
              <option value="ACTIVE">Ativos</option>
              <option value="AT_RISK">Em Risco</option>
              <option value="INACTIVE">Inativos</option>
            </select>
          </div>

          {/* Segment Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Segmento:</span>
            <select 
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="text-xs font-bold text-[#111111] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Todos Segmentos</option>
              <option value="TECNOLOGIA">Tecnologia</option>
              <option value="FINANCEIRO">Financeiro</option>
              <option value="SAUDE">Saúde</option>
              <option value="VAREJO">Varejo</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[#111111] font-bold text-xs hover:bg-slate-100 transition-all">
          <ArrowDownAZ size={14} className="text-slate-400" />
          <span>Ordenar</span>
        </button>

        {/* View Mode */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-0.5">
          <button 
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <List size={14} />
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutGrid size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
