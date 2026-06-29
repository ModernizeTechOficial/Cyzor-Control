import React from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  SortableContext, 
  arrayMove, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import IdeaKanbanColumn from './IdeaKanbanColumn';
import IdeaKanbanCard from './IdeaKanbanCard';

interface IdeaKanbanProps {
  ideas: any[];
  setIdeas: React.Dispatch<React.SetStateAction<any[]>>;
  onIdeaClick: (idea: any) => void;
  onUpdateIdeaStatus: (ideaId: string, newStatus: string) => void;
}

export default function IdeaKanban({ ideas, setIdeas, onIdeaClick, onUpdateIdeaStatus }: IdeaKanbanProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const columns = [
    { id: 'capturadas', title: 'Capturadas', color: 'bg-slate-100 text-slate-600 border-slate-200/50' },
    { id: 'avaliacao', title: 'Avaliação', color: 'bg-indigo-100 text-indigo-700 border-indigo-200/50' },
    { id: 'pesquisa', title: 'Pesquisa', color: 'bg-blue-100 text-blue-700 border-blue-200/50' },
    { id: 'mvp', title: 'MVP', color: 'bg-purple-100 text-purple-700 border-purple-200/50' },
    { id: 'lancadas', title: 'Lançadas', color: 'bg-emerald-100 text-emerald-700 border-emerald-200/50' },
    { id: 'arquivadas', title: 'Arquivadas', color: 'bg-neutral-100 text-neutral-600 border-neutral-200/50' }
  ];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveIdea = active.data.current?.type === 'Idea';
    const isOverIdea = over.data.current?.type === 'Idea';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveIdea) return;

    // Dropping an Idea over another Idea
    if (isActiveIdea && isOverIdea) {
      setIdeas((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        if (prev[activeIndex].column !== prev[overIndex].column) {
          const newIdeas = [...prev];
          newIdeas[activeIndex].column = prev[overIndex].column;
          return arrayMove(newIdeas, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dropping an Idea over a Column
    if (isActiveIdea && isOverColumn) {
      setIdeas((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const newIdeas = [...prev];
        newIdeas[activeIndex].column = overId;
        return arrayMove(newIdeas, activeIndex, activeIndex);
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const activeIdea = ideas.find(i => i.id === active.id);
    if(activeIdea) {
       // Call API update if column changed
       const originalCol = activeIdea.originalColumn || activeIdea.column; // Needs proper state management to track original if needed, but for simplicity we'll just trigger update on drop
       onUpdateIdeaStatus(activeIdea.id, activeIdea.column);
    }
  };

  const activeIdea = activeId ? ideas.find((i) => i.id === activeId) : null;

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar min-h-[600px] h-full items-start">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.map(col => (
          <IdeaKanbanColumn 
            key={col.id}
            column={col}
            ideas={ideas.filter(i => i.column === col.id)}
            onIdeaClick={onIdeaClick}
          />
        ))}

        <DragOverlay>
          {activeIdea ? <IdeaKanbanCard idea={activeIdea} onClick={() => {}} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
