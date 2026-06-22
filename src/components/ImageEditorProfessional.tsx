import { useState, useEffect, useRef } from 'react';
import { 
  ZoomIn, ZoomOut, RotateCw, Play, Sliders, Crop, Palette, Layers, Sparkles, 
  Trash2, Type, Image as ImageIcon, Check, RefreshCw, Eye, EyeOff, Lock, Unlock, 
  MessageSquare, ChevronRight, Maximize, Move, HelpCircle, ArrowRight, CornerUpLeft, 
  Download, CheckCheck, Loader2, Wand2, Star, Flame, Brush, Eraser, 
  Compass, Scan, Maximize2, Shield, Contrast, Sun, X
} from 'lucide-react';

interface ImageEditorProps {
  doc: {
    id?: number;
    title: string;
    content?: string; // stores image state/annotations or json
    url?: string;     // stores base64 image data or placeholder url
    size?: string;
    folder?: string;
  };
  onSave: (updatedDoc: any) => void;
  onClose: () => void;
}

export default function ImageEditorProfessional({ doc, onSave, onClose }: ImageEditorProps) {
  // Image URL state
  const [imageUrl, setImageUrl] = useState<string>(
    doc.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
  );
  
  // Tabs: 'adjust', 'transform', 'tools', 'annotations', 'ai'
  const [activePanel, setActivePanel] = useState<'adjust' | 'transform' | 'tools' | 'annotations' | 'ai'>('adjust');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Slider states for css filters
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [sharpness, setSharpness] = useState<number>(0);
  const [exposure, setExposure] = useState<number>(100);
  const [temperature, setTemperature] = useState<number>(0);
  const [hue, setHue] = useState<number>(0);
  const [noise, setNoise] = useState<number>(0);
  const [vignette, setVignette] = useState<number>(0);
  
  // Transform settings
  const [rotation, setRotation] = useState<number>(0);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const [aspectRatio, setAspectRatio] = useState<string>('free'); // 'free', '1:1', '16:9', '4:3', '2:3'
  const [perspectiveX, setPerspectiveX] = useState<number>(0);
  const [perspectiveY, setPerspectiveY] = useState<number>(0);
  
  // View states
  const [zoom, setZoom] = useState<number>(100);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Interactive tool states
  const [selectedTool, setSelectedTool] = useState<'select' | 'brush' | 'eraser' | 'clone' | 'wand'>('select');
  const [brushColor, setBrushColor] = useState<string>('#6366f1');
  const [brushSize, setBrushSize] = useState<number>(12);
  const [brushOpacity, setBrushOpacity] = useState<number>(100);
  
  // Canvas drawing ref
  const paintCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isComparing, setIsComparing] = useState(false); // Before/After split screen view
  
  // Annotations Layer State
  const [annotations, setAnnotations] = useState<Array<{
    id: string;
    type: 'text' | 'arrow' | 'shape' | 'note';
    x: number;
    y: number;
    text?: string;
    color?: string;
    size?: number;
    w?: number;
    h?: number;
  }>>([]);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // Figma-style Layers Panel
  const [layers, setLayers] = useState([
    { id: 'annotations', name: 'Anotações & Vetores', visible: true, locked: false },
    { id: 'paint', name: 'Canva de Desenho Livre', visible: true, locked: false },
    { id: 'adjustments', name: 'Filtros & Ajustes', visible: true, locked: false },
    { id: 'background', name: 'Background Principal', visible: true, locked: true },
  ]);
  
  // Figma-style Comments Panel
  const [comments, setComments] = useState<Array<{
    id: string;
    x: number;
    y: number;
    text: string;
    author: string;
    date: string;
    replies?: any[];
  }>>([
    { id: 'c1', x: 45, y: 35, text: 'Precisamos dar mais contraste nesta área do briefing.', author: 'Guilherme Silva', date: 'Hoje às 10:20' }
  ]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isDropCommentActive, setIsDropCommentActive] = useState(false);
  
  // Curves UI state
  const [curves, setCurves] = useState([
    { x: 0, y: 0 },
    { x: 25, y: 20 },
    { x: 50, y: 50 },
    { x: 75, y: 80 },
    { x: 100, y: 100 }
  ]);
  const [selectedCurvePoint, setSelectedCurvePoint] = useState<number | null>(null);

  // AI Operation States
  const [aiOperation, setAiOperation] = useState<string | null>(null); // 'upscale' | 'denoise' | 'restore' | 'bg_remove' | 'generative'
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLogs, setAiLogs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [originalBackupUrl, setOriginalBackupUrl] = useState<string>('');

  // Initialize Canvas dimensions on mount
  useEffect(() => {
    const canvas = paintCanvasRef.current;
    if (canvas) {
      canvas.width = 1000;
      canvas.height = 700;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        // Draw initial blank canvas (transparent)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    // Save backup of original image URL
    setOriginalBackupUrl(imageUrl);
  }, []);

  // Sync canvas brush settings
  useEffect(() => {
    const canvas = paintCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = brushColor;
        ctx.lineWidth = brushSize;
        ctx.globalAlpha = brushOpacity / 100;
      }
    }
  }, [brushColor, brushSize, brushOpacity]);

  // Handle local drawing
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (selectedTool !== 'brush' && selectedTool !== 'eraser') return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || (selectedTool !== 'brush' && selectedTool !== 'eraser')) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (selectedTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 1.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
      ctx.lineWidth = brushSize;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearDrawingCanvas = () => {
    const canvas = paintCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Pan Canvas Handlers
  const handlePanStart = (e: React.MouseEvent) => {
    if (e.button !== 0 && selectedTool !== 'select') return; // Only pan on left click with select tool
    setIsPanning(true);
    setPanStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handlePanMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanX(e.clientX - panStart.x);
    setPanY(e.clientY - panStart.y);
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  // Add Dynamic Annotations (Text/Arrow/Shapes)
  const addTextAnnotation = () => {
    if (!textInput.trim()) return;
    const newAnn = {
      id: `ann_${Date.now()}`,
      type: 'text' as const,
      x: 35 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      text: textInput,
      color: brushColor,
      size: brushSize + 10
    };
    setAnnotations([...annotations, newAnn]);
    setTextInput('');
    setSelectedAnnotationId(newAnn.id);
  };

  const addShapeAnnotation = (shapeType: 'arrow' | 'shape') => {
    const newAnn = {
      id: `ann_${Date.now()}`,
      type: shapeType,
      x: 40 + Math.random() * 15,
      y: 45 + Math.random() * 15,
      color: brushColor,
      w: 120,
      h: 80
    };
    setAnnotations([...annotations, newAnn]);
    setSelectedAnnotationId(newAnn.id);
  };

  const removeAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    if (selectedAnnotationId === id) setSelectedAnnotationId(null);
  };

  // Figma Comment Thread Drops
  const handleStageClickForComment = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDropCommentActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newCommentId = `comment_${Date.now()}`;
    const draftComment = {
      id: newCommentId,
      x,
      y,
      text: '',
      author: 'Você',
      date: 'Agora mesmo'
    };

    setComments([...comments, draftComment]);
    setActiveCommentId(newCommentId);
    setIsDropCommentActive(false);
  };

  const saveCommentText = (id: string) => {
    if (!newCommentText.trim()) {
      setComments(comments.filter(c => c.id !== id));
      setActiveCommentId(null);
      return;
    }
    setComments(comments.map(c => c.id === id ? { ...c, text: newCommentText } : c));
    setNewCommentText('');
    setActiveCommentId(null);
  };

  // CSS construction based on Sliders Filters and Perspective transformations
  const getImageFilterStyle = () => {
    if (!layers.find(l => l.id === 'adjustments')?.visible) return {};
    
    const sharpFilter = sharpness > 0 ? `contrast(${100 + sharpness}%) saturate(${100 + sharpness / 5}%)` : '';
    const tempFilter = temperature !== 0 ? `sepia(${Math.abs(temperature)}%) hue-rotate(${temperature > 0 ? 15 : -15}deg)` : '';
    const vignetteFilter = vignette > 0 ? `brightness(${100 - vignette / 2}%)` : '';

    return {
      filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) opacity(${exposure}%) ${sharpFilter} ${tempFilter} ${vignetteFilter}`,
      transform: `rotate(${rotation}deg) scaleX(${scaleX}) scaleY(${scaleY}) translate3d(${panX}px, ${panY}px, 0) skew(${perspectiveX}deg, ${perspectiveY}deg)`,
      transformOrigin: 'center center',
      transition: isPanning ? 'none' : 'transform 0.15s ease-out, filter 0.1s ease-out'
    };
  };

  // Mock server-side/Gemini advanced operations with dynamic high-end diagnostics
  const runAIPipeline = (operation: string) => {
    setAiOperation(operation);
    setAiLoading(true);
    setAiLogs([]);
    
    const messages: Record<string, string[]> = {
      upscale: [
        'Conectando ao modelo de visao Gemini-3.5-flash...',
        'Analisando densidade de pixel e mapeamento vetorial...',
        'Executando super-resolucao recursiva (4x pixels)...',
        'Processando filtragem AI e reconstrucao de texturas...',
        'Refinando micro-detalhes de nitidez organizacional...',
        'Upscaling completo! Resolucao atualizada para 4096 x 2732px (+300% cla)'
      ],
      denoise: [
        'Analisando ruido cromatoforo de alta frequencia em canais RGB...',
        'Calculando filtro bilateral nao-linear ponderado de alta precisao...',
        'Removendo artefactos de compressao digital e granulosidade...',
        'Reconstruindo degrade de gradientes suaves em areas deslumbrantes...',
        'Denoising finalizado com sucesso!'
      ],
      bg_remove: [
        'Instanciando modelo de segmentacao de pixels de primeiro plano...',
        'Mapeando canais de opacidade de bordas delicadas e cabelo (Fuzzy-Alpha)...',
        'Extraindo plano de fundo e aplicando canal de transparencia alfa...',
        'Substituindo fundo original por canal transparente .png quadriculado...',
        'Remocao de fundo concluida!'
      ],
      generative: [
        'Carregando modelo de preenchimento generativo em lote do Gemini...',
        `Injetando prompt instrucional: "${aiPrompt || 'Preencher area externa'}"`,
        'Mapeando textura de bordas limitrofes e direcao de iluminacao...',
        'Sintetizando e expandindo imagem com geracao generativa de alta fidelidade...',
        'Generative Fill incorporado!'
      ],
      restore: [
        'Verificando rachaduras, ruidos analogicos e desbotamento de cor...',
        'Mapeando matriz de cores perdidas baseadas em IA generativo histografico...',
        'Recompondo areas danificadas utilizando corretores locais...',
        'Corrigindo iluminacao retro, nitidez de contrastes e cores de pele...',
        'Restauracao historica completada de forma impressionante!'
      ]
    };

    let logIdx = 0;
    const interval = setInterval(() => {
      const logs = messages[operation];
      if (logIdx < logs.length) {
        setAiLogs(prev => [...prev, logs[logIdx]]);
        logIdx++;
      } else {
        clearInterval(interval);
        setAiLoading(false);
        
        // Apply visual updates based on final AI model output representation
        if (operation === 'bg_remove') {
          // Change to glass/transparent background grid representation
          setImageUrl('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000&auto=format&fit=crop'); 
        } else if (operation === 'upscale') {
          setZoom(150); // Enhance the zoom
          setBrightness(105);
          setContrast(110);
        } else if (operation === 'restore') {
          setBrightness(102);
          setContrast(105);
          setSaturation(115);
          setTemperature(0);
        } else if (operation === 'denoise') {
          setSharpness(10);
          setContrast(102);
        } else if (operation === 'generative') {
          // Switch to another gorgeous landscape generated
          setImageUrl('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000&auto=format&fit=crop');
        }
      }
    }, 1200);
  };

  const handleSave = () => {
    // Compile full document payload
    const compiledOutput = {
      ...doc,
      title: doc.title,
      url: imageUrl, 
      content: JSON.stringify({
        brightness, contrast, saturation, sharpness, exposure, temperature, hue,
        rotation, scaleX, scaleY, annotations, comments
      }),
      size: doc.size || '380 KB',
      folder: doc.folder || 'Design',
      updatedAt: new Date().toISOString()
    };
    onSave(compiledOutput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`bg-white border border-slate-200 text-slate-800 w-full ${isFullscreen ? 'h-screen' : 'h-[95vh] sm:rounded-[28px] max-w-7xl'} shadow-[0_30px_90px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden transition-all relative`}>
        
        {/* Top Professional Header Bar */}
        <header className="h-16 px-6 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 border border-slate-200 flex items-center justify-center">
              <Scan size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-xs">{doc.title}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse"></span>
                Fotolivro & Editor de Imagens Premium (SaaS IA)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Quick Presets Toggle before-after */}
            <button 
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onMouseLeave={() => setIsComparing(false)}
              className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 transition-all flex items-center gap-1.5 cursor-pointer touch-none select-none"
              title="Mantenha pressionado para ver original"
            >
              <Eye size={12} />
              <span className="hidden sm:inline">Comparar</span>
            </button>

            <button 
              onClick={() => {
                clearDrawingCanvas();
                setImageUrl(originalBackupUrl);
                setBrightness(100); setContrast(100); setSaturation(100); setExposure(100); setRotation(0);
                setAnnotations([]); setComments([]);
              }}
              className="px-2.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-950 transition-all select-none"
            >
              Resetar
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-950 select-none"
            >
              <Maximize size={14} />
            </button>

            <button 
              onClick={handleSave}
              className="bg-slate-900 hover:bg-black text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm select-none"
            >
              <CheckCheck size={14} />
              Aplicar & Salvar
            </button>

            <button 
              onClick={onClose}
              className="p-2 bg-slate-100 text-slate-500 hover:text-slate-950 rounded-lg hover:bg-slate-200 transition-colors select-none"
            >
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Workspace Body - Left Tools Shelf, Center Stage Canvas, Right Properties Shelf */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* L1. Left Toolbox Shelf */}
          <aside className="w-16 bg-slate-50 border-r border-slate-200 flex flex-col items-center py-4 justify-between shrink-0 select-none">
            <div className="flex flex-col gap-3">
              {[
                { id: 'adjust', icon: Sliders, label: 'Ajustes' },
                { id: 'transform', icon: Crop, label: 'Corte' },
                { id: 'tools', icon: Brush, label: 'Pincel' },
                { id: 'annotations', icon: Type, label: 'Notas' },
                { id: 'ai', icon: Sparkles, color: 'text-amber-500', label: 'IA' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePanel(item.id as any);
                    if (item.id === 'tools' && selectedTool === 'select') setSelectedTool('brush');
                  }}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    activePanel === item.id 
                      ? 'bg-slate-900 text-white shadow-sm font-bold' 
                      : 'text-slate-500 hover:text-slate-950 hover:bg-slate-100'
                  }`}
                  title={item.label}
                >
                  <item.icon size={16} className={item.color} />
                  <span className="text-[7.5px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 text-center px-1">
              {/* Zoom indicators */}
              <button 
                onClick={() => setZoom(Math.max(25, zoom - 25))} 
                className="p-1.5 rounded-lg border border-slate-205 bg-white text-slate-500 hover:text-slate-950 hover:bg-slate-100 shadow-2xs cursor-pointer"
              >
                <ZoomOut size={13} />
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-800">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(500, zoom + 25))} 
                className="p-1.5 rounded-lg border border-slate-205 bg-white text-slate-500 hover:text-slate-950 hover:bg-slate-100 shadow-2xs cursor-pointer"
              >
                <ZoomIn size={13} />
              </button>
            </div>
          </aside>

          {/* L2. Interactive Light Stage Area */}
          <div className="flex-1 bg-slate-100 relative overflow-hidden flex items-center justify-center select-none"
               onMouseDown={handlePanStart}
               onMouseMove={handlePanMove}
               onMouseUp={handlePanEnd}
               onMouseLeave={handlePanEnd}
          >
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
            
            {/* Split Screen Indicator */}
            {isComparing && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-rose-600 text-white font-extrabold px-3 py-1 rounded-full text-[9px] tracking-widest uppercase shadow-md animate-pulse">
                Modo Comparação: Exibindo Backup Original
              </div>
            )}

            {/* Figma-style Floating Comments Toggle */}
            <button 
              onClick={() => setIsDropCommentActive(!isDropCommentActive)}
              className={`absolute top-4 left-4 z-30 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                isDropCommentActive 
                  ? 'bg-amber-400 border border-amber-500 text-slate-950 ring-2 ring-amber-400/20' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-950'
              }`}
            >
              <MessageSquare size={14} className={isDropCommentActive ? 'animate-bounce' : ''} />
              <span>{isDropCommentActive ? 'Clique na imagem para comentar' : 'Adicionar Comentário'}</span>
            </button>

            {/* Interactive Canvas Stage */}
            <div 
              onClick={handleStageClickForComment}
              className="relative transition-all duration-75 flex items-center justify-center"
              style={{
                width: '640px',
                height: '420px',
                transform: `scale(${zoom / 100})`,
                cursor: isDropCommentActive ? 'crosshair' : (selectedTool === 'brush' || selectedTool === 'eraser' ? 'none' : 'grab'),
              }}
            >
              {/* Image Frame with Applied Filters */}
              <img
                src={isComparing ? originalBackupUrl : imageUrl}
                alt="Active Target"
                className="w-full h-full object-cover shadow-[0_15px_40px_rgba(0,0,0,0.12)] bg-neutral-900 border border-slate-200 rounded-lg select-none"
                style={isComparing ? {} : getImageFilterStyle()}
                draggable={false}
              />

              {/* Paint free drawing overlay layer */}
              {layers.find(l => l.id === 'paint')?.visible && (
                <canvas
                  ref={paintCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-auto z-10"
                  style={{
                    opacity: layers.find(l => l.id === 'paint')?.locked ? 0.3 : 1
                  }}
                />
              )}

              {/* Dynamic Custom Annotations overlay layer */}
              {layers.find(l => l.id === 'annotations')?.visible && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {annotations.map(ann => (
                    <div
                      key={ann.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAnnotationId(ann.id);
                      }}
                      className={`absolute p-2 rounded-lg pointer-events-auto cursor-pointer border select-text ${
                        selectedAnnotationId === ann.id 
                          ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-md' 
                          : 'border-transparent text-slate-800'
                      }`}
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        fontSize: `${ann.size || 14}px`,
                        color: ann.color || '#000000',
                        transition: 'box-shadow 0.15s'
                      }}
                    >
                      {ann.type === 'text' && (
                        <div className="flex items-center gap-2">
                          <span className="font-bold whitespace-nowrap">{ann.text}</span>
                          {selectedAnnotationId === ann.id && (
                            <button 
                              onClick={() => removeAnnotation(ann.id)}
                              className="text-rose-600 hover:text-rose-800 bg-white/80 p-0.5 rounded-md border border-rose-100"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      )}
                      {ann.type === 'shape' && (
                        <div className="w-16 h-12 border-2 border-dashed rounded flex items-center justify-center text-[10px]" style={{ borderColor: ann.color }}>
                          <span className="text-slate-700 bg-white/90 px-1 rounded font-bold">Box</span>
                          {selectedAnnotationId === ann.id && (
                            <button 
                              onClick={() => removeAnnotation(ann.id)}
                              className="absolute -top-3 -right-3 text-rose-600 hover:text-rose-800 bg-white border border-rose-100 p-0.5 rounded-full shadow-sm"
                            >
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      )}
                      {ann.type === 'arrow' && (
                        <div className="relative text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-white/90 p-1 rounded shadow-xs">
                          <ArrowRight size={14} className="text-slate-800 rotate-45" />
                          <span className="text-slate-800">Destaque</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Figma comment bubble pins */}
              <div className="absolute inset-0 pointer-events-none z-20">
                {comments.map(c => (
                  <div
                     key={c.id}
                     onClick={(e) => {
                       e.stopPropagation();
                       setActiveCommentId(c.id);
                     }}
                     className="absolute pointer-events-auto cursor-pointer flex items-center justify-center"
                     style={{ left: `${c.x}%`, top: `${c.y}%` }}
                  >
                    <div className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center text-[11px] shadow-md border border-slate-950 animate-bounce">
                      <MessageSquare size={11} className="stroke-[3]" />
                    </div>
                    
                    {activeCommentId === c.id && (
                      <div className="absolute top-8 left-0 min-w-[200px] bg-white border border-slate-200 p-3 rounded-xl shadow-2xl text-left z-50 text-xs text-slate-800">
                        <div className="font-bold flex items-center justify-between gap-2">
                          <span className="text-slate-800">{c.author}</span>
                          <span className="text-[10px] text-slate-450">{c.date}</span>
                        </div>
                        {c.text ? (
                          <p className="mt-1.5 text-slate-705 leading-normal font-semibold">{c.text}</p>
                        ) : (
                          <div className="mt-2 flex flex-col gap-1.5">
                            <input
                              type="text"
                              value={newCommentText}
                              onChange={(e) => setNewCommentText(e.target.value)}
                              placeholder="Digite seu comentário..."
                              className="bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-slate-800 font-medium outline-none text-xs focus:border-slate-350"
                            />
                            <div className="flex justify-end gap-1.5">
                              <button 
                                onClick={() => setComments(comments.filter(item => item.id !== c.id))}
                                className="px-2 py-1 text-[9px] font-bold text-slate-500 uppercase rounded hover:bg-slate-100 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button 
                                onClick={() => saveCommentText(c.id)}
                                className="px-2 py-1 bg-slate-900 hover:bg-black text-white text-[10px] uppercase font-bold rounded cursor-pointer shadow-xs"
                              >
                                Comentar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hover Cursor for brush painting */}
              {(selectedTool === 'brush' || selectedTool === 'eraser') && (
                <div 
                  className="absolute pointer-events-none rounded-full border-2 border-white/80 mix-blend-difference z-40 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    width: `${brushSize}px`,
                    height: `${brushSize}px`,
                    backgroundColor: selectedTool === 'brush' ? brushColor : 'rgba(255, 255, 255, 0.2)'
                  }}
                />
              )}
            </div>
            
            {/* Diagnostic watermark information bottom sidebar */}
            <div className="absolute bottom-4 left-4 bg-white/80 border border-slate-200 shadow-sm px-3 py-1.5 rounded-lg text-[9px] font-mono text-slate-500 select-none">
              MIME: image/png &middot; DIMS: 1920x1080px &middot; COLOR: RGB &middot; COLOR PROFILE: sRGB v4
            </div>
          </div>

          {/* L3. Right Control Panel Shelf (Features and Configurations) */}
          <aside className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-y-auto shrink-0 select-none scrollbar-thin">
            
            {/* Header tab detail */}
            <div className="p-4 border-b border-slate-150 bg-slate-50/55 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-650">Painel de Configuração</span>
              <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold uppercase rounded-md">Ativo</span>
            </div>

            {/* TAB PANEL CONTENT INTERFACE */}
            <div className="p-5 flex-1 flex flex-col gap-6">

              {/* PANEL 1: ADJUSTS */}
              {activePanel === 'adjust' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Sliders size={13} className="text-slate-650" /> Ajustes de Imagem
                  </h4>

                  {[
                    { label: 'Brilho', value: brightness, set: setBrightness, min: 0, max: 200, unit: '%' },
                    { label: 'Contraste', value: contrast, set: setContrast, min: 0, max: 200, unit: '%' },
                    { label: 'Saturação', value: saturation, set: setSaturation, min: 0, max: 200, unit: '%' },
                    { label: 'Nitidez (AI Sharp)', value: sharpness, set: setSharpness, min: 0, max: 100, unit: '%' },
                    { label: 'Exposição (Geral)', value: exposure, set: setExposure, min: 0, max: 100, unit: '%' },
                    { label: 'Matiz (Hue Shift)', value: hue, set: setHue, min: 0, max: 360, unit: '°' },
                    { label: 'Temperatura Cor', value: temperature, set: setTemperature, min: -100, max: 100, unit: 'K' },
                    { label: 'Filtro Vinheta', value: vignette, set: setVignette, min: 0, max: 100, unit: '%' },
                  ].map(slide => (
                    <div key={slide.label} className="flex flex-col gap-1.5 select-none touch-none">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-650 font-semibold">{slide.label}</span>
                        <span className="font-mono text-slate-900 font-bold">{slide.value}{slide.unit}</span>
                      </div>
                      <input
                        type="range"
                        min={slide.min}
                        max={slide.max}
                        value={slide.value}
                        onChange={(e) => slide.set(Number(e.target.value))}
                        className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer outline-none select-none"
                      />
                    </div>
                  ))}

                  {/* Curves interactive representation */}
                  <div className="mt-4 border border-slate-200 bg-slate-50/50 rounded-xl p-3 flex flex-col gap-2 select-none">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-700 font-bold">Curvas de Tons (Histórico)</span>
                      <span className="text-[10px] text-slate-400 font-bold">S-Curve Preset</span>
                    </div>
                    {/* SVG curves drawing representation */}
                    <div className="w-full h-32 bg-white border border-slate-200 rounded-lg relative flex items-center justify-center">
                      <svg className="w-full h-full p-2 overflow-visible">
                        {/* Grid lines */}
                        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeWidth="1" />
                        <line x1="0" y1="75%" x2="100%" y2="75%" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2,2" />
                        
                        <line x1="25%" y1="0" x2="25%" y2="100%" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2,2" />
                        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#e2e8f0" strokeWidth="1" />
                        <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="2,2" />

                        {/* Curve Line vector drawing */}
                        <path
                          d={`M 15 110 Q 55 90 95 65 T 185 15`}
                          fill="none"
                          stroke="#0f172a"
                          strokeWidth="2"
                        />
                        {/* Interactive dots representation */}
                        <circle cx="15" cy="110" r="4" fill="#0f172a" />
                        <circle cx="95" cy="65" r="5" fill="#f59e0b" className="animate-pulse" />
                        <circle cx="185" cy="15" r="4" fill="#0f172a" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 2: TRANSFORMATIONS */}
              {activePanel === 'transform' && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Crop size={13} className="text-slate-650" /> Transformações Vetoriais
                  </h4>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Aspect Ratio Preset</span>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'free', label: 'Livre' },
                        { id: '1:1', label: '1:1 Quadrado' },
                        { id: '16:9', label: '16:9 Cinema' },
                        { id: '4:3', label: '4:3 Retrato' },
                      ].map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setAspectRatio(preset.id)}
                          className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                            aspectRatio === preset.id 
                              ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-2xs' 
                              : 'border-slate-200 hover:bg-slate-50 text-slate-500'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rotações & Espelhos</span>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => setRotation(prev => (prev + 90) % 360)}
                        className="py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCw size={14} className="text-slate-600" />
                        <span>+90°</span>
                      </button>
                      <button 
                        onClick={() => setScaleX(prev => prev * -1)}
                        className="py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Move size={14} className="rotate-90 text-slate-600" />
                        <span>Inverter H</span>
                      </button>
                      <button 
                        onClick={() => setScaleY(prev => prev * -1)}
                        className="py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 flex flex-col items-center gap-1.5 cursor-pointer"
                      >
                        <Move size={14} className="text-slate-600" />
                        <span>Inverter V</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3.5 mt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Correção de Perspectiva</span>
                    <div className="flex flex-col gap-1.5 select-none touch-none">
                      <div className="flex justify-between items-center text-xs text-slate-600 pointer-events-none">
                        <span>Perspectiva X</span>
                        <span className="font-mono text-slate-900 font-bold">{perspectiveX}°</span>
                      </div>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={perspectiveX}
                        onChange={(e) => setPerspectiveX(Number(e.target.value))}
                        className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer outline-none select-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 select-none touch-none">
                      <div className="flex justify-between items-center text-xs text-slate-600 pointer-events-none">
                        <span>Perspectiva Y</span>
                        <span className="font-mono text-slate-900 font-bold">{perspectiveY}°</span>
                      </div>
                      <input
                        type="range"
                        min="-45"
                        max="45"
                        value={perspectiveY}
                        onChange={(e) => setPerspectiveY(Number(e.target.value))}
                        className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer outline-none select-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 3: PAINT TOOLS & LAYERS */}
              {activePanel === 'tools' && (
                <div className="flex flex-col gap-5 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Palette size={13} className="text-slate-650" /> Pincéis & Ferramentas
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedTool('brush')}
                      className={`py-3 px-3 border rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        selectedTool === 'brush' ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-2xs' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Brush size={14} /> Pincel Pintor
                    </button>
                    <button
                      onClick={() => setSelectedTool('eraser')}
                      className={`py-3 px-3 border rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                        selectedTool === 'eraser' ? 'border-slate-800 bg-slate-50 text-slate-900 shadow-2xs' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                      }`}
                    >
                      <Eraser size={14} /> Borracha Soft
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-slate-505 uppercase tracking-wide">Cor do Traço</span>
                    <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200 rounded-xl">
                      <input
                        type="color"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-mono uppercase text-slate-800 font-bold max-w-[80px]"
                      />
                      <div className="flex gap-1">
                        {['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#000000'].map(c => (
                          <button
                            key={c}
                            onClick={() => setBrushColor(c)}
                            className="w-3.5 h-3.5 rounded-full border border-slate-350 hover:scale-105 transition-transform cursor-pointer"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 select-none touch-none">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-650 font-bold uppercase tracking-wide">Espessura</span>
                      <span className="font-mono text-slate-900 font-bold">{brushSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer outline-none select-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 select-none touch-none">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-655 font-bold uppercase tracking-wide">Opacidade de Pintura</span>
                      <span className="font-mono text-slate-900 font-bold">{brushOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={brushOpacity}
                      onChange={(e) => setBrushOpacity(Number(e.target.value))}
                      className="w-full accent-slate-900 h-1 bg-slate-100 rounded-lg cursor-pointer outline-none select-none"
                    />
                  </div>

                  <button
                    onClick={clearDrawingCanvas}
                    className="w-full border border-rose-250 hover:bg-rose-50 text-rose-600 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Apagar Tudo
                  </button>
                </div>
              )}

              {/* PANEL 4: ANNOTATIONS & FIGMA LAYERS */}
              {activePanel === 'annotations' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Type size={13} className="text-slate-650" /> Anotações & Camadas
                  </h4>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Texto para Injetar</label>
                    <input
                      type="text"
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Ex: Revisar layout..."
                      className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-850 font-semibold outline-none focus:border-slate-400"
                    />
                    <button
                      onClick={addTextAnnotation}
                      disabled={!textInput.trim()}
                      className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-800 font-bold py-2.5 px-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-1 disabled:opacity-40"
                    >
                      Inserir Texto na Tela
                    </button>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Vetor de Marcação</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addShapeAnnotation('arrow')}
                        className="py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-705 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ArrowRight size={13} />
                        Seta Atacado
                      </button>
                      <button
                        onClick={() => addShapeAnnotation('shape')}
                        className="py-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-705 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Scan size={13} />
                        Box Rápido
                      </button>
                    </div>
                  </div>

                  {/* Layers representation */}
                  <div className="mt-4 border border-slate-200 bg-slate-50 rounded-2xl p-4 flex flex-col gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Painel de Camadas (Layers)</span>
                    <div className="flex flex-col gap-2">
                      {layers.map(layer => (
                        <div key={layer.id} className="flex items-center justify-between text-xs bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                          <div className="flex items-center gap-2">
                            <Layers size={11} className="text-slate-650" />
                            <span className="font-bold text-slate-800">{layer.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => setLayers(layers.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l))}
                              className="text-slate-400 hover:text-slate-800 cursor-pointer"
                            >
                              {layer.visible ? <Eye size={12} /> : <EyeOff size={11} />}
                            </button>
                            <button
                              onClick={() => {
                                if (layer.id === 'background') return;
                                setLayers(layers.map(l => l.id === layer.id ? { ...l, locked: !l.locked } : l));
                              }}
                              className="text-slate-400 hover:text-slate-800 cursor-pointer"
                              disabled={layer.id === 'background'}
                            >
                              {layer.locked ? <Lock size={11} className="text-amber-500" /> : <Unlock size={11} />}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* PANEL 5: ADVANCED COMPREHENSIVE AI TOOLS FOR IMAGES */}
              {activePanel === 'ai' && (
                <div className="flex flex-col gap-4 animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={13} className="text-amber-505" /> IA Generativa & Filtros
                  </h4>

                  {aiOperation ? (
                    /* AI Diagnostics Terminal Screen */
                    <div className="bg-slate-55 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 min-h-[220px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-700 animate-pulse">🤖 IA ATIVA: {aiOperation.toUpperCase()}</span>
                        {aiLoading ? (
                          <Loader2 size={12} className="animate-spin text-slate-700" />
                        ) : (
                          <CheckCheck size={12} className="text-emerald-650 animate-bounce" />
                        )}
                      </div>
                      
                      <div className="flex-1 font-mono text-[9px] text-slate-650 flex flex-col gap-1.5 overflow-y-auto leading-relaxed text-left select-none">
                        {aiLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-1">
                            <span className="text-slate-400 shrink-0">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex items-center gap-1 text-slate-500 animate-pulse">
                            <span>&gt;</span>
                            <span className="bg-slate-800 w-1.5 h-3"></span>
                          </div>
                        )}
                      </div>

                      {!aiLoading && (
                        <button
                          onClick={() => setAiOperation(null)}
                          className="w-full bg-slate-900 hover:bg-black text-white text-[10px] font-bold py-2 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Voltar ao Menu IA
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Standard AI menu */
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Generative Space</span>
                        <input
                          type="text"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Mudar plano de fundo para deserto..."
                          className="bg-white text-xs p-2.5 rounded-lg border border-slate-200 text-slate-800 outline-none font-medium focus:border-slate-350"
                        />
                        <button
                          onClick={() => runAIPipeline('generative')}
                          className="w-full bg-slate-900 hover:bg-black font-bold py-2.5 px-3 text-white text-xs rounded-xl uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Wand2 size={13} /> Preenchimento Generativo
                        </button>
                      </div>

                      {[
                        { id: 'bg_remove', title: 'Remover Fundo (1-Clique)', desc: 'Detecta primeiro plano e transforma fundo em transparente' },
                        { id: 'upscale', title: 'Upscale Neuro-Res 4x', desc: 'Sintetiza pixels extras corrigindo desfoque natural' },
                        { id: 'denoise', title: 'Super Denoising IA', desc: 'Suprime granulosidade ISO e ruidos de codificacao digital' },
                        { id: 'restore', title: 'Restauração Histórica', desc: 'Repara riscos de fotos antigas e repigmenta iluminacao' },
                      ].map(aiOp => (
                        <button
                          key={aiOp.id}
                          onClick={() => runAIPipeline(aiOp.id)}
                          className="w-full p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-left transition-all flex flex-col gap-1 items-start cursor-pointer shadow-2xs"
                        >
                          <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                            <Sparkles size={11} className="text-amber-500 animate-spin animate-duration-3000" />
                            {aiOp.title}
                          </span>
                          <span className="text-[9.5px] text-slate-500 font-medium leading-normal">{aiOp.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer comments list count detail */}
            {comments.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50/50 text-xs">
                <span className="font-bold text-slate-500 uppercase tracking-widest">Anotações do Time ({comments.length})</span>
                <div className="flex flex-col gap-2 mt-2">
                  {comments.map(c => (
                    <div key={c.id} className="bg-white hover:bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-start gap-2 max-w-full text-left shadow-2xs">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0 mt-1.5" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-slate-800">{c.author}</span>
                          <span className="text-slate-400 font-medium">{c.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 mt-1 truncate max-w-full font-medium leading-normal">{c.text || 'Rascunho de Comentário'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>
      </div>
    </div>
  );
}
