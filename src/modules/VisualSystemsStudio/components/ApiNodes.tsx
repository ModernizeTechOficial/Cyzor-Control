import { Handle, Position, NodeProps } from 'reactflow';
import { Globe, ArrowRight, Code, ShieldCheck, Clock, MoreHorizontal, Terminal } from 'lucide-react';
import { NodeData } from '../types';

const nodeStyles = "bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-w-[240px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

function NodeHeader({ icon: Icon, color, label, badge }: { icon: any, color: string, label: string, badge?: string }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] rounded-t-[24px]">
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center shadow-sm`}>
          <Icon size={14} className="text-white" />
        </div>
        <span className="text-[11px] font-bold text-[#111111] tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="text-[9px] font-black bg-[#FAFAFA] text-[#64748B] px-1.5 py-0.5 rounded border border-[#0F172A05]">
            {badge}
          </span>
        )}
        <button className="text-[#64748B]/30 hover:text-[#111111] transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
    </div>
  );
}

function NodeRow({ label, value, icon: Icon, valueColor }: { label: string, value: string, icon?: any, valueColor?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-2 hover:bg-[#FAFAFA] transition-colors first:pt-3 last:pb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-[#64748B]/40" />}
        <span className="text-[10px] font-medium text-[#64748B]">{label}</span>
      </div>
      <span className={`text-[10px] font-bold bg-[#FAFAFA] px-2 py-0.5 rounded-md border border-[#0F172A05] ${valueColor || 'text-[#111111]'}`}>
        {value}
      </span>
    </div>
  );
}

export function ApiEndpointNode({ data }: NodeProps<NodeData>) {
  const config = data.config || {};
  const method = config.method || data.method || 'GET';
  const path = config.path || data.url || '/api/v1/resource';

  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-purple-500 hover:!bg-purple-500 !-left-2 shadow-md transition-all cursor-crosshair" 
      />
      <NodeHeader icon={Globe} color="bg-purple-600" label={data.label || 'API Endpoint'} badge={method} />
      
      <div className="py-1">
        <NodeRow label="Endpoint" value={path} icon={Terminal} />
        <NodeRow label="Status" value={`${data.statusCode || 200} OK`} valueColor="text-emerald-600" />
        <NodeRow label="Latency" value="45ms" icon={Clock} />
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-purple-500 hover:!bg-purple-500 !-right-2 shadow-md transition-all cursor-crosshair" 
      />
    </div>
  );
}
