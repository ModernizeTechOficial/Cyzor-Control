export const BES_STAGES = [
  { id: 'IDEIA', label: 'Ideia', min: 0, max: 200, role: 'Validação Inicial' },
  { id: 'VALIDACAO', label: 'Validação', min: 201, max: 800, role: 'Prototipação' },
  { id: 'MVP', label: 'MVP', min: 801, max: 1500, role: 'Primeiras Vendas' },
  { id: 'OPERACAO', label: 'Operação', min: 1501, max: 3500, role: 'Estruturação de Processos' },
  { id: 'ESCALA', label: 'Escala', min: 3501, max: 8000, role: 'Crescimento Acelerado' },
  { id: 'ECOSSISTEMA', label: 'Ecossistema', min: 8001, max: Infinity, role: 'Plataforma Consolidada' }
];

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

export function getMaturityInfo(besScore: number) {
  const currentStageIndex = BES_STAGES.findIndex(s => besScore >= s.min && besScore <= s.max);
  const currentStage = BES_STAGES[currentStageIndex] || BES_STAGES[0];
  const nextStage = BES_STAGES[currentStageIndex + 1] || null;

  let progress = 100;
  let pointsToNext = 0;

  if (nextStage) {
    const range = currentStage.max - currentStage.min;
    const currentProgress = besScore - currentStage.min;
    progress = Math.round((currentProgress / range) * 100);
    progress = Math.max(0, Math.min(100, progress));
    pointsToNext = nextStage.min - besScore;
  }

  return {
    currentStage,
    nextStage,
    progress,
    pointsToNext
  };
}

export function generateAIDiagnostics(besScore: number, entitiesCount: any) {
  const { currentStage, nextStage } = getMaturityInfo(besScore);
  
  // Basic algorithm to determine bottlenecks and recommendations based on entity counts
  let bottlenecks = [];
  let recommendations = [];
  
  if (entitiesCount.products === 0) {
    bottlenecks.push("Sem produtos ou serviços estruturados");
    recommendations.push({ title: "Publicar o primeiro produto", impact: "+15 BES", action: "Criar Produto" });
  }
  if (entitiesCount.clients < 3) {
    bottlenecks.push("Base de clientes embrionária");
    recommendations.push({ title: "Fechar três contratos", impact: "+24 BES", action: "Cadastrar Cliente" });
  }
  if (entitiesCount.financeEntries === 0) {
    bottlenecks.push("Processos financeiros inexistentes");
    recommendations.push({ title: "Organizar o financeiro", impact: "+40 BES", action: "Registrar Receita" });
  }
  if (entitiesCount.projects === 0) {
    bottlenecks.push("Falta de organização operacional");
    recommendations.push({ title: "Estruturar pipeline de projetos", impact: "+15 BES", action: "Criar Projeto" });
  }
  
  if (recommendations.length === 0 && nextStage) {
      recommendations.push({ title: `Acelerar operação para atingir ${nextStage.label}`, impact: `+${nextStage.min - besScore} BES`, action: "Continuar execução" });
  }
  
  return {
    diagnostics: `Sua empresa apresenta boa capacidade operacional no nível ${currentStage.label}. Os principais gargalos estão em ${bottlenecks.length > 0 ? bottlenecks.join(' e ') : 'escalabilidade'}. A IA estima que, executando as recomendações sugeridas, sua maturidade poderá evoluir para ${nextStage ? nextStage.label : 'o topo'} nas próximas semanas.`,
    reasons: bottlenecks.length > 0 ? bottlenecks : ["Falta de volume de transações", "Processos não automatizados"],
    recommendations
  };
}
