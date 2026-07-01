import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Users, Search, Filter, Edit3, Trash2, ShieldCheck, XCircle, UserCheck } from 'lucide-react';

export default function UsersAdminView() {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'User',
    isPlatformAdmin: false,
    currentPlan: 'Pro'
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to load users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [fetchWithAuth]);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setFormData({
      displayName: user.displayName || '',
      email: user.email || '',
      role: user.role || 'User',
      isPlatformAdmin: !!user.isPlatformAdmin,
      currentPlan: user.currentPlan || 'Pro'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (uid: string) => {
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir este usuário? Isso removerá o registro do usuário e revogará seu acesso à plataforma.")) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/users/${uid}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.uid !== uid));
      } else {
        alert("Erro ao excluir usuário.");
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    try {
      const res = await fetchWithAuth(`/api/admin/users/${selectedUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await loadUsers();
        setIsModalOpen(false);
      } else {
        alert("Erro ao atualizar usuário.");
      }
    } catch (error) {
      console.error("Submit user error:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#18181B] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="text-indigo-400 shrink-0" size={24} />
            Usuários Globais da Plataforma
          </h1>
          <p className="text-sm text-zinc-400 font-medium font-sans">Gestão, controle de acessos e atribuição de permissões administrativas a qualquer usuário.</p>
        </div>
      </div>

      <div className="bg-[#0D0D10]/95 border border-[#18181B] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#18181B] flex items-center gap-4 bg-[#121215]/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar usuários por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all placeholder:text-zinc-500 font-medium font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-zinc-400 uppercase bg-[#121215]/80 border-b border-[#18181B] font-bold font-mono tracking-wider">
              <tr>
                <th className="px-6 py-4.5">Usuário</th>
                <th className="px-6 py-4.5">Email</th>
                <th className="px-6 py-4.5">Cargo / Função</th>
                <th className="px-6 py-4.5">Plano Ativo</th>
                <th className="px-6 py-4.5">Status Admin</th>
                <th className="px-6 py-4.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181B]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 font-medium">Nenhum usuário cadastrado no sistema.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-[#121215]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} 
                          alt={u.displayName || 'Sem nome'} 
                          className="w-8 h-8 rounded-full bg-zinc-800 border border-[#1E1E22] shrink-0" 
                        />
                        <span className="font-bold text-zinc-100">{u.displayName || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-zinc-800 text-zinc-300 border border-[#1E1E22] tracking-wider">
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                        {u.currentPlan || 'Pro'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.isPlatformAdmin ? (
                        <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[9px] uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full w-max border border-indigo-500/20">
                          <ShieldCheck size={12} />
                          Admin Geral
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-[10px] font-mono uppercase">Não</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-[#1E1E22] bg-[#121215]/80 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.uid)}
                          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-[#1E1E22] bg-[#121215]/80 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#0D0D10] rounded-3xl w-full max-w-md border border-[#1E1E22] shadow-2xl overflow-hidden flex flex-col animate-in scale-in-95 duration-200 text-zinc-100">
            <div className="p-6 border-b border-[#18181B] flex items-center justify-between bg-[#121215]/50">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <UserCheck className="text-indigo-400" size={18} />
                Editar Usuário Core
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nome do Usuário</label>
                <input 
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email de Acesso</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Função / Cargo</label>
                  <input 
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Plano SaaS</label>
                  <select 
                    value={formData.currentPlan}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPlan: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="bg-indigo-500/5 border border-indigo-500/10 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-zinc-200 block uppercase tracking-wider font-mono">Administrador Geral</label>
                  <p className="text-[10px] text-zinc-400 font-medium">Permite acesso total ao painel administrativo da plataforma.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.isPlatformAdmin}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPlatformAdmin: e.target.checked }))}
                  className="w-5 h-5 text-indigo-600 border-[#1E1E22] bg-[#121215] rounded focus:ring-indigo-500/20 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#18181B]">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#1E1E22] rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-[0.98]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
