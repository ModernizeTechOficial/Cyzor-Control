import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useProjects, useCompanies, useFinance, useMembers, useTasks, useAgenda, useClients, useProducts, useIdeas, useNotifications } from '../hooks/useCyzorQueries';
import { useNavigation } from '../context/NavigationContext';
import { View } from '../types';
import { buildAdaptiveWorkspaceProfile } from './adaptive/adaptiveWorkspaceEngine';
import { getAdaptiveWidgetSectionOrder } from './adaptive/AdaptiveWidgetRegistry';
import {
  AdaptiveHeroSection,
  AdaptiveWidgetPill,
} from './adaptive/AdaptiveWorkspaceWidgets';
import {
  renderAdaptiveWorkspaceMainContent,
  renderAdaptiveWorkspaceSidebarContent,
} from './adaptive/AdaptiveWorkspaceRenderer';
import { motion } from 'motion/react';
import OnboardingWizard from './OnboardingWizard';

export default function AdaptiveWorkspaceView({ setCurrentView }: { setCurrentView: (view: View) => void }) {
  const { user, dbUser, activeWorkspace } = useAuth();
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
      dbUser,
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

  const widgetOrder = getAdaptiveWidgetSectionOrder(profile.widgetLayout);
  const widgetLabels: Record<string, string> = {
    hero: 'Hero Principal',
    priority: 'Prioridade Atual',
    pendencies: 'Pendências',
    agenda: 'Agenda',
    career: 'Career Hub',
    team: 'Equipe',
    projects: 'Projetos',
    objectives: 'Objetivos',
    feed: 'Feed',
    insights: 'Insights'
  };
  const mainWidgets = renderAdaptiveWorkspaceMainContent(profile, setCurrentView);
  const sidebarWidgets = renderAdaptiveWorkspaceSidebarContent(profile, setCurrentView);

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
          <AdaptiveHeroSection profile={profile} user={user} activeWorkspace={activeWorkspace} />

          <div className="mt-6 flex flex-wrap gap-3">
            {widgetOrder.map((position) => (
              <AdaptiveWidgetPill key={position} label={widgetLabels[position] || position} />
            ))}
          </div>

          {mainWidgets.length > 0 && (
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mainWidgets[0]}
              {mainWidgets[1]}
            </section>
          )}

          {mainWidgets.length > 2 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {mainWidgets.slice(2, 4)}
            </div>
          )}

          {mainWidgets.length > 4 && (
            <div>{mainWidgets[4]}</div>
          )}
        </div>

        <aside className="xl:col-span-4 flex flex-col gap-6">
          {sidebarWidgets}
        </aside>
      </div>
    </div>
  );
}
