import { Building2, ChevronRight, Download, Plus, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface CompanyHeaderProps {
  onNewCompany: () => void;
}

export default function CompanyHeader({ onNewCompany }: CompanyHeaderProps) {
  const { activeWorkspace } = useAuth();

  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white border border-[#0F172A08] p-6 sm:p-8 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.01)] relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#111111]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="flex flex-col gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[#64748B]">
          <span className="hover:text-[#111111] cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-[#111111]">Empresas</span>
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-[#111111] tracking-tight mb-2 flex items-center gap-3">
            Empresas
            {activeWorkspace && (
              <span className="text-xs font-semibold px-3 py-1 bg-[#FAFAFA] border border-[#0F172A08] rounded-full text-[#64748B] tracking-normal">
                {activeWorkspace.name}
              </span>
            )}
          </h1>
          <p className="text-[#64748B] text-base font-medium max-w-xl leading-relaxed">
            Gerencie todas as empresas, projetos, clientes e indicadores em um único lugar.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-white hover:border-[#0F172A15] hover:shadow-sm transition-all">
          <Upload size={16} />
          <span className="hidden sm:inline">Importar</span>
        </button>
        <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-[#FAFAFA] border border-[#0F172A08] text-[#111111] font-bold text-xs uppercase tracking-wider hover:bg-white hover:border-[#0F172A15] hover:shadow-sm transition-all">
          <Download size={16} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
        <button 
          onClick={onNewCompany}
          className="flex-2 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#111111] border border-[#111111] text-white font-bold text-xs uppercase tracking-wider hover:bg-black hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
        >
          <Plus size={16} />
          <span>Nova Empresa</span>
        </button>
      </div>
    </div>
  );
}
