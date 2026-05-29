import { ChevronLeft, Search, Plus, FileText, ImageIcon, Video, Paperclip } from 'lucide-react';
import { Note } from '@/shared/lib/types';

interface Folder {
  id: string;
  name: string;
  color: string;
}

interface FolderDetailViewProps {
  folder: Folder | undefined;
  notes: Note[];
  onNoteClick: (note: Note) => void;
  onBackToFolders: () => void;
  onNewNote: () => void;
}

export default function FolderDetailView({
  folder,
  notes,
  onNoteClick,
  onBackToFolders,
  onNewNote,
}: FolderDetailViewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-[#F4F3F0]/65 backdrop-blur-md animate-in slide-in-from-right-8 duration-300 relative z-10">
      <div className="flex justify-between items-center p-8 md:px-12 md:py-8 border-b border-gray-300/40 bg-[#F4F3F0]/30 sticky top-0 z-10">
        <div className="flex items-center space-x-6">
          <button onClick={onBackToFolders} className="p-3 bg-white rounded-full shadow-sm hover:shadow-md transition-all text-gray-600 hover:text-black">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-semibold text-gray-900">
            {folder?.name || 'Folder'}
          </h2>
        </div>
        <div className="flex space-x-4 text-gray-600 bg-white px-4 py-3 rounded-full shadow-sm border border-gray-200">
          <Search className="w-5 h-5 cursor-pointer hover:text-black" />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 md:p-16 pb-40">
        <div className="max-w-7xl mx-auto">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
              <FileText className="w-20 h-20 mb-8 text-gray-300" />
              <p className="text-xl font-medium tracking-wide">No notes in this workspace.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10 auto-rows-max">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  onClick={() => onNoteClick(note)}
                  className="clay-card p-8 cursor-pointer group flex flex-col min-h-[260px] relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="font-extrabold text-2xl text-gray-900 line-clamp-2 pr-2 leading-tight tracking-tight">{note.title || 'Untitled'}</h3>
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
          )}
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-30">
        <button 
          onClick={onNewNote}
          className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-black hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
          title="New Note"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
