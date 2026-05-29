import { Search, Plus, FileText, ImageIcon, Video, Paperclip, Calendar, MoreHorizontal, ChevronLeft, Folder, LayoutGrid, Map, Moon, Sun, Maximize2, Settings2, X, Mic, Pin, Copy, Share2, Trash2 } from 'lucide-react';
import { Note } from '@/shared/lib/types';
import { useMemo, useState, useRef, useCallback } from 'react';
import ZenCanvas, { ZenCanvasItem, ZenCanvasConnection } from '@/features/workspace/components/ZenCanvas';
import NoteNode from '@/features/workspace/components/NoteNode';
import GlobalNavbar from '@/shared/components/GlobalNavbar';

interface WorkspaceViewProps {
  notes: Note[];
  onNoteClick: (note: Note, zenMode?: boolean) => void;
  onNewNote: (x?: number, y?: number) => void;
  onNewVoiceNote: (blob: Blob, durationMs: number) => void;
  onCalendar: () => void;
  onBackToSplash: () => void;
  onNoteChange: (note: Note) => void;
  onNoteCreate?: (note: Note) => void;
  onNoteDelete?: (noteId: string) => void;
  themeMode?: 'light' | 'dark';
  isChronoEnabled?: boolean;
  workspaceMode: 'grid' | 'canvas';
  setWorkspaceMode: (mode: 'grid' | 'canvas') => void;
  onToggleTheme?: () => void;
  onToggleChrono?: () => void;
}

