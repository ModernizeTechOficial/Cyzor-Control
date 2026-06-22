import { useState } from 'react';
import { X, Package, Building2, AlignLeft, Tags, LayoutList } from 'lucide-react';

export default function NewProductModal({ isOpen, onClose, onSave, companies = [] }: { isOpen: boolean, onClose: () => void, onSave?: (prod: any) => void, companies?: any[] }) {
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    desc: '',
    status: 'Planejamento'
  });

  if (!isOpen) return null;

  const handleSave = () => {
    if (onSave && formData.name) {
      onSave({
        ...formData,
        companyId: formData.companyId ? Number(formData.companyId) : undefined
      });
      setFormData({ name: '', companyId: '', desc: '', status: 'Planejamento' });
    }
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#111111]/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-t-[24px] sm:rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
          <div className="flex items-center gap-3 sm:gap-4 text-left">
            <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-md">
               <Package size={20} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-[#111111] tracking-tight">Novo Produto</h2>
              <p className="text-xs sm:text-sm font-medium text-[#64748B]">Adicione um novo produto ao ecossistema.</p>
            </div>
          </div>
          
          <button onClick={onClose} className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] text-[#64748B] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 pb-10 flex flex-col gap-6 overflow-y-auto max-h-[calc(90vh-140px)] sm:max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="NOME DO PRODUTO" Icon={Package} placeholder="Ex: Cyzor V4" value={formData.name} onChange={(v) => handleInputChange('name', v)} />
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">EMPRESA VINCULADA</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
                <select 
                  value={formData.companyId} 
                  onChange={(e) => handleInputChange('companyId', e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)] appearance-none"
                >
                  <option value="">Nenhuma / Interno</option>
                  {companies.map(c => (
                     <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1">
            <InputField label="DESCRIÇÃO CURTA" Icon={AlignLeft} placeholder="Qual o objetivo primário deste produto?" value={formData.desc} onChange={(v) => handleInputChange('desc', v)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">STATUS</label>
              <select 
                value={formData.status} 
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              >
                <option value="Planejamento">Planejamento</option>
                <option value="Desenvolvimento">Desenvolvimento</option>
                <option value="Beta">Beta</option>
                <option value="Produção">Produção</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-4 sm:py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-end gap-3 rounded-b-none sm:rounded-b-[30px]">
          <button onClick={onClose} className="px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] bg-[#FFFFFF] hover:bg-[#FAFAFA] border border-[#0F172A0F] transition-colors">Cancelar</button>
          <button onClick={handleSave} className="px-8 py-3 rounded-[14px] text-sm font-bold text-[#FFFFFF] bg-[#111111] hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.15)] transition-all">Salvar Produto</button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, Icon, placeholder, value, onChange }: { label: string, Icon: any, placeholder: string, value: string, onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#111111] transition-colors" size={18} strokeWidth={2.5} />
        <input 
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        />
      </div>
    </div>
  );
}
