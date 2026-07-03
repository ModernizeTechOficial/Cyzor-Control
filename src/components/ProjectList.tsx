import { MoreHorizontal } from 'lucide-react';

export default function ProjectList({ projects }: { projects: any[] }) {
  return (
    <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] sm:rounded-[30px] p-5 sm:p-6 lg:p-8 xl:col-span-2 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden text-left">
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-display font-bold text-[#111111] tracking-tight">Projetos</h3>
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
