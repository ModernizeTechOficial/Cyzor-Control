import React from 'react';
import { Plus, Star, User, Calendar } from 'lucide-react';

export interface KanbanColumn {
  id: string;
  label: string;
  badge: string;
}

export interface KanbanItem {
  id: string | number;
  title: string;
  subtitle: string; 
  owner?: string;
  priority: string;
  progress: number;
  dueDate?: string;
  budgetOrValue?: string | number;
  budgetLabel?: string;
  isStarred?: boolean;
  status: string; 
  raw: any;
}

interface BoardKanbanProps {
  columns: KanbanColumn[];
  items: KanbanItem[];
  onDrop: (e: React.DragEvent, colId: string) => void;
  onItemClick: (item: any) => void;
  onToggleFavorite?: (id: number) => void;
  onAddClick?: (colId: string) => void;
  emptyMessage?: string;
}

export default function BoardKanban({
  columns,
  items,
  onDrop,
  onItemClick,
  onToggleFavorite,
  onAddClick,
  emptyMessage = "Vazio"
}: BoardKanbanProps) {
  const handleDragStart = (e: React.DragEvent, id: string | number) => {
    e.dataTransfer.setData('itemId', id.toString());
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {columns.map((col) => {
        const columnItems = items.filter(p => p.status === col.id);

        return (
          <div 
            key={col.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => onDrop(e, col.id)}
            className="flex-shrink-0 w-72 bg-[#FAFAFA]/50 rounded-2xl p-3 border border-neutral-100 flex flex-col min-h-[520px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1 text-left">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${col.badge}`}>
                  {col.label}
                </span>
                <span className="text-[10px] font-extrabold text-neutral-400">({columnItems.length})</span>
              </div>
              {onAddClick && (
                <button 
                  onClick={() => onAddClick(col.id)}
                  className="w-5 h-5 rounded-md hover:bg-neutral-100/80 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-neutral-200/50"
                  title={`Adicionar item em ${col.label}`}
                >
                  <Plus size={12} />
                </button>
              )}
            </div>

            {/* Cards stack */}
            <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1 scrollbar-none flex-1">
              {columnItems.length > 0 ? (
                columnItems.map((p) => {
                  return (
                    <div 
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, p.id)}
                      className="bg-white p-4 rounded-xl border border-neutral-200/50 hover:border-neutral-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all text-left relative group"
                    >
                      {/* Starred Favorite */}
                      {onToggleFavorite && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onToggleFavorite(Number(p.id)); }}
                          className="absolute top-3 right-3 text-neutral-300 hover:text-amber-500 transition-colors"
                        >
                          <Star size={13} fill={p.isStarred ? "currentColor" : "none"} className={p.isStarred ? "text-amber-500" : ""} />
                        </button>
                      )}

                      {/* Client & Title */}
                      <span className="text-[9px] font-bold text-neutral-400 block tracking-wide uppercase">
                        {p.subtitle || 'S/N'}
                      </span>
                      <h4 
                        onClick={() => onItemClick(p.raw)}
                        className="text-xs font-black text-neutral-900 mt-1 hover:underline cursor-pointer tracking-tight"
                      >
                        {p.title}
                      </h4>

                      <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-500 font-medium italic">
                        <User size={10} className="text-neutral-400" />
                        {p.owner || 'Sem dono'}
                      </div>

                      {/* Priority Status indicator */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                          p.priority === 'Alta' ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-600'
                        }`}>
                          {p.priority || 'Normal'}
                        </span>
                        
                        {p.dueDate && (
                          <span className="text-[9px] font-semibold text-neutral-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(p.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>

                      {/* Interactive Progress Bar */}
                      <div className="mt-3.5">
                        <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold mb-1">
                          <span>Progresso</span>
                          <span>{p.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-950 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>

                      {/* Team initials display / Values */}
                      {p.budgetOrValue !== undefined && (
                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-neutral-400 uppercase">{p.budgetLabel || 'Valor'}</span>
                          <span className="text-xs font-black text-neutral-900">
                            {typeof p.budgetOrValue === 'number' 
                              ? `R$ ${p.budgetOrValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                              : p.budgetOrValue}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200/50 rounded-xl text-center">
                  <span className="text-[9px] font-black tracking-widest text-neutral-300 uppercase">{emptyMessage}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
