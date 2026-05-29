import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { Sun, Moon, Sunrise, Sunset, X, Move, Plus } from 'lucide-react';
import ZenCanvasNoteCard from '@/features/workspace/components/ZenCanvasNoteCard';
import ZenCanvasExpandedNote from './ZenCanvasExpandedNote';

export interface ZenCanvasItem {
  id: string;
  title: string;
  content?: string;
  color?: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  data?: any; // For custom rendering
}

export interface ZenCanvasConnection {
  id: string;
  source: string;
  target: string;
}

interface ZenCanvasProps {
  items: ZenCanvasItem[];
  connections?: ZenCanvasConnection[];
  onItemMove?: (id: string, x: number, y: number) => void;
  onItemClick?: (id: string) => void;
  onItemDoubleClick?: (id: string) => void;
  onNewConnection?: (source: string, target: string) => void;
  onCanvasDoubleClick?: (x: number, y: number) => void;
  onNewNoteClick?: () => void;
  onItemUpdate?: (item: ZenCanvasItem) => void;
  onDropFile?: (file: File, x: number, y: number) => void;
  renderItemContent?: (item: ZenCanvasItem, isAbstracted: boolean) => ReactNode;
  renderExpandedItem?: (item: ZenCanvasItem, onClose: () => void) => ReactNode;
  activeItemId?: string | null;
  onCloseActiveItem?: () => void;
  className?: string;
  themeMode?: 'light' | 'dark';
  isChronoEnabled?: boolean;
}

const getChronoState = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return { id: 'dawn', icon: Sunrise, label: 'Dawn' };
  if (hour >= 9 && hour < 17) return { id: 'noon', icon: Sun, label: 'Noon' };
  if (hour >= 17 && hour < 21) return { id: 'dusk', icon: Sunset, label: 'Dusk' };
  return { id: 'midnight', icon: Moon, label: 'Midnight' };
};

const THEME_STYLES: Record<string, string> = {
  dawn: 'bg-gradient-to-br from-[#fdfbfb] via-[#ffe2ed] to-[#e8f3f8] text-slate-800',
  noon: 'bg-gray-50 text-slate-900', // Pure light background
  dusk: 'bg-gradient-to-br from-[#e0c3fc] via-[#8ec5fc] to-[#e0c3fc] text-slate-900',
  midnight: 'bg-slate-50 text-slate-900', // Force light theme
  default: 'bg-gray-50 text-slate-900'
};

