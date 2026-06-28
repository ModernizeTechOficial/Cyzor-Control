import { useState, useEffect, useMemo } from 'react';
import { Node, Edge } from 'reactflow';
import { NodeData, RegistryNode, PropertyDefinition } from '../types';
import { Settings2, Trash2, X, Link as LinkIcon, Search, ChevronRight, ChevronDown, Info } from 'lucide-react';
import { CORE_NODES } from '../registry';
import PropertyField from './PropertyEngine/PropertyField';

interface NodeInspectorProps {
  selectedNode: Node<NodeData> | null;
  selectedEdge: Edge | null;
  onUpdateNode: (id: string, data: Partial<NodeData>) => void;
  onUpdateEdge: (id: string, data: any) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
  onClose: () => void;
}

export default function NodeInspector({ 
  selectedNode, 
  selectedEdge,
  onUpdateNode, 
  onUpdateEdge,
  onDeleteNode, 
  onDeleteEdge,
  onClose 
}: NodeInspectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const nodeDefinition = useMemo(() => {
    if (!selectedNode) return null;
    const def = CORE_NODES.flatMap(c => c.nodes).find(n => n.type === selectedNode.type);
    if (!def) {
      // Fallback definition for unknown nodes
      return {
        type: selectedNode.type,
        label: selectedNode.data.label || selectedNode.type,
        icon: Settings2,
        description: 'Configurações básicas',
        category: 'flow',
        color: 'text-[#64748B] bg-[#FAFAFA]',
        source: 'core',
        properties: [
          { id: 'label', label: 'Rótulo (Label)', type: 'string', group: 'Geral' }
        ]
      } as RegistryNode;
    }
    
    // Ensure 'label' is always present in Geral group if not defined
    const hasLabel = def.properties.some(p => p.id === 'label');
    if (!hasLabel) {
      return {
        ...def,
        properties: [
          { id: 'label', label: 'Rótulo (Label)', type: 'string' as const, group: 'Geral' },
          ...def.properties
        ]
      };
    }
    return def;
  }, [selectedNode]);

  const properties = nodeDefinition?.properties || [];
  
  const groupedProperties = useMemo(() => {
    const groups: Record<string, PropertyDefinition[]> = { 'Geral': [] };
    
    properties.forEach(p => {
      const groupName = p.group || 'Geral';
      if (!groups[groupName]) groups[groupName] = [];
      
      if (
        p.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        groups[groupName].push(p);
      }
    });

    // Remove empty groups
    return Object.fromEntries(Object.entries(groups).filter(([_, props]) => props.length > 0));
  }, [properties, searchTerm]);

  const [localConfig, setLocalConfig] = useState<Record<string, any>>(selectedNode?.data?.config || {});

  // Sync local config when selected node changes
  useEffect(() => {
    setLocalConfig(selectedNode?.data?.config || {});
  }, [selectedNode?.id]);

  useEffect(() => {
    // Expand all groups by default when a new node is selected
    if (selectedNode) {
      const initialGroups: Record<string, boolean> = {};
      Object.keys(groupedProperties).forEach(g => initialGroups[g] = true);
      setExpandedGroups(initialGroups);

      // Migrate legacy data if config is missing
      if (!selectedNode.data.config) {
        const legacyConfig: Record<string, any> = {
          label: selectedNode.data.label,
          table_name: selectedNode.data.label,
          columns: selectedNode.data.columns,
          method: selectedNode.data.method,
          path: selectedNode.data.url,
          rel_type: selectedNode.data.relationType,
          statusCode: selectedNode.data.statusCode,
          color: selectedNode.data.color,
          fontSize: selectedNode.data.fontSize
        };
        // Clean undefined
        Object.keys(legacyConfig).forEach(key => legacyConfig[key] === undefined && delete legacyConfig[key]);
        
        setLocalConfig(legacyConfig);
        onUpdateNode(selectedNode.id, { config: legacyConfig });
      }
    }
  }, [selectedNode?.id, properties.length]);

  const handlePropertyChange = (propId: string, value: any) => {
    if (!selectedNode) return;
    
    // Update local state immediately for snappy UI
    const newConfig = { ...localConfig, [propId]: value };
    setLocalConfig(newConfig);
    
    const updates: Partial<NodeData> = { config: newConfig };
    
    // Sync label if updated through property engine
    if (propId === 'label') {
      updates.label = value;
    }

    // Validation logic (simple)
    const errors: Record<string, string> = { ...(selectedNode.data.errors || {}) };
    const prop = properties.find(p => p.id === propId);
    
    if (prop?.validation?.required && !value) {
      errors[propId] = 'Campo obrigatório';
    } else {
      delete errors[propId];
    }

    onUpdateNode(selectedNode.id, { ...updates, errors });
  };

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-80 bg-[#FAFAFA] border-l border-[#0F172A08] flex flex-col items-center justify-center p-8 text-center h-full">
        <div className="w-16 h-16 rounded-3xl bg-white border border-[#0F172A0F] flex items-center justify-center text-[#111111]/10 mb-4 shadow-sm">
          <Settings2 size={32} />
        </div>
        <h4 className="text-[#111111]/60 font-bold text-sm mb-2">Nada selecionado</h4>
        <p className="text-[#64748B] text-[11px] leading-relaxed">
          Clique em um elemento no canvas para editar suas propriedades profissionais.
        </p>
      </aside>
    );
  }

  return (
    <aside className="w-96 bg-white border-l border-[#0F172A08] flex flex-col h-full animate-in slide-in-from-right duration-300 shadow-2xl">
      <div className="p-6 border-b border-[#0F172A0F] flex items-center justify-between bg-white/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl ${nodeDefinition?.color || 'bg-[#FAFAFA] text-[#111111]'} flex items-center justify-center shadow-sm`}>
            {nodeDefinition ? <nodeDefinition.icon size={16} /> : <Settings2 size={16} />}
          </div>
          <div>
            <h3 className="text-[#111111] font-bold text-sm tracking-tight">{selectedNode?.data?.label || 'Propriedades'}</h3>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">{selectedNode?.type}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all">
          <X size={18} />
        </button>
      </div>

      <div className="p-4 border-b border-[#0F172A08] bg-[#FAFAFA]/50">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]/40 group-focus-within:text-blue-500 transition-colors" size={12} />
          <input 
            type="text"
            placeholder="Filtrar propriedades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#0F172A0F] rounded-xl text-[11px] font-medium text-[#111111] outline-none focus:border-blue-500/20 transition-all placeholder:text-[#64748B]/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {selectedNode && Object.entries(groupedProperties).map(([group, props]) => (
          <section key={group} className="space-y-4">
            <button 
              onClick={() => setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }))}
              className="w-full flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em] group-hover:text-[#111111] transition-colors">{group}</span>
                <div className="h-px bg-[#0F172A08] flex-1 min-w-[20px]" />
              </div>
              {expandedGroups[group] ? <ChevronDown size={12} className="text-[#64748B]/40" /> : <ChevronRight size={12} className="text-[#64748B]/40" />}
            </button>
            
            {expandedGroups[group] && (
              <div className="space-y-5">
                {props.map(prop => (
                  <PropertyField 
                    key={prop.id}
                    property={prop}
                    value={localConfig?.[prop.id]}
                    onChange={(val) => handlePropertyChange(prop.id, val)}
                    error={selectedNode.data.errors?.[prop.id]}
                    allValues={localConfig || {}}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {selectedEdge && (
          <div className="space-y-6">
            <PropertyField 
              property={{ id: 'rel_type', label: 'Tipo de Relação', type: 'select', options: [
                { label: 'ONE TO ONE (1:1)', value: 'one_to_one' },
                { label: 'ONE TO MANY (1:N)', value: 'one_to_many' },
                { label: 'MANY TO MANY (N:N)', value: 'many_to_many' },
              ] }}
              value={selectedEdge.data?.relationType}
              onChange={(val) => onUpdateEdge(selectedEdge.id, { relationType: val })}
              allValues={selectedEdge.data || {}}
            />
          </div>
        )}
      </div>

      <div className="p-6 bg-[#FAFAFA] border-t border-[#0F172A0F] flex flex-col gap-3">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 text-blue-600 mb-2">
          <Info size={16} className="shrink-0" />
          <p className="text-[10px] font-medium leading-relaxed">
            As alterações são validadas em tempo real e impactam diretamente a exportação e simulação do sistema.
          </p>
        </div>
        <button 
          onClick={() => selectedNode ? onDeleteNode(selectedNode.id) : onDeleteEdge(selectedEdge!.id)}
          className="w-full py-4 rounded-2xl border border-rose-100 bg-white text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all font-bold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Trash2 size={16} />
          Remover {selectedNode ? 'Elemento' : 'Conexão'}
        </button>
      </div>
    </aside>
  );
}
