import { 
  FileText, 
  FileSpreadsheet, 
  FileCode, 
  FileImage, 
  Sliders, 
  AlertCircle
} from 'lucide-react';

export interface DocumentTypeConfig {
  id: string; // 'rich-text', 'spreadsheet', 'presentation', 'code', 'image', 'pdf'
  name: string; // User-facing name (Procedimento, Planilha, Pitch Slide, etc.)
  iconName: 'FileText' | 'FileSpreadsheet' | 'Sliders' | 'FileCode' | 'FileImage';
  defaultFolder: string;
  editorId: string;
  extensions: string[];
  features: string[];
  permissions: {
    canEdit: boolean;
    canShare: boolean;
    canComment: boolean;
  };
  specificConfig: Record<string, any>;
}

export interface CorporateTemplate {
  id: string;
  title: string;
  desc: string;
  documentType: string; // e.g., 'rich-text', 'spreadsheet', 'code', 'presentation'
  folder: string;
  content: string;
  specificConfig?: Record<string, any>;
}

export const DOCUMENT_TYPES: Record<string, DocumentTypeConfig> = {
  'rich-text': {
    id: 'rich-text',
    name: 'Procedimento',
    iconName: 'FileText',
    defaultFolder: 'Geral',
    editorId: 'rich-text',
    extensions: ['.docx', '.txt', '.md', '.rtf'],
    features: ['autosave', 'comments', 'history', 'ai-assistance', 'versioning'],
    permissions: { canEdit: true, canShare: true, canComment: true },
    specificConfig: { enableFormatting: true, showCoverImage: true }
  },
  'spreadsheet': {
    id: 'spreadsheet',
    name: 'Planilha',
    iconName: 'FileSpreadsheet',
    defaultFolder: 'Comercial',
    editorId: 'spreadsheet',
    extensions: ['.xlsx', '.xls', '.csv', '.ods'],
    features: ['autosave', 'formulas', 'charts', 'history'],
    permissions: { canEdit: true, canShare: true, canComment: true },
    specificConfig: { maxRows: 1000, maxCols: 26, enableFormulas: true }
  },
  'presentation': {
    id: 'presentation',
    name: 'Pitch Slide',
    iconName: 'Sliders',
    defaultFolder: 'Planejamento',
    editorId: 'presentation',
    extensions: ['.pptx', '.ppt', '.odp'],
    features: ['autosave', 'animations', 'present-mode'],
    permissions: { canEdit: true, canShare: true, canComment: true },
    specificConfig: { aspectRatios: ['16:9', '4:3'], transitions: true }
  },
  'code': {
    id: 'code',
    name: 'Script Código',
    iconName: 'FileCode',
    defaultFolder: 'Código',
    editorId: 'code',
    extensions: ['.json', '.xml', '.yaml', '.sql', '.log', '.ts', '.js', '.tsx', '.jsx', '.css', '.html', '.py', '.rb', '.go', '.php'],
    features: ['autosave', 'syntax-highlighting', 'code-completion', 'execution'],
    permissions: { canEdit: true, canShare: false, canComment: true },
    specificConfig: { theme: 'vs-dark', tabSize: 2, lineNumbers: true }
  },
  'image': {
    id: 'image',
    name: 'Editor Imagem',
    iconName: 'FileImage',
    defaultFolder: 'Design',
    editorId: 'image',
    extensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif', '.bmp', '.tiff'],
    features: ['brush', 'filters', 'ai-adjustments', 'canvas-resize'],
    permissions: { canEdit: true, canShare: true, canComment: false },
    specificConfig: { maxResolution: '4K', formats: ['PNG', 'JPEG', 'WEBP'] }
  },
  'pdf': {
    id: 'pdf',
    name: 'Leitor PDF',
    iconName: 'FileText',
    defaultFolder: 'Contratos',
    editorId: 'pdf',
    extensions: ['.pdf'],
    features: ['viewing', 'signing', 'annotations', 'rubrics'],
    permissions: { canEdit: false, canShare: true, canComment: true },
    specificConfig: { allowAnnotations: true, maxFileSize: '20MB' }
  }
};

