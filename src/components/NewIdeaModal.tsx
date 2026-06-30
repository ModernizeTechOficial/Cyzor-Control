import { useState } from 'react';
import { X, Lightbulb, AlignLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import ModalContainer from './layout/ModalContainer.tsx';

export default function NewIdeaModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess?: () => void }) {
  const { fetchWithAuth } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    categoria: '',
    empresa: '',
    potencial: '',
    complexidade: '',
    score: '',
    status: 'capturadas'
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!formData.name) return;
    setLoading(true);
    try {
      const res = await fetchWithAuth('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.name,
          description: formData.categoria, // using temporary map
          status: formData.status
          // Add proper mappings when schema scales
        })
      });
      if (res.ok) {
        onSuccess?.();
        setFormData({ name: '', categoria: '', empresa: '', potencial: '', complexidade: '', score: '', status: 'capturadas' });
        onClose();
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
               <Lightbulb size={20} className="text-[#FFFFFF]" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-[#111111] tracking-tight">Nova Ideia</h2>
              <p className="text-sm font-medium text-[#64748B]">Adicione uma nova ideia ao banco para validação.</p>
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
        <div className="p-8 pb-10 flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6">
            <InputField label="NOME DA IDEIA" Icon={Lightbulb} placeholder="Ex: Plataforma de Gestão MVP" value={formData.name} onChange={(v) => handleInputChange('name', v)} />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField label="CATEGORIA / DESCRIÇÃO" Icon={AlignLeft} placeholder="SaaS, Mobile, B2B..." value={formData.categoria} onChange={(v) => handleInputChange('categoria', v)} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-end gap-3 rounded-b-[24px]">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] border border-[#0F172A0F] bg-[#FFFFFF] hover:bg-[#FAFAFA] transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || !formData.name}
            className="px-8 py-3 rounded-[14px] text-sm font-bold text-[#FFFFFF] bg-[#111111] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Ideia'}
          </button>
        </div>
        
    </ModalContainer>
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
            className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 pl-12 pr-4 outline-none focus:border-[#111111]/30 hover:border-[#0F172A0F]-dark transition-all text-[#111111] font-medium placeholder:text-[#64748B]/50 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        />
      </div>
    </div>
  );
}
