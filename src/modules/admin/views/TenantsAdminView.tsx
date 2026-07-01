import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Building2, Search, Filter, Edit3, Trash2, XCircle, AlertTriangle, Server } from 'lucide-react';

export default function TenantsAdminView() {
  const { fetchWithAuth } = useAuth();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    plan: 'Pro',
    status: 'Active'
  });

  const loadTenants = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/admin/tenants');
      if (res.ok) {
        const data = await res.json();
        setTenants(data);
      }
    } catch (error) {
      console.error("Failed to load tenants", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [fetchWithAuth]);

  const handleOpenEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setFormData({
      name: tenant.name || '',
      slug: tenant.slug || '',
      plan: tenant.plan || 'Pro',
      status: tenant.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("ATENÇÃO: Você tem certeza que deseja excluir esta empresa/tenant? Todos os dados vinculados, como faturamento e dados operacionais de usuários, serão excluídos permanentemente do Cloud SQL.")) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/tenants/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTenants(prev => prev.filter(t => t.id !== id));
      } else {
        alert("Erro ao excluir tenant.");
      }
    } catch (error) {
      console.error("Delete tenant error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const res = await fetchWithAuth(`/api/admin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await loadTenants();
        setIsModalOpen(false);
      } else {
        alert("Erro ao atualizar tenant.");
      }
    } catch (error) {
      console.error("Submit tenant error:", error);
    }
  };

  const filteredTenants = tenants.filter(t => 
    t.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#18181B] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Server className="text-indigo-400 shrink-0" size={24} />
            Workspaces & SaaS Tenants
          </h1>
          <p className="text-sm text-zinc-400 font-medium">Controle de instâncias isoladas de banco de dados e planos de faturamento SaaS.</p>
        </div>
      </div>

      <div className="bg-[#0D0D10]/95 border border-[#18181B] rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-[#18181B] flex items-center gap-4 bg-[#121215]/50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar workspaces por nome ou slug..." 
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
                <th className="px-6 py-4.5">Tenant / Empresa</th>
                <th className="px-6 py-4.5">Slug Identificador</th>
                <th className="px-6 py-4.5">Plano Ativo</th>
                <th className="px-6 py-4.5">Criado em</th>
                <th className="px-6 py-4.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#18181B]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-medium">Nenhum tenant cadastrado no sistema.</td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-[#121215]/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold uppercase shrink-0 border border-indigo-500/20">
                          {tenant.name?.charAt(0) || 'E'}
                        </div>
                        <span className="font-bold text-zinc-100">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">{tenant.slug}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/20 uppercase tracking-widest">
                        {tenant.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(tenant)}
                          className="p-1.5 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 border border-[#1E1E22] bg-[#121215]/80 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tenant.id)}
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
                <Building2 className="text-indigo-400" size={18} />
                Editar Tenant Workspace
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
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Nome do Tenant</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Slug Identificador</label>
                <input 
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Plano SaaS</label>
                <select 
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[#121215] border border-[#1E1E22] text-zinc-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all font-medium"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
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
