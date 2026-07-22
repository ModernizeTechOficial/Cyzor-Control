import { useState } from 'react';
import { 
  Shield, 
  Check, 
  X, 
  Lock, 
  Info,
  ChevronRight,
  Settings,
  GitBranch,
  Package,
  DollarSign,
  BotMessageSquare,
  Users
} from 'lucide-react';

export default function FuncoesTab() {
  const [selectedRoleId, setSelectedRoleId] = useState('manager');

  const roles = [
    { 
      id: 'owner', 
      name: 'Owner (Proprietário)', 
      desc: 'Controle total sobre o workspace e faturamento.', 
      color: 'indigo',
      permissions: ['all']
    },
    { 
      id: 'admin', 
      name: 'Administrator', 
      desc: 'Gerencia membros, configurações e recursos.', 
      color: 'amber',
      permissions: ['all']
    },
    { 
      id: 'manager', 
      name: 'Manager', 
      desc: 'Cria e edita projetos, produtos e ideias.', 
      color: 'emerald',
      permissions: ['create_projects', 'edit_projects', 'view_finance', 'create_products']
    },
    { 
      id: 'developer', 
      name: 'Developer', 
      desc: 'Acesso técnico a projetos, deploys e documentação.', 
      color: 'blue',
      permissions: ['edit_projects', 'publish_products']
    },
    { 
      id: 'designer', 
      name: 'Designer', 
      desc: 'Acesso visual a projetos e documentação.', 
      color: 'rose',
      permissions: ['edit_projects']
    },
    { 
      id: 'finance', 
      name: 'Finance', 
      desc: 'Acesso exclusivo ao módulo financeiro.', 
      color: 'green',
      permissions: ['view_finance', 'manage_finance']
    },
    { 
      id: 'viewer', 
      name: 'Viewer', 
      desc: 'Acesso apenas leitura em todos os módulos.', 
      color: 'slate',
      permissions: []
    }
  ];

  const permissionList = [
    { id: 'manage_members', label: 'Gerenciar Membros', icon: Users },
    { id: 'create_projects', label: 'Criar Projetos', icon: GitBranch },
    { id: 'edit_projects', label: 'Editar Projetos', icon: GitBranch },
    { id: 'delete_projects', label: 'Excluir Projetos', icon: Lock },
    { id: 'view_finance', label: 'Visualizar Financeiro', icon: DollarSign },
    { id: 'manage_finance', label: 'Gerenciar Financeiro', icon: DollarSign },
    { id: 'manage_ai', label: 'Gerenciar IA', icon: BotMessageSquare },
    { id: 'manage_settings', label: 'Configurações do Workspace', icon: Settings },
    { id: 'create_products', label: 'Criar Produtos', icon: Package },
    { id: 'publish_products', label: 'Publicar Produtos (Deploy)', icon: GitBranch }
  ];

  const selectedRole = roles.find((role) => role.id === selectedRoleId) || roles[0];
  const selectedRolePermissionSet = new Set(selectedRole.permissions);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#111111] tracking-tight">Funções & Permissões</h3>
          <p className="text-sm text-[#64748B] font-medium">Defina o que cada membro pode visualizar e realizar no workspace</p>
        </div>
        <div className="bg-neutral-50 px-4 py-2 rounded-xl border border-neutral-100 flex items-center gap-2">
          <Lock size={14} className="text-neutral-500" />
          <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider">Custom Roles em breve</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Roles List */}
        <div className="xl:col-span-1 flex flex-col gap-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`flex flex-col gap-1 p-5 rounded-3xl border text-left transition-all ${
                role.id === selectedRoleId
                  ? 'bg-black border-black text-white shadow-xl shadow-black/10' 
                  : role.id === 'owner' 
                    ? 'bg-black/90 border-black text-white/90 shadow-xl shadow-black/10' 
                    : 'bg-white border-[#0F172A0A] text-[#111111] hover:border-black/10 shadow-[0_4px_20px_rgb(0,0,0,0.01)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold tracking-tight">{role.name}</span>
                <ChevronRight size={14} className={role.id === selectedRoleId ? 'text-white/40' : role.id === 'owner' ? 'text-white/40' : 'text-[#94A3B8]'} />
              </div>
              <p className={`text-[11px] leading-relaxed font-medium ${role.id === selectedRoleId || role.id === 'owner' ? 'text-white/60' : 'text-[#64748B]'}`}>
                {role.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Permissions Grid */}
        <div className="xl:col-span-3 bg-white border border-[#0F172A0A] rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-10 pb-6 border-b border-[#0F172A05]">
            <div className="w-12 h-12 rounded-2xl bg-[#FAFAFA] border border-[#0F172A05] flex items-center justify-center text-[#111111]">
              <Shield size={24} />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#111111] tracking-tight">Permissões de {selectedRole.name}</h4>
              <p className="text-sm text-[#64748B] font-medium italic">{selectedRole.desc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {permissionList.map((perm) => {
              const allowed = selectedRolePermissionSet.has('all') || selectedRolePermissionSet.has(perm.id);
              return (
                <div key={perm.id} className="flex items-start justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8] group-hover:bg-[#111111] group-hover:text-white transition-all">
                      <perm.icon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-[#111111]">{perm.label}</span>
                      <span className="text-[11px] text-[#64748B] font-medium uppercase tracking-widest">{allowed ? 'Acesso habilitado' : 'Sem acesso'}</span>
                    </div>
                  </div>
                  <div className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center ${allowed ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-100 border-slate-200 text-slate-400'}`}>
                    {allowed ? <Check size={14} strokeWidth={3} /> : <X size={14} strokeWidth={3} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 p-6 bg-indigo-50/30 rounded-3xl border border-indigo-100/50 flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
              <Info size={20} />
            </div>
            <div className="flex flex-col gap-1">
              <h5 className="text-sm font-bold text-indigo-900 tracking-tight">Sobre a Herança de Permissões</h5>
              <p className="text-xs text-indigo-800/70 font-medium leading-relaxed">
                As permissões são cumulativas e baseadas na hierarquia do RBAC. No futuro, você poderá criar papéis customizados e atribuir permissões granulares para cada recurso específico do seu workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

