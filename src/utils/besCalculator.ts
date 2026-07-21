// Compatibility wrapper: delegate BES utilities to the new Professional Evolution calculator
import {
  PROFESSIONAL_STAGES,
  ACTIONS as EV_ACTIONS,
  getProfessionalEvolutionInfo,
  generateProfessionalInsights
} from "./professionalEvolutionCalculator";

export const BES_STAGES = PROFESSIONAL_STAGES;
export const ACTIONS = EV_ACTIONS;

export function getMaturityInfo(besScore: number) {
  const info = getProfessionalEvolutionInfo(besScore);
  return {
    currentStage: info.currentStage,
    nextStage: info.nextStage,
    progress: info.progress,
    pointsToNext: info.xpToNext
  };
}

export function generateAIDiagnostics(besScore: number, entitiesCount: any) {
  const insights = generateProfessionalInsights(besScore, entitiesCount);
  // Map output shape to legacy fields
  return {
    diagnostics: insights.diagnostics,
    reasons: insights.reasons,
    recommendations: insights.recommendations.map((r: any) => ({ ...r, impact: r.impact.replace('XP', 'BES') }))
  };
}
