import React from 'react';
import { Filter, LayoutGrid, List, Clock, KanbanSquare } from 'lucide-react';

interface BoardToolbarProps {
  innerSearch: string;
  setInnerSearch: (v: string) => void;
  priorityFilter?: string;
  setPriorityFilter?: (v: string) => void;
  clientFilter?: string;
  setClientFilter?: (v: string) => void;
  statusFilter?: string;
  setStatusFilter?: (v: string) => void;
  clients?: any[];
  
  // View mode switcher
  viewMode: 'kanban' | 'list' | 'timeline' | 'gantt';
  setViewMode: (v: 'kanban' | 'list' | 'timeline' | 'gantt') => void;
}

export default function BoardToolbar({
  innerSearch, setInnerSearch,
  priorityFilter, setPriorityFilter,
  clientFilter, setClientFilter,
  statusFilter, setStatusFilter,
  clients = [],
  viewMode, setViewMode
}: BoardToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
      <div className="flex items-center gap-2 text-neutral-400">
        <Filter size={13} />
        <span className="text-[10px] font-black uppercase tracking-wider">Filtros Ativos</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        <div className="flex bg-slate-100 p-1 rounded-[12px] border border-[#0F172A0F] shrink-0 mr-2">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === 'kanban' 
                ? 'bg-white shadow-sm text-[#111111]' 
                : 'text-slate-500 hover:text-[#111111]'
            }`}
          >
            <LayoutGrid size={11} />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-white shadow-sm text-[#111111]' 
                : 'text-slate-500 hover:text-[#111111]'
            }`}
          >
            <List size={11} />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === 'timeline' 
                ? 'bg-white shadow-sm text-[#111111]' 
                : 'text-slate-500 hover:text-[#111111]'
            }`}
          >
            <Clock size={11} />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all cursor-pointer ${
              viewMode === 'gantt' 
                ? 'bg-white shadow-sm text-[#111111]' 
                : 'text-slate-500 hover:text-[#111111]'
            }`}
          >
            <KanbanSquare size={11} />
            <span className="hidden sm:inline">Gantt</span>
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Filtro rápido..." 
          value={innerSearch}
          onChange={(e) => setInnerSearch(e.target.value)}
          className="bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white focus:border-neutral-300 border border-neutral-200/55 rounded-lg px-2.5 py-1 text-xs outline-none transition-all font-semibold max-w-[150px]"
        />

        {setStatusFilter && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-neutral-200/50 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none cursor-pointer"
          >
            <option value="ALL">Todos os Status</option>
            <option value="Planejamento">Planejamento</option>
            <option value="Em Desenvolvimento">Em Desenvolvimento</option>
            <option value="Beta">Beta</option>
            <option value="Produção">Produção</option>
          </select>
        )}

        {setPriorityFilter && (
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-neutral-200/50 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none cursor-pointer"
          >
            <option value="Todas">Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Média">Média</option>
            <option value="Baixa">Baixa</option>
          </select>
        )}

        {setClientFilter && (
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="bg-[#FAFAFA] border border-neutral-200/50 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none cursor-pointer"
          >
            <option value="Todos">Clientes</option>
            {clients.map(c => (
              <option key={c.id} value={c.id || c.name}>{c.name}</option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
