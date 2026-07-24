# Cyzor Control - BOS Architecture Documentation

## Visão Geral

O CYZOR Control foi transformado em um **Business Operating System (BOS)** verdadeiramente modular, escalável e orientado a IA. Esta documentação descreve a nova arquitetura, seus componentes e como utilizá-la.

## Princípios Arquiteturais

- **Platform Core First**: Toda funcionalidade depende do núcleo da plataforma
- **Resource-Driven Permissions**: Permissões granulares baseadas em `module.resource.action`
- **Module Independence**: Módulos não dependem uns dos outros
- **Event-Driven**: Comunicação via eventos, nunca chamadas diretas
- **AI First**: IA integrada em todos os módulos
- **API First**: Toda funcionalidade exposta via API
- **Incremental Migration**: Compatibilidade total com código legado durante a transição

## Arquitetura de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATIONS / WIDGETS                    │
├─────────────────────────────────────────────────────────────┤
│                    AUTHORIZATION ENGINE                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Role      │  │  Policy     │  │   Permission        │ │
│  │   Engine    │  │  Engine     │  │   Cache             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                     MODULE REGISTRY                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Module    │  │  Resource   │  │   Feature Flags     │ │
│  │   Manifest  │  │  Registry   │  │   Service           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       PLATFORM CORE                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  Identity   │  │   Tenant    │  │   Workspace         │ │
│  │   Service   │  │   Service   │  │   Service           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │    Auth     │  │    Audit    │  │   Event Bus         │ │
│  │  Service    │  │  Service    │  │                     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      DATABASE LAYER                         │
│  PostgreSQL + Drizzle ORM                                   │
└─────────────────────────────────────────────────────────────┘
```

## Estrutura de Diretórios

```
src/
 ├── lib/
 │   └── bos/
 │       ├── authorization/
 │       │   ├── AuthorizationEngine.ts    # Motor central de autorização
 │       │   ├── RoleEngine.ts             # Gerenciamento de roles com herança
 │       │   ├── PolicyEngine.ts           # Policies por recurso
 │       │   └── index.ts                  # Exports
 │       ├── module-registry/
 │       │   ├── ModuleRegistry.ts         # Registro e descoberta de módulos
 │       │   └── index.ts
 │       ├── feature-flags/
 │       │   ├── FeatureFlagService.ts     # Feature flags por tenant/workspace
 │       │   └── index.ts
 │       ├── audit/
 │       │   ├── AuditService.ts           # Audit logging centralizado
 │       │   └── index.ts
 │       └── index.ts                      # BOS Core exports
 ├── middleware/
 │   └── bosAuthorization.ts               # Middleware unificado de autorização
 ├── hooks/
 │   ├── useAuthorization.ts               # Hook principal de autorização
 │   ├── usePermissions.ts                 # Hook de permissões (legacy + BOS)
 │   └── ...
 └── components/
     └── authorization/
         ├── Can.tsx                       # Renderiza se tem permissão
         ├── Cannot.tsx                    # Renderiza se NÃO tem permissão
         ├── PermissionGate.tsx            # Gate de permissão
         ├── FeatureGate.tsx               # Gate de feature flag
         └── RoleBadge.tsx                 # Badge visual de role
```

## Autorização

### Permission Slugs

Toda permissão segue o padrão: `module.resource.action`

Exemplos:
- `finance.entries.view`
- `finance.entries.create`
- `finance.entries.delete`
- `crm.clients.view`
- `crm.clients.export`
- `projects.tasks.assign`
- `projects.projects.archive`

### Actions Padrão

- `view` - Visualizar
- `create` - Criar
- `edit` - Editar
- `delete` - Excluir
- `archive` - Arquivar
- `export` - Exportar
- `import` - Importar
- `approve` - Aprovar
- `assign` - Atribuir
- `comment` - Comentar
- `manage` - Gerenciar (admin)
- `view_own` - Ver apenas próprios
- `edit_own` - Editar apenas próprios

### Hierarquia de Roles

```
OWNER (priority: 100)
 └── ADMIN (priority: 90)
      └── MANAGER (priority: 70)
           └── SUPERVISOR (priority: 50)
                └── MEMBER (priority: 20)
                     └── VIEWER (priority: 10)
```

Cada role herda permissões da role pai automaticamente.

### Authorization Engine API

```typescript
import { authorizationEngine } from '@/lib/bos';

// Verificar permissão
const result = await authorizationEngine.can(context, 'finance.entries.view');
if (result.allowed) {
  // Permitir acesso
}

// Verificar role
const isOwner = await authorizationEngine.hasRole(context, 'owner');

// Verificar feature
const hasFeature = await authorizationEngine.hasFeature(context, 'ai_module_enabled');