export default function WorkspaceView({
  notes,
  onNoteClick,
  onNewNote,
  onNewVoiceNote,
  onCalendar,
  onBackToSplash,
  onNoteChange,
  onNoteCreate,
  onNoteDelete,
  themeMode = 'light',
  isChronoEnabled = false,
  workspaceMode,
  setWorkspaceMode,
  onToggleTheme,
  onToggleChrono,
}: WorkspaceViewProps) {
  
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [previewNoteId, setPreviewNoteId] = useState<string | null>(null);
  const previewNote = notes.find(n => n.id === previewNoteId);
  
  // Note: For ZenCanvas we use the raw notes directly to allow dragging them anywhere.
  // We'll also calculate parent-child connections.
  const canvasItems = useMemo<ZenCanvasItem[]>(() => {
    return notes.map(note => ({
      id: note.id,
      title: note.title || 'Untitled',
      content: note.content,
      color: note.color,
      x: note.x || Math.random() * 800,
      y: note.y || Math.random() * 600,
      width: note.width || 320,
      data: {
        note,
        onNoteClick: (n: Note) => onNoteClick(n),
        onNoteDelete: onNoteDelete,
        onNoteDuplicate: (n: Note) => {
          const duplicate: Note = {
            ...n,
            id: Date.now().toString(),
            title: `${n.title} (copy)`,
            updatedAt: Date.now(),
            x: (n.x ?? 400) + 340,
            y: n.y ?? 200,
          };
          if (onNoteCreate) onNoteCreate(duplicate);
        },
        onNoteCopyLink: (noteId: string) => {
          navigator.clipboard.writeText(`noter://note/${noteId}`);
        },
        onNotePin: (noteId: string) => {
          const n = notes.find(n => n.id === noteId);
          if (n) {
            onNoteChange({ ...n, isPinned: !n.isPinned });
          }
        },
      }
    }));
  }, [notes, onNoteClick, onNoteDelete, onNoteCreate, onNoteChange]);

  const canvasConnections = useMemo<ZenCanvasConnection[]>(() => {
    const connections: ZenCanvasConnection[] = [];
    
    notes.forEach(note => {
      // Parent/Child connections
      if (note.parentId) {
        connections.push({
          id: `${note.parentId}-${note.id}`,
          source: note.parentId as string,
          target: note.id
        });
      }
      
      // Explicit connections array
      if (note.connections && note.connections.length > 0) {
        note.connections.forEach(targetId => {
          if (!connections.some(c => (c.source === note.id && c.target === targetId) || (c.source === targetId && c.target === note.id))) {
            connections.push({
              id: `${note.id}-link-${targetId}`,
              source: note.id,
              target: targetId
            });
          }
        });
      }
      
      // Bi-directional link connections (Mentions)
      if (note.content) {
        const regex = /data-type="mention" data-id="([^"]+)"/g;
        let match;
        while ((match = regex.exec(note.content)) !== null) {
          const targetId = match[1];
          // Prevent duplicates
          if (!connections.some(c => (c.source === note.id && c.target === targetId) || (c.source === targetId && c.target === note.id))) {
            connections.push({
              id: `${note.id}-link-${targetId}`,
              source: note.id,
              target: targetId
            });
          }
        }
      }
    });
    
    return connections;
  }, [notes]);

  // TODO: Add onNoteChange to save coords
  const handleItemMove = (id: string, x: number, y: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      onNoteChange({ ...note, x, y });
    }
  };

  // Group ROOT notes by their first tag
  const groupedNotes = useMemo(() => {
    const groups: Record<string, Note[]> = {};
    
    // Only process notes that don't have a parent (root notes)
    notes.filter(n => !n.parentId).forEach(note => {
      const tag = note.tags && note.tags.length > 0 ? note.tags[0] : 'Untagged';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(note);
    });
    
    const sortedTags = Object.keys(groups).sort((a, b) => {
      if (a === 'Untagged') return 1;
      if (b === 'Untagged') return -1;
      return a.localeCompare(b);
    });
    
    return sortedTags.map(tag => ({
      tag,
      notes: groups[tag].sort((a, b) => {
        // Pinned first, then by date (descending)
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return b.updatedAt - a.updatedAt;
      }),
      count: groups[tag].length
    }));
  }, [notes]);


  const activeNotes = useMemo(() => {
    if (!selectedTag) return [];
    const group = groupedNotes.find(g => g.tag === selectedTag);
    return group ? group.notes : [];
  }, [selectedTag, groupedNotes]);

  return (
    <div className="flex flex-col w-full h-full bg-[#F9F8F6] animate-in slide-in-from-right-8 duration-300 relative z-10 font-sans">
      {/* Floating Universal Navbar — Workspace */}
      <GlobalNavbar themeMode={themeMode} scrollContainerId="workspace-scroll-container">
        {/* Brand or Back */}
          {selectedTag ? (
            <button 
              onClick={() => setSelectedTag(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-bold capitalize"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">{selectedTag}</span>
            </button>
          ) : (
            <button 
              onClick={onBackToSplash}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all group"
            >
              <div className="w-6 h-6 bg-[#FF7D54] rounded-full flex items-center justify-center text-white font-serif font-bold text-[10px] shadow-sm">
                F
              </div>
              <span className="hidden sm:inline font-extrabold text-white/90 tracking-tight text-sm">Workspace</span>
            </button>
          )}

          <div className="w-px h-4 bg-white/15 mx-1" />

          {/* Search (Icon only for pill) */}
          <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors" title="Search">
            <Search className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/15 mx-1" />

          {/* View Toggles */}
          <button 
            onClick={() => setWorkspaceMode('canvas')}
            className={`p-2 rounded-full transition-all ${workspaceMode === 'canvas' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white/80'}`}
            title="Zen Canvas"
          >
            <Map className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setWorkspaceMode('grid')}
            className={`p-2 rounded-full transition-all ${workspaceMode === 'grid' ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white/80'}`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-white/15 mx-1 hidden md:block" />

          {/* Chrono */}
          {onToggleChrono && (
            <button 
              onClick={onToggleChrono}
              className={`p-2 rounded-full transition-all ${isChronoEnabled ? 'bg-indigo-500/80 text-white' : 'hover:bg-white/10 text-white/40 hover:text-white/80'}`}
              title="Chrono Mode"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          )}

          {/* Calendar */}
          <button 
            onClick={onCalendar}
            className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors"
            title="Calendar"
          >
            <Calendar className="w-4 h-4" />
          </button>
      </GlobalNavbar>

      {/* Main Content */}
      <div id="workspace-scroll-container" className="flex-1 overflow-y-auto relative">
        {workspaceMode === 'canvas' ? (
          <div className="absolute inset-0">
            <ZenCanvas 
              items={canvasItems}
              connections={canvasConnections}

              onNewConnection={(sourceId, targetId) => {
                const sourceNote = notes.find(n => n.id === sourceId);
                if (sourceNote) {
                  const existingConnections = sourceNote.connections || [];
                  if (!existingConnections.includes(targetId)) {
                    onNoteChange({ 
                      ...sourceNote, 
                      connections: [...existingConnections, targetId] 
                    });
                  }
                }
              }}
              onItemDoubleClick={(id) => {
                setPreviewNoteId(null);
                const note = notes.find(n => n.id === id);
                if (note) onNoteClick(note);
              }}
              onItemUpdate={(updatedItem) => {
                const note = notes.find(n => n.id === updatedItem.id);
                if (note) {
                  onNoteChange({ ...note, width: updatedItem.width, height: updatedItem.height });
                }
              }}
              onItemMove={handleItemMove}
              onCanvasDoubleClick={(x, y) => {
                onNewNote(x, y);
              }}
              onNewNoteClick={() => onNewNote()}
              themeMode={themeMode}
              isChronoEnabled={isChronoEnabled}
              renderItemContent={(item, isAbstracted) => (
                <NoteNode
                  data={item.data as any}
                  isAbstracted={isAbstracted}
                />
              )}
            />
          </div>
        ) : (
          <div className="p-8 md:p-12 pb-40 max-w-7xl mx-auto space-y-16">
            {selectedTag === null ? (
            // ROOT WORKSPACE VIEW (Folders + Untagged Notes)
            groupedNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                <Folder className="w-20 h-20 mb-8 text-gray-300" />
                <p className="text-xl font-medium tracking-wide">Workspace is empty.</p>
              </div>
            ) : (
              <div className="space-y-12 animate-in fade-in duration-500">
                {/* 1. Render Tag Folders */}
                {groupedNotes.filter(g => g.tag !== 'Untagged').length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {groupedNotes.filter(g => g.tag !== 'Untagged').map(group => (
                      <div 
                        key={group.tag} 
                        onClick={() => setSelectedTag(group.tag)}
                        className="bg-white border-2 border-gray-200 shadow-xl rounded-2xl p-8 cursor-pointer group flex flex-col justify-center items-center min-h-[200px] hover:-translate-y-2 hover:border-indigo-400 transition-all duration-300"
                      >
                        <Folder className="w-12 h-12 text-[#FF7D54] mb-6 group-hover:scale-110 transition-transform duration-300" />
                        <h3 className="font-extrabold text-2xl text-gray-900 capitalize tracking-tight">{group.tag}</h3>
                        <p className="text-gray-400 font-semibold mt-2 text-sm">{group.count} Notes</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Render Untagged Notes Directly */}
                {groupedNotes.find(g => g.tag === 'Untagged') && (
                  <div className="space-y-6 pt-4">
                    {groupedNotes.filter(g => g.tag !== 'Untagged').length > 0 && (
                      <h2 className="text-lg font-bold text-gray-400 uppercase tracking-widest pl-2">Loose Notes</h2>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 auto-rows-max">
                      {groupedNotes.find(g => g.tag === 'Untagged')?.notes.map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => onNoteClick(note)}
                          className="clay-card p-8 cursor-pointer group flex flex-col min-h-[260px] relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-6 relative">
                            <div className="flex items-start gap-1.5">
                              {note.isPinned && <Pin size={18} className="text-[#FF7D54] shrink-0 mt-1" />}
                              <h3 className="font-extrabold text-2xl text-gray-900 line-clamp-2 pr-2 leading-tight tracking-tight">{note.title || 'Untitled'}</h3>
                            </div>
                            
                            {/* Hover Actions */}
                            <div className="absolute right-0 top-0 z-30 group/menu">
                              <button
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-black/5 rounded-full transition-all opacity-0 group-hover:opacity-100 group-hover/menu:opacity-100"
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
                                  onClick={(e) => { e.stopPropagation(); onNoteChange({ ...note, isPinned: !note.isPinned }); }}
                                >
                                  <Pin size={12} className={note.isPinned ? 'fill-current' : ''} />
                                </button>
                                <button
                                  title="Duplicate"
                                  className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (onNoteCreate) onNoteCreate({ ...note, id: Date.now().toString(), title: `${note.title} (copy)`, updatedAt: Date.now() });
                                  }}
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  title="Copy Link"
                                  className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                                  onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`noter://note/${note.id}`); }}
                                >
                                  <Share2 size={12} />
                                </button>
                                <div className="w-px h-3.5 bg-gray-600 mx-0.5" />
                                <button
                                  title="Delete"
                                  className="p-1.5 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
                                  onClick={(e) => { e.stopPropagation(); if (onNoteDelete) onNoteDelete(note.id); }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-base text-gray-500 line-clamp-4 leading-relaxed flex-1 font-medium overflow-hidden" dangerouslySetInnerHTML={{ __html: note.content || 'Start typing...' }} />
                          
                          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-400">{note.date}</span>
                            {note.attachments && note.attachments.length > 0 && (
                              <div className="flex items-center gap-2 text-gray-400">
                                {note.attachments.some(a => a.type === 'image') && <ImageIcon size={14} />}
                                {note.attachments.some(a => a.type === 'video') && <Video size={14} />}
                                {note.attachments.some(a => a.type === 'file') && <Paperclip size={14} />}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            // INSIDE A FOLDER VIEW
            activeNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
                <FileText className="w-20 h-20 mb-8 text-gray-300" />
                <p className="text-xl font-medium tracking-wide">No notes here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 auto-rows-max animate-in fade-in duration-300">
                {activeNotes.map(note => (
                  <div 
                    key={note.id} 
                    onClick={() => onNoteClick(note)}
                    className="bg-white border-2 border-gray-200 shadow-xl rounded-2xl p-8 cursor-pointer group flex flex-col min-h-[320px] hover:-translate-y-2 hover:border-indigo-400 transition-all duration-300 hover:shadow-2xl"
                  >
                    <div className="flex justify-between items-start mb-6 relative">
                      <div className="flex items-start gap-1.5">
                        {note.isPinned && <Pin size={18} className="text-[#FF7D54] shrink-0 mt-1" />}
                        <h3 className="font-extrabold text-2xl text-gray-900 line-clamp-2 pr-2 leading-tight tracking-tight">{note.title || 'Untitled'}</h3>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute right-0 top-0 z-30 group/menu">
                        <button
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-black/5 rounded-full transition-all opacity-0 group-hover:opacity-100 group-hover/menu:opacity-100"
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
                            onClick={(e) => { e.stopPropagation(); onNoteChange({ ...note, isPinned: !note.isPinned }); }}
                          >
                            <Pin size={12} className={note.isPinned ? 'fill-current' : ''} />
                          </button>
                          <button
                            title="Duplicate"
                            className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onNoteCreate) onNoteCreate({ ...note, id: Date.now().toString(), title: `${note.title} (copy)`, updatedAt: Date.now() });
                            }}
                          >
                            <Copy size={12} />
                          </button>
                          <button
                            title="Copy Link"
                            className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors"
                            onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(`noter://note/${note.id}`); }}
                          >
                            <Share2 size={12} />
                          </button>
                          <div className="w-px h-3.5 bg-gray-600 mx-0.5" />
                          <button
                            title="Delete"
                            className="p-1.5 hover:bg-red-500/20 rounded-full text-red-400 hover:text-red-300 transition-colors"
                            onClick={(e) => { e.stopPropagation(); if (onNoteDelete) onNoteDelete(note.id); }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-base text-gray-500 line-clamp-4 leading-relaxed flex-1 font-medium overflow-hidden" dangerouslySetInnerHTML={{ __html: note.content || 'Start typing...' }} />
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-400">{note.date}</span>
                      {note.attachments && note.attachments.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-400">
                          {note.attachments.some(a => a.type === 'image') && <ImageIcon size={14} />}
                          {note.attachments.some(a => a.type === 'video') && <Video size={14} />}
                          {note.attachments.some(a => a.type === 'file') && <Paperclip size={14} />}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          </div>
        )}
      </div>

      {/* Preview Overlay */}
      {previewNote && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setPreviewNoteId(null)}
        >
          <div 
            className="w-[700px] max-w-[90vw] max-h-[85vh] overflow-y-auto rounded-3xl p-10 shadow-2xl bg-white border-2 border-gray-200 text-gray-900 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-6 right-6 flex items-center gap-3">
              <button
                onClick={() => {
                  setPreviewNoteId(null);
                  onNoteClick(previewNote);
                }}
                className="p-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl border border-indigo-200 transition-colors shadow-sm"
                title="Open in Editor"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setPreviewNoteId(null)} 
                className="p-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-500 transition-colors shadow-sm"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-4xl font-extrabold tracking-tight mb-8 pr-32">{previewNote.title || 'Untitled'}</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: previewNote.content || 'Start typing...' }} />
          </div>
        </div>
      )}
    </div>
  );
}
