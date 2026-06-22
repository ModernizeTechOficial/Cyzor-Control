import { useState } from 'react';
import { ProjectExtended, ProjectMember } from '../../types/project';
import { Users, Plus, Trash2, Sliders, Briefcase, UserPlus } from 'lucide-react';

interface AbaEquipeProps {
  project: ProjectExtended;
  onUpdateProject: (updated: ProjectExtended) => void;
}

export default function AbaEquipe({ project, onUpdateProject }: AbaEquipeProps) {
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberAllocation, setNewMemberAllocation] = useState<number>(80);

  const team = project.team || [];
  const tasks = project.tasks || [];

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !newMemberRole.trim()) return;

    const initials = newMemberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const newMember: ProjectMember = {
      name: newMemberName,
      role: newMemberRole,
      allocation: newMemberAllocation,
      avatar: initials
    };

    const updatedTeam = [...team, newMember];
    
    // Add history activity
    const log = {
      id: Date.now(),
      user: 'Usuário',
      action: `adicionou o membro "${newMemberName}" como ${newMemberRole}`,
      time: 'Agora'
    };

    onUpdateProject({
      ...project,
      team: updatedTeam,
      history: [log, ...(project.history || [])]
    });

    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberAllocation(80);
  };

  const handleRemoveMember = (name: string) => {
    const updatedTeam = team.filter(m => m.name !== name);
    onUpdateProject({
      ...project,
      team: updatedTeam
    });
  };

  const handleUpdateAllocation = (name: string, value: number) => {
    const updatedTeam = team.map(m => m.name === name ? { ...m, allocation: value } : m);
    onUpdateProject({
      ...project,
      team: updatedTeam
    });
  };

  return (
    <div className="p-8 flex flex-col gap-10 h-full animate-in fade-in duration-200">
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Column: Team occupancy cards list */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <h3 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
            <Users size={14} /> Atribuição de Workload & Membros da Equipe
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {team.map((member) => {
              const memberTasks = tasks.filter(t => t.assignee === member.name);
              const doneCount = memberTasks.filter(t => t.column === 'done').length;
              
              // Color coding of workload occupancy slider
              const isOverloaded = member.allocation >= 100;
              const barColor = isOverloaded ? 'bg-red-500' : 'bg-[#111111]';

              return (
                <div key={member.name} className="bg-white border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] hover:shadow-md transition-all flex flex-col gap-4 group">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[16px] bg-[#FAFAFA] border border-[#0F172A0F] flex items-center justify-center text-sm font-bold text-[#111111] shadow-sm uppercase">
                        {member.avatar}
                      </div>

                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-[#111111]">{member.name}</h4>
                        <span className="text-[11px] text-[#64748B] font-semibold mt-0.5">{member.role}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleRemoveMember(member.name)}
                      className="text-[#64748B] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Deletar membro"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Allocation monitor */}
                  <div className="flex flex-col gap-2 bg-[#FAFAFA] border border-[#0F172A0F] p-4 rounded-2xl">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#64748B]">Carga de Trabalho Alocada:</span>
                      <span className={`font-bold ${isOverloaded ? 'text-red-600' : 'text-[#111111]'}`}>
                        {member.allocation}% {isOverloaded && '(Sobrecarregado)'}
                      </span>
                    </div>

                    <input 
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={member.allocation}
                      onChange={(e) => handleUpdateAllocation(member.name, parseInt(e.target.value, 10))}
                      className="w-full h-1 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-black"
                    />

                    {/* Progress track */}
                    <div className="w-full h-2 bg-slate-100 border border-[#0F172A0F] rounded-full overflow-hidden mt-1 bg-white">
                      <div className={`h-full transition-all duration-300 rounded-full ${barColor}`} style={{ width: `${Math.min(member.allocation, 100)}%` }}></div>
                    </div>
                  </div>

                  {/* Member associated tasks summaries */}
                  <div className="flex flex-col gap-1.5 border-t border-[#0F172A0F] pt-4">
                    <span className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider">Tarefas no Projeto ({memberTasks.length})</span>
                    {memberTasks.length > 0 ? (
                      <div className="flex flex-col gap-1.5 mt-1">
                        {memberTasks.slice(0, 3).map(t => (
                          <div key={t.id} className="flex justify-between items-center text-xs">
                            <span className="text-[#111111] font-semibold truncate max-w-[150px]">{t.name}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${t.column === 'done' ? 'bg-slate-100 text-[#64748B]' : 'bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111]'}`}>
                              {t.column === 'done' ? 'Concluída' : 'Ativa'}
                            </span>
                          </div>
                        ))}
                        {memberTasks.length > 3 && (
                          <span className="text-[10px] text-[#64748B] font-semibold italic mt-1">+ {memberTasks.length - 3} outra(s) tarefa(s) atribuída(s)</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#64748B] italic mt-1">Nenhuma tarefa atribuída a este membro.</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Invite Member Form & Role Summary */}
        <div className="flex flex-col gap-6 font-medium">
          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
              <UserPlus size={14} /> Integrar Colaborador
            </h4>
            <form onSubmit={handleAddMember} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Nome do membro..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Cargo / Função</label>
                <input
                  type="text"
                  placeholder="Ex: Senior PHP Architect..."
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="bg-[#FAFAFA] border border-[#0F172A0F] text-xs font-semibold text-[#111111] rounded-xl p-2.5 outline-none focus:border-[#111111]/30"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-[#64748B] uppercase">Alocação Inicial: {newMemberAllocation}%</label>
                <input 
                  type="range"
                  min="20"
                  max="120"
                  step="10"
                  value={newMemberAllocation}
                  onChange={(e) => setNewMemberAllocation(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#111111] text-white py-2.5 text-xs font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mt-2"
              >
                Adicionar Colaborador
              </button>
            </form>
          </div>

          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] p-6 shadow-[0_4px_24px_rgba(0,0,0,0.01)] flex flex-col gap-4">
            <h4 className="text-[11px] font-bold uppercase text-[#64748B] tracking-widest border-b border-[#0F172A0F] pb-3 flex items-center gap-1.5">
              <Sliders size={14} /> Resumo de Papéis
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(team.map(m => m.role))).map(role => (
                <div key={role} className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-lg px-3 py-1.5 flex items-center justify-between w-full">
                  <span className="text-[11px] font-bold text-[#111111]">{role}</span>
                  <span className="text-[10px] font-bold text-[#64748B] bg-white px-2 py-0.5 rounded border border-[#0F172A0F]">
                    {team.filter(m => m.role === role).length}
                  </span>
                </div>
              ))}
              {team.length === 0 && (
                <p className="text-[10px] text-[#64748B] italic">Nenhum papel definido ainda.</p>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
