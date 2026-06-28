import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProjectTable() {
  const { fetchWithAuth, activeWorkspace } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeWorkspace) return;
      try {
        const res = await fetchWithAuth('/api/projects');
        if (res.ok) {
          const data = await res.json();
          // Get the top 5 most recently created or high priority ones
          setProjects(data.slice(0, 5));
        }
      } catch(e) {
        console.error(e);
      }
    };
    fetchProjects();
  }, [fetchWithAuth, activeWorkspace]);

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 lg:p-8 xl:col-span-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden text-left">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-display font-bold text-[#111111] tracking-tight">Projetos Recentes</h3>
        <button className="w-8 h-8 rounded-[12px] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#0F172A0F] text-[#64748B]">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-full">
          <thead>
            <tr className="text-[10px] sm:text-[11px] font-bold uppercase text-[#64748B] border-b border-[#0F172A0F] tracking-widest whitespace-nowrap">
              <th className="pb-4 font-bold px-5 sm:px-0">Projeto</th>
              <th className="pb-4 font-bold px-2 sm:px-0 text-center sm:text-left">Status</th>
              <th className="pb-4 font-bold px-5 sm:px-0 text-right sm:text-left max-w-[120px]">Progresso</th>
            </tr>
          </thead>
          <tbody className="text-[13px] sm:text-sm">
            {projects.length === 0 && (
              <tr><td colSpan={3} className="py-6 text-center text-gray-500 px-5 sm:px-0">Nenhum projeto encontrado.</td></tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="border-b border-[#0F172A0F]/50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors">
                <td className="py-4 sm:py-5 font-semibold text-[#111111] px-5 sm:px-0 truncate max-w-[120px] sm:max-w-none">{p.name}</td>
                <td className="py-4 sm:py-5 px-2 sm:px-0 text-center sm:text-left">
                  <span className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-[10px] text-[9px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111] whitespace-nowrap">
                    {p.status || 'Active'}
                  </span>
                </td>
                <td className="py-4 sm:py-5 px-5 sm:px-0">
                  <div className="flex items-center justify-end sm:justify-start gap-2">
                    <div className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-full h-1.5 sm:h-2 max-w-[80px] sm:max-w-[120px] overflow-hidden hidden xs:block">
                      <div className="bg-[#111111] h-full rounded-full" style={{ width: `${p.progress || 0}%` }}></div>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-[#64748B] sm:hidden">{p.progress || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
