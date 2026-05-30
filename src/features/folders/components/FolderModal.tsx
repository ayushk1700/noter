import { X } from 'lucide-react';

interface FolderModalProps {
  isOpen: boolean;
  newFolderName: string;
  onNameChange: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export default function FolderModal({
  isOpen,
  newFolderName,
  onNameChange,
  onCreate,
  onClose,
}: FolderModalProps) {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onCreate();
  };

  return (
    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-in fade-in">
      <div className="bg-white p-8 w-full max-w-md rounded-3xl shadow-2xl relative border border-gray-100 animate-origami-unfold origin-top [transform-style:preserve-3d]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-200 p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-2xl font-bold mb-6 text-gray-900">New Folder</h3>
        <input 
          type="text" 
          autoFocus
          value={newFolderName}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="E.g., Design Inspiration" 
          className="w-full bg-transparent border-b-2 border-gray-200 focus:border-gray-900 outline-none pb-3 mb-8 text-lg transition-colors"
        />
        <div className="flex space-x-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onCreate}
            className="flex-1 bg-gray-900 text-white py-3 font-semibold rounded-xl hover:bg-black transition-colors"
          >
            Create Folder
          </button>
        </div>
      </div>
    </div>
  );
}
