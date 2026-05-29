import { Note } from '@/shared/lib/types';
import {
  ImageIcon, Video, Paperclip, Mic,
  MoreHorizontal, Pin, Copy, Trash2, Share2,
  CheckCircle2, Link as LinkIcon, Maximize2, Play
} from 'lucide-react';

interface NoteNodeProps {
  data: {
    note: Note;
    onNoteClick: (note: Note) => void;
    onNoteDelete?: (noteId: string) => void;
    onNoteDuplicate?: (note: Note) => void;
    onNoteCopyLink?: (noteId: string) => void;
    onNotePin?: (noteId: string) => void;
  };
  /** Passed by ZenCanvasNoteCard when used as renderItemContent */
  isAbstracted?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Count TipTap checkboxes from raw HTML content */
function parseTasksFromContent(html: string): { total: number; completed: number } | null {
  if (!html) return null;
  const totalMatches   = html.match(/data-type="taskItem"/g);
  const checkedMatches = html.match(/data-checked="true"/g);
  if (!totalMatches || totalMatches.length === 0) return null;
  return {
    total:     totalMatches.length,
    completed: checkedMatches ? checkedMatches.length : 0,
  };
}

/** Strip HTML tags to produce plain preview text */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ─── Stacked sticky image thumbnails positions ───────────────────────────────
const STACK_STYLES = [
  { transform: 'translate(0px, 0px) rotate(11deg)',  zIndex: 30 },
  { transform: 'translate(-7px, 5px) rotate(-5deg)', zIndex: 20 },
  { transform: 'translate(-12px, -3px) rotate(7deg)',zIndex: 10 },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function NoteNode({ data, isAbstracted = false }: NoteNodeProps) {
  const { note, onNoteClick, onNoteDelete, onNoteDuplicate, onNoteCopyLink, onNotePin } = data;

  const imageAttachments  = note.attachments?.filter(a => a.type === 'image') ?? [];
  const videoAttachments  = note.attachments?.filter(a => a.type === 'video') ?? [];
  const fileAttachments   = note.attachments?.filter(a => a.type === 'file')  ?? [];
  const hasAttachments    = note.attachments && note.attachments.length > 0;

  // Use the explicit cover image if set
  const coverSrc = note.coverImage ?? null;

  // Infer tasks from TipTap HTML
  const taskInfo = parseTasksFromContent(note.content);

  const isStandaloneMedia = (!note.content || stripHtml(note.content).trim() === '') 
                            && (!note.title || note.title.startsWith('Voice Note')) 
                            && note.attachments && note.attachments.length === 1;

  // When abstracted (zoomed far out) render a lightweight tile
  if (isAbstracted) {
    return (
      <div
        className="w-full h-full p-4 flex flex-col"
        style={{ backgroundColor: note.color || 'transparent' }}
      >
        <p className="font-bold text-sm text-gray-900 truncate">{note.title || 'Untitled'}</p>
      </div>
    );
  }

  // --- ACTION MENU EXTRACTED FOR REUSE ---
  const renderActionButtons = () => (
    <div className="absolute top-2 right-2 z-50 group/menu pointer-events-auto">
      <button
        className="p-1 text-white/70 hover:text-white hover:bg-white/15 rounded-full transition-all opacity-0 group-hover:opacity-100 group-hover/menu:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal size={16} />
      </button>

      <div
        className="absolute right-full top-0 mr-1 flex items-center gap-0.5
                   bg-gray-900/95 backdrop-blur-md p-1 rounded-full shadow-xl
                   transition-all duration-250 origin-right
                   scale-50 opacity-0 invisible translate-x-3
                   group-hover/menu:scale-100 group-hover/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-x-0"
      >
        <button
          title={note.isPinned ? 'Unpin' : 'Pin'}
          className={`p-1.5 rounded-full transition-colors ${note.isPinned ? 'bg-[#FF7D54] text-white hover:bg-[#e06945]' : 'hover:bg-white/15 text-white'}`}
          onClick={(e) => { e.stopPropagation(); onNotePin?.(note.id); }}
        >
          <Pin size={12} className={note.isPinned ? 'fill-current' : ''} />
        </button>
        <button
          title="Duplicate"
          className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onNoteDuplicate?.(note); }}
        >
          <Copy size={12} />
        </button>
        <button
          title="Copy Link"
          className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); onNoteCopyLink?.(note.id); }}
        >
          <Share2 size={12} />
        </button>
        <div className="w-px h-3.5 bg-gray-600 mx-0.5" />
        <button
          title="Delete"
          className="p-1.5 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
          onClick={(e) => { e.stopPropagation(); onNoteDelete?.(note.id); }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );

  if (isStandaloneMedia && note.attachments) {
    const att = note.attachments[0];
    return (
      <div className="relative group w-full h-full rounded-[1.5rem] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.05)] bg-white border border-black/5" onClick={() => onNoteClick(note)}>
        
        {/* Full Bleed Media Content */}
        <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
          {att.type === 'image' ? (
            <img src={att.data} alt="" className="w-full h-full object-cover" />
          ) : att.type === 'video' ? (
            <div className="w-full aspect-video bg-black flex items-center justify-center relative group/video overflow-hidden">
              <video 
                src={att.data} 
                className="w-full h-full object-cover opacity-60 group-hover/video:opacity-90 transition-opacity duration-500" 
                muted 
                loop 
                playsInline
                onMouseEnter={(e) => e.currentTarget.play().catch(() => {})} 
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl group-hover/video:scale-110 group-hover/video:bg-white/20 transition-all duration-300">
                   <Play size={28} className="text-white ml-1 drop-shadow-md" fill="currentColor" />
                 </div>
              </div>
            </div>
          ) : att.type === 'audio' ? (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col items-center justify-center relative text-white">
              <Mic size={48} className="text-white/80 drop-shadow-md mb-4" />
              <p className="font-bold text-sm opacity-90 truncate max-w-[80%]">{att.name}</p>
            </div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center relative">
              <Paperclip size={48} className="text-gray-400 mb-4" />
              <p className="font-bold text-sm text-gray-600 truncate max-w-[80%]">{att.name}</p>
            </div>
          )}
        </div>

        {renderActionButtons()}

        {/* Footer Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-gradient-to-t from-black/50 to-transparent pointer-events-none flex justify-between items-end">
          <span className="text-[10px] font-bold text-white px-3 py-1 bg-black/40 backdrop-blur-md rounded-full shadow-sm">{note.date}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group" style={{ width: '100%', height: '100%' }}>

      {/* ── Stacked sticky thumbnails ── */}
      {note.attachments && note.attachments.slice(0, 3).map((att, idx) => (
        <div
          key={att.id}
          className="absolute -right-3 -top-3 w-14 h-14 bg-white p-1 shadow-xl rounded-sm border border-gray-200
                     transition-all duration-300 group-hover:scale-110 pointer-events-none origin-bottom-left"
          style={{ ...STACK_STYLES[idx], zIndex: STACK_STYLES[idx].zIndex }}
        >
          <div className="w-full h-full bg-gray-100 overflow-hidden relative flex items-center justify-center">
            {att.type === 'image' ? (
              <img
                src={att.data}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            ) : att.type === 'video' ? (
              <Video size={20} className="text-gray-400 opacity-80" />
            ) : att.type === 'audio' ? (
              <Mic size={20} className="text-gray-400 opacity-80" />
            ) : (
              <Paperclip size={20} className="text-gray-400 opacity-80" />
            )}
            
            {/* Decorative tape strip */}
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white/60 backdrop-blur-sm -rotate-6 rounded-sm" />
          </div>
        </div>
      ))}

      {/* ── Node container ── */}
      <div
        onClick={() => onNoteClick(note)}
        className="backdrop-blur-sm border-2 border-gray-200/70 rounded-[1.75rem] shadow-lg
                   hover:shadow-2xl hover:-translate-y-0.5 hover:border-gray-300
                   transition-all duration-300 ease-out flex flex-col relative cursor-pointer"
        style={{ backgroundColor: note.color || '#ffffff', minHeight: 220, height: '100%' }}
      >

        {/* Cover image */}
        {coverSrc && (
          <div
            className="w-full h-32 bg-cover bg-center shrink-0 border-b border-gray-100/80 rounded-t-[1.6rem]"
            style={{ 
              backgroundImage: `url(${coverSrc})`,
              backgroundPosition: `center ${note.coverPositionY ?? 50}%`
            }}
          />
        )}

        <div className="p-5 flex flex-col flex-1">

          {/* ── Header ── */}
          <div className="flex justify-between items-start mb-2.5 relative shrink-0">
            <div className="flex items-start gap-1">
              {note.isPinned && (
                <Pin size={14} className="text-[#FF7D54] shrink-0 mt-0.5" />
              )}
              <h3 className="font-extrabold text-base text-gray-900 line-clamp-2 pr-6 leading-tight tracking-tight">
                {note.title || 'Untitled'}
              </h3>
            </div>

            {/* Quick-action hover bubble */}
            <div className="absolute right-0 top-0 z-30 group/menu">
              <button
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-black/5 rounded-full transition-all opacity-0 group-hover:opacity-100 group-hover/menu:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal size={16} />
              </button>

              {/* Horizontal pill popup */}
              <div
                className={`absolute right-full top-0 mr-1 flex items-center gap-0.5
                             bg-gray-900/95 backdrop-blur-md p-1 rounded-full shadow-xl
                             transition-all duration-250 origin-right
                             scale-50 opacity-0 invisible translate-x-3
                             group-hover/menu:scale-100 group-hover/menu:opacity-100 group-hover/menu:visible group-hover/menu:translate-x-0`}
              >
                <button
                  title={note.isPinned ? "Unpin" : "Pin"}
                  className={`p-1.5 rounded-full transition-colors ${note.isPinned ? 'bg-[#FF7D54] text-white hover:bg-[#e06945]' : 'hover:bg-white/15 text-white'}`}
                  onClick={(e) => { e.stopPropagation(); onNotePin?.(note.id); }}
                >
                  <Pin size={12} className={note.isPinned ? 'fill-current' : ''} />
                </button>
                <button
                  title="Duplicate"
                  className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); onNoteDuplicate?.(note); }}
                >
                  <Copy size={12} />
                </button>
                <button
                  title="Copy Link"
                  className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                  onClick={(e) => { e.stopPropagation(); onNoteCopyLink?.(note.id); }}
                >
                  <Share2 size={12} />
                </button>
                <div className="w-px h-3.5 bg-gray-600 mx-0.5" />
                <button
                  title="Delete"
                  className="p-1.5 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
                  onClick={(e) => { e.stopPropagation(); onNoteDelete?.(note.id); }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* ── Content preview ── */}
          <p className="text-xs text-gray-500 leading-relaxed font-medium line-clamp-4 flex-1 mb-2">
            {stripHtml(note.content) || 'Start typing…'}
          </p>

          {/* ── Tags ── */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {note.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-black/5 text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── Task progress bar ── */}
          {taskInfo && taskInfo.total > 0 && (
            <div className="mb-2 shrink-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500" />
                  Tasks
                </span>
                <span className="text-[9px] font-bold text-gray-400">
                  {taskInfo.completed}/{taskInfo.total}
                </span>
              </div>
              <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${(taskInfo.completed / taskInfo.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="pt-3 mt-1 border-t border-black/5 flex items-center gap-3 shrink-0">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-black/5 px-1.5 py-0.5 rounded-md">
              {note.date}
            </span>

            {/* Attachment icons + rich hover preview */}
            {hasAttachments && (
              <div className="relative group/attach flex items-center gap-2 text-gray-400 p-0.5 cursor-pointer">
                {imageAttachments.length > 0 && (
                  <ImageIcon size={12} className="group-hover/attach:text-gray-700 transition-colors" />
                )}
                {videoAttachments.length > 0 && (
                  <Video size={12} className="group-hover/attach:text-gray-700 transition-colors" />
                )}
                {fileAttachments.length > 0 && (
                  <Paperclip size={12} className="group-hover/attach:text-gray-700 transition-colors" />
                )}

                {/* Rich attachment popup */}
                <div
                  className="absolute bottom-full left-0 mb-2 w-52 bg-gray-900/95 backdrop-blur-md rounded-xl p-2 shadow-2xl
                             opacity-0 invisible group-hover/attach:opacity-100 group-hover/attach:visible
                             transition-all duration-200 origin-bottom-left z-50 pointer-events-none
                             scale-95 group-hover/attach:scale-100 border border-gray-700"
                >
                  <div className="text-[10px] font-semibold text-gray-300 px-1 mb-1.5 flex justify-between items-center">
                    <span>Attachments</span>
                    <span className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded-md text-[8px] border border-gray-700">
                      {note.attachments.length} items
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {note.attachments.slice(0, 4).map((att) => (
                      <div key={att.id} className="flex items-center gap-2 bg-white/10 rounded-lg p-1.5">
                        {att.type === 'image' ? (
                          <div
                            className="w-7 h-7 rounded-md bg-cover bg-center shrink-0 border border-white/10"
                            style={{ backgroundImage: `url(${att.data})` }}
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0 text-gray-300">
                            {att.type === 'video' ? <Video size={12} /> : att.type === 'audio' ? <LinkIcon size={12} /> : <Paperclip size={12} />}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-gray-100 truncate font-medium">{att.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Arrow */}
                  <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-gray-900/95 border-b border-r border-gray-700 rotate-45" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize handle — data-note-id is on the outer ZenCanvasNoteCard so we target via class */}
        <div
          className="resize-handle absolute bottom-2 right-2 w-7 h-7 flex items-center justify-center
                     cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     rounded-full hover:bg-black/5 z-20"
          data-note-id={note.id}
        >
          <Maximize2 size={14} className="opacity-40 pointer-events-none rotate-90" />
        </div>

      </div>
    </div>
  );
}
