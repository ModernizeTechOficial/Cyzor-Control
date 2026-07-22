import type { AdaptiveFeedItem, AdaptiveObjectiveItem, AdaptiveWorkspaceProfile } from './adaptiveWorkspaceEngine';
import type { View } from '../../types';
import { ArrowRight, Bell, Bolt, Briefcase, CalendarDays, CheckCircle2, ClipboardList, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react';

const PERSONA_THEME = {
  Executive: {
    accent: 'from-slate-900 via-slate-700 to-slate-500',
    border: 'border-slate-200',
    badge: 'bg-slate-900 text-white',
    soft: 'bg-slate-50',
    text: 'text-slate-900',
  },
  Developer: {
    accent: 'from-indigo-600 via-sky-500 to-cyan-400',
    border: 'border-indigo-100',
    badge: 'bg-indigo-50 text-indigo-700',
    soft: 'bg-indigo-50',
    text: 'text-indigo-900',
  },
  Commercial: {
    accent: 'from-emerald-600 via-green-500 to-lime-400',
    border: 'border-emerald-100',
    badge: 'bg-emerald-50 text-emerald-700',
    soft: 'bg-emerald-50',
    text: 'text-emerald-900',
  },
  HR: {
    accent: 'from-fuchsia-600 via-pink-500 to-rose-400',
    border: 'border-fuchsia-100',
    badge: 'bg-fuchsia-50 text-fuchsia-700',
    soft: 'bg-fuchsia-50',
    text: 'text-fuchsia-900',
  },
  Financial: {
    accent: 'from-amber-500 via-orange-500 to-red-400',
    border: 'border-amber-100',
    badge: 'bg-amber-50 text-amber-700',
    soft: 'bg-amber-50',
    text: 'text-amber-900',
  },
  Operations: {
    accent: 'from-teal-600 via-cyan-500 to-sky-400',
    border: 'border-teal-100',
    badge: 'bg-teal-50 text-teal-700',
    soft: 'bg-teal-50',
    text: 'text-teal-900',
  },
} as const;

const getPersonaTheme = (persona: AdaptiveWorkspaceProfile['persona']) => PERSONA_THEME[persona] || PERSONA_THEME.Executive;

export function AdaptiveWidgetPill({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-slate-600 shadow-sm">
      <span className="h-2 w-2 rounded-full bg-indigo-500" />
      {label}
    </div>
  );
}

export function AdaptiveHeroSection({
  profile,
  user,
  activeWorkspace,
}: {
  profile: AdaptiveWorkspaceProfile;
  user: any;
  activeWorkspace: any;
}) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <section className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-8 shadow-sm backdrop-blur-xl overflow-hidden`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="h-16 w-16 rounded-[22px] overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-black text-slate-700">
                {(user?.displayName || user?.email || 'C').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">{profile.workspaceTypeLabel}</span>
            <h1 className="mt-4 text-4xl font-display font-black tracking-tight text-slate-950">{profile.dailyBriefing.greeting}</h1>
            <p className="mt-2 text-sm font-bold text-slate-500">{user?.displayName || user?.email || 'Colaborador'} • {profile.role} • {profile.department}</p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{profile.dailyBriefing.summary}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className={`rounded-3xl ${theme.soft} p-4 text-center shadow-sm border ${theme.border}`}>
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Persona</span>
            <p className="mt-3 text-lg font-black text-slate-900">{profile.persona}</p>
          </div>
          <div className={`rounded-3xl ${theme.soft} p-4 text-center shadow-sm border ${theme.border}`}>
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Momento</span>
            <p className="mt-3 text-lg font-black text-slate-900">{profile.moment}</p>
          </div>
          <div className={`rounded-3xl ${theme.soft} p-4 text-center shadow-sm border ${theme.border}`}>
            <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Contexto</span>
            <p className="mt-3 text-lg font-black text-slate-900">{profile.context}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        {profile.dailyBriefing.keyStats.map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] uppercase tracking-[0.27em] text-slate-400">{stat.label}</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{stat.value}</p>
          </div>
        ))}
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <p className="text-[10px] uppercase tracking-[0.27em] text-slate-400">Empresa / Workspace</p>
          <p className="mt-3 text-lg font-black text-slate-900">{activeWorkspace?.name || 'Workspace ativo'}</p>
        </div>
      </div>
    </section>
  );
}

export function AdaptivePriorityWidget({
  profile,
  onOpenAction,
}: {
  profile: AdaptiveWorkspaceProfile;
  onOpenAction: (view: View) => void;
}) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Prioridade Relevante</span>
          <h2 className="mt-3 text-xl font-black text-slate-900">{profile.priorityCard.title}</h2>
        </div>
        <div className={`inline-flex items-center rounded-2xl ${theme.badge} px-3 py-2 text-xs font-bold`}>{profile.priorityCard.urgency}</div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-600">
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Tipo</p>
          <p className="mt-2 font-semibold text-slate-900">{profile.priorityCard.type}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Prazo</p>
          <p className="mt-2 font-semibold text-slate-900">{profile.priorityCard.dueLabel}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center text-sm text-slate-500">
        <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2">
          <ShieldCheck size={14} className="text-indigo-500" />
          <span>{profile.priorityCard.teamSize} membros</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-3xl bg-slate-100 px-3 py-2">
          <Bolt size={14} className="text-amber-500" />
          <span>{profile.priorityCard.progress}% concluído</span>
        </div>
      </div>
      <button onClick={() => onOpenAction(profile.priorityCard.actionView as View)} className="mt-8 inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800">
        Ver ação <ArrowRight size={14} />
      </button>
    </div>
  );
}

export function AdaptiveDeveloperProjectsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Sprint & entregas</h2>
          <p className="mt-1 text-[12px] text-slate-500">Ritmo de entrega e riscos técnicos.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveCommercialProjectsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Pipeline & oportunidades</h2>
          <p className="mt-1 text-[12px] text-slate-500">Fluxo de oportunidades e conversão.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveHRProjectsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Capacidade & desenvolvimento</h2>
          <p className="mt-1 text-[12px] text-slate-500">Saúde do time e evolução de pessoas.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveFinancialProjectsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Fluxo & aprovações</h2>
          <p className="mt-1 text-[12px] text-slate-500">Monitoramento de pagamentos e liquidez.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveOperationsProjectsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Operação & execução</h2>
          <p className="mt-1 text-[12px] text-slate-500">Estado operacional e capacidade de execução.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveProjectSummaryWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  if (profile.persona === 'Developer') return <AdaptiveDeveloperProjectsWidget profile={profile} />;
  if (profile.persona === 'Commercial') return <AdaptiveCommercialProjectsWidget profile={profile} />;
  if (profile.persona === 'HR') return <AdaptiveHRProjectsWidget profile={profile} />;
  if (profile.persona === 'Financial') return <AdaptiveFinancialProjectsWidget profile={profile} />;
  if (profile.persona === 'Operations') return <AdaptiveOperationsProjectsWidget profile={profile} />;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Foco estratégico</h2>
          <p className="mt-1 text-[12px] text-slate-500">Indicadores de direção e impacto.</p>
        </div>
        <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.personaHighlights.length} cards</span>
      </div>
      <div className="grid gap-4">
        {profile.personaHighlights.map((item) => (
          <div key={item.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">Status {item.status}</p>
              </div>
              <span className="text-2xl font-black text-slate-900">{item.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdaptiveObjectivesWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <div className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Objetivos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Missões prioritárias</h2>
        </div>
      </div>
      <div className="grid gap-4">
        {profile.objectives.map((objective) => (
          <ObjectiveCard key={objective.title} title={objective.title} progress={objective.progress} impact={objective.impact} horizon={objective.horizon} />
        ))}
      </div>
    </div>
  );
}

export function AdaptiveFeedWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);
  const feedTitles = {
    Developer: 'Atualizações de sprint e entrega',
    Commercial: 'Atualizações de pipeline e vendas',
    HR: 'Atualizações de pessoas e clima',
    Financial: 'Atualizações de fluxo e aprovação',
    Executive: 'Atualizações executivas',
    Operations: 'Atualizações operacionais'
  } as const;

  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Feed Adaptativo</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">{feedTitles[profile.persona]}</h2>
        </div>
      </div>
      <div className="grid gap-4">
        {profile.activityFeed.map((item) => (
          <FeedItem key={item.id} headline={item.headline} detail={item.detail} timeLabel={item.timeLabel} />
        ))}
      </div>
    </div>
  );
}

export function AdaptiveInsightsWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);
  const personaFocusMap = {
    Developer: 'Focus em entrega e qualidade técnica.',
    Commercial: 'Focus em pipeline e conversão de oportunidades.',
    HR: 'Focus em pessoas, desenvolvimento e clima.',
    Financial: 'Focus em risco financeiro e aprovações.',
    Executive: 'Focus em direção, saúde e priorização.',
    Operations: 'Focus em execução e capacidade operacional.'
  } as const;

  const personaHeadingMap = {
    Developer: 'Diagnóstico técnico do momento',
    Commercial: 'Diagnóstico comercial do momento',
    HR: 'Diagnóstico de pessoas do momento',
    Financial: 'Diagnóstico financeiro do momento',
    Executive: 'Diagnóstico executivo do momento',
    Operations: 'Diagnóstico operacional do momento'
  } as const;

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Insights</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">{personaHeadingMap[profile.persona]}</h2>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Persona</p>
          <p className="mt-2 text-lg font-black text-slate-900">{profile.persona}</p>
          <p className="mt-2 text-[12px] text-slate-500">{personaFocusMap[profile.persona]}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Workspace</p>
          <p className="mt-2 text-lg font-black text-slate-900">{profile.workspaceTypeLabel}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-4 border border-slate-100">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-400">Momento</p>
          <p className="mt-2 text-lg font-black text-slate-900">{profile.moment}</p>
        </div>
      </div>
    </section>
  );
}

export function AdaptiveShortcutWidget({
  profile,
  onOpenAction,
}: {
  profile: AdaptiveWorkspaceProfile;
  onOpenAction: (view: View) => void;
}) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <section className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Atalhos</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Navegação rápida</h2>
        </div>
      </div>
      <div className="grid gap-3">
        {profile.shortcuts.map((shortcut) => (
          <ShortcutButton key={shortcut.view} label={shortcut.label} description={shortcut.description} onClick={() => onOpenAction(shortcut.view as View)} />
        ))}
      </div>
    </section>
  );
}

export function AdaptiveAgendaWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);
  const agendaHeadings = {
    Developer: 'Entregas e checkpoints',
    Commercial: 'Pipeline e reuniões',
    HR: 'Clima e evolução',
    Financial: 'Fluxo e decisão',
    Executive: 'Gestão executiva',
    Operations: 'Coordenação operacional'
  } as const;

  return (
    <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Agenda</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">{agendaHeadings[profile.persona]}</h2>
        </div>
        <Bell size={18} className="text-slate-400" />
      </div>
      <div className="grid gap-4">
        {profile.agendaTimeline.length > 0 ? profile.agendaTimeline.map((item) => (
          <FeedItem key={item.id} headline={item.headline} detail={item.detail} timeLabel={item.timeLabel} />
        )) : (
          <p className="text-[13px] text-slate-500">Nenhum compromisso agendado para os próximos dias.</p>
        )}
      </div>
    </section>
  );
}

export function AdaptiveTeamWidget({ profile }: { profile: AdaptiveWorkspaceProfile }) {
  const theme = getPersonaTheme(profile.persona);

  return (
    <section className={`rounded-[32px] border ${theme.border} bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Equipe</span>
          <h2 className="mt-2 text-xl font-black text-slate-900">Como o time está</h2>
        </div>
        <Users size={18} className="text-slate-400" />
      </div>
      <div className="grid gap-4">
        {profile.teamHighlights.map((item) => (
          <FeedItem key={item.id} headline={item.headline} detail={item.detail} timeLabel={item.timeLabel} />
        ))}
      </div>
    </section>
  );
}

function FeedItem({ headline, detail, timeLabel }: { headline: string; detail: string; timeLabel: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-bold text-slate-900">{headline}</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{timeLabel}</span>
      </div>
      <p className="text-[13px] text-slate-600 leading-relaxed">{detail}</p>
    </div>
  );
}

function ObjectiveCard({ title, progress, impact, horizon }: { title: string; progress: number; impact: string; horizon: string }) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-sm font-bold text-slate-900">{title}</span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{horizon}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-500" style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }} />
      </div>
      <div className="flex items-center justify-between text-[11px] text-slate-500">
        <span>Progresso</span>
        <span>{progress}%</span>
      </div>
      <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600">Impacto: {impact}</div>
    </div>
  );
}

function ShortcutButton({ label, description, onClick }: { label: string; description: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col gap-1 rounded-3xl border border-slate-200 bg-white/90 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="text-sm font-bold text-slate-900">{label}</span>
      <span className="text-[11px] text-slate-500">{description}</span>
      <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600 group-hover:text-indigo-800 flex items-center gap-2">
        Abrir <ArrowRight size={12} />
      </span>
    </button>
  );
}
