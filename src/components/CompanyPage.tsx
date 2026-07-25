import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import CompanyContent from './CompanyContent';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useQueryClient } from '@tanstack/react-query';

export default function CompanyPage() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const queryClient = useQueryClient();
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const companyId = globalFilters.companyId;

  useEffect(() => {
    if (!companyId) return;
    setIsLoading(true);
    fetchWithAuth(`/api/companies/${companyId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setCompany(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [companyId, fetchWithAuth]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['finance'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
  };

  const handleBack = () => {
    setGlobalFilters({ companyId: undefined });
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">Carregando dados da empresa...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
      <div className="flex flex-col">
        {company && (
          <div className="px-4 sm:px-6 lg:px-10 mt-6 mb-2">
            <button 
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-bold text-xs"
            >
              <ChevronLeft size={16} />
              <span>Voltar para Lista</span>
            </button>
          </div>
        )}
        {!company && (
          <div className="px-4 sm:px-6 lg:px-10 mt-6">
            <button 
              onClick={handleBack}
              className="px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-bold text-xs"
            >
              <ChevronLeft size={16} />
              <span>Voltar para Lista</span>
            </button>
          </div>
        )}
      </div>
      
      <div className="flex-1">
        <CompanyContent company={company} onSuccess={handleSuccess} onClose={handleBack} />
      </div>
    </div>
  );
}
