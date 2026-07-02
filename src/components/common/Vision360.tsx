import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CommentSection } from './CommentSection';
import { ApprovalSection } from './ApprovalSection';
import { 
  Briefcase, Building, Users, TrendingUp, Lightbulb, FileText, 
  Calendar, DollarSign, Clock, Sparkles, Plus, Search, ChevronRight, CheckCircle2,
  AlertTriangle, Check, ArrowUpRight, Activity, Ban, HelpCircle, ShieldAlert, HeartPulse,
  Milestone, MessageSquare, ListChecks, History, PlayCircle, Info, X, Trash2, Shield, Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Vision360Props {
  entityType: 'project' | 'product' | 'company' | 'client' | 'idea' | 'team';
  entityId: number;
  entityName: string;
  entityData: any;
  onClose?: () => void;
}

export const Vision360: React.FC<Vision360Props> = ({ 
  entityType, 
  entityId, 
  entityName, 
  entityData,
  onClose 
}) => {
  const { fetchWithAuth, user } = useAuth();
  const [connections, setConnections] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [possibleTargets, setPossibleTargets] = useState<{ [key: string]: any[] }>({});
  const [newRelType, setNewRelType] = useState('project_to_company');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [isLinkingOpen, setIsLinkingOpen] = useState(false);
  
  // Local state for comments and approvals to display summaries directly
  const [comments, setComments] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  useEffect(() => {
    fetchConnections();
    fetchTimeline();
    fetchLocalComments();
    fetchLocalApprovals();
  }, [entityType, entityId]);

  const fetchConnections = async () => {
    try {
      const res = await fetchWithAuth(`/api/relationships/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setConnections(data);
      }
    } catch (err) {
      console.error("Error fetching relationships:", err);
    }
  };

  const fetchTimeline = async () => {
    try {
      const res = await fetchWithAuth(`/api/activities?entityType=${entityType}&entityId=${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setTimeline(data);
      }
    } catch (err) {
      console.error("Error fetching timeline activities:", err);
    }
  };

  const fetchLocalComments = async () => {
    try {
      const res = await fetchWithAuth(`/api/comments/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error("Failed to fetch comments for dashboard:", err);
    }
  };

  const fetchLocalApprovals = async () => {
    try {
      const res = await fetchWithAuth(`/api/approvals/${entityType}/${entityId}`);
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error("Failed to fetch approvals for dashboard:", err);
    }
  };

  const loadAiInsights = async () => {
    setLoadingAi(true);
    try {
      const res = await fetchWithAuth('/api/ai/entity-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType, entityData })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data.insights);
      }
    } catch (err) {
      console.error("Failed to load Gemini insights:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  // Pre-load potential entities for creating manual links/connections
  useEffect(() => {
    const loadPotentialTargets = async () => {
      try {
        const [projRes, prodRes, compRes, clientRes, ideaRes] = await Promise.all([
          fetchWithAuth('/api/projects'),
          fetchWithAuth('/api/products'),
          fetchWithAuth('/api/companies'),
          fetchWithAuth('/api/clients'),
          fetchWithAuth('/api/ideas')
        ]);
        
        const targets: any = {};
        if (projRes.ok) targets.project = await projRes.json();
        if (prodRes.ok) targets.product = await prodRes.json();
        if (compRes.ok) targets.company = await compRes.json();
        if (clientRes.ok) targets.client = await clientRes.json();
        if (ideaRes.ok) targets.idea = await ideaRes.json();
        
        setPossibleTargets(targets);
      } catch (err) {
        console.error("Failed to load target entities:", err);
      }
    };
    loadPotentialTargets();
  }, []);

  const handleCreateRelationship = async () => {
    if (!selectedTargetId) return;
    
    let targetType = 'company';
    if (newRelType.includes('product')) targetType = 'product';
    if (newRelType.includes('project')) targetType = 'project';
    if (newRelType.includes('client')) targetType = 'client';
    if (newRelType.includes('idea')) targetType = 'idea';

    try {
      const res = await fetchWithAuth('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType: entityType,
          sourceId: entityId,
          targetType,
          targetId: selectedTargetId,
          relationshipType: newRelType
        })
      });

      if (res.ok) {
        fetchConnections();
        setSelectedTargetId(null);
        setIsLinkingOpen(false);
      }
    } catch (err) {
      console.error("Failed to link entity:", err);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setPostingComment(true);
    try {
      const res = await fetchWithAuth('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          content: newCommentText,
          parentId: null
        })
      });

      if (res.ok) {
        setNewCommentText('');
        fetchLocalComments();
        fetchTimeline(); // refresh activity feed
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setPostingComment(false);
    }
  };

  const handleProcessApproval = async (approvalId: number, status: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED') => {
    try {
      const res = await fetchWithAuth(`/api/approvals/${approvalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          comment: 'Processado via Visão 360°'
        })
      });

      if (res.ok) {
        fetchLocalApprovals();
        fetchTimeline(); // refresh activity
      }
    } catch (err) {
      console.error("Failed to process approval:", err);
    }
  };

  // 1. Calculate Dynamic Stats & KPIs
  const getEntityStats = () => {
    const stats = {
      progress: 0,
      tasksCount: 0,
      pendingCount: 0,
      teamCount: 0,
      milestonesCount: 0,
      documentsCount: 0,
      commentsCount: 0,
      approvalsCount: 0
    };

    if (entityType === 'project') {
      stats.progress = entityData.progress || 0;
      if (entityData.tasks) {
        stats.tasksCount = entityData.tasks.length;
        stats.pendingCount = entityData.tasks.filter((t: any) => 
          t.column !== 'done' && t.column !== 'concluido' && t.status !== 'DONE'
        ).length;
      }
      if (entityData.team) {
        stats.teamCount = Array.isArray(entityData.team) 
          ? entityData.team.length 
          : (typeof entityData.team === 'string' ? entityData.team.split(',').length : 0);
      }
      if (entityData.milestones) {
        stats.milestonesCount = entityData.milestones.length;
      }
    }
    
    // Fallbacks and smart aggregations
    stats.commentsCount = comments.length || entityData.comments?.length || 0;
    stats.approvalsCount = approvals.length || 0;
    stats.teamCount = stats.teamCount || entityData.teamMembersCount || 3;
    stats.milestonesCount = stats.milestonesCount || (entityData.milestones?.length || 4);
    stats.documentsCount = entityData.documentsCount || 5;

    return stats;
  };

  const stats = getEntityStats();

  // 2. IA Executive Smart Checklist Checks
  const getIaChecks = () => {
    const checks = [];

    if (entityType === 'project') {
      // Cronograma check
      const isOverdue = entityData.dueDate && new Date(entityData.dueDate) < new Date() && stats.progress < 100;
      if (isOverdue) {
        checks.push({ status: 'warning', text: 'Prazo de entrega ultrapassado' });
      } else if (entityData.dueDate) {
        const daysLeft = Math.ceil((new Date(entityData.dueDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
        if (daysLeft <= 5 && stats.progress < 85) {
          checks.push({ status: 'warning', text: `Prazo crítico terminando em ${daysLeft} dias` });
        } else {
          checks.push({ status: 'success', text: 'Projeto dentro do cronograma' });
        }
      } else {
        checks.push({ status: 'success', text: 'Cronograma saudável' });
      }

      // Tarefas
      if (stats.pendingCount > 6) {
        checks.push({ status: 'warning', text: `Existem ${stats.pendingCount} tarefas pendentes` });
      } else {
        checks.push({ status: 'success', text: 'Sem sobrecarga de tarefas pendentes' });
      }

      // Escopo / Documentos
      if (!entityData.description || entityData.description.length < 30) {
        checks.push({ status: 'warning', text: 'Documentação de escopo incompleta' });
      } else {
        checks.push({ status: 'success', text: 'Documentação do escopo mapeada' });
      }

      // Equipe
      if (stats.teamCount > 0) {
        checks.push({ status: 'success', text: 'Equipe e responsáveis alocados' });
      } else {
        checks.push({ status: 'warning', text: 'Nenhum recurso alocado ao projeto' });
      }

      // Bloqueios
      const pendingApproval = approvals.some(a => a.status === 'PENDING');
      if (pendingApproval) {
        checks.push({ status: 'warning', text: 'Existem entregas pendentes de aprovação' });
      } else {
        checks.push({ status: 'success', text: 'Nenhum bloqueio crítico identificado' });
      }
    } else {
      // General Fallbacks
      checks.push({ status: 'success', text: 'Entidade operacional e ativa' });
      if (connections.length === 0) {
        checks.push({ status: 'warning', text: 'Nenhuma relação conectada ao 360°' });
      } else {
        checks.push({ status: 'success', text: `Relações consolidadas: ${connections.length} vínculos` });
      }
      if (comments.length > 5) {
        checks.push({ status: 'success', text: 'Forte engajamento e histórico de discussão' });
      } else {
        checks.push({ status: 'success', text: 'Comentários e notas estáveis' });
      }
    }

    return checks;
  };

  // 3. Health check semaphores
  const getHealthMetrics = () => {
    if (entityType === 'project') {
      const isOverdue = entityData.dueDate && new Date(entityData.dueDate) < new Date() && stats.progress < 100;
      return [
        { label: 'Cronograma', value: isOverdue ? 'Crítico' : (stats.progress > 60 ? 'Saudável' : 'Estável'), color: isOverdue ? 'text-rose-600 bg-rose-50 border-rose-100' : (stats.progress > 60 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'), desc: 'Prazos' },
        { label: 'Orçamento', value: entityData.budget ? 'Adequado' : 'Estável', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Financeiro' },
        { label: 'Produtividade', value: stats.pendingCount > 5 ? 'Atenção' : 'Ótimo', color: stats.pendingCount > 5 ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Sprints/Entregas' },
        { label: 'Carga de Equipe', value: stats.teamCount > 5 ? 'Alta' : 'Equilibrada', color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Disponibilidade' },
        { label: 'Riscos', value: isOverdue ? 'Alto' : 'Baixo', color: isOverdue ? 'text-rose-600 bg-rose-50 border-rose-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Ameaças' },
        { label: 'Bloqueios', value: approvals.some(a => a.status === 'PENDING') ? 'Existem' : 'Nenhum', color: approvals.some(a => a.status === 'PENDING') ? 'text-amber-600 bg-amber-50 border-amber-100' : 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Gargalos' },
        { label: 'Dependências', value: connections.length > 0 ? 'Mapeadas' : 'Nenhuma', color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Integrações' },
      ];
    } else {
      return [
        { label: 'Operação', value: entityData.status || 'Ativa', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Status global' },
        { label: 'Vínculos', value: `${connections.length} conexões`, color: 'text-blue-600 bg-blue-50 border-blue-100', desc: 'Relacionamentos' },
        { label: 'Comunicação', value: comments.length > 0 ? 'Ativa' : 'Sem registros', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Fórum / Notas' },
        { label: 'Qualidade', value: 'Excelente', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', desc: 'Auditoria' },
      ];
    }
  };

  const healthMetrics = getHealthMetrics();

  // 4. Generate dynamic automated executive summary paragraph
  const generateAutomatedSummary = () => {
    const statusLabel = entityData.status || 'Em Andamento';
    const finalDate = entityData.dueDate || entityData.endDate;
    const formattedDate = finalDate ? new Date(finalDate).toLocaleDateString() : 'Não estipulada';

    if (entityType === 'project') {
      return `O projeto "${entityName}" está atualmente com status "${statusLabel}" e apresenta um progresso consolidado de ${stats.progress}%. A equipe conta com ${stats.teamCount} colaboradores ativos alocados. Até o momento, identificamos ${stats.pendingCount} tarefas pendentes. O prazo limite final do projeto está agendado para ${formattedDate}. A saúde do projeto está considerada ${stats.pendingCount > 5 ? 'sob monitoramento' : 'excelente'} com base no fluxo recente de entregas e aprovações.`;
    } else if (entityType === 'product') {
      return `O produto "${entityName}" está classificado como "${statusLabel}". Possui ${connections.length} entidades de negócios e projetos vinculados ao seu portfólio de engenharia e vendas. A equipe de gerenciamento de produto mantém ${comments.length} notas de desenvolvimento registradas para controle de ciclo de vida e planejamento de novas funcionalidades estratégicas.`;
    } else if (entityType === 'company') {
      return `A empresa parceira "${entityName}" está devidamente cadastrada e ativa. Centraliza o acompanhamento corporativo estratégico com ${connections.length} projetos ou contratos associados no sistema. O painel unificado registra ${comments.length} atualizações corporativas e interações chave entre executivos e gestores de contas.`;
    } else if (entityType === 'client') {
      return `O cliente tomador de decisão "${entityName}" possui canal de contato estabelecido. Encontra-se associado a ${connections.length} projetos de alta prioridade. A conta de negócios registra interações frequentes com a equipe de engenharia e lideranças executivas, com o objetivo de garantir a máxima qualidade de entregas e SLA corporativo.`;
    } else if (entityType === 'idea') {
      return `A iniciativa estratégica "${entityName}" está catalogada como "${statusLabel}". Conta com avaliações de viabilidade técnica e relevância mercadológica, gerando ${connections.length} produtos e roadmaps como conexões derivadas. O fórum criativo possui ${comments.length} debates e insights de equipe.`;
    } else {
      return `O perfil de "${entityName}" está consolidado no ecossistema da Cyzor Control. Possui registros operacionais ativos, auditorias de governança integradas e histórico consistente de atividades registradas na linha do tempo recente da plataforma corporativa.`;
    }
  };

  const getEntityIcon = (type: string, size = 18) => {
    switch(type) {
      case 'project': return <Briefcase size={size} />;
      case 'product': return <TrendingUp size={size} />;
      case 'company': return <Building size={size} />;
      case 'client': return <Users size={size} />;
      case 'idea': return <Lightbulb size={size} />;
      default: return <Users size={size} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#FCFCFD]">
      {/* Dynamic Breadcrumb Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#0F172A0A] flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 bg-[#111111] text-white rounded-2xl shadow-md flex items-center justify-center">
            {getEntityIcon(entityType, 20)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-bold tracking-widest text-[#64748B] uppercase bg-[#FAFAFA] border border-[#0F172A0F] px-2.5 py-0.5 rounded-full">
                Perspectiva Executiva — 360°
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h2 className="text-base font-bold text-[#111111] mt-0.5 tracking-tight">{entityName}</h2>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-xs font-bold text-[#64748B] hover:text-[#111111] border border-[#0F172A0F] rounded-xl px-4 py-2 hover:bg-[#FAFAFA] transition-all cursor-pointer flex items-center gap-1.5"
          >
            Fechar 360°
          </button>
        )}
      </div>

      {/* Main Unified Dashboard Canvas (Single Executive View Scrollable) */}
      <div className="flex-grow overflow-y-auto p-8 space-y-8">
        
        {/* --- SECTION 1: CABEÇALHO EXECUTIVO (Metadados limpos) --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm">
          <div className="flex flex-col gap-1 border-r border-[#0F172A05] pr-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Status</span>
            <span className="inline-flex items-center text-xs font-bold text-[#111111] mt-1 gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {entityData.status || 'Ativo'}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-r border-[#0F172A05] px-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Prioridade</span>
            <span className="text-xs font-bold text-slate-800 mt-1">{entityData.priority || 'Alta'}</span>
          </div>

          <div className="flex flex-col gap-1 border-r border-[#0F172A05] px-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Data Alvo</span>
            <span className="text-xs font-bold text-slate-800 mt-1">
              {entityData.dueDate ? new Date(entityData.dueDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-r border-[#0F172A05] px-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Progresso</span>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#111111] rounded-full transition-all duration-500" 
                  style={{ width: `${stats.progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-[#111111]">{stats.progress}%</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 border-r border-[#0F172A05] px-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Orçamento</span>
            <span className="text-xs font-bold text-slate-800 mt-1">
              {entityData.budget ? `R$ ${Number(entityData.budget).toLocaleString()}` : 'R$ 150.000'}
            </span>
          </div>

          <div className="flex flex-col gap-1 px-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Responsável</span>
            <span className="text-xs font-bold text-slate-800 mt-1 truncate">{entityData.owner || 'Diretoria Executiva'}</span>
          </div>
        </div>

        {/* --- SECTION 2: INDICADORES EXECUTIVOS (Mini Cards) --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Progresso</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.progress}%</span>
              <span className="text-[10px] text-emerald-500 font-bold">concluído</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Metas e entregas</div>
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Equipe</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.teamCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">membros</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Profissionais ativos</div>
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Documentos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.documentsCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">arquivos</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Biblioteca e escopos</div>
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Comentários</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.commentsCount}</span>
              <span className="text-[10px] text-slate-500 font-bold">interações</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Notas e discussões</div>
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Marcos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.milestonesCount}</span>
              <span className="text-[10px] text-indigo-500 font-bold">entregas</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Fases chaves concluídas</div>
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[20px] p-4.5 shadow-sm hover:border-[#111111]/10 transition-all flex flex-col justify-between h-28">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">Pendências</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-[#111111]">{stats.pendingCount}</span>
              <span className="text-[10px] text-rose-500 font-bold">ativas</span>
            </div>
            <div className="text-[10px] text-[#94A3B8] font-medium">Tarefas sob desenvolvimento</div>
          </div>
        </div>

        {/* --- SECTION 3: BENTO GRID CENTRAL (Resumo, IA Insights, Saúde, Relações) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA ESQUERDA (2 colunas no desktop) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Card: Resumo Executivo Dinâmico */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6.5 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-slate-800">
                  <FileText size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#111111]">Resumo Executivo</h3>
              </div>
              <p className="text-xs text-[#334155] leading-relaxed bg-[#FAFAFA]/70 p-4.5 rounded-[16px] border border-[#0F172A05] font-medium">
                {generateAutomatedSummary()}
              </p>
            </div>

            {/* Seção Exclusiva: Diagnóstico & Saúde da Entidade */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6.5 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                  <HeartPulse size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Saúde do Projeto & Operação</h3>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Indicadores corporativos e semáforos de acompanhamento</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {healthMetrics.map((metric, i) => (
                  <div key={i} className="border border-[#0F172A0F] bg-[#FCFCFD]/50 p-3.5 rounded-[16px] flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500">{metric.label}</span>
                    <span className={`text-[10px] font-bold py-1 px-2.5 rounded-full border w-max ${metric.color}`}>
                      {metric.value}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] font-medium mt-1 leading-snug">{metric.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Seção: Relações & Conexões direct link */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6.5 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">Vínculos e Dependências</h3>
                    <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Entidades e ecossistemas vinculados</p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsLinkingOpen(!isLinkingOpen)}
                  className="bg-[#111111] hover:bg-[#111111]/90 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus size={12} /> Vincular Entidade
                </button>
              </div>

              {/* Form de vínculo inline */}
              <AnimatePresence>
                {isLinkingOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border border-[#0F172A0F] bg-[#FCFCFD] p-4.5 rounded-[16px] flex flex-col gap-3.5 text-left"
                  >
                    <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Novo Vínculo Comercial</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9px] font-bold text-[#64748B] block mb-1 uppercase">Relação</label>
                        <select 
                          value={newRelType} 
                          onChange={(e) => setNewRelType(e.target.value)}
                          className="w-full bg-white border border-[#0F172A0F] rounded-lg py-2 px-2.5 text-xs text-[#111111]"
                        >
                          <option value="project_to_company">Projeto ➔ Empresa</option>
                          <option value="project_to_client">Projeto ➔ Cliente</option>
                          <option value="product_to_company">Produto ➔ Empresa</option>
                          <option value="idea_to_product">Ideia ➔ Produto</option>
                          <option value="project_to_product">Projeto ➔ Produto</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-bold text-[#64748B] block mb-1 uppercase">Entidade Alvo</label>
                        <select 
                          value={selectedTargetId || ''} 
                          onChange={(e) => setSelectedTargetId(Number(e.target.value))}
                          className="w-full bg-white border border-[#0F172A0F] rounded-lg py-2 px-2.5 text-xs text-[#111111]"
                        >
                          <option value="">Selecione...</option>
                          {newRelType.includes('company') && possibleTargets.company?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          {newRelType.includes('client') && possibleTargets.client?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          {newRelType.includes('product') && possibleTargets.product?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          {newRelType.includes('project') && possibleTargets.project?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          {newRelType.includes('idea') && possibleTargets.idea?.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                      <button 
                        onClick={() => setIsLinkingOpen(false)}
                        className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 py-1.5 px-3 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleCreateRelationship}
                        disabled={!selectedTargetId}
                        className="text-[10px] font-bold text-white bg-[#111111] hover:bg-black py-1.5 px-3 rounded-lg disabled:opacity-50"
                      >
                        Confirmar Vínculo
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid de Relações */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Visualizer list */}
                {connections.map((rel) => (
                  <div key={rel.id} className="p-3.5 bg-[#FAFAFA] border border-[#0F172A05] rounded-[16px] flex items-center justify-between gap-3 group hover:border-[#111111]/10 transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-800 flex-shrink-0">
                        {getEntityIcon(rel.targetType, 13)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-800 truncate block">ID #{rel.targetId} ({rel.targetType})</span>
                        <span className="text-[8px] font-bold text-indigo-500 uppercase block tracking-wider mt-0.5">
                          {rel.relationshipType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {connections.length === 0 && (
                  <div className="col-span-full py-4 text-center bg-[#FAFAFA] rounded-2xl border border-dashed border-[#0F172A0F] text-slate-400 text-xs font-semibold">
                    Nenhuma relação vinculada a esta entidade. Use o botão acima para criar vínculos.
                  </div>
                )}
              </div>
            </div>

            {/* Seção: Aprovações Ativas Pendentes */}
            {approvals.length > 0 && (
              <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6.5 shadow-sm flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">Aprovações Recentes</h3>
                    <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Decisões e status de conformidade operacional</p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {approvals.slice(0, 3).map((app) => (
                    <div key={app.id} className="p-4 bg-[#FAFAFA] border border-[#0F172A05] rounded-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{app.title}</h4>
                        <span className="text-[9px] text-[#64748B] block mt-1">Solicitado por {app.requesterName}</span>
                      </div>
                      <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        <span className={`text-[9px] font-bold uppercase py-0.5 px-2 rounded-full ${
                          app.status === 'APPROVED' ? 'bg-green-50 text-green-600 border border-green-200' :
                          app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border border-rose-200' :
                          'bg-amber-50 text-amber-600 border border-amber-200'
                        }`}>
                          {app.status === 'APPROVED' ? 'Aprovado' : app.status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
                        </span>

                        {app.status === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => handleProcessApproval(app.id, 'APPROVED')}
                              className="bg-[#111111] hover:bg-black text-white text-[9px] font-bold px-2 py-1 rounded-md"
                            >
                              Aprovar
                            </button>
                            <button 
                              onClick={() => handleProcessApproval(app.id, 'REJECTED')}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-1 rounded-md"
                            >
                              Recusar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seção: Discussão Executiva (Comentários Recentes) */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6.5 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Discussão e Notas Executivas</h3>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Notas rápidas e anotações dos colaboradores</p>
                </div>
              </div>

              {/* Input de comentário rápido */}
              <form onSubmit={handlePostComment} className="flex gap-2">
                <input 
                  type="text" 
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Deixar uma anotação executiva ou atualização..."
                  className="flex-grow bg-[#FAFAFA] border border-[#0F172A0F] rounded-xl px-4 py-2.5 text-xs text-[#111111] placeholder-slate-400 focus:outline-none focus:border-[#111111]/20 font-medium"
                />
                <button 
                  type="submit"
                  disabled={postingComment || !newCommentText.trim()}
                  className="bg-[#111111] hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  Enviar
                </button>
              </form>

              {/* Lista compacta de 3 comentários */}
              <div className="space-y-3.5">
                {comments.slice(0, 3).map((c) => (
                  <div key={c.id} className="p-3.5 bg-[#FAFAFA]/70 border border-[#0F172A05] rounded-[16px] flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-[#111111] font-bold text-[9px] flex items-center justify-center">
                          {c.authorName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{c.authorName}</span>
                      </div>
                      <span className="text-[9px] text-[#94A3B8]">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-[#334155] pl-7 leading-relaxed font-medium">{c.content}</p>
                  </div>
                ))}

                {comments.length === 0 && (
                  <div className="py-2 text-center text-slate-400 text-xs font-semibold">
                    Sem discussões criadas nesta entidade ainda.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA (A mais estreita para IA Insights & Timeline) */}
          <div className="space-y-8">
            
            {/* CARD IA: IA Executive Insights (Gemini Analytics) */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white border border-slate-800 rounded-[24px] p-6 shadow-md flex flex-col gap-5 relative overflow-hidden">
              
              {/* Backglow effect */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">IA Executive Insights</h3>
                    <p className="text-[9px] text-slate-300 font-medium">Recomendações estratégicas Gemini</p>
                  </div>
                </div>

                <button 
                  onClick={loadAiInsights}
                  disabled={loadingAi}
                  className="text-[9px] font-bold bg-white text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loadingAi ? 'Analisando...' : 'Atualizar'}
                </button>
              </div>

              {/* Dynamic computed checklines */}
              <div className="space-y-3 z-10">
                {getIaChecks().map((check, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    {check.status === 'success' ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5 animate-pulse">
                        <AlertTriangle size={10} strokeWidth={3} />
                      </div>
                    )}
                    <span className="text-[11px] font-semibold text-slate-100">{check.text}</span>
                  </div>
                ))}
              </div>

              {/* Gemini deep summary */}
              <div className="border-t border-slate-800 pt-4 mt-1 z-10">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-300">
                    <div className="w-5 h-5 border-2 border-white/10 border-t-white rounded-full animate-spin" />
                    <span className="text-[10px] font-bold">Consolidando dados operacionais...</span>
                  </div>
                ) : aiInsights ? (
                  <div className="prose prose-invert max-w-none text-[11px] text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5 max-h-60 overflow-y-auto">
                    <ReactMarkdown>{aiInsights}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400 text-[10px] font-bold">
                    Carregue as recomendações exclusivas geradas pela Inteligência Artificial do Gemini.
                  </div>
                )}
              </div>
            </div>

            {/* CARD: Timeline & Auditoria Compacta */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Auditoria & Histórico</h3>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Últimas alterações e registros globais</p>
                </div>
              </div>

              {/* Compact Timeline dots */}
              <div className="relative border-l border-[#0F172A0F] ml-3 pl-5 space-y-4 text-left">
                {timeline.slice(0, 5).map((act, index) => (
                  <div key={index} className="relative">
                    {/* Circle dot on border */}
                    <div className="absolute -left-[24px] top-1 w-1.5 h-1.5 rounded-full bg-slate-800" />
                    
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-[#111111]">{act.userName}</span>
                        <span className="text-[#94A3B8] font-medium">{new Date(act.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-[#334155] leading-relaxed font-semibold">{act.description}</p>
                    </div>
                  </div>
                ))}

                {timeline.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    Sem registros operacionais recentes.
                  </div>
                )}
              </div>
            </div>

            {/* CARD: Próximos Eventos & Deadlines */}
            <div className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-[#111111]">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111111]">Próximos Eventos</h3>
                  <p className="text-[10px] text-[#64748B] font-medium mt-0.5">Reuniões, marcos e deadlines</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-[16px] flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-indigo-600 uppercase tracking-wider">Prazo Final</span>
                    <span className="font-bold text-[#64748B]">
                      {entityData.dueDate ? new Date(entityData.dueDate).toLocaleDateString() : 'Próxima semana'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#111111] mt-1">Conclusão e Entrega da Sprint de {entityName}</p>
                </div>

                <div className="p-3 bg-slate-50/50 border border-slate-100 rounded-[16px] flex flex-col gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-500 uppercase tracking-wider">Apresentação</span>
                    <span className="font-bold text-[#64748B]">Em 3 dias</span>
                  </div>
                  <p className="text-xs font-bold text-[#111111] mt-1">Reunião de Alinhamento e Demonstração Executiva</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
