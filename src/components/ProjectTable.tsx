import { useState, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProjectTable() {
  const { token, activeWorkspace } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token || !activeWorkspace) return;
      try {
        const res = await fetch('/api/projects', {
           headers: { 'Authorization': `Bearer ${token}` }
        });
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
  }, [token, activeWorkspace]);

  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[30px] p-6 lg:p-8 xl:col-span-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-display font-bold text-[#111111] tracking-tight">Projetos Recentes</h3>
        <button className="w-8 h-8 rounded-[12px] flex items-center justify-center hover:bg-[#FAFAFA] transition-colors border border-transparent hover:border-[#0F172A0F] text-[#64748B]">
          <MoreHorizontal size={20} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold uppercase text-[#64748B] border-b border-[#0F172A0F] tracking-widest">
              <th className="pb-4 font-bold">Project Name</th>
              <th className="pb-4 font-bold">Status</th>
              <th className="pb-4 font-bold max-w-[120px]">Progress</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {projects.length === 0 && (
              <tr><td colSpan={3} className="py-6 text-center text-gray-500">Nenhum projeto encontrado.</td></tr>
            )}
            {projects.map((p, i) => (
              <tr key={p.id} className="border-b border-[#0F172A0F]/50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors">
                <td className="py-5 font-semibold text-[#111111]">{p.name}</td>
                <td className="py-5">
                  <span className="px-2.5 py-1.5 rounded-[10px] text-[11px] font-bold uppercase tracking-wider bg-[#FAFAFA] border border-[#0F172A0F] text-[#111111]">
                    {p.status || 'Active'}
                  </span>
                </td>
                <td className="py-5">
                  <div className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-full h-2 max-w-[120px] overflow-hidden">
                    <div className="bg-[#111111] h-full rounded-full" style={{ width: `${p.progress || 0}%` }}></div>
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
