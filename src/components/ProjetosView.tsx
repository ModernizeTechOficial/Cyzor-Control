import { useState, useEffect, useMemo } from 'react';
import { 
  GitBranch, Plus, Search, Sparkles, TrendingUp, Users, 
  ChevronRight, Calendar, Star, MessageSquare, Send, Check, Settings, 
  RefreshCw, Layers, Shield, DollarSign, Clock, AlertCircle, X,
  Filter, ArrowUpRight, CheckSquare, ChevronLeft, User, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProjects, useCompanies, useTasks, useFinance, useDocuments, useMembers } from '../hooks/useCyzorQueries';
import { SkeletonKanban } from './common/skeletons/SkeletonKanban';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import StandardHeader from './layout/StandardHeader';
import MetricCard from './MetricCard';
import { showError, showSuccess } from '../lib/alerts';
import Swal from 'sweetalert2';
import ProjectDetailsModal from './ProjectDetailsModal';
import NewProjectModal from './NewProjectModal';
import ProjectList from './ProjectList';
import BoardKanban from './common/management/BoardKanban';
import BoardToolbar from './common/management/BoardToolbar';
import TimelineView from './common/TimelineView';
import AbaTimeline from './project-tabs/AbaTimeline';
import Markdown from 'react-markdown';
import { FormGroup, FormLabel, FormInput, FormSelect, FormTextarea } from './ui/FormComponents';
import { AIActionDropdown } from './common/AIActionsComponent';

import { useNavigation } from "../context/NavigationContext";

