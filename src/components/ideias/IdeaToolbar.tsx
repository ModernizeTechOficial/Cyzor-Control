import { Search, Filter, LayoutGrid, List, KanbanSquare, Clock, ArrowDownAZ } from 'lucide-react';

interface IdeaToolbarProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  viewMode: 'kanban' | 'list' | 'roadmap';
  setViewMode: (v: 'kanban' | 'list' | 'roadmap') => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
}

export default function IdeaToolbar({
  searchTerm, setSearchTerm,
  viewMode, setViewMode,
  statusFilter, setStatusFilter
}: IdeaToolbarProps) {
  
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white border border-[#0F172A08] p-4 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-1">
        {/* Search */}
        <div className="relative w-full sm:max-w-[300px]">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input 
            type="text" 
            placeholder="Pesquisar ideias..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-10 pr-4 text-sm font-medium text-[#111111] placeholder:text-[#64748B] outline-none focus:bg-white focus:border-[#0F172A15] focus:shadow-sm transition-all"
          />
        </div>

        {/* Filter Priority */}
        <div className="relative w-full sm:w-auto">
          <select 
            className="w-full sm:w-auto appearance-none bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-[#111111] outline-none focus:bg-white focus:border-[#0F172A15] transition-all cursor-pointer"
          >
            <option value="ALL">Todas Prioridades</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>

        {/* Status Filter */}
        <div className="relative w-full sm:w-auto">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-auto appearance-none bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl py-3 pl-4 pr-10 text-sm font-bold text-[#111111] outline-none focus:bg-white focus:border-[#0F172A15] transition-all cursor-pointer"
          >
            <option value="ALL">Todos Status</option>
            <option value="CAPTURADAS">Capturadas</option>
            <option value="AVALIACAO">Em Avaliação</option>
            <option value="PESQUISA">Em Pesquisa</option>
            <option value="MVP">MVP Planejado</option>
            <option value="LANCADAS">Lançadas</option>
            <option value="ARQUIVADAS">Arquivadas</option>
          </select>
          <Filter size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" />
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
        <button className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] font-bold text-sm hover:bg-white hover:border-[#0F172A15] transition-all">
          <ArrowDownAZ size={16} className="text-[#64748B]" />
          Ordenar
        </button>

        {/* View Mode */}
        <div className="flex items-center bg-[#FAFAFA] border border-[#0F172A08] rounded-2xl p-1">
          <button 
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${viewMode === 'kanban' ? 'bg-white shadow-sm text-[#111111] font-bold' : 'text-[#64748B] font-medium hover:text-[#111111]'}`}
            title="Kanban"
          >
            <KanbanSquare size={16} />
            <span className="hidden sm:inline text-xs">Kanban</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#111111] font-bold' : 'text-[#64748B] font-medium hover:text-[#111111]'}`}
            title="Lista"
          >
            <List size={16} />
            <span className="hidden sm:inline text-xs">Lista</span>
          </button>
          <button 
            onClick={() => setViewMode('roadmap')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${viewMode === 'roadmap' ? 'bg-white shadow-sm text-[#111111] font-bold' : 'text-[#64748B] font-medium hover:text-[#111111]'}`}
            title="Roadmap"
          >
            <Clock size={16} />
            <span className="hidden sm:inline text-xs">Roadmap</span>
          </button>
        </div>
      </div>

    </div>
  );
}
