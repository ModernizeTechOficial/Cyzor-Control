import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { 
  Mail, Server, FileCode2, History, CheckCircle2, XCircle, 
  Loader2, Settings, Send, RefreshCw, Sparkles, HelpCircle, Eye, EyeOff, LayoutTemplate
} from 'lucide-react';
import { Toast } from './SettingsHelpers';

export default function SecEmails() {
  const { fetchWithAuth, dbUser } = useAuth();
  const isPlatformAdmin = dbUser?.isPlatformAdmin === true;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [sendingSample, setSendingSample] = useState(false);
  const [activeTab, setActiveTab] = useState<'smtp' | 'templates' | 'logs'>('templates');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // SMTP Settings (admin only)
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [smtpFrom, setSmtpFrom] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testRecipient, setTestRecipient] = useState('');

  // Email Template (Notificação de Acesso ao Projeto)
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateTextBody, setTemplateTextBody] = useState('');
  const [templateHtmlBody, setTemplateHtmlBody] = useState('');

  // Logs
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // Loaded raw workspace object to merge correctly
  const [rawWorkspace, setRawWorkspace] = useState<any>(null);

  const loadAdminSmtpConfig = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/smtp/config');
      if (res.ok) {
        const config = await res.json();
        setSmtpEnabled(config?.enabled || false);
        setSmtpHost(config?.host || '');
        setSmtpPort(config?.port ? Number(config.port) : 587);
        setSmtpUser(config?.user || '');
        setSmtpPass(config?.pass || '');
        setSmtpFrom(config?.from || '');
      }
    } catch (err) {
      console.error('Error loading admin SMTP config:', err);
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await fetchWithAuth('/api/workspace-settings');
      if (res.ok) {
        const data = await res.json();
        setRawWorkspace(data.workspace);
        const settings = data.workspace.settings || {};

        // Templates
        const templates = settings.emailTemplates || {};
        const projNotif = templates.projectNotification || {};
        setTemplateSubject(projNotif.subject || '[Jira / Cyzor] Você foi adicionado ao projeto "{{projectName}}" no Workspace "{{workspaceName}}"');
        setTemplateTextBody(projNotif.textBody || getDefaultTextBody());
        setTemplateHtmlBody(projNotif.htmlBody || getDefaultHtmlBody());

        // Logs
        setEmailLogs(settings.emailLogs || []);

        if (isPlatformAdmin) {
          await loadAdminSmtpConfig();
        }
      }
    } catch (err) {
      console.error("Error loading email settings:", err);
      setToast({ message: "Erro ao carregar configurações de e-mail.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [dbUser]);

  useEffect(() => {
    if (!isPlatformAdmin && activeTab === 'smtp') {
      setActiveTab('templates');
    }
  }, [isPlatformAdmin, activeTab]);

  const handleSaveSmtp = async () => {
    if (!isPlatformAdmin) return;

    try {
      setSaving(true);
      const payload = {
        enabled: smtpEnabled,
        host: smtpHost.trim(),
        port: Number(smtpPort),
        user: smtpUser.trim(),
        pass: smtpPass,
        from: smtpFrom.trim()
      };

      const res = await fetchWithAuth('/api/admin/smtp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setToast({ message: "Configuração SMTP salva com sucesso!", type: "success" });
        await loadAdminSmtpConfig();
      } else {
        setToast({ message: "Erro ao salvar configuração SMTP.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplates = async () => {
    try {
      setSaving(true);
      const updatedSettings = {
        ...(rawWorkspace?.settings || {}),
        emailTemplates: {
          projectNotification: {
            subject: templateSubject,
            textBody: templateTextBody,
            htmlBody: templateHtmlBody
          }
        }
      };

      const res = await fetchWithAuth('/api/workspace-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rawWorkspace?.name,
          settings: updatedSettings
        })
      });

      if (res.ok) {
        setToast({ message: "Modelos de e-mail salvos com sucesso!", type: "success" });
        loadSettings();
      } else {
        setToast({ message: "Erro ao salvar os modelos de e-mail.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSmtp = async () => {
    if (!isPlatformAdmin) return;
    if (!testRecipient.trim()) {
      setToast({ message: "Por favor, digite um e-mail de destino para testar.", type: "error" });
      return;
    }
    try {
      setTestingSmtp(true);
      const res = await fetchWithAuth('/api/admin/mail/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost.trim(),
          port: Number(smtpPort),
          user: smtpUser.trim(),
          pass: smtpPass,
          from: smtpFrom.trim(),
          to: testRecipient.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: "E-mail de teste enviado com sucesso! Verifique a caixa de entrada.", type: "success" });
        await loadAdminSmtpConfig();
      } else {
        setToast({ message: `Falha no teste: ${data.error || "Erro desconhecido"}`, type: "error" });
      }
    } catch (err: any) {
      console.error(err);
      setToast({ message: "Erro de conexão com o servidor de teste.", type: "error" });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleSendSample = async () => {
    if (!testRecipient.trim()) {
      setToast({ message: "Por favor, digite um e-mail de destino para o envio de exemplo.", type: "error" });
      return;
    }
    try {
      setSendingSample(true);
      const res = await fetchWithAuth('/api/mail/send-sample', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: testRecipient.trim() })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToast({ message: "Modelo renderizado e enviado com sucesso!", type: "success" });
        loadSettings(); // Reload to fetch newly logged entries
      } else {
        setToast({ message: "Erro ao enviar e-mail de exemplo.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão com o servidor.", type: "error" });
    } finally {
      setSendingSample(false);
    }
  };

  const handleRestoreDefaultTemplate = () => {
    setTemplateSubject('[Jira / Cyzor] Você foi adicionado ao projeto "{{projectName}}" no Workspace "{{workspaceName}}"');
    setTemplateTextBody(getDefaultTextBody());
    setTemplateHtmlBody(getDefaultHtmlBody());
    setToast({ message: "Modelo padrão restaurado nos campos abaixo (lembre-se de salvar para persistir).", type: "success" });
  };

  const handleClearLogs = async () => {
    if (!confirm("Tem certeza que deseja limpar o histórico de envios?")) return;
    try {
      setSaving(true);
      const updatedSettings = {
        ...(rawWorkspace?.settings || {}),
        emailLogs: []
      };

      const res = await fetchWithAuth('/api/workspace-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: rawWorkspace?.name,
          settings: updatedSettings
        })
      });

      if (res.ok) {
        setToast({ message: "Histórico limpo com sucesso!", type: "success" });
        loadSettings();
      } else {
        setToast({ message: "Erro ao limpar histórico.", type: "error" });
      }
    } catch (err) {
      console.error(err);
      setToast({ message: "Erro de conexão.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Previews template replacements mock
  const renderMockHtml = () => {
    return templateHtmlBody
      .replace(/\{\{userName\}\}/g, "Sarah Jenkins")
      .replace(/\{\{projectName\}\}/g, "Plataforma de E-commerce v2")
      .replace(/\{\{role\}\}/g, "Desenvolvedora Frontend Sênior")
      .replace(/\{\{workspaceName\}\}/g, rawWorkspace?.name || "Global Hub")
      .replace(/\{\{assignedBy\}\}/g, "Carlos Drummond (Admin)")
      .replace(/\{\{appUrl\}\}/g, "#");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
        <Loader2 className="animate-spin text-[#111111]" size={36} />
        <span className="text-[#64748B] font-bold text-sm">Carregando configurações de SMTP & E-mails...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-display font-bold text-[#111111] flex items-center gap-2">
          <Mail size={24} className="text-[#111111]" /> Configuração de E-mails & SMTP
        </h2>
        <p className="text-sm text-[#64748B] leading-relaxed">
          Configure as credenciais SMTP do seu domínio, refine os modelos profissionais de notificação e visualize o histórico detalhado dos envios automatizados.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#0F172A0F] gap-2">
        {isPlatformAdmin && (
          <button 
            onClick={() => setActiveTab('smtp')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'smtp' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
          >
            <Server size={14} /> Servidor SMTP
          </button>
        )}
        <button 
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'templates' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
        >
          <LayoutTemplate size={14} /> Modelos de E-mail
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'logs' ? 'border-[#111111] text-[#111111]' : 'border-transparent text-[#64748B] hover:text-[#111111]'}`}
        >
          <History size={14} /> Histórico de Envios
        </button>
      </div>

      {/* Content SMTP Tab */}
      {activeTab === 'smtp' && isPlatformAdmin && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[#0F172A0F] pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase text-[#111111] tracking-wider">Habilitar SMTP Customizado</span>
                <span className="text-[11px] text-[#64748B]">Se ativado, as notificações utilizarão estas configurações manuais em vez do provedor padrão Cyzor.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={smtpEnabled} 
                  onChange={(e) => setSmtpEnabled(e.target.checked)} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Host SMTP / Servidor</label>
                <input 
                  type="text" 
                  placeholder="ex: smtp.domain.com ou smtp.gmail.com" 
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-sm font-semibold text-[#111111]" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Porta SMTP</label>
                <input 
                  type="number" 
                  placeholder="587" 
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-sm font-semibold text-[#111111]" 
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Usuário / Autenticação</label>
                <input 
                  type="text" 
                  placeholder="ex: seu-email@domain.com" 
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-sm font-semibold text-[#111111]" 
                />
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Senha de Aplicativo</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••••••••••" 
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-sm font-semibold text-[#111111] pr-12" 
                  />
                  <button 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#111111] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Remetente (From Header)</label>
                <input 
                  type="text" 
                  placeholder='"Nome" <seu-email@domain.com>' 
                  value={smtpFrom}
                  onChange={(e) => setSmtpFrom(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-sm font-semibold text-[#111111]" 
                />
              </div>
            </div>

            <div className="flex justify-start pt-2">
              <button 
                onClick={handleSaveSmtp}
                disabled={saving}
                className="px-6 py-3 bg-[#111111] text-white rounded-[16px] text-xs font-bold hover:bg-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                {saving ? <Loader2 className="animate-spin" size={14} /> : <Settings size={14} />}
                Salvar SMTP
              </button>
            </div>
          </div>

          <div className="border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col gap-4 bg-white shadow-sm text-left">
            <h3 className="text-xs font-bold uppercase text-[#64748B] tracking-widest flex items-center gap-1.5">
              <Send size={12} /> Testar Conexão do Servidor
            </h3>
            <p className="text-xs text-[#64748B]">
              Informe um e-mail externo para enviar uma mensagem de teste síncrona. Isso validará o handshake, criptografia e autorização de envio do host.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <input 
                type="email" 
                placeholder="Ex email: test@gmail.com" 
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
                className="flex-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 text-sm font-semibold outline-none focus:border-[#111111]/30" 
              />
              <button 
                onClick={handleTestSmtp}
                disabled={testingSmtp || !smtpHost}
                className="px-6 py-3 bg-[#111111] hover:bg-black text-white rounded-[16px] text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 min-w-[150px]"
              >
                {testingSmtp ? <Loader2 className="animate-spin" size={14} /> : <Send size={14} />}
                Testar SMTP
              </button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'smtp' && !isPlatformAdmin && (
        <div className="rounded-[24px] border border-[#0F172A0F] p-6 bg-white shadow-sm">
          <p className="text-sm font-semibold text-[#111111]">Configuração SMTP disponível apenas para administradores da plataforma.</p>
          <p className="text-xs text-[#64748B] mt-3">Solicite a um administrador que configure o servidor SMTP global no painel de administração.</p>
        </div>
      )}

      {/* Content Templates Tab */}
      {activeTab === 'templates' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="bg-[#FAFAFA] border border-[#0F172A0F] rounded-[24px] p-6 flex flex-col gap-6 text-left">
            <div className="flex items-center justify-between border-b border-[#0F172A0F] pb-4 flex-wrap gap-2">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold uppercase text-[#111111]">Notificação de Acesso ao Projeto (Jira-style)</span>
                <span className="text-[11px] text-[#64748B]">E-mail enviado automaticamente ao vincular novos colaboradores a projetos de sprints.</span>
              </div>
              <button 
                onClick={handleRestoreDefaultTemplate}
                className="text-[10px] font-bold text-[#64748B] hover:text-[#111111] border border-[#0F172A0F] rounded-lg px-3 py-1.5 bg-white hover:bg-[#FAFAFA]"
              >
                Restaurar Padrão
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form Editor */}
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Assunto do E-mail</label>
                  <input 
                    type="text" 
                    value={templateSubject}
                    onChange={(e) => setTemplateSubject(e.target.value)}
                    className="w-full bg-white border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 text-xs font-bold text-[#111111]" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B]">Corpo HTML (Estruturado)</label>
                    <span className="text-[9px] font-bold text-[#64748B]">Suporta Inline CSS</span>
                  </div>
                  <textarea 
                    value={templateHtmlBody}
                    onChange={(e) => setTemplateHtmlBody(e.target.value)}
                    className="w-full bg-white border border-[#0F172A0F] rounded-[16px] py-3.5 px-4 outline-none focus:border-[#111111]/30 font-mono text-[10px] leading-relaxed text-[#334155] min-h-[350px]" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1">Corpo Texto Plano (Fallback)</label>
                  <textarea 
                    value={templateTextBody}
                    onChange={(e) => setTemplateTextBody(e.target.value)}
                    className="w-full bg-white border border-[#0F172A0F] rounded-[16px] py-3 px-4 outline-none focus:border-[#111111]/30 font-medium text-xs leading-relaxed text-[#64748B] min-h-[120px]" 
                  />
                </div>

                {/* Token Legend */}
                <div className="bg-white border border-[#0F172A0F] rounded-[16px] p-4 flex flex-col gap-2 text-xs">
                  <span className="font-bold text-[#111111] flex items-center gap-1"><Sparkles size={12} className="text-[#4f46e5]" /> Placeholders Disponíveis:</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] text-[#64748B] font-semibold">
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{userName}}"}</code> : Nome do Colaborador</div>
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{projectName}}"}</code> : Nome do Projeto</div>
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{role}}"}</code> : Cargo / Função</div>
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{workspaceName}}"}</code> : Workspace</div>
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{assignedBy}}"}</code> : Autor do Convite</div>
                    <div><code className="bg-[#FAFAFA] border px-1 rounded font-bold text-[#111111]">{"{{appUrl}}"}</code> : Endereço da Aplicação</div>
                  </div>
                </div>

                <div className="flex justify-start pt-2">
                  <button 
                    onClick={handleSaveTemplates}
                    disabled={saving}
                    className="px-6 py-3 bg-[#111111] text-white rounded-[16px] text-xs font-bold hover:bg-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    {saving ? <Loader2 className="animate-spin" size={14} /> : <Settings size={14} />}
                    Salvar Modelos
                  </button>
                </div>
              </div>

              {/* Real-time Browser Frame Preview */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold tracking-widest uppercase text-[#64748B] px-1 flex items-center gap-1.5">
                  <Eye size={12} /> Visualização em Tempo Real (Mockup)
                </label>
                <div className="border border-[#0F172A0F] rounded-[24px] overflow-hidden flex-1 flex flex-col bg-[#F1F5F9] min-h-[500px]">
                  {/* Browser bar */}
                  <div className="bg-[#E2E8F0] border-b border-[#0F172A0F] px-4 py-2 flex items-center gap-2 flex-shrink-0">
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <div className="bg-white/80 text-[9px] font-semibold text-[#64748B] rounded-md px-3 py-1 flex-1 text-center truncate select-none">
                      {templateSubject.replace(/\{\{projectName\}\}/g, "E-commerce").slice(0, 50)}...
                    </div>
                  </div>
                  
                  {/* Visual Content Frame */}
                  <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                    <iframe 
                      title="Email Render Preview"
                      srcDoc={renderMockHtml()}
                      className="w-full h-full min-h-[500px] border-0 outline-none"
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#0F172A0F] rounded-[16px] p-4 flex flex-col gap-3 text-left">
                  <span className="text-xs font-bold text-[#111111]">Enviar E-mail de Exemplo Rápido</span>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input 
                      type="email" 
                      placeholder="seu-email@teste.com" 
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      className="flex-1 bg-[#FAFAFA] border border-[#0F172A0F] rounded-[12px] py-2 px-3 text-xs font-semibold outline-none focus:border-[#111111]/30" 
                    />
                    <button 
                      onClick={handleSendSample}
                      disabled={sendingSample || !testRecipient}
                      className="px-4 py-2 bg-[#111111] hover:bg-black text-white rounded-[12px] text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {sendingSample ? <Loader2 className="animate-spin" size={12} /> : <Send size={12} />}
                      Enviar de Exemplo
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Content Logs Tab */}
      {activeTab === 'logs' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold uppercase text-[#111111]">Histórico de Transações de E-mail (Logs Ativos)</span>
              <span className="text-[11px] text-[#64748B]">Auditoria em tempo real de todas as requisições de e-mail disparadas por este workspace.</span>
            </div>
            {emailLogs.length > 0 && (
              <button 
                onClick={handleClearLogs}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 bg-white transition-colors"
              >
                Limpar Histórico
              </button>
            )}
          </div>

          <div className="bg-white border border-[#0F172A0F] rounded-[24px] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#0F172A0F]">
                    <th className="py-4 px-6 text-[10px] font-bold uppercase text-[#64748B] tracking-wider">Data / Hora</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase text-[#64748B] tracking-wider">Destinatário</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase text-[#64748B] tracking-wider">Tipo / Ação</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase text-[#64748B] tracking-wider">Status</th>
                    <th className="py-4 px-6 text-[10px] font-bold uppercase text-[#64748B] tracking-wider">Detalhes / Transporter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0F172A0F] text-xs">
                  {emailLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-[#64748B] font-semibold">
                        <div className="flex flex-col items-center gap-2">
                          <History size={24} className="text-[#64748B]/60" />
                          <span>Nenhum e-mail foi enviado por este Workspace ainda.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    emailLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#FAFAFA]/40 transition-colors">
                        <td className="py-4 px-6 font-semibold text-[#111111]">
                          {new Date(log.date).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#111111]">
                          {log.to}
                        </td>
                        <td className="py-4 px-6 font-bold text-[#64748B]">
                          {log.templateType}
                        </td>
                        <td className="py-4 px-6">
                          {log.status === 'success' ? (
                            <span className="inline-flex items-center gap-1 bg-[#10B981]/10 text-[#10B981] font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-[#10B981]/20">
                              <CheckCircle2 size={10} /> Sucesso
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 font-bold px-2.5 py-1 rounded-full text-[10px] uppercase border border-red-200">
                              <XCircle size={10} /> Falha
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-[#64748B] font-medium max-w-[250px] truncate">
                          {log.errorMessage ? (
                            <span className="text-red-500 font-semibold text-[11px]" title={log.errorMessage}>
                              {log.errorMessage}
                            </span>
                          ) : log.previewUrl ? (
                            <a 
                              href={log.previewUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-indigo-600 font-bold underline hover:text-indigo-800 inline-flex items-center gap-1"
                            >
                              Ver Inbox Ethereal ↗
                            </a>
                          ) : (
                            <span className="text-gray-400 italic">Disparado com Sucesso</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Default helper strings
function getDefaultTextBody(): string {
  return `Olá, {{userName}}!

Você foi adicionado ao projeto "{{projectName}}" no Workspace "{{workspaceName}}" por {{assignedBy}}.

Sua Função: {{role}}

Acesse o painel do projeto para visualizar suas tarefas pendentes e iniciar a colaboração.

Atenciosamente,
Equipe Cyzor Control`;
}

function getDefaultHtmlBody(): string {
  return `
    <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1e293b; background-color: #f8fafc;">
      <div style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 30px; text-align: center; color: #ffffff;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.025em; text-transform: uppercase;">Cyzor Control</h2>
          <p style="margin: 5px 0 0; font-size: 13px; opacity: 0.9; font-weight: 500;">Notificação de Acesso ao Projeto</p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; line-height: 1.6;">
          <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #0f172a;">Olá, {{userName}}!</p>
          <p style="font-size: 14px; color: #475569;">
            Temos o prazer de informar que você foi integrado à equipe de desenvolvimento do projeto 
            <strong style="color: #1e2530;">"{{projectName}}"</strong> dentro do workspace 
            <strong style="color: #1e2530;">"{{workspaceName}}"</strong>.
          </p>
          
          <!-- Info block -->
          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b; width: 40%;">Projeto</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">{{projectName}}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Sua Função</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #4f46e5;">{{role}}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Adicionado por</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #334155;">{{assignedBy}}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;">Workspace</td>
                <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #334155;">{{workspaceName}}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #475569; margin-bottom: 30px;">
            Agora você já pode acompanhar as sprints, gerenciar tarefas do quadro Kanban, consultar o planejamento de produtos e colaborar ativamente com seu time.
          </p>

          <!-- Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{appUrl}}" style="background-color: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-size: 13px; font-weight: 700; display: inline-block; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.15);">
              Ir para o Painel do Projeto
            </a>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
            Este é um e-mail automático enviado pelo Cyzor Control. Por favor, não responda a esta mensagem.
          </p>
        </div>
      </div>
    </div>
  `;
}
