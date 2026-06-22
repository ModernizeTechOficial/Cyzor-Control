import { useState, useEffect, useRef } from 'react';
import { 
  X, Save, FileText, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Maximize, 
  HelpCircle, Settings, ChevronRight, Download, PenTool, CheckCircle, 
  Trash2, Search, List, MessageSquare, Compass, Sliders, CheckSquare, Sparkles 
} from 'lucide-react';

interface PdfComment {
  id: string;
  page: number;
  x: number;
  y: number;
  text: string;
  author: string;
  date: string;
}

interface PdfViewerProps {
  doc: {
    id?: number;
    title: string;
    content?: string; // outline, signatures, comments state serialize data
    url?: string;
    size?: string;
    folder?: string;
  };
  onSave: (updatedDoc: any) => void;
  onClose: () => void;
}

export default function PdfViewerProfessional({ doc, onSave, onClose }: PdfViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 4;
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTabSide, setActiveTabSide] = useState<'index' | 'comments' | 'signature'>('index');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultsCount, setSearchResultsCount] = useState(0);

  // Digital Handwritten Electronic Signature Pad Canvas
  const [isSigning, setIsSigning] = useState(false);
  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);
  const [placedSignatures, setPlacedSignatures] = useState<Array<{
    id: string;
    page: number;
    x: number;
    y: number;
    img: string;
    w: number;
    h: number;
  }>>([]);
  const [draggingSigId, setDraggingSigId] = useState<string | null>(null);

  // Document Outline / Table of Contents
  const outlineItems = [
    { page: 1, title: '1. Introdução & Contextualização', desc: 'Resumo executivo do projeto Cyzor' },
    { page: 2, title: '2. Arquitetura de Nuvem Dedicada', desc: 'Modelos de containers Cloud Run e banco de dados SQL' },
    { page: 3, title: '3. Plano de Contas & Orçamentário', desc: 'Tabela de custos de infraestrutura e serviços SaaS' },
    { page: 4, title: '4. Cláusulas de Compliance e LGPD', desc: 'Segurança contra vazamento e permissões do projeto' }
  ];

  // PDF Internal Comments list
  const [comments, setComments] = useState<PdfComment[]>([
    { id: 'pdf_c1', page: 1, x: 20, y: 15, text: 'O nome formal do Briefing foi aprovado pela diretoria.', author: 'Marina Costa', date: 'Há 2h' },
    { id: 'pdf_c2', page: 3, x: 55, y: 30, text: 'Ajustar taxas do imposto de importação nesta tabela.', author: 'Marcos Rezende', date: 'Há 15 min' }
  ]);
  const [newCommentInput, setNewCommentInput] = useState('');
  const [activePlacementPoint, setActivePlacementPoint] = useState<{ x: number, y: number } | null>(null);

  // Initial Seed
  useEffect(() => {
    if (doc.content && doc.content.startsWith('{')) {
      try {
        const parsed = JSON.parse(doc.content);
        if (parsed.placedSignatures) setPlacedSignatures(parsed.placedSignatures);
        if (parsed.comments) setComments(parsed.comments);
      } catch (e) {
        console.error('Failed to parse PDF custom settings', e);
      }
    }
  }, [doc]);

  // Handle signature drawing loop
  const startSigDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = '#1e3a8a'; // custom dark blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    setIsSigning(true);
  };

  const sigDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSigning) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopSigDrawing = () => {
    setIsSigning(false);
  };

  const clearSigPad = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureImage(null);
  };

  const saveSigPad = () => {
    const canvas = sigCanvasRef.current;
    if (canvas) {
      const imgData = canvas.toDataURL('image/png');
      setSignatureImage(imgData);
    }
  };

  const dropSignatureOnPage = () => {
    if (!signatureImage) return;
    const newPlaced = {
      id: `sig_placed_${Date.now()}`,
      page: currentPage,
      x: 35 + Math.random() * 20,
      y: 65 + Math.random() * 20,
      img: signatureImage,
      w: 130,
      h: 55
    };
    setPlacedSignatures([...placedSignatures, newPlaced]);
  };

  // Drag placed signature on PDF page
  const handleSigDragOver = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingSigId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Boundary limits (0-90)
    const bX = Math.max(0, Math.min(85, x));
    const bY = Math.max(0, Math.min(85, y));

    setPlacedSignatures(placedSignatures.map(sig => 
      sig.id === draggingSigId ? { ...sig, x: parseFloat(bX.toFixed(1)), y: parseFloat(bY.toFixed(1)) } : sig
    ));
  };

  const handlePageClickForComment = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activePlacementPoint) {
      // already placed
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setActivePlacementPoint({ x, y });
  };

  const submitCommentOnPage = () => {
    if (!newCommentInput.trim() || !activePlacementPoint) return;
    const newComm: PdfComment = {
      id: `comm_${Date.now()}`,
      page: currentPage,
      x: activePlacementPoint.x,
      y: activePlacementPoint.y,
      text: newCommentInput,
      author: 'Você (Assinante)',
      date: 'Agora mesmo'
    };
    setComments([...comments, newComm]);
    setNewCommentInput('');
    setActivePlacementPoint(null);
  };

  // PDF Page content simulator with high-end typography and vectors
  const renderPdfPageContent = (pageNum: number) => {
    switch (pageNum) {
      case 1:
        return (
          <div className="flex flex-col gap-5 p-12 text-left leading-relaxed relative bg-white min-h-[750px] text-slate-800">
            {/* Elegant Header with serial number */}
            <header className="flex justify-between items-center border-b border-neutral-200 pb-3 font-mono text-[9px] text-neutral-400">
              <span>PROJETO CYZOR &middot; DOCUMENTO TÉCNICO</span>
              <span>REF: CZ-88402-A</span>
            </header>
            
            <div className="mt-8 flex flex-col gap-2">
              <span className="w-12 h-1.5 bg-indigo-600 rounded"></span>
              <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
                Planejamento Tecnológico do Ecossistema Integrado
              </h1>
              <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Publicado em Junho de 2026 por Marina Costa</p>
            </div>

            <div className="mt-6 flex flex-col gap-4 text-xs font-medium text-slate-700">
              <p>
                Este documento define as diretrizes regulatórias e o planejamento arquitetural da nova plataforma SaaS de Inteligência Organizacional. O crescimento exponencial das soluções de Big Data gerou a necessidade crítica por um concentrador que organize, analise de forma automatizada via IA e persista histórico com rastreabilidade total de versões.
              </p>
              <div className="p-4 bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl select-all">
                <p className="font-bold text-neutral-800 mb-1">Impacto Relevante:</p>
                <p className="text-neutral-600">A estruturação automatizada de documentações possibilita uma eficiência operacional 34% maior comparada a fluxos descentralizados redundantes.</p>
              </div>
              <p>
                O ecossistema disponibilizará interfaces modulares sob demanda para planilhas integradas, painel de apresentações elegantes de marketing, estúdio de imagens com segmentação por modelos de visão computacional generativa (Gemini Flash-Pro) e compiladores offline de TypeScript para scripts locais de extensões corporativas.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col gap-5 p-12 text-left leading-relaxed relative bg-white min-h-[750px] text-slate-800">
            <header className="flex justify-between items-center border-b border-neutral-200 pb-3 font-mono text-[9px] text-neutral-400">
              <span>PROJETO CYZOR &middot; ARQUITETURA DE DADOS</span>
              <span>REF: CZ-88402-A</span>
            </header>
            
            <h2 className="text-xl font-bold text-neutral-900 mt-4">2. Arquitetura de Nuvem Dedicada</h2>
            <p className="text-xs text-slate-700">
              A arquitetura foi dimensionada para suportar redundância geográfica múltipla em containers dedicados de alto tráfego com autoscaling automático.
            </p>

            {/* Simulated Vector Architecture map */}
            <div className="my-6 border border-slate-200 rounded-2xl p-6 bg-slate-50/50 flex flex-col gap-3 font-mono text-[10px]">
              <div className="flex justify-between items-center bg-white p-2.5 border rounded-xl shadow-xs">
                <span className="font-bold text-indigo-600">Nginx Ingress Reverse Proxy</span>
                <span className="text-rose-500 font-bold">Porta: 3000 (Ingress)</span>
              </div>
              <div className="flex justify-center my-1 text-slate-400">↓ Redirecionamento Estrito ↓</div>
              <div className="flex justify-between items-center bg-white p-2.5 border rounded-xl shadow-xs">
                <span className="font-bold text-slate-700">Express Backend (tsx Server Entry)</span>
                <span className="text-emerald-500 font-bold">Portas de Cluster: Auto</span>
              </div>
              <div className="flex justify-center my-1 text-slate-400">↓ Drizzle Queries / Sockets ↓</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-2 rounded-xl text-center font-bold">
                  PostgreSQL DB Instance<br />(Cloud SQL Cloud Dedicated)
                </div>
                <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 p-2 rounded-xl text-center font-bold">
                  Firebase Firestore Engine<br />(NoSQL Cache Realtime)
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              A persistência híbrida une o melhor de dois mundos: rapidez extrema com NoSQL para triggers de edição instantânea, e integridade relacional robusta em PostgreSQL para dados auditáveis de relatórios contratuais de faturamento.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="flex flex-col gap-5 p-12 text-left leading-relaxed bg-white min-h-[750px] text-slate-800">
            <header className="flex justify-between items-center border-[#E2E8F0] border-b pb-3 font-mono text-[9px] text-[#94A3B8]">
              <span>PROJETO CYZOR &middot; PROPOSTA DE VALORES</span>
              <span>REF: CZ-88402-A</span>
            </header>

            <h2 className="text-xl font-bold text-[#1E293B] mt-4">3. Plano de Contas & Orçamentário</h2>
            <p className="text-xs text-[#475569]">
              Os valores estimados de implementação e provisionamento de infraestrutura computacional resiliente são discriminados na tabela abaixo para auditoria.
            </p>

            <table className="w-full text-xs text-left mt-4 border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] font-bold text-zinc-650 bg-neutral-50">
                  <th className="py-2 px-3">Serviço/Recurso</th>
                  <th className="py-2 px-3 text-right">Custo Estimado</th>
                  <th className="py-2 px-3 text-center">Fatura Período</th>
                </tr>
              </thead>
              <tbody className="divide-y text-zinc-700">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Cluster Cloud Run Autopipeline Dedicated</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">$550.00</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">Mensal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Cloud SQL PostgreSQL (2 Cores, 8GB RAM)</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">$290.00</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">Mensal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Firebase Firestore Realtime Transac. Alpha</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">$180.00</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">Mensal</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">Infraestrutura CDN & Google Maps Edge Platform</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">$120.00</td>
                  <td className="py-2.5 px-3 text-center font-bold text-[#64748B]">Mensal</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col gap-5 p-12 text-left leading-relaxed bg-white min-h-[750px] text-slate-800">
            <header className="flex justify-between items-center border-[#E2E8F0] border-b pb-3 font-mono text-[9px] text-[#94A3B8]">
              <span>PROJETO CYZOR &middot; COMPLIANCE & LGPD</span>
              <span>REF: CZ-88402-A</span>
            </header>

            <h2 className="text-xl font-bold text-[#1E293B] mt-4">4. Cláusulas de Compliance e LGPD</h2>
            <p className="text-xs text-[#475569]">
              Garantia contratual absoluta de anonimização e criptografia AES-256 em repouso de todas as notas fiscais, comentários e metadados arquivados pelo cliente.
            </p>

            <div className="my-8 border-2 border-dashed border-[#DEE2E6] rounded-2xl p-6 text-center flex flex-col justify-center items-center gap-2 bg-[#FAFAFA]/70">
              <span className="text-indigo-600 font-extrabold text-xs uppercase tracking-widest">Espaço de Assinaturas e Autenticação</span>
              <p className="text-[10px] text-neutral-400 font-medium">Insira sua rubrica ou assinatura eletrônica digitalizada utilizando o Pad e arraste-o para selar formalmente o teor técnico deste planejamento anual.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleSavePdfConfig = () => {
    const compiledOutput = {
      ...doc,
      content: JSON.stringify({ placedSignatures, comments }),
      size: doc.size || '142 KB',
      folder: doc.folder || 'Contratos',
      updatedAt: new Date().toISOString()
    };
    onSave(compiledOutput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/80 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      
      <div className={`bg-[#F1F3F5] text-slate-900 border border-slate-350 w-full ${isFullscreen ? 'h-screen' : 'h-[95vh] sm:rounded-[28px] max-w-7xl'} shadow-2xl flex flex-col overflow-hidden relative`}>
        
        {/* Top bar header */}
        <header className="h-16 px-6 border-b border-[#DEE2E6] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate max-w-xs">{doc.title}</h3>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                Leitor & Assinador PDF Avançado (LGPD Regulatório)
              </p>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-[#FAFAFA] border border-[#DEE2E6] px-2.5 py-1 rounded-xl">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1 text-slate-500 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-30"
              >
                <ArrowLeft size={13} />
              </button>
              <span className="text-xs font-bold px-1.5">{currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1 text-slate-500 hover:text-black hover:bg-neutral-100 rounded disabled:opacity-30"
              >
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-neutral-500">
              <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-1.5 hover:bg-neutral-100 rounded"><ZoomOut size={13} /></button>
              <span className="text-xs font-bold font-mono text-[#495057]">{zoom}%</span>
              <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1.5 hover:bg-neutral-100 rounded"><ZoomIn size={13} /></button>
            </div>

            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 border border-slate-200 rounded-lg"><Maximize size={13} /></button>

            <button 
              onClick={handleSavePdfConfig}
              className="bg-[#111111] hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Save size={14} />
              Rubricar & Salvar
            </button>

            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-900">
              <X size={15} />
            </button>
          </div>
        </header>

        {/* Central visual frame container split with right outline toolbar */}
        <div className="flex-grow flex overflow-hidden">
          
          {/* L1. Left outline and signer tabs bar */}
          <aside className="w-64 border-r border-[#DEE2E6] bg-white flex flex-col pt-3 text-left">
            <div className="px-4 pb-2 border-b flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Navegador Interno</span>
              <span className="text-indigo-600">CZ-AI</span>
            </div>

            {/* Panel selector tabs */}
            <div className="flex border-b">
              {[
                { id: 'index', label: 'Outline', icon: List },
                { id: 'signature', label: 'Assinar', icon: PenTool },
                { id: 'comments', label: 'Notas', icon: MessageSquare }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTabSide(t.id as any)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider flex flex-col items-center gap-1 transition ${
                    activeTabSide === t.id ? 'border-b-2 border-indigo-600 text-indigo-600 bg-[#FAFAFA]' : 'text-neutral-500 hover:bg-slate-50'
                  }`}
                >
                  <t.icon size={12} />
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* TAB PANEL VIEWS */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              
              {/* INDEX VIEW */}
              {activeTabSide === 'index' && (
                <div className="flex flex-col gap-2.5 animate-in fade-in duration-100">
                  {outlineItems.map(item => (
                    <div
                      key={item.page}
                      onClick={() => setCurrentPage(item.page)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                        currentPage === item.page ? 'border-indigo-500 bg-indigo-50/40' : 'border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      <span className="text-[9px] font-mono font-bold text-indigo-600 uppercase">PÁG {item.page}</span>
                      <h4 className="text-xs font-bold text-neutral-800 mt-1">{item.title}</h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-medium leading-normal">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* SIGNATURE HANDWRITTEN VIEW */}
              {activeTabSide === 'signature' && (
                <div className="flex flex-col gap-3.5 animate-in fade-in duration-100">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-neutral-700">Caneta de Assinatura</span>
                    <span className="text-[10px] text-neutral-400 font-medium">Desenhe sua rubrica profissional no espaço abaixo para registrar no PDF.</span>
                  </div>

                  {/* Draw Sig Pad container */}
                  <div className="border border-slate-300 rounded-xl overflow-hidden bg-[#FAFAFA]">
                    <canvas
                      ref={sigCanvasRef}
                      onMouseDown={startSigDrawing}
                      onMouseMove={sigDrawing}
                      onMouseUp={stopSigDrawing}
                      onMouseLeave={stopSigDrawing}
                      className="w-full h-28 bg-[#FFFFFF] cursor-crosshair border-b"
                    />
                    <div className="flex justify-between items-center p-2 bg-neutral-100">
                      <button onClick={clearSigPad} className="text-[9px] font-bold text-neutral-500 hover:text-black uppercase">Limpar</button>
                      <button onClick={saveSigPad} className="bg-indigo-600 text-white rounded px-3 py-1 text-[9px] font-bold uppercase transition">Salvar</button>
                    </div>
                  </div>

                  {signatureImage && (
                    <div className="p-3 border rounded-xl bg-[#FAFAFA] flex flex-col gap-2 border-dashed border-indigo-400">
                      <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                        <CheckCircle size={10} /> ASSINATURA REGISTRADA
                      </span>
                      <img src={signatureImage} alt="Assinatura" className="h-12 object-contain bg-white border rounded border-slate-200 self-center" />
                      <button
                        onClick={dropSignatureOnPage}
                        className="w-full mt-1.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition"
                      >
                        Carimbar na Página
                      </button>
                    </div>
                  )}

                  {placedSignatures.length > 0 && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Controle de Rubricas ({placedSignatures.length})</p>
                      {placedSignatures.map(placed => (
                        <div key={placed.id} className="flex justify-between items-center p-2 bg-neutral-50 border border-slate-200 rounded-lg text-[10px]">
                          <span className="font-semibold text-slate-800">Rubrica {placed.page === currentPage && ' (Página Ativa)'} - Pág {placed.page}</span>
                          <button onClick={() => setPlacedSignatures(placedSignatures.filter(s => s.id !== placed.id))}>
                            <Trash2 size={11} className="text-zinc-400 hover:text-rose-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMMENTS MARKS VIEW */}
              {activeTabSide === 'comments' && (
                <div className="flex flex-col gap-3 animate-in fade-in duration-100">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-bold text-neutral-700">Revisão por Equipes</span>
                    <span className="text-[10px] text-neutral-400 font-medium">Clique em qualquer local do documento para carimbar anotações de auditoria técnica.</span>
                  </div>

                  {activePlacementPoint && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl flex flex-col gap-2 mt-2">
                      <span className="text-[9px] font-bold text-amber-700 uppercase">Ancorar em X: {activePlacementPoint.x.toFixed(0)}%, Y: {activePlacementPoint.y.toFixed(0)}%</span>
                      <input
                        type="text"
                        value={newCommentInput}
                        onChange={(e) => setNewCommentInput(e.target.value)}
                        placeholder="Revisar isto..."
                        className="w-full bg-white border border-slate-350 p-1.5 rounded text-xs outline-none font-semibold text-neutral-800"
                        autoFocus
                      />
                      <div className="flex justify-end gap-1.5 mt-1">
                        <button onClick={() => setActivePlacementPoint(null)} className="text-[9px] font-bold text-slate-400 uppercase mr-2">Cancelar</button>
                        <button onClick={submitCommentOnPage} className="bg-amber-600 text-white rounded px-2.5 py-1 text-[9px] font-bold uppercase">Ok</button>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-3">
                    {comments.map(c => (
                      <div key={c.id} className="p-2.5 bg-[#FAFAFA] border rounded-xl text-left">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-indigo-600">{c.author}</span>
                          <span className="text-neutral-400">{c.date}</span>
                        </div>
                        <p className="text-[11px] text-neutral-700 mt-1 font-semibold leading-normal">{c.text}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[8.5px] font-bold text-slate-400">
                          <span>PÁG {c.page}</span>
                          &middot;
                          <button onClick={() => setComments(comments.filter(item => item.id !== c.id))} className="text-rose-450 hover:text-rose-600">Deletar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </aside>

          {/* L2. Central Dynamic responsive viewport displaying the current active simulated design page layout */}
          <main className="flex-1 p-8 flex items-center justify-center overflow-auto"
                onMouseMove={handleSigDragOver}
                onMouseUp={() => setDraggingSigId(null)}
          >
            
            {/* Standard responsive bounds container for a real paper page layout */}
            <div 
              onClick={handlePageClickForComment}
              className="relative shadow-2xl transition-all outline-none"
              style={{
                width: '560px',
                transform: `scale(${zoom / 100})`,
                cursor: activePlacementPoint ? 'cell' : 'default',
              }}
            >
              
              {/* Actual structured formatted paper page sheet content */}
              {renderPdfPageContent(currentPage)}

              {/* Render placed signatures vectors overlay */}
              {placedSignatures
                .filter(sig => sig.page === currentPage)
                .map(sig => (
                  <div
                    key={sig.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingSigId(sig.id);
                    }}
                    className={`absolute p-1 cursor-grab select-none z-20 ${draggingSigId === sig.id ? 'ring-2 ring-indigo-500 cursor-grabbing bg-indigo-50/20' : 'hover:ring-1 hover:ring-indigo-400'}`}
                    style={{
                      left: `${sig.x}%`,
                      top: `${sig.y}%`,
                      width: `${sig.w}px`,
                      height: `${sig.h}px`,
                    }}
                  >
                    <img src={sig.img} alt="Signature Placement" className="w-full h-full object-contain pointer-events-none" />
                  </div>
                ))}

              {/* Render active page comment target markers pins */}
              {comments
                .filter(comm => comm.page === currentPage)
                .map(comm => (
                  <div
                    key={comm.id}
                    className="absolute z-20"
                    style={{ left: `${comm.x}%`, top: `${comm.y}%` }}
                    title={`Comentário de ${comm.author}: "${comm.text}"`}
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-900 border border-slate-950 font-bold flex items-center justify-center shadow-lg animate-pulse text-[10px]">
                      <MessageSquare size={9} className="stroke-[2.5]" />
                    </div>
                  </div>
                ))}

            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
