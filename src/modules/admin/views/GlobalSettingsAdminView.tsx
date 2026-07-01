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
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Settings className="text-blue-500" size={32} />
            Configurações da Plataforma
          </h1>
          <p className="text-gray-400 text-sm font-medium">Personalize a identidade visual core e o ambiente de acesso.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] shrink-0"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Identity Section */}
        <div className="space-y-8">
          <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                <Globe size={22} />
              </div>
              <h2 className="text-xl font-black text-[#111111] tracking-tight">Identidade Visual</h2>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Nome da Plataforma</label>
                <div className="relative">
                  <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    type="text" 
                    value={globalAppName} 
                    onChange={e => setGlobalAppName(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-100 focus:border-blue-500/20 focus:bg-white rounded-2xl pl-12 pr-5 py-4 text-[#111111] font-bold transition-all outline-none"
                    placeholder="Ex: CYZOR CONTROL"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Logotipo Principal</label>
                  <div className="flex flex-col gap-4">
                    <div className="h-20 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center p-4 relative group">
                      {globalLogoUrl ? (
                        <img src={globalLogoUrl} className="max-h-full object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'logo')} accept="image/*" />
                        <span className="text-xs font-black text-blue-600">Mudar Logo</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={globalLogoUrl} 
                      onChange={e => setGlobalLogoUrl(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-mono text-gray-500 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Ícone do Dashboard</label>
                  <div className="flex flex-col gap-4">
                    <div className="h-20 w-full bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center p-4 relative group">
                      {globalIconUrl ? (
                        <img src={globalIconUrl} className="max-h-12 object-contain" />
                      ) : (
                        <ImageIcon className="text-gray-300" size={24} />
                      )}
                      <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                        <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'icon')} accept="image/*" />
                        <span className="text-xs font-black text-blue-600">Mudar Ícone</span>
                      </label>
                    </div>
                    <input 
                      type="text" 
                      value={globalIconUrl} 
                      onChange={e => setGlobalIconUrl(e.target.value)} 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] font-mono text-gray-500 outline-none"
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
          <section className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                <Palette size={22} />
              </div>
              <h2 className="text-xl font-black text-[#111111] tracking-tight">Tela de Acesso</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Imagem de Fundo (Hero)</label>
                  <label className="cursor-pointer text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                    <input type="file" className="hidden" onChange={e => handleFileUpload(e, 'hero')} accept="image/*" />
                    <ImageIcon size={12} />
                    Fazer Upload
                  </label>
                </div>
                
                <div className="relative aspect-[16/9] rounded-3xl overflow-hidden border border-gray-100 shadow-inner group">
                  {loginHeroUrl ? (
                    <img src={loginHeroUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <ImageIcon className="text-gray-200" size={48} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <p className="text-white font-bold text-sm">Visualização Premium</p>
                    <p className="text-white/60 text-[10px] font-medium">A imagem será exibida com filtros de contraste e brilho na tela de login.</p>
                  </div>
                </div>

                <div className="relative">
                  <input 
                    type="text" 
                    value={loginHeroUrl} 
                    onChange={e => setLoginHeroUrl(e.target.value)} 
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-[#111111] font-medium text-sm transition-all outline-none pr-12"
                    placeholder="Cole a URL da imagem aqui..."
                  />
                  <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                </div>
              </div>
            </div>
          </section>

          <div className="p-6 rounded-[32px] bg-blue-50/50 border border-blue-100/50">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Monitor className="text-blue-600" size={20} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-blue-900">White Label Core</h4>
                <p className="text-xs text-blue-700/70 font-medium leading-relaxed">
                  Estas configurações definem a aparência base de todo o ecossistema. Alterações aqui impactam todos os usuários que não possuem white label personalizado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
