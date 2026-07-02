import React, { useState } from 'react';
import { Calendar, ChevronRight, ChevronLeft, Lightbulb, Star, Plus, Info, LayoutGrid, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface IdeaRoadmapProps {
  ideas: any[];
  onIdeaClick: (idea: any) => void;
  onUpdateIdeaQuarter: (ideaId: string, newQuarter: string) => void;
}

const QUARTERS = [
  { id: 'Backlog', title: 'Backlog / Não Planejado', desc: 'Ideias em análise ou sem data', color: 'border-slate-100 bg-slate-50/40 text-slate-700 header-bg:bg-slate-100/50' },
  { id: 'Q3 2026', title: 'Q3 2026', desc: 'Trimestre Atual (Jul - Set)', color: 'border-indigo-100 bg-indigo-50/10 text-indigo-800 header-bg:bg-indigo-100/30' },
  { id: 'Q4 2026', title: 'Q4 2026', desc: 'Próximo Trimestre (Out - Dez)', color: 'border-blue-100 bg-blue-50/10 text-blue-800 header-bg:bg-blue-100/30' },
  { id: 'Q1 2027', title: 'Q1 2027', desc: 'Início de 2027 (Jan - Mar)', color: 'border-amber-100 bg-amber-50/10 text-amber-800 header-bg:bg-amber-100/30' },
  { id: 'Q2 2027', title: 'Q2 2027', desc: 'Meio de 2027 (Abr - Jun)', color: 'border-emerald-100 bg-emerald-50/10 text-emerald-800 header-bg:bg-emerald-100/30' },
];

export default function IdeaRoadmap({ ideas, onIdeaClick, onUpdateIdeaQuarter }: IdeaRoadmapProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'capturadas':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'avaliacao':
        return 'bg-amber-150/10 text-amber-700 border-amber-200/50 bg-amber-50';
      case 'pesquisa':
        return 'bg-blue-100 text-blue-700 border-blue-200/50';
      case 'mvp':
        return 'bg-purple-100 text-purple-700 border-purple-200/50';
      case 'lancadas':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200/50';
      default:
        return 'bg-neutral-100 text-neutral-600 border-neutral-200/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'capturadas': return 'Capturada';
      case 'avaliacao': return 'Em Avaliação';
      case 'pesquisa': return 'Pesquisa';
      case 'mvp': return 'MVP';
      case 'lancadas': return 'Lançada';
      default: return 'Nova';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'alta': return 'text-red-600 bg-red-50';
      case 'média': return 'text-amber-600 bg-amber-50';
      case 'baixa': return 'text-blue-600 bg-blue-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full overflow-hidden animate-in fade-in duration-500">
      
      {/* Alert Header / Context */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10 rounded-2xl p-4 sm:p-5">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">Planejamento Estratégico por Trimestres (Roadmap)</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Arraste e solte as ideias para planejar em quais trimestres elas serão executadas ou lançadas. As ideias do backlog podem ser escalonadas para frentes de MVP ou validação de mercado.
          </p>
        </div>
      </div>

      {/* Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 overflow-x-auto pb-4">
        {QUARTERS.map((quarter) => {
          const quarterIdeas = ideas.filter(idea => idea.quarter === quarter.id);
          const isOver = dragOverColumn === quarter.id;

          return (
            <div
              key={quarter.id}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverColumn !== quarter.id) {
                  setDragOverColumn(quarter.id);
                }
              }}
              onDragLeave={() => {
                setDragOverColumn(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                if (draggedId) {
                  onUpdateIdeaQuarter(draggedId, quarter.id);
                  setDraggedId(null);
                }
              }}
              className={`flex flex-col rounded-[24px] border transition-all duration-200 min-h-[500px] max-h-[680px] overflow-hidden ${
                isOver 
                  ? 'border-indigo-400 bg-indigo-50/20 shadow-lg scale-[1.01]' 
                  : `border-slate-100 ${quarter.color.split(' ')[1]}`
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100/60 flex flex-col gap-1.5 shrink-0 bg-white/70 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wider font-mono ${quarter.color.split(' ')[2]}`}>
                    {quarter.title}
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {quarterIdeas.length}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">{quarter.desc}</span>
              </div>

              {/* Scrollable Cards Container */}
              <div className="flex-grow overflow-y-auto p-3 flex flex-col gap-3 min-h-[150px] scrollbar-thin">
                {quarterIdeas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-200/60 rounded-2xl h-full min-h-[120px]">
                    <Lightbulb className="text-slate-300 mb-2 animate-pulse" size={24} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vazio</span>
                    <span className="text-[9px] text-slate-400 mt-0.5">Solte ideias aqui para planejar</span>
                  </div>
                ) : (
                  quarterIdeas.map((idea) => (
                    <div
                      key={idea.id}
                      draggable
                      onDragStart={() => setDraggedId(idea.id)}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setDragOverColumn(null);
                      }}
                      onClick={() => onIdeaClick(idea)}
                      className={`p-4 bg-white rounded-2xl border border-slate-150 hover:border-slate-300 shadow-[0_2px_8px_rgba(15,23,42,0.02)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.05)] cursor-pointer transition-all flex flex-col gap-3 group relative overflow-hidden ${
                        draggedId === idea.id ? 'opacity-40 scale-95 border-dashed border-indigo-400' : ''
                      }`}
                    >
                      {/* Active indicator */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Title & Emoji */}
                      <div className="flex items-start gap-2.5">
                        <span className="text-base leading-none shrink-0 mt-0.5">{idea.emoji || '💡'}</span>
                        <div className="flex flex-col min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 tracking-tight leading-snug group-hover:text-indigo-600 transition-colors break-words">
                            {idea.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 line-clamp-2 mt-0.5">{idea.categoria}</span>
                        </div>
                      </div>

                      {/* Badges / Meta */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(idea.column)}`}>
                          {getStatusLabel(idea.column)}
                        </span>
                        
                        {idea.prioridade && (
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${getPriorityStyle(idea.prioridade)}`}>
                            {idea.prioridade}
                          </span>
                        )}

                        <span className="text-[9px] font-mono text-slate-400 ml-auto flex items-center gap-1">
                          <Star size={8} className="text-yellow-400 fill-yellow-400" />
                          {idea.score || 80}
                        </span>
                      </div>

                      {/* Fast Shift Buttons (Touch/Click Accessibility) */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          title="Mover para trimestre anterior"
                          disabled={quarter.id === 'Backlog'}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIdx = QUARTERS.findIndex(q => q.id === quarter.id);
                            if (currentIdx > 0) {
                              onUpdateIdeaQuarter(idea.id, QUARTERS[currentIdx - 1].id);
                            }
                          }}
                          className="p-1 rounded bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ChevronLeft size={12} />
                        </button>
                        
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest font-mono">Arraste para mover</span>

                        <button
                          type="button"
                          title="Mover para próximo trimestre"
                          disabled={quarter.id === 'Q2 2027'}
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentIdx = QUARTERS.findIndex(q => q.id === quarter.id);
                            if (currentIdx < QUARTERS.length - 1) {
                              onUpdateIdeaQuarter(idea.id, QUARTERS[currentIdx + 1].id);
                            }
                          }}
                          className="p-1 rounded bg-slate-50 hover:bg-slate-100 hover:text-slate-900 text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