export default function ProjetosView() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { fetchWithAuth, activeWorkspace, user, syncSaaSState } = useAuth();
  
  // Real database entity states
  const { data: projectsData, isLoading: isProjectsLoading } = useProjects();
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();
  const { data: tasksData } = useTasks();
  const { data: financeData } = useFinance();
  const { data: docsData } = useDocuments();
  const { data: membersData } = useMembers();

  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => { if (projectsData) setProjects(projectsData); }, [projectsData]);
  const [companies, setCompanies] = useState<any[]>([]);
  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => { if (tasksData) setTasks(tasksData); }, [tasksData]);
  const [financeEntries, setFinanceEntries] = useState<any[]>([]);
  useEffect(() => { if (financeData) setFinanceEntries(financeData); }, [financeData]);
  const [documents, setDocuments] = useState<any[]>([]);
  useEffect(() => { if (docsData) setDocuments(docsData); }, [docsData]);
  const [members, setMembers] = useState<any[]>([]);
  useEffect(() => { if (membersData) setMembers(membersData); }, [membersData]);
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  useEffect(() => {
    if (globalFilters.projectId && projectsData && projectsData.length > 0) {
      const p = projectsData.find((proj: any) => proj.id.toString() === globalFilters.projectId.toString());
      if (p) setSelectedProject(p);
    }
  }, [globalFilters.projectId, projectsData]);

  const [currentView, setCurrentView] = useState<'kanban' | 'list' | 'timeline' | 'gantt'>('kanban');
  
  // Global & Kanban search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [innerSearch, setInnerSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [clientFilter, setClientFilter] = useState(globalFilters.companyId ? globalFilters.companyId.toString() : 'Todos');

  useEffect(() => {
    if (globalFilters.companyId) {
      setClientFilter(globalFilters.companyId.toString());
    } else {
      setClientFilter('Todos');
    }
  }, [globalFilters.companyId]);
  
  // Custom interactive panels state
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // AI Chat states
  const [aiHistory, setAiHistory] = useState<any[]>([
    { role: 'assistant', text: 'Olá! Sou o assistente da CYZOR. Como posso auxiliar na análise técnica, financeira ou de equipe hoje?' }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Command center wizard state
  const [wizardType, setWizardType] = useState<'menu' | 'company' | 'document' | 'task' | 'deploy'>('menu');
  const [wizardData, setWizardData] = useState({
    companyName: '',
    companyIndustry: 'Consultoria',
    docTitle: '',
    docContent: '',
    docProjectId: '',
    taskProjectId: '',
    taskTitle: '',
    taskPriority: 'Média',
    deployProjectId: '',
    deployEnv: 'Produção'
  });

  // Favorites tracking (Client-side fast state)
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('cyzor_favorite_projects');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Dynamic status mappings for CYZOR columns
  const KANBAN_COLUMNS = [
    { id: 'backlog', label: 'Backlog', badge: 'bg-neutral-50 text-neutral-500 border border-neutral-200/50' },
    { id: 'planejamento', label: 'Planejamento', badge: 'bg-neutral-50 text-neutral-500 border border-neutral-200/50' },
    { id: 'desenvolvimento', label: 'Em Desenvolvimento', badge: 'bg-neutral-50 text-neutral-800 border border-neutral-900/10 font-bold' },
    { id: 'testes', label: 'Testes', badge: 'bg-[#FAFAFA] text-rose-700 border border-rose-200/50' },
    { id: 'homologacao', label: 'Homologação', badge: 'bg-amber-50 text-amber-800 border border-amber-200/30' },
    { id: 'producao', label: 'Em Produção', badge: 'bg-cyan-50 text-cyan-800 border border-cyan-200/40' },
    { id: 'concluido', label: 'Concluído', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/30' }
  ];

  const mapStatusToColumn = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('backlog')) return 'backlog';
    if (s.includes('planejamento')) return 'planejamento';
    if (s.includes('desenvolvimento') || s.includes('andamento') || s.includes('active')) return 'desenvolvimento';
    if (s.includes('testes') || s.includes('teste')) return 'testes';
    if (s.includes('homologacao') || s.includes('homologação') || s.includes('homolog')) return 'homologacao';
    if (s.includes('producao') || s.includes('produção')) return 'producao';
    if (s.includes('concluido') || s.includes('concluído') || s.includes('completed')) return 'concluido';
    return 'planejamento'; // fallback
  };

  const mapColumnToStatus = (columnId: string) => {
    if (columnId === 'backlog') return 'Backlog';
    if (columnId === 'planejamento') return 'Planejamento';
    if (columnId === 'desenvolvimento') return 'Em Andamento';
    if (columnId === 'testes') return 'Testes';
    if (columnId === 'homologacao') return 'Homologacao';
    if (columnId === 'producao') return 'Producao';
    if (columnId === 'concluido') return 'Concluido';
    return 'Planejamento';
  };

  // Synchronize dynamic platform arrays with actual databases
  const queryClient = useQueryClient();
  const syncPlatformData = async () => {
    setIsSyncing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['companies'] }),
      queryClient.invalidateQueries({ queryKey: ['tasks'] }),
      queryClient.invalidateQueries({ queryKey: ['finance'] }),
      queryClient.invalidateQueries({ queryKey: ['documents'] }),
      queryClient.invalidateQueries({ queryKey: ['members'] }),
      syncSaaSState()
    ]);
    setIsSyncing(false);
  };

  

  // Command keybind (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setWizardType('menu');
        setIsCommandOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toggle favorites with storage fallback
  const toggleFavorite = (id: number) => {
    const updated = favorites.includes(id) 
      ? favorites.filter(fid => fid !== id)
      : [...favorites, id];
    setFavorites(updated);
    localStorage.setItem('cyzor_favorite_projects', JSON.stringify(updated));
    showSuccess(favorites.includes(id) ? 'Removido dos favoritos.' : 'Adicionado aos favoritos!');
  };

  // HTML5 Drag-and-Drop
  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('projectId', id.toString());
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    const projectIdStr = e.dataTransfer.getData('projectId') || e.dataTransfer.getData('itemId') || e.dataTransfer.getData('text/plain');
    let projectId = (window as any).__draggedItemId;

    if (!projectId && projectIdStr) {
      projectId = Number(projectIdStr);
    }

    if (!projectId) return;

    // Clear global state
    (window as any).__draggedItemId = null;

    const movedProject = projects.find(p => p.id === projectId);
    if (!movedProject) return;

    const newStatus = mapColumnToStatus(targetColumn);
    
    // Optimistic UI update
    setProjects(projects.map(p => p.id === projectId ? { ...p, status: newStatus } : p));

    try {
      const res = await fetchWithAuth(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Projeto atualizado!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        throw new Error();
      }
    } catch {
      showError('Não foi possível persistir a alteração no servidor.');
      syncPlatformData(); // Revert
    }
  };

  const handleProjectSave = () => {
    syncPlatformData();
  };

  const handleSendAIChat = async () => {
    if (!aiPrompt.trim()) return;
    const userMsg = aiPrompt;
    setAiHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setAiPrompt('');
    setIsAnalyzingAI(true);

    try {
      // Build precise analytical facts based on real system databases
      const context = `
        Métricas Atuais do Sistema:
        - Projetos Ativos: ${projects.filter(p => !['Concluido', 'Pausado'].includes(p.status)).length}
        - Faturamento Geral: R$ ${financeEntries.filter(f => f.type === 'RECEITA').reduce((acc, cr) => acc + Number(cr.amount), 0).toLocaleString('pt-BR')}
        - Tarefas Pendentes: ${tasks.filter(t => t.status !== 'DONE').length}
        - Clientes Cadastrados: ${companies.map(c => c.name).join(', ')}
        - Detalhes de Projetos: ${JSON.stringify(projects.slice(0, 10).map(p => ({ n: p.name, status: p.status, pr: p.priority, percent: p.progress })))}
      `;

      const res = await fetchWithAuth('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Sua função: Copiloto Executivo da CYZOR.\n\nContexto Atual:\n${context}\n\nPergunta do Executivo: "${userMsg}"\n\nPor favor, elabore um resumo conciso, analítico, focando em responder objetivamente o usuário com conselhos táticos.`,
          history: aiHistory.slice(-6).map(h => ({ role: h.role === 'assistant' ? 'assistant' : 'user', text: h.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiHistory(prev => [...prev, { role: 'assistant', text: data.text }]);
      } else {
        throw new Error();
      }
    } catch {
      setAiHistory(prev => [...prev, { role: 'assistant', text: 'Não consegui me comunicar com o núcleo de inteligência da CYZOR neste momento. Por favor, verifique as chaves ou tente reiniciar em breve.' }]);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // Command Center Wizards
  const handleCreateCompany = async () => {
    if (!wizardData.companyName.trim()) return;
    try {
      const res = await fetchWithAuth('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: wizardData.companyName,
          cnpj: 'CYZ-' + Math.floor(Math.random() * 900000),
          industry: wizardData.companyIndustry,
          status: 'Ativo'
        })
      });
      if (res.ok) {
        showSuccess(`Cliente "${wizardData.companyName}" registrado!`);
        setWizardData(prev => ({ ...prev, companyName: '', companyIndustry: 'Consultoria' }));
        setIsCommandOpen(false);
        syncPlatformData();
      }
    } catch {
      showError('Ocorreu uma falha ao cadastrar o cliente.');
    }
  };

  const handleCreateDocument = async () => {
    if (!wizardData.docTitle.trim()) return;
    try {
      const res = await fetchWithAuth('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: wizardData.docTitle,
          content: wizardData.docContent || 'Documento operacional registrado.',
          projectId: wizardData.docProjectId ? Number(wizardData.docProjectId) : null,
          folder: 'Geral',
          type: 'DOC'
        })
      });
      if (res.ok) {
        showSuccess(`Documento "${wizardData.docTitle}" publicado.`);
        setWizardData(prev => ({ ...prev, docTitle: '', docContent: '', docProjectId: '' }));
        setIsCommandOpen(false);
        syncPlatformData();
      }
    } catch {
      showError('Falha ao publicar documento.');
    }
  };

  const handleCreateTask = async () => {
    if (!wizardData.taskTitle.trim() || !wizardData.taskProjectId) return;
    try {
      const res = await fetchWithAuth('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: Number(wizardData.taskProjectId),
          title: wizardData.taskTitle,
          priority: wizardData.taskPriority,
          status: 'TODO'
        })
      });
      if (res.ok) {
        showSuccess('Tarefa adicionada ao projeto corporativo.');
        setWizardData(prev => ({ ...prev, taskTitle: '', taskProjectId: '', taskPriority: 'Média' }));
        setIsCommandOpen(false);
        syncPlatformData();
      }
    } catch {
      showError('Falha ao fixar tarefa.');
    }
  };

  // Safe Math calculation for high-fidelity values
  const totalRevenue = financeEntries
    .filter(f => f.type === 'RECEITA')
    .reduce((acc, f) => acc + Number(f.amount || 0), 0) || projects.reduce((acc, p) => acc + Number(p.budget || 0), 0);

  const activeCount = projects.filter(p => !['Concluido', 'Pausado', 'Concluído'].includes(p.status)).length;
  const finishedCount = projects.filter(p => ['Concluído', 'Concluido'].includes(p.status)).length;
  const riskProjects = projects.filter(p => p.priority === 'Alta' && Number(p.progress || 0) < 40);

  // Filter project pipelines
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(innerSearch.toLowerCase()) || 
                          (p.companyName || '').toLowerCase().includes(innerSearch.toLowerCase()) ||
                          (p.company || '').toLowerCase().includes(innerSearch.toLowerCase());
    const matchesPriority = priorityFilter === 'Todas' || p.priority === priorityFilter;
    const matchesClient = clientFilter === 'Todos' || p.companyId?.toString() === clientFilter || p.company === clientFilter;
    return matchesSearch && matchesPriority && matchesClient;
  });

  // Memoized kanban items for stability
  const kanbanItems = useMemo(() => {
    return filteredProjects.map(p => ({
      id: p.id,
      title: p.name,
      subtitle: p.company || p.companyName || 'CYZOR Cliente',
      owner: p.owner,
      priority: p.priority,
      dueDate: p.dueDate,
      progress: Number(p.progress || 0),
      budgetOrValue: Number(p.budget || 0),
      budgetLabel: 'Faturamento',
      isStarred: favorites.includes(p.id),
      status: mapStatusToColumn(p.status),
      raw: p
    }));
  }, [filteredProjects, favorites]);

  // Hot Smart Search filtering for global header bar
  const getSmartSearchResults = () => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: any[] = [];

    projects.forEach(p => {
      if (p.name.toLowerCase().includes(q)) matches.push({ type: 'projeto', label: `Projeto: ${p.name}`, data: p });
    });
    companies.forEach(c => {
      if (c.name.toLowerCase().includes(q)) matches.push({ type: 'cliente', label: `Cliente: ${c.name}`, data: c });
    });
    tasks.forEach(t => {
      if (t.title.toLowerCase().includes(q)) matches.push({ type: 'tarefa', label: `Tarefa: ${t.title}`, data: t });
    });
    documents.forEach(d => {
      if (d.title.toLowerCase().includes(q)) matches.push({ type: 'documento', label: `Doc: ${d.title}`, data: d });
    });

    return matches;
  };

  if (isProjectsLoading || isCompaniesLoading) {
    return <SkeletonKanban />;
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative text-left px-4 sm:px-6 lg:px-10">
      
      <StandardHeader 
        title="Projetos"
        subtitle="Gerencie e controle todo o ciclo operacional estratégico de seus projetos e squads."
        actions={[
          {
            label: 'Launcher',
            icon: GitBranch,
            onClick: () => { setWizardType('menu'); setIsCommandOpen(true); },
            variant: 'secondary'
          },
          {
            label: 'Olimpo AI',
            icon: Sparkles,
            onClick: () => setIsAiAssistantOpen(true),
            variant: 'secondary'
          },
          {
            label: 'Sync',
            icon: RefreshCw,
            onClick: syncPlatformData,
            variant: 'secondary'
          },
          {
            label: 'Novo Projeto',
            icon: Plus,
            onClick: () => setIsModalOpen(true),
            variant: 'primary'
          }
        ]}
      />

      {/* Dynamic Global Autocomplete inside layout */}
      {searchQuery && (
        <div className="relative w-full max-w-xl mx-auto -mt-4">
          <div className="flex items-center bg-white border border-neutral-200/50 hover:border-neutral-300 rounded-xl px-3 py-1.5 transition-all text-xs focus-within:ring-2 focus-within:ring-black/5">
            <Search size={14} className="text-neutral-400 mr-2" />
            <input 
              type="text" 
              placeholder="Pesquisa rápida..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full font-medium placeholder:text-neutral-400"
            />
            <button onClick={() => setSearchQuery('')} className="text-[10px] text-neutral-400 hover:text-neutral-900 font-black">X</button>
          </div>

          <AnimatePresence>
            <motion.div 
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute left-0 mt-1.5 w-full bg-white border border-neutral-100 rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.06)] z-50 overflow-hidden text-left"
            >
              <div className="p-2 border-b border-neutral-100 bg-neutral-50/50 text-[9px] font-black tracking-wider text-neutral-400 uppercase">
                Resultados da Varredura
              </div>
              <div className="p-1 max-h-60 overflow-y-auto">
                {getSmartSearchResults().length > 0 ? (
                  getSmartSearchResults().map((res, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        if (res.type === 'projeto') setSelectedProject(res.data);
                        setSearchQuery('');
                      }}
                      className="w-full p-2.5 hover:bg-neutral-50 rounded-lg text-xs font-bold text-left flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="truncate">{res.label}</span>
                      <ChevronRight size={12} className="text-neutral-400 flex-shrink-0" />
                    </button>
                  ))
                ) : (
                  <p className="p-3 text-xs font-medium text-neutral-400 text-center">Nenhum resultado para "{searchQuery}"</p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          STYLISH KPI CARDS
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard 
          title="Projetos Ativos"
          value={activeCount}
          icon={Layers}
          color="text-neutral-900"
          bg="bg-neutral-50/50"
        />
        <MetricCard 
          title="Em Risco"
          value={riskProjects.length}
          trend={riskProjects.length > 0 ? "Requer atenção" : "Estável"}
          trendUp={riskProjects.length === 0}
          icon={AlertCircle}
          color="text-rose-600"
          bg="bg-rose-50/50"
        />
        <MetricCard 
          title="Concluídos"
          value={finishedCount}
          trend="+12%"
          trendUp={true}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50/50"
        />
        <MetricCard 
          title="Receita Acumulada"
          value={`R$ ${totalRevenue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="text-emerald-600"
          bg="bg-emerald-50/50"
        />
      </section>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          KANBAN BOARD & COMPACT SIDEBAR
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <main className="px-6 sm:px-8 py-6 flex flex-col gap-5">
        
        {/* KANBAN SECTION - FULL WIDTH */}
        <section className="w-full flex flex-col gap-5">
          
          <BoardToolbar 
            innerSearch={innerSearch}
            setInnerSearch={setInnerSearch}
            viewMode={currentView}
            setViewMode={setCurrentView}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            clientFilter={clientFilter}
            setClientFilter={setClientFilter}
            clients={companies}
          />

          {/* View Container */}
          {currentView === 'kanban' && (
            <BoardKanban
              columns={KANBAN_COLUMNS}
              items={kanbanItems}
              onDrop={(e, colId) => handleDrop(e, colId)}
              onItemClick={(p) => {
                setSelectedProject(p);
                setGlobalFilters({ ...globalFilters, projectId: p.id });
              }}
              onToggleFavorite={toggleFavorite}
              onAddClick={(colId) => {
                setSelectedColumnId(colId);
                setIsModalOpen(true);
              }}
              emptyMessage="Vazio"
              disableLayoutAnimation={true}
            />
          )}
          {currentView === 'list' && <ProjectList projects={filteredProjects} />}
          {currentView === 'timeline' && (
            <TimelineView
              items={filteredProjects.map(p => ({
                id: p.id,
                name: p.name,
                startDate: p.startDate || '2026-07-01',
                endDate: p.dueDate || '2026-07-08',
                status: p.status,
                statusLabel: p.status,
                priority: p.priority,
                assignee: p.owner || 'Não atribuído',
                progress: Number(p.progress || 0),
                rawItem: p
              }))}
              onUpdateItemDates={async (itemId, s, e) => {
                await fetchWithAuth(`/api/projects/${itemId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ startDate: s, dueDate: e })
                });
                syncPlatformData();
              }}
              onItemClick={(p) => {
                setSelectedProject(p);
                setGlobalFilters({ ...globalFilters, projectId: p.id });
              }}
            />
          )}
          {currentView === 'gantt' && (
            <TimelineView
              items={filteredProjects.map(p => ({
                id: p.id,
                name: p.name,
                startDate: p.startDate || '2026-07-01',
                endDate: p.dueDate || '2026-07-08',
                status: p.status,
                statusLabel: p.status,
                priority: p.priority,
                assignee: p.owner || 'Não atribuído',
                progress: Number(p.progress || 0),
                rawItem: p
              }))}
              onUpdateItemDates={async (itemId, s, e) => {
                await fetchWithAuth(`/api/projects/${itemId}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ startDate: s, dueDate: e })
                });
                syncPlatformData();
              }}
              onItemClick={(p) => {
                setSelectedProject(p);
                setGlobalFilters({ ...globalFilters, projectId: p.id });
              }}
              title="Gantt do Projeto"
            />
          )}

        </section>

      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          LAUNHER COMMAND CENTER WINDOW (⌘K)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {isCommandOpen && (
          <div 
            onClick={() => setIsCommandOpen(false)}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white border border-neutral-200 shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden text-left"
            >
              <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-neutral-900 bg-neutral-200 px-2 py-0.5 rounded-md uppercase">CYZOR LAUNCHER</span>
                </div>
                <button onClick={() => setIsCommandOpen(false)} className="text-neutral-400 hover:text-neutral-900 transition-colors">
                  <X size={15} />
                </button>
              </div>

              {wizardType === 'menu' ? (
                <div className="p-4">
                  <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-3 block">Ambiente Operacional</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => { setIsModalOpen(true); setIsCommandOpen(false); }}
                      className="p-3 bg-[#FAFAFA] hover:bg-neutral-950 hover:text-white rounded-xl text-left font-bold text-xs transition-all border border-neutral-100 flex items-center gap-2"
                    >
                      <span>📁</span> Criar Novo Projeto
                    </button>

                    <button 
                      onClick={() => setWizardType('company')}
                      className="p-3 bg-[#FAFAFA] hover:bg-neutral-950 hover:text-white rounded-xl text-left font-bold text-xs transition-all border border-neutral-100 flex items-center gap-2"
                    >
                      <span>🤝</span> Adicionar Cliente / Empresa
                    </button>

                    <button 
                      onClick={() => setWizardType('document')}
                      className="p-3 bg-[#FAFAFA] hover:bg-neutral-950 hover:text-white rounded-xl text-left font-bold text-xs transition-all border border-neutral-100 flex items-center gap-2"
                    >
                      <span>📝</span> Redigir Novo Documento
                    </button>

                    <button 
                      onClick={() => setWizardType('task')}
                      className="p-3 bg-[#FAFAFA] hover:bg-neutral-950 hover:text-white rounded-xl text-left font-bold text-xs transition-all border border-neutral-100 flex items-center gap-2"
                    >
                      <span>⚡</span> Fixar Nova Tarefa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-5 flex flex-col gap-4">
                  <button 
                    onClick={() => setWizardType('menu')}
                    className="text-neutral-400 hover:text-[#111] text-[10px] font-black uppercase tracking-wider flex items-center gap-1 self-start"
                  >
                    <ChevronLeft size={12} /> Voltar ao menu
                  </button>

                  {/* Wizard: Company */}
                  {wizardType === 'company' && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-neutral-900">Cadastrar Cliente / Empresa</h4>
                      <FormGroup>
                        <FormLabel required>Nome da corporação</FormLabel>
                        <FormInput 
                          placeholder="Ex: Nexus Group" 
                          value={wizardData.companyName}
                          onChange={(e) => setWizardData({ ...wizardData, companyName: e.target.value })}
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <FormLabel>Segmento</FormLabel>
                        <FormSelect 
                          value={wizardData.companyIndustry}
                          onChange={(e) => setWizardData({ ...wizardData, companyIndustry: e.target.value })}
                        >
                          <option value="Consultoria">Consultoria</option>
                          <option value="Automobilística">Automobilística</option>
                          <option value="Tecnologia">Tecnologia</option>
                          <option value="Financeira">Mercado Financeiro</option>
                        </FormSelect>
                      </FormGroup>

                      <button onClick={handleCreateCompany} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl p-2.5 text-xs font-bold transition-all mt-2">
                        Confirmar Cadastro
                      </button>
                    </div>
                  )}

                  {/* Wizard: Document */}
                  {wizardType === 'document' && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-neutral-900">Registrar Documento</h4>
                      <FormGroup>
                        <FormLabel required>Título do Documento</FormLabel>
                        <FormInput 
                          placeholder="Título do Documento..." 
                          value={wizardData.docTitle}
                          onChange={(e) => setWizardData({ ...wizardData, docTitle: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel>Conteúdo</FormLabel>
                        <FormTextarea 
                          placeholder="Conteúdo operacional inicial..." 
                          rows={3}
                          value={wizardData.docContent}
                          onChange={(e) => setWizardData({ ...wizardData, docContent: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel>Associar ao Projeto (Opcional)</FormLabel>
                        <FormSelect
                          value={wizardData.docProjectId}
                          onChange={(e) => setWizardData({ ...wizardData, docProjectId: e.target.value })}
                        >
                          <option value="">Nenhum</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </FormSelect>
                      </FormGroup>

                      <button onClick={handleCreateDocument} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl p-2.5 text-xs font-bold transition-all mt-2">
                        Publicar Documento
                      </button>
                    </div>
                  )}

                  {/* Wizard: Task */}
                  {wizardType === 'task' && (
                    <div className="flex flex-col gap-4">
                      <h4 className="text-xs font-black text-neutral-900">Adicionar Tarefa a Projeto</h4>
                      
                      <FormGroup>
                        <FormLabel required>Escolher o Projeto</FormLabel>
                        <FormSelect 
                          value={wizardData.taskProjectId}
                          onChange={(e) => setWizardData({ ...wizardData, taskProjectId: e.target.value })}
                        >
                          <option value="">Selecionar...</option>
                          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </FormSelect>
                      </FormGroup>

                      <FormGroup>
                        <FormLabel required>Descrição da ação</FormLabel>
                        <FormInput 
                          placeholder="O que precisa ser feito?" 
                          value={wizardData.taskTitle}
                          onChange={(e) => setWizardData({ ...wizardData, taskTitle: e.target.value })}
                        />
                      </FormGroup>

                      <FormGroup>
                        <FormLabel>Prioridade</FormLabel>
                        <FormSelect 
                          value={wizardData.taskPriority}
                          onChange={(e) => setWizardData({ ...wizardData, taskPriority: e.target.value })}
                        >
                          <option value="Alta">Alta prioridade</option>
                          <option value="Média">Prioridade Normal</option>
                          <option value="Baixa">Disparável</option>
                        </FormSelect>
                      </FormGroup>

                      <button onClick={handleCreateTask} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-xl p-2.5 text-xs font-bold transition-all mt-2">
                        Vincular Tarefa
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          SLIDING SIDEBAR - OLIMPO AI
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {isAiAssistantOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAiAssistantOpen(false)}
              className="absolute inset-0 bg-neutral-950/20 backdrop-blur-xs"
            />

            {/* Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="relative w-full max-w-md bg-white border-l border-neutral-100 shadow-[0_0_50px_rgba(0,0,0,0.06)] h-full flex flex-col text-left"
            >
              <div className="p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-neutral-900 text-amber-400 rounded-lg">
                    <Sparkles size={14} />
                  </span>
                  <div>
                    <h3 className="text-xs font-black text-neutral-900 tracking-tight leading-none">Olimpo Assistente</h3>
                    <span className="text-[9px] font-semibold text-neutral-500 mt-1 block">Contexto corporativo consolidado</span>
                  </div>
                </div>
                <button onClick={() => setIsAiAssistantOpen(false)} className="text-neutral-400 hover:text-neutral-950 transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                {aiHistory.map((h, i) => (
                  <div key={i} className={`flex flex-col ${h.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[8px] font-black tracking-widest text-neutral-400 uppercase mb-1">
                      {h.role === 'user' ? 'Você' : 'Olimpo IA'}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      h.role === 'user' 
                        ? 'bg-neutral-950 text-white font-semibold rounded-tr-none' 
                        : 'bg-neutral-100 text-neutral-800 font-medium rounded-tl-none border border-neutral-200/50 prose prose-sm prose-neutral max-w-none'
                    }`}>
                      {h.role === 'user' ? (
                        h.text
                      ) : (
                        <div className="markdown-body">
                          <Markdown>{h.text}</Markdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isAnalyzingAI && (
                  <div className="flex items-center gap-2 text-neutral-400 text-xs font-bold">
                    <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full animate-ping" />
                    Varrendo banco operacionais...
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-neutral-100 bg-neutral-50/20">
                <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200/50 focus-within:bg-white focus-within:border-neutral-950 px-3 py-2 rounded-xl">
                  <input 
                    type="text" 
                    placeholder="Quais entregas vencem esta semana?" 
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSendAIChat(); }}
                    className="bg-transparent border-none outline-none w-full text-xs font-medium placeholder:text-neutral-400"
                  />
                  <button 
                    onClick={handleSendAIChat}
                    disabled={isAnalyzingAI || !aiPrompt.trim()}
                    className="p-1.5 bg-neutral-900 text-white rounded-lg hover:bg-black transition-colors disabled:opacity-30"
                  >
                    <Send size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          EDIT & DETAILS MODAL
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {selectedProject && (
        <ProjectDetailsModal 
          project={selectedProject} 
          isOpen={!!selectedProject} 
          onClose={() => {
            setSelectedProject(null);
            if (globalFilters.projectId) {
              setGlobalFilters({ ...globalFilters, projectId: undefined });
            }
          }} 
          onSave={handleProjectSave} 
        />
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          NEW PROJECT CREATION MODAL
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isModalOpen && (
        <NewProjectModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => {
            setIsModalOpen(false);
            syncPlatformData();
          }}
        />
      )}

    </div>
  );
}
