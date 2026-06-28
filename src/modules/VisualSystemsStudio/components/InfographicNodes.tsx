import { Handle, Position, NodeProps } from 'reactflow';
import { Type, Image as ImageIcon, ArrowRight, Layers, Layout, MoreHorizontal } from 'lucide-react';
import { NodeData } from '../types';

const nodeStyles = "bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-w-[180px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

export function BlockNode({ data }: NodeProps<NodeData>) {
  const config = data.config || {};
  return (
    <div 
      style={{ 
        backgroundColor: data.color || 'white',
        borderRadius: `24px`,
        fontSize: `${data.fontSize || 14}px`,
        textAlign: config.text_align as any || 'left'
      }}
      className={`${nodeStyles} p-6 group transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-8 h-8 rounded-xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center text-[#111111]">
          <Layout size={16} />
        </div>
        <button className="text-[#64748B]/30 hover:text-[#111111] transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <div className="font-bold tracking-tight text-[#111111]">{data.label || 'Bloco de Conteúdo'}</div>
      <div className="text-[11px] text-[#64748B] mt-2 leading-relaxed opacity-60">
        {config.content || 'Elemento visual para organização de conteúdo em layouts modulares.'}
      </div>
      
      <Handle type="target" position={Position.Top} className="w-4 h-4 !bg-white !border-2 !border-[#111111] hover:!bg-[#111111] shadow-md transition-all cursor-crosshair" />
      <Handle type="source" position={Position.Bottom} className="w-4 h-4 !bg-white !border-2 !border-[#111111] hover:!bg-[#111111] shadow-md transition-all cursor-crosshair" />
      <Handle type="target" position={Position.Left} className="w-4 h-4 !bg-white !border-2 !border-[#111111] hover:!bg-[#111111] !-left-2 shadow-md transition-all cursor-crosshair" />
      <Handle type="source" position={Position.Right} className="w-4 h-4 !bg-white !border-2 !border-[#111111] hover:!bg-[#111111] !-right-2 shadow-md transition-all cursor-crosshair" />
    </div>
  );
}

export function StepNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="flex flex-col items-center gap-4 group">
      <div className="w-14 h-14 rounded-[20px] bg-white border border-[#0F172A08] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-center text-[#111111] font-bold text-lg transition-all group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:scale-105">
        {data.config?.stepNumber || 1}
      </div>
      <div className="text-center">
        <div className="text-[#111111] font-bold text-sm tracking-tight">{data.label || 'Passo do Processo'}</div>
        <div className="px-2 py-0.5 bg-[#FAFAFA] border border-[#0F172A05] rounded-full text-[#64748B] text-[9px] uppercase font-black tracking-widest mt-1.5 inline-block">
          Ativo
        </div>
      </div>

      <Handle type="target" position={Position.Left} className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-left-2 shadow-md transition-all cursor-crosshair" />
      <Handle type="source" position={Position.Right} className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-right-2 shadow-md transition-all cursor-crosshair" />
    </div>
  );
}
