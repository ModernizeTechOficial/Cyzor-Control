import type { ReactNode } from 'react';
import type { View } from '../../types';
import type { AdaptiveWorkspaceProfile } from './adaptiveWorkspaceEngine';
import {
  AdaptiveAgendaWidget,
  AdaptiveFeedWidget,
  AdaptiveInsightsWidget,
  AdaptiveObjectivesWidget,
  AdaptivePriorityWidget,
  AdaptiveProjectSummaryWidget,
  AdaptiveShortcutWidget,
  AdaptiveTeamWidget,
} from './AdaptiveWorkspaceWidgets';

const MAIN_WIDGET_RENDER_ORDER: Array<AdaptiveWorkspaceProfile['widgetLayout'][number]['position']> = [
  'priority',
  'projects',
  'objectives',
  'feed',
  'insights',
];

const SIDEBAR_WIDGET_RENDER_ORDER: Array<AdaptiveWorkspaceProfile['widgetLayout'][number]['position']> = [
  'agenda',
  'team',
];

export function renderAdaptiveWorkspaceMainContent(
  profile: AdaptiveWorkspaceProfile,
  onOpenView: (view: View) => void,
): ReactNode[] {
  const layoutPositions = profile.widgetLayout.map((widget) => widget.position);
  const resolvedPositions = Array.from(new Set(layoutPositions));

  const mainPositions = resolvedPositions.filter((position) => MAIN_WIDGET_RENDER_ORDER.includes(position));
  const sortedPositions = [...mainPositions].sort((a, b) => MAIN_WIDGET_RENDER_ORDER.indexOf(a) - MAIN_WIDGET_RENDER_ORDER.indexOf(b));

  return sortedPositions.map((position) => {
    switch (position) {
      case 'priority':
        return <AdaptivePriorityWidget key={position} profile={profile} onOpenAction={onOpenView} />;
      case 'projects':
        return <AdaptiveProjectSummaryWidget key={position} profile={profile} />;
      case 'objectives':
        return <AdaptiveObjectivesWidget key={position} profile={profile} />;
      case 'feed':
        return <AdaptiveFeedWidget key={position} profile={profile} />;
      case 'insights':
        return <AdaptiveInsightsWidget key={position} profile={profile} />;
      default:
        return null;
    }
  }).filter(Boolean) as ReactNode[];
}

export function renderAdaptiveWorkspaceSidebarContent(
  profile: AdaptiveWorkspaceProfile,
  onOpenView: (view: View) => void,
): ReactNode[] {
  const layoutPositions = profile.widgetLayout.map((widget) => widget.position);
  const resolvedPositions = Array.from(new Set(layoutPositions));

  const sidebarPositions = resolvedPositions.filter((position) => SIDEBAR_WIDGET_RENDER_ORDER.includes(position));
  const sortedPositions = [...sidebarPositions].sort((a, b) => SIDEBAR_WIDGET_RENDER_ORDER.indexOf(a) - SIDEBAR_WIDGET_RENDER_ORDER.indexOf(b));

  const sections: ReactNode[] = [<AdaptiveShortcutWidget key="shortcuts" profile={profile} onOpenAction={onOpenView} />];

  for (const position of sortedPositions) {
    if (position === 'agenda') {
      sections.push(<AdaptiveAgendaWidget key={position} profile={profile} />);
    }

    if (position === 'team') {
      sections.push(<AdaptiveTeamWidget key={position} profile={profile} />);
    }
  }

  return sections;
}
