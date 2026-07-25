import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import ClientContent from './ClientContent';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useQueryClient } from '@tanstack/react-query';

export default function ClientPage() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const queryClient = useQueryClient();
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  const clientId = globalFilters.clientId;

  useEffect(() => {
    if (!clientId || clientId === 'new') {
      setClient(null);
      setIsLoading(false);
      fetchWithAuth('/api/companies')
        .then(res => res.ok ? res.json() : [])
        .then(data => setCompanies(data))
        .catch(() => setCompanies([]));
      return;
    }
    setIsLoading(true);
    Promise.all([
      fetchWithAuth(`/api/clients/${clientId}`),
      fetchWithAuth('/api/companies')
    ])
      .then(async ([clientRes, companiesRes]) => {
        if (clientRes.ok) setClient(await clientRes.json());
        if (companiesRes.ok) setCompanies(await companiesRes.json());
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [clientId, fetchWithAuth]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['companies'] });
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['finance'] });
  };

  const handleBack = () => {
    setGlobalFilters({ clientId: undefined });
    window.history.back();
  };

  if (isLoading && clientId !== 'new') {
    return (
      <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">Carregando dados do cliente...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto pb-12 flex flex-col animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
      <div className="flex flex-col">
        <div className="px-4 sm:px-6 lg:px-10 mt-6">
          <button 
            onClick={handleBack}
            className="px-4 py-2 rounded-xl bg-white/10 text-white/90 hover:bg-white/20 hover:text-white flex items-center gap-2 transition-all cursor-pointer font-bold text-xs"
          >
            <ChevronLeft size={16} />
            <span>{client ? 'Voltar para Lista' : 'Cancelar'}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <ClientContent client={client} companies={companies} onSuccess={handleSuccess} onClose={handleBack} />
      </div>
    </div>
  );
}
