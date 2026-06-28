import { Handle, Position, NodeProps } from 'reactflow';
import { Database, Table as TableIcon, Hash, Link as LinkIcon, MoreHorizontal, Eye, FileCode, ShieldAlert } from 'lucide-react';
import { NodeData, ColumnDefinition } from '../types';

const nodeStyles = "bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] min-w-[240px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]";

export function TableNode({ data, id }: NodeProps<NodeData>) {
  const columns: ColumnDefinition[] = data.config?.columns || data.columns || [];

  return (
    <div className={nodeStyles}>
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] bg-[#111111] rounded-t-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#111111] flex items-center justify-center shadow-sm border border-white/10">
            <Database size={14} className="text-blue-500" />
          </div>
          <span className="text-[11px] font-bold text-white tracking-tight">{data.config?.table_name || data.label || 'untitled_table'}</span>
        </div>
        <button className="text-white/30 hover:text-white transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <div className="py-2">
        {columns.map((col, index) => (
          <div key={col.id || col.name || index} className="relative px-4 py-2 hover:bg-blue-50/30 transition-colors group">
            <Handle 
              type="target" 
              position={Position.Left} 
              id={col.name}
              className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
            />
            
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 overflow-hidden">
                {col.isPrimary ? (
                  <Hash size={10} className="text-amber-500 shrink-0" />
                ) : (
                  <div className="w-2.5 shrink-0" />
                )}
                <span className={`font-bold text-[11px] truncate ${col.isPrimary ? 'text-amber-700' : 'text-[#111111]'}`}>
                  {col.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[9px] font-black bg-[#FAFAFA] text-[#64748B]/40 px-1.5 py-0.5 rounded border border-[#0F172A05] uppercase tracking-widest">
                  {col.type}
                </span>
                {!col.isNullable && (
                  <span className="text-rose-500 text-[10px] font-bold" title="Not Null">*</span>
                )}
              </div>
            </div>

            <Handle 
              type="source" 
              position={Position.Right} 
              id={col.name}
              className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-right-2 shadow-sm transition-all cursor-crosshair z-10" 
            />
          </div>
        ))}
        
        {columns.length === 0 && (
          <div className="px-4 py-6 text-[10px] text-[#64748B]/30 italic text-center font-medium">
            No columns defined
          </div>
        )}
      </div>
    </div>
  );
}

export function RelationNode({ data }: NodeProps<NodeData>) {
  return (
    <div className="relative group">
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
      <div className="px-4 py-2 bg-white border border-[#0F172A08] rounded-full text-[#111111] font-bold text-[10px] uppercase tracking-widest shadow-sm flex items-center gap-2 transition-all hover:shadow-md">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
          <LinkIcon size={10} className="text-white" />
        </div>
        {data.config?.rel_type || data.relationType || 'Relation'}
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-blue-500 hover:!bg-blue-500 !-right-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
    </div>
  );
}

export function IndexNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-amber-500 hover:!bg-amber-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] bg-amber-50 rounded-t-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shadow-sm">
            <Hash size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-amber-900 tracking-tight">{data.label || 'index_name'}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] text-[#64748B] font-medium leading-relaxed">
          Otimiza buscas em colunas específicas.
        </div>
      </div>
    </div>
  );
}

export function ViewNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-purple-500 hover:!bg-purple-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] bg-purple-50 rounded-t-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm">
            <Eye size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-purple-900 tracking-tight">{data.label || 'view_name'}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] text-[#64748B] font-medium leading-relaxed">
          Tabela virtual baseada no resultado de uma consulta.
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-purple-500 hover:!bg-purple-500 !-right-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
    </div>
  );
}

export function ProcedureNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-rose-500 hover:!bg-rose-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] bg-rose-50 rounded-t-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shadow-sm">
            <FileCode size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-rose-900 tracking-tight">{data.label || 'procedure_name'}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] text-[#64748B] font-medium leading-relaxed">
          Conjunto de comandos SQL salvos no banco.
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-rose-500 hover:!bg-rose-500 !-right-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
    </div>
  );
}

export function TriggerNode({ data }: NodeProps<NodeData>) {
  return (
    <div className={nodeStyles}>
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-4 h-4 !bg-white !border-2 !border-cyan-500 hover:!bg-cyan-500 !-left-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#0F172A05] bg-cyan-50 rounded-t-[24px]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-500 flex items-center justify-center shadow-sm">
            <ShieldAlert size={14} className="text-white" />
          </div>
          <span className="text-[11px] font-bold text-cyan-900 tracking-tight">{data.label || 'trigger_name'}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="text-[10px] text-[#64748B] font-medium leading-relaxed">
          Executa uma ação automaticamente após um evento.
        </div>
      </div>
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-4 h-4 !bg-white !border-2 !border-cyan-500 hover:!bg-cyan-500 !-right-2 shadow-sm transition-all cursor-crosshair z-10" 
      />
    </div>
  );
}
