import { useState } from 'react';
import { Briefcase, Building2, Users, Plus, Trash2, Edit3, X, Check } from 'lucide-react';
import { useDepartments, useMembers, useWorkspaceTeams } from '../../hooks/useCyzorQueries';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';

export default function DepartmentsTab() {
  const { fetchWithAuth } = useAuth();
  const queryClient = useQueryClient();
  const { data: departments = [], isLoading } = useDepartments();
  const { data: members = [] } = useMembers();
  const { data: teams = [] } = useWorkspaceTeams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leadUid, setLeadUid] = useState('');
  const [healthScore, setHealthScore] = useState(85);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberList = Array.isArray(members) ? (members as any[]) : [];
  const teamList = Array.isArray(teams) ? (teams as any[]) : [];
  const deptList = Array.isArray(departments) ? (departments as any[]) : [];

  const handleOpenModal = (dept?: any) => {
    if (dept) {
      setEditingDept(dept);
      setName(dept.name || '');
      setDescription(dept.description || '');
      setLeadUid(dept.leadUid || '');
      setHealthScore(dept.healthScore || 85);
    } else {
      setEditingDept(null);
      setName('');
      setDescription('');
      setLeadUid('');
      setHealthScore(85);
    }
    setIsModalOpen(true);
  };

  const handleSaveDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      const url = editingDept ? `/api/workspace/departments/${editingDept.id}` : '/api/workspace/departments';
      const method = editingDept ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, leadUid, healthScore }),
      });

      if (!res.ok) throw new Error('Falha ao salvar departamento');

      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar departamento');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    if (!confirm('Deseja realmente excluir este departamento?')) return;
    try {
      const res = await fetchWithAuth(`/api/workspace/departments/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Falha ao excluir departamento');
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['organization-tree'] });
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir departamento');
    }
  };

  if (isLoading) {
    return <div className="rounded-[32px] border border-slate-200 bg-white p-8 text-center text-slate-500">Carregando departamentos...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header action */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900">Gestão de Departamentos</h3>
          <p className="text-xs text-slate-500">Estruture os departamentos da sua organização e associe equipes e gestores.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-bold text-white transition hover:bg-slate-800"
        >
          <Plus size={16} /> Novo Departamento
        </button>
      </div>

      {deptList.length === 0 ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Building2 size={32} className="mx-auto text-slate-400 mb-3" />
          <p className="font-bold text-slate-700">Nenhum departamento cadastrado</p>
          <p className="text-xs mt-1">Clique no botão acima para cadastrar o primeiro departamento da empresa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {deptList.map((dept: any) => {
            const deptMembers = memberList.filter((m) => m.department?.toLowerCase() === dept.name?.toLowerCase());
            const deptTeams = teamList.filter((t) => t.department?.toLowerCase() === dept.name?.toLowerCase());
            const lead = memberList.find((m) => m.userUid === dept.leadUid);

            return (
              <div key={dept.id} className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] text-indigo-600 font-extrabold">Departamento</p>
                      <h3 className="mt-1 text-xl font-black text-slate-900">{dept.name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 text-xs font-bold">
                        Health {dept.healthScore || 85}%
                      </span>
                      <button onClick={() => handleOpenModal(dept)} className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => handleDeleteDepartment(dept.id)} className="p-2 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {dept.description && <p className="text-xs text-slate-600 mb-4">{dept.description}</p>}

                  <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Gestor Responsável</p>
                      <p className="mt-2 font-black text-slate-900">{lead?.userName || lead?.userEmail || 'A definir'}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Colaboradores</p>
                      <p className="mt-2 font-black text-slate-900">{deptMembers.length}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Equipes Vinculadas</p>
                      <p className="mt-2 font-black text-slate-900">{deptTeams.length}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">Projetos Ativos</p>
                      <p className="mt-2 font-black text-slate-900">{Math.max(1, Math.round(deptMembers.length / 2))}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <Building2 size={14} /> Organização Ativa
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                    <Users size={14} /> Equipes alocadas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Department Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-[32px] bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h4 className="text-lg font-black text-slate-900">{editingDept ? 'Editar Departamento' : 'Novo Departamento'}</h4>
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-900">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveDepartment} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Nome do Departamento</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Engenharia, Produto, Financeiro"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Objetivos e escopo do departamento..."
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 h-24"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Gestor Responsável</label>
                <select
                  value={leadUid}
                  onChange={(e) => setLeadUid(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">Selecione o gestor...</option>
                  {memberList.map((m) => (
                    <option key={m.userUid} value={m.userUid}>
                      {m.userName || m.userEmail} ({m.cargo || 'Membro'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Health Score (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={healthScore}
                  onChange={(e) => setHealthScore(Number(e.target.value))}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-2xl bg-slate-950 px-6 py-3 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Departamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
