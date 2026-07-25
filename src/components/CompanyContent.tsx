import { useState, useEffect } from 'react';
import { X, Building2, Globe, FileDigit, Briefcase, Trash2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { FormGroup, FormLabel, FormInput, FormSelect } from './ui/FormComponents';
import { Vision360 } from './common/Vision360';
import { VisualIdentityTab } from './common/VisualIdentityTab';
import { EntityHero } from './common/EntityHero';

interface CompanyContentProps {
  company?: any;
  onSuccess?: () => void;
  onClose: () => void;
}

export default function CompanyContent({ company, onSuccess, onClose }: CompanyContentProps) {
  const { fetchWithAuth } = useAuth();
  const [activeModalTab, setActiveModalTab] = useState<'cadastro' | 'identidade_visual' | 'visao_360'>('cadastro');
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    cnpj: '',
    website: '',
    linkedin: '',
    instagram: '',
    facebook: '',
    status: 'Ativo',
    logoUrl: '',
    coverUrl: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || '',
        industry: company.industry || '',
        cnpj: company.cnpj || '',
        website: company.website || '',
        linkedin: company.linkedin || '',
        instagram: company.instagram || '',
        facebook: company.facebook || '',
        status: company.status || 'Ativo',
        logoUrl: company.logoUrl || '',
        coverUrl: company.coverUrl || ''
      });
      setActiveModalTab('cadastro');
    } else {
      setFormData({ name: '', industry: '', cnpj: '', website: '', linkedin: '', instagram: '', facebook: '', status: 'Ativo', logoUrl: '', coverUrl: '' });
      setActiveModalTab('cadastro');
    }
  }, [company]);

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
    <>
        {!company ? (
          <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Building2 size={14} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#111111]">Novo Cadastro de Empresa</h3>
                <p className="text-[10px] font-medium text-[#64748B] mt-0.5">Registre uma nova organização no ecossistema</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
              <X size={15} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col flex-shrink-0">
            <EntityHero
              entityType="company"
              name={formData.name}
              description={formData.industry ? `Empresa atuante no segmento de ${formData.industry}.` : 'Parceiro comercial registrado no ecossistema Cyzor Control.'}
              logoUrl={formData.logoUrl}
              coverUrl={formData.coverUrl}
              breadcrumbs={['Perspectiva Corporativa', '360°', formData.name]}
              badges={[
                { label: formData.status || 'Ativo', variant: 'secondary' },
                { label: formData.industry || 'Sem Setor', variant: 'neutral' },
                { label: formData.cnpj || 'Sem CNPJ', variant: 'neutral' }
              ]}
              actions={
                <button onClick={onClose} className="w-10 h-10 rounded-2xl bg-white/10 text-white/80 hover:bg-white/20 hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm" title="Fechar">
                  <X size={20} strokeWidth={2.5} />
                </button>
              }
            />

            <div className="flex px-8 gap-5 overflow-x-auto bg-[#111111] border-t border-white/5 scrollbar-none">
              <button onClick={() => setActiveModalTab('cadastro')} className={`py-4 px-1 border-b-2 text-xs font-bold transition-all ${activeModalTab === 'cadastro' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white hover:border-white/20'}`}>
                Dados Cadastrais
              </button>
              <button onClick={() => setActiveModalTab('identidade_visual')} className={`py-4 px-1 border-b-2 text-xs font-bold transition-all ${activeModalTab === 'identidade_visual' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white hover:border-white/20'}`}>
                Identidade Visual
              </button>
              <button onClick={() => setActiveModalTab('visao_360')} className={`py-4 px-1 border-b-2 text-xs font-bold transition-all ${activeModalTab === 'visao_360' ? 'border-white text-white' : 'border-transparent text-white/50 hover:text-white hover:border-white/20'}`}>
                Visão 360°
              </button>
            </div>
          </div>
        )}

        {company && activeModalTab === 'visao_360' ? (
          <div className="h-[60vh] overflow-y-auto">
            <Vision360 entityType="company" entityId={company.id} entityName={company.name} entityData={company} />
          </div>
        ) : company && activeModalTab === 'identidade_visual' ? (
          <div className="h-[60vh] overflow-y-auto flex flex-col justify-between">
            <VisualIdentityTab entityName={formData.name} logoUrl={formData.logoUrl} coverUrl={formData.coverUrl} onChangeLogo={(url) => setFormData(prev => ({ ...prev, logoUrl: url }))} onChangeCover={(url) => setFormData(prev => ({ ...prev, coverUrl: url }))} />
            <div className="p-6 flex items-center justify-end gap-3 border-t border-[#0F172A05]">
              <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancelar</button>
              <button type="button" onClick={handleSubmit} disabled={loading} className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
                {loading ? 'Salvando...' : (<><Check size={14} strokeWidth={2.5} /><span>Salvar Alterações</span></>)}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-5 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup>
                <FormLabel required>Nome da Empresa</FormLabel>
                <FormInput placeholder="Ex: Nexus Group" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </FormGroup>

              <FormGroup>
                <FormLabel>Status Comercial</FormLabel>
                <FormSelect value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Em Risco">Em Risco</option>
                </FormSelect>
              </FormGroup>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormGroup>
                <FormLabel>Segmento / Setor</FormLabel>
                <FormInput placeholder="Ex: Fintech, SaaS, E-commerce" value={formData.industry} onChange={(e) => setFormData({...formData, industry: e.target.value})} />
              </FormGroup>

              <FormGroup>
                <FormLabel>CNPJ / Registro</FormLabel>
                <FormInput placeholder="00.000.000/0000-00" value={formData.cnpj} onChange={(e) => setFormData({...formData, cnpj: e.target.value})} />
              </FormGroup>
            </div>
            
            <FormGroup>
              <FormLabel>Website</FormLabel>
              <FormInput placeholder="https://www.empresa.com" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} />
            </FormGroup>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormGroup>
                <FormLabel>LinkedIn</FormLabel>
                <FormInput placeholder="https://linkedin.com/..." value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Instagram</FormLabel>
                <FormInput placeholder="https://instagram.com/..." value={formData.instagram} onChange={(e) => setFormData({...formData, instagram: e.target.value})} />
              </FormGroup>
              <FormGroup>
                <FormLabel>Facebook</FormLabel>
                <FormInput placeholder="https://facebook.com/..." value={formData.facebook} onChange={(e) => setFormData({...formData, facebook: e.target.value})} />
              </FormGroup>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#0F172A05]">
              <div>
                {company && (
                  <button type="button" onClick={handleDelete} disabled={loading} className="text-rose-500 hover:text-rose-700 text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                     <Trash2 size={12} /> Excluir Empresa
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={loading || !formData.name} className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5">
                  {loading ? 'Salvando...' : (<><Check size={14} strokeWidth={2.5} /><span>{company ? 'Salvar Alterações' : 'Criar Empresa'}</span></>)}
                </button>
              </div>
            </div>
          </form>
        )}
    </>
  );
}
