import { useState } from 'react';
import { ProjectExtended, Milestone } from '../../types/project';
import { Milestone as MilestoneIcon, Flag, Trash2, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AbaMarcosProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaMarcos({ project, onUpdateProject }: AbaMarcosProps) {
  const { fetchWithAuth } = useAuth();
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDate, setNewDate] = useState('');

  const milestones = project.milestones || [];

  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
        const response = await fetchWithAuth('/api/milestones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                projectId: project.id,
                name: newTitle,
                date: newDate,
                description: newDesc,
                status: 'PENDENTE'
            })
        });

        if (response.ok) {
            const savedM = await response.json();
            const newM: Milestone = {
                id: savedM.id,
                title: savedM.name,
                date: savedM.date ? new Date(savedM.date).toLocaleDateString('pt-BR') : 'Breve',
                desc: savedM.description || 'Nenhuma descrição complementar.',
                status: savedM.status === 'CONCLUIDO' ? 'Concluído' : 'Pendente'
            };

            const updatedMilestones = [...milestones, newM];
            
            // Add history activity
            const log = {
              id: Date.now(),
              user: 'Usuário',
              action: `adicionou o marco de entrega "${newTitle}"`,
              time: 'Agora'
            };

            onUpdateProject({
              ...project,
              milestones: updatedMilestones,
              history: [log, ...(project.history || [])]
            });

            setNewTitle('');
            setNewDesc('');
            setNewDate('');
        }
    } catch (error) {
        console.error("Error creating milestone:", error);
    }
  };

  const handleToggleStatus = async (id: number) => {
    const milestone = milestones.find(m => m.id === id);
    if (!milestone) return;

    const nextStatus = milestone.status === 'Concluído' ? 'PENDENTE' : 'CONCLUIDO';
    
    try {
        const response = await fetchWithAuth(`/api/milestones/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: nextStatus })
        });

        if (response.ok) {
            const updated = milestones.map(m => {
              if (m.id === id) {
                return { ...m, status: nextStatus === 'CONCLUIDO' ? 'Concluído' : 'Pendente' as any };
              }
              return m;
            });

            onUpdateProject({
              ...project,
              milestones: updated
            });
        }
    } catch (error) {
        console.error("Error toggling milestone status:", error);
    }
  };

  const handleRemoveMilestone = async (id: number) => {
    if (!confirm('Deseja excluir este marco?')) return;

    try {
        const response = await fetchWithAuth(`/api/milestones/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            const updated = milestones.filter(m => m.id !== id);
            onUpdateProject({
              ...project,
              milestones: updated
            });
        }
    } catch (error) {
        console.error("Error removing milestone:", error);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-10 h-full animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Milestones vertical trackers */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5"><MilestoneIcon size={14} /> Marcos Críticos de Homologação</span>
            <span className="text-[10px] font-bold bg-[#FFFFFF] border border-[#0F172A0F] text-[#111111] px-2 py-0.5 rounded-lg shadow-sm">
              {milestones.filter(m => m.status === 'Concluído').length}/{milestones.length} concluídos
            </span>
          </h3>

          <div className="flex flex-col gap-4">
            {milestones.length === 0 && (
                <div className="text-center py-12 text-[#64748B] text-xs font-medium bg-slate-50 border border-dashed border-[#0F172A0F] rounded-[24px]">
                    Nenhum marco registrado para este projeto.
                </div>
            )}
            {milestones.map((m) => {
              const statusColor = 
                m.status === 'Concluído' ? 'bg-[#111111] text-white border-black' :
                m.status === 'Em Andamento' ? 'bg-amber-500 border-amber-500 text-white' :
                'bg-white text-[#64748B] border-[#0F172A0F]';

              return (
                <div key={m.id} className="bg-white border border-[#0F172A0F] rounded-[24px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-all flex justify-between items-start group">
                  <div className="flex gap-4 items-start">
                    {/* Tick action button */}
                    <button 
                      onClick={() => handleToggleStatus(m.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold font-mono shrink-0 transition-colors cursor-pointer mt-0.5 ${statusColor}`}
                    >
                      {m.status === 'Concluído' ? '✓' : ''}
                    </button>

                    <div className="flex flex-col gap-1">
                      <h4 className={`text-sm font-bold ${m.status === 'Concluído' ? 'text-[#64748B] line-through opacity-70' : 'text-[#111111]'}`}>
                        {m.title}
                      </h4>
                      <p className="text-xs text-[#64748B] font-medium leading-relaxed max-w-xl">{m.desc}</p>
                      
                      <div className="flex items-center gap-4 text-[10px] text-[#64748B] font-bold mt-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {m.date}</span>
                        <span>•</span>
                        <span className="uppercase">Status: {m.status}</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleRemoveMilestone(m.id)}
                    className="text-[#64748B] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 mt-0.5"
                    title="Remover marco"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Invite Milestone Form */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
              <Flag size={14} /> Adicionar Marco
            </h4>

            <form onSubmit={handleCreateMilestone} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Título do Marco</label>
                <input
                  type="text"
                  placeholder="Ex: Homologação de Design..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Descrição Sucinta</label>
                <textarea
                  placeholder="Explique o critério de validação do marco..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-medium text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30 resize-none h-20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Data Limite de Entrega</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#111111] text-white py-2.5 text-xs font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-1"
              >
                Registrar Marco de Entrega
              </button>
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}
