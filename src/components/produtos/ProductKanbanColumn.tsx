import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal } from 'lucide-react';
import ProductKanbanCard from './ProductKanbanCard';

interface ProductKanbanColumnProps {
  column: any;
  products: any[];
  onProductClick: (product: any) => void;
}

export default function ProductKanbanColumn({ column, products, onProductClick }: ProductKanbanColumnProps) {
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
            {products.length}
          </span>
        </div>
        <div className="flex gap-1">
          <button className="p-1.5 rounded-lg text-[#64748B] hover:bg-white hover:shadow-sm border border-transparent hover:border-[#0F172A08] transition-all">
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 min-h-[150px]">
        <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
          {products.map(product => (
            <ProductKanbanCard 
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
            />
          ))}
        </SortableContext>
        
        {products.length === 0 && (
          <div className="h-24 border-2 border-dashed border-[#0F172A0F] rounded-[20px] flex items-center justify-center text-[#64748B] text-xs font-medium bg-white/50">
            Arraste cards para cá
          </div>
        )}
      </div>
    </div>
  );
}
