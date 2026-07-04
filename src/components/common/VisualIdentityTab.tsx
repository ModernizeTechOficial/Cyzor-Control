import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2, Link2 } from 'lucide-react';
import { showError, showSuccess } from '../../lib/alerts';

interface VisualIdentityTabProps {
  entityName: string;
  logoUrl: string;
  coverUrl: string;
  onChangeLogo: (url: string) => void;
  onChangeCover: (url: string) => void;
}

export const VisualIdentityTab: React.FC<VisualIdentityTabProps> = ({
  entityName,
  logoUrl,
  coverUrl,
  onChangeLogo,
  onChangeCover
}) => {
  const { fetchWithAuth } = useAuth();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  
  const [logoInputUrl, setLogoInputUrl] = useState(logoUrl || '');
  const [coverInputUrl, setCoverInputUrl] = useState(coverUrl || '');

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'cover') => {
    if (!file) return;
    
    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('O arquivo excede o limite máximo de 5MB.');
      return;
    }

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingCover(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetchWithAuth('/api/upload', {
        method: 'POST',
        body: formData, // fetchWithAuth will automatically handle multipart if we don't set Content-Type header manually or if body is FormData
      });

      if (res.ok) {
        const data = await res.json();
        if (type === 'logo') {
          onChangeLogo(data.url);
          setLogoInputUrl(data.url);
        } else {
          onChangeCover(data.url);
          setCoverInputUrl(data.url);
        }
        showSuccess('Upload realizado com sucesso!');
      } else {
        const errorData = await res.json().catch(() => ({}));
        showError(errorData.error || 'Falha ao fazer upload da imagem.');
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      showError('Erro ao enviar o arquivo.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingCover(false);
    }
  };

  const handleUrlSubmit = (type: 'logo' | 'cover') => {
    if (type === 'logo') {
      onChangeLogo(logoInputUrl);
      showSuccess('Logotipo atualizado!');
    } else {
      onChangeCover(coverInputUrl);
      showSuccess('Imagem de capa atualizada!');
    }
  };

  return (
    <div className="p-6 flex flex-col gap-8 text-left max-w-2xl">
      <div>
        <h4 className="text-sm font-bold text-[#111111]">Identidade Visual</h4>
        <p className="text-[10px] font-medium text-[#64748B] mt-0.5">
          Personalize as imagens e logotipo oficiais que representam esta entidade em toda a plataforma.
        </p>
      </div>

      {/* Logotipo Section */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Logotipo</label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl border border-[#0F172A0A] bg-[#FAFAFA]/50">
          {/* Logo Preview */}
          <div className="relative shrink-0">
            {logoUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border border-[#0F172A0A] bg-white flex items-center justify-center shadow-sm">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain" 
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center font-display font-bold text-xl shadow-sm border border-[#0F172A0F]">
                {getInitials(entityName)}
              </div>
            )}
            
            {logoUrl && (
              <button
                type="button"
                onClick={() => {
                  onChangeLogo('');
                  setLogoInputUrl('');
                }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-sm cursor-pointer"
                title="Remover logotipo"
              >
                <X size={10} strokeWidth={3} />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1 w-full flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm flex items-center gap-1">
                {uploadingLogo ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                <span>{uploadingLogo ? 'Enviando...' : 'Fazer Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'logo');
                  }}
                  className="hidden"
                  disabled={uploadingLogo}
                />
              </label>
              
              {logoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeLogo('');
                    setLogoInputUrl('');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#0F172A0F] text-[#64748B] hover:text-rose-600 hover:bg-rose-50/50 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Remover
                </button>
              )}
            </div>
            
            {/* Direct URL Input */}
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#64748B]">
                  <Link2 size={12} />
                </span>
                <input
                  type="text"
                  placeholder="Ou insira a URL da imagem..."
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-white border border-[#0F172A0A] rounded-lg text-[11px] font-medium placeholder-slate-400 outline-none focus:border-[#111111]/30 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUrlSubmit('logo')}
                className="px-2.5 py-1 text-[10px] font-bold text-[#111111] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[9px] font-medium text-[#64748B]">Formato recomendado: PNG, JPG ou SVG quadrado de até 5MB.</p>
          </div>
        </div>
      </div>

      {/* Imagem de Capa Section */}
      <div className="flex flex-col gap-3">
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">Imagem de Capa</label>
        <div className="flex flex-col gap-4 p-4 rounded-2xl border border-[#0F172A0A] bg-[#FAFAFA]/50">
          {/* Cover Preview */}
          <div className="w-full h-32 rounded-xl overflow-hidden border border-[#0F172A0A] bg-slate-100/50 flex items-center justify-center relative">
            {coverUrl ? (
              <>
                <img 
                  src={coverUrl} 
                  alt="Capa" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
                <button
                  type="button"
                  onClick={() => {
                    onChangeCover('');
                    setCoverInputUrl('');
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md cursor-pointer"
                  title="Remover capa"
                >
                  <X size={12} strokeWidth={2.5} />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-1.5 text-slate-400">
                <ImageIcon size={24} strokeWidth={1.5} />
                <span className="text-[10px] font-semibold">Sem imagem de capa selecionada</span>
              </div>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <label className="px-3 py-1.5 bg-[#111111] hover:bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer shadow-sm flex items-center gap-1">
                {uploadingCover ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Upload size={12} />
                )}
                <span>{uploadingCover ? 'Enviando...' : 'Fazer Upload'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, 'cover');
                  }}
                  className="hidden"
                  disabled={uploadingCover}
                />
              </label>

              {coverUrl && (
                <button
                  type="button"
                  onClick={() => {
                    onChangeCover('');
                    setCoverInputUrl('');
                  }}
                  className="px-3 py-1.5 bg-white border border-[#0F172A0F] text-[#64748B] hover:text-rose-600 hover:bg-rose-50/50 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Remover
                </button>
              )}
            </div>

            {/* Direct URL Input */}
            <div className="flex items-center gap-2 mt-1">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[#64748B]">
                  <Link2 size={12} />
                </span>
                <input
                  type="text"
                  placeholder="Ou insira a URL da imagem de capa..."
                  value={coverInputUrl}
                  onChange={(e) => setCoverInputUrl(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 bg-white border border-[#0F172A0A] rounded-lg text-[11px] font-medium placeholder-slate-400 outline-none focus:border-[#111111]/30 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={() => handleUrlSubmit('cover')}
                className="px-2.5 py-1 text-[10px] font-bold text-[#111111] bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
              >
                Aplicar
              </button>
            </div>
            <p className="text-[9px] font-medium text-[#64748B]">Resolução recomendada: 1200x400 para preenchimento ideal. Máximo: 5MB.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
