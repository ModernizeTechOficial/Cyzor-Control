import { 
  Play, Zap, Split, StopCircle, Globe, Mail, 
  MessageSquare, Terminal, Database, Table, 
  Layout, Type, ArrowRight, MousePointer2,
  Lock, RefreshCw, Activity, Link, Hash,
  Share2, Code, Send, Info, Layers,
  Box, MousePointer, AlignLeft, List,
  Eye, FileCode, ShieldAlert
} from 'lucide-react';
import { SystemType } from './types';

import { 
  RegistryNode, RegistryCategory, Plugin, NodeSource
} from './types';

export const CORE_NODES: RegistryCategory[] = [
  {
    id: 'api',
    label: 'API & Integrações',
    nodes: [
      { 
        type: 'endpoint', 
        label: 'API Endpoint', 
        icon: Globe, 
        description: 'Ponto de extremidade da API', 
        category: 'api', 
        color: 'text-purple-600 bg-purple-50', 
        source: 'core',
        properties: [
          { id: 'path', label: 'Caminho (URL)', type: 'string', placeholder: '/api/v1/resource', validation: { required: true, regex: '^/' }, group: 'Configuração' },
          { id: 'method', label: 'Método HTTP', type: 'select', defaultValue: 'GET', options: [
            { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }, { label: 'PATCH', value: 'PATCH' },
          ], group: 'Configuração' },
          { id: 'auth_type', label: 'Autenticação', type: 'select', defaultValue: 'none', options: [
            { label: 'Nenhum', value: 'none' }, { label: 'Bearer Token', value: 'bearer' }, { label: 'API Key', value: 'apikey' }, { label: 'OAuth2', value: 'oauth2' },
          ], group: 'Segurança' },
          { id: 'bearer_token', label: 'Token', type: 'string', dependency: { property: 'auth_type', equals: 'bearer' }, group: 'Segurança' },
          { id: 'rate_limit', label: 'Rate Limit (req/min)', type: 'number', defaultValue: 60, group: 'Performance' },
          { id: 'timeout', label: 'Timeout (ms)', type: 'number', defaultValue: 30000, group: 'Performance' },
          { id: 'cache_enabled', label: 'Habilitar Cache', type: 'boolean', defaultValue: false, group: 'Performance' },
          { id: 'response_schema', label: 'Schema de Resposta (JSON)', type: 'code', placeholder: '{\n  "status": "ok"\n}', group: 'Documentação' },
        ]
      },
      { 
        type: 'http_request', 
        label: 'HTTP Request', 
        icon: Send, 
        description: 'Faz uma chamada externa', 
        category: 'api', 
        color: 'text-blue-600 bg-blue-50', 
        source: 'core',
        properties: [
          { id: 'url', label: 'URL de Destino', type: 'string', validation: { required: true }, group: 'Request' },
          { id: 'method', label: 'Método', type: 'select', defaultValue: 'POST', options: [
            { label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' },
          ], group: 'Request' },
          { id: 'headers', label: 'Headers', type: 'header_list', group: 'Payload' },
          { id: 'body_type', label: 'Tipo do Body', type: 'select', defaultValue: 'json', options: [
            { label: 'JSON', value: 'json' }, { label: 'Form Data', value: 'form' }, { label: 'Raw', value: 'raw' },
          ], group: 'Payload' },
          { id: 'body', label: 'Payload', type: 'code', dependency: { property: 'body_type', equals: 'json' }, group: 'Payload' },
          { id: 'retries', label: 'Tentativas', type: 'number', defaultValue: 3, group: 'Resiliência' },
        ]
      },
      { 
        type: 'webhook', 
        label: 'Webhook', 
        icon: Terminal, 
        description: 'Recebe dados externos', 
        category: 'api', 
        color: 'text-cyan-600 bg-cyan-50', 
        source: 'core',
        properties: [
          { id: 'webhook_url', label: 'Webhook URL', type: 'string', group: 'Geral' },
          { id: 'secret', label: 'Signing Secret', type: 'string', group: 'Segurança' },
        ]
      },
      {
        type: 'queue',
        label: 'Message Queue',
        icon: Layers,
        description: 'Fila de processamento assíncrono',
        category: 'api',
        color: 'text-rose-600 bg-rose-50',
        source: 'core',
        properties: [
          { id: 'provider', label: 'Provedor', type: 'select', defaultValue: 'redis', options: [
            { label: 'Redis', value: 'redis' }, { label: 'SQS', value: 'sqs' }, { label: 'RabbitMQ', value: 'rabbitmq' },
          ], group: 'Geral' },
          { id: 'queue_name', label: 'Nome da Fila', type: 'string', validation: { required: true }, group: 'Geral' },
          { id: 'retention', label: 'Retenção (segundos)', type: 'number', defaultValue: 3600, group: 'Configuração' },
        ]
      }
    ]
  },
  {
    id: 'database',
    label: 'Banco de Dados',
    nodes: [
      { 
        type: 'table', 
        label: 'Tabela', 
        icon: Table, 
        description: 'Entidade de banco de dados', 
        category: 'database', 
        color: 'text-emerald-600 bg-emerald-50', 
        source: 'core',
        properties: [
          { id: 'table_name', label: 'Nome da Tabela', type: 'string', validation: { required: true }, group: 'Geral' },
          { id: 'schema', label: 'Schema', type: 'string', defaultValue: 'public', group: 'Geral' },
          { id: 'engine', label: 'Engine', type: 'select', defaultValue: 'InnoDB', options: [
            { label: 'InnoDB', value: 'InnoDB' }, { label: 'MyISAM', value: 'MyISAM' },
          ], group: 'Avançado' },
          { id: 'columns', label: 'Colunas', type: 'column_list', group: 'Estrutura' },
        ]
      },
      { 
        type: 'relation', 
        label: 'Relação', 
        icon: Link, 
        description: 'Conector entre tabelas', 
        category: 'database', 
        color: 'text-blue-600 bg-blue-50', 
        source: 'core',
        properties: [
          { id: 'rel_type', label: 'Tipo de Relação', type: 'select', defaultValue: 'one_to_many', options: [
            { label: '1:1 (One to One)', value: 'one_to_one' }, { label: '1:N (One to Many)', value: 'one_to_many' }, { label: 'N:N (Many to Many)', value: 'many_to_many' },
          ], group: 'Configuração' },
          { id: 'on_delete', label: 'On Delete', type: 'select', defaultValue: 'CASCADE', options: [
            { label: 'CASCADE', value: 'CASCADE' }, { label: 'SET NULL', value: 'SET NULL' }, { label: 'RESTRICT', value: 'RESTRICT' },
          ], group: 'Integridade' },
        ]
      },
      {
        type: 'index',
        label: 'Índice',
        icon: Hash,
        description: 'Otimização de busca',
        category: 'database',
        color: 'text-amber-600 bg-amber-50',
        source: 'core',
        properties: [
          { id: 'index_name', label: 'Nome do Índice', type: 'string', validation: { required: true }, group: 'Geral' },
          { id: 'unique', label: 'Único (Unique)', type: 'boolean', defaultValue: false, group: 'Geral' },
          { id: 'columns', label: 'Colunas', type: 'string', group: 'Estrutura' },
        ]
      }
    ]
  },
  {
    id: 'flow',
    label: 'Lógica & Fluxo',
    nodes: [
      { type: 'start', label: 'Início', icon: Play, description: 'Início do fluxo', category: 'flow', color: 'text-emerald-600 bg-emerald-50', source: 'core', properties: [] },
      { type: 'end', label: 'Fim', icon: StopCircle, description: 'Fim do fluxo', category: 'flow', color: 'text-rose-600 bg-rose-50', source: 'core', properties: [] },
      { 
        type: 'action', 
        label: 'Ação', 
        icon: Zap, 
        description: 'Executa uma tarefa', 
        category: 'flow', 
        color: 'text-blue-600 bg-blue-50', 
        source: 'core',
        properties: [
          { id: 'action_type', label: 'Tipo de Ação', type: 'string', group: 'Geral' },
        ]
      },
      { 
        type: 'condition', 
        label: 'Condição', 
        icon: Split, 
        description: 'IF/ELSE lógico', 
        category: 'flow', 
        color: 'text-amber-600 bg-amber-50', 
        source: 'core',
        properties: [
          { id: 'expression', label: 'Expressão Lógica', type: 'code', validation: { required: true }, group: 'Lógica' },
          { id: 'operator', label: 'Operador', type: 'select', defaultValue: 'AND', options: [
            { label: 'AND', value: 'AND' }, { label: 'OR', value: 'OR' },
          ], group: 'Lógica' },
        ]
      },
      { 
        type: 'loop', 
        label: 'Loop', 
        icon: RefreshCw, 
        description: 'Repete operações', 
        category: 'flow', 
        color: 'text-indigo-600 bg-indigo-50', 
        source: 'core',
        properties: [
          { id: 'iterator', label: 'Variável Iterator', type: 'string', defaultValue: 'item', group: 'Configuração' },
          { id: 'collection', label: 'Coleção (Array)', type: 'string', group: 'Configuração' },
        ]
      },
      {
        type: 'cache',
        label: 'Cache Node',
        icon: Activity,
        description: 'Persistência em cache (Redis)',
        category: 'flow',
        color: 'text-emerald-600 bg-emerald-50',
        source: 'core',
        properties: [
          { id: 'ttl', label: 'Tempo de Vida (TTL)', type: 'number', defaultValue: 3600, group: 'Geral' },
          { id: 'key_pattern', label: 'Padrão da Chave', type: 'string', placeholder: 'user:{{id}}', group: 'Geral' },
        ]
      },
      {
        type: 'auth',
        label: 'Autenticação',
        icon: Lock,
        description: 'Verifica permissões',
        category: 'flow',
        color: 'text-slate-600 bg-slate-50',
        source: 'core',
        properties: [
          { id: 'provider', label: 'Provedor', type: 'select', defaultValue: 'jwt', options: [
            { label: 'JWT', value: 'jwt' }, { label: 'OAuth2', value: 'oauth2' }, { label: 'Sessão', value: 'session' },
          ], group: 'Configuração' },
        ]
      }
    ]
  },
  {
    id: 'infographic',
    label: 'Visual & UI',
    nodes: [
      { 
        type: 'block', 
        label: 'Bloco de Texto', 
        icon: AlignLeft, 
        description: 'Conteúdo estruturado', 
        category: 'infographic', 
        color: 'text-[#111111] bg-[#FAFAFA]', 
        source: 'core',
        properties: [
          { id: 'content', label: 'Conteúdo', type: 'code', group: 'Estilo' },
          { id: 'text_align', label: 'Alinhamento', type: 'select', defaultValue: 'left', options: [
            { label: 'Esquerda', value: 'left' }, { label: 'Centro', value: 'center' }, { label: 'Direita', value: 'right' },
          ], group: 'Estilo' },
        ]
      },
      { type: 'step', label: 'Passo', icon: MousePointer, description: 'Etapa do processo', category: 'infographic', color: 'text-blue-600 bg-blue-50', source: 'core', properties: [] },
      { type: 'card', label: 'Card', icon: Box, description: 'Container visual', category: 'infographic', color: 'text-slate-600 bg-slate-50', source: 'core', properties: [] },
      { type: 'timeline', label: 'Linha do Tempo', icon: List, description: 'Passos sequenciais', category: 'infographic', color: 'text-purple-600 bg-purple-50', source: 'core', properties: [] }
    ]
  }
];

export const PLUGIN_MARKETPLACE: Plugin[] = [
  {
    id: 'stripe-integration',
    name: 'Stripe Payments',
    description: 'Processamento de pagamentos e assinaturas.',
    version: '1.0.2',
    author: 'Visual Systems',
    isInstalled: false,
    installCount: 1240,
    nodes: [
      { type: 'stripe_charge', label: 'Charge Customer', icon: Zap, description: 'Cobra um cliente', category: 'api', color: 'text-indigo-600 bg-indigo-50', source: 'plugin', properties: [] },
      { type: 'stripe_subscription', label: 'Create Subscription', icon: RefreshCw, description: 'Cria assinatura', category: 'api', color: 'text-indigo-600 bg-indigo-50', source: 'plugin', properties: [] }
    ]
  },
  {
    id: 'ai-vision',
    name: 'AI Vision & Image',
    description: 'Processamento de imagens via IA.',
    version: '2.1.0',
    author: 'DeepMind',
    isInstalled: false,
    installCount: 850,
    nodes: [
      { type: 'ai_describe', label: 'Describe Image', icon: Globe, description: 'Descreve imagem', category: 'api', color: 'text-purple-600 bg-purple-50', source: 'ai_generated', properties: [] },
      { type: 'ai_ocr', label: 'OCR Text', icon: Terminal, description: 'Extrai texto', category: 'api', color: 'text-purple-600 bg-purple-50', source: 'ai_generated', properties: [] }
    ]
  }
];

export const getTenantRegistry = (installedPlugins: string[], customNodes: RegistryNode[] = [], mode: SystemType): RegistryCategory[] => {
  const allNodes: RegistryNode[] = [
    ...CORE_NODES.flatMap(c => c.nodes),
    ...PLUGIN_MARKETPLACE.filter(p => installedPlugins.includes(p.id)).flatMap(p => p.nodes),
    ...customNodes
  ];

  const categories: Record<string, string> = {
    'api': 'API & Integrações',
    'database': 'Banco de Dados',
    'flow': 'Lógica & Fluxo',
    'infographic': 'Visual & UI'
  };

  return Object.entries(categories)
    .map(([id, label]) => ({
      id,
      label,
      nodes: allNodes.filter(n => n.category === id)
    }));
};