export const CORPORATE_TEMPLATES: CorporateTemplate[] = [
  {
    id: 'scope-doc',
    title: 'Modelo de Escopo de Projeto',
    desc: 'Escopo completo, entregáveis e responsabilidades',
    documentType: 'rich-text',
    folder: 'Planejamento',
    content: `# Escopo do Projeto: [Nome do Projeto]\n\n## 1. Objetivos do Negócio\n[Descreva qual problema de negócio este projeto resolve e qual o impacto esperado]\n\n## 2. Entregas Principais (Deliverables)\n- **Fase 1: Concepção & UI/UX** — Mockups interativos e fluxogramas validados.\n- **Fase 2: Arquitetura & APIs** — Modelagem do banco de dados e endpoints.\n- **Fase 3: Desenvolvimento Core** — Implementação dos módulos principais.\n- **Fase 4: QA & Homologação** — Testes end-to-end, carga e segurança.\n\n## 3. Matriz de Responsabilidades\n| Recurso | Função | Responsabilidade Principal |\n| :--- | :--- | :--- |\n| [Nome] | Product Manager | Gerenciamento de Escopo e Prazos |\n| [Nome] | Tech Lead | Arquitetura de Software e Code Review |\n| [Nome] | Frontend Dev | Interfaces e Experiência do Usuário |\n| [Nome] | Backend Dev | APIs, Integrações e Banco de Dados |`,
    specificConfig: { showHeaderCover: true }
  },
  {
    id: 'sla-contract',
    title: 'SLA - Acordo de Nível de Serviço',
    desc: 'Disponibilidade, severidade e tempos de resposta',
    documentType: 'pdf',
    folder: 'Contratos',
    content: `# Acordo de Nível de Serviço (SLA)\n\n## 1. Objetivos do SLA\nEste acordo define os níveis de serviço e garantias operacionais para a plataforma Cyzor Control.\n\n## 2. Metas de Disponibilidade (Uptime)\n- **Disponibilidade Mensal**: 99.9% (excluindo janelas de manutenção agendadas)\n- **Manutenção Programada**: Avisada com no mínimo 48 horas de antecedência, executada exclusivamente entre 00:00 e 04:00 (BRT).\n\n## 3. Matriz de Severidade & Tempo de Resposta\n| Severidade | Descrição | Resposta Inicial | Solução de Contorno |\n| :--- | :--- | :--- | :--- |\n| **Severidade 1 (Crítica)** | Sistema completamente indisponível | < 15 Minutos | < 2 Horas |\n| **Severidade 2 (Alta)** | Funcionalidade essencial inoperante | < 1 Hora | < 6 Horas |\n| **Severidade 3 (Média)** | Erro pontual com solução alternativa | < 4 Horas | < 24 Horas |`,
    specificConfig: { restrictSigning: true }
  },
  {
    id: 'financial-budget',
    title: 'Orçamento & DRE Anual',
    desc: 'Projeção de fluxo de caixa, receitas e despesas por trimestre',
    documentType: 'spreadsheet',
    folder: 'Comercial',
    content: JSON.stringify({
      sheets: [
        {
          name: "DRE Simplificada",
          cells: {
            "A1": "Demonstrativo de Resultados (DRE)",
            "A3": "Categoria", "B3": "Q1", "C3": "Q2", "D3": "Q3", "E3": "Q4", "F3": "Total",
            "A4": "Receita Operacional Bruta", "B4": "150000", "C4": "180000", "D4": "210000", "E4": "250000", "F4": "=SUM(B4:E4)",
            "A5": "Impostos e Deduções", "B5": "-15000", "C5": "-18000", "D5": "-21000", "E5": "-25000", "F5": "=SUM(B5:E5)",
            "A6": "Receita Líquida", "B6": "=B4+B5", "C6": "=C4+C5", "D6": "=D4+D5", "E6": "=E4+E5", "F6": "=F4+F5",
            "A8": "Custos Operacionais", "B8": "-60000", "C8": "-65000", "D8": "-70000", "E8": "-75000", "F8": "=SUM(B8:E8)",
            "A9": "Margem Bruta", "B9": "=B6+B8", "C9": "=C6+C8", "D9": "=D6+D8", "E9": "=E6+E8", "F9": "=F6+F8",
            "A11": "Despesas Administrativas", "B11": "-30000", "C11": "-32000", "D11": "-31000", "E11": "-35000", "F11": "=SUM(B11:E11)",
            "A12": "EBITDA / Lucro Operacional", "B12": "=B9+B11", "C12": "=C9+C11", "D12": "=D9+D11", "E12": "=E9+E11", "F12": "=F9+F11"
          }
        }
      ]
    }),
    specificConfig: { columnsCount: 8, rowsCount: 20 }
  },
  {
    id: 'api-script',
    title: 'Script de Integração de Webhooks',
    desc: 'Exemplo de handler TypeScript pronto para disparar eventos',
    documentType: 'code',
    folder: 'Código',
    content: `// Handler de Webhook Cyzor Control\nimport { Request, Response } from 'express';\n\nexport async function handleCyzorWebhook(req: Request, res: Response) {\n  const signature = req.headers['cyzor-signature'];\n  if (!signature) {\n    return res.status(401).json({ error: 'Assinatura inválida' });\n  }\n\n  const { event, payload } = req.body;\n  console.log(\`[Webhook] Evento recebido: \${event}\`, payload);\n\n  // Processar evento de forma assíncrona\n  switch (event) {\n    case 'project.created':\n      await syncProjectDatabase(payload);\n      break;\n    default:\n      console.log('Evento desconhecido:', event);\n  }\n\n  return res.json({ received: true });\n}\n\nasync function syncProjectDatabase(data: any) {\n  // Integração com banco corporativo\n}`,
    specificConfig: { language: 'typescript', lineNumbers: true }
  }
];

export function getDocTypeConfig(doc: any): DocumentTypeConfig {
  if (!doc) return DOCUMENT_TYPES['rich-text'];
  
  // 1. Check if type explicitly matches registry
  if (doc.type && DOCUMENT_TYPES[doc.type.toLowerCase()]) {
    return DOCUMENT_TYPES[doc.type.toLowerCase()];
  }
  
  // 2. Otherwise check extensions
  const title = (doc.title || '').toLowerCase().trim();
  for (const config of Object.values(DOCUMENT_TYPES)) {
    if (config.extensions.some(ext => title.endsWith(ext))) {
      return config;
    }
  }

  // 3. Check folder names mapping
  const folder = (doc.folder || '').toLowerCase();
  if (folder === 'design' || folder === 'imagens' || folder === 'design-grafico') {
    return DOCUMENT_TYPES['image'];
  }
  if (folder === 'comercial' || folder === 'financeiro' || folder === 'comercial-financeiro') {
    return DOCUMENT_TYPES['spreadsheet'];
  }
  if (folder === 'planejamento' || folder === 'apresentações' || folder === 'marketing') {
    return DOCUMENT_TYPES['presentation'];
  }
  if (folder === 'contratos' || folder === 'legal' || folder === 'jurídico') {
    return DOCUMENT_TYPES['pdf'];
  }
  if (folder === 'código' || folder === 'codigo' || folder === 'técnicos') {
    return DOCUMENT_TYPES['code'];
  }

  // 4. Default to rich-text
  return DOCUMENT_TYPES['rich-text'];
}
