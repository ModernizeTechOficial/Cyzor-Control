import { useState, useEffect } from 'react';
import { X, GitBranch, Building2, User, Flag, Calendar, Sparkles, DollarSign, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { safeToISOString } from '../lib/dateUtils';
import { showSuccess, showError } from '../lib/alerts';
import ModalContainer from './layout/ModalContainer';
import { FormGroup, FormLabel, FormInput, FormSelect } from './ui/FormComponents';

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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GitBranch size={14} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Novo Projeto</h3>
            <p className="text-[10px] font-medium text-[#64748B] mt-0.5">Inicie um novo ciclo operacional estratégico</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5 text-left">
        {/* SaaS Warning for Free Plan */}
        {currentPlan === 'free' && (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
            <Sparkles size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-bold text-[#111111] uppercase tracking-wider">Limite do Plano Free</span>
              <span className="text-[10px] font-medium text-[#64748B] leading-relaxed">
                Você está usando a versão de Teste. Recursos avançados de IA e White Label estão desativados.
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel required>Nome do Projeto</FormLabel>
            <FormInput 
              required
              placeholder="Ex: Redesign Dashboard" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Empresa</FormLabel>
            <FormSelect 
                value={formData.companyId}
                onChange={(e) => setFormData({...formData, companyId: e.target.value})}
            >
              <option value="">Selecionar Empresa</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </FormSelect>
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>Prioridade</FormLabel>
            <FormSelect 
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
            >
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </FormSelect>
          </FormGroup>

          <FormGroup>
            <FormLabel>Prazo</FormLabel>
            <FormInput 
              type="date" 
              value={formData.dueDate}
              onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
            />
          </FormGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>Faturamento Pretendido (R$)</FormLabel>
            <FormInput 
              type="number" 
              placeholder="Ex: 5000.00" 
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Coordenador / Owner</FormLabel>
            <FormInput 
              placeholder="Nome do responsável..." 
              value={formData.owner}
              onChange={(e) => setFormData({...formData, owner: e.target.value})}
            />
          </FormGroup>
        </div>

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
            disabled={loading || !formData.name}
            className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
          >
            {loading ? 'Criando...' : (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>Criar Projeto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ModalContainer>
  );
}
