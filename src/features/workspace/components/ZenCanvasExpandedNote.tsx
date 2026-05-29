import React from 'react';
import { ZenCanvasItem } from './ZenCanvas';

interface ZenCanvasExpandedNoteProps {
  activeNote: ZenCanvasItem;
}

export default function ZenCanvasExpandedNote({ activeNote }: ZenCanvasExpandedNoteProps) {
  return (
    <div className="flex flex-col min-h-full w-full h-full">
      {activeNote.data?.note?.coverImage && (
        <div 
          className="w-full h-64 md:h-80 bg-cover bg-center shrink-0 border-b border-black/10 md:rounded-t-[2.5rem]"
          style={{ 
            backgroundImage: `url(${activeNote.data.note.coverImage})`,
            backgroundPosition: `center ${activeNote.data.note.coverPositionY ?? 50}%`
          }}
        />
      )}
      <div className="p-12 md:p-16 flex-1 flex flex-col">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 tracking-tighter opacity-90 leading-tight">
          {activeNote.title}
        </h1>
        <div className="w-12 h-1 bg-current opacity-20 rounded-full mb-8 shrink-0" />
        
        {/* Content */}
        <div 
          className="text-lg md:text-xl leading-relaxed opacity-80 whitespace-pre-wrap font-serif mb-12"
          dangerouslySetInnerHTML={{ __html: activeNote.content || '' }} 
        />

        {/* Attachments (Sticky Notes) */}
        {activeNote.data?.note?.attachments && activeNote.data.note.attachments.length > 0 && (
          <div className="mt-auto pt-8 border-t border-black/10 shrink-0">
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-50 mb-6">Attachments</h3>
            <div className="flex flex-wrap gap-6">
              {activeNote.data.note.attachments.map((att: any, idx: number) => (
                att.type === 'image' ? (
                  <div 
                    key={att.id} 
                    className="w-32 h-32 md:w-48 md:h-48 bg-white p-2 md:p-3 shadow-xl rounded-sm border border-gray-200 transition-all duration-300 hover:scale-105 hover:-translate-y-2 hover:rotate-0 hover:z-10"
                    style={{ transform: `rotate(${(idx % 3 === 0) ? -4 : (idx % 2 === 0) ? 3 : -2}deg)` }}
                  >
                    <div className="w-full h-full bg-gray-100 overflow-hidden relative">
                      <img src={att.data} alt={att.name} className="w-full h-full object-cover" />
                      {/* Tape */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-8 h-3 bg-white/60 backdrop-blur-sm -rotate-3 rounded-sm shadow-sm" />
                    </div>
                  </div>
                ) : (
                  <div key={att.id} className="flex items-center gap-3 p-4 bg-black/5 rounded-2xl hover:bg-black/10 transition-colors cursor-pointer w-64 h-fit">
                    <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shadow-sm shrink-0">
                      <span className="opacity-60 text-[10px] font-black tracking-widest">{att.type ? att.type.substring(0, 3).toUpperCase() : 'FILE'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate opacity-80">{att.name}</p>
                      <p className="text-xs font-semibold opacity-50 capitalize">{att.type}</p>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
