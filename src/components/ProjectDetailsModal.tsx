import { useEffect, useState } from 'react';
import { 
  X, GitBranch, Calendar, User, Flag, MessageSquare, Plus, Pencil, FileText, 
  LayoutGrid, Zap, Milestone, Users, FolderOpen, History 
} from 'lucide-react';
import { ProjectExtended } from '../types/project';
import { useAuth } from '../context/AuthContext';

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

interface ProjectDetailsModalProps {
  project: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (p: any) => void;
}

export default function ProjectDetailsModal({ project, isOpen, onClose, onSave }: ProjectDetailsModalProps) {
  const { fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('visao_geral');
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<ProjectExtended | null>(null);
  const [prevProjectId, setPrevProjectId] = useState<number | null>(null);
  const [editingDoc, setEditingDoc] = useState<any>(null);
  const [isDocEditorOpen, setIsDocEditorOpen] = useState(false);

  const handleOpenDoc = async (docId?: number) => {
    if (!editedProject) return;
    if (docId) {
        try {
            const res = await fetchWithAuth(`/api/documents?projectId=${editedProject.id}`);
            if (res.ok) {
                const allDocs = await res.json();
                const doc = allDocs.find((d: any) => d.id === docId);
                if (doc) {
                    setEditingDoc({
                       ...doc,
                       category: doc.folder // Adapt structure for Editor
                    });
                    setIsDocEditorOpen(true);
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
                company: project.company || 'Empresa não vinculada',
                owner: project.owner || 'Sem dono',
                priority: project.priority || 'Média',
                deadline: project.deadline || 'Sem prazo',
                column: project.column || 'planejamento',
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
            setActiveTab('visao_geral');
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
                progress: progressPercent
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
    { id: 'visao_geral', label: 'Visão Geral', icon: FileText },
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
      <div className="bg-[#FFFFFF] w-full h-full sm:h-[95vh] max-w-[100vw] sm:max-w-7xl sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_30px_80px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header / Tabs Selection */}
        <div className="flex flex-col border-b border-[#0F172A0F] bg-[#FAFAFA] flex-shrink-0">
          
          {/* Top Bar Info Row */}
          <div className="px-8 py-5 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-[20px] bg-[#111111] text-white flex items-center justify-center font-display font-bold text-2xl shadow-md shrink-0">
                <GitBranch size={22} className="text-white" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-[#FFFFFF] border border-[#0F172A0F] rounded text-[#64748B] shadow-sm">
                    {editedProject.company}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 bg-[#111111]/10 text-black rounded uppercase">
                    {editedProject.column}
                  </span>
                </div>

                {isEditing ? (
                  <input
                    value={editedProject.name}
                    onChange={(e) => handleUpdateProject({ ...editedProject, name: e.target.value })}
                    className="text-2xl font-display font-bold text-[#111111] tracking-tight bg-white border border-[#0F172A0F] rounded-lg px-2 py-1 outline-none focus:border-[#111111]/30 shadow-sm w-[300px] sm:w-[400px]"
                  />
                ) : (
                  <h2 className="text-2xl font-display font-bold text-[#111111] tracking-tight leading-tight">
                    {editedProject.name}
                  </h2>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-slate-100 text-[#64748B] hover:text-[#111111] transition-all border border-transparent cursor-pointer"
                  title="Editar Nome do Projeto"
                >
                  <Pencil size={18} />
                </button>
              ) : (
                <button 
                  onClick={handleGlobalHeaderSave} 
                  className="px-4 py-2 bg-[#111111] text-white font-bold text-xs rounded-xl shadow-sm hover:bg-black transition-all cursor-pointer"
                >
                  Salvar
                </button>
              )}

              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-slate-100 text-[#111111] transition-color cursor-pointer"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Navigation Horizontal Tab Bar */}
          <div className="flex px-8 gap-5 overflow-x-auto custom-scrollbar border-t border-[#0F172A0F]/50 scrollbar-none">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 transition-all font-bold text-xs uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                    isActive 
                      ? 'border-[#111111] text-[#111111]' 
                      : 'border-transparent text-[#64748B] hover:text-[#111111] hover:border-[#111111]/30'
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
        <div className="flex-grow overflow-y-auto bg-[#FFFFFF]">
          {activeTab === 'visao_geral' && (
            <AbaVisaoGeral 
              project={editedProject} 
              isEditing={isEditing} 
              onChange={handleUpdateProject} 
            />
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
    </>
  );
}