export default function ZenCanvas({
  items,
  connections = [],
  onItemMove,
  onItemClick,
  onItemDoubleClick,
  onNewConnection,
  onCanvasDoubleClick,
  onNewNoteClick,
  onItemUpdate,
  renderItemContent,
  renderExpandedItem,
  activeItemId,
  onCloseActiveItem,
  className = '',
  themeMode = 'light',
  isChronoEnabled = false
}: ZenCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const [chronoState, setChronoState] = useState({ id: 'noon', icon: Sun, label: 'Noon' });
  const [activeNote, setActiveNote] = useState<ZenCanvasItem | null>(null);

  // Use refs for drag state — avoids re-renders on every mouse move
  const interactionRef = useRef({ mode: 'idle', targetId: null as string | null, offsetX: 0, offsetY: 0, origW: 0, origH: 0 });
  const [interaction, setInteraction] = useState({ mode: 'idle', targetId: null as string | null, offsetX: 0, offsetY: 0, origW: 0, origH: 0 });
  const dragStart = useRef({ x: 0, y: 0 });
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });
  const mouseCanvasPosRef = useRef({ x: 0, y: 0 });

  // Sync external active item
  useEffect(() => {
    if (activeItemId) {
      setActiveNote(items.find(i => i.id === activeItemId) || null);
    } else {
      setActiveNote(null);
    }
  }, [activeItemId, items]);

  useEffect(() => {
    const timer = setInterval(() => setChronoState(getChronoState()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    if (activeNote) return; 
    // e.preventDefault(); // React Wheel Event preventDefault warning can occur, handled by CSS mostly
    
    const zoomSensitivity = 0.001;
    const delta = -e.deltaY * zoomSensitivity;
    let newScale = transform.scale * (1 + delta);
    newScale = Math.max(0.15, Math.min(newScale, 3));

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newX = mouseX - (mouseX - transform.x) * (newScale / transform.scale);
      const newY = mouseY - (mouseY - transform.y) * (newScale / transform.scale);

      const newTransform = { x: newX, y: newY, scale: newScale };
      transformRef.current = newTransform;
      setTransform(newTransform);
    }
  };

  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const t = transformRef.current;
    return {
      x: (clientX - rect.left - t.x) / t.scale,
      y: (clientY - rect.top - t.y) / t.scale
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (activeNote) return;

    const target = e.target as HTMLElement;
    const linkHandle = target.closest('.link-handle') as HTMLElement;
    if (linkHandle) {
      const sourceId = linkHandle.dataset.noteId;
      if (sourceId) {
        const newState = { mode: 'draw-link', targetId: sourceId, offsetX: 0, offsetY: 0, origW: 0, origH: 0 };
        interactionRef.current = newState;
        setInteraction(newState);
        setMouseCanvasPos(getCanvasCoords(e.clientX, e.clientY));
      }
      return;
    }

    const resizeHandle = target.closest('.resize-handle') as HTMLElement;
    if (resizeHandle) {
      const noteId = resizeHandle.dataset.noteId;
      const targetNote = items.find(n => n.id === noteId);
      if (noteId && targetNote) {
        const newState = {
          mode: 'resize-note',
          targetId: noteId,
          offsetX: e.clientX,
          offsetY: e.clientY,
          origW: targetNote.width,
          origH: targetNote.height || 400
        };
        interactionRef.current = newState;
        setInteraction(newState);
        e.stopPropagation();
        return;
      }
    }

    const noteCard = target.closest('.note-card') as HTMLElement;
    if (noteCard) {
      // Ignore if clicking on an interactive element inside the card (e.g., hover menu buttons)
      if (target.closest('button, a, input, textarea, select')) {
        return;
      }
      
      const noteId = noteCard.dataset.noteId;
      const targetNote = items.find(n => n.id === noteId);
      if (noteId && targetNote) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        // Capture pointer so we get events even if cursor leaves the card
        noteCard.setPointerCapture(e.pointerId);
        const newState = {
          mode: 'drag-note',
          targetId: noteId,
          offsetX: coords.x - targetNote.x,
          offsetY: coords.y - targetNote.y,
          origW: 0, origH: 0
        };
        interactionRef.current = newState;
        setInteraction(newState);
        dragStart.current = { x: e.clientX, y: e.clientY };
        return;
      }
    }

    const newState = { mode: 'pan', targetId: null, offsetX: 0, offsetY: 0, origW: 0, origH: 0 };
    interactionRef.current = newState;
    setInteraction(newState);
    dragStart.current = { x: e.clientX - transformRef.current.x, y: e.clientY - transformRef.current.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const intr = interactionRef.current;
    if (intr.mode === 'pan') {
      const newX = e.clientX - dragStart.current.x;
      const newY = e.clientY - dragStart.current.y;
      transformRef.current = { ...transformRef.current, x: newX, y: newY };
      setTransform(prev => ({ ...prev, x: newX, y: newY }));
    } else if (intr.mode === 'drag-note' && intr.targetId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      const newX = coords.x - intr.offsetX;
      const newY = coords.y - intr.offsetY;
      // Move the DOM element directly for zero-lag 1:1 drag
      const el = containerRef.current?.querySelector(`[data-note-id="${intr.targetId}"].note-card`) as HTMLElement;
      if (el) {
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        el.style.transition = 'none';
      }
    } else if (intr.mode === 'draw-link') {
      const pos = getCanvasCoords(e.clientX, e.clientY);
      mouseCanvasPosRef.current = pos;
      setMouseCanvasPos(pos);
    } else if (intr.mode === 'resize-note' && intr.targetId) {
      const t = transformRef.current;
      const dx = (e.clientX - intr.offsetX) / t.scale;
      const dy = (e.clientY - intr.offsetY) / t.scale;
      const newWidth = Math.max(200, intr.origW + dx);
      const newHeight = Math.max(200, intr.origH + dy);
      if (onItemUpdate) {
        const item = items.find(i => i.id === intr.targetId);
        if (item) onItemUpdate({ ...item, width: newWidth, height: newHeight });
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    const intr = interactionRef.current;
    if (intr.mode === 'drag-note' && intr.targetId) {
      const dist = Math.hypot(e.clientX - dragStart.current.x, e.clientY - dragStart.current.y);
      if (dist < 5) {
        // It was a click, not a drag
        const clickedNote = items.find(n => n.id === intr.targetId);
        if (clickedNote) {
          if (onItemClick) onItemClick(clickedNote.id);
          else setActiveNote(clickedNote);
        }
      } else {
        // Commit final position to parent state
        const el = containerRef.current?.querySelector(`[data-note-id="${intr.targetId}"].note-card`) as HTMLElement;
        if (el && onItemMove) {
          const left = parseFloat(el.style.left);
          const top = parseFloat(el.style.top);
          onItemMove(intr.targetId, left, top);
          // Restore transition
          el.style.transition = '';
        }
      }
    } else if (intr.mode === 'draw-link' && intr.targetId) {
      const target = e.target as HTMLElement;
      const noteCard = target.closest('.note-card') as HTMLElement;
      if (noteCard) {
        const targetId = noteCard.dataset.noteId;
        if (targetId && targetId !== intr.targetId) {
          if (onNewConnection) onNewConnection(intr.targetId, targetId);
        }
      }
    }
    const idle = { mode: 'idle', targetId: null, offsetX: 0, offsetY: 0, origW: 0, origH: 0 };
    interactionRef.current = idle;
    setInteraction(idle);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (activeNote) return;
    const target = e.target as HTMLElement;
    if (target.closest('.note-card') || target.closest('.link-handle')) return;
    
    if (onCanvasDoubleClick) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      onCanvasDoubleClick(coords.x, coords.y);
    }
  };

  const handleLineClick = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation(); 
    const targetNote = items.find(n => n.id === targetId);
    
    if (targetNote && containerRef.current) {
      setInteraction(prev => ({ ...prev, mode: 'fly' })); 
      
      const rect = containerRef.current.getBoundingClientRect();
      const newX = (rect.width / 2) - (targetNote.x + targetNote.width / 2) * transform.scale;
      const newY = (rect.height / 2) - (targetNote.y + 150) * transform.scale; 
      
      setTransform({ ...transform, x: newX, y: newY });
      
      setTimeout(() => {
        setInteraction(prev => prev.mode === 'fly' ? { ...prev, mode: 'idle' } : prev);
      }, 700);
    }
  };

  const getBezierPath = (source: ZenCanvasItem, target: ZenCanvasItem) => {
    const sW = source.width;
    const sH = 200; 
    const tW = target.width;
    const tH = 200; 

    const sCx = source.x + sW / 2;
    const sCy = source.y + sH / 2;
    const tCx = target.x + tW / 2;
    const tCy = target.y + tH / 2;

    const dx = tCx - sCx;
    const dy = tCy - sCy;

    let sx, sy, tx, ty, cx1, cy1, cx2, cy2;
    const tension = 0.5;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) { sx = source.x + sW; sy = sCy; tx = target.x - 14; ty = tCy; } 
      else { sx = source.x; sy = sCy; tx = target.x + tW + 14; ty = tCy; }
      const cpOffset = Math.abs(tx - sx) * tension;
      cx1 = sx + (dx > 0 ? cpOffset : -cpOffset); cy1 = sy;
      cx2 = tx - (dx > 0 ? cpOffset : -cpOffset); cy2 = ty;
    } else {
      if (dy > 0) { sx = sCx; sy = source.y + sH; tx = tCx; ty = target.y - 14; } 
      else { sx = sCx; sy = source.y; tx = tCx; ty = target.y + tH + 14; }
      const cpOffset = Math.abs(ty - sy) * tension;
      cx1 = sx; cy1 = sy + (dy > 0 ? cpOffset : -cpOffset);
      cx2 = tx; cy2 = ty - (dy > 0 ? cpOffset : -cpOffset);
    }
    return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
  };

  const currentThemeStyle = isChronoEnabled ? THEME_STYLES[chronoState.id] : 'bg-transparent';
  const isAbstracted = transform.scale < 0.6;

  const handleCloseActiveNote = () => {
    if (onCloseActiveItem) {
      onCloseActiveItem();
    } else {
      setActiveNote(null);
    }
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden transition-colors duration-1000 ease-in-out ${currentThemeStyle} ${className}`}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      ref={containerRef}
    >
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
          backgroundSize: `${40 * transform.scale}px ${40 * transform.scale}px`,
          backgroundPosition: `${transform.x}px ${transform.y}px`,
        }}
      />

      <div 
        className="absolute inset-0 transform-gpu"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
          transformOrigin: '0 0',
          transition: interaction.mode === 'pan' ? 'none' : interaction.mode === 'fly' ? 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out'
        }}
        onDoubleClick={handleDoubleClick}
      >
        <svg className="absolute inset-0 z-0 pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" className="opacity-40" />
            </marker>
          </defs>

          {connections.map(conn => {
            const sNote = items.find(n => n.id === conn.source);
            const tNote = items.find(n => n.id === conn.target);
            if (!sNote || !tNote) return null;
            const d = getBezierPath(sNote, tNote);
            return (
              <g 
                key={conn.id} 
                className="pointer-events-auto cursor-pointer group"
                onPointerDown={(e) => handleLineClick(e, conn.target)}
              >
                <path d={d} stroke="transparent" strokeWidth="24" fill="none" />
                <path
                  d={d}
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="opacity-30 group-hover:opacity-100 group-hover:stroke-[3px] transition-all duration-500 ease-in-out drop-shadow-[0_0_8px_rgba(79,70,229,0.6)]"
                />
              </g>
            );
          })}

          {interaction.mode === 'draw-link' && (() => {
            const sNote = items.find(n => n.id === interaction.targetId);
            if (!sNote) return null;
            const sx = sNote.x + sNote.width / 2;
            const sy = sNote.y + 100;
            const tx = mouseCanvasPos.x;
            const ty = mouseCanvasPos.y;
            const d = `M ${sx} ${sy} C ${sx} ${ty}, ${tx} ${sy}, ${tx} ${ty}`;
            return (
              <path d={d} stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="6 6" className="opacity-60 drop-shadow-[0_0_8px_rgba(79,70,229,0.4)] animate-pulse" />
            );
          })()}
        </svg>

        {items.map(item => (
          <ZenCanvasNoteCard
            key={item.id}
            item={item}
            isActive={activeNote?.id === item.id}
            isAbstracted={isAbstracted}
            interactionMode={interaction.mode}
            interactionTargetId={interaction.targetId}
            themeMode={themeMode}
            onItemDoubleClick={onItemDoubleClick}
            renderItemContent={renderItemContent}
          />
        ))}
      </div>

      {/* Cinematic Transition Overlay */}
      <div 
        className={`absolute inset-0 bg-black/5 backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-40
          ${activeNote ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleCloseActiveNote}
      />

      <div 
        className={`absolute z-50 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)] pointer-events-none
          ${activeNote ? 'inset-0 opacity-100' : 'inset-1/2 opacity-0 scale-75 blur-md'}
        `}
      >
        {activeNote && (
          <div 
            className={`pointer-events-auto relative w-full h-full md:w-[90%] md:h-[90%] overflow-y-auto backdrop-blur-3xl border border-white/30 shadow-[0_30px_60px_rgba(0,0,0,0.15)] md:rounded-[2.5rem] transition-all duration-700 delay-100 flex flex-col
              ${activeNote.color || 'bg-white'}
            `}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={handleCloseActiveNote}
              className="absolute top-6 right-8 p-3 rounded-full bg-black/10 hover:bg-black/20 backdrop-blur-md transition-colors z-50"
            >
              <X size={20} className="opacity-70" />
            </button>
            
            {renderExpandedItem ? (
              renderExpandedItem(activeNote, handleCloseActiveNote)
            ) : (
              <ZenCanvasExpandedNote activeNote={activeNote} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
