import { useState, useEffect } from 'react';
import { X, Building2, Globe, Mail, FileDigit, Briefcase, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export default function CompanyModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  company
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onSuccess?: () => void,
  company?: any
}) {
  const { fetchWithAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    cnpj: '',
    website: '',
    status: 'Ativo'
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        status: company.status || 'Ativo'
      });
    } else {
      setFormData({ name: '', industry: '', cnpj: '', website: '', status: 'Ativo' });
    }
  }, [company, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name) return;
    setLoading(true);
    try {
      const url = company ? `/api/companies/${company.id}` : '/api/companies';
      const method = company ? 'PUT' : 'POST';
      
      const res = await fetchWithAuth(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!company || !confirm('Tem certeza que deseja excluir esta empresa?')) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/companies/${company.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111111]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-t-[24px] sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
          
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
               <Building2 size={20} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111111] tracking-tight">
                {company ? 'Editar Empresa' : 'Nova Empresa'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#64748B]">
                {company ? 'Atualize as informações da organização.' : 'Adicione uma nova organização ao ecossistema CYZOR.'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] border border-transparent hover:border-[#0F172A0F] text-[#64748B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 pb-10 flex flex-col gap-6 overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="NOME DA EMPRESA" 
              Icon={Building2} 
              placeholder="Ex: Nexus Group" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">STATUS</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-bold"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Em Risco">Em Risco</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="SEGMENTO / SETOR" 
              Icon={Briefcase} 
              placeholder="Ex: Fintech, SaaS, E-commerce" 
              value={formData.industry}
              onChange={(e) => setFormData({...formData, industry: e.target.value})}
            />
            <InputField 
              label="CNPJ / REGISTRO" 
              Icon={FileDigit} 
              placeholder="00.000.000/0000-00" 
              value={formData.cnpj}
              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="WEBSITE" 
              Icon={Globe} 
              placeholder="https://www.empresa.com" 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-between items-center rounded-b-none sm:rounded-b-[30px]">
          <div>
            {company && (
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 uppercase tracking-wider"
              >
                 <Trash2 size={14} /> Excluir Empresa
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] border border-[#0F172A0F] bg-[#FFFFFF] hover:bg-[#FAFAFA] transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSubmit}
              disabled={loading || !formData.name}
              className="px-8 py-3 rounded-[14px] text-sm font-bold text-[#FFFFFF] bg-[#111111] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (company ? 'Salvar Alterações' : 'Criar Empresa')}
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function InputField({ label, Icon, placeholder, value, onChange }: { label: string, Icon: any, placeholder: string, value: string, onChange: (e: any) => void }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
        <input 
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        />
      </div>
    </div>
  );
}
