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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 mt-2">
        <div>
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="text-gray-900 shrink-0" size={24} />
            Usuários Globais da Plataforma
          </h1>
          <p className="text-sm text-gray-500 font-medium font-sans mt-1">Gestão, controle de acessos e atribuição de permissões administrativas a qualquer usuário.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-gray-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar usuários por nome ou email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-gray-100 focus:border-gray-300 transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-5 py-4">Usuário</th>
                <th className="px-5 py-4">Email</th>
                <th className="px-5 py-4">Cargo / Função</th>
                <th className="px-5 py-4">Plano Ativo</th>
                <th className="px-5 py-4">Status Admin</th>
                <th className="px-5 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum usuário cadastrado no sistema.</td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={u.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} 
                          alt={u.displayName || 'Sem nome'} 
                          className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0" 
                        />
                        <span className="font-semibold text-gray-900">{u.displayName || 'Sem nome'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 font-mono text-xs">{u.email}</td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-700">
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="px-2.5 py-1 rounded text-xs font-bold bg-[#f5f3ff] text-[#8b5cf6] uppercase tracking-wider">
                        {u.currentPlan || 'Pro'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {u.isPlatformAdmin ? (
                        <div className="flex items-center gap-1.5 text-[#0369a1] font-bold text-[10px] uppercase tracking-wider bg-[#f0f9ff] px-2.5 py-1 rounded-full w-max">
                          <ShieldCheck size={12} />
                          Admin Geral
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[10px] font-mono uppercase font-medium">Não</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(u.uid)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
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
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-xl overflow-hidden flex flex-col animate-in scale-in-95 duration-200 text-gray-900">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-900 flex items-center gap-2">
                <UserCheck className="text-gray-900" size={18} />
                Editar Usuário Core
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Nome do Usuário</label>
                <input 
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Email de Acesso</label>
                <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all font-medium font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Função / Cargo</label>
                  <input 
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all font-medium"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Plano SaaS</label>
                  <select 
                    value={formData.currentPlan}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPlan: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-100 transition-all font-medium"
                  >
                    <option value="Free">Free</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-gray-900 block uppercase tracking-widest">Administrador Geral</label>
                  <p className="text-[10px] text-gray-500 font-medium mt-0.5">Permite acesso total ao painel.</p>
                </div>
                <input 
                  type="checkbox"
                  checked={formData.isPlatformAdmin}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPlatformAdmin: e.target.checked }))}
                  className="w-4 h-4 text-gray-900 border-gray-300 bg-white rounded focus:ring-gray-900 cursor-pointer"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all shadow-sm"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98]"
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
