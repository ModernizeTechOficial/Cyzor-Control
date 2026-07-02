import React, { useState } from 'react';
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
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { useAuth } from '../../context/AuthContext';
import ProductKanbanColumn from './ProductKanbanColumn';
import ProductKanbanCard from './ProductKanbanCard';

interface ProductKanbanProps {
  products: any[];
  onSelect: (product: any) => void;
  onRefresh?: () => void;
  setProducts?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ProductKanban({ products, onSelect, onRefresh, setProducts }: ProductKanbanProps) {
  const { token } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const columns = [
    { id: 'PLANEJAMENTO', title: 'Planejamento', color: 'bg-slate-100 text-slate-600 border-slate-200', mappedStatus: 'Planejamento' },
    { id: 'DESENVOLVIMENTO', title: 'Desenvolvimento', color: 'bg-orange-100 text-orange-700 border-orange-200', mappedStatus: 'Em Desenvolvimento' },
    { id: 'BETA', title: 'Beta', color: 'bg-blue-100 text-blue-700 border-blue-200', mappedStatus: 'Beta' },
    { id: 'PRODUÇÃO', title: 'Publicado', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', mappedStatus: 'Produção' }
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
    if (!over || !setProducts) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveProduct = active.data.current?.type === 'Product';
    const isOverProduct = over.data.current?.type === 'Product';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveProduct) return;

    // Dropping a Product over another Product
    if (isActiveProduct && isOverProduct) {
      setProducts((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const overIndex = prev.findIndex((t) => t.id === overId);

        const activeProduct = prev[activeIndex];
        const overProduct = prev[overIndex];

        // Normalizing status for comparison
        const activeStatus = activeProduct.status?.toUpperCase() || 'PRODUÇÃO';
        const overStatus = overProduct.status?.toUpperCase() || 'PRODUÇÃO';

        if (activeStatus !== overStatus) {
          const newProducts = [...prev];
          newProducts[activeIndex] = { ...activeProduct, status: overProduct.status };
          return arrayMove(newProducts, activeIndex, overIndex);
        }

        return arrayMove(prev, activeIndex, overIndex);
      });
    }

    // Dropping a Product over a Column
    if (isActiveProduct && isOverColumn) {
      setProducts((prev) => {
        const activeIndex = prev.findIndex((t) => t.id === activeId);
        const activeProduct = prev[activeIndex];
        const targetCol = columns.find(c => c.id === overId);
        
        if (targetCol) {
          const newProducts = [...prev];
          newProducts[activeIndex] = { ...activeProduct, status: targetCol.mappedStatus };
          return arrayMove(newProducts, activeIndex, activeIndex);
        }
        
        return prev;
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const product = products.find(p => p.id === active.id);
    if (!product) return;

    // Persist change to backend
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: product.status })
      });
      if (res.ok) {
        onRefresh?.();
      } else {
        throw new Error('Failed to update product status');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getProductsByStatus = (statusId: string) => {
    return products.filter(p => {
      const s = p.status?.toUpperCase() || 'PRODUÇÃO';
      if (statusId === 'DESENVOLVIMENTO' && (s === 'EM DESENVOLVIMENTO' || s === 'DESENVOLVIMENTO')) return true;
      return s === statusId;
    });
  };

  const activeProduct = activeId ? products.find((p) => p.id === activeId) : null;

  return (
    <div className={`flex gap-6 overflow-x-auto pb-6 scrollbar-none min-h-[500px] h-full items-start transition-opacity ${isUpdating ? 'opacity-70' : ''}`}>
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {columns.map(col => (
          <ProductKanbanColumn 
            key={col.id}
            column={col}
            products={getProductsByStatus(col.id)}
            onProductClick={onSelect}
          />
        ))}

        <DragOverlay>
          {activeProduct ? <ProductKanbanCard product={activeProduct} onClick={() => {}} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

