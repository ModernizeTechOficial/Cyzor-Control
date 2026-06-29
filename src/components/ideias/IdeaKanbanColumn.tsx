import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import IdeaKanbanCard from './IdeaKanbanCard';

interface IdeaKanbanColumnProps {
  column: { id: string, title: string, color: string };
  ideas: any[];
  onIdeaClick: (idea: any) => void;
}

export default function IdeaKanbanColumn({ column, ideas, onIdeaClick }: IdeaKanbanColumnProps) {
  const ideaIds = useMemo(() => ideas.map(i => i.id), [ideas]);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className="flex flex-col flex-shrink-0 w-[340px] bg-[#FAFAFA] rounded-3xl p-4 border border-[#0F172A08]"
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${column.color}`}>
            {column.title}
          </span>
          <span className="text-xs font-bold text-[#64748B] bg-white border border-[#0F172A05] px-2 py-0.5 rounded-full shadow-sm">
            {ideas.length}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[150px]">
        <SortableContext items={ideaIds} strategy={verticalListSortingStrategy}>
          {ideas.map(idea => (
            <IdeaKanbanCard key={idea.id} idea={idea} onClick={() => onIdeaClick(idea)} />
          ))}
        </SortableContext>
        
        {ideas.length === 0 && (
          <div className="h-24 border-2 border-dashed border-[#0F172A0F] rounded-[20px] flex items-center justify-center text-[#64748B] text-xs font-medium">
            Arraste ideias para cá
          </div>
        )}
      </div>
    </div>
  );
}
