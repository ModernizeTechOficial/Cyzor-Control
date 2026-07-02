import { useState } from 'react';
import { X, Lightbulb, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import ModalContainer from './layout/ModalContainer.tsx';
import { FormGroup, FormLabel, FormInput } from './ui/FormComponents';

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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <ModalContainer isOpen={isOpen} onClose={onClose} maxWidth="max-w-xl">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#0F172A05] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Lightbulb size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#111111]">Nova Ideia</h3>
              <p className="text-[10px] font-medium text-[#64748B] mt-0.5">Capture um novo insight para validação estratégica</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 text-left">
          <FormGroup>
            <FormLabel required>Nome da Ideia</FormLabel>
            <FormInput 
              placeholder="Ex: Plataforma de Gestão MVP" 
              value={formData.name} 
              onChange={(e) => handleInputChange('name', e.target.value)} 
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Categoria / Descrição</FormLabel>
            <FormInput 
              placeholder="SaaS, Mobile, B2B..." 
              value={formData.categoria} 
              onChange={(e) => handleInputChange('categoria', e.target.value)} 
            />
          </FormGroup>

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
              className="px-5 py-2 text-xs font-bold text-white bg-[#111111] hover:bg-[#222222] rounded-xl shadow-sm hover:scale-[1.01] transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : (
                <>
                  <Check size={14} strokeWidth={2.5} />
                  <span>Salvar Ideia</span>
                </>
              )}
            </button>
          </div>
        </form>
    </ModalContainer>
  );
}
