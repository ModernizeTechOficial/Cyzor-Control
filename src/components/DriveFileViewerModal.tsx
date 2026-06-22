import { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, Layers, Edit3, Eye, FileText, FileSpreadsheet, PlayCircle, Loader2 } from 'lucide-react';

interface DriveFileViewerModalProps {
  file: {
    id: string;
    name: string;
    mimeType: string;
    webViewLink?: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DriveFileViewerModal({ file, isOpen, onClose }: DriveFileViewerModalProps) {
  const [viewMode, setViewMode] = useState<'preview' | 'edit'>('edit');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (file) {
      setIframeLoaded(false);
      // Default to preview mode for binary/non-google docs, edit mode for Google native apps
      const isGoogleNative = 
        file.mimeType.includes('vnd.google-apps') || 
        file.mimeType.includes('document') || 
        file.mimeType.includes('sheet') || 
        file.mimeType.includes('slides');
      
      setViewMode(isGoogleNative ? 'edit' : 'preview');
    }
  }, [file, isOpen]);

  if (!isOpen || !file) return null;

  // Derive the perfect iframe URL based on file type and selected mode
  const getIframeUrl = () => {
    const fileId = file.id;
    const mime = file.mimeType;

    if (viewMode === 'preview') {
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // Edit modes for specific Google workspace items
    if (mime === 'application/vnd.google-apps.document') {
      return `https://docs.google.com/document/d/${fileId}/edit?usp=drivesdk&rm=minimal`;
    }
    if (mime === 'application/vnd.google-apps.spreadsheet') {
      return `https://docs.google.com/spreadsheets/d/${fileId}/edit?usp=drivesdk&rm=minimal`;
    }
    if (mime === 'application/vnd.google-apps.presentation') {
      return `https://docs.google.com/presentation/d/${fileId}/edit?usp=drivesdk&rm=minimal`;
    }

    // Fallback if edit mode was forced on a generic file
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const isGoogleWorkspaceType = 
    file.mimeType === 'application/vnd.google-apps.document' || 
    file.mimeType === 'application/vnd.google-apps.spreadsheet' || 
    file.mimeType === 'application/vnd.google-apps.presentation';

  const iframeUrl = getIframeUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#111111]/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] w-full h-[95vh] sm:h-[95vh] rounded-t-[24px] sm:rounded-[28px] border border-[#DEE2E6]/60 shadow-[0_30px_90px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
        
        {/* Top Control Bar */}
        <header className="h-18 px-4 sm:px-6 border-b border-[#DEE2E6]/60 flex items-center justify-between bg-[#FAFAFA]/90 flex-shrink-0 backdrop-blur-xs gap-2">
          <div className="flex items-center gap-2 sm:gap-3.5 overflow-hidden">
            {/* File Icon */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white border border-[#DEE2E6]/80 flex items-center justify-center shadow-xs shrink-0 text-indigo-600">
              {file.mimeType.includes('spreadsheet') || file.mimeType.includes('sheet') ? (
                <FileSpreadsheet size={15} />
              ) : (
                <FileText size={15} />
              )}
            </div>
            
            <div className="flex flex-col overflow-hidden leading-tight text-left">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate max-w-[100px] sm:max-w-md md:max-w-xl" title={file.name}>
                {file.name}
              </h3>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-neutral-500 mt-0.5 whitespace-nowrap">
                Google Drive Doc
              </span>
            </div>
          </div>

          {/* Core Applet controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Mode Selector for Workspace Documents */}
            {isGoogleWorkspaceType && (
              <div className="flex bg-[#F1F3F5] p-0.5 rounded-xl border border-[#DEE2E6]/50">
                <button
                  type="button"
                  onClick={() => { setIframeLoaded(false); setViewMode('edit'); }}
                  className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all ${
                    viewMode === 'edit'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Edit3 size={10} />
                  <span className="hidden xs:inline">Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setIframeLoaded(false); setViewMode('preview'); }}
                  className={`px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 transition-all ${
                    viewMode === 'preview'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  <Eye size={10} />
                  <span className="hidden xs:inline">Ver</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => { setIframeLoaded(false); setReloadKey(prev => prev + 1); }}
              className="p-1.5 sm:p-2.5 text-neutral-400 hover:text-neutral-700 bg-white border border-[#DEE2E6]/60 rounded-xl transition-all hover:shadow-xs"
              title="Recarregar"
            >
              <RefreshCw size={13} className={!iframeLoaded ? 'animate-spin' : ''} />
            </button>

            {file.webViewLink && (
              <a
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer referrer"
                className="bg-white hover:bg-neutral-50 text-neutral-700 border border-[#DEE2E6]/70 p-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 sm:gap-1.5 shadow-xs transition-all"
                title="Abrir em Nova Aba"
              >
                <span className="hidden sm:inline">Google Tab</span>
                <ExternalLink size={12} className="text-neutral-400" />
              </a>
            )}

            <div className="w-px h-6 bg-[#DEE2E6] mx-0.5 sm:mx-1 hidden sm:block"></div>

            <button 
              onClick={onClose} 
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 text-[#111111] border border-transparent hover:border-[#DEE2E6]/40 transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Embedded Document Frame Arena */}
        <section className="flex-1 bg-[#EEF1F6] relative overflow-hidden flex flex-col items-center justify-center">
          
          {/* Visual Loader Overlay */}
          {!iframeLoaded && (
            <div className="absolute inset-x-0 top-0 bottom-0 bg-neutral-50 flex flex-col items-center justify-center gap-4 z-20">
              <Loader2 size={38} className="text-indigo-600 animate-spin" />
              <div className="text-center">
                <p className="font-bold text-neutral-900 text-sm">Carregando visualizador seguro...</p>
                <p className="text-xs text-neutral-500 mt-1 max-w-sm px-6">
                  Autenticando sessão com o Google Workspace para carregamento direto do arquivo.
                </p>
              </div>
            </div>
          )}

          {/* Notice for access token fallback */}
          <div className="bg-neutral-900/5 px-4 py-2 border-b border-black/5 w-full text-center text-[10px] font-bold text-neutral-700 uppercase tracking-widest flex items-center justify-center gap-2 select-none">
            <Layers size={11} className="text-indigo-600" />
            Abra diretamente no Google usando "Google Tab" acima se restrições de iFrame do navegador persistirem.
          </div>

          <iframe
            key={`${iframeUrl}-${viewMode}-${reloadKey}`}
            src={iframeUrl}
            className="w-full flex-1 border-0 bg-white"
            allow="autoplay; clipboard-write; encrypted-media"
            onLoad={() => setIframeLoaded(true)}
            referrerPolicy="no-referrer"
          />
        </section>

      </div>
    </div>
  );
}
