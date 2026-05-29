import React, { useState, useRef, useEffect } from 'react';
import { Note } from '@/shared/lib/types';
import { Image as ImageIcon, Smile, ChevronDown, ChevronRight, Calendar, Tag, Activity } from 'lucide-react';

interface EditorHeaderProps {
  note: Note;
  onNoteChange: (updated: Note) => void;
  themeMode: 'light' | 'dark';
}

export default function EditorHeader({ note, onNoteChange, themeMode }: EditorHeaderProps) {
  const [isDraggingCover, setIsDraggingCover] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startPos, setStartPos] = useState(0);
  const [showFrontmatter, setShowFrontmatter] = useState(false);
  
  const coverRef = useRef<HTMLDivElement>(null);

  const coverPosition = note.coverPositionY ?? 50;

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDraggingCover(true);
    setStartY(e.clientY);
    setStartPos(coverPosition);
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingCover || !coverRef.current) return;
      const deltaY = e.clientY - startY;
      const height = coverRef.current.offsetHeight;
      const percentageDelta = (deltaY / height) * 100;
      let newPos = startPos - percentageDelta;
      if (newPos < 0) newPos = 0;
      if (newPos > 100) newPos = 100;
      onNoteChange({ ...note, coverPositionY: newPos });
    };

    const handleMouseUp = () => {
      if (isDraggingCover) {
        setIsDraggingCover(false);
        document.body.style.userSelect = '';
      }
    };

    if (isDraggingCover) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingCover, startY, startPos, note, onNoteChange]);

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onNoteChange({ ...note, coverImage: reader.result as string, coverPositionY: 50 });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full relative flex flex-col group mb-8 animate-in fade-in duration-500">
      {/* Cover Image */}
      {note.coverImage ? (
        <div 
          ref={coverRef}
          className="w-full h-64 relative group/cover cursor-ns-resize overflow-hidden"
          onMouseDown={handleDragStart}
        >
          <img 
            src={note.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover pointer-events-none"
            style={{ objectPosition: `50% ${coverPosition}%` }}
          />
          {isDraggingCover && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none transition-all">
              <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
                Drag to reposition
              </span>
            </div>
          )}
          {/* Controls */}
          <div className="absolute top-4 right-4 opacity-0 group-hover/cover:opacity-100 transition-opacity flex gap-2">
            <label className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer backdrop-blur-md transition-colors flex items-center gap-1.5">
              <ImageIcon size={14} />
              Change Cover
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
            </label>
            <button 
              onClick={() => onNoteChange({ ...note, coverImage: undefined })}
              className="bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full pt-12 px-12 transition-opacity duration-300 max-w-[900px] mx-auto flex items-center gap-4">
           <label className="text-sm font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer flex items-center gap-2 w-max transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800">
              <ImageIcon size={16} />
              Add Cover
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
           </label>
        </div>
      )}

      <div className={`px-12 max-w-[900px] mx-auto w-full relative ${note.coverImage ? '-mt-12' : 'mt-4'}`}>
        {/* Floating Icon */}
        <div className="relative group/icon mb-4 w-max">
          {note.icon ? (
            <div className="text-[72px] leading-none relative z-10 w-max cursor-pointer hover:bg-gray-100/50 dark:hover:bg-neutral-800/50 rounded-xl transition-colors select-none">
              {note.icon}
              <button 
                 onClick={() => onNoteChange({ ...note, icon: undefined })}
                 className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover/icon:opacity-100 text-[10px] shadow-lg"
              >
                ✕
              </button>
            </div>
          ) : (
             <div className={`transition-opacity duration-300 ${note.coverImage ? 'absolute -top-8' : ''}`}>
               <button 
                 onClick={() => onNoteChange({ ...note, icon: '📄' })}
                 className="text-sm font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-2 transition-colors px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
               >
                 <Smile size={16} />
                 Add Icon
               </button>
             </div>
          )}
        </div>

        {/* Title Block */}
        <input
          type="text"
          value={note.title}
          onChange={(e) => onNoteChange({ ...note, title: e.target.value })}
          placeholder="Untitled"
          className={`w-full text-5xl font-extrabold bg-transparent outline-none border-none placeholder-gray-300 dark:placeholder-gray-700 resize-none ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}
        />

        {/* Frontmatter Toggle */}
        <div className="mt-6 border-b border-gray-100 dark:border-neutral-800 pb-4">
          <button 
            onClick={() => setShowFrontmatter(!showFrontmatter)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors uppercase tracking-widest"
          >
            {showFrontmatter ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Properties
          </button>
          
          {showFrontmatter && (
            <div className="mt-4 grid grid-cols-[120px_1fr] gap-y-3 text-sm animate-in fade-in slide-in-from-top-2">
               <div className="flex items-center gap-2 text-gray-400">
                 <Calendar size={14} /> Date
               </div>
               <div className={themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{note.date}</div>

               <div className="flex items-center gap-2 text-gray-400">
                 <Tag size={14} /> Tags
               </div>
               <div className="flex gap-2 flex-wrap">
                 {note.tags.map(t => (
                   <span key={t} className="px-2 py-0.5 bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md text-xs font-medium text-gray-600 dark:text-gray-300 shadow-sm">{t}</span>
                 ))}
                 <button className="px-2 py-0.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md text-xs transition-colors border border-transparent">+ Add Tag</button>
               </div>

               <div className="flex items-center gap-2 text-gray-400">
                 <Activity size={14} /> Status
               </div>
               <div>
                 <select 
                   value={note.status || 'Draft'}
                   onChange={(e) => onNoteChange({ ...note, status: e.target.value as any })}
                   className={`bg-transparent text-sm font-medium outline-none cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -ml-1 py-0.5 transition-colors ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}
                 >
                   <option className="bg-white dark:bg-neutral-900">Draft</option>
                   <option className="bg-white dark:bg-neutral-900">In Progress</option>
                   <option className="bg-white dark:bg-neutral-900">Completed</option>
                 </select>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
