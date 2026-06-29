import { Trash2, Archive, Copy, Download, X } from 'lucide-react';

interface CompanyActionBarProps {
  selectedCount: number;
  onClear: () => void;
}

export default function CompanyActionBar({ selectedCount, onClear }: CompanyActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 fade-in duration-300">
      <div className="bg-[#111111] text-white px-4 py-3 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center gap-6 border border-white/10">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-xs font-bold">
            {selectedCount}
          </span>
          <span className="text-sm font-semibold text-white/90">
            {selectedCount === 1 ? 'empresa selecionada' : 'empresas selecionadas'}
          </span>
        </div>
        
        <div className="w-[1px] h-6 bg-white/10" />
        
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold">
            <Archive size={16} className="text-white/70" />
            <span className="hidden sm:inline">Arquivar</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold">
            <Copy size={16} className="text-white/70" />
            <span className="hidden sm:inline">Duplicar</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors text-sm font-semibold">
            <Download size={16} className="text-white/70" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-400 transition-colors text-sm font-semibold">
            <Trash2 size={16} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>

        <div className="w-[1px] h-6 bg-white/10" />

        <button 
          onClick={onClear}
          className="p-2 rounded-xl hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
