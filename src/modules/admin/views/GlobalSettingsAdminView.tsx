import React, { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Save, Monitor, Shield, Globe, Type, Palette } from 'lucide-react';
import { showSuccess, showError } from '../../../lib/alerts';
import { useAuth } from '../../../context/AuthContext';

export default function GlobalSettingsAdminView() {
  const { fetchWithAuth, refreshBranding } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Branding & Identity
  const [globalLogoUrl, setGlobalLogoUrl] = useState('');
  const [globalIconUrl, setGlobalIconUrl] = useState('');
  const [loginHeroUrl, setLoginHeroUrl] = useState('');
  const [globalLogoSize, setGlobalLogoSize] = useState('40');
  const [globalIconSize, setGlobalIconSize] = useState('20');
  const [globalAppName, setGlobalAppName] = useState('CYZOR');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/stripe/config');
      const data = await res.json();
      if (res.ok && data) {
        setGlobalLogoUrl(data.globalLogoUrl || '');
        setGlobalIconUrl(data.globalIconUrl || '');
        setLoginHeroUrl(data.loginHeroUrl || '');
        setGlobalLogoSize(data.globalLogoSize || '40');
        setGlobalIconSize(data.globalIconSize || '20');
        setGlobalAppName(data.globalAppName || 'CYZOR');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'icon' | 'hero') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetchWithAuth('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.url) {
        if (type === 'logo') setGlobalLogoUrl(data.url);
        if (type === 'icon') setGlobalIconUrl(data.url);
        if (type === 'hero') setLoginHeroUrl(data.url);
        showSuccess('Imagem carregada com sucesso.');
      } else {
        throw new Error(data.error || 'Falha no upload');
      }
    } catch (err: any) {
      showError(err.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth('/api/admin/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          globalLogoUrl, globalIconUrl, loginHeroUrl, 
          globalLogoSize, globalIconSize, globalAppName
        })
      });
      if (res.ok) {
        showSuccess('Configurações globais atualizadas com sucesso.');
        await refreshBranding();
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (err) {
      showError('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 animate-in fade-in duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#18181B] pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-indigo-400" size={26} />
            Configurações da Plataforma
          </h1>
          <p className="text-zinc-400 text-sm font-medium">Personalize a identidade visual core e o ambiente global de acesso.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] shrink-0"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} />
              Salvar Alterações
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Identity Section */}
        <div className="space-y-8">
          <section className="bg-[#0D0D10]/95 border border-[#18181B] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#18181B]">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Globe size={18} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">Identidade Visual Core</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-mono">Nome da Plataforma</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    value={globalAppName} 
                    onChange={e => setGlobalAppName(e.target.value)} 
                    className="w-full bg-[#121215] border border-[#1E1E22] focus:border-indigo-500/50 rounded-xl pl-12 pr-5 py-3 text-zinc-200 text-xs font-bold transition-all outline-none"
                    placeholder="Ex: CYZOR CONTROL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Logotipo Principal</label>
                  <div className="flex flex-col gap-3">
                    <div className="h-20 w-full bg-[#121215] rounded-xl border border-dashed border-[#1E1E22] flex items-center justify-center p-4 relative group">
                      {globalLogoUrl ? (
                        <img src={globalLogoUrl} className="max-h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="text-zinc-600" size={20} />
                      )}
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'logo')} accept="image/*" />
                        <span className="text-[10px] font-bold uppercase text-indigo-400">Upload Logo</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={globalLogoUrl} 
                      onChange={e => setGlobalLogoUrl(e.target.value)} 
                      className="w-full bg-[#121215]/60 border border-[#1E1E22] rounded-lg px-3 py-1.5 text-[9px] font-mono text-zinc-400 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Ícone do Dashboard</label>
                  <div className="flex flex-col gap-3">
                    <div className="h-20 w-full bg-[#121215] rounded-xl border border-dashed border-[#1E1E22] flex items-center justify-center p-4 relative group">
                      {globalIconUrl ? (
                        <img src={globalIconUrl} className="max-h-12 object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <ImageIcon className="text-zinc-600" size={20} />
                      )}
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'icon')} accept="image/*" />
                        <span className="text-[10px] font-bold uppercase text-indigo-400">Upload Ícone</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={globalIconUrl} 
                      onChange={e => setGlobalIconUrl(e.target.value)} 
                      className="w-full bg-[#121215]/60 border border-[#1E1E22] rounded-lg px-3 py-1.5 text-[9px] font-mono text-zinc-400 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Login Design Section */}
        <div className="space-y-8">
          <section className="bg-[#0D0D10]/95 border border-[#18181B] rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6 pb-3 border-b border-[#18181B]">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Palette size={18} />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 font-mono">Tela de Acesso Global</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Imagem Hero Lateral</label>
                <label className="cursor-pointer text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 transition-colors">
                  <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'hero')} accept="image/*" />
                  <ImageIcon size={10} />
                  Upload Hero
                </label>
              </div>
              
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-[#1E1E22] bg-[#121215] shadow-inner group">
                {loginHeroUrl ? (
                  <img src={loginHeroUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full bg-[#121215] flex items-center justify-center">
                    <ImageIcon className="text-zinc-700" size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                  <p className="text-zinc-200 font-bold text-[11px] uppercase tracking-wider font-mono">White-Label Hero Preview</p>
                  <p className="text-zinc-500 text-[9px] font-medium mt-0.5">Exibida com overlay de segurança e alta taxa de contraste.</p>
                </div>
              </div>

              <div className="relative">
                <input 
                  type="text" 
                  value={loginHeroUrl} 
                  onChange={e => setLoginHeroUrl(e.target.value)} 
                  className="w-full bg-[#121215] border border-[#1E1E22] rounded-xl px-4 py-3 text-zinc-200 text-xs font-mono transition-all outline-none pr-10"
                  placeholder="Cole a URL da imagem aqui..."
                />
                <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
              </div>
            </div>
          </section>

          <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                <Monitor className="text-indigo-400" size={16} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">White Label Core Actived</h4>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                  Estas configurações definem a aparência base de todo o ecossistema SaaS. Alterações aqui impactam todos os workspaces ativos que não possuem white label individual ativo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
