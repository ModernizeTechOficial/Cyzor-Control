import { useState, useEffect } from 'react';
import { X, Building2, Globe, FileDigit, Briefcase, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import ModalContainer from './layout/ModalContainer.tsx';
import { FormGroup, FormLabel, FormInput, FormSelect } from './ui/FormComponents';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erro: ${errorData.error || res.statusText}`);
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
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                {company ? 'Editar Cadastro de Empresa' : 'Novo Cadastro de Empresa'}
              </h3>
              <p className="text-[10px] font-medium text-[#64748B] mt-0.5">
                {company ? 'Atualize as informações da organização' : 'Registre uma nova organização no ecossistema'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Scrollable Section */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel required>Nome da Empresa</FormLabel>
              <FormInput 
                placeholder="Ex: Nexus Group" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Status Comercial</FormLabel>
              <FormSelect 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
                <option value="Em Risco">Em Risco</option>
              </FormSelect>
            </FormGroup>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel>Segmento / Setor</FormLabel>
              <FormInput 
                placeholder="Ex: Fintech, SaaS, E-commerce" 
                value={formData.industry}
                onChange={(e) => setFormData({...formData, industry: e.target.value})}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>CNPJ / Registro</FormLabel>
              <FormInput 
                placeholder="00.000.000/0000-00" 
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
              />
            </FormGroup>
          </div>
          
          <FormGroup>
            <FormLabel>Website</FormLabel>
            <FormInput 
              placeholder="https://www.empresa.com" 
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
            />
          </FormGroup>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#0F172A05]">
            <div>
              {company && (
                <button 
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider"
                >
                   <Trash2 size={12} /> Excluir Empresa
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                disabled={loading || !formData.name}
                className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? 'Salvando...' : (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    <span>{company ? 'Salvar Alterações' : 'Criar Empresa'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
    </ModalContainer>
  );
}
