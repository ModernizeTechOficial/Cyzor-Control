import React from 'react';
import { StrategicRoadmap } from '../../StrategicRoadmap';

interface RoadmapTabProps {
  product: any;
  onSave?: any;
}

export default function RoadmapTab({ product }: RoadmapTabProps) {
  if (!product) return null;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#111111]">Roadmap de Produto</h2>
          <p className="text-xs text-[#64748B]">Planeje, acompanhe e publique marcos evolutivos e novas features para o produto {product.name}</p>
        </div>
      </div>

      <StrategicRoadmap productId={product.id} />
    </div>
  );
}
