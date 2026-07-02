import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Calendar, Clock, User, CheckCircle2, ChevronRight, ChevronLeft, 
  Sparkles, Filter, Search, List, LayoutGrid, Maximize2, Minimize2, 
  Sliders, Plus, AlertTriangle, ArrowRight, CornerDownRight, 
  CheckSquare, MessageSquare, Tag, ZoomIn, ZoomOut, Info, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TimelineItem {
  id: number;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: string;    // Raw status
  statusLabel: string; // User-facing status string
  priority: 'Alta' | 'Média' | 'Baixa' | string;
  assignee: string;
  progress: number;  // 0 - 100
  dependencies?: number[]; // IDs of items this depends on
  colorClass?: string; // Custom color override
  rawItem: any;      // Keeps reference to original task/product/idea
}

interface TimelineViewProps {
  items: TimelineItem[];
  onUpdateItemDates: (itemId: number, newStartDate: string, newEndDate: string) => Promise<void> | void;
  onItemClick: (item: any) => void;
  onDeleteItem?: (itemId: number) => void;
  title?: string;
  emptyMessage?: string;
}

export default function TimelineView({
  items,
  onUpdateItemDates,
  onItemClick,
  onDeleteItem,
  title = 'Cronograma e Gantt',
  emptyMessage = 'Nenhuma atividade cadastrada para exibição na linha do tempo.'
}: TimelineViewProps) {
  // Zoom mode: 'day' | 'week' | 'month' | 'year'
  const [zoomMode, setZoomMode] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Refs for custom dragging and mouse tracking
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Tracks active drag or resize operations
  const [activeGesture, setActiveGesture] = useState<{
    itemId: number;
    type: 'move' | 'resize-start' | 'resize-end';
    initialStartX: number;
    initialStartDate: Date;
    initialEndDate: Date;
  } | null>(null);

  // Drag and resize previews in real time
  const [previewDates, setPreviewDates] = useState<{
    [itemId: number]: { startDate: Date; endDate: Date };
  }>({});

  // Helper: parse date safely
  const parseDate = (dateStr: string, fallbackOffsetDays = 0): Date => {
    if (!dateStr) {
      const d = new Date();
      d.setDate(d.getDate() + fallbackOffsetDays);
      return d;
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      // Avoid time zone shifts
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  // Helper: format Date to YYYY-MM-DD
  const formatDateISO = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 1. Compute timeline boundaries
  const { timelineStart, timelineEnd, totalDays } = useMemo(() => {
    if (items.length === 0) {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 50);
      return { 
        timelineStart: start, 
        timelineEnd: end, 
        totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) 
      };
    }

    let minMs = Infinity;
    let maxMs = -Infinity;

    items.forEach(item => {
      const s = parseDate(item.startDate, 0).getTime();
      const e = parseDate(item.endDate, 4).getTime();
      if (s < minMs) minMs = s;
      if (e > maxMs) maxMs = e;
    });

    const start = new Date(minMs);
    // Pad start by 7 days
    start.setDate(start.getDate() - 7);

    const end = new Date(maxMs);
    // Pad end by 30 days for scroll buffer
    end.setDate(end.getDate() + 30);

    // Prevent negative ranges
    if (end.getTime() <= start.getTime()) {
      end.setDate(start.getDate() + 60);
    }

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return { timelineStart: start, timelineEnd: end, totalDays };
  }, [items]);

  // Col width definitions
  const colWidth = {
    day: 70,
    week: 140,
    month: 200,
    year: 400
  }[zoomMode];

  // Map Date to pixel X coordinate relative to Gantt chart start
  const getXForDate = (date: Date): number => {
    const elapsedMs = date.getTime() - timelineStart.getTime();
    const elapsedDays = elapsedMs / (1000 * 3600 * 24);
    // Scale days to total timeline pixels
    const totalPixels = totalDays * 24; // baseline multiplier for horizontal space
    const scaleFactor = {
      day: colWidth, // 1 day = 70px
      week: colWidth / 7, // 7 days = 140px -> 1 day = 20px
      month: colWidth / 30, // 30 days = 200px -> 1 day = 6.6px
      year: colWidth / 365 // 365 days = 400px -> 1 day = 1.1px
    }[zoomMode];

    return Math.round(elapsedDays * scaleFactor);
  };

  // Map pixel X coordinate back to Date
  const getDateForX = (x: number): Date => {
    const scaleFactor = {
      day: colWidth,
      week: colWidth / 7,
      month: colWidth / 30,
      year: colWidth / 365
    }[zoomMode];

    const elapsedDays = x / scaleFactor;
    const elapsedMs = elapsedDays * (1000 * 3600 * 24);
    return new Date(timelineStart.getTime() + elapsedMs);
  };

  // Columns data structure for rendering the grid
  const gridColumns = useMemo(() => {
    const cols = [];
    const curr = new Date(timelineStart);

    while (curr < timelineEnd) {
      if (zoomMode === 'day') {
        cols.push({
          label: curr.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }),
          sublabel: curr.toLocaleDateString('pt-BR', { weekday: 'short' }),
          date: new Date(curr)
        });
        curr.setDate(curr.getDate() + 1);
      } else if (zoomMode === 'week') {
        cols.push({
          label: `Semana ${Math.ceil(curr.getDate() / 7)}`,
          sublabel: curr.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          date: new Date(curr)
        });
        curr.setDate(curr.getDate() + 7);
      } else if (zoomMode === 'month') {
        cols.push({
          label: curr.toLocaleDateString('pt-BR', { month: 'long' }),
          sublabel: curr.toLocaleDateString('pt-BR', { year: 'numeric' }),
          date: new Date(curr)
        });
        curr.setMonth(curr.getMonth() + 1);
      } else {
        cols.push({
          label: curr.toLocaleDateString('pt-BR', { year: 'numeric' }),
          sublabel: `Semestre ${curr.getMonth() < 6 ? 'I' : 'II'}`,
          date: new Date(curr)
        });
        curr.setMonth(curr.getMonth() + 6);
      }
    }
    return cols;
  }, [timelineStart, timelineEnd, zoomMode]);

  // Total horizontal pixels
  const totalGridWidth = gridColumns.length * colWidth;

  // Handle pointer down on a bar to move or resize it
  const handlePointerDown = (
    e: React.PointerEvent,
    item: TimelineItem,
    type: 'move' | 'resize-start' | 'resize-end'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    const sDate = previewDates[item.id]?.startDate || parseDate(item.startDate, 0);
    const eDate = previewDates[item.id]?.endDate || parseDate(item.endDate, 4);

    setActiveGesture({
      itemId: item.id,
      type,
      initialStartX: e.clientX,
      initialStartDate: sDate,
      initialEndDate: eDate
    });
  };

  // Handle pointer move to calculate drag/resize previews
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeGesture) return;
    e.preventDefault();

    const { itemId, type, initialStartX, initialStartDate, initialEndDate } = activeGesture;
    const dx = e.clientX - initialStartX;

    // Convert pixel change into day delta
    const scaleFactor = {
      day: colWidth,
      week: colWidth / 7,
      month: colWidth / 30,
      year: colWidth / 365
    }[zoomMode];

    const dayDelta = Math.round(dx / scaleFactor);

    const newStart = new Date(initialStartDate);
    const newEnd = new Date(initialEndDate);

    if (type === 'move') {
      newStart.setDate(initialStartDate.getDate() + dayDelta);
      newEnd.setDate(initialEndDate.getDate() + dayDelta);
    } else if (type === 'resize-start') {
      newStart.setDate(initialStartDate.getDate() + dayDelta);
      // Ensure start doesn't exceed end
      if (newStart >= newEnd) {
        newStart.setDate(newEnd.getDate() - 1);
      }
    } else if (type === 'resize-end') {
      newEnd.setDate(initialEndDate.getDate() + dayDelta);
      // Ensure end is after start
      if (newEnd <= newStart) {
        newEnd.setDate(newStart.getDate() + 1);
      }
    }

    setPreviewDates(prev => ({
      ...prev,
      [itemId]: { startDate: newStart, endDate: newEnd }
    }));
  };

  // Handle pointer up to finalize dates and persist changes
  const handlePointerUp = async (e: React.PointerEvent) => {
    if (!activeGesture) return;
    e.preventDefault();
    
    const { itemId } = activeGesture;
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);

    const finalPreview = previewDates[itemId];
    setActiveGesture(null);

    if (finalPreview) {
      const sStr = formatDateISO(finalPreview.startDate);
      const eStr = formatDateISO(finalPreview.endDate);
      
      // Perform parent / API save trigger
      await onUpdateItemDates(itemId, sStr, eStr);
    }
  };

  // Filtered list of items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter ? item.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchTerm, statusFilter]);

  // Map priorities to colors
  const getPriorityColor = (p: string) => {
    const norm = p?.toLowerCase();
    if (norm === 'alta' || norm === 'high') return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (norm === 'média' || norm === 'medium') return 'bg-amber-50 text-amber-700 border border-amber-200';
    return 'bg-slate-50 text-slate-700 border border-slate-200';
  };

  // Map status to visual accents
  const getStatusBadge = (statusLabel: string) => {
    const label = statusLabel?.toLowerCase() || '';
    if (label.includes('concl') || label.includes('done') || label.includes('pago') || label.includes('public')) {
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    }
    if (label.includes('desenv') || label.includes('andamento') || label.includes('progress') || label.includes('analis')) {
      return 'bg-blue-50 text-blue-700 border border-blue-200';
    }
    if (label.includes('revis') || label.includes('beta')) {
      return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
    }
    return 'bg-slate-50 text-slate-600 border border-slate-200';
  };

  // Base status colors for timeline bars
  const getBarColor = (statusLabel: string) => {
    const label = statusLabel?.toLowerCase() || '';
    if (label.includes('concl') || label.includes('done') || label.includes('pago') || label.includes('public')) {
      return 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white';
    }
    if (label.includes('desenv') || label.includes('andamento') || label.includes('progress') || label.includes('analis')) {
      return 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white';
    }
    if (label.includes('revis') || label.includes('beta')) {
      return 'from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white';
    }
    return 'from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white';
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-[24px] border border-[#0F172A0F] overflow-hidden shadow-sm">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between p-6 border-b border-[#0F172A0F] bg-white">
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="p-2.5 bg-neutral-900 text-white rounded-xl shadow-sm">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#111111] leading-none">{title}</h3>
            <p className="text-[10px] text-[#64748B] font-bold mt-1">
              Visualização Gantt • Sincronização em tempo real
            </p>
          </div>
        </div>

        {/* Filters and Zoom selector */}
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
          {/* Quick search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input 
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-[#0F172A0F] rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-neutral-300 w-36 font-semibold"
            />
          </div>

          {/* Scale Zooms */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-[#0F172A0F]">
            {(['day', 'week', 'month', 'year'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setZoomMode(mode)}
                className={`text-[10px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  zoomMode === mode 
                    ? 'bg-white shadow-sm text-neutral-900' 
                    : 'text-slate-500 hover:text-neutral-900'
                }`}
              >
                {mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : mode === 'month' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Main Timeline Canvas Split Screen (Left List Panel | Right Gantt Timeline Grid) */}
      <div className="flex flex-1 overflow-hidden min-h-[400px]">
        
        {/* LEFT LIST PANEL (Sticky Names and Assignments) */}
        <div className="w-80 border-r border-[#0F172A0F] bg-[#FCFCFD]/50 flex flex-col flex-shrink-0">
          <div className="h-14 border-b border-[#0F172A0F] flex items-center px-5 bg-white flex-shrink-0">
            <span className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-wider">Atividades & Atribuições</span>
          </div>
          
          <div className="flex-1 overflow-y-auto divide-y divide-[#0F172A05]">
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => onItemClick(item.rawItem)}
                className="h-[68px] px-5 flex flex-col justify-center gap-1.5 hover:bg-slate-50 cursor-pointer transition-colors group text-left"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-[#111111] truncate max-w-[190px] group-hover:text-black">
                    {item.name}
                  </span>
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <User size={10} className="text-slate-400" />
                    <span className="truncate max-w-[100px]">{item.assignee || 'Não atribuído'}</span>
                  </span>

                  <span className={`px-1.5 py-0.5 rounded-full border text-[8px] ${getStatusBadge(item.statusLabel)}`}>
                    {item.statusLabel}
                  </span>
                </div>
              </div>
            ))}

            {filteredItems.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                Nenhum item filtrado.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SCROLLABLE GANTT GRID */}
        <div 
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-grow overflow-x-auto overflow-y-auto select-none relative custom-scrollbar bg-slate-50/20"
        >
          {/* Entire timeline block with precise width */}
          <div className="relative" style={{ width: `${totalGridWidth}px` }}>
            
            {/* GRID SCALE HEADER */}
            <div className="h-14 border-b border-[#0F172A0F] bg-white flex sticky top-0 z-20">
              {gridColumns.map((col, idx) => (
                <div 
                  key={idx} 
                  style={{ width: `${colWidth}px` }} 
                  className="h-full border-r border-[#0F172A05] flex flex-col justify-center items-center px-2 shrink-0 bg-white"
                >
                  <span className="text-[10px] font-bold text-neutral-900 leading-tight">{col.label}</span>
                  <span className="text-[9px] font-bold text-slate-400 capitalize mt-0.5">{col.sublabel}</span>
                </div>
              ))}
            </div>

            {/* VERTICAL GRID LINES (Drawn behind rows) */}
            <div className="absolute top-14 bottom-0 left-0 right-0 pointer-events-none flex z-0">
              {gridColumns.map((_, idx) => (
                <div 
                  key={idx} 
                  style={{ width: `${colWidth}px` }} 
                  className="h-full border-r border-[#0F172A05]/30 shrink-0"
                />
              ))}
            </div>

            {/* Gantt Overlay SVG to Draw Bézier Dependency Arrows */}
            <svg 
              className="absolute top-14 left-0 w-full pointer-events-none z-10"
              style={{ height: `${filteredItems.length * 68}px` }}
            >
              <defs>
                <marker 
                  id="arrow" 
                  viewBox="0 0 10 10" 
                  refX="6" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#A78BFA" />
                </marker>
              </defs>

              {filteredItems.map((item, itemIdx) => {
                if (!item.dependencies || item.dependencies.length === 0) return null;

                return item.dependencies.map((depId, depIdx) => {
                  const predIdx = filteredItems.findIndex(i => i.id === depId);
                  if (predIdx === -1) return null;

                  // Predecessor Dates
                  const pred = filteredItems[predIdx];
                  const pStart = previewDates[pred.id]?.startDate || parseDate(pred.startDate, 0);
                  const pEnd = previewDates[pred.id]?.endDate || parseDate(pred.endDate, 4);

                  // Successor Dates
                  const sStart = previewDates[item.id]?.startDate || parseDate(item.startDate, 0);

                  // Calculations
                  const xPredecessorEnd = getXForDate(pEnd);
                  const xSuccessorStart = getXForDate(sStart);

                  const yPredecessor = predIdx * 68 + 34; // center of predecessor row
                  const ySuccessor = itemIdx * 68 + 34;     // center of successor row

                  // Smooth S-Curve Bézier Line
                  const dx = xSuccessorStart - xPredecessorEnd;
                  const controlX1 = xPredecessorEnd + Math.max(dx * 0.4, 15);
                  const controlX2 = xSuccessorStart - Math.max(dx * 0.4, 15);

                  return (
                    <path
                      key={`${item.id}-${depId}-${depIdx}`}
                      d={`M ${xPredecessorEnd} ${yPredecessor} C ${controlX1} ${yPredecessor}, ${controlX2} ${ySuccessor}, ${xSuccessorStart} ${ySuccessor}`}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth={1.75}
                      strokeDasharray={dx < 0 ? "4 4" : undefined}
                      markerEnd="url(#arrow)"
                      opacity={0.65}
                    />
                  );
                });
              })}
            </svg>

            {/* GANTT ROWS */}
            <div className="relative z-10 divide-y divide-[#0F172A05]">
              {filteredItems.map((item, idx) => {
                // Real-time dates (preview state during drag, fallback to DB values)
                const sDate = previewDates[item.id]?.startDate || parseDate(item.startDate, 0);
                const eDate = previewDates[item.id]?.endDate || parseDate(item.endDate, 4);

                // Coordinates
                const xStart = getXForDate(sDate);
                const xEnd = getXForDate(eDate);
                const barWidth = Math.max(xEnd - xStart, 45); // min size

                // Is currently dragging or resizing this item?
                const isInteracting = activeGesture?.itemId === item.id;

                return (
                  <div 
                    key={item.id} 
                    className="h-[68px] relative flex items-center bg-transparent"
                  >
                    {/* Interactive timeline bar */}
                    <div
                      style={{ 
                        left: `${xStart}px`, 
                        width: `${barWidth}px` 
                      }}
                      className="absolute h-9 rounded-xl flex items-center justify-between select-none relative shadow-[0_1px_4px_rgba(0,0,0,0.06)] group transition-all"
                    >
                      {/* Left Resize Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, item, 'resize-start')}
                        className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize rounded-l-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <div className="w-0.5 h-3 bg-white/60 rounded" />
                      </div>

                      {/* Bar Main Drag Area */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, item, 'move')}
                        onClick={() => onItemClick(item.rawItem)}
                        className={`w-full h-full bg-gradient-to-r ${getBarColor(item.statusLabel)} rounded-xl px-3.5 flex items-center justify-between cursor-grab active:cursor-grabbing overflow-hidden`}
                      >
                        {/* Progress Bar Indicator Underlay */}
                        <div 
                          className="absolute bottom-0 left-0 h-[3px] bg-black/20 rounded-b-xl transition-all"
                          style={{ width: `${item.progress}%` }}
                        />

                        {/* Title & Progress Inside Pill */}
                        <span className="text-[10px] font-bold truncate pr-2 leading-none">
                          {item.name}
                        </span>

                        <span className="text-[9px] font-black bg-white/25 px-1.5 py-0.5 rounded leading-none shrink-0">
                          {item.progress}%
                        </span>
                      </div>

                      {/* Right Resize Handle */}
                      <div
                        onPointerDown={(e) => handlePointerDown(e, item, 'resize-end')}
                        className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-white/40 cursor-ew-resize rounded-r-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20"
                      >
                        <div className="w-0.5 h-3 bg-white/60 rounded" />
                      </div>

                      {/* Floating precise date hover details */}
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-[8px] font-extrabold py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30 pointer-events-none">
                        {sDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} — {eDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="h-60 flex flex-col justify-center items-center text-slate-400 font-semibold text-xs gap-2">
                  <Info size={20} />
                  <span>{emptyMessage}</span>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
