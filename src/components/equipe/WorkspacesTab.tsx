import { Briefcase, LayoutDashboard, Sparkles } from 'lucide-react';

const workspaceTypes = [
  {
    name: 'Owner Workspace',
    subtitle: 'Experiência completa e administração total',
    actions: ['Layout executivo', 'Ações rápidas', 'Permissões completas'],
  },
  {
    name: 'Manager Workspace',
    subtitle: 'Gestão de execuções e performance de times',
    actions: ['Dashboard de lead', 'KPIs por time', 'Acompanhamento de objetivos'],
  },
  {
    name: 'Employee Workspace',
    subtitle: 'Experiência orientada a tarefas e entregas',
    actions: ['Prioridades do dia', 'Feed de atividades', 'Agenda e timelines'],
  },
  {
    name: 'Personal Workspace',
    subtitle: 'Personalização para foco individual',
    actions: ['Resumo pessoal', 'Career Hub', 'Configuração simples'],
  },
];

export default function WorkspacesTab() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {workspaceTypes.map((workspace) => (
        <div key={workspace.name} className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Workspace</p>
              <h3 className="mt-2 text-xl font-black text-slate-900">{workspace.name}</h3>
            </div>
            <div className="rounded-2xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">Configurable</div>
          </div>
          <p className="text-sm text-slate-600">{workspace.subtitle}</p>

          <div className="mt-5 space-y-3">
            {workspace.actions.map((action) => (
              <div key={action} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800">{action}</div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold"><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 inline-flex gap-2 items-center"><LayoutDashboard size={14} /> Layout</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 inline-flex gap-2 items-center"><Sparkles size={14} /> Widgets</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 inline-flex gap-2 items-center"><Briefcase size={14} /> Prioridades</span></div>
        </div>
      ))}
    </div>
  );
}
