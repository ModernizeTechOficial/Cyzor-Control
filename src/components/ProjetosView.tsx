import { useState, useEffect } from 'react';
import { 
  GitBranch, Plus, Search, Sparkles, TrendingUp, Users, 
  ChevronRight, Calendar, Star, MessageSquare, Send, Check, Settings, 
  RefreshCw, Layers, Shield, DollarSign, Clock, AlertCircle, X,
  Filter, ArrowUpRight, CheckSquare, ChevronLeft, LogIn, User, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import StandardHeader from './layout/StandardHeader';
import MetricCard from './MetricCard';
import { showSuccess, showError } from '../lib/alerts';
import ProjectDetailsModal from './ProjectDetailsModal';
import NewProjectModal from './NewProjectModal';
import Markdown from 'react-markdown';

export default function ProjetosView() {
  const { fetchWithAuth, activeWorkspace, user } = useAuth();
  
  // Real database entity states
  const [projects, setProjects] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [financeEntries, setFinanceEntries] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  
  // Modal controllers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<string | undefined>(undefined);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  
  // Global & Kanban search/filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [innerSearch, setInnerSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('Todas');
  const [clientFilter, setClientFilter] = useState('Todos');
  
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
  const syncPlatformData = async () => {
    if (!activeWorkspace) return;
    setIsSyncing(true);
    try {
      const [projRes, compRes, taskRes, finRes, docRes, memRes] = await Promise.all([
        fetchWithAuth('/api/projects'),
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/tasks'),
        fetchWithAuth('/api/finance'),
        fetchWithAuth('/api/documents'),
        fetchWithAuth('/api/workspace/members')
      ]);

      if (projRes.ok) {
        setProjects(await projRes.json());
      }
      if (compRes.ok) setCompanies(await compRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (finRes.ok) setFinanceEntries(await finRes.json());
      if (docRes.ok) setDocuments(await docRes.json());
      if (memRes.ok) setMembers(await memRes.json());
    } catch (err) {
      console.error("CYZOR sync failure:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    syncPlatformData();
  }, [activeWorkspace]);

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
    const projectIdStr = e.dataTransfer.getData('projectId');
    if (!projectIdStr) return;

    const projectId = Number(projectIdStr);
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
      if (!res.ok) throw new Error();
      showSuccess(`Status de "${movedProject.name}" atualizado.`);
    } catch {
      showError('Não foi possível persistir a alteração no servidor.');
      syncPlatformData(); // Relock state
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
      <main className="px-6 sm:px-8 py-6 grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8 items-start">
        
        {/* KANBAN SECTION - COVERS 80% AREA (4 OUT OF 5 COLUMNS) */}
        <section className="xl:col-span-4 flex flex-col gap-5">
          
          {/* Controls, Filters & Sorters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2 text-neutral-400">
              <Filter size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">Filtros Ativos</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Filtro rápido..." 
                value={innerSearch}
                onChange={(e) => setInnerSearch(e.target.value)}
                className="bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white focus:border-neutral-300 border border-neutral-200/55 rounded-lg px-2.5 py-1 text-xs outline-none transition-all font-semibold max-w-[150px]"
              />

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#FAFAFA] border border-neutral-200/50 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none cursor-pointer"
              >
                <option value="Todas">Prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="bg-[#FAFAFA] border border-neutral-200/50 rounded-lg px-2.5 py-1 text-xs font-bold text-neutral-600 outline-none cursor-pointer"
              >
                <option value="Todos">Clientes</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id || c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kanban Flow Container */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {KANBAN_COLUMNS.map((col) => {
              const columnProjects = filteredProjects.filter(p => mapStatusToColumn(p.status) === col.id);

              return (
                <div 
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="flex-shrink-0 w-72 bg-[#FAFAFA]/50 rounded-2xl p-3 border border-neutral-100 flex flex-col min-h-[520px]"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 px-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${col.badge}`}>
                        {col.label}
                      </span>
                      <span className="text-[10px] font-extrabold text-neutral-400">({columnProjects.length})</span>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedColumnId(col.id);
                        setIsModalOpen(true);
                      }}
                      className="w-5 h-5 rounded-md hover:bg-neutral-100/80 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-neutral-200/50"
                      title={`Adicionar projeto em ${col.label}`}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Cards stack */}
                  <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1 scrollbar-none flex-1">
                    {columnProjects.length > 0 ? (
                      columnProjects.map((p) => {
                        const isStarred = favorites.includes(p.id);
                        const progress = Number(p.progress || 0);
                        
                        return (
                          <div 
                            key={p.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, p.id)}
                            className="bg-white p-4 rounded-xl border border-neutral-200/50 hover:border-neutral-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all text-left relative group"
                          >
                            {/* Starred Favorite */}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                              className="absolute top-3 right-3 text-neutral-300 hover:text-amber-500 transition-colors"
                            >
                              <Star size={13} fill={isStarred ? "currentColor" : "none"} className={isStarred ? "text-amber-500" : ""} />
                            </button>

                            {/* Client & Title */}
                            <span className="text-[9px] font-bold text-neutral-400 block tracking-wide uppercase">
                              {p.company || p.companyName || 'CYZOR Cliente'}
                            </span>
                            <h4 
                              onClick={() => setSelectedProject(p)}
                              className="text-xs font-black text-neutral-900 mt-1 hover:underline cursor-pointer tracking-tight"
                            >
                              {p.name}
                            </h4>

                            <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-500 font-medium italic">
                              <User size={10} className="text-neutral-400" />
                              {p.owner || 'Sem dono'}
                            </div>

                            {/* Priority Status indicator */}
                            <div className="flex items-center gap-2 mt-2.5">
                              <span className={`text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md ${
                                p.priority === 'Alta' ? 'bg-red-50 text-red-700' : 'bg-neutral-50 text-neutral-600'
                              }`}>
                                {p.priority || 'Normal'}
                              </span>
                              
                              {p.dueDate && (
                                <span className="text-[9px] font-semibold text-neutral-400 flex items-center gap-1">
                                  <Calendar size={10} />
                                  {new Date(p.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                </span>
                              )}
                            </div>

                            {/* Interactive Progress Bar */}
                            <div className="mt-3.5">
                              <div className="flex items-center justify-between text-[10px] text-neutral-500 font-bold mb-1">
                                <span>Progresso</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-neutral-950 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                            </div>

                            {/* Team initials display */}
                            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                              <span className="text-[9px] font-bold text-neutral-400 uppercase">Faturamento</span>
                              <span className="text-xs font-black text-neutral-900">
                                R$ {Number(p.budget || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 border border-dashed border-neutral-200/50 rounded-xl text-center">
                        <span className="text-[9px] font-black tracking-widest text-neutral-300 uppercase">Vazio</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </section>

        {/* COMPACT CYZOR SIDEBAR - 20% AREA (1 OUT OF 5 COLUMNS) */}
        <section className="flex flex-col gap-6 text-left">
          
          {/* CRITICAL ALERTS */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <h3 className="text-[9px] font-black tracking-wider text-neutral-400 uppercase mb-3 flex items-center gap-1.5">
              <Shield size={12} className="text-neutral-900" />
              Alertas Operacionais
            </h3>
            <div className="flex flex-col gap-2.5">
              {riskProjects.length > 0 ? (
                <div className="p-3 bg-red-50/50 border border-red-100/50 rounded-xl">
                  <span className="text-[8px] font-black uppercase text-red-600 block mb-0.5">Prazo Ameaçado</span>
                  <p className="text-xs font-bold text-red-800 leading-snug">{riskProjects.length} projeto(s) com prioridade ALTA travados.</p>
                </div>
              ) : (
                <div className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <p className="text-xs font-bold text-neutral-700">Fluxos de prazos estabilizados.</p>
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING EVENTS & DELIVERIES */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <h3 className="text-[9px] font-black tracking-wider text-neutral-400 uppercase mb-3.5 flex items-center gap-1.5">
              <Clock size={12} />
              Próximas Entregas
            </h3>
            <div className="relative border-l border-neutral-100 pl-3 ml-1.5 flex flex-col gap-4">
              {projects.length > 0 ? (
                projects.slice(0, 3).map((p, idx) => (
                  <div key={p.id} className="relative group cursor-pointer" onClick={() => setSelectedProject(p)}>
                    <span className="absolute -left-[16.5px] top-1 w-2 h-2 rounded-full bg-neutral-900 border border-white" />
                    <span className="text-[8px] font-black text-neutral-400 uppercase tracking-widest block">
                      {idx === 0 ? 'Hoje' : idx === 1 ? 'Amanhã' : 'Em breve'}
                    </span>
                    <span className="text-xs font-bold text-neutral-800 leading-tight block hover:underline mt-0.5">{p.name}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-neutral-400 font-semibold">Sem entregas agendadas.</p>
              )}
            </div>
          </div>

          {/* LIVE ACTIVITY */}
          <div className="border border-neutral-100 rounded-2xl p-5 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <h3 className="text-[9px] font-black tracking-wider text-neutral-400 uppercase mb-3 flex items-center gap-1.5">
              <Layers size={12} />
              Atividade Recente
            </h3>
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-[10px] mt-0.5">🚀</span>
                <div className="flex-1">
                  <p className="font-bold text-neutral-800 leading-snug">Cyzor Engine ativa no ambiente de produção.</p>
                  <span className="text-[8px] text-neutral-400 font-black uppercase">Agora</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="text-[10px] mt-0.5">✓</span>
                <div className="flex-1">
                  <p className="font-bold text-neutral-800 leading-snug">Auditoria geral concluída sem erros fatais.</p>
                  <span className="text-[8px] text-neutral-400 font-black uppercase">Há 2 horas</span>
                </div>
              </div>
            </div>
          </div>

        </section>

      </main>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━
          LAUNHER COMMAND CENTER WINDOW (⌘K)
          ━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <AnimatePresence>
        {isCommandOpen && (
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
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
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-neutral-900">Cadastrar Cliente / Empresa</h4>
                      <input 
                        type="text" 
                        placeholder="Nome da corporação..." 
                        value={wizardData.companyName}
                        onChange={(e) => setWizardData({ ...wizardData, companyName: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none focus:bg-white"
                      />
                      <select 
                        value={wizardData.companyIndustry}
                        onChange={(e) => setWizardData({ ...wizardData, companyIndustry: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none cursor-pointer"
                      >
                        <option value="Consultoria">Consultoria</option>
                        <option value="Automobilística">Automobilística</option>
                        <option value="Tecnologia">Tecnologia</option>
                        <option value="Financeira">Mercado Financeiro</option>
                      </select>
                      <button onClick={handleCreateCompany} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-lg p-2.5 text-xs font-bold transition-all">
                        Confirmar Cadastro
                      </button>
                    </div>
                  )}

                  {/* Wizard: Document */}
                  {wizardType === 'document' && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-neutral-900">Registrar Documento</h4>
                      <input 
                        type="text" 
                        placeholder="Título do Documento..." 
                        value={wizardData.docTitle}
                        onChange={(e) => setWizardData({ ...wizardData, docTitle: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none focus:bg-white"
                      />
                      <textarea 
                        placeholder="Conteúdo operacional inicial..." 
                        rows={3}
                        value={wizardData.docContent}
                        onChange={(e) => setWizardData({ ...wizardData, docContent: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none focus:bg-white resize-none"
                      />
                      <select
                        value={wizardData.docProjectId}
                        onChange={(e) => setWizardData({ ...wizardData, docProjectId: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none cursor-pointer"
                      >
                        <option value="">Associar ao Projeto (Opcional)</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <button onClick={handleCreateDocument} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-lg p-2.5 text-xs font-bold transition-all">
                        Publicar Documento
                      </button>
                    </div>
                  )}

                  {/* Wizard: Task */}
                  {wizardType === 'task' && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-xs font-black text-neutral-900">Adicionar Tarefa a Projeto</h4>
                      <select 
                        value={wizardData.taskProjectId}
                        onChange={(e) => setWizardData({ ...wizardData, taskProjectId: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none cursor-pointer"
                      >
                        <option value="">Escolher o Projeto...</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <input 
                        type="text" 
                        placeholder="Descrição da ação..." 
                        value={wizardData.taskTitle}
                        onChange={(e) => setWizardData({ ...wizardData, taskTitle: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none focus:bg-white"
                      />
                      <select 
                        value={wizardData.taskPriority}
                        onChange={(e) => setWizardData({ ...wizardData, taskPriority: e.target.value })}
                        className="bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-lg text-xs outline-none cursor-pointer"
                      >
                        <option value="Alta">Alta prioridade</option>
                        <option value="Média">Prioridade Normal</option>
                        <option value="Baixa">Disparável</option>
                      </select>
                      <button onClick={handleCreateTask} className="bg-neutral-950 hover:bg-neutral-900 text-white rounded-lg p-2.5 text-xs font-bold transition-all">
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
          onClose={() => setSelectedProject(null)} 
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
