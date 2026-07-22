import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProjects, useCompanies, useFinance, useMembers, useTasks, useAgenda, useClients, useProducts, useIdeas, useNotifications } from '../hooks/useCyzorQueries';
import { useNavigation } from '../context/NavigationContext';
import { View } from '../types';
import { buildAdaptiveWorkspaceProfile } from './adaptive/adaptiveWorkspaceEngine';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, CalendarDays, Bell, CheckCircle2, Users, Briefcase, ClipboardList, TrendingUp, Bolt } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard';

function StatusBadge({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-1 rounded-[24px] border border-slate-200 bg-white/80 p-4 shadow-sm">
      <span className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400">{label}</span>
      <span className="text-xl font-black text-slate-900">{value}</span>
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

export default function AdaptiveWorkspaceView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { user, activeWorkspace } = useAuth();
  const { globalFilters } = useNavigation();

  const { data: projects = [] } = useProjects();
  const { data: companies = [] } = useCompanies();
  const { data: finance = [] } = useFinance();
  const { data: tasks = [] } = useTasks();
  const { data: agendaEvents = [] } = useAgenda();
  const { data: clients = [] } = useClients();
  const { data: products = [] } = useProducts();
  const { data: ideas = [] } = useIdeas();
  const { data: notifications = [] } = useNotifications();
  const { data: members = [] } = useMembers();

  const profile = useMemo(() => {
    const filteredProjects = globalFilters.companyId ? projects.filter((project: any) => project.companyId?.toString() === globalFilters.companyId.toString()) : projects;
    const filteredTasks = globalFilters.companyId ? tasks.filter((task: any) => task.companyId?.toString() === globalFilters.companyId.toString() || filteredProjects.some((project: any) => project.id === task.projectId)) : tasks;
    const filteredFinance = globalFilters.companyId ? finance.filter((entry: any) => entry.companyId?.toString() === globalFilters.companyId.toString()) : finance;

    return buildAdaptiveWorkspaceProfile({
      user,
      dbUser: null,
      activeWorkspace,
      projects: filteredProjects,
      tasks: filteredTasks,
      finance: filteredFinance,
      agendaEvents,
      clients,
      members,
      ideas,
      notifications,
    });
  }, [activeWorkspace, agendaEvents, clients, finance, globalFilters.companyId, ideas, members, notifications, projects, tasks, user]);

  const isOnboardingCompleted = activeWorkspace?.settings?.onboardingCompleted === true;

  if (activeWorkspace && !isOnboardingCompleted) {
    return (
      <div className="w-full mx-auto py-2">
        <OnboardingWizard onComplete={() => {
          sessionStorage.setItem('just_finished_onboarding', 'true');
          sessionStorage.setItem('welcome_modal_shown', 'true');
          window.dispatchEvent(new Event('restart-tour'));
        }} />
      </div>
    );
  }

  return (
    <div id="adaptive-workspace" className="w-full mx-auto pb-12 flex flex-col gap-8 animate-in fade-in duration-500 relative px-4 sm:px-6 lg:px-8">
      <motion.div className="absolute inset-x-0 top-0 h-[320px] bg-gradient-to-b from-slate-100/80 via-white to-transparent pointer-events-none -z-10" />
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 flex flex-col gap-6">
          <section className="rounded-[32px] border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur-xl overflow-hidden">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">Espaço Adaptativo</span>
                <h1 className="mt-4 text-4xl font-display font-black tracking-tight text-slate-950">{profile.dailyBriefing.greeting}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{profile.dailyBriefing.summary}</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm border border-slate-200">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Persona</span>
                  <p className="mt-3 text-lg font-black text-slate-900">{profile.persona}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm border border-slate-200">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Momento</span>
                  <p className="mt-3 text-lg font-black text-slate-900">{profile.moment}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-center shadow-sm border border-slate-200">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-slate-400">Contexto</span>
                  <p className="mt-3 text-lg font-black text-slate-900">{profile.context}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.dailyBriefing.keyStats.map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] uppercase tracking-[0.27em] text-slate-400">{stat.label}</p>
                  <p className="mt-3 text-2xl font-black text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Prioridade Relevante</span>
                  <h2 className="mt-3 text-xl font-black text-slate-900">{profile.priorityCard.title}</h2>
                </div>
                <div className="inline-flex items-center rounded-2xl bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">{profile.priorityCard.urgency}</div>
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
              <button onClick={() => setCurrentView(profile.priorityCard.actionView as View)} className="mt-8 inline-flex items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 py-4 text-sm font-black uppercase tracking-[0.25em] text-white transition hover:bg-slate-800">
                Ver ação <ArrowRight size={14} />
              </button>
            </div>
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Resumo de Projetos</span>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Foco do dia</h2>
                </div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">{profile.projectSummary.length} cards</span>
              </div>
              <div className="grid gap-4">
                {profile.projectSummary.map((item) => (
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
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
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
            <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Feed Adaptativo</span>
                  <h2 className="mt-2 text-xl font-black text-slate-900">Principais atualizações</h2>
                </div>
              </div>
              <div className="grid gap-4">
                {profile.activityFeed.map((item) => (
                  <FeedItem key={item.id} headline={item.headline} detail={item.detail} timeLabel={item.timeLabel} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="xl:col-span-4 flex flex-col gap-6">
          <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Atalhos</span>
                <h2 className="mt-2 text-xl font-black text-slate-900">Navegação rápida</h2>
              </div>
            </div>
            <div className="grid gap-3">
              {profile.shortcuts.map((shortcut) => (
                <ShortcutButton key={shortcut.view} label={shortcut.label} description={shortcut.description} onClick={() => setCurrentView(shortcut.view as View)} />
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Agenda</span>
                <h2 className="mt-2 text-xl font-black text-slate-900">Próximos compromissos</h2>
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

          <section className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-sm">
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
        </aside>
      </div>
    </div>
  );
}
