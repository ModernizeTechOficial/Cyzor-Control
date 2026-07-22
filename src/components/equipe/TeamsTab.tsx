import { useEffect, useMemo, useState } from 'react';
import { useMembers, useProjects } from '../../hooks/useCyzorQueries';
import { useAuth } from '../../context/AuthContext';
import { Activity, ArrowRight, Building2, Plus, ShieldCheck, Users, X } from 'lucide-react';

type LocalTeam = {
  id: string;
  name: string;
  description: string;
  owner: string;
  ownerId?: string | number;
  memberIds: number[];
  createdAt: string;
};

export default function TeamsTab() {
  const { fetchWithAuth } = useAuth();
  const { data: members = [] } = useMembers();
  const { data: projects = [] } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', description: '', ownerId: '', memberIds: [] as number[] });
  const [localTeams, setLocalTeams] = useState<LocalTeam[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const loadTeams = async () => {
    try {
      setLoadingTeams(true);
      const res = await fetchWithAuth('/api/workspace/teams');
      if (res.ok) {
        const data = await res.json();
        setLocalTeams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Erro ao carregar times:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [fetchWithAuth]);

  const teams = useMemo(() => {
    const grouped = new Map<string, any[]>();
    for (const member of members as any[]) {
      const team = member.team || member.equipe || 'Sem equipe';
      grouped.set(team, [...(grouped.get(team) || []), member]);
    }

    const generated = Array.from(grouped.entries()).map(([name, teamMembers], index) => ({
      id: `auto-${name}-${index}`,
      name,
      description: `Equipe responsável por entregar atividades prioritárias de ${name.toLowerCase()}.`,
      owner: teamMembers.find((member) => /manager|admin|owner/i.test(member.role || ''))?.userName || 'A definir',
      members: teamMembers.length,
      activeProjects: projects.filter((project: any) => project.assigneeId || project.teamId || project.name?.toLowerCase().includes(name.toLowerCase().slice(0, 4))).length,
      xpAverage: Math.round(teamMembers.reduce((acc, member) => acc + (member.xp || 120), 0) / Math.max(1, teamMembers.length)),
      healthScore: Math.round(72 + (teamMembers.length * 2)),
      level: 'Júnior / Pleno',
      source: 'derived' as const,
    }));

    const custom = localTeams.map((team) => {
      const teamMembers = (members as any[]).filter((member) => team.memberIds.includes(member.id));
      return {
        id: team.id,
        name: team.name,
        description: team.description || 'Time criado no painel operacional da organização.',
        owner: team.owner || 'A definir',
        members: teamMembers.length,
        activeProjects: projects.filter((project: any) => project.assigneeId || project.teamId || project.name?.toLowerCase().includes(team.name.toLowerCase().slice(0, 4))).length,
        xpAverage: Math.round(teamMembers.reduce((acc, member) => acc + (member.xp || 120), 0) / Math.max(1, teamMembers.length)),
        healthScore: Math.round(76 + (teamMembers.length * 2)),
        level: 'Pleno / Gestão',
        source: 'custom' as const,
      };
    });

    return [...custom, ...generated];
  }, [localTeams, members, projects]);

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) || null;

  const openCreateModal = () => {
    setEditingTeamId(null);
    setDraft({ name: '', description: '', ownerId: '', memberIds: [] });
    setShowCreateModal(true);
  };

  const openEditModal = (team: any) => {
    const teamMembers = localTeams.find((item) => item.id === team.id);
    setEditingTeamId(team.id);
    setDraft({
      name: team.name,
      description: team.description,
      ownerId: String(teamMembers?.ownerId || ''),
      memberIds: teamMembers?.memberIds || [],
    });
    setShowCreateModal(true);
  };

  const handleSaveTeam = async () => {
    if (!draft.name.trim()) return;

    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim() || 'Time criado pelo console operacional de workspaces.',
        ownerId: draft.ownerId,
        memberIds: draft.memberIds,
      };

      const endpoint = editingTeamId ? `/api/workspace/teams/${editingTeamId}` : '/api/workspace/teams';
      const method = editingTeamId ? 'PUT' : 'POST';

      const res = await fetchWithAuth(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Erro ao ${editingTeamId ? 'atualizar' : 'criar'} o time`);
      }

      const saved = await res.json();
      if (editingTeamId) {
        setLocalTeams((prev) => prev.map((team) => (team.id === editingTeamId ? saved : team)));
      } else {
        setLocalTeams((prev) => [saved, ...prev]);
      }

      setDraft({ name: '', description: '', ownerId: '', memberIds: [] });
      setShowCreateModal(false);
      setEditingTeamId(null);
      setSelectedTeamId(saved.id);
      await loadTeams();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar o time.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-[#111111] tracking-tight">Times & Equipes</h3>
          <p className="text-sm text-[#64748B] font-medium">Crie, acompanhe e abrir mini workspaces para cada equipe operacional.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-2xl text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm"
        >
          <Plus size={16} /> Criar time
        </button>
      </div>

      {loadingTeams ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Carregando times do workspace...
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Nenhum time criado ainda. Use o botão “Criar time” para iniciar a governança operacional.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{team.source === 'custom' ? 'Time criado' : 'Team'}</p>
                  <h3 className="mt-2 text-xl font-black text-slate-900">{team.name}</h3>
                </div>
                <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">Health {team.healthScore}%</div>
              </div>

              <p className="text-sm text-slate-600">{team.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Responsável</p>
                  <p className="mt-2 font-black text-slate-900">{team.owner}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Membros</p>
                  <p className="mt-2 font-black text-slate-900">{team.members}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Projetos ativos</p>
                  <p className="mt-2 font-black text-slate-900">{team.activeProjects}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">XP médio</p>
                  <p className="mt-2 font-black text-slate-900">{team.xpAverage}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 text-emerald-700 px-3 py-2"><ShieldCheck size={14} /> Performance</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-2"><Activity size={14} /> Timeline ativa</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 text-slate-700 px-3 py-2"><Users size={14} /> {team.level}</span>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setSelectedTeamId(team.id)}
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-slate-600"
                >
                  Abrir mini workspace <ArrowRight size={14} />
                </button>
                {team.source === 'custom' && (
                  <button
                    onClick={() => openEditModal(team)}
                    className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Editar time
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTeam && (
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-2xl bg-white p-2 text-slate-700 border border-slate-200">
              <Building2 size={16} />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Mini workspace</p>
              <h4 className="text-lg font-black text-slate-900">{selectedTeam.name}</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-2xl bg-white p-4 border border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Responsável</p>
              <p className="mt-2 font-black text-slate-900">{selectedTeam.owner}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Membros ativos</p>
              <p className="mt-2 font-black text-slate-900">{selectedTeam.members}</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Health</p>
              <p className="mt-2 font-black text-slate-900">{selectedTeam.healthScore}%</p>
            </div>
            <div className="rounded-2xl bg-white p-4 border border-slate-200">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Projetos vinculados</p>
              <p className="mt-2 font-black text-slate-900">{selectedTeam.activeProjects}</p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-4 border border-slate-200 text-sm text-slate-700">
            <span className="font-black text-slate-900">Permissões do time:</span> owner/admin • gestão de projetos • visão de atividades
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl rounded-[32px] bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">{editingTeamId ? 'Editar time' : 'Criar time'}</p>
                <h4 className="text-lg font-black text-slate-900">{editingTeamId ? 'Atualizar time operacional' : 'Novo time operacional'}</h4>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-2xl border border-slate-200 p-2 text-slate-500 hover:text-slate-900">
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Nome do time</label>
                <input
                  value={draft.name}
                  onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                  placeholder="Ex: Engenharia"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Responsável</label>
                <select
                  value={draft.ownerId}
                  onChange={(e) => setDraft((prev) => ({ ...prev, ownerId: e.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none"
                >
                  <option value="">Selecione um responsável</option>
                  {(members as any[]).map((member) => (
                    <option key={member.id} value={member.id}>{member.userName || member.userEmail}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Descrição</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none resize-none"
                  placeholder="Descreva a operação do time"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Membros</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  {(members as any[]).map((member) => {
                    const checked = draft.memberIds.includes(member.id);
                    return (
                      <label key={member.id} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-700 border border-slate-200">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDraft((prev) => ({ ...prev, memberIds: [...prev.memberIds, member.id] }));
                            } else {
                              setDraft((prev) => ({ ...prev, memberIds: prev.memberIds.filter((id) => id !== member.id) }));
                            }
                          }}
                        />
                        {member.userName || member.userEmail}
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">Cancelar</button>
              <button onClick={handleSaveTeam} className="rounded-2xl bg-black px-5 py-2 text-sm font-bold text-white">{editingTeamId ? 'Atualizar time' : 'Salvar time'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
