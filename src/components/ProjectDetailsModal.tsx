import { useEffect, useState, useRef } from 'react';
import { 
  X, GitBranch, Calendar, User, Flag, MessageSquare, Plus, Pencil, FileText, 
  LayoutGrid, Zap, Milestone, Users, FolderOpen, History, Sparkles, Layers 
} from 'lucide-react';
import { ProjectExtended } from '../types/project';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { showSuccess, showError } from '../lib/alerts';
import { Vision360 } from './common/Vision360';
import { VisualIdentityTab } from './common/VisualIdentityTab';
import { EntityHero } from './common/EntityHero';
import { AIActionDropdown } from './common/AIActionsComponent';

// Tab components
import AbaVisaoGeral from './project-tabs/AbaVisaoGeral';
import AbaKanban from './project-tabs/AbaKanban';
import AbaSprints from './project-tabs/AbaSprints';
import AbaTimeline from './project-tabs/AbaTimeline';
import AbaEquipe from './project-tabs/AbaEquipe';
import AbaMarcos from './project-tabs/AbaMarcos';
import AbaDocumentos from './project-tabs/AbaDocumentos';
import AbaComentarios from './project-tabs/AbaComentarios';
import AbaHistorico from './project-tabs/AbaHistorico';
import DocEditorModal from './DocEditorModal';
import LocalPdfViewerModal from './LocalPdfViewerModal';
import LocalImageViewerModal from './LocalImageViewerModal';
import CodeEditorProfessional from './CodeEditorProfessional';
import SpreadsheetProfessional from './SpreadsheetProfessional';
import PresentationProfessional from './PresentationProfessional';
import ImageEditorProfessional from './ImageEditorProfessional';
import PdfViewerProfessional from './PdfViewerProfessional';
import { getDocTypeConfig } from '../lib/documentRegistry';

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (p: any) => void;
}

