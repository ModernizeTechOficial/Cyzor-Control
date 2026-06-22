import { useState, useEffect } from 'react';
import { 
  X, Save, Presentation, Plus, Trash2, ArrowLeft, ArrowRight, ChevronRight, 
  HelpCircle, Settings, PlayCircle, Layers, Palette, RefreshCw, Sparkles, 
  Download, Image as ImageIcon, Type, Square, Circle, Star, Volume2, Maximize, 
  FileText, Calendar, Compass, AlignCenter, Bold, Trash 
} from 'lucide-react';

interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'text' | 'shape' | 'image';
  content: string;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  color?: string;
  fontSize?: number;
  shapeType?: 'rect' | 'circle' | 'star';
  animation?: 'fade' | 'slide' | 'zoom';
}

interface Slide {
  id: string;
  background: string;
  elements: SlideElement[];
}

interface PresentationProps {
  doc: {
    id?: number;
    title: string;
    content?: string; // slide deck serialization JSON
    size?: string;
    folder?: string;
  };
  onSave: (updatedDoc: any) => void;
  onClose: () => void;
}

export default function PresentationProfessional({ doc, onSave, onClose }: PresentationProps) {
  // Slides list state
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // Presentation Projection Full Screen mode
  const [isProjecting, setIsProjecting] = useState<boolean>(false);
  
  // Custom templates list
  const templates = [
    { id: 'corporate', name: 'Corporativo Executivo', bg: 'bg-[#0F172A]', textColor: 'text-white', accentColor: '#38bdf8' },
    { id: 'pitch', name: 'SaaS Pitch Deck', bg: 'bg-[#FAFAFA]', textColor: 'text-slate-900', accentColor: '#6366f1' },
    { id: 'dark_mono', name: 'Tech Dark Mono', bg: 'bg-[#18181B]', textColor: 'text-[#F4F4F5]', accentColor: '#22d3ee' },
    { id: 'bold_marketing', name: 'Branding Bold', bg: 'bg-[#F97316]', textColor: 'text-white', accentColor: '#facc15' }
  ];
  const [selectedTemplate, setSelectedTemplate] = useState<string>('corporate');

  // Drag and drop / reposition states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Initial load
  useEffect(() => {
    if (doc.content && doc.content.startsWith('[')) {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.length > 0) {
          setSlides(parsed);
          return;
        }
      } catch (e) {
        console.error('Failed to parse slide deck JSON', e);
      }
    }

    // Default Seed Slide Deck corporate
    const defaultDeck: Slide[] = [
      {
        id: 's_v1',
        background: '#0F172A',
        elements: [
          { id: 'el_1', type: 'title', content: 'Cyzor SaaS: Planejamento Anual Q3/Q4', x: 10, y: 30, color: '#38bdf8', fontSize: 32, animation: 'slide' },
          { id: 'el_2', type: 'subtitle', content: 'Soluções de Inteligência de Negócios e Documentação', x: 10, y: 50, color: '#94a3b8', fontSize: 18, animation: 'fade' },
          { id: 'el_3', type: 'text', content: 'Apresentador: Diretoria de Engenharia do Produto', x: 10, y: 80, color: '#ffffff', fontSize: 13, animation: 'fade' }
        ]
      },
      {
        id: 's_v2',
        background: '#0F172A',
        elements: [
          { id: 'el_4', type: 'title', content: 'Nossa Visão Estratégica', x: 10, y: 15, color: '#38bdf8', fontSize: 26, animation: 'zoom' },
          { id: 'el_5', type: 'text', content: '• Integração em Tempo Real com Google Workspace e Drive\n• Editores dedicados inteligentes para Imagens, PDFs, Tabelas, Código\n• Segurança de nível regulatório para dados em Cloud SQL dedicado', x: 10, y: 35, color: '#f1f5f9', fontSize: 15, animation: 'fade' },
          { id: 'el_6', type: 'shape', content: 'rect', x: 80, y: 40, color: '#6366f1', shapeType: 'rect' }
        ]
      }
    ];
    setSlides(defaultDeck);
  }, [doc]);

  // Active slide elements
  const currentSlide = slides[activeSlideIndex] || slides[0];

  // Templates applier
  const applyTemplateToAllSlides = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find(t => t.id === templateId);
    if (!tmpl) return;

    const updated = slides.map(slide => {
      // Resolve BG from template
      let bg = '#0F172A';
      if (tmpl.id === 'pitch') bg = '#FAFAFA';
      if (tmpl.id === 'dark_mono') bg = '#18181B';
      if (tmpl.id === 'bold_marketing') bg = '#F97316';

      const updatedElements = slide.elements.map(el => {
        if (el.type === 'title') {
          return { ...el, color: tmpl.id === 'pitch' ? '#111111' : tmpl.accentColor };
        }
        if (el.type === 'subtitle' || el.type === 'text') {
          return { ...el, color: tmpl.id === 'pitch' ? '#4A4A4A' : '#ffffff' };
        }
        return el;
      });

      return {
        ...slide,
        background: bg,
        elements: updatedElements
      };
    });
    setSlides(updated);
  };

  // Elements operations
  const addSlideElement = (type: 'title' | 'subtitle' | 'text' | 'shape') => {
    if (!currentSlide) return;
    
    // Resolve content default values
    let content = 'Novo Elemento';
    let fontSize = 14;
    let color = '#ffffff';
    let shapeType: 'rect' | 'circle' = 'rect';

    if (type === 'title') {
      content = 'Título do Slide';
      fontSize = 24;
      color = '#38bdf8';
    } else if (type === 'subtitle') {
      content = 'Subtítulo informativo';
      fontSize = 16;
      color = '#94a3b8';
    } else if (type === 'text') {
      content = 'Insira parágrafos de notas explicativas aqui...';
      fontSize = 12;
    }

    const newElement: SlideElement = {
      id: `el_${Date.now()}`,
      type,
      content,
      x: 30 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      color,
      fontSize,
      shapeType: type === 'shape' ? 'rect' : undefined,
      animation: 'fade'
    };

    const updatedSlides = slides.map((s, idx) => {
      if (idx === activeSlideIndex) {
        return {
          ...s,
          elements: [...s.elements, newElement]
        };
      }
      return s;
    });
    setSlides(updatedSlides);
    setSelectedElementId(newElement.id);
  };

  const deleteElement = (elementId: string) => {
    const updated = slides.map((s, i) => {
      if (i === activeSlideIndex) {
        return {
          ...s,
          elements: s.elements.filter(el => el.id !== elementId)
        };
      }
      return s;
    });
    setSlides(updated);
    if (selectedElementId === elementId) setSelectedElementId(null);
  };

  const updateElementProperty = (elementId: string, updates: Partial<SlideElement>) => {
    const updated = slides.map((s, i) => {
      if (i === activeSlideIndex) {
        return {
          ...s,
          elements: s.elements.map(el => el.id === elementId ? { ...el, ...updates } : el)
        };
      }
      return s;
    });
    setSlides(updated);
  };

  // Slide Deck Structure Actions
  const addNewBlankSlide = () => {
    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      background: currentSlide?.background || '#0F172A',
      elements: [
        { id: `el_init_${Date.now()}`, type: 'title', content: 'Novo Slide', x: 10, y: 15, color: '#38bdf8', fontSize: 24, animation: 'fade' }
      ]
    };
    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const duplicateSlide = (idx: number) => {
    const target = slides[idx];
    const duplicated: Slide = {
      ...target,
      id: `slide_dup_${Date.now()}`,
      // append new IDs to duplicated elements
      elements: target.elements.map(el => ({ ...el, id: `el_dup_${Date.now()}_${Math.random()}` }))
    };
    const newSlides = [...slides];
    newSlides.splice(idx + 1, 0, duplicated);
    setSlides(newSlides);
    setActiveSlideIndex(idx + 1);
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) return;
    const newSlides = slides.filter((_, i) => i !== idx);
    setSlides(newSlides);
    setActiveSlideIndex(Math.max(0, idx - 1));
  };

  // Drag element helper handlers on projection/editor stage canvas
  const handleElementDragStart = (e: React.MouseEvent, el: SlideElement) => {
    e.stopPropagation();
    setIsDragging(true);
    setSelectedElementId(el.id);
  };

  const handleStageDragOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !selectedElementId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Bounds limit 0-95%
    const boundedX = Math.max(0, Math.min(90, x));
    const boundedY = Math.max(0, Math.min(90, y));

    updateElementProperty(selectedElementId, {
      x: parseFloat(boundedX.toFixed(1)),
      y: parseFloat(boundedY.toFixed(1))
    });
  };

  const handleElementDragEnd = () => {
    setIsDragging(false);
  };

  // Next Page / Previous keys projection navigations
  const handleNextSlide = () => {
    if (activeSlideIndex < slides.length - 1) {
      setActiveSlideIndex(activeSlideIndex + 1);
    } else {
      setIsProjecting(false); // Close projection mode
    }
  };

  const handlePrevSlide = () => {
    if (activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleSaveDeckToSaaS = () => {
    const compiledOutput = {
      ...doc,
      content: JSON.stringify(slides),
      size: `${Math.round(JSON.stringify(slides).length / 100) / 10} KB`,
      folder: doc.folder || 'Planejamento',
      updatedAt: new Date().toISOString()
    };
    onSave(compiledOutput);
  };

  const activeElement = currentSlide?.elements.find(el => el.id === selectedElementId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/85 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      
      {/* 1. PRIMARY PRESENTATION PRESENTING MODE / FULLSCREEN SHOW */}
      {isProjecting ? (
        <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-between p-6 z-[60] animate-in fade-in zoom-in-95 duration-300">
          
          {/* Top minimal bar info */}
          <div className="w-full max-w-6xl flex justify-between items-center text-xs text-neutral-400">
            <span className="font-bold uppercase tracking-wider text-neutral-400">
              投影模式 &middot; Projeção Ativa Animações
            </span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-cyan-400">{activeSlideIndex + 1} de {slides.length}</span>
              <button
                onClick={() => setIsProjecting(false)}
                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 font-bold uppercase rounded text-white cursor-pointer"
              >
                Encerrar Projeção (ESC)
              </button>
            </div>
          </div>

          {/* Slide Stage projection area */}
          <div 
            onClick={handleNextSlide}
            className="w-full max-w-4xl aspect-[16/9] border border-white/5 rounded-2xl relative shadow-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden"
            style={{ backgroundColor: currentSlide?.background || '#0F172A' }}
          >
            {/* Visual presentation contents elements */}
            {currentSlide?.elements.map(el => {
              // Build standard dynamic entrance transition classes
              let animClass = 'transition-all duration-700 ease-out';
              if (el.animation === 'zoom') animClass += ' scale-105 animate-in zoom-in-95';
              if (el.animation === 'slide') animClass += ' -translate-y-4 animate-in slide-in-from-top-4';
              if (el.animation === 'fade') animClass += ' opacity-100 animate-in fade-in';

              return (
                <div
                  key={el.id}
                  className={`absolute pointer-events-none ${animClass}`}
                  style={{
                    left: `${el.x}%`,
                    top: `${el.y}%`,
                    color: el.color || '#ffffff',
                    fontSize: `${el.fontSize || 16}px`
                  }}
                >
                  {el.type === 'title' && <h1 className="font-bold tracking-tight text-white/95">{el.content}</h1>}
                  {el.type === 'subtitle' && <h3 className="font-semibold text-neutral-450">{el.content}</h3>}
                  {el.type === 'text' && <p className="font-medium whitespace-pre-wrap text-left text-neutral-200">{el.content}</p>}
                  {el.type === 'shape' && (
                    <div className="w-14 h-14 bg-indigo-500 rounded" style={{ backgroundColor: el.color }} />
                  )}
                </div>
              );
            })}

            {/* Click notice bottom stage */}
            <div className="absolute bottom-3 right-4 text-[9px] font-mono text-neutral-400 opacity-30 select-none">
              Dica: Clique no slide para avançar &rarr;
            </div>
          </div>

          {/* Projection manual keys controls bottom */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevSlide}
              disabled={activeSlideIndex === 0}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-30"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              onClick={handleNextSlide}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      ) : (

        /* 2. STANDARD INTUIVITE PRESENTATION SLIDE SHOW CREATOR */
        <div className="bg-[#1E293B] text-slate-100 border border-white/10 w-full h-[95vh] sm:rounded-[28px] max-w-7xl shadow-2xl flex flex-col overflow-hidden relative">
          
          {/* Top Panel header */}
          <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-slate-900 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-850 flex items-center justify-center">
                <Presentation size={16} />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs">{doc.title}</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">
                  Estúdio de Apresentações de Negócios (SaaS Pitch Deck)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProjecting(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <PlayCircle size={14} />
                <span>Apresentar Q3</span>
              </button>

              <button 
                onClick={handleSaveDeckToSaaS}
                className="bg-[#111111] hover:bg-black text-white font-bold border border-white/10 px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Save size={14} />
                Salvar Slides
              </button>

              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg text-white"
              >
                <X size={15} />
              </button>
            </div>
          </header>

          {/* Master Slide Editor workspace body */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* W1. Left Slides Thumbs Sidebar */}
            <aside className="w-56 bg-slate-900/60 border-r border-white/10 flex flex-col justify-between shrink-0">
              
              <div className="p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                  <span>Slides ({slides.length})</span>
                  <button
                    onClick={addNewBlankSlide}
                    className="p-1 hover:bg-slate-800 rounded text-cyan-400"
                    title="Adicionar Slide"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Slides thumbs rendering flow */}
                <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {slides.map((slide, index) => {
                    const isActive = index === activeSlideIndex;
                    return (
                      <div
                        key={slide.id}
                        onClick={() => {
                          setActiveSlideIndex(index);
                          setSelectedElementId(null);
                        }}
                        className={`p-2.5 border rounded-xl relative cursor-pointer group text-left ${
                          isActive ? 'border-cyan-400 bg-cyan-950/25 ring-2 ring-cyan-500/10' : 'border-white/5 bg-slate-800/40 hover:bg-slate-850'
                        }`}
                      >
                        {/* Tiny thumb title representation placeholder */}
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Pág. {index + 1}</p>
                        <h4 className="text-[11px] font-bold text-white truncate max-w-[150px] mt-1">
                          {slide.elements.find(el => el.type === 'title')?.content || 'Slide Sem Título'}
                        </h4>

                        {/* Thumbs action panel quick */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateSlide(index);
                            }}
                            className="p-0.5 text-neutral-400 hover:text-white"
                            title="Duplicar Slide"
                          >
                            <RefreshCw size={9} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSlide(index);
                            }}
                            className="p-0.5 text-rose-450 hover:text-rose-600"
                            title="Deletar"
                          >
                            <Trash2 size={9} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pitch Slide Templates Options bottom side */}
              <div className="p-4 border-t border-white/5 flex flex-col gap-2 bg-slate-950/40 text-left">
                <span className="text-[9px] font-bold text-[#94A3B8] uppercase tracking-widest">Modelos Disponíveis</span>
                <div className="flex flex-col gap-1.5 mt-1">
                  {templates.map(tmpl => (
                    <button
                      key={tmpl.id}
                      onClick={() => applyTemplateToAllSlides(tmpl.id)}
                      className={`w-full p-2.5 rounded-lg border text-xs font-bold text-left flex items-center justify-between transition-all ${
                        selectedTemplate === tmpl.id ? 'border-cyan-400 bg-cyan-950/20 text-cyan-400' : 'border-white/5 bg-slate-800 text-neutral-400 hover:bg-slate-750'
                      }`}
                    >
                      <span>{tmpl.name}</span>
                      <ChevronRight size={12} className="opacity-40" />
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* W2. Active Presentation Slide stage edit workspace */}
            <main className="flex-1 bg-[#020617] p-8 flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Dynamic canvas stage 16:9 ratio wrapper */}
              <div
                onMouseMove={handleStageDragOver}
                onMouseUp={handleElementDragEnd}
                className="w-full max-w-3xl aspect-[16/9] border border-white/10 rounded-2xl relative shadow-2xl flex flex-col items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: currentSlide?.background || '#0F172A',
                  cursor: isDragging ? 'grabbing' : 'default'
                }}
              >
                {currentSlide?.elements.map(el => {
                  const isSelected = el.id === selectedElementId;
                  return (
                    <div
                      key={el.id}
                      onMouseDown={(e) => handleElementDragStart(e, el)}
                      className={`absolute px-3 py-1.5 rounded-lg select-text text-left cursor-grab transition-shadow ${
                        isSelected ? 'ring-2 ring-cyan-500 bg-cyan-950/40 shadow-lg' : 'hover:ring-1 hover:ring-white/20'
                      }`}
                      style={{
                        left: `${el.x}%`,
                        top: `${el.y}%`,
                        color: el.color || '#ffffff',
                        fontSize: `${el.fontSize || 14}px`,
                        cursor: isDragging && isSelected ? 'grabbing' : 'grab'
                      }}
                    >
                      {el.type === 'title' && (
                        <h1 className="font-extrabold tracking-tight" style={{ color: el.color }}>
                          {el.content}
                        </h1>
                      )}
                      {el.type === 'subtitle' && (
                        <h3 className="font-semibold text-neutral-300" style={{ color: el.color }}>
                          {el.content}
                        </h3>
                      )}
                      {el.type === 'text' && (
                        <p className="font-medium whitespace-pre-wrap leading-relaxed" style={{ color: el.color }}>
                          {el.content}
                        </p>
                      )}
                      {el.type === 'shape' && (
                        <div className="w-16 h-16 bg-cyan-500 rounded-lg shadow-sm" style={{ backgroundColor: el.color }} />
                      )}

                      {/* Small overlay action buttons for active editing items */}
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteElement(el.id);
                          }}
                          className="absolute -top-3.5 -right-3 px-1.5 py-0.5 bg-rose-600 rounded text-[9px] font-bold uppercase text-white pointer-events-auto"
                        >
                          <Trash size={10} />
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* Corner instructions watermark */}
                <div className="absolute bottom-3 left-4 text-[9px] font-mono text-neutral-400 opacity-20">
                  Arrastar os elementos para posicionar &middot; 1920x1080 Vetores
                </div>
              </div>
            </main>

            {/* W3. Selected Element Properties Shelf */}
            <aside className="w-80 bg-slate-900 border-l border-white/10 p-5 flex flex-col gap-6 overflow-y-auto shrink-0 select-all scrollbar-thin text-left">
              <div className="border-b border-white/10 pb-3 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                <span>Propriedades do Slide</span>
                <span className="bg-slate-800 text-cyan-400 text-[10px] px-2 py-0.5 rounded">Active</span>
              </div>

              {/* Elements Injection flow button row */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Injetar Novo Elemento</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  <button
                    onClick={() => addSlideElement('title')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-[10px] font-bold text-neutral-200 flex flex-col items-center gap-1"
                  >
                    <Type size={13} />
                    <span>Título</span>
                  </button>
                  <button
                    onClick={() => addSlideElement('subtitle')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-[10px] font-bold text-neutral-200 flex flex-col items-center gap-1"
                  >
                    <Type size={13} className="opacity-70" />
                    <span>Subtítulo</span>
                  </button>
                  <button
                    onClick={() => addSlideElement('text')}
                    className="p-2 bg-slate-800 hover:bg-slate-700 border border-white/5 rounded-xl text-[10px] font-bold text-neutral-200 flex flex-col items-center gap-1"
                  >
                    <FileText size={13} />
                    <span>Texto</span>
                  </button>
                </div>
              </div>

              {/* ACTIVE ITEM SPECIFIC PROPERTIES SLIDE FORM */}
              {activeElement ? (
                <div className="flex flex-col gap-4 bg-slate-850 p-4 border border-white/5 rounded-2xl animate-in fade-in duration-100">
                  <p className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Editar Elemento Ativo</p>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-neutral-400">Conteúdo do Texto</label>
                    <textarea
                      value={activeElement.content}
                      onChange={(e) => updateElementProperty(activeElement.id, { content: e.target.value })}
                      rows={4}
                      className="bg-slate-800 border border-white/5 rounded-xl p-2.5 text-xs text-white outline-none w-full"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] text-neutral-400">Tamanho Fonte</label>
                      <input
                        type="number"
                        value={activeElement.fontSize || 14}
                        onChange={(e) => updateElementProperty(activeElement.id, { fontSize: Number(e.target.value) })}
                        className="bg-slate-800 border border-white/5 rounded-xl p-2 text-xs text-white outline-none text-center"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10.5px] text-neutral-400">Cor Hex</label>
                      <input
                        type="color"
                        value={activeElement.color || '#ffffff'}
                        onChange={(e) => updateElementProperty(activeElement.id, { color: e.target.value })}
                        className="w-full bg-slate-800 border border-white/5 rounded-xl p-1 h-8 text-xs text-center cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-xs text-neutral-400">Animação de Entrada</label>
                    <select
                      value={activeElement.animation || 'fade'}
                      onChange={(e) => updateElementProperty(activeElement.id, { animation: e.target.value as any })}
                      className="bg-slate-800 border border-white/5 p-2 rounded-xl text-xs text-neutral-300"
                    >
                      <option value="fade">Disparar Fade-In</option>
                      <option value="slide">Fazer Deslizamento Superior (Slide)</option>
                      <option value="zoom">Zoom-In AI Pulsador</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed border-white/5 bg-slate-850/35 rounded-2xl">
                  <p className="text-xs text-neutral-500 font-medium">Nenhum elemento selecionável.<br />Clique em um texto no slide para configurar.</p>
                </div>
              )}

              {/* Background properties customize */}
              <div className="flex flex-col gap-2 mt-auto">
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Plano de Fundo do Slide</span>
                <div className="flex items-center gap-3 bg-slate-850 p-3 rounded-2xl border border-white/5">
                  <input
                    type="color"
                    value={currentSlide?.background || '#0F172A'}
                    onChange={(e) => {
                      const updated = slides.map((s, idx) => {
                        if (idx === activeSlideIndex) return { ...s, background: e.target.value };
                        return s;
                      });
                      setSlides(updated);
                    }}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <div className="flex-1 text-xs text-left">
                    <p className="font-bold">Cor Personalizada</p>
                    <p className="text-[10px] text-neutral-500 font-mono font-bold uppercase">{currentSlide?.background}</p>
                  </div>
                </div>
              </div>

            </aside>
          </div>

        </div>
      )}
    </div>
  );
}