// Obter permissões efetivas
const perms = await authorizationEngine.getEffectivePermissions(context);

// Obter módulos acessíveis
const modules = await authorizationEngine.getAccessibleModules(context);
```

## Module Registry

### Registro de Módulo

```typescript
import { moduleRegistry } from '@/lib/bos';

await moduleRegistry.registerModule({
  id: 'my-module',
  slug: 'my-module',
  name: 'Meu Módulo',
  description: 'Descrição do módulo',
  icon: 'box',
  category: 'business',
  version: '1.0.0',
  status: 'active',
  dependencies: ['core', 'auth'],
  routes: [
    { path: '/my-module', method: 'GET', permission: 'my-module.view' }
  ],
  menus: [
    { id: 'my-module', label: 'Meu Módulo', icon: 'box', path: '/my-module', order: 5 }
  ],
  widgets: [
    { id: 'my-widget', type: 'chart', title: 'Meu Widget', size: 'medium', order: 1 }
  ],
  resources: [
    {
      slug: 'my-module.resource',
      name: 'Recurso',
      tableName: 'my_resources',
      actions: ['view', 'create', 'edit', 'delete']
    }
  ],
  actions: [
    { slug: 'view', name: 'Visualizar' },
    { slug: 'create', name: 'Criar' }
  ],
  events: [
    { name: 'ResourceCreated', payload: { resourceId: 'number' } }
  ],
  automations: [],
  aiTools: [],
  dashboard: { widgets: ['my-widget'], defaultLayout: 'grid' },
  permissions: ['my-module.resource.view', 'my-module.resource.create']
}, tenantId);
```

### Descoberta Automática

```typescript
const modules = await moduleRegistry.getAllModules(tenantId);
const resources = await moduleRegistry.getModuleResources('finance', tenantId);
const permissions = await moduleRegistry.getModulePermissions('finance', tenantId);
```

## Frontend

### useAuthorization Hook

```typescript
import { useAuthorization } from '@/hooks/useAuthorization';

function MyComponent() {
  const { can, hasFeature, getAccessibleModules } = useAuthorization();
  
  const canEdit = await can('projects.tasks.edit', 'tasks', taskId);
  const hasAI = await hasFeature('ai_module_enabled');
  
  return (
    <div>
      {canEdit && <button>Editar</button>}
      {hasAI && <AIComponent />}
    </div>
  );
}
```

### Componentes de Autorização

```typescript
import { Can, Cannot, PermissionGate, FeatureGate } from '@/components/authorization';

// Renderiza children se tem permissão
<Can permission="finance.entries.create">
  <button>Criar Lançamento</button>
</Can>

// Renderiza fallback se NÃO tem permissão
<Can permission="finance.entries.delete" fallback={<span>Acesso negado</span>}>
  <button>Excluir</button>
</Can>

// Gate com recurso específico
<PermissionGate permission="projects.tasks.edit" resourceType="tasks" resourceId={taskId}>
  <EditTaskForm />
</PermissionGate>

// Gate de feature flag
<FeatureGate feature="ai_module_enabled">
  <AIAssistant />
</FeatureGate>
```

### usePermissions Hook (Compatibilidade)

```typescript
import { useWorkspacePermissions } from '@/hooks/usePermissions';

function MyComponent() {
  const { canViewFinance, canManageMembers, currentPermissions } = useWorkspacePermissions();
  
  return (
    <div>
      {canViewFinance && <FinanceModule />}
      {canManageMembers && <MembersButton />}
    </div>
  );
}
```

## Middleware

### BOS Authorization Middleware

```typescript
import { bosAuthorize, bosRequireFeature } from '@/middleware/bosAuthorization';

// Proteger rota por permissão
router.post('/finance', bosAuthorize('finance.entries.create', 'finance_entries'), handler);

// Proteger por feature flag
router.get('/ai/chat', bosRequireFeature('ai_module_enabled'), handler);
```

### Middleware Legado (Compatibilidade)

```typescript
import { enforcePermission } from '@/middleware/permission';

