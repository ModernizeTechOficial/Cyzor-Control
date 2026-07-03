import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface KanbanBoardWrapperProps {
  children: React.ReactNode;
  className?: string;
  snapColumns?: boolean;
}

export default function KanbanBoardWrapper({
  children,
  className = "",
  snapColumns = true
}: KanbanBoardWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Drag-to-pan state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [hasMoved, setHasMoved] = useState(false);

  // Scroll position state for indicators and buttons
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  // Check scroll positions to toggle navigation buttons and indicators
  const checkScrollLimits = () => {
    const el = containerRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    
    // We show left indicator if we are not at the very left edge (tolerance of 5px)
    setShowLeftIndicator(scrollLeft > 5);
    
    // We show right indicator if we have more content on the right (tolerance of 5px)
    setShowRightIndicator(scrollWidth - scrollLeft - clientWidth > 5);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollLimits();

    const handleDragStartEvent = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    const handleDragEndEvent = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    // Attach scroll listener
    el.addEventListener('scroll', checkScrollLimits);
    el.addEventListener('dragstart', handleDragStartEvent);
    el.addEventListener('dragend', handleDragEndEvent);
    
    // Check limits on window resize
    window.addEventListener('resize', checkScrollLimits);

    return () => {
      el.removeEventListener('scroll', checkScrollLimits);
      el.removeEventListener('dragstart', handleDragStartEvent);
      el.removeEventListener('dragend', handleDragEndEvent);
      window.removeEventListener('resize', checkScrollLimits);
    };
  }, [children]);

  // Handle Drag-to-pan mouse down
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse button click
    if (e.button !== 0) return;

    // Do not initiate drag-to-pan if user is clicking an interactive or draggable element
    const target = e.target as HTMLElement;
    const isInteractive = 
      target.closest('button') || 
      target.closest('input') || 
      target.closest('select') || 
      target.closest('a') || 
      target.closest('textarea') ||
      target.closest('[draggable]') ||
      target.closest('[draggable="true"]');

    if (isInteractive) return;

    const el = containerRef.current;
    if (!el) return;

    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
    setHasMoved(false);
    
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
  };

  // Handle Drag-to-pan mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const el = containerRef.current;
    if (!el) return;

    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5; // multiplier for drag speed/feeling
    
    if (Math.abs(walk) > 3) {
      setHasMoved(true);
    }
    
    el.scrollLeft = scrollLeftState - walk;
  };

  // Handle Drag-to-pan mouse up / leave
  const handleMouseUpOrLeave = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.body.style.userSelect = '';

    // Apply column snap on drag release
    if (snapColumns) {
      handleColumnSnap();
    }
  };

  // Snap to columns alignment
  const handleColumnSnap = () => {
    const el = containerRef.current;
    if (!el) return;

    // Find the closest column and align to it
    const columns = el.children[0]?.children;
    if (!columns || columns.length === 0) return;

    const currentScroll = el.scrollLeft;
    let closestScroll = currentScroll;
    let minDistance = Infinity;

    for (let i = 0; i < columns.length; i++) {
      const col = columns[i] as HTMLElement;
      const colOffset = col.offsetLeft;
      const distance = Math.abs(colOffset - currentScroll);

      if (distance < minDistance) {
        minDistance = distance;
        closestScroll = colOffset;
      }
    }

    // Smooth scroll to the closest column
    el.scrollTo({
      left: closestScroll,
      behavior: 'smooth'
    });
  };

  // Smart wheel scroll translation
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;

    // 1. Natively support trackpads with deltaX
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      return; // Let touchpad handle it natively
    }

    // 2. Scroll horizontally if user holds Shift
    // OR if the mouse is hovering on non-scrollable inner content (like board background)
    const isShiftPressed = e.shiftKey;
    
    // We also scroll horizontally automatically if vertical scrolling occurs on the wrapper,
    // unless the user is hovering inside an element that can actually scroll vertically.
    const target = e.target as HTMLElement;
    const isVerticallyScrollableNode = target.closest('.overflow-y-auto') || target.closest('textarea');

    if (isShiftPressed || !isVerticallyScrollableNode) {
      e.preventDefault();
      el.scrollBy({
        left: e.deltaY * 1.2, // normal speed multiplier
        behavior: 'auto' // Instant feedback for mouse wheel, smooth is too laggy for direct scroll wheel
      });
    }
  };

  // Programmatic smooth navigation buttons click
  const navigateByColumn = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    // Fetch width of a standard column (defaulting to 320px if not found)
    let scrollAmount = 320;
    const firstCol = el.children[0]?.children[0] as HTMLElement;
    if (firstCol) {
      scrollAmount = firstCol.clientWidth + 16; // Add gap
    }

    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative w-full group/kanban-wrapper">
      
      {/* Scroll Indicators - Subtle glow or indicators on sides */}
      {showLeftIndicator && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 via-white/30 to-transparent pointer-events-none z-10 transition-opacity duration-300 flex items-center justify-start pl-2">
          <div className="bg-neutral-900/5 backdrop-blur-sm px-1.5 py-1 rounded-md text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
            <ArrowLeft size={10} />
          </div>
        </div>
      )}

      {showRightIndicator && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 via-white/30 to-transparent pointer-events-none z-10 transition-opacity duration-300 flex items-center justify-end pr-2">
          <div className="bg-neutral-900/5 backdrop-blur-sm px-1.5 py-1 rounded-md text-[9px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
            <span>Mais</span>
            <ArrowRight size={10} />
          </div>
        </div>
      )}

      {/* Programmatic Navigation Buttons - Floating on hover */}
      {showLeftIndicator && (
        <button
          type="button"
          onClick={() => navigateByColumn('left')}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200/60 flex items-center justify-center text-neutral-600 hover:text-black hover:scale-105 active:scale-95 transition-all z-20 opacity-0 group-hover/kanban-wrapper:opacity-100 cursor-pointer"
          title="Ver coluna anterior"
        >
          <ChevronLeft size={18} strokeWidth={2.5} />
        </button>
      )}

      {showRightIndicator && (
        <button
          type="button"
          onClick={() => navigateByColumn('right')}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md border border-neutral-200/60 flex items-center justify-center text-neutral-600 hover:text-black hover:scale-105 active:scale-95 transition-all z-20 opacity-0 group-hover/kanban-wrapper:opacity-100 cursor-pointer"
          title="Ver próxima coluna"
        >
          <ChevronRight size={18} strokeWidth={2.5} />
        </button>
      )}

      {/* Main Drag & Scroll Container */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onWheel={handleWheel}
        className={`w-full overflow-x-auto overflow-y-hidden pb-4 touch-pan-x transition-all duration-150 scrollbar-thin scrollbar-thumb-neutral-200/60 hover:scrollbar-thumb-neutral-300 scrollbar-track-transparent ${
          isDragging ? 'cursor-grabbing active-drag' : 'cursor-grab'
        } ${className}`}
        style={{
          scrollSnapType: snapColumns && !isDragging ? 'x proximity' : 'none',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="flex gap-4 items-start min-w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
