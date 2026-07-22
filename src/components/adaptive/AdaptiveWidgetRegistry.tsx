import type { AdaptiveWidgetDefinition } from './adaptiveWorkspaceEngine';

export type AdaptiveWidgetPosition = AdaptiveWidgetDefinition['position'];

export interface AdaptiveWidgetRegistryEntry {
  id: string;
  label: string;
  position: AdaptiveWidgetPosition;
  group: 'hero' | 'main' | 'sidebar';
}

const ADAPTIVE_WIDGET_POSITION_ORDER: AdaptiveWidgetPosition[] = [
  'hero',
  'priority',
  'projects',
  'objectives',
  'feed',
  'insights',
  'agenda',
  'team',
  'pendencies',
  'career',
];

export const ADAPTIVE_WIDGET_REGISTRY: Record<string, AdaptiveWidgetRegistryEntry> = {
  hero: { id: 'hero', label: 'Hero Principal', position: 'hero', group: 'hero' },
  'priority-current': { id: 'priority-current', label: 'Prioridade Atual', position: 'priority', group: 'main' },
  pendencies: { id: 'pendencies', label: 'Pendências', position: 'pendencies', group: 'main' },
  agenda: { id: 'agenda', label: 'Agenda', position: 'agenda', group: 'sidebar' },
  'career-hub': { id: 'career-hub', label: 'Career Hub', position: 'career', group: 'main' },
  team: { id: 'team', label: 'Equipe', position: 'team', group: 'sidebar' },
  projects: { id: 'projects', label: 'Projetos', position: 'projects', group: 'main' },
  objectives: { id: 'objectives', label: 'Objetivos', position: 'objectives', group: 'main' },
  feed: { id: 'feed', label: 'Feed', position: 'feed', group: 'main' },
  insights: { id: 'insights', label: 'Insights', position: 'insights', group: 'main' },
};

export function getAdaptiveWidgetSectionOrder(layout: AdaptiveWidgetDefinition[]) {
  const orderedPositions = new Set<AdaptiveWidgetPosition>();
  const seen = new Set<AdaptiveWidgetPosition>();

  for (const position of ADAPTIVE_WIDGET_POSITION_ORDER) {
    if (layout.some((widget) => widget.position === position)) {
      orderedPositions.add(position);
      seen.add(position);
    }
  }

  for (const widget of layout) {
    if (!seen.has(widget.position)) {
      orderedPositions.add(widget.position);
      seen.add(widget.position);
    }
  }

  return Array.from(orderedPositions);
}

export function getAdaptiveWidgetLabel(position: AdaptiveWidgetPosition) {
  return ADAPTIVE_WIDGET_REGISTRY[position]?.label || position;
}