// Ainda funciona, faz fallback automático para BOS Engine
router.post('/projects', enforcePermission('manage_projects'), handler);
```

## Seeds

### Executar Seeds

```bash
npx tsx scripts/seed-bos.mjs
```

### Roles Sistema

| Slug | Nome | Descrição | Prioridade |
|------|------|-----------|------------|
| owner | Proprietário | Acesso total | 100 |
| admin | Administrador | Gerenciamento completo | 90 |
| manager | Gerente | Gestão de projetos e equipes | 70 |
| supervisor | Supervisor | Supervisão e aprovações | 50 |
| member | Membro | Membro padrão | 20 |
| viewer | Visualizador | Somente leitura | 10 |

### Módulos Sistema

| Slug | Nome | Categoria |
|------|------|-----------|
| core | Núcleo | system |
| workspace | Workspace | system |
| auth | Autenticação | system |
| finance | Financeiro | business |
| crm | CRM | business |
| projects | Projetos | business |

## Event Bus (Futuro)

Todo módulo registra seus eventos:

```typescript
moduleRegistry.registerModule({
  // ...
  events: [
    { name: 'LeadCreated', payload: { clientId: 'number' } },
    { name: 'InvoicePaid', payload: { entryId: 'number' } }
  ]
});
```

Nenhum módulo chama outro diretamente. Toda comunicação é via eventos.

## Migration Guide

### Fase 1: Fundação (Concluída)
- [x] Novas tabelas de autorização
- [x] Authorization Engine
- [x] Role Engine com herança
- [x] Policy Engine
- [x] Module Registry
- [x] Feature Flags
- [x] Audit Service
- [x] Frontend hooks e componentes
- [x] Middleware unificado
- [x] Seeds de roles e módulos padrão

### Fase 2: Migração de Permissões (Próxima)
1. Migrar permissões legadas para novo formato `module.resource.action`
2. Atualizar `RolePermissions` map para usar tabela `role_permissions`
3. Migrar sidebar para usar Module Registry
4. Atualizar rotas para usar `bosAuthorize`

### Fase 3: Módulos Independentes
1. Criar estrutura de módulo padrão
2. Registrar todos os módulos existentes
3. Implementar Event Bus
4. Implementar Automation Engine

### Fase 4: AI Integration
1. Registrar AI tools por módulo
2. Implementar AI Context Builder
3. Implementar AI Memory por módulo

## Benefícios Alcançados

1. **Escalabilidade**: Novos módulos registram-se automaticamente sem modificar o Core
2. **Segurança**: Autorização centralizada, não espalhada
3. **Performance**: Cache de permissões com invalidação automática
4. **Manutenibilidade**: Lógica de autorização em um único lugar
5. **Extensibilidade**: Novas roles, permissões e módulos via configuração
6. **Multi-tenant**: Isolamento completo por tenant/workspace
7. **Auditabilidade**: Logs estruturados de todas as alterações
8. **AI Ready**: Estrutura preparada para AI tools por módulo

## Próximos Passos

1. **Migração de Dados**: Script para migrar permissões legadas
2. **Atualização de Rotas**: Migrar rotas para usar `bosAuthorize`
3. **Module Manifestos**: Criar manifestos para todos os módulos existentes
4. **Event Bus**: Implementar comunicação entre módulos
5. **Automation Engine**: Registrar triggers, condições e ações
6. **AI Engine**: Registrar tools e context providers por módulo
7. **Dashboard Dinâmico**: Widgets descobertos via Module Registry
8. **Testing**: Testes unitários e integração para o Authorization Engine

## Arquivos Criados/Modificados

### Criados
- `src/lib/bos/authorization/AuthorizationEngine.ts`
- `src/lib/bos/authorization/RoleEngine.ts`
- `src/lib/bos/authorization/PolicyEngine.ts`
- `src/lib/bos/module-registry/ModuleRegistry.ts`
- `src/lib/bos/feature-flags/FeatureFlagService.ts`
- `src/lib/bos/audit/AuditService.ts`
- `src/lib/bos/index.ts`
- `src/middleware/bosAuthorization.ts`
- `src/hooks/useAuthorization.ts`
- `src/hooks/usePermissions.ts`
- `src/components/authorization/Can.tsx`
- `src/components/authorization/Cannot.tsx`
- `src/components/authorization/PermissionGate.tsx`
- `src/components/authorization/FeatureGate.tsx`
- `src/components/authorization/RoleBadge.tsx`
- `src/components/Sidebar.new.tsx`
- `src/components/BottomBar.new.tsx`
- `scripts/seed-bos.mjs`

### Modificados
- `src/db/schema.ts` - Novas tabelas de autorização
- `src/middleware/permission.ts` - Fallback para BOS Engine
- `src/App.tsx` - Import atualizada para usar novo hook de permissões

## Notas Importantes

- **Backward Compatibility**: O código legado continua funcionando. O novo sistema faz fallback automático.
- **Cache**: Permissões são cacheadas por 5 minutos. Invalidados automaticamente em mudanças.
- **Performance**: O Authorization Engine usa LRU cache para evitar consultas repetidas.
- **Segurança**: Nenhuma permissão é hardcoded. Tudo via banco de dados.
- **Multi-tenant**: Isolamento completo por tenant e workspace via AsyncLocalStorage.
