import { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import NewIdeaModal from './NewIdeaModal';
import IdeaDetailsModal from './IdeaDetailsModal';
import { Lightbulb, Plus, CheckCircle2, FlaskConical, Archive, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function IdeiasView() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);

  const [ideas, setIdeas] = useState<any[]>([]);
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
          column: i.status || 'capturadas'
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

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    const ideaId = e.dataTransfer.getData('ideaId');
    if (ideaId) {
      setIdeas(ideas.map(i => i.id.toString() === ideaId ? { ...i, column: columnId } : i));
      
      try {
        await fetchWithAuth(`/api/ideas/${ideaId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: columnId })
        });
      } catch (err) {
        console.error('Failed to update idea status', err);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 md:gap-10 text-left">
      <section className="relative flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] mb-2 tracking-tight">Banco de Ideias</h1>
          <p className="text-[#64748B] text-base sm:text-lg font-medium tracking-wide">Armazenamento, organização e validação de Produto.</p>
        </div>
        <button 
          onClick={() => setIsNewModalOpen(true)}
          className="w-full sm:w-auto bg-[#111111] text-white px-6 py-3 sm:py-3.5 rounded-[14px] sm:rounded-[16px] font-bold text-sm tracking-wide shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black transition-all flex items-center justify-center gap-2 hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)]"
        >
          <Plus size={18} />
          Nova Ideia
        </button>
      </section>
      
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <MetricCard title="Total de Ideias" value={ideas.length.toString()} icon={Lightbulb} />
        <MetricCard title="Em Validação" value={ideas.filter(i => i.column === 'avaliacao' || i.column === 'pesquisa').length.toString()} icon={FlaskConical} />
        <MetricCard title="MVP Planejado" value={ideas.filter(i => i.column === 'mvp').length.toString()} icon={Box} />
        <MetricCard title="Produção Lançada" value={ideas.filter(i => i.column === 'lancadas').length.toString()} sub="Este ano" icon={CheckCircle2} />
      </section>

      <section className="flex gap-4 min-h-[600px] overflow-x-auto pb-4 custom-scrollbar">
        <KanbanColumn title="Capturadas" columnId="capturadas" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
        <KanbanColumn title="Avaliação" columnId="avaliacao" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
        <KanbanColumn title="Pesquisa" columnId="pesquisa" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
        <KanbanColumn title="MVP" columnId="mvp" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
        <KanbanColumn title="Lançadas" columnId="lancadas" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
        <KanbanColumn title="Arquivadas" columnId="arquivadas" ideas={ideas} onIdeaClick={setSelectedIdea} onDropIdea={handleDrop} />
      </section>

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

function KanbanColumn({ title, columnId, ideas, onIdeaClick, onDropIdea }: { title: string, columnId: string, ideas: any[], onIdeaClick: (p: any) => void, onDropIdea: (e: React.DragEvent, id: string) => void }) {
  const columnIdeas = ideas.filter(i => i.column === columnId);
  
  return (
    <div 
      className="flex-shrink-0 w-72 bg-[#FAFAFA]/50 rounded-2xl p-3 border border-neutral-100 flex flex-col min-h-[520px]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDropIdea(e, columnId)}
    >
      <div className="flex items-center justify-between mb-3 px-1 text-left">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-50 text-neutral-600 border border-neutral-200/50">
            {title}
          </span>
          <span className="text-[10px] font-extrabold text-neutral-400">({columnIdeas.length})</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[580px] pr-1 scrollbar-none flex-1">
        {columnIdeas.map(idea => (
          <KanbanCard key={idea.id} idea={idea} onClick={() => onIdeaClick(idea)} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ idea, onClick }: { idea: any, onClick: () => void }) {
  const isHighScore = idea.score >= 80;
  
  return (
    <div 
      onClick={onClick} 
      draggable 
      onDragStart={(e) => e.dataTransfer.setData('ideaId', idea.id.toString())}
      className="bg-white p-4 rounded-xl border border-neutral-200/50 hover:border-neutral-300 shadow-[0_1px_3px_rgba(0,0,0,0.01)] hover:shadow-sm cursor-grab active:cursor-grabbing transition-all text-left relative group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-[#FAFAFA] text-[#64748B]">{idea.categoria}</span>
      </div>
      <h5 className="font-semibold text-[#111111] mb-2 group-hover:text-black transition-colors">{idea.name}</h5>
      
      <div className="text-[11px] text-[#64748B] font-medium mb-4">{idea.empresa}</div>

      <div className="flex justify-between items-end border-t border-[#0F172A0F] pt-4 mt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Potencial</span>
          <span className="text-xs font-semibold text-[#85bb65]">{idea.potencial}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Complex.</span>
          <span className="text-xs font-semibold text-[#111111]">{idea.complexidade}</span>
        </div>
        <div className={`text-[10px] font-bold flex items-center gap-1 flex-col`}>
          <span className="text-[9px] uppercase font-bold text-[#64748B] tracking-wider">Score</span>
          <span className={`px-2 py-1 rounded-md ${isHighScore ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111]'}`}>{idea.score}</span>
        </div>
      </div>
    </div>
  );
}
