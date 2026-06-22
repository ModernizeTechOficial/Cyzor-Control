import { useState } from 'react';
import { 
  X, 
  Building2, 
  Package, 
  GitBranch, 
  Terminal, 
  Server, 
  GitMerge, 
  DollarSign, 
  FileText, 
  Briefcase, 
  Users, 
  Shield, 
  BookOpen, 
  Settings, 
  Landmark, 
  Heart, 
  Laptop, 
  Workflow, 
  Play, 
  Cloud,
  Layers
} from 'lucide-react';

interface IconOption {
  id: string;
  label: string;
  icon: any;
}

export const SELECTABLE_ICONS: IconOption[] = [
  { id: 'Building2', label: 'Empresas', icon: Building2 },
  { id: 'Package', label: 'Produtos', icon: Package },
  { id: 'GitBranch', label: 'Projetos', icon: GitBranch },
  { id: 'Terminal', label: 'APIs', icon: Terminal },
  { id: 'Server', label: 'Infraestrutura', icon: Server },
  { id: 'GitMerge', label: 'Processos', icon: GitMerge },
  { id: 'DollarSign', label: 'Comercial', icon: DollarSign },
  { id: 'FileText', label: 'Documentos', icon: FileText },
  { id: 'Briefcase', label: 'Negócios', icon: Briefcase },
  { id: 'Users', label: 'Equipe', icon: Users },
  { id: 'Shield', label: 'Segurança', icon: Shield },
  { id: 'BookOpen', label: 'Educação', icon: BookOpen },
  { id: 'Settings', label: 'Configuração', icon: Settings },
  { id: 'Landmark', label: 'Jurídico', icon: Landmark },
  { id: 'Heart', label: 'Suporte', icon: Heart },
  { id: 'Laptop', label: 'Tecnologia', icon: Laptop },
  { id: 'Workflow', label: 'Fluxo', icon: Workflow },
  { id: 'Play', label: 'Mídia', icon: Play },
  { id: 'Cloud', label: 'Nuvem', icon: Cloud },
  { id: 'Layers', label: 'Geral', icon: Layers },
];

interface NewCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCategory: (categoryName: string, iconId: string) => void;
}

export default function NewCategoryModal({ isOpen, onClose, onAddCategory }: NewCategoryModalProps) {
  const [categoryName, setCategoryName] = useState('');
  const [selectedIconId, setSelectedIconId] = useState('FileText');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      setError('Por favor, informe o nome da categoria.');
      return;
    }
    setError('');
    onAddCategory(categoryName.trim(), selectedIconId);
    setCategoryName('');
    setSelectedIconId('FileText');
    onClose();
  };

  const SelectedIconComponent = SELECTABLE_ICONS.find(i => i.id === selectedIconId)?.icon || FileText;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111111]/25 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full max-w-2xl rounded-[30px] border border-[#0F172A0F] shadow-[0_20px_60px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-[#0F172A0F] flex items-center justify-between bg-[#FFFFFF] relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/10 to-transparent"></div>
          
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#111111] flex items-center justify-center flex-shrink-0 shadow-[0_4px_12px_rgba(0,0,0,0.15)] text-white">
               {/* Show dynamic active selection visual in upper header panel */}
               <SelectedIconComponent size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-[#111111] tracking-tight">Nova Categoria</h2>
              <p className="text-sm font-medium text-[#64748B]">Personalize e separe suas centrais de documentações.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-[14px] flex items-center justify-center hover:bg-[#FAFAFA] border border-transparent hover:border-[#0F172A0F] text-[#64748B] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 pb-10 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
          {/* Label / Input for category name */}
          <div className="flex flex-col gap-2 w-full">
            <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">NOME DA CATEGORIA</label>
            <div className="relative group">
              <input 
                  type="text"
                  placeholder="Ex: Treinamentos, Compliance, Marketing..."
                  value={categoryName}
                  onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-4 px-5 outline-none focus:border-[#111111]/30 transition-all text-[#111111] font-semibold placeholder:text-[#64748B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
              />
            </div>
            {error && <p className="text-xs font-semibold text-red-500 mt-1 px-1">{error}</p>}
          </div>

          {/* Grid Selection For Icons */}
          <div className="flex flex-col gap-3">
            <label className="text-[11px] font-bold tracking-widest uppercase text-[#64748B] px-1">SELECIONE UM ÍCONE RELEVANTE</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3 p-1">
              {SELECTABLE_ICONS.map((option) => {
                const IconComponent = option.icon;
                const isSelected = selectedIconId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSelectedIconId(option.id)}
                    className={`aspect-square p-4 rounded-[18px] border transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isSelected 
                        ? 'bg-[#111111] border-[#111111] text-white shadow-md' 
                        : 'bg-[#FFFFFF] border-[#0F172A0F] text-[#64748B] hover:border-[#111111]/20 hover:bg-[#FAFAFA]'
                    }`}
                    title={option.label}
                  >
                    <IconComponent size={20} strokeWidth={isSelected ? 2.5 : 2} />
                    <span className="text-[9px] font-bold uppercase tracking-wide truncate max-w-full text-center">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#0F172A0F] bg-[#FAFAFA] flex justify-end gap-3 rounded-b-[30px]">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-[14px] text-sm font-bold text-[#111111] border border-[#0F172A0F] bg-[#FFFFFF] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            className="px-8 py-3 rounded-[14px] text-sm font-bold text-[#FFFFFF] bg-[#111111] shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-black hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all cursor-pointer"
          >
            Adicionar Categoria
          </button>
        </div>
        
      </div>
    </div>
  );
}
