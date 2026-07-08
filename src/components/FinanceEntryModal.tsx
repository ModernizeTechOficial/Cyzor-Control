import { useState, useEffect } from 'react';
import { X, Building2, Package, Tag, DollarSign, Calendar, FileText, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { safeToISOString } from '../lib/dateUtils';
import ModalContainer from './layout/ModalContainer.tsx';
import { FormGroup, FormLabel, FormInput, FormSelect } from './ui/FormComponents';

interface FinanceEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  entry?: any;
}

export default function FinanceEntryModal({ isOpen, onClose, onSuccess, entry }: FinanceEntryModalProps) {
  const { fetchWithAuth } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('RECEITA');
  const [status, setStatus] = useState('PENDENTE');
  const [category, setCategory] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (entry) {
        setDescription(entry.description || '');
        setAmount(entry.amount?.toString() || '');
        setType(entry.type || 'RECEITA');
        setStatus(entry.status || 'PENDENTE');
        setCategory(entry.category || '');
        setCompanyId(entry.companyId?.toString() || '');
        setProjectId(entry.projectId?.toString() || '');
        setIsRecurrent(entry.isRecurrent || false);
        setDueDate(entry.dueDate ? safeToISOString(entry.dueDate).split('T')[0] : '');
        setPaymentDate(entry.paymentDate ? safeToISOString(entry.paymentDate).split('T')[0] : '');
      } else {
        resetForm();
      }
    }
  }, [isOpen, entry]);

  const fetchData = async () => {
    try {
      const [resComp, resProj] = await Promise.all([
        fetchWithAuth('/api/companies'),
        fetchWithAuth('/api/projects')
      ]);
      if (resComp.ok) setCompanies(await resComp.json());
      if (resProj.ok) setProjects(await resProj.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    setLoading(true);
    try {
      const url = entry ? `/api/finance/${entry.id}` : '/api/finance';
      const method = entry ? 'PUT' : 'POST';
      
      const res = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          type,
          category,
          companyId: companyId ? Number(companyId) : null,
          projectId: projectId ? Number(projectId) : null,
          isRecurrent,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          paymentDate: paymentDate ? new Date(paymentDate).toISOString() : null,
          date: safeToISOString(entry?.date) || new Date().toISOString(),
          status
        })
      });
      if (res.ok) {
        onSuccess?.();
        if (!entry) resetForm();
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Erro ao salvar lançamento.');
      }
    } catch(err) {
      console.error(err);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!entry || !confirm('Deseja excluir este lançamento?')) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth(`/api/finance/${entry.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory('');
    setType('RECEITA');
    setStatus('PENDENTE');
    setCompanyId('');
    setProjectId('');
    setIsRecurrent(false);
    setDueDate('');
    setPaymentDate('');
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
        {/* Modal Header */}
        <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111]">
                {entry ? 'Editar Lançamento' : 'Novo Lançamento Financeiro'}
              </h3>
              <p className="text-[10px] font-medium text-[#64748B] mt-0.5">
                {entry ? 'Atualize as informações da transação' : 'Registre uma nova movimentação no caixa'}
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
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto flex flex-col gap-5 text-left">
          {/* Description */}
          <FormGroup>
            <FormLabel required>Descrição</FormLabel>
            <FormInput 
              required
              placeholder="Ex: Pagamento AWS / Consultoria Tech"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormGroup>
              <FormLabel required>Valor (R$)</FormLabel>
              <FormInput 
                type="number" 
                step="0.01" 
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </FormGroup>

            <FormGroup>
              <FormLabel>Tipo</FormLabel>
              <FormSelect value={type} onChange={(e) => setType(e.target.value)}>
                <option value="RECEITA">Receita (+)</option>
                <option value="DESPESA">Despesa (-)</option>
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Status</FormLabel>
              <FormSelect 
                value={status} 
                onChange={(e) => {
                  const val = e.target.value;
                  setStatus(val);
                  if (val === 'PAGO' && !paymentDate) {
                    setPaymentDate(new Date().toISOString().split('T')[0]);
                  }
                }}
              >
                <option value="PAGO">Pago</option>
                <option value="PENDENTE">Pendente</option>
                <option value="ATRASADO">Atrasado</option>
              </FormSelect>
            </FormGroup>
          </div>

          <FormGroup>
            <FormLabel>Categoria</FormLabel>
            <FormInput 
              placeholder="Ex: Infraestrutura, Salários, Freelance"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup>
              <FormLabel>Empresa Vinculada</FormLabel>
              <FormSelect value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">Nenhuma / Workspace Geral</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </FormSelect>
            </FormGroup>

            <FormGroup>
              <FormLabel>Projeto Vinculado</FormLabel>
              <FormSelect value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">Nenhum Projeto</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </FormSelect>
            </FormGroup>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 pt-4">
              <input 
                type="checkbox" 
                id="recurrent"
                checked={isRecurrent} 
                onChange={(e) => setIsRecurrent(e.target.checked)} 
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="recurrent" className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider cursor-pointer">Lançamento Recorrente</label>
            </div>

            <FormGroup>
              <FormLabel>Data de Vencimento</FormLabel>
              <FormInput 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormGroup>
          </div>

          {status === 'PAGO' && (
            <FormGroup>
              <FormLabel>Data de Pagamento</FormLabel>
              <FormInput 
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </FormGroup>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#0F172A05]">
            <div>
              {entry && (
                <button 
                  type="button" 
                  onClick={handleDelete} 
                  disabled={loading}
                  className="text-rose-500 hover:text-rose-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <Trash2 size={12} /> Excluir Lançamento
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
                disabled={loading || !description || !amount}
                className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5"
              >
                {loading ? 'Salvando...' : (
                  <>
                    <Check size={14} strokeWidth={2.5} />
                    <span>{entry ? 'Salvar Lançamento' : 'Registrar Lançamento'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
    </ModalContainer>
  );
}
