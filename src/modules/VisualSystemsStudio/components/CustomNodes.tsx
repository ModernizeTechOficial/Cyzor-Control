import { Handle, Position, NodeProps } from 'reactflow';
import { Play, Zap, Split, StopCircle, MoreHorizontal, Clock, Terminal } from 'lucide-react';
import { NodeData } from '../types';

const nodeStyles = "bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-w-[220px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

function NodeHeader({ icon: Icon, color, label }: { icon: any, color: string, label: string }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] rounded-t-[24px]">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={14} className="text-white" />
        </div>
        <span className="text-[11px] font-bold text-[#111111] tracking-tight">{label}</span>
      </div>
      <button className="text-[#64748B]/30 hover:text-[#111111] transition-colors">
        <MoreHorizontal size={14} />
      </button>
    </div>
  );
}

function NodeRow({ label, value, icon: Icon }: { label: string, value: string, icon?: any }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-[#FAFAFA] transition-colors first:pt-3 last:pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#64748B]/40" />}
        <span className="text-[10px] font-medium text-[#64748B]">{label}</span>
      </div>
      <span className="text-[10px] font-bold text-[#111111] bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#0F172A05]">
        {value}
      </span>
    </div>
  );
}

export function StartNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <NodeHeader icon={Play} color="bg-emerald-500" label={data.label || 'Schedule trigger'} />
      <div className="py-1">
        <NodeRow label="Cadence" value="Every 5 min" icon={Clock} />
        <NodeRow label="Last run" value="Jul 8, 2025 - 14:10" />
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-emerald-500 hover:!bg-emerald-500 !-right-2 shadow-md transition-all cursor-crosshair" 
      />
    </div>
  );
}

export function ActionNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-left-2 shadow-md transition-all cursor-crosshair" 
      />
      <NodeHeader icon={Zap} color="bg-blue-500" label={data.label || 'HTTP API Request'} />
      <div className="py-1">
        <NodeRow label="Method" value="GET /v1/orders" icon={Terminal} />
        <NodeRow label="Duration" value="0.2s" icon={Clock} />
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-right-2 shadow-md transition-all cursor-crosshair" 
      />
    </div>
  );
}

export function ConditionNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-amber-500 hover:!bg-amber-500 !-left-2 shadow-md transition-all cursor-crosshair" 
      />
      <NodeHeader icon={Split} color="bg-amber-500" label={data.label || 'Conditional'} />
      <div className="py-1">
        <NodeRow label="Condition" value="order_total > 100" />
        <NodeRow label="True (Premium)" value="23" />
        <NodeRow label="False (Standard)" value="14" />
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        id="true" 
        style={{ top: '35%' }}
        className="w-4 h-4 !bg-white !border-2 !border-emerald-500 hover:!bg-emerald-500 !-right-2 shadow-md transition-all cursor-crosshair" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        id="false" 
        style={{ top: '65%' }}
        className="w-4 h-4 !bg-white !border-2 !border-rose-500 hover:!bg-rose-500 !-right-2 shadow-md transition-all cursor-crosshair" 
      />
    </div>
  );
}

export function EndNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-rose-500 hover:!bg-rose-500 !-left-2 shadow-md transition-all cursor-crosshair" 
      />
      <NodeHeader icon={StopCircle} color="bg-rose-500" label={data.label || 'Finish'} />
      <div className="p-4 text-center">
        <span className="text-[10px] font-bold text-[#64748B]">Fluxo Finalizado</span>
      </div>
    </div>
  );
}
