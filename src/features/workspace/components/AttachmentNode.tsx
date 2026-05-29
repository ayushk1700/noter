import { Attachment } from '@/shared/lib/types';
import { Maximize2, X, FileText, Music } from 'lucide-react';

interface AttachmentNodeProps {
  data: {
    attachment: Attachment;
    onPreview: (att: Attachment) => void;
    onRemove: (id: string) => void;
  };
}

export default function AttachmentNode({ data }: AttachmentNodeProps) {
  const { attachment, onPreview, onRemove } = data;

  return (
    <div
      onClick={() => onPreview(attachment)}
      className="relative group overflow-hidden w-60 h-60 cursor-pointer rounded-[1.5rem] border-2 border-gray-200/60
                 shadow-md hover:shadow-xl hover:-translate-y-0.5 hover:border-gray-300/80
                 transition-all duration-300 ease-out bg-white/90 backdrop-blur-md"
    >
      {/* Hover overlay with zoom icon */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors z-10
                      flex items-center justify-center rounded-[1.5rem]">
        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30
                        flex items-center justify-center opacity-0 group-hover:opacity-100
                        scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl">
          <Maximize2 className="text-white w-5 h-5" />
        </div>
      </div>

      {/* Media content */}
      {attachment.type === 'image' && (
        <img src={attachment.data} alt={attachment.name} className="w-full h-full object-cover" />
      )}
      {attachment.type === 'video' && (
        <video src={attachment.data} className="w-full h-full object-cover" />
      )}
      {attachment.type === 'file' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gray-50/80 px-4">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
            <FileText size={28} className="text-gray-400" />
          </div>
          <span className="text-xs font-semibold truncate w-full text-center text-gray-500 px-4" title={attachment.name}>
            {attachment.name}
          </span>
        </div>
      )}
      {attachment.type === 'audio' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-indigo-50/60 px-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
            <Music size={24} className="text-indigo-400" />
          </div>
          <span className="text-xs font-semibold truncate w-full text-center text-indigo-500 px-4" title={attachment.name}>
            {attachment.name}
          </span>
          <audio controls src={attachment.data} className="w-full max-w-[160px] scale-90" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Remove button — dark pill style matching NoteNode bubble */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(attachment.id); }}
        className="absolute top-3 right-3 w-7 h-7 bg-gray-900/80 backdrop-blur-md text-white/70 rounded-full
                   flex items-center justify-center opacity-0 group-hover:opacity-100
                   hover:bg-red-500/90 hover:text-white shadow-lg
                   transition-all duration-200 z-20"
        title="Remove"
      >
        <X size={13} />
      </button>

      {/* Bottom filename pill */}
      <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="bg-gray-900/70 backdrop-blur-md rounded-full px-3 py-1.5 text-center">
          <span className="text-white/80 text-[10px] font-semibold truncate block">{attachment.name}</span>
        </div>
      </div>
    </div>
  );
}
