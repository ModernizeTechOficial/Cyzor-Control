import React from 'react';
import { Building2, X, Info } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useCompanies } from '../../hooks/useCyzorQueries';
import { motion, AnimatePresence } from 'motion/react';

interface ContextBannerProps {
  currentView?: string;
}

export default function ContextBanner({ currentView }: ContextBannerProps) {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { data: companies } = useCompanies();

  const companyId = globalFilters.companyId;
  
  // Hide on empresas view as it has its own 360 context header
  if (currentView === 'empresas') return null;

  // Use useEffect-like logic or just find it if data is available
  const company = companyId && companies 
    ? companies.find((c: any) => c.id.toString() === companyId.toString()) 
    : null;

  const handleClearContext = () => {
    // Clear the company context and related sub-filters
    setGlobalFilters({ 
      ...globalFilters, 
      companyId: undefined,
      projectId: undefined,
      productId: undefined,
      clientId: undefined,
      documentId: undefined,
      ideaId: undefined
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <AnimatePresence>
      {company && (
        <motion.div 
          initial={{ height: 0, opacity: 0, y: -20 }}
          animate={{ height: 'auto', opacity: 1, y: 0 }}
          exit={{ height: 0, opacity: 0, y: -20 }}
          className="overflow-hidden"
        >
          <div className="bg-[#111111] text-white px-4 py-3 rounded-2xl flex items-center justify-between shadow-xl shadow-black/20 border border-white/10 mb-6 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                {company.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt={company.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-1 bg-white" 
                  />
                ) : (
                  <span className="text-white font-bold text-sm">
                    {getInitials(company.name)}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] leading-none">Contexto Empresarial</span>
                  <div className="w-1 h-1 rounded-full bg-blue-500/50 animate-pulse" />
                </div>
                <span className="text-lg font-display font-black leading-none tracking-tight">{company.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[11px] font-bold text-white/50 uppercase tracking-wider">
                <Info size={14} className="text-blue-400/50" />
                Filtro Global Ativo
              </div>
              <button 
                onClick={handleClearContext}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-[11px] font-black uppercase tracking-[0.1em] border border-white/5 hover:border-white/20"
              >
                <span>Limpar Filtros</span>
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
