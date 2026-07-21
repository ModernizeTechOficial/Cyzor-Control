export const PROFESSIONAL_STAGES = [
  { id: 'ONBOARDING', label: 'Onboarding', min: 0, max: 300, role: 'Aprendiz' },
  { id: 'ENGAGED', label: 'Engajado', min: 301, max: 900, role: 'Operacional' },
  { id: 'IMPACT', label: 'Impacto', min: 901, max: 2200, role: 'Consistente' },
  { id: 'LEADER', label: 'Líder', min: 2201, max: 5000, role: 'Confiável' },
  { id: 'STRATEGIST', label: 'Estratégico', min: 5001, max: 10000, role: 'Influente' },
  { id: 'MASTER', label: 'Mestre', min: 10001, max: Infinity, role: 'Mentor' }
];

export function getProfessionalEvolutionInfo(xp: number) {
  const currentStageIndex = PROFESSIONAL_STAGES.findIndex(s => xp >= s.min && xp <= s.max);
  const currentStage = PROFESSIONAL_STAGES[currentStageIndex] || PROFESSIONAL_STAGES[0];
  const nextStage = PROFESSIONAL_STAGES[currentStageIndex + 1] || null;

  let progress = 100;
  let xpToNext = 0;

  if (nextStage) {
    const range = currentStage.max - currentStage.min;
    const currentProgress = xp - currentStage.min;
    progress = Math.round((currentProgress / range) * 100);
    progress = Math.max(0, Math.min(100, progress));
    xpToNext = nextStage.min - xp;
  }

  return {
    currentStage,
    nextStage,
    progress,
    xpToNext
  };
}

export const ACTIONS = {
  CREATE_COMPANY: 10,
  CREATE_PROJECT: 15,
  COMPLETE_PROJECT: 20,
  ADD_CLIENT: 8,
  FIRST_SALE: 30,
  REGISTER_REVENUE: 40,
  ORGANIZE_CASHFLOW: 12,
  CREATE_FINANCE: 5,
  CREATE_DOCUMENT: 6,
  COMPLETE_DOCUMENTATION: 10,
  COMPLETE_TASK: 5,
  FINISH_SPRINT: 15,
  CREATE_AUTOMATION: 15,
  CREATE_INTEGRATION: 8,
  PROJECT_DELAYED: -10,
  CLIENT_LOST: -20,
  INACTIVITY: -15
};

export function generateProfessionalInsights(xp: number, entityCounts: any) {
  const { currentStage, nextStage } = getProfessionalEvolutionInfo(xp);
  const recommendations: Array<{ title: string; impact: string; action: string }> = [];
  const reasons: string[] = [];

  if (entityCounts.tasks < 5) {
    reasons.push('Baixa cadência de tarefas concluídas');
    recommendations.push({ title: 'Concluir 5 tarefas prioritárias', impact: '+40 XP', action: 'Foco em execução' });
  }
  if (entityCounts.projects < 2) {
    reasons.push('Pouca movimentação em projetos estratégicos');
    recommendations.push({ title: 'Avançar 1 projeto crítico', impact: '+80 XP', action: 'Finalizar projeto' });
  }
  if (entityCounts.customers < 3) {
    reasons.push('Relacionamento com clientes ainda em formação');
    recommendations.push({ title: 'Conectar com 3 clientes', impact: '+60 XP', action: 'Atendimento de alto valor' });
  }
  if (entityCounts.documents < 4) {
    reasons.push('Documentação limitada para apoio às entregas');
    recommendations.push({ title: 'Gerar 1 documentação relevante', impact: '+30 XP', action: 'Documentação técnica' });
  }
  if (recommendations.length === 0 && nextStage) {
    recommendations.push({ title: `Aprimorar desempenho para chegar a ${nextStage.label}`, impact: `+${nextStage.min - xp} XP`, action: 'Manter ritmo' });
  }

  return {
    diagnostics: `Seu perfil está no estágio ${currentStage.label}. O próximo patamar é ${nextStage?.label || currentStage.label}. A IA recomenda focar em atividades de alta visibilidade e em consistência de execução.`,
    reasons: reasons.length ? reasons : ['Foco em entregas, colaboração e desenvolvimento contínuo'],
    recommendations
  };
}
