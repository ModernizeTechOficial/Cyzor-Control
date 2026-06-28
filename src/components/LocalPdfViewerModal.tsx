import { X, Download, ExternalLink, FileText, Printer, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { motion } from 'motion/react';

interface LocalPdfViewerModalProps {
  doc: {
    id: number;
    title: string;
    url?: string;
    size?: string;
    category?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function LocalPdfViewerModal({ doc, isOpen, onClose }: LocalPdfViewerModalProps) {
  if (!isOpen || !doc) return null;

  const handleDownload = () => {
    if (!doc.url) return;
    const a = document.createElement('a');
    a.href = doc.url;
    a.download = doc.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    const iframe = document.getElementById('pdf-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111111]/40 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full h-full max-w-6xl rounded-[24px] sm:rounded-[32px] border border-[#0F172A0F] shadow-[0_30px_80px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <header className="px-6 py-4 border-b border-[#0F172A0F] bg-[#FAFAFA] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="text-sm font-bold text-[#111111] truncate max-w-xs sm:max-w-md" title={doc.title}>
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                <span>{doc.category || 'Documento'}</span>
                <span>•</span>
                <span>{doc.size || 'PDF'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-[#64748B] hover:text-[#111111] transition-all border border-transparent hover:border-[#0F172A0F]"
              title="Baixar PDF"
            >
              <Download size={18} />
            </button>
            <button 
              onClick={handlePrint}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-[#64748B] hover:text-[#111111] transition-all border border-transparent hover:border-[#0F172A0F]"
              title="Imprimir"
            >
              <Printer size={18} />
            </button>
            <div className="w-px h-6 bg-[#0F172A0F] mx-1"></div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 text-[#111111] transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* PDF Viewport */}
        <div className="flex-1 bg-[#F1F5F9] relative overflow-hidden">
          {doc.url ? (
            <iframe 
              id="pdf-iframe"
              src={`${doc.url}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-none"
              title={doc.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
                <FileText size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-[#111111]">Documento não disponível</p>
                <p className="text-xs text-[#64748B] mt-1">Não foi possível carregar o conteúdo deste arquivo.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <footer className="px-6 py-3 border-t border-[#0F172A0F] bg-white flex items-center justify-between text-[10px] font-bold text-[#64748B] uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Visualização Segura CYZOR</span>
            <div className="flex items-center gap-1 text-emerald-600">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Encriptado AES-256</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="opacity-40">Ref: PDF-VIEW-MODAL-V1</span>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}
