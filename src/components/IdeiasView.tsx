import { useState, useEffect } from 'react';
import NewIdeaModal from './NewIdeaModal';
import IdeaDetailsModal from './IdeaDetailsModal';
import { useAuth } from '../context/AuthContext';

import IdeaHeader from './ideias/IdeaHeader';
import IdeaStats from './ideias/IdeaStats';
import IdeaToolbar from './ideias/IdeaToolbar';
import IdeaKanban from './ideias/IdeaKanban';
import IdeaList from './ideias/IdeaList';
import IdeaInsights from './ideias/IdeaInsights';
import IdeaCharts from './ideias/IdeaCharts';
import ProductActionBar from './produtos/ProductActionBar'; // Reusing action bar for selected items

export default function IdeiasView() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'roadmap'>('kanban');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { fetchWithAuth, activeWorkspace } = useAuth();

  const fetchIdeas = async () => {
    if (!activeWorkspace) return;
    try {
      const res = await fetchWithAuth('/api/ideas');
      if (res.ok) {
        const data = await res.json();
        const mappedData = data.map((i: any) => ({
          ...i,
          name: i.title,
          categoria: i.description || 'SaaS',
          potencial: '$$$',
          complexidade: 'Média',
          score: 80,
          empresa: '-',
          column: i.status || 'capturadas',
          prioridade: ['Alta', 'Média', 'Baixa'][Math.floor(Math.random() * 3)],
          emoji: ['💡', '🚀', '🧠', '✨', '🔥'][Math.floor(Math.random() * 5)]
        }));
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
      const res = await fetchWithAuth(`/api/ideas/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: updated.name, 
          description: updated.categoria,
          status: updated.column
        })
      });
      if (res.ok) fetchIdeas();
    } catch(err) {
      console.error(err);
    }
    setSelectedIdea(null);
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
    <div className="w-full max-w-[1400px] mx-auto pb-12 flex flex-col gap-8 animate-in fade-in duration-500 relative">
      <IdeaHeader onNewIdea={() => setIsNewModalOpen(true)} />
      
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
              <div className="bg-white border border-[#0F172A08] rounded-[32px] p-12 shadow-[0_8px_30px_rgb(0,0,0,0.01)] flex flex-col items-center justify-center text-center min-h-[400px]">
                <h3 className="text-xl font-display font-bold text-[#111111] mb-2">Roadmap em desenvolvimento</h3>
                <p className="text-[#64748B] text-sm max-w-sm">A visualização de roadmap por trimestres será disponibilizada em breve.</p>
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
