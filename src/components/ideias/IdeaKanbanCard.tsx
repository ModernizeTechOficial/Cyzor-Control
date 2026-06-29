import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Paperclip, MoreHorizontal, Zap } from 'lucide-react';

interface IdeaKanbanCardProps {
  idea: any;
  onClick: () => void;
  isOverlay?: boolean;
}

export default function IdeaKanbanCard({ idea, onClick, isOverlay }: IdeaKanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: idea.id,
    data: {
      type: 'Idea',
      idea,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const getPriorityColor = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'alta': return 'text-rose-600 bg-rose-50 border-rose-100/50';
      case 'média': return 'text-amber-600 bg-amber-50 border-amber-100/50';
      case 'baixa': return 'text-emerald-600 bg-emerald-50 border-emerald-100/50';
      default: return 'text-slate-600 bg-slate-50 border-slate-100/50';
    }
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="opacity-30 bg-white border-2 border-dashed border-[#0F172A15] rounded-[24px] h-[180px] w-full"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-grab hover:shadow-md hover:-translate-y-1 transition-all group relative flex flex-col gap-3 ${isOverlay ? 'scale-105 shadow-xl rotate-2' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border ${getPriorityColor(idea.prioridade || 'Média')}`}>
            {idea.prioridade || 'Média'}
          </span>
          <span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider bg-[#FAFAFA] text-[#64748B] border border-[#0F172A08]">
            {idea.categoria || 'SaaS'}
          </span>
        </div>
        <button className="p-1 text-[#64748B] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); }}>
          <MoreHorizontal size={16} />
        </button>
      </div>

      <div>
        <h4 className="font-bold text-[#111111] text-sm mb-1 leading-snug group-hover:text-blue-600 transition-colors">{idea.name}</h4>
        <p className="text-xs text-[#64748B] font-medium line-clamp-2 leading-relaxed">{idea.desc || 'Nenhuma descrição detalhada.'}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-[#0F172A05]">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Score</span>
          <div className="flex items-center gap-1">
             <Zap size={10} className="text-amber-500" />
             <span className="text-xs font-bold text-[#111111]">{idea.score || 80}</span>
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Valor Est.</span>
          <span className="text-xs font-bold text-emerald-600">{idea.potencial || '$$$'}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#0F172A05]">
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">JD</div>
          <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">MR</div>
        </div>
        <div className="flex gap-3 text-[#64748B]">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <MessageSquare size={12} />
            <span>3</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Paperclip size={12} />
            <span>1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
