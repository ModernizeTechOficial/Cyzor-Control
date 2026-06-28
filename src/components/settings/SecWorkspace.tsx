import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { Layout, Building2, Activity, Plus, Filter, Loader2, Sparkles, Upload } from 'lucide-react';
import { MiniCard, WorkspaceItem, SelectField, BtnSave, Toast } from './SettingsHelpers';
import AssetUploader from './AssetUploader';

export default function SecWorkspace({ activeWorkspace, onSelect }: { activeWorkspace: string, onSelect: (name: string, id: number) => void }) {
  const { fetchWithAuth, user } = useAuth();
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [companiesList, setCompaniesList] = useState<any[]>([]);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [projectsList, setProjectsList] = useState<any[]>([]);
  const [stats, setStats] = useState({ companies: 0, projects: 0, products: 0, members: 0 });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New workspace modal inline input
  const [showNewModal, setShowNewModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);

  // Default configs states
  const [defaultWorkspaceField, setDefaultWorkspaceField] = useState('Último Acesso');
  const [defaultCompanyField, setDefaultCompanyField] = useState('Nenhuma');
  const [defaultProductField, setDefaultProductField] = useState('Nenhum');
  const [defaultProjectField, setDefaultProjectField] = useState('Nenhum');

  const [logoLightUrl, setLogoLightUrl] = useState('');
  const [logoDarkUrl, setLogoDarkUrl] = useState('');
  const [iconLightUrl, setIconLightUrl] = useState('');
  const [iconDarkUrl, setIconDarkUrl] = useState('');
  const [logoLightSize, setLogoLightSize] = useState('40');
  const [logoDarkSize, setLogoDarkSize] = useState('40');
  const [iconLightSize, setIconLightSize] = useState('20');
  const [iconDarkSize, setIconDarkSize] = useState('20');
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace);

  const handleFileUpload = async (file: File, type: 'logoLight' | 'logoDark' | 'iconLight' | 'iconDark') => {
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logoLight') setLogoLightUrl(result);
        else if (type === 'logoDark') setLogoDarkUrl(result);
        else if (type === 'iconLight') setIconLightUrl(result);
        else setIconDarkUrl(result);
      };
      reader.readAsDataURL(file);
      setToast({ message: "Upload simulado com sucesso!", type: "success" });
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro ao fazer upload.", type: "error" });
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch detailed workspaces
      const wsRes = await fetchWithAuth('/api/workspaces-detailed');
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        setWorkspacesList(wsData);
      }

      // Fetch active workspace settings
      const settingsRes = await fetchWithAuth('/api/workspace-settings');
      if (settingsRes.ok) {
        const sData = await settingsRes.json();
        setStats(sData.stats);
        const settings = sData.workspace.settings || {};
        setLogoLightUrl(settings.logoLightUrl || '');
        setLogoDarkUrl(settings.logoDarkUrl || '');
        setIconLightUrl(settings.iconLightUrl || '');
        setIconDarkUrl(settings.iconDarkUrl || '');
        setLogoLightSize(settings.logoLightSize || '40');
        setLogoDarkSize(settings.logoDarkSize || '40');
        setIconLightSize(settings.iconLightSize || '20');
        setIconDarkSize(settings.iconDarkSize || '20');
        setWorkspaceName(sData.workspace.name);
      }

      // Fetch user profile and custom defaults
      const userRes = await fetchWithAuth('/api/user-settings');
      if (userRes.ok) {
        const uData = await userRes.json();
        const settings = uData.settings || {};
        setDefaultWorkspaceField(settings.defaultWorkspace || 'Último Acesso');
        setDefaultCompanyField(settings.defaultCompany || 'Nenhuma');
        setDefaultProductField(settings.defaultProduct || 'Nenhum');
        setDefaultProjectField(settings.defaultProject || 'Nenhum');
      }

      // Fetch companies, products, projects for default selects
      const compRes = await fetchWithAuth('/api/companies');
      if (compRes.ok) {
        const comps = await compRes.json();
        setCompaniesList(comps);
      }
      const prodRes = await fetchWithAuth('/api/products');
      if (prodRes.ok) {
        const prods = await prodRes.json();
        setProductsList(prods);
      }
      const projRes = await fetchWithAuth('/api/projects');
      if (projRes.ok) {
        const projs = await projRes.json();
        setProjectsList(projs);
      }

    } catch (err: any) {
      console.error("Error loading workspaces detail:", err);
      setToast({ message: "Erro ao conectar com o banco de dados.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeWorkspace]);

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      setToast({ message: "Por favor digite o nome do workspace.", type: "error" });
      return;
    }
    try {
      setCreatingWorkspace(true);
      const res = await fetchWithAuth('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWorkspaceName.trim() })
      });
      if (res.ok) {
        const newWs = await res.json();
        setToast({ message: "Workspace criado com sucesso!", type: "success" });
        setNewWorkspaceName('');
        setShowNewModal(false);
        // Swap to the newly created workspace
        onSelect(newWs.name, newWs.id);
      } else {
        setToast({ message: "Falha ao criar workspace.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de servidor ao processar.", type: "error" });
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleDuplicateWorkspace = async (id: number) => {
    try {
      const res = await fetchWithAuth(`/api/workspaces/${id}/duplicate`, {
        method: 'POST'
      });
      if (res.ok) {
        setToast({ message: "Workspace duplicado com sucesso!", type: "success" });
        const wsRes = await fetchWithAuth('/api/workspaces-detailed');
        if (wsRes.ok) {
          const wsData = await wsRes.json();
          setWorkspacesList(wsData);
        }
      } else {
        setToast({ message: "Erro ao duplicar workspace.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão.", type: "error" });
    }
  };

  const handleDeleteWorkspace = async (id: number, name: string) => {
    if (activeWorkspace === name) {
      setToast({ message: "Você não pode excluir o Workspace ativo no momento. Troque de workspace primeiro.", type: "error" });
      return;
    }
    if (!confirm(`Tem certeza de que deseja excluir permanentemente o workspace "${name}" e todos os seus recursos?`)) {
      return;
    }
    try {
      const res = await fetchWithAuth(`/api/workspaces/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setToast({ message: "Workspace removido com sucesso!", type: "success" });
        loadData();
      } else {
        const errData = await res.json();
        setToast({ message: errData.error || "Apenas o proprietário pode excluir o workspace.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão.", type: "error" });
    }
  };

  const handleSaveDefaults = async () => {
    try {
      setSaving(true);
      // Fetch current profile to merge settings
      const getRes = await fetchWithAuth('/api/user-settings');
      let currentUsr: any = {};
      if (getRes.ok) {
        currentUsr = await getRes.json();
      }

      const updatedSettings = {
        ...(currentUsr.settings || {}),
        defaultWorkspace: defaultWorkspaceField,
        defaultCompany: defaultCompanyField,
        defaultProduct: defaultProductField,
        defaultProject: defaultProjectField
      };

      const res = await fetchWithAuth('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: currentUsr.displayName,
          phone: currentUsr.phone,
          role: currentUsr.role,
          settings: updatedSettings
        })
      });

      if (res.ok) {
        setToast({ message: "Configurações padrão salvas com sucesso!", type: "success" });
      } else {
        setToast({ message: "Falha ao gravar opções padrão.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de rede.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWorkspace = async () => {
    try {
      setSaving(true);
      const res = await fetchWithAuth('/api/workspace-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workspaceName,
          settings: {
            logoLightUrl,
            logoDarkUrl,
            iconLightUrl,
            iconDarkUrl,
            logoLightSize,
            logoDarkSize,
            iconLightSize,
            iconDarkSize
          }
        })
      });

      if (res.ok) {
        setToast({ message: "Configurações do workspace salvas!", type: "success" });
        // syncSaaSState();
        window.dispatchEvent(new Event('workspaceChanged'));
      } else {
        setToast({ message: "Falha ao gravar configurações do workspace.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de rede.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#111111]" size={36} />
        <span className="text-[#64748B] font-bold text-sm">Carregando dados reais do Workspace...</span>
      </div>
    );
  }

  // Compile options arrays
  const workspaceOptions = ['Último Acesso', ...workspacesList.map(w => w.name)];
  const companyOptions = ['Nenhuma', ...companiesList.map(c => c.name)];
  const productOptions = ['Nenhum', ...productsList.map(p => p.name)];
  const projectOptions = ['Nenhum', ...projectsList.map(p => p.name)];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-display font-bold text-[#111111]">Gerenciamento de Workspace</h2>
        <p className="text-sm text-[#64748B] leading-relaxed">Alterne rapidamente entre empresas, contextos e ambientes de trabalho sem misturar informações.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniCard label="Workspace Ativo" value={activeWorkspace} icon={Layout} highlight />
        <MiniCard label="Empresas Autorizadas" value={stats.companies} icon={Building2} />
        <MiniCard label="Projetos Ativos" value={stats.projects} icon={Activity} />
        <MiniCard label="Produtos" value={stats.products} icon={Layout} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-end border-b border-[#0F172A0F] pb-3">
          <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest">Seus Workspaces</h3>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-[#111111] text-white rounded-[10px] text-xs font-bold hover:bg-black transition-colors" onClick={() => setShowNewModal(true)}>
              <Plus size={14} /> Novo Workspace
            </button>
          </div>
        </div>

        {/* Workspaces list from database */}
        <div className="grid grid-cols-1 gap-3">
          {workspacesList.map((ws) => (
            <WorkspaceItem 
              key={ws.id}
              name={ws.name} 
              company={ws.role === 'OWNER' ? 'Proprietário' : 'Colaborador'} 
              type={ws.plan || 'Pro'} 
              status="Ativo" 
              date={new Date(ws.createdAt || Date.now()).toLocaleDateString('pt-BR')} 
              active={activeWorkspace === ws.name} 
              onSelect={() => onSelect(ws.name, ws.id)} 
              onDuplicate={() => handleDuplicateWorkspace(ws.id)}
              onDelete={() => handleDeleteWorkspace(ws.id, ws.name)}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Configurações de Identidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B]">Nome da Aplicação</label>
            <input type="text" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-[#111111] font-bold" />
          </div>
          <AssetUploader label="Logo (Light)" url={logoLightUrl} onChange={setLogoLightUrl} size={logoLightSize} onSizeChange={setLogoLightSize} onUpload={(f) => handleFileUpload(f, 'logoLight')} />
          <AssetUploader label="Logo (Dark)" url={logoDarkUrl} onChange={setLogoDarkUrl} size={logoDarkSize} onSizeChange={setLogoDarkSize} onUpload={(f) => handleFileUpload(f, 'logoDark')} />
          <AssetUploader label="Ícone (Light)" url={iconLightUrl} onChange={setIconLightUrl} size={iconLightSize} onSizeChange={setIconLightSize} onUpload={(f) => handleFileUpload(f, 'iconLight')} />
          <AssetUploader label="Ícone (Dark)" url={iconDarkUrl} onChange={setIconDarkUrl} size={iconDarkSize} onSizeChange={setIconDarkSize} onUpload={(f) => handleFileUpload(f, 'iconDark')} />
        </div>
        <div className="flex justify-start mt-2">
          <BtnSave label="Salvar Identidade" onClick={handleSaveWorkspace} loading={saving} />
        </div>
      </div>

      {/* Default System Startup settings */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Configurações Padrão</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField label="Workspace padrão ao iniciar sessão" options={workspaceOptions} value={defaultWorkspaceField} onChange={setDefaultWorkspaceField} />
          <SelectField label="Empresa padrão" options={companyOptions} value={defaultCompanyField} onChange={setDefaultCompanyField} />
          <SelectField label="Produto padrão" options={productOptions} value={defaultProductField} onChange={setDefaultProductField} />
          <SelectField label="Projeto padrão" options={projectOptions} value={defaultProjectField} onChange={setDefaultProjectField} />
        </div>
        <div className="flex justify-start mt-2">
          <BtnSave label="Salvar Preferências" onClick={handleSaveDefaults} loading={saving} />
        </div>
      </div>

      {/* Elegant blur Overlay Modal for New Workspace */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-2xl flex flex-col gap-5 border border-[#0F172A0F] animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xl font-display font-bold text-[#111111]">Criar Novo Workspace</h3>
              <p className="text-xs text-[#64748B]">Configura uma nova base limpa para faturamento e gestão separada.</p>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B]">Nome de Identificação</label>
              <input 
                type="text" 
                placeholder="Ex: Marketing Digital, Agência Alpha" 
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-[#111111] font-bold"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-[#0F172A0F]">
              <button 
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2.5 rounded-[12px] text-xs font-bold text-[#64748B] hover:bg-[#FAFAFA] transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateWorkspace}
                disabled={creatingWorkspace}
                className="px-5 py-2.5 rounded-[12px] text-xs font-bold text-white bg-[#111111] hover:bg-black disabled:bg-[#111111]/70 transition-colors flex items-center gap-1.5"
              >
                {creatingWorkspace && <Loader2 className="animate-spin" size={14} />}
                Criar Workspace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
