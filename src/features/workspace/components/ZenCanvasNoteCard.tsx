import React, { ReactNode } from 'react';
import { Link2, Maximize2 } from 'lucide-react';
import { ZenCanvasItem } from '@/features/workspace/components/ZenCanvas';

interface ZenCanvasNoteCardProps {
  item: ZenCanvasItem;
  isActive: boolean;
  isAbstracted: boolean;
  interactionMode: string;
  interactionTargetId: string | null;
  themeMode?: 'light' | 'dark';
  onItemDoubleClick?: (id: string) => void;
  renderItemContent?: (item: ZenCanvasItem, isAbstracted: boolean) => ReactNode;
}

export default function ZenCanvasNoteCard({
  item,
  isActive,
  isAbstracted,
  interactionMode,
  interactionTargetId,
  themeMode = 'light',
  onItemDoubleClick,
  renderItemContent,
}: ZenCanvasNoteCardProps) {
  const isDark = themeMode === 'dark';
  const baseCardClass = isDark
    ? 'bg-neutral-800 text-neutral-100 border-neutral-700 hover:border-indigo-400'
    : 'bg-white text-gray-900 border-gray-300 hover:border-indigo-400';

  // When custom content is rendered, let NoteNode manage its own padding,
  // border-radius, and allow thumbnails to overflow the card boundary.
  const hasCustomContent = !!renderItemContent;

  return (
    <div
      data-note-id={item.id}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (onItemDoubleClick) onItemDoubleClick(item.id);
      }}
      className={`note-card absolute cursor-grab active:cursor-grabbing group z-10 transition-all duration-300
        ${hasCustomContent
          ? 'overflow-visible bg-transparent border-0 shadow-none p-0'
          : `backdrop-blur-md border-2 shadow-xl rounded-2xl p-6 overflow-hidden hover:shadow-2xl hover:-translate-y-1 ${item.color || baseCardClass}`
        }
        ${isActive ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}
      `}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height || 'auto',
        minHeight: hasCustomContent ? 'unset' : '200px',
        transition:
          interactionMode === 'drag-note' && interactionTargetId === item.id
            ? 'none'
            : 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
      }}
    >
      {/* Connection link handle — always present */}
      <div
        data-note-id={item.id}
        className={`link-handle absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full backdrop-blur-md border shadow-lg flex items-center justify-center cursor-crosshair opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 hover:scale-110 ${
          isDark ? 'bg-neutral-700/70 hover:bg-neutral-600 border-neutral-500' : 'bg-white/80 hover:bg-white border-gray-300'
        }`}
        title="Drag to connect"
      >
        <Link2 size={14} className="opacity-70" />
      </div>

      {renderItemContent ? (
        renderItemContent(item, isAbstracted)
      ) : (
        <div className="flex flex-col h-full pointer-events-none">
          <h3 className="text-xl font-bold mb-3 tracking-tight opacity-90 truncate">{item.title}</h3>
          <div className={`transition-opacity duration-500 overflow-hidden flex-1 ${isAbstracted ? 'opacity-0' : 'opacity-100'}`}>
            <p className="text-sm leading-relaxed opacity-80 whitespace-pre-wrap line-clamp-6" dangerouslySetInnerHTML={{ __html: item.content || '' }} />
          </div>
        </div>
      )}

      {/* Resize handle — only for default (non-custom) cards */}
      {!hasCustomContent && (
        <div
          data-note-id={item.id}
          className={`resize-handle absolute bottom-2 right-2 w-8 h-8 flex items-center justify-center cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full z-20 ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
        >
          <Maximize2 size={16} className="opacity-50 pointer-events-none rotate-90" />
        </div>
      )}
    </div>
  );
}