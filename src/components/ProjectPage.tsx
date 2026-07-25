import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import ProjectContent from './ProjectContent';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useQueryClient } from '@tanstack/react-query';

export default function ProjectPage() {
  const { globalFilters, setGlobalFilters } = useNavigation();
  const { fetchWithAuth } = useAuth();
  const queryClient = useQueryClient();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const projectId = globalFilters.projectId;

  useEffect(() => {
    if (!projectId) return;
    setIsLoading(true);
    fetchWithAuth('/api/projects')
      .then(res => res.ok ? res.json() : [])
      .then((allProjects: any[]) => {
        const found = allProjects.find((p: any) => String(p.id) === String(projectId)) || null;
        setProject(found);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [projectId, fetchWithAuth]);

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['projects'] });
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['sprints'] });
    queryClient.invalidateQueries({ queryKey: ['milestones'] });
    queryClient.invalidateQueries({ queryKey: ['documents'] });
  };

  const handleBack = () => {
    setGlobalFilters({ projectId: undefined });
    window.history.back();
  };

  if (isLoading) {
    return (
      <div className="w-full mx-auto pb-12 flex flex-col gap-10 animate-in fade-in duration-500 relative bg-[#FAFAFA]/30">
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-[#64748B]">Carregando dados do projeto...</span>
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
            <span>Voltar para Lista</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1">
        <ProjectContent project={project} onSave={handleSuccess} onClose={handleBack} />
      </div>
    </div>
  );
}
