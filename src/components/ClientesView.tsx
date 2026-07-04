import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Filter, Mail, Phone, Building2, Briefcase, 
  Trash2, Edit3, X, Check, CheckCircle2, AlertCircle, Sparkles, Tag, ChevronRight, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCompanies, useProjects, useFinance } from '../hooks/useCyzorQueries';
import { SkeletonDashboard } from './common/skeletons/SkeletonDashboard';
import { useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import StandardHeader from './layout/StandardHeader';
import MetricCard from './MetricCard';
import { Vision360 } from './common/Vision360';

import { useNavigation } from "../context/NavigationContext";

export default function ClientesView() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { fetchWithAuth, activeWorkspace } = useAuth();
  
  // States
  const [clients, setClients] = useState<any[]>([]);
  const { data: companiesData, isLoading: isCompaniesLoading } = useCompanies();
  const { data: projectsData } = useProjects();
  const { data: financeData } = useFinance();

  const [companies, setCompanies] = useState<any[]>([]);
  useEffect(() => { if (companiesData) setCompanies(companiesData); }, [companiesData]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyFilter, setCompanyFilter] = useState(globalFilters.companyId ? globalFilters.companyId.toString() : 'ALL');

  useEffect(() => {
    if (globalFilters.companyId) {
      setCompanyFilter(globalFilters.companyId.toString());
    } else {
      setCompanyFilter('ALL');
    }
  }, [globalFilters.companyId]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'cadastro' | 'visao_360'>('cadastro');
  const [editingClient, setEditingClient] = useState<any>(null);

  useEffect(() => {
    if (globalFilters.clientId && clients && clients.length > 0) {
      const p = clients.find((proj: any) => proj.id.toString() === globalFilters.clientId.toString());
      if (p) {
        setEditingClient(p);
        setIsModalOpen(true);
        setActiveModalTab('visao_360');
      }
    }
  }, [globalFilters.clientId, clients]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    companyId: '',
    status: 'Ativo',
    role: '',
    notes: '',
    tagsInput: ''
  });
  
  // Notification states
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const triggerToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const [clientsRes, companiesRes] = await Promise.all([
        fetchWithAuth('/api/clients'),
        fetchWithAuth('/api/companies')
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      }
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error("Error fetching clients data:", error);
      triggerToast('error', 'Ocorreu um erro ao carregar os dados de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeWorkspace]);

  // Open modal for Create
  const handleNewClient = () => {
    setEditingClient(null);
    if (globalFilters.clientId) setGlobalFilters({ ...globalFilters, clientId: undefined });
    setActiveModalTab('cadastro');
    setFormData({
      name: '',
      email: '',
      phone: '',
      companyId: '',
      status: 'Ativo',
      role: '',
      notes: '',
      tagsInput: ''
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditClient = (client: any) => {
    setEditingClient(client);
    setGlobalFilters({ ...globalFilters, clientId: client.id });
    setActiveModalTab('cadastro');
    setFormData({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      companyId: client.companyId ? String(client.companyId) : '',
      status: client.status || 'Ativo',
      role: client.role || '',
      notes: client.notes || '',
      tagsInput: Array.isArray(client.tags) ? client.tags.join(', ') : ''
    });
    setIsModalOpen(true);
  };

  // Delete Client
  const handleDeleteClient = async (id: number) => {
    if (!confirm('Deseja realmente excluir este cliente permanentemente?')) return;
    try {
      const res = await fetchWithAuth(`/api/clients/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerToast('success', 'Cliente excluído com sucesso!');
        fetchData();
      } else {
        triggerToast('error', 'Falha ao excluir o cliente.');
      }
    } catch (error) {
      console.error(error);
      triggerToast('error', 'Erro ao processar exclusão.');
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      triggerToast('error', 'O nome do cliente é obrigatório.');
      return;
    }

    // Process tags
    const tags = formData.tagsInput
      ? formData.tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0)
      : [];

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      companyId: formData.companyId ? Number(formData.companyId) : null,
      status: formData.status,
      role: formData.role,
      notes: formData.notes,
      tags
    };

    try {
      const url = editingClient ? `/api/clients/${editingClient.id}` : '/api/clients';
      const method = editingClient ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        triggerToast('success', editingClient ? 'Cliente atualizado com sucesso!' : 'Novo cliente cadastrado com sucesso!');
        setIsModalOpen(false);
        fetchData();
      } else {
        triggerToast('error', 'Ocorreu um erro ao salvar o cliente.');
      }
    } catch (error) {
      console.error(error);
      triggerToast('error', 'Erro interno de servidor.');
    }
  };

  // Filtering Logic
  const filteredClients = clients.filter(c => {
    const matchesSearch = 
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesCompany = companyFilter === 'ALL' || String(c.companyId) === companyFilter;

    return matchesSearch && matchesStatus && matchesCompany;
  });

  // KPI Calculations
  const totalClientsCount = clients.length;
  const activeClientsCount = clients.filter(c => c.status === 'Ativo').length;
  const leadsCount = clients.filter(c => c.status === 'Lead').length;
  const inactiveClientsCount = clients.filter(c => c.status === 'Inativo').length;

  if (isCompaniesLoading) {
    return <SkeletonDashboard />;
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-10">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-bold ${
              toast.type === 'success' 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                : 'bg-rose-50 border-rose-100 text-rose-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="text-emerald-500" size={18} /> : <AlertCircle className="text-rose-500" size={18} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <StandardHeader 
        title="Gestão de Clientes"
        subtitle="Gerencie contatos, leads e os principais tomadores de decisão das contas corporativas."
        actions={[
          {
            label: 'Novo Cliente',
            icon: UserPlus,
            onClick: handleNewClient,
            variant: 'primary'
          }
        ]}
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total de Clientes"
          value={totalClientsCount}
          icon={Users}
          color="text-indigo-600"
          bg="bg-indigo-50/50"
        />
        <MetricCard 
          title="Clientes Ativos"
          value={activeClientsCount}
          trend="+5%"
          trendUp={true}
          icon={CheckCircle2}
          color="text-emerald-600"
          bg="bg-emerald-50/50"
        />
        <MetricCard 
          title="Novos Leads"
          value={leadsCount}
          trend="+12"
          trendUp={true}
          icon={Sparkles}
          color="text-amber-600"
          bg="bg-amber-50/50"
        />
        <MetricCard 
          title="Atendimento"
          value="98%"
          trend="Estável"
          trendUp={true}
          icon={Phone}
          color="text-blue-600"
          bg="bg-blue-50/50"
        />
      </div>

      {/* Main Container - List & Filters */}
      <div className="bg-white border border-[#0F172A08] rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.01)] p-6">
        
        {/* Filters Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status:</span>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs font-bold text-[#111111] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">Todos</option>
                <option value="Ativo">Ativo</option>
                <option value="Lead">Lead</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {/* Company Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Empresa:</span>
              <select 
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="text-xs font-bold text-[#111111] bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-indigo-500 max-w-[200px]"
              >
                <option value="ALL">Todas as Empresas</option>
                {companies.map(comp => (
                  <option key={comp.id} value={String(comp.id)}>{comp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Clients Table / Content State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-[#64748B] font-bold">Buscando dados de clientes no sistema...</span>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center gap-4 border border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Users size={24} />
            </div>
            <div className="max-w-xs">
              <h3 className="text-sm font-bold text-[#111111]">Nenhum cliente encontrado</h3>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Não localizamos nenhum cliente que corresponda aos filtros aplicados. Crie um novo cliente para começar.
              </p>
            </div>
            <button 
              onClick={handleNewClient}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Novo Cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                  <th className="pb-3.5 font-bold">Cliente / Cargo</th>
                  <th className="pb-3.5 font-bold">Empresa</th>
                  <th className="pb-3.5 font-bold">Contato</th>
                  <th className="pb-3.5 font-bold">Status</th>
                  <th className="pb-3.5 font-bold">Tags</th>
                  <th className="pb-3.5 font-bold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {filteredClients.map((client) => {
                  const initial = client.name ? client.name.charAt(0).toUpperCase() : 'C';
                  
                  return (
                    <tr 
                      key={client.id} 
                      className="hover:bg-slate-50/40 group transition-colors cursor-pointer"
                      onClick={() => handleEditClient(client)}
                    >
                      {/* Name & Role */}
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {initial}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#111111] group-hover:text-indigo-600 transition-colors">{client.name}</span>
                            <span className="text-[10px] text-[#64748B] font-medium mt-0.5 flex items-center gap-1">
                              <Briefcase size={10} />
                              {client.role || 'Não especificado'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={12} className="text-slate-400" />
                          <span className="text-xs font-bold text-[#111111]">{client.companyName || 'Avulso / Sem Empresa'}</span>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-4 pr-3">
                        <div className="flex flex-col gap-1">
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#64748B] hover:text-indigo-600">
                              <Mail size={10} />
                              <span>{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-[#64748B]">
                              <Phone size={10} />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="py-4 pr-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                          client.status === 'Ativo' 
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                            : client.status === 'Lead'
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-100'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            client.status === 'Ativo' 
                              ? 'bg-emerald-500' 
                              : client.status === 'Lead'
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`} />
                          {client.status || 'Ativo'}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-4 pr-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {Array.isArray(client.tags) && client.tags.map((tag: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              <Tag size={8} />
                              {tag}
                            </span>
                          ))}
                          {(!Array.isArray(client.tags) || client.tags.length === 0) && (
                            <span className="text-[10px] text-slate-300 font-medium italic">Nenhuma</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClient(client)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={12} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={12} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation/Editing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-[#111111]/30 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className={`bg-white border border-[#0F172A0F] rounded-[24px] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] transition-all duration-300 ${
                editingClient && activeModalTab === 'visao_360' ? 'max-w-4xl w-full' : 'max-w-xl w-full'
              }`}
            >
              
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {editingClient ? <Edit3 size={14} strokeWidth={2.5} /> : <UserPlus size={14} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111111]">
                      {editingClient ? 'Cadastro de Cliente' : 'Novo Cadastro de Cliente'}
                    </h3>
                    <p className="text-[10px] font-medium text-[#64748B] mt-0.5">
                      {editingClient ? 'Gerencie as informações e visualize o módulo 360' : 'Registre um novo tomador de decisão no sistema'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X size={15} strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Level Tab Selector */}
              {editingClient && (
                <div className="flex px-6 border-b border-[#0F172A0F] bg-[#FAFAFA]/50 gap-6">
                  <button 
                    onClick={() => setActiveModalTab('cadastro')}
                    className={`py-3 px-1 border-b-2 text-xs font-bold transition-all ${
                      activeModalTab === 'cadastro' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'
                    }`}
                  >
                    Cadastro do Cliente
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
              )}

              {editingClient && activeModalTab === 'visao_360' ? (
                <div className="h-[60vh] overflow-y-auto">
                  <Vision360 entityType="client" entityId={editingClient.id} entityName={editingClient.name} entityData={editingClient} />
                </div>
              ) : (
                /* Form Scrollable Section */
                <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-left">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nome Completo *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">E-mail Corporativo</label>
                    <input 
                      type="email" 
                      placeholder="joao@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                    />
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Telefone / WhatsApp</label>
                    <input 
                      type="text" 
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Role */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Cargo / Função</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Diretor de Tecnologia, CTO, Comprador"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                    />
                  </div>

                  {/* Status */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status Comercial</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40 font-bold"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Lead">Lead / Prospect</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>

                {/* Company Link */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Empresa Relacionada</label>
                  <select 
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                  >
                    <option value="">Nenhuma empresa (Cliente Individual / Avulso)</option>
                    {companies.map(comp => (
                      <option key={comp.id} value={String(comp.id)}>{comp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tags (separadas por vírgula)</label>
                  <input 
                    type="text" 
                    placeholder="Ex: tomador-decisao, vip, tech-startup"
                    value={formData.tagsInput}
                    onChange={(e) => setFormData({ ...formData, tagsInput: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Anotações Internas</label>
                  <textarea 
                    rows={3}
                    placeholder="Adicione notas sobre o cliente, preferências, histórico de reuniões ou observações comerciais..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-colors bg-slate-50/40 resize-none"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F172A05]">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Check size={14} strokeWidth={2.5} />
                    <span>Salvar Cliente</span>
                  </button>
                </div>
              </form>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
