import { Briefcase, Building2, Users } from 'lucide-react';
import { useMembers } from '../../hooks/useCyzorQueries';

export default function DepartmentsTab() {
  const { data: members = [] } = useMembers();
  const memberList = Array.isArray(members) ? (members as any[]) : [];

  const grouped = memberList.reduce<Record<string, any[]>>((acc, member) => {
    const department = member.department || member.cargo || 'General';
    acc[department] = [...(acc[department] || []), member];
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {Object.entries(grouped).map(([department, departmentMembers]) => (
        <div key={department} className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Departamento</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">{department}</h3>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">Health 84%</div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Responsável</p>
              <p className="mt-2 font-black text-slate-900">{departmentMembers[0]?.manager || 'A definir'}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Colaboradores</p>
              <p className="mt-2 font-black text-slate-900">{departmentMembers.length}</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Equipes</p>
              <p className="mt-2 font-black text-slate-900">{new Set(departmentMembers.map((member) => member.team || member.equipe || 'Sem equipe')).size}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Projetos</p>
              <p className="mt-2 font-black text-slate-900">{Math.max(1, Math.round(departmentMembers.length / 3))}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Building2 size={14} /> KPI ativo</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Users size={14} /> Organização clara</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"><Briefcase size={14} /> Career Hub</span>
          </div>
        </div>
      ))}
    </div>
  );
}
