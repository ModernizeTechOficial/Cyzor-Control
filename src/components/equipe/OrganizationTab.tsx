import { Building2, Users, Workflow, User, ChevronRight, Shield, Layers } from 'lucide-react';
import { useOrganizationTree } from '../../hooks/useCyzorQueries';

export default function OrganizationTab() {
  const { data: tree, isLoading, error } = useOrganizationTree();

  if (isLoading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8 shadow-sm text-center text-slate-500">
        Carregando estrutura do organograma...
      </div>
    );
  }

  if (error || !tree) {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-rose-50 p-8 shadow-sm text-center text-rose-700 font-medium">
        Falha ao carregar o organograma da empresa.
      </div>
    );
  }

  const { organizationName, departments = [], teams = [], members = [] } = tree;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-100 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-indigo-700 font-bold mb-2">
            Organograma Interativo
          </div>
          <h3 className="text-2xl font-black text-slate-900">{organizationName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Estrutura hierárquica navegável em tempo real: Empresa → Departamentos → Equipes → Gestores → Colaboradores.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departamentos</p>
            <p className="mt-1 text-xl font-black text-slate-900">{departments.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Equipes</p>
            <p className="mt-1 text-xl font-black text-slate-900">{teams.length}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membros</p>
            <p className="mt-1 text-xl font-black text-slate-900">{members.length}</p>
          </div>
        </div>
      </div>

      {/* Root Node: Company */}
      <div className="rounded-[32px] border border-slate-900 bg-slate-950 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
            <Building2 size={24} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400 font-extrabold">Nível 0 • Empresa Principal</p>
            <h4 className="text-xl font-black text-white mt-1">{organizationName}</h4>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="space-y-6">
        <h4 className="text-xs uppercase tracking-[0.25em] text-slate-400 font-bold px-2">
          Departamentos & Equipes Vinculadas ({departments.length})
        </h4>

        {departments.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Nenhum departamento cadastrado ainda. Use a aba "Departments" para criar o primeiro departamento.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {departments.map((dept: any) => {
              const deptTeams = teams.filter((t: any) => t.department?.toLowerCase() === dept.name?.toLowerCase());
              const deptMembers = members.filter((m: any) => m.department?.toLowerCase() === dept.name?.toLowerCase());

              return (
                <div key={dept.id} className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-sm space-y-6">
                  {/* Department Level Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        <Workflow size={20} />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Nível 1 • Departamento</span>
                        <h5 className="text-lg font-black text-slate-900">{dept.name}</h5>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{deptTeams.length} equipes</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{deptMembers.length} membros</span>
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1">Health {dept.healthScore || 85}%</span>
                    </div>
                  </div>

                  {/* Teams under this Department */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {deptTeams.length === 0 ? (
                      <div className="col-span-full rounded-2xl bg-slate-50 p-4 text-xs text-slate-500 italic">
                        Nenhuma equipe vinculada diretamente a este departamento.
                      </div>
                    ) : (
                      deptTeams.map((team: any) => {
                        const teamMembers = members.filter((m: any) => m.teamName?.toLowerCase() === team.name?.toLowerCase());

                        return (
                          <div key={team.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 space-y-4 hover:border-slate-300 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Users size={16} className="text-slate-500" />
                                <span className="text-sm font-black text-slate-900">{team.name}</span>
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível 2</span>
                            </div>

                            {team.description && (
                              <p className="text-xs text-slate-600 line-clamp-2">{team.description}</p>
                            )}

                            {/* Team Lead & Members */}
                            <div className="pt-2 border-t border-slate-200/60 space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Membros ({teamMembers.length})</p>
                              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                {teamMembers.length === 0 ? (
                                  <p className="text-xs text-slate-400 italic">Sem membros alocados</p>
                                ) : (
                                  teamMembers.map((m: any) => (
                                    <div key={m.id} className="flex items-center justify-between rounded-xl bg-white p-2 border border-slate-100 text-xs">
                                      <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-700">
                                          {m.userName?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <div>
                                          <p className="font-bold text-slate-800 leading-tight">{m.userName}</p>
                                          <p className="text-[10px] text-slate-400">{m.cargo || 'Colaborador'}</p>
                                        </div>
                                      </div>
                                      <span className="text-[9px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        {m.role || 'MEMBER'}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
