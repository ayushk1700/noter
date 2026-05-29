import { UploadCloud } from 'lucide-react';

interface DragDropOverlayProps {
  isDragging: boolean;
}

export default function DragDropOverlay({ isDragging }: DragDropOverlayProps) {
  if (!isDragging) return null;

  return (
    <div className="absolute inset-0 bg-[#F9F8F6]/85 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50 animate-in fade-in duration-200 border-4 border-dashed border-gray-900/10 m-4 rounded-[2.5rem]">
      <div className="flex flex-col items-center max-w-md text-center space-y-4">
        <div className="w-20 h-20 bg-gray-950 text-white rounded-full flex items-center justify-center shadow-2xl animate-bounce">
          <UploadCloud className="w-10 h-10" />
        </div>
        <h3 className="text-3xl font-extrabold tracking-tight">Drop your assets here</h3>
        <p className="text-gray-500 font-medium leading-relaxed">
          Instantly create a beautiful note with your image, video, or PDF file attached.
        </p>
      </div>
    </div>
  );
}