export default function ProjectDetailsModal({ project, isOpen, onClose, onSave }: ProjectDetailsModalProps) {
  const { fetchWithAuth } = useAuth();
  const { setGlobalFilters } = useNavigation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollTop = scrollContainerRef.current.scrollTop;
      setIsCollapsed(scrollTop > 100);
      const progress = Math.min(1, Math.max(0, scrollTop / 100));
      setScrollProgress(progress);
    }
  };

  const [activeTab, setActiveTab] = useState('visao_360');

  // Reset scroll and progress when switching tabs
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
      setScrollProgress(0);
      setIsCollapsed(false);
    }
  }, [activeTab]);

  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<ProjectExtended | null>(null);
  const [prevProjectId, setPrevProjectId] = useState<number | null>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false);
  const [isSpreadsheetEditorOpen, setIsSpreadsheetEditorOpen] = useState(false);
  const [isPresentationEditorOpen, setIsPresentationEditorOpen] = useState(false);
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  // Evolution/Conversion state
  const [isConvertProductDialogOpen, setIsConvertProductDialogOpen] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    type: 'SaaS',
    pricingModel: 'Assinatura',
    status: 'Desenvolvimento'
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Initialize product data when modal opens or project changes
  useEffect(() => {
    if (isOpen && editedProject) {
      setProductData({
        name: editedProject.name || '',
        description: editedProject.description || '',
        type: 'SaaS',
        pricingModel: 'Assinatura',
        status: 'Desenvolvimento'
      });
      setIsConvertProductDialogOpen(false);
    }
  }, [isOpen, editedProject]);

  const handleGoToProduct = () => {
    if (!editedProject || !editedProject.productId) return;
    onClose();
    setTimeout(() => {
      window.history.pushState({}, '', '/workspace/products');
      window.dispatchEvent(new Event('popstate'));
      setGlobalFilters({ productId: editedProject.productId });
    }, 150);
  };

  const handleEvolveToProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedProject || !productData.name) return;
    setIsSubmittingProduct(true);

    try {
      // 1. Create Product
      const productRes = await fetchWithAuth('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productData.name,
          description: productData.description,
          companyId: editedProject.companyId || null,
          status: productData.status,
          type: productData.type,
          pricingModel: productData.pricingModel
        })
      });

      if (!productRes.ok) {
        throw new Error('Falha ao criar produto');
      }

      const newProduct = await productRes.json();

      // 2. Update current project with the new productId
      const updatedProject = {
        ...editedProject,
        productId: newProduct.id,
        status: 'Concluído'
      };

      await handleUpdateProject(updatedProject);

      showSuccess('Projeto evoluído para Produto com sucesso!');
      setIsConvertProductDialogOpen(false);

      // Offer dynamic navigation options
      setTimeout(() => {
        window.history.pushState({}, '', '/workspace/products');
        window.dispatchEvent(new Event('popstate'));
        setGlobalFilters({ productId: newProduct.id });
      }, 300);

    } catch (err: any) {
      console.error(err);
      showError(err.message || 'Erro ao evoluir projeto.');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetchWithAuth('/api/companies');
        if (res.ok) setCompanies(await res.json());
      } catch (err) {
        console.error(err);
      }
    };
    fetchCompanies();
  }, [fetchWithAuth]);

  const handleSaveCustomDoc = async (updatedDoc: any) => {
    try {
      const dbPayload = {
        title: updatedDoc.title,
        content: typeof updatedDoc.content === 'object' ? JSON.stringify(updatedDoc.content) : updatedDoc.content,
        folder: updatedDoc.folder || 'Planejamento',
        projectId: editedProject?.id || null,
        isFavorite: updatedDoc.isFavorite || false,
        url: updatedDoc.url || '',
        type: updatedDoc.type || getDocTypeConfig(updatedDoc).id
      };

      let res;
      if (updatedDoc.id) {
        res = await fetchWithAuth(`/api/documents/${updatedDoc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbPayload)
        });
      } else {
        res = await fetchWithAuth('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dbPayload)
        });
      }

      if (res && res.ok) {
        // Refresh documents in project view immediately
        const fetchDocs = async () => {
            if (editedProject) {
               const r = await fetchWithAuth(`/api/documents?projectId=${editedProject.id}`);
               if (r.ok) {
                  const allDocs = await r.json();
                  const pDocs = allDocs.map((d: any) => ({
                      id: d.id,
                      title: d.title,
                      category: d.folder || 'Planejamento',
                      size: d.size || '0 KB',
                      uploadedBy: 'Sistema',
                      date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
                      url: d.url,
                      content: d.content
                  }));
                  setEditedProject(prev => prev ? { ...prev, docs: pDocs } : null);
               }
            }
        };
        await fetchDocs();
      }
    } catch (err) {
      console.error('Error saving custom document in ProjectDetailsModal:', err);
    }
  };

  const handleOpenDoc = async (docId?: number) => {
    if (!editedProject) return;
    if (docId) {
        try {
            const res = await fetchWithAuth(`/api/documents?projectId=${editedProject.id}`);
            if (res.ok) {
                const allDocs = await res.json();
                const doc = allDocs.find((d: any) => d.id === docId);
                if (doc) {
                    const typeConfig = getDocTypeConfig(doc);
                    const docType = typeConfig.id; // 'rich-text', 'spreadsheet', 'presentation', 'code', 'image', 'pdf'
                    
                    setEditingDoc({
                       ...doc,
                       category: doc.folder // Adapt structure for Editor
                    });

                    if (docType === 'pdf') {
                        setIsPdfViewerOpen(true);
                    } else if (docType === 'image') {
                        setIsImageViewerOpen(true);
                    } else if (docType === 'code') {
                        setIsCodeEditorOpen(true);
                    } else if (docType === 'spreadsheet') {
                        setIsSpreadsheetEditorOpen(true);
                    } else if (docType === 'presentation') {
                        setIsPresentationEditorOpen(true);
                    } else {
                        setIsDocEditorOpen(true);
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }
    } else {
        setEditingDoc({
           projectId: editedProject.id,
           folder: 'Planejamento'
        });
        setIsDocEditorOpen(true);
    }
  };

  // Synchronize and enrich the incoming lightweight project state with high-fidelity Mock structure
  useEffect(() => {
    if (project && isOpen) {
        if (project.id !== prevProjectId) {
            // First time loading this project, set empty/initial structure
            const enriched: ProjectExtended = {
                id: project.id,
                name: project.name,
                company: project.company || project.companyName || 'Empresa não vinculada',
                companyId: project.companyId,
                owner: project.owner || 'Sem dono',
                priority: project.priority || 'Média',
                deadline: project.deadline || project.dueDate || 'Sem prazo',
                dueDate: project.dueDate || '',
                budget: project.budget || '0',
                column: project.column || project.status?.toLowerCase() || 'planejamento',
                description: project.description || '',
                criteria: project.criteria || [],
                tasks: [],
                sprints: [],
                milestones: [],
                team: project.team || [],
                docs: [],
                comments: project.comments || [],
                history: project.history || [],
                velocity: project.velocity || [],
                logoUrl: project.logoUrl || '',
                coverUrl: project.coverUrl || '',
            };
            setEditedProject(enriched);

            const fetchAllData = async () => {
                try {
                    const [tasksRes, sprintsRes, milestonesRes, docsRes] = await Promise.all([
                        fetchWithAuth('/api/tasks'),
                        fetchWithAuth(`/api/sprints?projectId=${project.id}`),
                        fetchWithAuth(`/api/milestones?projectId=${project.id}`),
                        fetchWithAuth(`/api/documents?projectId=${project.id}`)
                    ]);

                    let pTasks = [];
                    let pSprints = [];
                    let pM = [];
                    let pDocs = [];

                    if (tasksRes.ok) {
                        const allTasks = await tasksRes.json();
                        pTasks = allTasks.filter((t: any) => t.projectId === project.id).map((t: any) => ({
                            id: t.id,
                            name: t.title,
                            assignee: t.assigneeUid || 'Não Atribuído',
                            priority: t.priority,
                            column: t.status === 'BACKLOG' || t.status === 'TODO' ? 'todo' : t.status === 'IN_PROGRESS' ? 'in_progress' : t.status === 'REVIEW' ? 'review' : 'done',
                            sprintId: t.sprintId,
                            tags: Array.isArray(t.tags) ? t.tags : [],
                            dueDate: t.dueDate || '',
                            description: t.description || '',
                            subtasks: Array.isArray(t.subtasks) ? t.subtasks : [],
                            taskComments: Array.isArray(t.taskComments) ? t.taskComments : [],
                            dependencies: Array.isArray(t.dependencies) ? t.dependencies : []
                        }));
                    }

                    if (sprintsRes.ok) {
                        const allSprints = await sprintsRes.json();
                        pSprints = allSprints.map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            goal: s.goal || 'Nova Sprint de Entrega',
                            startDate: s.startDate ? new Date(s.startDate).toLocaleDateString() : 'Em breve',
                            endDate: s.endDate ? new Date(s.endDate).toLocaleDateString() : 'Em breve',
                            status: s.status === 'ACTIVE' ? 'Ativa' : s.status === 'COMPLETED' ? 'Finalizada' : 'Planejada'
                        }));
                    }

                    if (milestonesRes.ok) {
                        const allM = await milestonesRes.json();
                        pM = allM.map((m: any) => ({
                            id: m.id,
                            title: m.name,
                            date: m.date ? new Date(m.date).toLocaleDateString('pt-BR') : 'Breve',
                            desc: m.description || 'Nenhuma descrição complementar.',
                            status: m.status === 'CONCLUIDO' ? 'Concluído' : 'Pendente'
                        }));
                    }

                    if (docsRes.ok) {
                        const allDocs = await docsRes.json();
                        pDocs = allDocs.map((d: any) => ({
                            id: d.id,
                            title: d.title,
                            category: d.folder || 'Planejamento',
                            size: d.size || '1.2 MB',
                            uploadedBy: 'Sistema',
                            date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
                            url: d.url,
                            content: d.content
                        }));
                    }

                    setEditedProject(prev => prev ? {
                        ...prev,
                        tasks: pTasks,
                        sprints: pSprints,
                        milestones: pM,
                        docs: pDocs
                    } : null);
                } catch(e) {
                    console.error(e);
                }
            };

            fetchAllData();

            setIsEditing(false);
            setActiveTab('visao_360');
            setPrevProjectId(project.id);
        }
    } else if (!isOpen) {
        setPrevProjectId(null);
    }
  }, [project, isOpen, prevProjectId]);

  if (!isOpen || !editedProject) return null;

  const handleUpdateProject = async (updated: ProjectExtended) => {
    // Calculate progress percentage dynamically
    const totalTasks = updated.tasks?.length || 0;
    const doneTasks = updated.tasks?.filter((t: any) => {
      return t.column === 'done' || t.status === 'DONE' || (t.column === 'concluido');
    }).length || 0;
    const progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
    
    // Attach calculated progress to the entity
    updated.progress = progressPercent;

    setEditedProject(updated);
    
    // Sync with backend
    try {
        await fetchWithAuth(`/api/projects/${updated.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: updated.name,
                description: updated.description,
                priority: updated.priority,
                team: updated.team,
                history: updated.history,
                comments: updated.comments,
                criteria: updated.criteria,
                velocity: updated.velocity,
                progress: progressPercent,
                budget: updated.budget,
                dueDate: updated.dueDate,
                companyId: updated.companyId,
                productId: updated.productId,
                owner: updated.owner,
                logoUrl: updated.logoUrl,
                coverUrl: updated.coverUrl
            })
        });
    } catch (e) {
        console.error("Failed to sync project update:", e);
    }

    onSave(updated); // Sync with parents state to trigger live update in real Kanban board!
  };

  const handleGlobalHeaderSave = () => {
    if (editedProject) {
      onSave(editedProject);
      setIsEditing(false);
    }
  };

  const tabs = [
    { id: 'visao_360', label: 'Visão 360°', icon: Sparkles },
    { id: 'visao_geral', label: 'Visão Geral', icon: FileText },
    { id: 'identidade_visual', label: 'Identidade Visual', icon: Sparkles },
    { id: 'kanban', label: 'Kanban', icon: LayoutGrid },
    { id: 'sprints', label: 'Sprints', icon: Zap },
    { id: 'timeline', label: 'Timeline', icon: Calendar },
    { id: 'equipe', label: 'Equipe', icon: Users },
    { id: 'marcos', label: 'Marcos', icon: Milestone },
    { id: 'documentos', label: 'Documentos', icon: FolderOpen },
    { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
    { id: 'historico', label: 'Histórico', icon: History },
  ];

  if (!isOpen || !editedProject) return null;

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#FFFFFF] w-full h-full sm:h-[95vh] max-w-[100vw] sm:max-w-7xl sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_30px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Compact Header - Float-fixed at the top of the modal, only visible when collapsed */}
        <div className={`absolute top-0 left-0 right-0 z-50 h-14 bg-[#111111] border-b border-white/10 flex items-center justify-between px-8 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'translate-y-0 opacity-100 pointer-events-auto shadow-md' : '-translate-y-full opacity-0 pointer-events-none'
        }`}>
          <div className="flex items-center gap-3">
            {/* Mini Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/10 flex items-center justify-center font-display font-bold text-xs text-white overflow-hidden shrink-0">
              {editedProject.logoUrl ? (
                <img src={editedProject.logoUrl} alt={editedProject.name} referrerPolicy="no-referrer" className="w-full h-full object-contain p-1 bg-white" />
              ) : (
                editedProject.name.slice(0, 2).toUpperCase()
              )}
            </div>
            {/* Mini Title */}
            <h1 className="text-sm font-display font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {editedProject.name}
            </h1>
          </div>

          {/* Compact Actions */}
          <div className="flex items-center gap-2">
            <AIActionDropdown entityId={editedProject.id?.toString()} actions={['analyzeProject', 'generateRoadmap']} variant="compact" />
            {!isEditing && (
              editedProject.productId ? (
                <button
                  onClick={handleGoToProduct}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[10px]"
                  title="Ver Produto Vinculado"
                >
                  <Layers size={11} className="text-indigo-400" />
                  <span>Ver Produto</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsConvertProductDialogOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all cursor-pointer font-bold text-[10px] shadow-sm"
                  title="Evoluir para Produto"
                >
                  <Layers size={11} />
                  <span>Evoluir</span>
                </button>
              )
            )}
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Fechar"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto bg-[#FFFFFF] scrollbar-none" ref={scrollContainerRef} onScroll={handleScroll}>
          
          {/* Main Hero Header - scrolls naturally, 100% stable, no layout jumps */}
          <div className="bg-[#111111]">
            <EntityHero
              entityType="project"
              name={editedProject.name}
              description={editedProject.description || 'Sem descrição institucional do projeto cadastrada.'}
              logoUrl={editedProject.logoUrl}
              coverUrl={editedProject.coverUrl}
              breadcrumbs={['Perspectiva Executiva', '360°', editedProject.company || 'Cyzor']}
              badges={[
                { label: editedProject.company || 'Empresa', variant: 'neutral' },
                { label: editedProject.column || 'Planejamento', variant: 'secondary' },
                { label: `Prioridade: ${editedProject.priority || 'Alta'}`, variant: 'accent' }
              ]}
              isEditing={isEditing}
              onNameChange={(name) => handleUpdateProject({ ...editedProject, name })}
              onSaveName={handleGlobalHeaderSave}
              onStartEdit={() => setIsEditing(true)}
              scrollProgress={0}
              actions={
                <div className="flex items-center gap-2">
                  <AIActionDropdown entityId={editedProject.id?.toString()} actions={['analyzeProject', 'generateRoadmap']} variant="slate" />
                  {!isEditing && (
                    editedProject.productId ? (
                      <button
                        onClick={handleGoToProduct}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/20 text-white flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs"
                        title="Ver Produto Vinculado"
                      >
                        <Layers size={14} className="animate-pulse text-indigo-400" />
                        <span>Ver Produto Vinculado</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsConvertProductDialogOpen(true)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 transition-all cursor-pointer font-bold text-xs shadow-md"
                        title="Evoluir para Produto"
                      >
                        <Layers size={14} />
                        <span>Evoluir para Produto</span>
                      </button>
                    )
                  )}
                  
                  <button 
                    onClick={onClose} 
                    className="w-10 h-10 rounded-2xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                    title="Fechar"
                  >
                    <X size={20} strokeWidth={2.5} />
                  </button>
                </div>
              }
            />
          </div>

          {/* Sticky Navigation Horizontal Tab Bar - shifts offset to top-14 when compact header is visible */}
          <div className={`sticky z-40 bg-[#111111] border-b border-white/10 transition-all duration-300 shadow-md ${
            isCollapsed ? 'top-14' : 'top-0'
          }`}>
            <div className="flex px-8 gap-5 overflow-x-auto scrollbar-none">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                      isActive 
                        ? 'border-white text-white' 
                        : 'border-transparent text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <TabIcon size={14} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            {activeTab === 'visao_360' && (
              <Vision360 
                entityType="project" 
                entityId={editedProject.id} 
                entityName={editedProject.name} 
                entityData={editedProject} 
              />
            )}
            
            {activeTab === 'visao_geral' && (
              <AbaVisaoGeral 
                project={editedProject} 
                isEditing={isEditing} 
                onChange={handleUpdateProject} 
                companies={companies}
              />
            )}
            
            {/* ... other tabs ... */}
            {activeTab === 'identidade_visual' && (
              <div className="p-4">
                <VisualIdentityTab 
                  entityName={editedProject.name}
                  logoUrl={editedProject.logoUrl || ''}
                  coverUrl={editedProject.coverUrl || ''}
                  onChangeLogo={(url) => {
                    handleUpdateProject({ ...editedProject, logoUrl: url });
                  }}
                  onChangeCover={(url) => {
                    handleUpdateProject({ ...editedProject, coverUrl: url });
                  }}
                />
              </div>
            )}
            
            {activeTab === 'kanban' && (
              <AbaKanban 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'sprints' && (
              <AbaSprints 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'timeline' && (
              <AbaTimeline 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'equipe' && (
              <AbaEquipe 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'marcos' && (
              <AbaMarcos 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'documentos' && editedProject && (
              <AbaDocumentos 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
                onOpenDoc={handleOpenDoc}
              />
            )}
            
            {activeTab === 'comentarios' && (
              <AbaComentarios 
                project={editedProject} 
                onUpdateProject={handleUpdateProject} 
              />
            )}
            
            {activeTab === 'historico' && (
              <AbaHistorico 
                project={editedProject} 
              />
            )}
          </div>
        </div>

      </div>
    </div>
    
    {isDocEditorOpen && (
      <DocEditorModal 
        doc={editingDoc}
        isOpen={isDocEditorOpen}
        onClose={() => {
            setIsDocEditorOpen(false);
            setEditingDoc(null);
            // Refresh documents in project view
            const fetchDocs = async () => {
                if (editedProject) {
                   const res = await fetchWithAuth(`/api/documents?projectId=${editedProject.id}`);
                   if (res.ok) {
                      const allDocs = await res.json();
                      const pDocs = allDocs.map((d: any) => ({
                          id: d.id,
                          title: d.title,
                          category: d.folder || 'Planejamento',
                          size: d.size || '0 KB',
                          uploadedBy: 'Sistema',
                          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
                          url: d.url,
                          content: d.content
                      }));
                      setEditedProject(prev => prev ? { ...prev, docs: pDocs } : null);
                   }
                }
            };
            fetchDocs();
        }}
        onSave={(data) => {
            console.log('Saved Project doc', data);
            // Refresh documents in project view immediately
            const fetchDocs = async () => {
                if (editedProject) {
                   const res = await fetchWithAuth(`/api/documents?projectId=${editedProject.id}`);
                   if (res.ok) {
                      const allDocs = await res.json();
                      const pDocs = allDocs.map((d: any) => ({
                          id: d.id,
                          title: d.title,
                          category: d.folder || 'Planejamento',
                          size: d.size || '0 KB',
                          uploadedBy: 'Sistema',
                          date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('pt-BR') : 'Hoje',
                          url: d.url,
                          content: d.content
                      }));
                      setEditedProject(prev => prev ? { ...prev, docs: pDocs } : null);
                   }
                }
            };
            fetchDocs();
        }}
      />
    )}
    
    {isPdfViewerOpen && editingDoc && (
      <LocalPdfViewerModal 
        doc={editingDoc}
        isOpen={isPdfViewerOpen}
        onClose={() => {
          setIsPdfViewerOpen(false);
          setEditingDoc(null);
        }}
      />
    )}

    {isImageViewerOpen && editingDoc && (
      <LocalImageViewerModal 
        doc={editingDoc}
        isOpen={isImageViewerOpen}
        onClose={() => {
          setIsImageViewerOpen(false);
          setEditingDoc(null);
        }}
      />
    )}

    {isCodeEditorOpen && editingDoc && (
      <CodeEditorProfessional
        doc={editingDoc}
        onSave={(data) => {
          handleSaveCustomDoc(data);
        }}
        onClose={() => {
          setIsCodeEditorOpen(false);
          setEditingDoc(null);
        }}
      />
    )}

    {isSpreadsheetEditorOpen && editingDoc && (
      <SpreadsheetProfessional
        doc={editingDoc}
        onSave={(data) => {
          handleSaveCustomDoc(data);
        }}
        onClose={() => {
          setIsSpreadsheetEditorOpen(false);
          setEditingDoc(null);
        }}
      />
    )}

    {isPresentationEditorOpen && editingDoc && (
      <PresentationProfessional
        doc={editingDoc}
        onSave={(data) => {
          handleSaveCustomDoc(data);
        }}
        onClose={() => {
          setIsPresentationEditorOpen(false);
          setEditingDoc(null);
        }}
      />
    )}

    {/* Conversion Dialog Overlay */}
    {isConvertProductDialogOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#111111]/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-xl rounded-[24px] border border-[#0F172A0F] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-indigo-600 animate-pulse" />
              <span className="text-base font-bold text-slate-800">Evoluir Projeto para Produto</span>
            </div>
            <button 
              onClick={() => setIsConvertProductDialogOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleEvolveToProduct} className="p-6 flex flex-col gap-5 text-left">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-3">
              <Layers className="text-indigo-600 mt-0.5 flex-shrink-0" size={18} />
              <p className="text-xs text-indigo-800 leading-relaxed">
                O projeto <strong>"{editedProject.name}"</strong> está pronto para ser comercializado! Converta-o em um Produto oficial para gerenciar clientes, planos e faturamento.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nome do Produto</label>
                <input 
                  required
                  placeholder="Nome do produto comercial..."
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição Comercial</label>
                <textarea 
                  placeholder="Descreva o produto..."
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</label>
                  <select 
                    value={productData.type}
                    onChange={(e) => setProductData({ ...productData, type: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="SaaS">SaaS</option>
                    <option value="Serviço">Serviço</option>
                    <option value="Infoproduto">Infoproduto</option>
                    <option value="Physical">Físico</option>
                    <option value="API">API de Desenvolvedor</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Modelo de Receita</label>
                  <select 
                    value={productData.pricingModel}
                    onChange={(e) => setProductData({ ...productData, pricingModel: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                  >
                    <option value="Assinatura">Recorrente (Assinatura)</option>
                    <option value="Licença Única">Licença Única (Compra)</option>
                    <option value="Transacional">Transacional / Consumo</option>
                    <option value="Gratuito">Gratuito</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status do Produto</label>
                <select 
                  value={productData.status}
                  onChange={(e) => setProductData({ ...productData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all"
                >
                  <option value="Ideia">Ideia</option>
                  <option value="Desenvolvimento">Em Desenvolvimento</option>
                  <option value="Beta">Lançamento Beta</option>
                  <option value="Produção">Ativo no Mercado</option>
                  <option value="Descontinuado">Descontinuado</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConvertProductDialogOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmittingProduct || !productData.name}
                className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                {isSubmittingProduct ? 'Evoluindo...' : (
                  <>
                    <Layers size={14} />
                    <span>Gerar Produto Comercial</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
}
