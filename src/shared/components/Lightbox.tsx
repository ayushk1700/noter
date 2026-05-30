import React, { useEffect, useState } from 'react';
import { X, FileText, ZoomIn, ZoomOut, RotateCw, Download } from 'lucide-react';
import { Attachment, Note } from '@/shared/lib/types';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { BlockId } from '@/features/editor/tiptap/BlockIdExtension';
import { ColumnBlock, Column } from '@/features/editor/tiptap/ColumnExtension';
import EditorHeader from '@/features/editor/components/EditorHeader';

interface LightboxProps {
  attachment?: Attachment;
  note?: Note;
  onClose: () => void;
}

export default function Lightbox({ attachment, note, onClose }: LightboxProps) {
  const editor = useEditor({
    extensions: [BlockId, ColumnBlock, Column, StarterKit],
    content: note?.content,
    editable: false,
    editorProps: { attributes: { class: 'prose prose-lg focus:outline-none min-w-full max-w-none prose-invert text-neutral-300' } }
  });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setScale(s => Math.min(s + 0.25, 4));
      if (e.key === '-') setScale(s => Math.max(s - 0.25, 0.25));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    if (!attachment) return;
    const a = document.createElement('a');
    a.href = attachment?.data;
    a.download = attachment?.name;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-2xl flex items-center justify-center animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* ── Top control bar ── */}
      <div
        className="absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1
                   bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-full px-3 py-2 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* File name pill */}
        <span className="text-white/70 text-xs font-semibold px-3 max-w-[200px] truncate">
          {attachment?.name || note?.title}
        </span>

        <div className="w-px h-4 bg-white/15 mx-1" />

        {attachment?.type === 'image' && (
          <>
            <button
              onClick={() => setScale(s => Math.max(s - 0.25, 0.25))}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Zoom out ( - )"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-white/50 text-[10px] font-bold w-10 text-center tabular-nums">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => setScale(s => Math.min(s + 0.25, 4))}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Zoom in ( + )"
            >
              <ZoomIn size={14} />
            </button>
            <div className="w-px h-4 bg-white/15 mx-1" />
            <button
              onClick={() => setRotation(r => r + 90)}
              className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="Rotate"
            >
              <RotateCw size={14} />
            </button>
            <div className="w-px h-4 bg-white/15 mx-1" />
          </>
        )}

        <button
          onClick={handleDownload}
          className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="Download"
        >
          <Download size={14} />
        </button>

        <div className="w-px h-4 bg-white/15 mx-1" />

        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors"
          title="Close (Esc)"
        >
          <X size={14} />
        </button>
      </div>

      {/* ── Media area ── */}
      <div
        className="relative flex items-center justify-center w-full h-full px-8 pt-20 pb-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {note && (
          <div className="w-full max-w-4xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl pb-16 flex flex-col h-max mt-auto mb-auto animate-in zoom-in-95 duration-300">
             <div className="pointer-events-none">
               <EditorHeader note={note} onNoteChange={() => {}} themeMode="dark" />
             </div>
             <div className="px-12">
               <EditorContent editor={editor} />
             </div>
          </div>
        )}

        {attachment?.type === 'image' && (
          <div
            className="bg-white p-4 pb-14 rounded-none shadow-[0_25px_60px_rgba(0,0,0,0.35)] flex flex-col items-center max-w-[85vw] max-h-[80vh] relative select-none animate-in zoom-in-95 duration-300"
            style={{
              transform: `scale(${scale}) rotate(${rotation - 1.5}deg)`,
              transition: 'transform 0.25s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            {/* Top Tape overlay */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-28 h-6 bg-white/45 backdrop-blur-sm shadow-sm rotate-[3deg] z-10 pointer-events-none border border-white/10" />
            
            <img
              src={attachment?.data}
              alt={attachment?.name}
              className="max-w-full max-h-[60vh] object-contain bg-gray-50 border border-black/5"
              draggable={false}
            />
            {/* File name printed in the white margin at the bottom */}
            <div className="mt-4 md:mt-5 text-sm md:text-base font-extrabold text-slate-500 uppercase tracking-widest text-center truncate max-w-full px-4">
              {attachment?.name || 'Polaroid Image'}
            </div>
          </div>
        )}

        {attachment?.type === 'video' && (
          <video
            src={attachment?.data}
            controls
            autoPlay
            className="max-w-full max-h-full rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300 outline-none"
          />
        )}

        {attachment?.type === 'file' && (
          <div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-14
                       flex flex-col items-center justify-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300
                       min-w-[320px]"
          >
            <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-white/50 border border-white/10">
              <FileText size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1 truncate max-w-xs">{attachment?.name}</h3>
              <p className="text-white/40 text-sm font-medium">No rich preview for this file type</p>
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white/80 hover:text-white text-sm font-semibold transition-all"
            >
              <Download size={14} />
              Download
            </button>
          </div>
        )}

        {attachment?.type === 'audio' && (
          <div
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-14
                       flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95 duration-300
                       min-w-[340px]"
          >
            {/* Animated waveform decoration */}
            <div className="flex items-center gap-1 h-10">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-indigo-400/70 animate-pulse"
                  style={{
                    height: `${20 + Math.sin(i * 0.8) * 14}px`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ))}
            </div>
            <h3 className="text-lg font-bold text-white truncate max-w-xs">{attachment?.name}</h3>
            <audio controls src={attachment?.data} className="w-full max-w-[280px]" />
          </div>
        )}
      </div>
    </div>
  );
}
