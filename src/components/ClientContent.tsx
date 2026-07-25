import { useState, useEffect } from 'react';
import { X, UserPlus, Edit3, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { Vision360 } from './common/Vision360';
import { useQueryClient } from '@tanstack/react-query';

interface ClientContentProps {
  client?: any;
  companies: any[];
  onSuccess?: () => void;
  onClose: () => void;
}

export default function ClientContent({ client, companies, onSuccess, onClose }: ClientContentProps) {
  const { fetchWithAuth } = useAuth();
  const { setGlobalFilters } = useNavigation();
  const [activeModalTab, setActiveModalTab] = useState<'cadastro' | 'visao_360'>('cadastro');
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

  useEffect(() => {
    if (client) {
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
      setActiveModalTab('cadastro');
    } else {
      setFormData({ name: '', email: '', phone: '', companyId: '', status: 'Ativo', role: '', notes: '', tagsInput: '' });
      setActiveModalTab('cadastro');
    }
  }, [client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('O nome do cliente é obrigatório.');
      return;
    }

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
      const url = client ? `/api/clients/${client.id}` : '/api/clients';
      const method = client ? 'PUT' : 'POST';

      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        onSuccess?.();
        onClose();
      } else {
        alert('Ocorreu um erro ao salvar o cliente.');
      }
    } catch (error) {
      console.error(error);
      alert('Erro interno de servidor.');
    }
  };

  return (
    <>
      {/* Modal Level Tab Selector */}
      {client && (
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

      {client && activeModalTab === 'visao_360' ? (
        <div className="h-[60vh] overflow-y-auto">
          <Vision360 entityType="client" entityId={client.id} entityName={client.name} entityData={client} />
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
              onClick={onClose}
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
    </>
  );
}
