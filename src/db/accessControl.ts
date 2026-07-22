export enum WorkspaceRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  DESIGNER = 'DESIGNER',
  FINANCE = 'FINANCE',
  VIEWER = 'VIEWER',
  MEMBER = 'MEMBER'
}

export type Permission =
  | 'manage_members'
  | 'create_projects'
  | 'edit_projects'
  | 'delete_projects'
  | 'view_finance'
  | 'manage_finance'
  | 'manage_ai'
  | 'manage_integrations'
  | 'manage_settings'
  | 'create_products'
  | 'publish_products';

const RolePermissions: Record<WorkspaceRole, Permission[]> = {
  [WorkspaceRole.OWNER]: [
    'manage_members','create_projects','edit_projects','delete_projects','view_finance','manage_finance','manage_ai','manage_integrations','manage_settings','create_products','publish_products'
  ],
  [WorkspaceRole.ADMIN]: [
    'manage_members','create_projects','edit_projects','delete_projects','view_finance','manage_finance','manage_ai','manage_integrations','manage_settings','create_products','publish_products'
  ],
  [WorkspaceRole.MANAGER]: ['create_projects','edit_projects','create_products'],
  [WorkspaceRole.DEVELOPER]: ['edit_projects','publish_products'],
  [WorkspaceRole.DESIGNER]: ['edit_projects'],
  [WorkspaceRole.FINANCE]: ['view_finance','manage_finance'],
  [WorkspaceRole.VIEWER]: [],
  [WorkspaceRole.MEMBER]: ['edit_projects']
};

export type MembershipProfile = {
  role: WorkspaceRole | string;
  permissions?: string[];
};

export function getMembershipAccess(profile: MembershipProfile) {
  const role = (profile.role || 'MEMBER') as WorkspaceRole;
  const rolePerms = RolePermissions[role as WorkspaceRole] || [];
  const explicit = Array.isArray(profile.permissions) ? profile.permissions : [];
  const combined = new Set<string>([...rolePerms, ...explicit]);

  const moduleMap: Record<string, string[]> = {
    owner: ['dashboard','crm','projetos','agenda','financeiro','clientes','career-hub','teams','integracoes','configuracoes','permissoes','billing','empresa','documentacao','ia','automações','relatorios'],
    manager: ['dashboard','projetos','crm','equipe','career-hub','agenda','clientes','documentacao','ia','automações','relatorios'],
    employee: ['adaptive-workspace','projetos','agenda','crm','documentacao','clientes','career-hub','equipe','ia','fluxos','automações']
  };

  return {
    canAccessModule(id: string) {
      // map high level accesses
      if (combined.has('manage_settings') || combined.has('manage_integrations')) {
        if (id === 'configuracoes' || id === 'integracoes') return true;
      }
      if (combined.has('view_finance') && id === 'financeiro') return true;

      const normalizedRole = (role as string).toLowerCase();

      // Managers do not see billing/finance by default unless granted explicit permission
      if ((normalizedRole.includes('manager') || normalizedRole.includes('admin')) && id === 'financeiro') {
        return combined.has('view_finance');
      }
      if (normalizedRole.includes('owner') && moduleMap.owner.includes(id)) return true;
      if (normalizedRole.includes('admin') && moduleMap.owner.includes(id)) return true;
      if (normalizedRole.includes('manager') && moduleMap.manager.includes(id)) return true;
      if (normalizedRole.includes('member') || normalizedRole.includes('employee') || normalizedRole.includes('developer') || normalizedRole.includes('designer')) {
        return moduleMap.employee.includes(id) || moduleMap.manager.includes(id);
      }
      return false;
    }
  };
}

export type WorkspaceModule = { id: string; label: string };

export function getSidebarModules(profile: MembershipProfile): WorkspaceModule[] {
  const access = getMembershipAccess(profile);
  const all: WorkspaceModule[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'crm', label: 'CRM' },
    { id: 'projetos', label: 'Projetos' },
    { id: 'agenda', label: 'Agenda' },
    { id: 'financeiro', label: 'Financeiro' },
    { id: 'clientes', label: 'Clientes' },
    { id: 'career-hub', label: 'Career Hub' },
    { id: 'equipe', label: 'Equipe' },
    { id: 'documentacao', label: 'Documentação' },
    { id: 'ia', label: 'IA' },
    { id: 'fluxos', label: 'Fluxos' },
    { id: 'automações', label: 'Automações' },
    { id: 'configuracoes', label: 'Configurações' },
    { id: 'integracoes', label: 'Integrações' }
  ];

  return all.filter(m => access.canAccessModule(m.id));
}

export default { getMembershipAccess, getSidebarModules };
