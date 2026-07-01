import { useState, useEffect } from 'react';
import { X, GitBranch, Building2, User, Flag, Calendar, Sparkles, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { safeToISOString } from '../lib/dateUtils';
import { showSuccess, showError } from '../lib/alerts';

export default function NewProjectModal({ isOpen, onClose, onSuccess, initialStatus }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void, initialStatus?: string }) {
  const { fetchWithAuth, user, dbUser } = useAuth();
  const currentPlan = dbUser?.currentPlan || 'free';
  
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    priority: 'Média',
    dueDate: '',
    budget: '',
    owner: user?.displayName || user?.email || 'Sem dono'
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen]);

  const fetchCompanies = async () => {
    try {
      const res = await fetchWithAuth('/api/companies');
      if (res.ok) {
        setCompanies(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusName = (columnId: string) => {
    if (columnId === 'backlog') return 'Backlog';
    if (columnId === 'planejamento') return 'Planejamento';
    if (columnId === 'desenvolvimento') return 'Em Andamento';
    if (columnId === 'testes') return 'Testes';
    if (columnId === 'homologacao') return 'Homologacao';
    if (columnId === 'producao') return 'Producao';
    if (columnId === 'concluido') return 'Concluido';
    return 'Planejamento';
  };

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.name) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          priority: formData.priority,
          dueDate: safeToISOString(formData.dueDate),
          budget: formData.budget || '0',
          owner: formData.owner,
          companyId: formData.companyId ? Number(formData.companyId) : null,
          status: initialStatus ? getStatusName(initialStatus) : 'Planejamento'
        })
      });
      if (res.ok) {
        onSuccess?.();
        onClose();
        setFormData({ name: '', companyId: '', priority: 'Média', dueDate: '', budget: '', owner: user?.displayName || user?.email || 'Sem dono' });
        showSuccess('Projeto criado com sucesso!');
      } else {
        showError('Erro ao criar projeto.');
      }
    } catch(err) {
      console.error(err);
      showError('Falha ao conectar.');
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
               <GitBranch size={20} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111111] tracking-tight">Novo Projeto</h2>
              <p className="text-xs sm:text-sm font-medium text-[#64748B]">Inicie um novo projeto e vincule a uma empresa.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] border border-transparent hover:border-[#0F172A0F] text-[#64748B] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* SaaS Warning for Free Plan */}
        {currentPlan === 'free' && (
          <div className="mx-6 sm:mx-8 mt-4 sm:mt-6 p-4 bg-[#64748B]/5 border border-[#0F172A0F] rounded-[16px] flex items-start gap-3">
            <Sparkles size={16} className="text-[#111111] mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-0.5 text-left">
              <span className="text-xs font-bold text-[#111111]">Limite operacional do Plano Free</span>
              <span className="text-[11px] font-semibold text-[#64748B] leading-relaxed">Você está usando a versão de Teste. Recursos avançados de IA e White Label estão desativados.</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 sm:p-8 pb-10 flex flex-col gap-6 overflow-y-auto max-h-[calc(90vh-170px)] sm:max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="NOME DO PROJETO" 
              Icon={GitBranch} 
              placeholder="Ex: Redesign Dashboard" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">EMPRESA</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
                <select 
                    value={formData.companyId}
                    onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                    className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer appearance-none"
                >
                  <option value="">Selecionar Empresa</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField 
              label="PRIORIDADE" 
              Icon={Flag} 
              placeholder="Alta, Média ou Baixa" 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            />
            <InputField 
              label="PRAZO" 
              Icon={Calendar} 
              placeholder="DD/MM/AAAA" 
              type="date" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
            <InputField 
              label="FATURAMENTO PRETENDIDO (R$)" 
              Icon={DollarSign} 
              placeholder="Ex: 5000.00" 
              type="number" 
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
            <InputField 
              label="COORDENADOR / OWNER" 
              Icon={User} 
              placeholder="Nome do responsável..." 
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-end gap-3 rounded-b-none sm:rounded-b-[30px]">
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
            {loading ? 'Criando...' : 'Criar Projeto'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

function InputField({ label, Icon, placeholder, type = "text", value, onChange }: { label: string, Icon: any, placeholder: string, type?: string, value: string, onChange: (e: any) => void }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
        <input 
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)] cursor-pointer"
        />
      </div>
    </div>
  );
}
