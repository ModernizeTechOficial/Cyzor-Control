import { useState } from 'react';
import { X, Package, Building2, AlignLeft, Check } from 'lucide-react';
import ModalContainer from './layout/ModalContainer';
import { FormGroup, FormLabel, FormInput, FormSelect } from './ui/FormComponents';

export default function NewProductModal({ isOpen, onClose, onSave, companies = [] }: { isOpen: boolean, onClose: () => void, onSave?: (prod: any) => void, companies?: any[] }) {
  const [formData, setFormData] = useState({
    name: '',
    companyId: '',
    desc: '',
    status: 'Planejamento'
  });

  const handleSave = () => {
    if (onSave && formData.name) {
      onSave({
        ...formData,
        companyId: formData.companyId ? Number(formData.companyId) : null
      });
      setFormData({ name: '', companyId: '', desc: '', status: 'Planejamento' });
    }
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Package size={14} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#111111]">Novo Produto</h3>
            <p className="text-[10px] font-medium text-[#64748B] mt-0.5">Adicione um novo produto ao ecossistema Cyzor</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X size={15} strokeWidth={2.5} />
        </button>
      </div>

      <div className="p-6 flex flex-col gap-5 text-left">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel required>Nome do Produto</FormLabel>
            <FormInput 
              placeholder="Ex: Cyzor V4" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
            />
          </FormGroup>

          <FormGroup>
            <FormLabel>Empresa Vinculada</FormLabel>
            <FormSelect 
              value={formData.companyId} 
              onChange={(e) => handleInputChange('companyId', e.target.value)}
            >
              <option value="">Nenhuma / Interno</option>
              {companies.map(c => (
                 <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </FormSelect>
          </FormGroup>
        </div>
        
        <FormGroup>
          <FormLabel>Descrição Curta</FormLabel>
          <FormInput 
            placeholder="Qual o objetivo primário deste produto?" 
            value={formData.desc} 
            onChange={(e) => handleInputChange('desc', e.target.value)} 
          />
        </FormGroup>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormGroup>
            <FormLabel>Status</FormLabel>
            <FormSelect 
              value={formData.status} 
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option value="Planejamento">Planejamento</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Beta">Beta</option>
              <option value="Produção">Produção</option>
            </FormSelect>
          </FormGroup>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0F172A05]">
          <button 
            onClick={onClose} 
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={!formData.name}
            className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>Salvar Produto</span>
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
