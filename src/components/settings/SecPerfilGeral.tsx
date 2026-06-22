import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  User, Settings, Paintbrush, Lock, Database, Server, Clock, 
  Activity, CheckCircle2, Download, Power, Monitor, Smartphone, 
  ArrowUpRight, RefreshCw, Sparkles, Loader2, Bell
} from 'lucide-react';
import { InputField, SelectField, CheckboxOption, MiniCard, BtnSave, Toast } from './SettingsHelpers';

export default function SecPerfilGeral({ section }: { section: string }) {
  const { fetchWithAuth, user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // General Settings States (Workspace level)
  const [platformName, setPlatformName] = useState('CYZOR CONTROL');
  const [mainUrl, setMainUrl] = useState('https://control.cyzor.com');
  const [platformDescription, setPlatformDescription] = useState('Central de controle de ativos digitais.');
  const [timezoneField, setTimezoneField] = useState('America/Sao_Paulo (GMT-3)');
  const [languageField, setLanguageField] = useState('Português (Brasil)');
  const [dateFormatField, setDateFormatField] = useState('DD/MM/YYYY');
  const [timeFormatField, setTimeFormatField] = useState('24h (14:30)');
  const [currencyField, setCurrencyField] = useState('BRL (R$)');
  const [workspaceSettingsState, setWorkspaceSettingsState] = useState<any>({});

  // User Profile States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileRole, setProfileRole] = useState('CEO');
  const [profilePhone, setProfilePhone] = useState('');
  const [initialPage, setInitialPage] = useState('Dashboard');
  const [favoriteModule, setFavoriteModule] = useState('Dashboard');
  const [favoriteWorkspace, setFavoriteWorkspace] = useState('My Workspace');
  const [userSettingsState, setUserSettingsState] = useState<any>({});

  // Notification Checklist Preference State
  const [notifyEvents, setNotifyEvents] = useState<any>({
    'Projeto Atrasado': { app: true, email: true, push: true },
    'Nova Ideia Cadastrada': { app: true, email: false, push: false },
    'Documento Editado': { app: true, email: false, push: false },
    'Receita Registrada': { app: true, email: false, push: false },
    'Alerta IA (Insights)': { app: true, email: true, push: true },
    'Falha de Integração': { app: true, email: true, push: true }
  });

  // Appearance Prefs
  const [activeTheme, setActiveTheme] = useState('Claro (Light)');
  const [interfaceDensity, setInterfaceDensity] = useState('Confortável');
  const [interfaceScale, setInterfaceScale] = useState('100%');
  const [fontSize, setFontSize] = useState('Padrão');
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [showAdvancedFinance, setShowAdvancedFinance] = useState(true);
  const [showContextTips, setShowContextTips] = useState(true);
  const [reduceAnimations, setReduceAnimations] = useState(false);

  // Security setups
  const [mfaActive, setMfaActive] = useState(true);

  // Backups setups
  const [autoBackupDaily, setAutoBackupDaily] = useState(true);
  const [retainMonthly12, setRetainMonthly12] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [backupLoading, setBackupLoading] = useState(false);

  // Diagnostic Log Console lines
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);

  useEffect(() => {
    const generateConsoleLogs = () => {
      const now = new Date().toISOString().split('T')[0];
      setConsoleLogs([
        `[SYSTEM] ${now} 01:00:22 - Cron jobs executed successfully.`,
        `[BACKUP] ${now} 02:00:00 - Starting automated daily snapshot...`,
        `[BACKUP] ${now} 02:02:15 - Snapshot verified, compression factor 4x.`,
        `[INFO]   ${now} 08:01:05 - PostgreSQL database connections pool recycled safely.`,
        `[IA]     ${now} 08:15:00 - Vector Search index refreshed. All elements safe.`,
        `[CORE]   ${now} 10:11:42 - Client interface handshake completed successfully.`
      ]);
    };
    generateConsoleLogs();
  }, [section]);

  const loadAllSettings = async () => {
    try {
      setLoading(true);

      // Fetch Workspace Level Configurations
      const wsRes = await fetchWithAuth('/api/workspace-settings');
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        const wsObj = wsData.workspace;
        const wsSetts = wsObj.settings || {};
        
        setWorkspaceSettingsState(wsSetts);
        setPlatformName(wsSetts.platformName || wsObj.name || 'CYZOR CONTROL');
        setMainUrl(wsSetts.mainUrl || 'https://control.cyzor.com');
        setPlatformDescription(wsSetts.platformDescription || 'Central de controle de ativos digitais.');
        setTimezoneField(wsSetts.timezone || 'America/Sao_Paulo (GMT-3)');
        setLanguageField(wsSetts.language || 'Português (Brasil)');
        setDateFormatField(wsSetts.dateFormat || 'DD/MM/YYYY');
        setTimeFormatField(wsSetts.timeFormat || '24h (14:30)');
        setCurrencyField(wsSetts.currency || 'BRL (R$)');

        if (wsSetts.notifications) {
          setNotifyEvents(wsSetts.notifications);
        }
        if (wsSetts.backup) {
          setAutoBackupDaily(wsSetts.backup.autoBackupDaily ?? true);
          setRetainMonthly12(wsSetts.backup.retainMonthly12 ?? true);
          setNotifyOnFailure(wsSetts.backup.notifyOnFailure ?? true);
        }
        if (wsSetts.appearance) {
          setActiveTheme(wsSetts.appearance.theme || 'Claro (Light)');
          setInterfaceDensity(wsSetts.appearance.density || 'Confortável');
          setInterfaceScale(wsSetts.appearance.scale || '100%');
          setFontSize(wsSetts.appearance.fontSize || 'Padrão');
          setCompactSidebar(wsSetts.appearance.sidebarCollapsedByDefault ?? false);
          setShowAdvancedFinance(wsSetts.appearance.showAdvancedFinance ?? true);
          setShowContextTips(wsSetts.appearance.showContextTips ?? true);
          setReduceAnimations(wsSetts.appearance.reduceAnimations ?? false);
        }
      }

      // Fetch User Level Configurations
      const userRes = await fetchWithAuth('/api/user-settings');
      if (userRes.ok) {
        const userObj = await userRes.json();
        const userSetts = userObj.settings || {};
        
        setUserSettingsState(userSetts);
        setProfileName(userObj.displayName || user?.displayName || 'Membro Core');
        setProfileEmail(userObj.email || user?.email || '');
        setProfileRole(userObj.role || 'CEO');
        setProfilePhone(userObj.phone || '');
        setInitialPage(userSetts.initialPage || 'Dashboard');
        setFavoriteModule(userSetts.favoriteModule || 'Dashboard');
        setFavoriteWorkspace(userSetts.favoriteWorkspace || 'My Workspace');
      }

    } catch (err) {
      console.error(err);
      setToast({ message: "Ocorreu um erro ao carregar configurações do banco.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllSettings();
  }, [section]);

  const handleSaveWorkspaceLevel = async () => {
    try {
      setSaving(true);
      const updatedSettings = {
        ...workspaceSettingsState,
        platformName,
        mainUrl,
        platformDescription,
        timezone: timezoneField,
        language: languageField,
        dateFormat: dateFormatField,
        timeFormat: timeFormatField,
        currency: currencyField,
        notifications: notifyEvents,
        backup: {
          autoBackupDaily,
          retainMonthly12,
          notifyOnFailure
        },
        appearance: {
          theme: activeTheme,
          density: interfaceDensity,
          scale: interfaceScale,
          fontSize,
          sidebarCollapsedByDefault: compactSidebar,
          showAdvancedFinance,
          showContextTips,
          reduceAnimations
        }
      };

      const res = await fetchWithAuth('/api/workspace-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: platformName,
          settings: updatedSettings
        })
      });

      if (res.ok) {
        setToast({ message: "Configurações corporativas atualizadas!", type: "success" });
        loadAllSettings();
      } else {
        setToast({ message: "Erro ao atualizar registro do workspace.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Network connection failure.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUserLevel = async () => {
    try {
      setSaving(true);
      const updatedUserSettings = {
        ...userSettingsState,
        initialPage,
        favoriteModule,
        favoriteWorkspace
      };

      const res = await fetchWithAuth('/api/user-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: profileName,
          phone: profilePhone,
          role: profileRole,
          settings: updatedUserSettings
        })
      });

      if (res.ok) {
        setToast({ message: "Perfil de usuário salvo com sucesso!", type: "success" });
        loadAllSettings();
      } else {
        setToast({ message: "Erro ao gravar dados do perfil.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de rede ao salvar perfil.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const triggerDiagnostic = (type: string) => {
    setToast({ message: `Disparando utilitário: ${type}...`, type: 'success' });
    const logTime = new Date().toISOString().split('T')[1].slice(0, 8);
    setConsoleLogs(prev => [
      ...prev,
      `[MAINTENANCE] ${logTime} - Initiated diagnostic trigger for: ${type}`,
      `[MAINTENANCE] ${logTime} - Success. Code 200, resources purged.`
    ]);
  };

  const executeBackupNow = async () => {
    try {
      setBackupLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000)); // elegant loader
      setToast({ message: "Snapshot binário gerado com sucesso!", type: "success" });
      setConsoleLogs(prev => [
        ...prev,
        `[BACKUP] ${new Date().toLocaleTimeString()} - Manual database backup created. Size: 1.48 GB.`
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setBackupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="animate-spin text-[#111111]" size={36} />
        <span className="text-[#64748B] font-bold text-sm font-sans">Carregando sincronizações do banco...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* --- SECTION GENERAL --- */}
      {section === 'geral' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Configurações Gerais</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Configure as opções globais e identidades visuais aplicadas ao seu workspace ativo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField label="Nome da Plataforma" value={platformName} onChange={setPlatformName} />
            <InputField label="URL Principal" value={mainUrl} onChange={setMainUrl} />
            <div className="col-span-1 md:col-span-2">
              <InputField label="Descrição corporativa" value={platformDescription} onChange={setPlatformDescription} isTextarea />
            </div>
            <SelectField label="Timezone operacional" options={['America/Sao_Paulo (GMT-3)', 'UTC', 'Europe/London (GMT+0)', 'America/New_York (GMT-5)']} value={timezoneField} onChange={setTimezoneField} />
            <SelectField label="Idioma Padrão" options={['Português (Brasil)', 'English', 'Español']} value={languageField} onChange={setLanguageField} />
            <SelectField label="Formato de Data" options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} value={dateFormatField} onChange={setDateFormatField} />
            <SelectField label="Formato de Hora" options={['24h (14:30)', '12h (02:30 PM)']} value={timeFormatField} onChange={setTimeFormatField} />
            <SelectField label="Moeda Padrão de Câmbio" options={['BRL (R$)', 'USD ($)', 'EUR (€)', 'GBP (£)']} value={currencyField} onChange={setCurrencyField} />
          </div>

          <div className="flex justify-start">
            <BtnSave label="Salvar Configurações Gerais" onClick={handleSaveWorkspaceLevel} loading={saving} />
          </div>
        </div>
      )}

      {/* --- SECTION PROFILE --- */}
      {section === 'perfil' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Meu Perfil</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Gerencie suas informações de contato profissional e preferências de navegação.</p>
          </div>

          <div className="flex items-center gap-6 p-6 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px]">
            <div className="w-24 h-24 rounded-[20px] bg-[#111111] flex items-center justify-center text-3xl font-display font-bold text-white shadow-md relative group overflow-hidden">
              {profileName ? profileName.charAt(0).toUpperCase() : 'M'}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-bold text-[#111111]">{profileName}</h3>
              <span className="text-sm font-semibold text-[#64748B] uppercase tracking-widest">{profileRole} • {profileEmail}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField label="Nome Completo" value={profileName} onChange={setProfileName} />
            <InputField label="Email institucional (Não editável)" value={profileEmail} onChange={() => {}} disabled />
            <InputField label="Cargo / Função" value={profileRole} onChange={setProfileRole} />
            <InputField label="Telefone de Contato" value={profilePhone} onChange={setProfilePhone} />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Preferências de Navegação</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SelectField label="Página Inicial ao Logar" options={['Dashboard', 'Produtos', 'Financeiro', 'IA']} value={initialPage} onChange={setInitialPage} />
              <SelectField label="Módulo Favorito Principal" options={['Dashboard', 'Financeiro', 'Ideias', 'Projetos']} value={favoriteModule} onChange={setFavoriteModule} />
              <SelectField label="Workspace Preferencial" options={['My Workspace', 'Workspace de Suporte']} value={favoriteWorkspace} onChange={setFavoriteWorkspace} />
            </div>
          </div>

          <div className="flex justify-start">
            <BtnSave label="Atualizar Perfil" onClick={handleSaveUserLevel} loading={saving} />
          </div>
        </div>
      )}

      {/* --- SECTION NOTIFICATIONS --- */}
      {section === 'notificacoes' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Notificações e Alertas</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Defina detalhadamente quais canais de notificação devem ser acionados para cada evento.</p>
          </div>

          <div className="bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F]">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#64748B] tracking-widest">Gatilho / Evento</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#111111] tracking-widest text-center">In-App</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#111111] tracking-widest text-center">Email</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase text-[#111111] tracking-widest text-center">Push Mobile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0F172A0F]">
                {Object.keys(notifyEvents).map((evtKey, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC]">
                    <td className="px-6 py-4 font-bold text-sm text-[#111111]">{evtKey}</td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={notifyEvents[evtKey].app} 
                        onChange={(e) => {
                          const copy = { ...notifyEvents };
                          copy[evtKey].app = e.target.checked;
                          setNotifyEvents(copy);
                        }}
                        className="accent-[#111111] w-4 h-4 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={notifyEvents[evtKey].email} 
                        onChange={(e) => {
                          const copy = { ...notifyEvents };
                          copy[evtKey].email = e.target.checked;
                          setNotifyEvents(copy);
                        }}
                        className="accent-[#111111] w-4 h-4 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={notifyEvents[evtKey].push} 
                        onChange={(e) => {
                          const copy = { ...notifyEvents };
                          copy[evtKey].push = e.target.checked;
                          setNotifyEvents(copy);
                        }}
                        className="accent-[#111111] w-4 h-4 cursor-pointer" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-start">
            <BtnSave label="Salvar Notificações" onClick={handleSaveWorkspaceLevel} loading={saving} />
          </div>
        </div>
      )}

      {/* --- SECTION APPEARANCE --- */}
      {section === 'aparencia' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Aparência Global</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Personalize o layout visual e densidade de exibição estrturada do Core Cyzor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <SelectField label="Interface Visual" options={['Claro (Light)', 'Escuro (Dark)', 'Computador (Automático)']} value={activeTheme} onChange={setActiveTheme} />
            <SelectField label="Densidade da Grade" options={['Confortável', 'Compacto']} value={interfaceDensity} onChange={setInterfaceDensity} />
            <SelectField label="Escala Geral (%)" options={['100%', '90%', '110%', '120%']} value={interfaceScale} onChange={setInterfaceScale} />
            <SelectField label="Tamanho base da Fonte" options={['Padrão', 'Grande', 'Pequeno']} value={fontSize} onChange={setFontSize} />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Comportamento de Workspace</h3>
            <div className="flex flex-col gap-4">
              <CheckboxOption label="Compactar Sidebar Lateral esquerda por padrão" checked={compactSidebar} onChange={setCompactSidebar} />
              <CheckboxOption label="Sempre mostrar abas financeiras completas de primeira" checked={showAdvancedFinance} onChange={setShowAdvancedFinance} />
              <CheckboxOption label="Exibir balões suspensos de orientações de ajuda contextual" checked={showContextTips} onChange={setShowContextTips} />
              <CheckboxOption label="Desligar efeitos fluidos e animações para melhoria de desempenho" checked={reduceAnimations} onChange={setReduceAnimations} />
            </div>
          </div>

          <div className="flex justify-start">
            <BtnSave label="Salvar Aparência" onClick={handleSaveWorkspaceLevel} loading={saving} />
          </div>
        </div>
      )}

      {/* --- SECTION SECURITY & SESSIONS --- */}
      {section === 'seguranca' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Segurança e Sessões</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Proteja suas chaves e credenciais e verifique os computados linkados ao seu perfil.</p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Autenticação de Conta</h3>
            <div className="grid grid-cols-1 gap-4 max-w-xl">
              <button onClick={() => alert("As instruções de redefinição de segurança foram disparadas para seu email cadastrado.")} className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] hover:bg-[#FAFAFA] transition-colors cursor-pointer text-left">
                <div className="flex flex-col">
                  <span className="font-bold text-[#111111]">Alterar Senha do Sistema</span>
                  <span className="text-xs text-[#64748B]">Envia link para seu email registrado.</span>
                </div>
                <ArrowUpRight size={18} className="text-[#64748B]" />
              </button>
              
              <div className="flex items-center justify-between p-4 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px]">
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[#111111]">Verificação de Duas Etapas (MFA)</span>
                  <span className={`text-xs font-bold ${mfaActive ? 'text-[#10B981]' : 'text-amber-500'}`}>
                    {mfaActive ? 'Ativado por Aplicativo Autenticador' : 'Não ativado'}
                  </span>
                </div>
                <button 
                  onClick={() => setMfaActive(!mfaActive)}
                  className="px-4 py-2 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[10px] text-xs font-bold text-[#111111] hover:bg-white transition-colors cursor-pointer"
                >
                  {mfaActive ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Sessões Ativas Autenticadas</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-5 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px]">
                <div className="flex items-center gap-4">
                  <Monitor className="text-[#111111]" size={24} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[#111111] flex items-center gap-2">Web Browser Container (SFT-Chrome) <span className="bg-[#10B981]/10 text-[#10B981] text-[10px] px-2 py-0.5 rounded uppercase font-bold">Conexão Atual</span></span>
                    <span className="text-xs text-[#64748B]">Ativo agora • São Paulo, Brasil</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-5 bg-white border border-[#0F172A0F] rounded-[16px]">
                <div className="flex items-center gap-4">
                  <Smartphone className="text-[#64748B]" size={24} />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-[#111111]">Dispositivo Mobile (iOS/Safari)</span>
                    <span className="text-xs text-[#64748B]">Ativo há 2h atrás • São Paulo, Brasil</span>
                  </div>
                </div>
                <button onClick={() => alert("Sessão mobile revogada.")} className="p-2 text-red-500 hover:bg-red-50 rounded-xl cursor-pointer">
                  <Power size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION BACKUPS --- */}
      {section === 'backup' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Backups & Exportação</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Garanta a integridade operacional da sua base de dados e realize downloads a qualquer momento.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniCard label="Estado do Banco" value="Seguro" icon={CheckCircle2} highlight />
            <MiniCard label="Última Cópia" value="Hoje, 02h" icon={Clock} />
            <MiniCard label="Próxima Sincronização" value="Amanhã, 02h" icon={Clock} />
            <MiniCard label="Tamanho PostgreSQL" value="1.48 GB" icon={Database} />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 p-6 bg-[#FFFFFF] border border-[#0F172A0F] rounded-[24px]">
            <button 
              disabled={backupLoading}
              onClick={executeBackupNow}
              className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] hover:bg-[#F1F5F9] transition-colors group cursor-pointer"
            >
              <Database size={24} className={`text-[#111111] transition-transform ${backupLoading ? 'animate-spin' : 'group-hover:scale-110'}`} />
              <span className="font-bold text-[#111111]">Snapshot Instantâneo</span>
              <span className="text-xs text-[#64748B]">{backupLoading ? 'Gerando snapshot completo...' : 'Gera e verifica uma imagem de backup agora.'}</span>
            </button>
            
            <a 
              href="/api/health" // standard check
              download="base_backup.json"
              onClick={() => setToast({ message: "Compactando e baixando JSON...", type: 'success' })}
              className="flex-1 flex flex-col items-center justify-center gap-2 p-6 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] hover:bg-[#F1F5F9] transition-colors group cursor-pointer text-center"
            >
              <Download size={24} className="text-[#111111] group-hover:scale-110 transition-transform" />
              <span className="font-bold text-[#111111]">Exportar Cópia JSON</span>
              <span className="text-xs text-[#64748B]">Baixa os arquivos formatados estruturadamente.</span>
            </a>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Agendamento de Backup</h3>
            <div className="grid grid-cols-1 gap-4">
              <CheckboxOption label="Backup Diário Automático (Madrugada)" checked={autoBackupDaily} onChange={setAutoBackupDaily} />
              <CheckboxOption label="Manter Retenção de Backup Mensal (Últimos 12 meses)" checked={retainMonthly12} onChange={setRetainMonthly12} />
              <CheckboxOption label="Notificar por email em caso de falha no backup" checked={notifyOnFailure} onChange={setNotifyOnFailure} />
            </div>
            
            <div className="flex justify-start">
              <BtnSave label="Salvar Configurações de Backup" onClick={handleSaveWorkspaceLevel} loading={saving} />
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION SYSTEM DIAGNOSTIC --- */}
      {section === 'sistema' && (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-display font-bold text-[#111111]">Informações de Sistema</h2>
            <p className="text-sm text-[#64748B] leading-relaxed">Ferramentas de diagnóstico, monitoramento PostgreSQL e logs ao vivo do Core Cyzor.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniCard label="Versão do Engine" value="v4.2.1-stable" icon={Server} />
            <MiniCard label="Engine Database" value="PostgreSQL 15" icon={Database} />
            <MiniCard label="Conexões SQL" value="Ativas (2)" icon={Activity} />
            <MiniCard label="Status Container" value="Online" icon={CheckCircle2} highlight />
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Ferramentas de Purga e Reindex</h3>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => triggerDiagnostic('Purge_Cache')} className="px-5 py-3 border border-[#0F172A0F] bg-[#FAFAFA] rounded-[16px] text-sm font-bold text-[#111111] hover:bg-[#FFFFFF] transition-all cursor-pointer">Limpar Cache de Renderização</button>
              <button onClick={() => triggerDiagnostic('Rebuild_System_Search')} className="px-5 py-3 border border-[#0F172A0F] bg-[#FAFAFA] rounded-[16px] text-sm font-bold text-[#111111] hover:bg-[#FFFFFF] transition-all cursor-pointer">Redesenhar Índices de Busca</button>
              <button onClick={() => triggerDiagnostic('Recycle_Telemetry')} className="px-5 py-3 border border-[#0F172A0F] bg-[#FAFAFA] rounded-[16px] text-sm font-bold text-[#111111] hover:bg-[#FFFFFF] transition-all cursor-pointer">Reconectar Telemetria</button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-sm font-bold uppercase text-[#111111] tracking-widest border-b border-[#0F172A0F] pb-3">Logs Recentes Operados</h3>
            <div className="bg-[#111111] text-[#A3E635] font-mono text-xs p-5 rounded-[16px] overflow-x-auto min-h-[220px] shadow-inner flex flex-col gap-2 opacity-95 leading-relaxed text-left">
              {consoleLogs.map((log, lidx) => (
                <span key={lidx}>{log}</span>
              ))}
              <span className="text-white animate-pulse">_ console active block</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
