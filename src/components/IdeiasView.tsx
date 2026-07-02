import { useState, useEffect, useMemo } from 'react';
import NewIdeaModal from './NewIdeaModal';
import IdeaDetailsModal from './IdeaDetailsModal';
import { useAuth } from '../context/AuthContext';
import StandardHeader from './layout/StandardHeader';
import { Plus, Download, Upload } from 'lucide-react';
import TimelineView, { TimelineItem } from './common/TimelineView';

import IdeaStats from './ideias/IdeaStats';
import IdeaToolbar from './ideias/IdeaToolbar';
import IdeaKanban from './ideias/IdeaKanban';
import IdeaList from './ideias/IdeaList';
import IdeaRoadmap from './ideias/IdeaRoadmap';
import IdeaInsights from './ideias/IdeaInsights';
import IdeaCharts from './ideias/IdeaCharts';
import ProductActionBar from './produtos/ProductActionBar'; // Reusing action bar for selected items

export default function IdeiasView() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'roadmap' | 'timeline'>('kanban');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { fetchWithAuth, activeWorkspace } = useAuth();

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

  const filteredIdeas = ideas.filter(i => {
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
  });

  const emAvaliacao = ideas.filter(i => i.column === 'avaliacao').length;
  const emPesquisa = ideas.filter(i => i.column === 'pesquisa').length;
  const mvp = ideas.filter(i => i.column === 'mvp').length;
  const lancadas = ideas.filter(i => i.column === 'lancadas').length;
  const arquivadas = ideas.filter(i => i.column === 'arquivadas').length;

  const toggleSelection = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

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

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          <IdeaToolbar 
            searchTerm={searchQuery} setSearchTerm={setSearchQuery}
            viewMode={viewMode} setViewMode={setViewMode}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          />
          
          <div className="w-full overflow-hidden">
            {viewMode === 'kanban' && (
              <IdeaKanban 
                ideas={filteredIdeas}
                setIdeas={setIdeas}
                onIdeaClick={setSelectedIdea}
                onUpdateIdeaStatus={handleUpdateIdeaStatus}
              />
            )}

            {viewMode === 'list' && (
              <IdeaList 
                ideas={filteredIdeas}
                onIdeaClick={setSelectedIdea}
                selectedIds={selectedIds}
                toggleSelection={toggleSelection}
              />
            )}

            {viewMode === 'roadmap' && (
              <IdeaRoadmap 
                ideas={filteredIdeas}
                onIdeaClick={setSelectedIdea}
                onUpdateIdeaQuarter={handleUpdateIdeaQuarter}
              />
            )}

            {viewMode === 'timeline' && (
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
        </div>
        
        <div className="w-full xl:w-[380px] shrink-0">
          <IdeaInsights />
        </div>
      </div>

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
