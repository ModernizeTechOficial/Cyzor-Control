import { useState, useEffect } from 'react';
import { X, Building2, Package, Tag, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { safeToISOString } from '../lib/dateUtils';

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
  const [category, setCategory] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [dueDate, setDueDate] = useState('');
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
        setCategory(entry.category || '');
        setCompanyId(entry.companyId?.toString() || '');
        setProjectId(entry.projectId?.toString() || '');
        setIsRecurrent(entry.isRecurrent || false);
        setDueDate(entry.dueDate ? safeToISOString(entry.dueDate).split('T')[0] : '');
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

  if (!isOpen) return null;

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
          date: safeToISOString(entry?.date) || new Date().toISOString(),
          status: entry?.status || 'PENDENTE'
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
    setCompanyId('');
    setProjectId('');
    setIsRecurrent(false);
    setDueDate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111111]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-t-[24px] sm:rounded-[30px] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
           <div className="flex items-center gap-3 sm:gap-4 text-left">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-md">
               <DollarSign size={18} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111111] tracking-tight">
                {entry ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-[#64748B]">
                {entry ? 'Atualize as informações da transação.' : 'Registre uma nova transação financeira.'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] text-[#64748B] transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pb-10 flex flex-col gap-5 sm:gap-6 overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[60vh]">
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Descrição</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
              <input value={description} onChange={e => setDescription(e.target.value)} type="text" className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium" placeholder="Ex: Pagamento AWS / Consultoria Tech" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Valor (R$)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
                <input value={amount} onChange={e => setAmount(e.target.value)} type="number" step="0.01" className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium" placeholder="0.00" />
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Tipo</label>
              <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium appearance-none">
                <option value="RECEITA">Receita (+)</option>
                <option value="DESPESA">Despesa (-)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Categoria</label>
            <div className="relative group">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
              <input value={category} onChange={e => setCategory(e.target.value)} type="text" className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium" placeholder="Ex: Infraestrutura, Salários, Freelance" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Empresa Vinculada</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
                <select value={companyId} onChange={e => setCompanyId(e.target.value)} className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium appearance-none">
                  <option value="">Nenhuma / Workspace Geral</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Projeto Vinculado</label>
              <div className="relative group">
                <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
                <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium appearance-none">
                  <option value="">Nenhum Projeto</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={isRecurrent} onChange={e => setIsRecurrent(e.target.checked)} className="w-5 h-5 rounded border-[#0F172A0F] text-[#111111] focus:ring-[#111111]" />
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B]">Lançamento Recorrente</label>
            </div>
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">Data de Vencimento</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} />
                <input value={dueDate} onChange={e => setDueDate(e.target.value)} type="date" className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium" />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mt-4 pb-4 sm:pb-0">
             <div className="w-full sm:w-auto text-left">
               {entry && (
                 <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider block py-2">
                   Excluir Lançamento
                 </button>
               )}
             </div>
             <div className="flex gap-3 w-full sm:w-auto">
               <button type="button" onClick={onClose} className="flex-1 sm:flex-initial px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#0F172A0F] transition-colors">Cancelar</button>
               <button type="submit" disabled={loading || !description || !amount} className="flex-1 sm:flex-initial px-8 py-3 rounded-[14px] text-sm font-bold text-[#FFFFFF] bg-[#111111] hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all disabled:opacity-50">
                 {loading ? 'Salvando...' : (entry ? 'Salvar' : 'Registrar')}
               </button>
             </div>
          </div>
        </form>
      </div>
    </div>
  );
}
