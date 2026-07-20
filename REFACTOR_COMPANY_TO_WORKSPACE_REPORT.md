REFATORAÇÃO: Company -> Workspace

Resumo:
- Foram encontrados 357 ocorrências em 53 arquivos que referenciam "Company"/"companyId"/"company".
- Objetivo: criar uma camada de adaptação que exponha `Empresa` (frontend) enquanto o domínio interno permanece `Workspace`.

Hotspots (arquivos com uso significativo — revisar manualmente):
- src/db/schema.ts
- src/db/api.ts
- src/components/empresas/*
- src/components/EmpresasView.tsx
- src/components/CompanyModal.tsx
- src/components/Company360View.tsx
- src/components/ClientesView.tsx
- src/components/ProjetosView.tsx
- src/components/ProdutosView.tsx
- src/context/NavigationContext.tsx
- src/components/OnboardingWizard.tsx
- src/components/Topbar.tsx
- src/components/Sidebar.tsx
- src/hooks/useURLSync.ts
- src/modules/admin/views/CompaniesAdminView.tsx
- src/services/EventCascadeService.ts
- src/services/WorkspaceTemplateService.ts

Recomendações iniciais (fases):
1) Adaptação não destrutiva (Fase 0 - implementada parcialmente agora):
   - `useBusinessContext()` hook (frontend) consumindo `useAuth()` / `activeWorkspace` e expondo campos públicos: `companyId`, `companyName`, `companySlug`, `companyLogo`, `companyPlan`, `companyPermissions`, `companySettings`.
   - `empresaApi.ts` adapter que expõe `listarEmpresas`, `buscarEmpresa`, `criarEmpresa`, `editarEmpresa`, `removerEmpresa` e internamente chama endpoints de `workspace` (`/api/workspaces`).
   - Atualizar componentes-chave (Topbar, Sidebar, OnboardingWizard) para consumir `useBusinessContext` em vez de `globalFilters.companyId` diretamente.

2) Refatoração incremental do frontend:
   - Criar wrappers com nomenclatura em português (ex: `EmpresaHeader` que exporta/componho o componente existente).
   - Gradualmente migrar referências de `companyId` para `workspace_id` internamente.

3) Backend e DB:
   - Planejar migração de `companies` -> `workspaces` ou mapear `workspace_id` nas tabelas existentes.
   - Mudar serviços para usar `WorkspaceService` e `workspace_id`.

4) Testes, rollout e remoção de legados.

Anexo: lista parcial de arquivos onde `company` aparece (necessário revisão manual):
(gerado a partir de busca no código)

"src/agenda/modals/EventModal.tsx"
"src/ai/AIEngine.ts"
"src/ai/context/ContextBuilder.ts"
"src/ai/controllers/AIController.ts"
"src/components/CentralPrioridades.tsx"
"src/components/ClientesView.tsx"
"src/components/common/EntityHero.tsx"
"src/components/common/Vision360.tsx"
"src/components/Company360View.tsx"
"src/components/CompanyModal.tsx"
"src/components/CompanyModuleModal.tsx"
"src/components/dashboard/ActivityTimeline.tsx"
"src/components/DashboardView.tsx"
"src/components/DocEditorModal.tsx"
"src/components/empresas/Charts.tsx"
"src/components/empresas/CompanyActivity.tsx"
"src/components/empresas/CompanyTable.tsx"
"src/components/empresas/UpcomingEvents.tsx"
"src/components/EmpresasView.tsx"
"src/components/FinanceEntryModal.tsx"
"src/components/FinanceiroView.tsx"
"src/components/home/HomeAnalytics.tsx"
"src/components/home/HomeWorkspace.tsx"
"src/components/IdeaDetailsModal.tsx"
"src/components/layout/ContextBanner.tsx"
"src/components/NewProductModal.tsx"
"src/components/NewProjectModal.tsx"
"src/components/OnboardingWizard.tsx"
"src/components/produtos/workspace/ProductWorkspaceModal.tsx"
"src/components/produtos/workspace/tabs/ClientesTab.tsx"
"src/components/produtos/workspace/tabs/LicencasTab.tsx"
"src/components/produtos/workspace/tabs/VisaoGeralTab.tsx"
"src/components/produtos/workspace/WorkspaceHeader.tsx"
"src/components/ProdutosView.tsx"
"src/components/project-tabs/AbaVisaoGeral.tsx"
"src/components/ProjectDetailsModal.tsx"
"src/components/ProjetosView.tsx"
"src/components/settings/SecAdminModulos.tsx"
"src/components/settings/SecWorkspace.tsx"
"src/components/settings/SettingsHelpers.tsx"
"src/components/Sidebar.tsx"
"src/components/Topbar.tsx"
"src/context/NavigationContext.tsx"
"src/db/admin.ts"
"src/db/api.ts"
"src/db/schema.ts"
"src/hooks/useURLSync.ts"
"src/modules/admin/views/AIControlCenterView.tsx"
"src/modules/admin/views/CompaniesAdminView.tsx"
"src/services/EventCascadeService.ts"
"src/services/WorkspaceTemplateService.ts"
"src/types/project.ts"

Observação: este relatório é uma visão inicial; recomenda-se revisão manual e priorização dos arquivos a migrar primeiro.
