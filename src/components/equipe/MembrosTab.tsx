import { useState, useEffect } from 'react';
import { 
  Users, 
  MoreHorizontal, 
  Shield, 
  Trash2, 
  UserPlus, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  X,
  Filter,
  Download,
  Send,
  Layers3,
  Building2,
  Briefcase,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ModalContainer from '../layout/ModalContainer';
import { Vision360 } from '../common/Vision360';
import MemberDetailsDrawer from './MemberDetailsDrawer';

export default function MembrosTab() {
  const { fetchWithAuth } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMemberFor360, setSelectedMemberFor360] = useState<any>(null);
  const [activeModalTab, setActiveModalTab] = useState<'dados' | 'visao_360'>('dados');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newInvite, setNewInvite] = useState({ email: '', role: 'MEMBER' });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [filters, setFilters] = useState({ team: 'all', department: 'all', workspace: 'all', role: 'all', status: 'all' });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workspace/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleUpdateRole = async (memberId: number, newRole: string) => {
    try {
      const res = await fetchWithAuth(`/api/workspace/members/${memberId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvite.email) return;
    try {
      setSendingInvite(true);
      const res = await fetchWithAuth('/api/workspace/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newInvite)
      });
      if (res.ok) {
        setShowInviteModal(false);
        setNewInvite({ email: '', role: 'MEMBER' });
        alert('Convite enviado com sucesso!');
        fetchMembers();
      } else {
        const err = await res.json();
        alert(`Erro ao enviar convite: ${err.error || 'Erro desconhecido'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar o convite.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;
    try {
      const res = await fetchWithAuth(`/api/workspace/members/${memberId}`, {
        method: 'DELETE'
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.userName?.toLowerCase().includes(search.toLowerCase()) ||
      m.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      m.cargo?.toLowerCase().includes(search.toLowerCase());

    const matchesTeam = filters.team === 'all' || (m.team || m.equipe || 'Sem equipe') === filters.team;
    const matchesDepartment = filters.department === 'all' || (m.department || m.cargo || 'General') === filters.department;
    const matchesWorkspace = filters.workspace === 'all' || (m.workspace || 'Workspace principal') === filters.workspace;
    const matchesRole = filters.role === 'all' || (m.role || 'MEMBER') === filters.role;
    const matchesStatus = filters.status === 'all' || (m.status || 'Ativo') === filters.status;

    return matchesSearch && matchesTeam && matchesDepartment && matchesWorkspace && matchesRole && matchesStatus;
  });

  const teamOptions = Array.from(new Set(members.map((m) => m.team || m.equipe || 'Sem equipe')));
  const departmentOptions = Array.from(new Set(members.map((m) => m.department || m.cargo || 'General')));
  const workspaceOptions = Array.from(new Set(members.map((m) => m.workspace || 'Workspace principal')));
  const roleOptions = Array.from(new Set(members.map((m) => m.role || 'MEMBER')));

  return (
    <div className="flex flex-col gap-6">
      {/* Table Controls */}
      <div className="flex flex-col gap-4 bg-white border border-[#0F172A0A] rounded-[24px] p-4 shadow-[0_4px_20px_rgb(0,0,0,0.01)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            <input 
              type="text" 
              placeholder="Buscar por nome, e-mail ou cargo..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FAFAFB] border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-black/5 transition-all outline-none text-[#111111]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><SlidersHorizontal size={14} /> Filtros</button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Download size={14} /> Exportar</button>
            <button className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Send size={14} /> Lembrete</button>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-neutral-800 transition-all shadow-sm"
            >
              <UserPlus size={16} /> Convidar Membro
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">
          <select value={filters.team} onChange={(e) => setFilters((prev) => ({ ...prev, team: e.target.value }))} className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700">
            <option value="all">Equipe</option>
            {teamOptions.map((team) => <option key={team} value={team}>{team}</option>)}
          </select>
          <select value={filters.department} onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))} className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700">
            <option value="all">Departamento</option>
            {departmentOptions.map((department) => <option key={department} value={department}>{department}</option>)}
          </select>
          <select value={filters.workspace} onChange={(e) => setFilters((prev) => ({ ...prev, workspace: e.target.value }))} className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700">
            <option value="all">Workspace</option>
            {workspaceOptions.map((workspace) => <option key={workspace} value={workspace}>{workspace}</option>)}
          </select>
          <select value={filters.role} onChange={(e) => setFilters((prev) => ({ ...prev, role: e.target.value }))} className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700">
            <option value="all">Role</option>
            {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <select value={filters.status} onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))} className="rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] px-3 py-2 text-sm font-bold text-slate-700">
            <option value="all">Status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
          <Layers3 size={14} /> Bulk actions
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Mover equipe</button>
          <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Trocar gestor</button>
          <button className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">Alterar permissões</button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white border border-[#0F172A0A] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-[#0F172A0A]">
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">
                  <input type="checkbox" checked={selectedMembers.length > 0 && selectedMembers.length === filteredMembers.length} onChange={() => {
                    if (selectedMembers.length === filteredMembers.length) setSelectedMembers([]);
                    else setSelectedMembers(filteredMembers.map((member) => member.id));
                  }} className="h-4 w-4 rounded border-slate-300" />
                </th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Membro</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Cargo / Função</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Papel</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest">Acesso</th>
                <th className="px-8 py-5 text-[11px] font-bold text-[#64748B] uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#0F172A08]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#64748B] font-medium">Carregando membros...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-12 text-center text-sm text-[#64748B] font-medium">Nenhum membro encontrado.</td>
                </tr>
              ) : filteredMembers.map((member) => (
                <tr 
                  key={member.id} 
                  className="hover:bg-[#FAFAFB]/50 transition-colors group cursor-pointer"
                  onClick={() => { setSelectedMemberFor360(member); setActiveModalTab('dados'); }}
                >
                  <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedMembers.includes(member.id)} onChange={(e) => {
                      if (e.target.checked) setSelectedMembers((prev) => [...prev, member.id]);
                      else setSelectedMembers((prev) => prev.filter((id) => id !== member.id));
                    }} className="h-4 w-4 rounded border-slate-300" />
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#FAFAFB] border border-[#0F172A0A] overflow-hidden flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm flex-shrink-0">
                        {member.userPhoto ? (
                          <img src={member.userPhoto} alt={member.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          member.userName?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-[#111111] group-hover:text-indigo-600 transition-colors truncate">{member.userName}</span>
                        <span className="text-xs text-[#64748B] font-medium truncate">{member.userEmail}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-sm font-bold text-[#111111]">{member.cargo || 'Colaborador'}</span>
                  </td>
                  <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={member.role === 'OWNER' ? 'text-indigo-500' : member.role === 'ADMIN' ? 'text-amber-500' : 'text-[#94A3B8]'} />
                      <select 
                        value={member.role}
                        onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                        disabled={member.role === 'OWNER'}
                        className="bg-transparent border-none text-sm font-bold text-[#111111] focus:ring-0 cursor-pointer p-0 pr-8"
                      >
                        <option value="OWNER">Proprietário</option>
                        <option value="ADMIN">Administrador</option>
                        <option value="MANAGER">Gerente</option>
                        <option value="DEVELOPER">Desenvolvedor</option>
                        <option value="DESIGNER">Designer</option>
                        <option value="FINANCE">Financeiro</option>
                        <option value="VIEWER">Visualizador</option>
                        <option value="MEMBER">Membro</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {member.status === 'Ativo' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {member.status}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-[#64748B]">
                      <Clock size={14} className="text-[#94A3B8]" />
                      {new Date(member.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={member.role === 'OWNER'}
                        className="p-2 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Remover Membro"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button className="p-2 rounded-lg text-[#64748B] hover:text-[#111111] hover:bg-[#F1F5F9] transition-all">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <MemberDetailsDrawer member={selectedMemberFor360} isOpen={!!selectedMemberFor360} onClose={() => setSelectedMemberFor360(null)} />

      {/* Member 360 & Details Modal */}
      {selectedMemberFor360 && (
        <ModalContainer 
          isOpen={!!selectedMemberFor360} 
          onClose={() => setSelectedMemberFor360(null)} 
          maxWidth={activeModalTab === 'visao_360' ? 'max-w-4xl' : 'max-w-xl'}
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between bg-[#FAFAFA]/50">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-[#0F172A0A] overflow-hidden flex items-center justify-center text-[#111111] font-bold text-sm shadow-sm flex-shrink-0">
                {selectedMemberFor360.userPhoto ? (
                  <img src={selectedMemberFor360.userPhoto} alt={selectedMemberFor360.userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  selectedMemberFor360.userName?.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">{selectedMemberFor360.userName}</h3>
                <p className="text-[10px] font-medium text-[#64748B] mt-0.5">{selectedMemberFor360.userEmail}</p>
              </div>
            </div>
            <button 
              onClick={() => setSelectedMemberFor360(null)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>

          {/* Modal Tabs */}
          <div className="flex px-6 border-b border-[#0F172A0F] bg-[#FAFAFA]/50 gap-6">
            <button 
              onClick={() => setActiveModalTab('dados')}
              className={`py-3 px-1 border-b-2 text-xs font-bold transition-all ${
                activeModalTab === 'dados' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'
              }`}
            >
              Perfil & Atribuições
            </button>
            <button 
              onClick={() => setActiveModalTab('visao_360')}
              className={`py-3 px-1 border-b-2 text-xs font-bold transition-all ${
                activeModalTab === 'visao_360' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'
              }`}
            >
              Visão 360°
            </button>
          </div>

          {activeModalTab === 'visao_360' ? (
            <div className="h-[60vh] overflow-y-auto">
              <Vision360 entityType="team" entityId={selectedMemberFor360.id} entityName={selectedMemberFor360.userName} entityData={selectedMemberFor360} />
            </div>
          ) : (
            <div className="p-6 flex flex-col gap-6 text-left bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Cargo / Função</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedMemberFor360.cargo || 'Colaborador'}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status na Plataforma</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedMemberFor360.status}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Papel de Acesso</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{selectedMemberFor360.role}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Data de Ingresso</label>
                  <p className="text-sm font-semibold text-slate-800 mt-1">{new Date(selectedMemberFor360.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#0F172A05] flex justify-end">
                <button 
                  onClick={() => setSelectedMemberFor360(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Fechar Perfil
                </button>
              </div>
            </div>
          )}
        </ModalContainer>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={() => setShowInviteModal(false)}
        >
          <div 
            className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.15)] animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 pb-0 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-lg">
                <UserPlus size={24} />
              </div>
              <button 
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-[#64748B]"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="p-8 pt-6 flex flex-col gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#111111] tracking-tight">Convidar para a Equipe</h3>
                <p className="text-sm text-[#64748B] font-medium">O novo membro receberá um e-mail com o link de acesso</p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">E-mail do Convidado</label>
                  <input 
                    type="email" 
                    required
                    placeholder="exemplo@email.com"
                    value={newInvite.email}
                    onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest px-1">Papel / Permissões</label>
                  <select 
                    value={newInvite.role}
                    onChange={(e) => setNewInvite({ ...newInvite, role: e.target.value })}
                    className="w-full bg-[#FAFAFB] border border-[#0F172A0A] rounded-2xl p-4 text-sm font-bold focus:ring-2 focus:ring-black/5 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="MEMBER">Membro Padrão</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="MANAGER">Gerente de Projeto</option>
                    <option value="DEVELOPER">Desenvolvedor</option>
                    <option value="DESIGNER">Designer</option>
                    <option value="FINANCE">Financeiro</option>
                    <option value="VIEWER">Apenas Leitura</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={sendingInvite}
                className="w-full py-4 rounded-2xl bg-black text-white text-sm font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-black/10"
              >
                {sendingInvite ? 'Enviando...' : 'Enviar Convite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
