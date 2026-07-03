import { useState, useEffect, useMemo } from 'react';
import NewIdeaModal from './NewIdeaModal';
import IdeaDetailsModal from './IdeaDetailsModal';
import { useAuth } from '../context/AuthContext';
import { useIdeas } from '../hooks/useCyzorQueries';
import { SkeletonKanban } from './common/skeletons/SkeletonKanban';
import { useQueryClient } from '@tanstack/react-query';
import StandardHeader from './layout/StandardHeader';
import { Plus, Download, Upload } from 'lucide-react';
import TimelineView, { TimelineItem } from './common/TimelineView';

import IdeaStats from './ideias/IdeaStats';
import IdeaInsights from './ideias/IdeaInsights';
import IdeaCharts from './ideias/IdeaCharts';
import ProductActionBar from './produtos/ProductActionBar';

import BoardToolbar from './common/management/BoardToolbar';
import BoardKanban, { KanbanColumn, KanbanItem } from './common/management/BoardKanban';
import BoardList from './common/management/BoardList';

const IDEIA_COLUMNS: KanbanColumn[] = [
  { id: 'capturadas', label: 'Capturadas', badge: 'bg-neutral-50 text-neutral-500 border border-neutral-200/50' },
  { id: 'avaliacao', label: 'Em Avaliação', badge: 'bg-amber-50 text-amber-800 border border-amber-200/30' },
  { id: 'pesquisa', label: 'Em Pesquisa', badge: 'bg-[#FAFAFA] text-rose-700 border border-rose-200/50' },
  { id: 'mvp', label: 'MVP Planejado', badge: 'bg-neutral-50 text-neutral-800 border border-neutral-900/10 font-bold' },
  { id: 'lancadas', label: 'Lançadas', badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/30' },
  { id: 'arquivadas', label: 'Arquivadas', badge: 'bg-neutral-100 text-neutral-400 border border-neutral-200/50' }
];

export default function IdeiasView() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const { data: ideasData, isLoading: isIdeasLoading } = useIdeas();

  const [ideas, setIdeas] = useState<any[]>([]);
  useEffect(() => { if (ideasData) setIdeas(ideasData); }, [ideasData]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline' | 'gantt'>('kanban');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { fetchWithAuth, activeWorkspace } = useAuth();

  const handleUpdateIdeaDates = async (ideaId: number, newStartDate: string, newEndDate: string) => {
    const idea = ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const cleanTags = (idea.tags || []).filter((t: string) => !t.startsWith('start:') && !t.startsWith('end:'));
    const updatedTags = [...cleanTags, `start:${newStartDate}`, `end:${newEndDate}`];

    try {
      const res = await fetchWithAuth(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tags: updatedTags
        })
      });

      if (res.ok) {
        setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, tags: updatedTags } : i));
      }
    } catch (e) {
      console.error("Error updating idea dates in timeline:", e);
    }
  };

  const fetchIdeas = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchWithAuth('/api/ideas');
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((i: any) => {
          const quarterTag = i.tags && Array.isArray(i.tags) 
            ? i.tags.find((t: string) => ['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].includes(t)) 
            : null;

          return {
            ...i,
            name: i.title,
            categoria: i.description || 'SaaS',
            potencial: '$$$',
            complexidade: 'Média',
            score: 80,
            empresa: '-',
            column: i.status || 'capturadas',
            prioridade: ['Alta', 'Média', 'Baixa'][Math.floor(Math.random() * 3)],
            emoji: ['💡', '🚀', '🧠', '✨', '🔥'][Math.floor(Math.random() * 5)],
            quarter: quarterTag || 'Backlog'
          };
        });
        setIdeas(mappedData);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIdeas();
  }, [activeWorkspace]);

  const handleUpdateIdeaStatus = async (ideaId: string, newStatus: string) => {
    try {
      await fetchWithAuth(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const handleUpdateIdea = async (updated: any) => {
    try {
      const rawTags = updated.tags && Array.isArray(updated.tags) ? [...updated.tags] : [];
      const filteredTags = rawTags.filter((t: string) => !['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].includes(t));
      if (updated.quarter && updated.quarter !== 'Backlog') {
        filteredTags.push(updated.quarter);
      }

      const res = await fetchWithAuth(`/api/ideas/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: updated.name, 
          description: updated.categoria,
          status: updated.column,
          tags: filteredTags
        })
      });
      if (res.ok) fetchIdeas();
    } catch(err) {
      console.error(err);
    }
    setSelectedIdea(null);
  };

  const handleUpdateIdeaQuarter = async (ideaId: string, newQuarter: string) => {
    try {
      const ideaToUpdate = ideas.find(i => i.id === ideaId);
      if (!ideaToUpdate) return;

      const rawTags = ideaToUpdate.tags && Array.isArray(ideaToUpdate.tags) ? [...ideaToUpdate.tags] : [];
      const filteredTags = rawTags.filter((t: string) => !['Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027'].includes(t));
      if (newQuarter && newQuarter !== 'Backlog') {
        filteredTags.push(newQuarter);
      }

      // Optimistic Update
      setIdeas(prev => prev.map(i => i.id === ideaId ? { ...i, quarter: newQuarter, tags: filteredTags } : i));

      await fetchWithAuth(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          tags: filteredTags
        })
      });
    } catch(err) {
      console.error(err);
      fetchIdeas(); // Revert to database state if failed
    }
  };

  const filteredIdeas = useMemo(() => ideas.filter(i => {
    const matchesSearch = i.name?.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'CAPTURADAS' && i.column !== 'capturadas') matchesStatus = false;
      if (statusFilter === 'AVALIACAO' && i.column !== 'avaliacao') matchesStatus = false;
      if (statusFilter === 'PESQUISA' && i.column !== 'pesquisa') matchesStatus = false;
      if (statusFilter === 'MVP' && i.column !== 'mvp') matchesStatus = false;
      if (statusFilter === 'LANCADAS' && i.column !== 'lancadas') matchesStatus = false;
      if (statusFilter === 'ARQUIVADAS' && i.column !== 'arquivadas') matchesStatus = false;
    }
    return matchesSearch && matchesStatus;
  }), [ideas, searchQuery, statusFilter]);

  const timelineItems = useMemo(() => {
    return filteredIdeas.map(idea => {
      let startDate = '';
      let endDate = '';
      
      const startTag = idea.tags?.find((t: string) => t.startsWith('start:'));
      const endTag = idea.tags?.find((t: string) => t.startsWith('end:'));
      
      if (startTag) startDate = startTag.replace('start:', '');
      if (endTag) endDate = endTag.replace('end:', '');
      
      if (!startDate) {
        if (idea.quarter === 'Q3 2026') {
          startDate = '2026-07-01';
          endDate = '2026-09-30';
        } else if (idea.quarter === 'Q4 2026') {
          startDate = '2026-10-01';
          endDate = '2026-12-31';
        } else if (idea.quarter === 'Q1 2027') {
          startDate = '2027-01-01';
          endDate = '2027-03-31';
        } else if (idea.quarter === 'Q2 2027') {
          startDate = '2027-04-01';
          endDate = '2027-06-30';
        } else {
          const today = new Date();
          startDate = today.toISOString().split('T')[0];
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          endDate = nextWeek.toISOString().split('T')[0];
        }
      }
      
      if (!endDate) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + 30); // 1 month default duration
        endDate = d.toISOString().split('T')[0];
      }
      
      const colLabelMap: { [key: string]: string } = {
        'capturadas': 'Capturadas',
        'avaliacao': 'Em Avaliação',
        'pesquisa': 'Em Pesquisa',
        'mvp': 'MVP Planejado',
        'lancadas': 'Lançadas',
        'arquivadas': 'Arquivadas'
      };

      return {
        id: idea.id,
        name: idea.name,
        startDate,
        endDate,
        status: idea.column,
        statusLabel: colLabelMap[idea.column] || idea.column,
        priority: idea.prioridade || 'Média',
        assignee: idea.empresa || '-',
        progress: idea.score || 50,
        dependencies: [],
        rawItem: idea
      } as TimelineItem;
    });
  }, [filteredIdeas]);

  const kanbanItems: KanbanItem[] = useMemo(() => {
    return filteredIdeas.map(i => ({
      id: i.id,
      title: i.name || i.title,
      subtitle: i.categoria || 'Categoria',
      owner: i.empresa || '-',
      priority: i.prioridade || 'Média',
      progress: i.score || 0,
      budgetOrValue: i.potencial || '$$$',
      budgetLabel: 'Potencial',
      status: i.column,
      raw: i
    }));
  }, [filteredIdeas]);

  const handleDropKanban = async (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData('itemId');
    if (!ideaId) return;

    // Optimistic Update
    setIdeas(prev => prev.map(i => i.id === Number(ideaId) ? { ...i, column: colId } : i));

    try {
      await fetchWithAuth(`/api/ideas/${ideaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: colId })
      });
    } catch(err) {
      console.error(err);
      fetchIdeas(); // Revert
    }
  };

  const emAvaliacao = ideas.filter(i => i.column === 'avaliacao').length;
  const emPesquisa = ideas.filter(i => i.column === 'pesquisa').length;
  const mvp = ideas.filter(i => i.column === 'mvp').length;
  const lancadas = ideas.filter(i => i.column === 'lancadas').length;
  const arquivadas = ideas.filter(i => i.column === 'arquivadas').length;

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (isIdeasLoading) {
    return <SkeletonKanban />;
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      <StandardHeader 
        title="Banco de Ideias"
        subtitle="Capture, valide e transforme ideias em produtos do ecossistema Cyzor."
        actions={[
          {
            label: 'Importar',
            icon: Upload,
            onClick: () => {},
            variant: 'secondary'
          },
          {
            label: 'Exportar',
            icon: Download,
            onClick: () => {},
            variant: 'secondary'
          },
          {
            label: 'Nova Ideia',
            icon: Plus,
            onClick: () => setIsNewModalOpen(true),
            variant: 'primary'
          }
        ]}
      />
      
      <IdeaStats 
        totalIdeas={ideas.length}
        emAvaliacao={emAvaliacao}
        emPesquisa={emPesquisa}
        mvp={mvp}
        lancadas={lancadas}
        arquivadas={arquivadas}
      />

      <IdeaCharts />

      <main className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8 items-start">
        <section className="xl:col-span-4 flex flex-col gap-5">
          <BoardToolbar 
            innerSearch={searchQuery}
            setInnerSearch={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
          
          <div className="w-full overflow-hidden">
            {viewMode === 'kanban' && (
              <BoardKanban 
                columns={IDEIA_COLUMNS}
                items={kanbanItems}
                onDrop={handleDropKanban}
                onItemClick={setSelectedIdea}
                onAddClick={() => setIsNewModalOpen(true)}
                emptyMessage="Nenhuma ideia nesta etapa."
              />
            )}

            {viewMode === 'list' && (
              <BoardList 
                columns={[
                  { key: 'title', label: 'Ideia' },
                  { key: 'priority', label: 'Prioridade' },
                  { key: 'status', label: 'Status' },
                  { key: 'score', label: 'Score' }
                ]}
                items={filteredIdeas}
                onItemClick={setSelectedIdea}
                renderCell={(item, colKey) => {
                  if (colKey === 'title') return <div className="font-bold text-neutral-900">{item.name}</div>;
                  if (colKey === 'priority') return (
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      item.prioridade === 'Alta' ? 'bg-red-50 text-red-700 border border-red-100' :
                      item.prioridade === 'Média' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-slate-50 text-slate-700 border border-slate-100'
                    }`}>
                      {item.prioridade}
                    </span>
                  );
                  if (colKey === 'status') {
                    const col = IDEIA_COLUMNS.find(c => c.id === item.column);
                    return <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${col?.badge || ''}`}>{col?.label || item.column}</span>;
                  }
                  if (colKey === 'score') return <span className="text-slate-500">{item.score}%</span>;
                  return null;
                }}
              />
            )}

            {(viewMode === 'timeline' || viewMode === 'gantt') && (
              <div className="w-full bg-white p-6 rounded-[24px] border border-[#0F172A08] shadow-sm">
                <TimelineView 
                  items={timelineItems}
                  onUpdateItemDates={handleUpdateIdeaDates}
                  onItemClick={(rawItem) => setSelectedIdea(rawItem)}
                  onDeleteItem={(ideaId) => {
                    setIdeas(prev => prev.filter(i => i.id !== ideaId));
                  }}
                  title="Cronograma do Banco de Ideias"
                  emptyMessage="Nenhuma ideia capturada para exibir na linha do tempo."
                />
              </div>
            )}
          </div>
        </section>
        
        <section className="flex flex-col gap-6 text-left xl:col-span-1">
          <IdeaInsights />
        </section>
      </main>

      <ProductActionBar selectedCount={selectedIds.length} onClear={() => setSelectedIds([])} />

      <NewIdeaModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
        onSuccess={fetchIdeas}
      />
      <IdeaDetailsModal 
        idea={selectedIdea} 
        isOpen={!!selectedIdea} 
        onClose={() => setSelectedIdea(null)} 
        onSave={handleUpdateIdea}
      />
    </div>
  );
}
