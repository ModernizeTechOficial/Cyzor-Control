export const BES_THRESHOLDS = {
  INICIAL: 1000,
  ESTRUTURACAO: 3000,
  OPERACAO: 6000,
  CRESCIMENTO: 10000
};

export const ACTIONS = {
  CREATE_COMPANY: 50,
  CREATE_PROJECT: 80,
  CREATE_INITIATIVE: 70,
  CREATE_DOCUMENT: 40,
  COMPLETE_TASK: 30,
  FINISH_SPRINT: 200,
  COMPLETE_PROJECT: 300,
  ADD_CLIENT: 150,
  FIRST_SALE: 300,
  REGISTER_REVENUE: 250,
  CREATE_FINANCE: 120,
  ORGANIZE_CASHFLOW: 200,
  COMPLETE_DOCUMENTATION: 180
};

export function calculateBesFromWorkspace(workspace: any) {
  // Logic to calculate BES from existing workspace data
  // For now, let's assume it's stored in settings
  return workspace?.settings?.besScore || 0;
}

export function getMaturityFromBes(bes: number) {
  // Example logic: maps BES to a percentage/stage
  // "0 – 1000 -> Inicial" (0-100%)
  // "1000 – 3000 -> Estruturação"
  // ...
  // This needs to be refined based on the full range (10000+ -> Escala)
  
  if (bes < BES_THRESHOLDS.INICIAL) return Math.min(100, (bes / BES_THRESHOLDS.INICIAL) * 100);
  if (bes < BES_THRESHOLDS.ESTRUTURACAO) return 100 + Math.min(100, ((bes - BES_THRESHOLDS.INICIAL) / (BES_THRESHOLDS.ESTRUTURACAO - BES_THRESHOLDS.INICIAL)) * 100);
  // ... and so on. Let's keep it simple for now.
  return 64; // Placeholder
}
