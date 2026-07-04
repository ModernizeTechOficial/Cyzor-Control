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
    <div className="space-y-6 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2 mb-4">
        <h1 className="text-2xl font-medium text-gray-900 tracking-tight">
          Workspaces & SaaS Tenants
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white">
          <div className="flex-1 relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search workspaces by name or slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-gray-200 focus:border-gray-300 transition-all placeholder:text-gray-400 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Tenant / Empresa</th>
                <th className="px-6 py-4 font-medium">Slug Identificador</th>
                <th className="px-6 py-4 font-medium">Plano Ativo</th>
                <th className="px-6 py-4 font-medium">Criado em</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhum tenant cadastrado no sistema.</td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center font-bold uppercase shrink-0">
                          {tenant.name?.charAt(0) || 'E'}
                        </div>
                        <span className="font-semibold text-gray-900 tracking-tight">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-medium text-xs">{tenant.slug}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600">
                        {tenant.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500 font-medium text-xs">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(tenant)}
                          className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(tenant.id)}
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
          <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-xl overflow-hidden flex flex-col animate-in scale-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-sm font-semibold text-gray-900 tracking-tight flex items-center gap-2">
                <Building2 className="text-gray-500" size={18} />
                Editar Tenant Workspace
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50 transition-all"
              >
                <XCircle size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Nome do Tenant</label>
                <input 
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Slug Identificador</label>
                <input 
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest block">Plano SaaS</label>
                <select 
                  value={formData.plan}
                  onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-900 rounded-lg text-sm focus:ring-2 focus:ring-gray-200 transition-all font-medium"
                >
                  <option value="Free">Free</option>
                  <option value="Pro">Pro</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
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
