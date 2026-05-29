import { ChevronLeft, CheckCircle, Trash2, MoreHorizontal, X, FileText, Maximize2, Image as ImageIcon, Video, Type, Paperclip, Moon, Sun, Settings2, Music, File } from 'lucide-react';
import { Note, Attachment } from '@/shared/lib/types';
import { useState, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { SlashCommand } from '@/features/editor/tiptap/SlashCommand';
import { PageExtension } from '@/features/editor/tiptap/PageExtension';
import { EmbedExtension } from '@/features/editor/tiptap/EmbedExtension';
import { ZoomableListItem } from '@/features/editor/tiptap/ZoomableListItem';
import Mention from '@tiptap/extension-mention';
import getSuggestionConfig from '@/features/editor/tiptap/mentionSuggestion';
import Lightbox from '@/shared/components/Lightbox';
import AttachmentNode from '@/features/workspace/components/AttachmentNode';
import GlobalNavbar from '@/shared/components/GlobalNavbar';
import EditorHeader from './EditorHeader';
import DragHandleOverlay from './DragHandleOverlay';
import { Column, ColumnBlock } from '@/features/editor/tiptap/ColumnExtension';
import { BlockId } from '@/features/editor/tiptap/BlockIdExtension';

interface EditorViewProps {
  note: Note;
  notes?: Note[];
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onTagsChange: (tags: string[]) => void;
  onNoteChange: (note: Note) => void;
  onBack: () => void;
  onDelete: () => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (attId: string) => void;
  imageInputRef: React.RefObject<HTMLInputElement | null>;
  videoInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onCreateSubPage: (title?: string, content?: string) => string;
  onOpenSubPage: (pageId: string) => void;
  onOpenNote: (noteId: string) => void;
  themeMode?: 'light' | 'dark';
  isChronoEnabled?: boolean;
  initialZenMode?: boolean;
  onToggleTheme?: () => void;
  onToggleChrono?: () => void;
}

export default function EditorView({
  note,
  notes = [],
  onTitleChange,
  onContentChange,
  onTagsChange,
  onNoteChange,
  onBack,
  onDelete,
  onImageUpload,
  onVideoUpload,
  onFileUpload,
  onRemoveAttachment,
  imageInputRef,
  videoInputRef,
  fileInputRef,
  onCreateSubPage,
  onOpenSubPage,
  onOpenNote,
  themeMode = 'light',
  isChronoEnabled = false,
  initialZenMode = false,
  onToggleTheme,
  onToggleChrono,
}: EditorViewProps) {
  const triggerInput = (ref: React.RefObject<HTMLInputElement | null>) => ref.current?.click();
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [zenMode, setZenMode] = useState(initialZenMode);
  const [isDragging, setIsDragging] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const [anchorPositions, setAnchorPositions] = useState<Record<string, number>>({});
  const editorScrollRef = useRef<HTMLDivElement>(null);

  // Close attach menu when clicking outside
  useEffect(() => {
    if (!showAttachMenu) return;
    const handler = (e: MouseEvent) => {
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAttachMenu]);

  const backlinks = notes.filter(n => 
    n.id !== note.id && 
    (n.content?.includes(`data-id="${note.id}"`) || n.connections?.includes(note.id) || n.parentId === note.id)
  );

  const editor = useEditor({
    extensions: [
      BlockId,
      ColumnBlock,
      Column,
      StarterKit.configure({
        listItem: false,
      }),
      ZoomableListItem.configure({
        onZoomBullet: (title, node) => {
          // Extract the HTML content of the sub-bullets if needed
          const content = ''; // We can leave it blank for now, or serialize `node` children
          const newPageId = onCreateSubPage(title, content);
          
          onOpenNote(newPageId); // Open it immediately!
          return newPageId;
        }
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      PageExtension.configure({
        onOpenPage: onOpenSubPage,
      }),
      SlashCommand,
      EmbedExtension.configure({
        notes,
        onNoteChange,
        onOpenNote,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded cursor-pointer hover:bg-indigo-200 transition-colors',
        },
        renderLabel({ options, node }) {
          return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
        },
        suggestion: {
          ...getSuggestionConfig(notes),
          char: '[[',
        } as any,
      }),
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-w-full text-gray-800 leading-relaxed max-w-none',
      },
    },
  });

  useEffect(() => {
    const updatePositions = () => {
       const newPositions: Record<string, number> = {};
       note.attachments?.forEach(att => {
         if (att.blockAnchorId) {
           const el = document.querySelector(`[data-block-id="${att.blockAnchorId}"]`) as HTMLElement;
           if (el && editorScrollRef.current) {
             const editorRect = editorScrollRef.current.getBoundingClientRect();
             const elRect = el.getBoundingClientRect();
             newPositions[att.id] = elRect.top - editorRect.top + editorScrollRef.current.scrollTop;
           }
         }
       });
       setAnchorPositions(newPositions);
    };
    
    updatePositions();
    const timer = setInterval(updatePositions, 1000);
    return () => clearInterval(timer);
  }, [note.attachments, note.content]);

  useEffect(() => {
    if (editor) {
      (editor.storage as any).pageCreation = {
        onCreatePage: () => {
          const newPageId = onCreateSubPage();
          editor.chain().focus().insertContent({
            type: 'pageBlock',
            attrs: { pageId: newPageId, title: 'Untitled Page' }
          }).run();
        }
      };
    }
  }, [editor, onCreateSubPage]);

  useEffect(() => {
    if (editor && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content, { emitUpdate: false });
    }
  }, [note.content, editor]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        let fileType: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) fileType = 'image';
        else if (file.type.startsWith('video/')) fileType = 'video';

        const newAttachment: Attachment = {
          id: Date.now().toString(),
          type: fileType,
          data: base64,
          name: file.name,
        };

        const updatedAttachments = [...(note.attachments || []), newAttachment];
        onNoteChange({ ...note, attachments: updatedAttachments });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className={`absolute inset-0 z-40 flex flex-col animate-in slide-in-from-bottom-4 duration-300 transition-colors ${
        zenMode 
          ? (themeMode === 'dark' ? 'bg-neutral-900' : 'bg-[#F9F8F6]') 
          : (themeMode === 'dark' ? 'bg-neutral-900/95 backdrop-blur-md' : 'bg-white/95 backdrop-blur-md')
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-4 z-50 bg-indigo-500/10 backdrop-blur-sm border-2 border-dashed border-indigo-400/60 rounded-[2rem]
                        flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-200">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center mb-4">
            <Paperclip size={32} className="text-indigo-500 animate-bounce" />
          </div>
          <h2 className="text-2xl font-extrabold text-indigo-700 tracking-tight">Drop to attach</h2>
          <p className="text-indigo-500/70 mt-1 text-sm font-medium">Instantly added to this note</p>
        </div>
      )}

      {/* Floating Exit Zen Mode Button */}
      {zenMode && (
        <div className="absolute top-6 right-8 z-50 animate-in fade-in slide-in-from-top-4">
          <button 
            onClick={() => setZenMode(false)}
            className="px-4 py-2 bg-white/80 hover:bg-white backdrop-blur-md text-gray-400 hover:text-gray-900 rounded-full shadow-sm hover:shadow-md transition-all text-xs font-bold tracking-widest uppercase border border-gray-100 focus:outline-none"
          >
            Exit Focus
          </button>
        </div>
      )}

      {/* Main Toolbar — floating dark pill */}
      {!zenMode && (
        <GlobalNavbar themeMode={themeMode} scrollContainerId="editor-scroll-container">
            {/* Back Button */}
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="w-px h-4 bg-white/15 mx-0.5" />

            {/* Last edited */}
            <span className="text-white/30 text-xs font-medium px-2 hidden md:block whitespace-nowrap">
              {note.date}
            </span>

            <div className="w-px h-4 bg-white/15 mx-0.5 hidden md:block" />

            {/* Focus mode */}
            <button
              onClick={() => setZenMode(true)}
              title="Focus Mode"
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-widest rounded-full
                         bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
            >
              Focus
            </button>

            <div className="w-px h-4 bg-white/15 mx-0.5" />

            {/* Type & Task icons */}
            <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
              <Type className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
              <CheckCircle className="w-4 h-4" />
            </button>

            <div className="w-px h-4 bg-white/15 mx-0.5" />

            {/* Attach */}
            <div className="relative" ref={attachMenuRef}>
              <button
                onClick={() => setShowAttachMenu(prev => !prev)}
                title="Attach"
                className={`p-2 rounded-full transition-all
                  ${showAttachMenu
                    ? 'bg-[#FF7D54]/80 text-white'
                    : 'hover:bg-white/10 text-white/40 hover:text-white/80'
                  }`}
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {showAttachMenu && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50
                                bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2
                                min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white/30 px-3 pt-1 pb-2">Attach</p>
                  {[
                    { label: 'Image',  icon: ImageIcon, color: 'text-blue-400',   action: () => triggerInput(imageInputRef) },
                    { label: 'Video',  icon: Video,     color: 'text-purple-400', action: () => triggerInput(videoInputRef) },
                    { label: 'File',   icon: File,      color: 'text-green-400',  action: () => triggerInput(fileInputRef)  },
                  ].map(({ label, icon: Icon, color, action }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setShowAttachMenu(false); }}
                      className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium"
                    >
                      <Icon className={`w-4 h-4 ${color}`} />
                      {label}
                    </button>
                  ))}
                  <div className="h-px bg-white/10 mx-2 my-1" />
                  <button
                    onClick={() => {
                      setShowAttachMenu(false);
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'audio/*';
                      input.onchange = (ev) => {
                        const file = (ev.target as HTMLInputElement).files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const att: Attachment = {
                            id: Date.now().toString(),
                            type: 'audio',
                            data: reader.result as string,
                            name: file.name,
                          };
                          onNoteChange({ ...note, attachments: [...(note.attachments || []), att] });
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium"
                  >
                    <Music className="w-4 h-4 text-indigo-400" />
                    Audio
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-4 bg-white/15 mx-0.5" />

            {/* Delete */}
            <button
              onClick={onDelete}
              className="p-2 rounded-full hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* More */}
            <button className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
        </GlobalNavbar>
      )}
      
      {/* Editor Main Content Area */} 
      <div id="editor-scroll-container" ref={editorScrollRef} className="flex-1 overflow-y-auto flex flex-col w-full relative pb-32">
        <EditorHeader note={note} onNoteChange={onNoteChange} themeMode={themeMode} />

        <div className="max-w-[900px] w-full mx-auto px-8 md:px-12 relative">
          <DragHandleOverlay editor={editor} />

          {/* Render Block-Anchored Attachments (Margin Bleed) */}
          {note.attachments?.map(att => {
             if (!att.blockAnchorId) return null;
             const top = anchorPositions[att.id] ?? 0;
             return (
               <div 
                 key={`anchor-${att.id}`}
                 className="absolute transition-all duration-300"
                 style={{ 
                   top: top + 'px', 
                   left: 'calc(100% + 2rem)', // Bleed into right margin
                   zIndex: att.zIndex || 10
                 }}
               >
                  <AttachmentNode 
                     data={{ 
                       attachment: att, 
                       onPreview: setPreviewAttachment, 
                       onRemove: onRemoveAttachment 
                     }} 
                  />
                  <button 
                     onClick={() => onNoteChange({ ...note, attachments: note.attachments!.map(a => a.id === att.id ? { ...a, zIndex: a.zIndex === -1 ? 10 : -1 } : a) })}
                     className="absolute -top-4 -right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-xl opacity-0 hover:opacity-100 transition-opacity"
                  >
                     {att.zIndex === -1 ? 'Bring to Front' : 'Push to Back'}
                  </button>
               </div>
             )
          })}

          <div className={`flex-1 min-h-[400px] prose prose-lg max-w-none focus:outline-none ${themeMode === 'dark' ? 'prose-invert text-neutral-300' : 'text-gray-800'}`}>
            <EditorContent editor={editor} />
          </div>

        {note.attachments && note.attachments.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-6">Attachments</h3>
            <div className="flex flex-wrap gap-6">
              {note.attachments.map(att => (
                <div 
                  key={att.id} 
                  onClick={() => setPreviewAttachment(att)}
                  className={`relative group rounded-[1.5rem] border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 w-32 h-32 sm:w-56 sm:h-56 cursor-pointer hover:scale-[1.02] ${themeMode === 'dark' ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-100'}`}
                >
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                      <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 drop-shadow-md" />
                  </div>
                  {att.type === 'image' && <img src={att.data} alt={att.name} className="w-full h-full object-cover" />}
                  {att.type === 'video' && <video src={att.data} className="w-full h-full object-cover" />}
                  {att.type === 'file' && (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-4 ${themeMode === 'dark' ? 'bg-neutral-900 text-neutral-400' : 'bg-gray-50/50 text-gray-600'}`}>
                      <FileText size={40} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                      <span className="text-sm font-semibold truncate w-full px-6 text-center text-gray-500" title={att.name}>{att.name}</span>
                    </div>
                  )}
                  {att.type === 'audio' && (
                    <div className={`w-full h-full flex flex-col items-center justify-center gap-4 px-4 ${themeMode === 'dark' ? 'bg-neutral-900 text-neutral-400' : 'bg-indigo-50/50 text-indigo-600'}`}>
                      <audio controls src={att.data} className="w-full max-w-[150px] scale-90" onClick={e => e.stopPropagation()} />
                      <span className="text-sm font-semibold truncate w-full px-4 text-center text-indigo-500" title={att.name}>{att.name}</span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemoveAttachment(att.id); }}
                    className="absolute top-3 right-3 bg-white/90 text-red-500 rounded-full p-2 opacity-0 group-hover:opacity-100 shadow-md hover:bg-red-50 hover:text-red-600 transition-all z-20"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backlinks Section */}
        {backlinks.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-100 dark:border-neutral-800">
            <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-6 flex items-center gap-2">
              <FileText size={16} /> Linked Mentions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {backlinks.map(bl => (
                <div 
                  key={bl.id}
                  onClick={() => onOpenNote(bl.id)}
                  className={`p-4 rounded-xl border cursor-pointer hover:border-indigo-400 transition-colors ${themeMode === 'dark' ? 'bg-neutral-800/50 border-neutral-700' : 'bg-white border-gray-200'}`}
                >
                  <p className={`font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{bl.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {previewAttachment && (
        <Lightbox attachment={previewAttachment} onClose={() => setPreviewAttachment(null)} />
      )}

      <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={onImageUpload} />
      <input type="file" accept="video/*" className="hidden" ref={videoInputRef} onChange={onVideoUpload} />
      <input type="file" className="hidden" ref={fileInputRef} onChange={onFileUpload} />
    </div>
  );
}
