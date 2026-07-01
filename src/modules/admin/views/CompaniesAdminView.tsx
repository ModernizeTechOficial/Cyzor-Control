import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext.tsx';
import { Briefcase, Search, Filter, Plus, Edit3, Trash2, Globe, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function CompaniesAdminView() {
  const { fetchWithAuth } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    industry: '',
    size: '',
    website: '',
    status: 'Ativo',
    workspaceId: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [compRes, wsRes] = await Promise.all([
        fetchWithAuth('/api/admin/companies'),
        fetchWithAuth('/api/workspaces') // Fetch workspaces to let admins assign workspace during creation
      ]);

      if (compRes.ok) {
        const compData = await compRes.json();
        setCompanies(compData);
      }
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setWorkspaces(wsData.workspaces || []);
      }
    } catch (error) {
      console.error("Failed to load global companies data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [fetchWithAuth]);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormData({
      name: '',
      cnpj: '',
      industry: '',
      size: '',
      website: '',
      status: 'Ativo',
      workspaceId: workspaces[0]?.id?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (company: any) => {
    setModalMode('edit');
    setSelectedCompany(company);
    setFormData({
      name: company.name || '',
      cnpj: company.cnpj || '',
      industry: company.industry || '',
      size: company.size || '',
      website: company.website || '',
      status: company.status || 'Ativo',
      workspaceId: company.workspaceId?.toString() || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta empresa? Esta ação é irreversível e excluirá todos os dados vinculados.")) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/admin/companies/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCompanies(prev => prev.filter(c => c.id !== id));
      } else {
        alert("Erro ao excluir empresa.");
      }
    } catch (error) {
      console.error("Delete company error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      const payload = {
        ...formData,
        workspaceId: formData.workspaceId ? parseInt(formData.workspaceId) : undefined
      };

      if (modalMode === 'create') {
        const res = await fetchWithAuth('/api/admin/companies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await loadData();
          setIsModalOpen(false);
        } else {
          alert("Erro ao criar empresa.");
        }
      } else {
        const res = await fetchWithAuth(`/api/admin/companies/${selectedCompany.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          await loadData();
          setIsModalOpen(false);
        } else {
          alert("Erro ao atualizar empresa.");
        }
      }
    } catch (error) {
      console.error("Form submit error:", error);
    }
  };

  // Filter Logic
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.cnpj?.includes(searchTerm) || 
                          c.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter !== 'ALL') {
      const currentStatus = c.status?.toUpperCase() || 'ATIVO';
      if (statusFilter === 'ACTIVE' && currentStatus !== 'ATIVO' && currentStatus !== 'ACTIVE') matchesStatus = false;
      if (statusFilter === 'INACTIVE' && currentStatus !== 'INATIVO' && currentStatus !== 'INACTIVE') matchesStatus = false;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Empresas Globais</h1>
          <p className="text-sm text-gray-500 font-medium">Gerencie as contas de empresas clientes cadastradas em qualquer Workspace.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          Nova Empresa
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-4 bg-gray-50/50">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nome, CNPJ ou setor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-gray-600"
            >
              <option value="ALL">Todos os Status</option>
              <option value="ACTIVE">Ativo</option>
              <option value="INACTIVE">Inativo</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100 font-bold">
              <tr>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4">CNPJ</th>
                <th className="px-6 py-4">Setor</th>
                <th className="px-6 py-4">Workspace / Tenant</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredCompanies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">Nenhuma empresa encontrada na base global.</td>
                </tr>
              ) : (
                filteredCompanies.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold uppercase shrink-0 border border-indigo-100">
                          <Briefcase size={16} />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900 block">{c.name}</span>
                          {c.website && (
                            <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-500 hover:underline flex items-center gap-1 mt-0.5">
                              <Globe size={10} />
                              {c.website}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">{c.cnpj || 'Não informado'}</td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{c.industry || 'Tecnologia'}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-medium text-gray-800 block text-xs">{c.workspaceName || 'Sem Workspace'}</span>
                        <span className="text-[10px] text-gray-400 font-mono font-medium block">{c.tenantName || 'Sem Tenant'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {c.status === 'Ativo' || c.status === 'ACTIVE' ? (
                        <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-full w-max border border-emerald-100">
                          <CheckCircle size={12} /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-full w-max border border-red-100">
                          <XCircle size={12} /> Inativo
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg border border-gray-100 shadow-2xl overflow-hidden flex flex-col animate-in scale-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="text-indigo-600" size={20} />
                {modalMode === 'create' ? 'Cadastrar Nova Empresa' : 'Editar Detalhes da Empresa'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-all"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[80vh]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Nome da Empresa</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: ACME Corp"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">CNPJ</label>
                  <input 
                    type="text"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Setor de Atuação</label>
                  <input 
                    type="text"
                    placeholder="Ex: Tecnologia, Finanças"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Porte (Tamanho)</label>
                  <input 
                    type="text"
                    placeholder="Ex: 50-100 colaboradores"
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Website</label>
                  <input 
                    type="text"
                    placeholder="Ex: acme.com"
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              {modalMode === 'create' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Associar ao Workspace</label>
                  <select 
                    value={formData.workspaceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, workspaceId: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-gray-700"
                  >
                    {workspaces.map(ws => (
                      <option key={ws.id} value={ws.id}>{ws.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all font-medium text-gray-700"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all"
                >
                  {modalMode === 'create' ? 'Salvar Empresa' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
