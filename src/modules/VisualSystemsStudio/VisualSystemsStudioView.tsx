import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Node, 
  Edge, 
  Connection, 
  addEdge, 
  useNodesState, 
  useEdgesState, 
  ReactFlowInstance,
  ReactFlowProvider
} from 'reactflow';
import { 
  ChevronLeft, Save, Play, Loader2, ArrowLeft, 
  Download, FileImage, FileDown, Layers, Database, 
  Globe, Layout, Workflow, Sparkles, Box, GitBranch, 
  ShoppingBag, History, Cpu, Terminal, Plus, Search,
  X, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';
import { 
  Flow, NodeData, NodeType, SystemType, VisualProject,
  FlowVersion, RegistryNode, Plugin, NodeSource,
  DatabaseAST, TableDefinition, RelationDefinition
} from './types';
import { validateDatabaseSchema } from './lib/validator';
import { compileToSQL, compileToPrisma, compileToLaravel } from './lib/compilers';
import { PLUGIN_MARKETPLACE, CORE_NODES } from './registry';
import NodeSidebar from './components/NodeSidebar';
import NodeInspector from './components/NodeInspector';
import FlowCanvas from './components/Canvas';
import FlowList from './components/ProjectList';

export default function VisualSystemsStudioView() {
  const { activeWorkspace, fetchWithAuth } = useAuth();
  const [projects, setProjects] = useState<VisualProject[]>([]);
  const [currentProject, setCurrentProject] = useState<VisualProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Multi-tenant & Node Extension state
  const [installedPlugins, setInstalledPlugins] = useState<string[]>([]);
  const [customNodes, setCustomNodes] = useState<any[]>([]);
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'flow' | 'versions' | 'marketplace'>('flow');
  
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, [activeWorkspace]);

  const fetchProjects = async () => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    try {
      const res = await fetchWithAuth('/api/flow-builder');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save logic
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveProject = useCallback(async (projectToSave: VisualProject) => {
    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`/api/flow-builder/${projectToSave.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectToSave.name,
          type: projectToSave.type,
          flowJson: projectToSave.flowJson
        })
      });
      if (res.ok) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const triggerAutoSave = useCallback(() => {
    if (!currentProject) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const updatedProject = {
        ...currentProject,
        flowJson: {
          nodes,
          edges,
          viewport: reactFlowInstance.current?.getViewport() || { x: 0, y: 0, zoom: 1 }
        }
      };
      saveProject(updatedProject);
    }, 2000); 
  }, [currentProject, nodes, edges, saveProject]);

  useEffect(() => {
    if (currentProject) {
      triggerAutoSave();
    }
  }, [nodes, edges, triggerAutoSave]);

  const handleCreateProject = async (type: SystemType = 'flow') => {
    const typeNames: Record<SystemType, string> = {
      flow: 'Fluxo',
      database: 'Banco de Dados',
      infographic: 'Infográfico',
      api: 'API Simulator'
    };
    const name = `Novo ${typeNames[type]} ${projects.length + 1}`;
    try {
      const res = await fetchWithAuth('/api/flow-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects([newProject, ...projects]);
        handleSelectProject(newProject);
      }
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleSelectProject = (project: VisualProject) => {
    setCurrentProject(project);
    setNodes(project.flowJson.nodes || []);
    setEdges(project.flowJson.edges || []);
    setSelectedNode(null);
  };

  const handleCommitVersion = async () => {
    if (!currentProject || !commitMessage.trim()) return;
    
    const newVersion = {
      id: Math.random().toString(36).substr(2, 9),
      version: (currentProject.versions?.length || 0) + 1,
      createdAt: new Date(),
      snapshot: { nodes, edges },
      message: commitMessage
    };

    const updatedProject = {
      ...currentProject,
      currentVersion: newVersion.version,
      versions: [...(currentProject.versions || []), newVersion]
    };

    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`/api/flow-builder/${currentProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });
      if (res.ok) {
        setCurrentProject(updatedProject);
        setIsCommitModalOpen(false);
        setCommitMessage('');
      }
    } catch (error) {
      console.error('Error committing version:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRollback = (version: any) => {
    if (!confirm(`Confirmar rollback para versão ${version.version}?`)) return;
    setNodes(version.snapshot.nodes);
    setEdges(version.snapshot.edges);
    setActiveTab('flow');
  };

  const handleInstallPlugin = (pluginId: string) => {
    setInstalledPlugins(prev => [...prev, pluginId]);
  };

  const handleUninstallPlugin = (pluginId: string) => {
    setInstalledPlugins(prev => prev.filter(id => id !== pluginId));
  };

  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingAiNode, setIsGeneratingAiNode] = useState(false);

  const generateDatabaseAST = (): DatabaseAST => {
    const tables: TableDefinition[] = nodes
      .filter(n => n.type === 'table')
      .map(n => ({
        id: n.id,
        name: n.data.label || 'untitled_table',
        columns: n.data.columns || []
      }));

    const relations: RelationDefinition[] = [];

    // Direct edges between tables (1:1, 1:N)
    edges.forEach(e => {
      const sourceNode = nodes.find(n => n.id === e.source);
      const targetNode = nodes.find(n => n.id === e.target);
      
      if (sourceNode?.type === 'table' && targetNode?.type === 'table') {
        relations.push({
          id: e.id,
          fromTable: sourceNode.data.label || '',
          fromColumn: e.sourceHandle || 'id',
          toTable: targetNode.data.label || '',
          toColumn: e.targetHandle || 'id',
          type: (e.data?.relationType as any) || 'one_to_many'
        });
      }
    });

    // Relation nodes for complex relations (N:N)
    nodes.filter(n => n.type === 'relation').forEach(relNode => {
      const incoming = edges.filter(e => e.target === relNode.id);
      const outgoing = edges.filter(e => e.source === relNode.id);

      if (incoming.length > 0 && outgoing.length > 0) {
        incoming.forEach(inEdge => {
          outgoing.forEach(outEdge => {
            const sourceNode = nodes.find(n => n.id === inEdge.source);
            const targetNode = nodes.find(n => n.id === outEdge.target);
            
            if (sourceNode?.type === 'table' && targetNode?.type === 'table') {
              relations.push({
                id: `${relNode.id}_${inEdge.id}_${outEdge.id}`,
                fromTable: sourceNode.data.label || '',
                fromColumn: inEdge.sourceHandle || 'id',
                toTable: targetNode.data.label || '',
                toColumn: outEdge.targetHandle || 'id',
                type: relNode.data.relationType || 'many_to_many'
              });
            }
          });
        });
      }
    });

    return { tables, relations };
  };

  const handleExportDatabase = (format: 'sql' | 'prisma' | 'laravel' | 'json') => {
    const ast = generateDatabaseAST();
    const validation = validateDatabaseSchema(ast);

    if (!validation.isValid) {
      alert(`Erro de Validação:\n${validation.errors.map(e => `• ${e.message}`).join('\n')}`);
      return;
    }

    let content = '';
    let filename = `schema_${currentProject?.id}`;

    switch (format) {
      case 'sql':
        content = compileToSQL(ast);
        filename += '.sql';
        break;
      case 'prisma':
        content = compileToPrisma(ast);
        filename += '.prisma';
        break;
      case 'laravel':
        content = compileToLaravel(ast);
        filename += '.php';
        break;
      case 'json':
        content = JSON.stringify(ast, null, 2);
        filename += '.json';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateAiNode = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingAiNode(true);
    try {
      const res = await fetchWithAuth('/api/flow-builder/generate-node', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: aiPrompt,
          context: `Mode: ${currentProject?.type}`
        })
      });
      if (res.ok) {
        const { node } = await res.json();
        const newNode: RegistryNode = {
          ...node,
          icon: Box, // Default icon for AI nodes
          source: 'ai_generated'
        };
        setCustomNodes(prev => [...prev, newNode]);
        setAiPrompt('');
        alert('Node gerado com sucesso! Arraste-o da sidebar.');
      }
    } catch (error) {
      console.error('Error generating AI node:', error);
    } finally {
      setIsGeneratingAiNode(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    console.log('Attempting to delete project:', id);
    try {
      const res = await fetchWithAuth(`/api/flow-builder/${id}`, { method: 'DELETE' });
      if (res.ok) {
        console.log('Project deleted successfully:', id);
        setProjects(prev => prev.filter(p => p.id !== id));
      } else {
        const err = await res.json();
        console.error('Delete failed:', err);
        alert('Erro ao excluir projeto: ' + (err.error || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Erro de conexão ao excluir projeto');
    }
  };

  // Export functionality
  const exportAsImage = async (format: 'png' | 'pdf') => {
    const canvasElement = document.querySelector('.react-flow__renderer') as HTMLElement;
    if (!canvasElement) return;

    setIsExporting(true);
    try {
      const canvas = await toCanvas(canvasElement, {
        backgroundColor: '#FAFAFA',
        pixelRatio: 2,
      });

      if (format === 'png') {
        const image = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = image;
        link.download = `${currentProject?.name || 'project'}.png`;
        link.click();
      } else {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${currentProject?.name || 'project'}.pdf`);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const onConnect = useCallback((params: Connection) => {
    const edgeData = currentProject?.type === 'database' ? { relationType: 'one_to_many' } : {};
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      animated: true,
      style: { stroke: '#111111', strokeWidth: 2 },
      data: edgeData
    }, eds));
  }, [setEdges, currentProject]);

  const onInit = (instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const rawData = event.dataTransfer.getData('application/reactflow');
      if (!rawData || !reactFlowInstance.current) return;

      let type: string;
      let label: string;

      try {
        const parsed = JSON.parse(rawData);
        type = parsed.type;
        label = parsed.label;
      } catch (e) {
        // Fallback for old simple string data
        type = rawData as NodeType;
        label = type.charAt(0).toUpperCase() + type.slice(1);
      }

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeDef = CORE_NODES.flatMap(c => c.nodes).find(n => n.type === type);
      const initialConfig: Record<string, any> = {};
      nodeDef?.properties?.forEach(p => {
        if (p.defaultValue !== undefined) initialConfig[p.id] = p.defaultValue;
      });

      // Special handling for tables
      if (type === 'table') {
        initialConfig.columns = [
          { name: 'id', type: 'uuid' },
          { name: 'name', type: 'varchar' }
        ];
      }

      const newNode: Node<NodeData> = {
        id: `node_${Date.now()}`,
        type,
        position,
        data: { 
          label,
          type,
          config: initialConfig,
          errors: {}
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const onNodeUpdate = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
    
    setSelectedNode((prev) => {
      if (prev?.id === id) {
        return { ...prev, data: { ...prev.data, ...data } };
      }
      return prev;
    });
  }, [setNodes]);

  const onNodeDelete = (id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNode(null);
  };

  const onEdgeUpdate = useCallback((id: string, data: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return { ...edge, data: { ...edge.data, ...data } };
        }
        return edge;
      })
    );
    
    setSelectedEdge((prev) => {
      if (prev?.id === id) {
        return { ...prev, data: { ...prev.data, ...data } };
      }
      return prev;
    });
  }, [setEdges]);

  const onEdgeDelete = (id: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
    setSelectedEdge(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-10 h-10 text-[#111111]/20 animate-spin" />
      </div>
    );
  }

  if (!currentProject) {
    return (
      <FlowList 
        flows={projects} 
        onCreateFlow={(type) => handleCreateProject(type)} 
        onSelectFlow={handleSelectProject} 
        onDeleteFlow={handleDeleteProject}
      />
    );
  }

  const modeIcons: Record<SystemType, any> = {
    flow: Workflow,
    database: Database,
    infographic: Layout,
    api: Globe
  };
  const ModeIcon = modeIcons[currentProject.type] || Workflow;

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA] relative">
      <header className="h-16 lg:h-20 border-b border-[#0F172A08] bg-white/80 backdrop-blur-2xl flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setCurrentProject(null)}
            className="p-2.5 rounded-xl text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] border border-transparent hover:border-[#0F172A0F] transition-all group"
            title="Voltar para a lista"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          
          <div className="h-6 w-px bg-[#0F172A0F]" />
          
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600`}>
              <ModeIcon size={18} />
            </div>
            <div className="flex flex-col">
              <input 
                type="text" 
                value={currentProject.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  setCurrentProject({ ...currentProject, name: newName });
                  triggerAutoSave();
                }}
                className="bg-transparent border-none outline-none text-[#111111] font-bold text-sm focus:text-blue-600 transition-colors"
              />
              <div className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest">
                  {isSaving ? 'Salvando...' : lastSaved ? `Salvo às ${lastSaved.toLocaleTimeString()}` : 'Alterações não salvas'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-1 shadow-sm mr-2">
            <button 
              onClick={() => setActiveTab('flow')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'flow' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              <Workflow size={14} />
              Flow
            </button>
            <button 
              onClick={() => setActiveTab('versions')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'versions' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              <History size={14} />
              Histórico
            </button>
            <button 
              onClick={() => setActiveTab('marketplace')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'marketplace' ? 'bg-white text-[#111111] shadow-sm' : 'text-[#64748B] hover:text-[#111111]'}`}
            >
              <ShoppingBag size={14} />
              Plugins
            </button>
          </div>

          <div className="flex items-center bg-white border border-[#0F172A0F] rounded-xl p-1 shadow-sm">
            {currentProject.type === 'database' ? (
              <>
                <button 
                  onClick={() => handleExportDatabase('sql')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all"
                  title="Export SQL"
                >
                  <Database size={14} className="text-blue-500" />
                  SQL
                </button>
                <button 
                  onClick={() => handleExportDatabase('prisma')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all"
                  title="Export Prisma"
                >
                  <Terminal size={14} className="text-emerald-500" />
                  Prisma
                </button>
                <button 
                  onClick={() => handleExportDatabase('laravel')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] transition-all"
                  title="Export Laravel Migrations"
                >
                  <Layers size={14} className="text-orange-500" />
                  Laravel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => exportAsImage('png')}
                  disabled={isExporting}
                  className="p-2 text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-all"
                  title="Exportar como PNG"
                >
                  <FileImage size={18} />
                </button>
                <button 
                  onClick={() => exportAsImage('pdf')}
                  disabled={isExporting}
                  className="p-2 text-[#64748B] hover:text-[#111111] hover:bg-[#FAFAFA] rounded-lg transition-all"
                  title="Exportar como PDF"
                >
                  <FileDown size={18} />
                </button>
              </>
            )}
          </div>

          <div className="h-6 w-px bg-[#0F172A0F]" />

          <button 
            onClick={() => setIsCommitModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#0F172A0F] text-[#64748B] font-bold text-[11px] uppercase tracking-widest hover:bg-[#FAFAFA] hover:text-[#111111] transition-all shadow-sm"
          >
            <GitBranch size={14} className="text-emerald-500" />
            Commit
          </button>
          
          <button 
            onClick={() => saveProject(currentProject)}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111111] text-white font-bold text-[11px] uppercase tracking-widest hover:bg-[#111111]/90 transition-all disabled:opacity-50 shadow-lg shadow-black/5"
          >
            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Push Changes
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'flow' && (
          <>
            <NodeSidebar 
              mode={currentProject.type} 
              installedPlugins={installedPlugins}
              customNodes={customNodes}
            />
            
            <ReactFlowProvider>
              <div className="flex-1 relative bg-[#FAFAFA]" onDrop={onDrop}>
                <FlowCanvas 
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onInit={onInit}
                  onNodeClick={(_, node) => {
                    setSelectedNode(node as Node<NodeData>);
                    setSelectedEdge(null);
                  }}
                  onEdgeClick={(_, edge) => {
                    setSelectedEdge(edge);
                    setSelectedNode(null);
                  }}
                  onPaneClick={() => {
                    setSelectedNode(null);
                    setSelectedEdge(null);
                  }}
                />
                
                {/* AI Architect Panel */}
                <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:w-96 z-10">
                  <div className="bg-white/80 backdrop-blur-2xl border border-[#0F172A0F] rounded-2xl shadow-2xl p-5 overflow-hidden group">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles size={16} className="text-blue-500" />
                      <h4 className="text-[#111111] font-bold text-xs uppercase tracking-widest">AI Node Generator</h4>
                    </div>
                    <div className="relative">
                      <textarea 
                        placeholder="Ex: Criar um node para integração com Slack..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl p-3 text-xs font-medium text-[#111111] outline-none focus:border-blue-500/20 focus:bg-white transition-all min-h-[80px] resize-none"
                      />
                      <button 
                        onClick={handleGenerateAiNode}
                        disabled={isGeneratingAiNode || !aiPrompt.trim()}
                        className="absolute bottom-3 right-3 p-2 bg-[#111111] text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                      >
                        {isGeneratingAiNode ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {(selectedNode || selectedEdge) && (
                  <div className="absolute top-0 right-0 h-full z-20">
                    <NodeInspector 
                      selectedNode={selectedNode}
                      selectedEdge={selectedEdge}
                      onUpdateNode={onNodeUpdate}
                      onUpdateEdge={onEdgeUpdate}
                      onDeleteNode={onNodeDelete}
                      onDeleteEdge={onEdgeDelete}
                      onClose={() => {
                        setSelectedNode(null);
                        setSelectedEdge(null);
                      }}
                    />
                  </div>
                )}
              </div>
            </ReactFlowProvider>
          </>
        )}

        {activeTab === 'versions' && (
          <div className="flex-1 bg-[#FAFAFA] p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-[#111111] tracking-tight">Histórico de Versões</h2>
                  <p className="text-[#64748B] font-medium text-sm">Gerencie o versionamento estilo Git do seu sistema.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-[#0F172A0F] rounded-xl text-[#64748B] text-xs font-bold uppercase tracking-widest">
                  <GitBranch size={14} className="text-blue-500" />
                  Branch: Main
                </div>
              </div>

              <div className="space-y-4">
                {(currentProject.versions || []).slice().reverse().map((v: any) => (
                  <div key={v.id} className="bg-white border border-[#0F172A0F] rounded-2xl p-6 flex items-center justify-between group hover:border-blue-500/20 transition-all shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] flex items-center justify-center text-[#111111] font-black text-xs border border-[#0F172A08]">
                        v{v.version}
                      </div>
                      <div>
                        <h4 className="text-[#111111] font-bold text-sm mb-0.5">{v.message}</h4>
                        <div className="flex items-center gap-3 text-[#64748B] text-[11px] font-medium">
                          <span>{new Date(v.createdAt).toLocaleString()}</span>
                          <span className="w-1 h-1 rounded-full bg-[#0F172A0F]" />
                          <span>{v.snapshot.nodes.length} nodes</span>
                          <span className="w-1 h-1 rounded-full bg-[#0F172A0F]" />
                          <span className="text-blue-600 font-bold">Stable</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRollback(v)}
                      className="px-4 py-2 rounded-xl border border-[#0F172A0F] text-[#64748B] text-[10px] font-black uppercase tracking-widest hover:bg-[#111111] hover:text-white hover:border-[#111111] transition-all"
                    >
                      Rollback
                    </button>
                  </div>
                ))}

                {(!currentProject.versions || currentProject.versions.length === 0) && (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-3xl bg-white border border-[#0F172A0F] flex items-center justify-center text-[#64748B]/20 mb-6 shadow-sm">
                      <History size={32} />
                    </div>
                    <h3 className="text-[#111111] font-bold text-lg mb-1">Sem versões registradas</h3>
                    <p className="text-[#64748B] text-sm max-w-xs mx-auto font-medium">
                      Faça seu primeiro "Commit" para começar a versionar seu projeto.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <div className="flex-1 bg-[#FAFAFA] p-8 lg:p-12 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-[#111111] tracking-tight">Plugin Marketplace</h2>
                <p className="text-[#64748B] font-medium text-sm">Estenda as capacidades do seu sistema com plugins oficiais e da comunidade.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {PLUGIN_MARKETPLACE.map((plugin) => (
                  <div key={plugin.id} className="bg-white border border-[#0F172A0F] rounded-3xl p-6 flex flex-col shadow-sm hover:shadow-xl hover:border-blue-500/10 transition-all group overflow-hidden relative">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <div className="p-3 rounded-2xl bg-blue-500/5 text-blue-500 border border-blue-500/10">
                        <Box size={24} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest">v{plugin.version}</span>
                        <div className="flex items-center gap-1 text-[#64748B]/50 text-[10px]">
                          <Download size={10} />
                          {plugin.installCount}
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-[#111111] font-bold text-base mb-1 group-hover:text-blue-600 transition-colors">{plugin.name}</h3>
                      <p className="text-[#64748B] text-xs font-medium leading-relaxed mb-6 line-clamp-2">
                        {plugin.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#0F172A08]">
                        <span className="text-[10px] font-bold text-[#64748B]/40 uppercase">Por {plugin.author}</span>
                        {installedPlugins.includes(plugin.id) ? (
                          <button 
                            onClick={() => handleUninstallPlugin(plugin.id)}
                            className="px-4 py-2 rounded-xl bg-rose-500/5 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-500/10 hover:bg-rose-500 hover:text-white transition-all"
                          >
                            Remover
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleInstallPlugin(plugin.id)}
                            className="px-4 py-2 rounded-xl bg-[#111111] text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-black/5"
                          >
                            Instalar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Commit Modal */}
      {isCommitModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#111111]/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#0F172A0F] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <GitBranch size={20} />
                  </div>
                  <div>
                    <h3 className="text-[#111111] font-bold text-lg tracking-tight">Commit Version</h3>
                    <p className="text-[#64748B] text-xs font-medium">Snapshot atual do seu projeto.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCommitModalOpen(false)}
                  className="p-2 text-[#64748B] hover:text-[#111111] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-[#64748B] uppercase tracking-widest mb-2 block">Mensagem do Commit</label>
                  <textarea 
                    autoFocus
                    placeholder="Ex: Adicionada lógica de retry..."
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                    className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-2xl p-4 text-xs font-medium text-[#111111] outline-none focus:border-blue-500/20 focus:bg-white transition-all min-h-[120px] resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 flex gap-3">
              <button 
                onClick={() => setIsCommitModalOpen(false)}
                className="flex-1 px-6 py-3.5 rounded-2xl bg-[#FAFAFA] text-[#64748B] font-bold text-xs uppercase tracking-widest hover:bg-[#0F172A08] transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCommitVersion}
                disabled={!commitMessage.trim()}
                className="flex-2 px-8 py-3.5 rounded-2xl bg-[#111111] text-white font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50"
              >
                Confirm Push
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
