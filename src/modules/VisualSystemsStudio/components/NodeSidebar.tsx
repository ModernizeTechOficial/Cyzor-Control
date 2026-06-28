import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ChevronDown, Sparkles, Box, Cpu, Zap, Code } from 'lucide-react';
import { getTenantRegistry } from '../registry';
import { SystemType, RegistryNode } from '../types';

interface NodeSidebarProps {
  mode: SystemType;
  installedPlugins: string[];
  customNodes: any[];
}

const NodeSidebar: React.FC<NodeSidebarProps> = ({ mode, installedPlugins, customNodes }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'api': true,
    'database': true,
    'flow': true,
    'infographic': true
  });

  const registry = useMemo(() => 
    getTenantRegistry(installedPlugins, customNodes, mode), 
  [installedPlugins, customNodes, mode]);

  const onDragStart = (event: React.DragEvent, nodeType: string, label: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ type: nodeType, label }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRegistry = registry.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(node => 
      node.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.nodes.length > 0);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'core': return <Cpu size={10} />;
      case 'plugin': return <Box size={10} />;
      case 'ai_generated': return <Sparkles size={10} />;
      default: return <Code size={10} />;
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-[#0F172A08] flex flex-col h-full overflow-hidden">
      <div className="p-6 border-b border-[#0F172A08]">
        <h3 className="text-[#111111] font-bold text-lg mb-1 tracking-tight">Node Registry</h3>
        <p className="text-[#64748B] text-xs font-medium mb-6">Arraste componentes para o canvas</p>
        
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]/40 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="Pesquisar nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl text-xs font-medium text-[#111111] outline-none focus:border-blue-500/20 focus:bg-white transition-all placeholder:text-[#64748B]/30 shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {filteredRegistry.map((category) => (
          <div key={category.id} className="space-y-1">
            <button 
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#FAFAFA] transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <div className="text-[#64748B]/30 group-hover:text-blue-500 transition-colors">
                  {expandedCategories[category.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#64748B] group-hover:text-[#111111] transition-colors">
                  {category.label}
                </span>
              </div>
              <span className="text-[9px] font-bold text-[#64748B]/30 px-1.5 py-0.5 bg-[#FAFAFA] rounded-md border border-[#0F172A08]">
                {category.nodes.length}
              </span>
            </button>

            {expandedCategories[category.id] && (
              <div className="grid grid-cols-1 gap-1 pl-1">
                {category.nodes.map((node) => (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, node.type, node.label)}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border border-transparent bg-transparent hover:bg-white hover:border-[#0F172A0F] hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group select-none"
                  >
                    <div className={`p-2.5 rounded-xl ${node.color} group-hover:scale-110 transition-transform shadow-sm`}>
                      <node.icon size={16} />
                    </div>
                    <div className="flex flex-col overflow-hidden flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[#111111] font-bold text-[13px] tracking-tight group-hover:text-blue-600 transition-colors truncate">{node.label}</span>
                        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-[#FAFAFA] border border-[#0F172A08] text-[#64748B] text-[8px] font-black uppercase tracking-widest">
                          {getSourceIcon(node.source)}
                          <span>{node.source.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <span className="text-[#64748B]/60 text-[10px] font-medium leading-tight line-clamp-1">{node.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredRegistry.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#0F172A08] flex items-center justify-center text-[#64748B]/20 mb-4">
              <Search size={24} />
            </div>
            <p className="text-[#111111] font-bold text-sm mb-1">Nenhum node encontrado</p>
            <p className="text-[#64748B] text-[11px] font-medium">Tente buscar por termos mais genéricos ou verifique a categoria.</p>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[#0F172A08] bg-[#FAFAFA]/50">
        <div className="p-4 rounded-2xl bg-white border border-[#0F172A0F] shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} className="text-blue-500" />
              <p className="text-[10px] font-black text-[#111111] uppercase tracking-widest">Custom Nodes</p>
            </div>
            <p className="text-[#64748B] text-[11px] leading-relaxed font-medium">
              Crie componentes personalizados para sua arquitetura através da nossa CLI.
            </p>
          </div>
          <div className="absolute top-0 right-0 p-8 bg-blue-500/5 blur-3xl rounded-full -mr-4 -mt-4" />
        </div>
      </div>
    </aside>
  );
};

export default NodeSidebar;
