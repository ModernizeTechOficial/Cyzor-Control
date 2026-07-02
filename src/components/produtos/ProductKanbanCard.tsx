import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal } from 'lucide-react';

interface ProductKanbanCardProps {
  product: any;
  onClick: () => void;
  isOverlay?: boolean;
}

export default function ProductKanbanCard({ product, onClick, isOverlay }: ProductKanbanCardProps) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    data: {
      type: 'Product',
      product,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  if (isDragging && !isOverlay) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className="opacity-30 bg-white border-2 border-dashed border-[#0F172A15] rounded-[24px] h-[160px] w-full"
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
      className={`bg-white border border-[#0F172A08] rounded-[24px] p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] cursor-grab hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col gap-3 relative ${isOverlay ? 'scale-105 shadow-xl rotate-2 z-50 ring-2 ring-indigo-500/20' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center shadow-sm shrink-0">
          <span className="font-display font-bold text-white text-sm">
            {product.logo || product.name?.charAt(0) || 'P'}
          </span>
        </div>
        <button 
          className="p-1 text-[#64748B] hover:text-[#111111] opacity-0 group-hover:opacity-100 transition-opacity" 
          onClick={(e) => { e.stopPropagation(); }}
        >
          <MoreHorizontal size={16} />
        </button>
      </div>
      
      <div>
        <h4 className="font-bold text-[#111111] text-sm mb-1 leading-snug group-hover:text-indigo-600 transition-colors">{product.name}</h4>
        <p className="text-xs text-[#64748B] font-medium line-clamp-2 leading-relaxed">
          {product.description || 'Nenhuma descrição.'}
        </p>
      </div>
      
      <div className="flex justify-between items-center pt-3 mt-1 border-t border-[#0F172A05]">
        <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
          {product.companyName || 'Empresa Interna'}
        </span>
        <div className="flex -space-x-2">
          <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
            {product.name?.charAt(0) || 'P'}
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
            +
          </div>
        </div>
      </div>
    </div>
  );
}
