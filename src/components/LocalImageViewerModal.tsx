import { X, Download, Maximize2, ZoomIn, ZoomOut, RotateCw, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface LocalImageViewerModalProps {
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

export default function LocalImageViewerModal({ doc, isOpen, onClose }: LocalImageViewerModalProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#111111]/80 backdrop-blur-xl animate-in fade-in duration-300 p-4 sm:p-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full h-full flex flex-col"
      >
        {/* Header Overlay */}
        <header className="absolute top-0 left-0 right-0 z-20 p-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white">
              <ImageIcon size={24} />
            </div>
            <div className="flex flex-col">
              <h3 className="text-lg font-bold text-white drop-shadow-md truncate max-w-md">
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-white/60 font-bold uppercase tracking-widest">
                <span>{doc.category || 'Imagem'}</span>
                <span>•</span>
                <span>{doc.size || 'External Upload'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pointer-events-auto">
             <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10">
                <button 
                   onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                   className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all"
                >
                   <ZoomOut size={20} />
                </button>
                <button 
                   onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                   className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all"
                >
                   <ZoomIn size={20} />
                </button>
                <div className="w-px h-6 bg-white/10 mx-1" />
                <button 
                   onClick={() => setRotation(prev => (prev + 90) % 360)}
                   className="p-2.5 rounded-xl hover:bg-white/20 text-white transition-all"
                >
                   <RotateCw size={20} />
                </button>
             </div>

            <button 
              onClick={handleDownload}
              className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <Download size={24} />
            </button>
            
            <button 
              onClick={onClose}
              className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#111111] hover:bg-slate-100 transition-all shadow-xl"
            >
              <X size={28} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
           <AnimatePresence mode="wait">
             <motion.img
               key={doc.url}
               src={doc.url}
               alt={doc.title}
               style={{ 
                  scale: zoom, 
                  rotate: `${rotation}deg`,
                  maxWidth: '90%',
                  maxHeight: '90%'
               }}
               className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-transform duration-300"
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: zoom }}
             />
           </AnimatePresence>
        </div>

        {/* Footer info */}
        <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest z-20">
           {Math.round(zoom * 100)}% Zoom • {rotation}° Rotation • Full Dynamic Preview
        </footer>
      </motion.div>
    </div>
  );
}
