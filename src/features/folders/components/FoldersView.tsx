import { ChevronRight, Plus, CalendarIcon } from 'lucide-react';

interface Folder {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface FoldersViewProps {
  folders: Folder[];
  onFolderClick: (folderId: string) => void;
  onNewFolder: () => void;
  onCalendar: () => void;
  onBackToSplash: () => void;
}

export default function FoldersView({
  folders,
  onFolderClick,
  onNewFolder,
  onCalendar,
  onBackToSplash,
}: FoldersViewProps) {
  return (
    <div className="flex flex-col w-full h-full bg-[#EBE9E4]/60 animate-in fade-in zoom-in-95 duration-300 relative z-10">
      <div className="flex justify-between items-center p-8 md:px-12 md:py-8 border-b border-gray-300/40 bg-[#EBE9E4]/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBackToSplash}
            className="text-gray-500 hover:text-black font-semibold text-sm tracking-wider uppercase transition-colors"
          >
            ← Splash
          </button>
          <span className="text-gray-300 font-light text-xl">|</span>
          <h2 className="text-3xl font-extrabold tracking-tight">Fokus.</h2>
        </div>
        <div className="flex items-center space-x-6">
          <button onClick={onCalendar} title="Open Calendar" className="text-gray-600 hover:text-black transition-all p-3 hover:bg-white/70 rounded-full shadow-sm">
            <CalendarIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 pb-40">
        <div className="max-w-7xl mx-auto">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-10 px-4">Your Folders</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-10">
            {folders.map(folder => (
              <div 
                key={folder.id} 
                onClick={() => onFolderClick(folder.id)}
                className="bg-white/90 backdrop-blur-sm border border-gray-100 rounded-[2rem] p-8 h-48 cursor-pointer shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-300 ease-out group flex flex-col justify-between sticky-peel"
              >
                <div className="flex justify-between items-start">
                  <span className="font-extrabold text-2xl text-gray-900 tracking-tight">{folder.name}</span>
                  <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-gray-900 transition-colors opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                </div>
                <div className="flex items-center text-gray-500 font-semibold tracking-wide">
                  <span className="bg-gray-100/80 px-4 py-2 rounded-full">📄 {folder.count} Notes</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-30">
        <button 
          onClick={onNewFolder}
          className="w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-black hover:scale-105 transition-all focus:outline-none focus:ring-4 focus:ring-gray-300"
          title="New Folder"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
