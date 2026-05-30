'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, FileText, RotateCcw, Trash2, Archive, Pin, Plus,
  ChevronDown, LayoutGrid, Clock, Sparkles
} from 'lucide-react';
import { useNotesStore } from '@/shared/store/useNotesStore';
import { Note } from '@/shared/lib/types';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNote: (note: Note) => void;
  themeMode?: 'light' | 'dark';
}

type Section = 'active' | 'archive' | 'trash';

export default function RightPanel({
  isOpen,
  onClose,
  onOpenNote,
  themeMode = 'light',
}: RightPanelProps) {
  const {
    notes,
    activeNoteId,
    restoreNote,
    permanentlyDeleteNote,
    archiveNote,
    duplicateNote,
    setActiveNoteId,
  } = useNotesStore();

  const [openSection, setOpenSection] = useState<Section>('active');
  const panelRef = useRef<HTMLDivElement>(null);
  const isDark = themeMode === 'dark';

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const stripHtml = (html: string) =>
    (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const formatRelTime = (ts: number) => {
    const d = Date.now() - ts;
    const m = Math.floor(d / 60000);
    const h = Math.floor(d / 3600000);
    const days = Math.floor(d / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    if (days === 1) return 'yesterday';
    return `${days}d ago`;
  };

  const activeNotes = notes.filter(n => !n.isDeleted && !n.isArchived)
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });

  const archivedNotes = notes.filter(n => !n.isDeleted && n.isArchived)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const trashedNotes = notes.filter(n => n.isDeleted)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  const handleOpenNote = (note: Note) => {
    setActiveNoteId(note.id);
    onOpenNote(note);
    onClose();
  };

  const SectionHeader = ({
    id,
    label,
    count,
    icon: Icon,
    accent,
  }: {
    id: Section;
    label: string;
    count: number;
    icon: React.ElementType;
    accent: string;
  }) => (
    <button
      onClick={() => setOpenSection(id)}
      className={`w-full flex items-center gap-2 px-4 py-3 text-left transition-all select-none ${
        openSection === id
          ? isDark ? 'bg-neutral-800/60' : 'bg-white/80'
          : isDark ? 'hover:bg-neutral-800/30' : 'hover:bg-white/40'
      }`}
    >
      <Icon size={13} className={accent} />
      <span className={`text-xs font-bold tracking-wide flex-1 ${isDark ? 'text-neutral-200' : 'text-gray-700'}`}>
        {label}
      </span>
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
        openSection === id
          ? 'bg-indigo-500/20 text-indigo-400'
          : isDark ? 'bg-neutral-700 text-neutral-500' : 'bg-gray-100 text-gray-400'
      }`}>
        {count}
      </span>
      <ChevronDown
        size={12}
        className={`transition-transform duration-200 ${isDark ? 'text-neutral-500' : 'text-gray-400'} ${openSection === id ? 'rotate-0' : '-rotate-90'}`}
      />
    </button>
  );

  const NoteRow = ({
    note,
    isTrashed = false,
    isArchived = false,
  }: {
    note: Note;
    isTrashed?: boolean;
    isArchived?: boolean;
  }) => {
    const isActive = activeNoteId === note.id;
    const hasColor = note.color && note.color !== '#ffffff' && note.color !== 'transparent';

    return (
      <div
        className={`group px-3 py-2.5 mx-2 mb-1 rounded-xl transition-all cursor-pointer border ${
          isActive && !isTrashed
            ? isDark
              ? 'bg-neutral-700/80 border-indigo-500/30'
              : 'bg-indigo-50 border-indigo-200/60'
            : isDark
              ? 'bg-transparent border-transparent hover:bg-neutral-800/50 hover:border-neutral-700/50'
              : 'bg-transparent border-transparent hover:bg-white/70 hover:border-gray-100'
        }`}
        onClick={() => !isTrashed && handleOpenNote(note)}
        style={hasColor ? { borderLeftWidth: 3, borderLeftColor: note.color } : {}}
      >
        <div className="flex items-start gap-2">
          {/* Icon */}
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
            style={{
              background: hasColor ? note.color + '22' : (isDark ? '#2a2a2a' : '#f4f4f5'),
              border: `1px solid ${hasColor ? note.color + '44' : (isDark ? '#333' : '#e4e4e7')}`,
            }}
          >
            <FileText size={11} style={{ color: hasColor ? note.color! : (isDark ? '#737373' : '#a1a1aa') }} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {note.isPinned && <Pin size={9} className="text-[#FF7D54] shrink-0" />}
              <p className={`text-xs font-semibold truncate ${isDark ? 'text-neutral-100' : 'text-gray-800'}`}>
                {note.title || 'Untitled'}
              </p>
            </div>
            <p className={`text-[10px] line-clamp-1 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
              {stripHtml(note.content) || 'Empty note'}
            </p>
          </div>

          {/* Time */}
          <span className={`text-[9px] shrink-0 mt-0.5 ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
            {formatRelTime(note.updatedAt)}
          </span>
        </div>

        {/* Trashed actions */}
        {isTrashed && (
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={e => { e.stopPropagation(); restoreNote(note.id); }}
              title="Restore"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all text-[9px] font-bold"
            >
              <RotateCcw size={9} /> Restore
            </button>
            <button
              onClick={e => { e.stopPropagation(); permanentlyDeleteNote(note.id); }}
              title="Delete permanently"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[9px] font-bold"
            >
              <Trash2 size={9} /> Delete
            </button>
          </div>
        )}

        {/* Archived actions */}
        {isArchived && (
          <div className="flex gap-2 mt-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); archiveNote(note.id); }}
              title="Unarchive"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500 hover:text-white transition-all text-[9px] font-bold"
            >
              <Archive size={9} /> Unarchive
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[149] bg-black/10 backdrop-blur-[2px]"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full z-[150] flex flex-col transition-all duration-300 ease-out w-72 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${
          isDark
            ? 'bg-neutral-900/95 border-l border-neutral-800'
            : 'bg-[#FAFAF9]/95 border-l border-gray-200/80'
        } backdrop-blur-xl shadow-2xl`}
      >
        {/* Panel Header */}
        <div className={`flex items-center justify-between px-4 py-4 border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[#FF7D54] rounded-lg flex items-center justify-center text-white font-bold text-[9px]">
              N
            </div>
            <span className={`font-extrabold text-sm tracking-tight ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Notes Panel
            </span>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-700'
            }`}
          >
            <X size={14} />
          </button>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto">

          {/* Active Notes */}
          <SectionHeader
            id="active"
            label="Active Notes"
            count={activeNotes.length}
            icon={LayoutGrid}
            accent="text-indigo-400"
          />
          {openSection === 'active' && (
            <div className="pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {activeNotes.length === 0 ? (
                <div className={`mx-2 my-1 p-4 rounded-xl border border-dashed text-center text-[10px] ${
                  isDark ? 'border-neutral-800 text-neutral-600' : 'border-gray-200 text-gray-400'
                }`}>
                  No active notes
                </div>
              ) : (
                activeNotes.map(note => (
                  <NoteRow key={note.id} note={note} />
                ))
              )}
            </div>
          )}

          <div className={`mx-4 h-px ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`} />

          {/* Archive */}
          <SectionHeader
            id="archive"
            label="Archive"
            count={archivedNotes.length}
            icon={Archive}
            accent="text-orange-400"
          />
          {openSection === 'archive' && (
            <div className="pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {archivedNotes.length === 0 ? (
                <div className={`mx-2 my-1 p-4 rounded-xl border border-dashed text-center text-[10px] ${
                  isDark ? 'border-neutral-800 text-neutral-600' : 'border-gray-200 text-gray-400'
                }`}>
                  Archive is empty
                </div>
              ) : (
                archivedNotes.map(note => (
                  <NoteRow key={note.id} note={note} isArchived />
                ))
              )}
            </div>
          )}

          <div className={`mx-4 h-px ${isDark ? 'bg-neutral-800' : 'bg-gray-100'}`} />

          {/* Trash */}
          <SectionHeader
            id="trash"
            label="Trash"
            count={trashedNotes.length}
            icon={Trash2}
            accent="text-red-400"
          />
          {openSection === 'trash' && (
            <div className="pb-2 animate-in fade-in slide-in-from-top-1 duration-150">
              {trashedNotes.length === 0 ? (
                <div className={`mx-2 my-1 p-4 rounded-xl border border-dashed text-center text-[10px] ${
                  isDark ? 'border-neutral-800 text-neutral-600' : 'border-gray-200 text-gray-400'
                }`}>
                  Trash is empty
                </div>
              ) : (
                <>
                  <p className={`text-[9px] font-semibold px-5 pt-2 pb-1 ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                    Items are deleted permanently after 30 days
                  </p>
                  {trashedNotes.map(note => (
                    <NoteRow key={note.id} note={note} isTrashed />
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-4 py-3 border-t text-[9px] font-medium flex items-center justify-between ${
          isDark ? 'border-neutral-800 text-neutral-700' : 'border-gray-100 text-gray-400'
        }`}>
          <span>{activeNotes.length} active · {archivedNotes.length} archived · {trashedNotes.length} trashed</span>
          <Clock size={10} className="opacity-50" />
        </div>
      </div>
    </>
  );
}
