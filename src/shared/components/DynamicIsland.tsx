import React, { useState, useEffect, useRef } from 'react';
import { Plus, Mic, Maximize2, FileText, ChevronRight, CheckCircle2, AlertCircle, ImageIcon, Video } from 'lucide-react';
import { Toast } from '@/shared/lib/types';
import { useVoiceRecorder } from '@/features/editor/hooks/useVoiceRecorder';

interface DynamicIslandProps {
  toast: Toast | null;
  onCloseToast: () => void;
  onNewNote: () => void;
  onVoiceNote: (blob: Blob, durationMs: number) => void;
  onMediaNote?: (type: 'image' | 'video', file: File) => void;
  onZoomToggle?: () => void;
  themeMode: 'light' | 'dark';
  isVisible?: boolean; // If false, hide the island (e.g. maybe in Editor we hide the FAB but show toasts)
}

export default function DynamicIsland({
  toast,
  onCloseToast,
  onNewNote,
  onVoiceNote,
  onMediaNote,
  onZoomToggle,
  themeMode,
  isVisible = true
}: DynamicIslandProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVoiceRipple, setShowVoiceRipple] = useState(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { recordingState, durationMs, startRecording, stopRecording } = useVoiceRecorder(
    (blob: Blob, dur: number) => {
      onVoiceNote(blob, dur);
    }
  );

  // Auto-collapse expanded FAB state when toast arrives
  useEffect(() => {
    if (toast) {
      setIsExpanded(false);
    }
  }, [toast]);

  // Click outside to collapse
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#dynamic-island-container')) {
        setIsExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const handlePlusMouseDown = () => {
    setShowVoiceRipple(false);
    holdTimerRef.current = setTimeout(() => {
      setShowVoiceRipple(true);
      startRecording();
    }, 500);
  };

  const handlePlusMouseUp = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (recordingState === 'recording') {
      stopRecording();
      setIsExpanded(false);
    } else if (recordingState === 'idle') {
      // Just a click, not a hold -> collapse or open note directly?
      // User says: "on click is shows the lements like new notes, voice recordeing, zoom"
      // Wait, if clicking it opens the menu, then they click the menu items.
    }
    setShowVoiceRipple(false);
  };

  const handlePlusTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePlusMouseDown();
  };

  const handlePlusTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    handlePlusMouseUp();
  };

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const isDark = themeMode === 'dark';

  // Determine the current state of the island
  const mode = toast ? 'toast' : (isExpanded ? 'expanded' : 'idle');

  // If completely hidden and no toast, render nothing (useful for splash screen)
  if (!isVisible && !toast) return null;

  return (
    <div id="dynamic-island-container" className="fixed bottom-8 right-8 z-[200] flex flex-col items-end pointer-events-none">
      
      {/* Voice Recording HUD (Floats above the island when recording) */}
      {recordingState !== 'idle' && (
        <div className="mb-4 pointer-events-auto flex items-center gap-3 bg-red-500 text-white px-5 py-2.5 rounded-full shadow-lg shadow-red-500/20 animate-in slide-in-from-bottom-2">
           <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
           <span className="font-bold tabular-nums tracking-wide">{formatDuration(durationMs)}</span>
           <span className="text-white/80 text-sm ml-2">{recordingState === 'recording' ? 'Release to save' : 'Processing...'}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={imageInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files[0] && onMediaNote) {
            onMediaNote('image', e.target.files[0]);
            setIsExpanded(false);
          }
          e.target.value = '';
        }} 
      />
      <input 
        type="file" 
        accept="video/*" 
        className="hidden" 
        ref={videoInputRef} 
        onChange={(e) => {
          if (e.target.files && e.target.files[0] && onMediaNote) {
            onMediaNote('video', e.target.files[0]);
            setIsExpanded(false);
          }
          e.target.value = '';
        }} 
      />

      {/* EXPANDED MENU OPTIONS (Floating above the main ball) */}
      <div className={`absolute bottom-20 right-1 flex flex-col gap-4 items-center transition-all duration-300 ease-out ${mode === 'expanded' ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-75 translate-y-8 pointer-events-none'}`}>
        
        <button 
          onClick={(e) => { e.stopPropagation(); onNewNote(); setIsExpanded(false); }}
          className="w-12 h-12 rounded-full bg-[#FF7D54] hover:bg-[#ff9170] transition-transform hover:scale-110 shadow-xl flex items-center justify-center text-white"
          title="New Note"
        >
          <FileText className="w-5 h-5" />
        </button>

        {onMediaNote && (
          <button 
            onClick={(e) => { e.stopPropagation(); imageInputRef.current?.click(); }}
            className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-xl flex items-center justify-center text-white/90 hover:text-white ${isDark ? 'bg-neutral-800' : 'bg-[#2A2A2A]'}`}
            title="Add Image Note"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
        )}

        {onMediaNote && (
          <button 
            onClick={(e) => { e.stopPropagation(); videoInputRef.current?.click(); }}
            className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-xl flex items-center justify-center text-white/90 hover:text-white ${isDark ? 'bg-neutral-800' : 'bg-[#2A2A2A]'}`}
            title="Add Video Note"
          >
            <Video className="w-5 h-5" />
          </button>
        )}

        <button 
          onMouseDown={(e) => { e.stopPropagation(); handlePlusMouseDown(); }}
          onMouseUp={(e) => { e.stopPropagation(); handlePlusMouseUp(); }}
          onMouseLeave={(e) => { e.stopPropagation(); if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null; } }}
          onTouchStart={handlePlusTouchStart}
          onTouchEnd={handlePlusTouchEnd}
          className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-xl flex items-center justify-center text-white/90 hover:text-white ${isDark ? 'bg-neutral-800' : 'bg-[#2A2A2A]'}`}
          title="Hold to Record Voice"
        >
          <Mic className="w-5 h-5" />
        </button>

        {onZoomToggle && (
          <button 
            onClick={(e) => { e.stopPropagation(); onZoomToggle(); setIsExpanded(false); }}
            className={`w-12 h-12 rounded-full transition-transform hover:scale-110 shadow-xl flex items-center justify-center text-white/90 hover:text-white ${isDark ? 'bg-neutral-800' : 'bg-[#2A2A2A]'}`}
            title="Toggle Zoom / View"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* MAIN DYNAMIC ISLAND / TOAST / FAB */}
      <div 
        id="dynamic-island"
        onClick={() => {
          if (mode === 'idle') setIsExpanded(true);
          else if (mode === 'expanded') setIsExpanded(false);
        }}
        className={`pointer-events-auto overflow-hidden transition-all duration-500 ease-out border shadow-2xl backdrop-blur-2xl flex items-center justify-center cursor-pointer group
          ${isDark ? 'bg-neutral-900/90 border-white/10 shadow-black/50 text-white' : 'bg-[#1C1C1C] border-[#2C2C2C] shadow-gray-400/50 text-white'}
          ${mode === 'toast' 
            ? 'h-14 px-5 rounded-[1.75rem] scale-100 min-w-[300px] w-auto' 
            : 'h-14 w-14 rounded-full scale-100 hover:scale-105 hover:bg-[#2A2A2A]'
          }
        `}
      >
        <div className="relative flex items-center justify-center w-full h-full">
          
          {/* TOAST CONTENT */}
          <div className={`absolute flex items-center justify-between w-full transition-all duration-500 ${mode === 'toast' ? 'opacity-100 scale-100 delay-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
             {toast && (
               <>
                 <div className="flex items-center gap-3">
                   {toast.type === 'success' ? (
                     <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                   ) : (
                     <AlertCircle className="w-5 h-5 text-red-400" />
                   )}
                   <span className="text-sm font-medium text-white line-clamp-1 pr-4">{toast.message}</span>
                 </div>
                 
                 {toast.actionText && toast.onAction && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); toast.onAction!(); onCloseToast(); }}
                     className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-xs font-bold text-white uppercase tracking-wider"
                   >
                     {toast.actionText}
                     <ChevronRight className="w-3 h-3" />
                   </button>
                 )}
               </>
             )}
          </div>

          {/* IDLE / EXPANDED FAB ICON */}
          <div className={`absolute transition-all duration-500 ${mode === 'toast' ? 'opacity-0 scale-50 pointer-events-none' : 'opacity-100 scale-100 delay-100'}`}>
             <div className="flex items-center justify-center w-full h-full">
                <Plus className={`w-6 h-6 text-white/80 group-hover:text-white transition-all duration-300 ease-spring ${mode === 'expanded' ? 'rotate-45' : ''}`} />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
