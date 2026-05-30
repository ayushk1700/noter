import React, { useState } from 'react'
import { Plus, Trash2, Archive, FileText, ChevronDown, ChevronRight, RotateCcw, SortAsc, LayoutGrid, Sparkles, Sun, Moon } from 'lucide-react'
import { useNotesStore } from '@/shared/store/useNotesStore'
import { Note } from '@/shared/lib/types'

type Props = {
  onOpenNote: (note: Note) => void
  onCloseSidebar?: () => void
}

export default function NotesSidebar({ onOpenNote, onCloseSidebar }: Props) {
  const {
    notes,
    activeNoteId,
    searchQuery,
    sortBy,
    themeMode,
    createNote,
    restoreNote,
    permanentlyDeleteNote,
    archiveNote,
    duplicateNote,
    setSortBy,
    setActiveNoteId,
    toggleTheme,
  } = useNotesStore()

  const [showArchive, setShowArchive] = useState(false)
  const [showTrash, setShowTrash] = useState(false)

  // Strip HTML utility
  const stripHtml = (html: string): string => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  // Filter notes
  const filteredNotes = notes.filter(note => {
    const matchesSearch = 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stripHtml(note.content).toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Group notes
  const activeNotes = filteredNotes.filter(n => !n.isDeleted && !n.isArchived)
  const archivedNotes = filteredNotes.filter(n => !n.isDeleted && n.isArchived)
  const trashedNotes = filteredNotes.filter(n => n.isDeleted)

  // Sort notes
  const sortNotesList = (notesList: Note[]) => {
    return [...notesList].sort((a, b) => {
      // Pinned notes always rise to the top first!
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      if (sortBy === 'latest') {
        return b.updatedAt - a.updatedAt
      }
      if (sortBy === 'oldest') {
        return a.updatedAt - b.updatedAt
      }
      if (sortBy === 'alphabetical') {
        const titleA = a.title || 'Untitled'
        const titleB = b.title || 'Untitled'
        return titleA.localeCompare(titleB)
      }
      return 0
    })
  }

  const sortedActive = sortNotesList(activeNotes)
  const sortedArchived = sortNotesList(archivedNotes)
  const sortedTrashed = sortNotesList(trashedNotes)

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleCardClick = (note: Note) => {
    setActiveNoteId(note.id)
    onOpenNote(note)
    if (onCloseSidebar) onCloseSidebar()
  }

  const renderNoteCard = (note: Note, isTrashed = false) => {
    const isActive = activeNoteId === note.id
    const cardColor = note.color || '#ffffff'
    const hasColor = cardColor !== '#ffffff' && cardColor !== 'transparent'

    return (
      <div
        key={note.id}
        onClick={() => !isTrashed && handleCardClick(note)}
        className={`group p-3 mb-2 rounded-xl transition-all duration-200 border text-left relative flex flex-col cursor-pointer select-none ${
          isActive
            ? (themeMode === 'dark' 
                ? 'bg-neutral-800 border-indigo-500/50 shadow-md' 
                : 'bg-indigo-50/40 border-indigo-200 shadow-sm')
            : (themeMode === 'dark'
                ? 'bg-neutral-900 border-neutral-800/80 hover:bg-neutral-800/40'
                : 'bg-white border-slate-100 hover:bg-slate-50/80')
        }`}
        style={{ borderLeftWidth: hasColor ? '5px' : '1px', borderLeftColor: hasColor ? cardColor : undefined }}
      >
        <div className="flex justify-between items-start gap-1 mb-1">
          <h4 className={`text-xs font-bold truncate flex-1 tracking-tight leading-tight ${themeMode === 'dark' ? 'text-neutral-100' : 'text-slate-800'}`}>
            {note.title || 'Untitled Note'}
          </h4>
          <span className={`text-[9px] font-semibold tracking-wider ${themeMode === 'dark' ? 'text-neutral-500' : 'text-slate-400'}`}>
            {formatTime(note.updatedAt)}
          </span>
        </div>
        
        <p className={`text-[10px] line-clamp-2 leading-relaxed flex-1 ${themeMode === 'dark' ? 'text-neutral-400' : 'text-slate-500'}`}>
          {stripHtml(note.content) || 'Empty content...'}
        </p>

        {isTrashed ? (
          <div className="flex gap-2.5 mt-2 justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation()
                restoreNote(note.id)
              }}
              title="Restore Note"
              className="p-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
            >
              <RotateCcw size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                permanentlyDeleteNote(note.id)
              }}
              title="Delete Permanently"
              className="p-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5 absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button
              onClick={(e) => {
                e.stopPropagation()
                archiveNote(note.id)
              }}
              title={note.isArchived ? 'Unarchive' : 'Archive'}
              className={`p-1 rounded ${themeMode === 'dark' ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-indigo-600'} transition-all`}
            >
              <Archive size={10} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                duplicateNote(note.id)
              }}
              title="Duplicate"
              className={`p-1 rounded ${themeMode === 'dark' ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-indigo-600'} transition-all`}
            >
              <Plus size={10} />
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`w-64 shrink-0 flex flex-col h-full border-r ${
      themeMode === 'dark' 
        ? 'bg-neutral-900 border-neutral-800/80 text-neutral-300' 
        : 'bg-[#FAF9F7] border-slate-200/80 text-slate-700'
    }`}>
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-[#FF7D54] rounded-lg flex items-center justify-center text-white font-serif font-bold text-[9px] shadow-sm">
            F
          </div>
          <span className={`font-extrabold text-sm tracking-tight ${themeMode === 'dark' ? 'text-white' : 'text-slate-800'}`}>Noter Workspace</span>
        </div>
        <button 
          onClick={toggleTheme}
          className={`p-1.5 rounded-lg border transition-colors ${
            themeMode === 'dark' 
              ? 'bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-yellow-400' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-indigo-500 shadow-sm'
          }`}
        >
          {themeMode === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
        </button>
      </div>

      {/* New Note & Sort controls */}
      <div className="p-3.5 flex flex-col gap-2.5">
        <button
          onClick={() => {
            const note = createNote()
            onOpenNote(note)
          }}
          className="flex items-center justify-center gap-2 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/25 transition-all select-none focus:outline-none"
        >
          <Plus size={14} />
          <span>New Note</span>
        </button>

        {/* Sort Actions */}
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400/80 px-1 mt-1">
          <span>Sort By</span>
          <div className="flex gap-2">
            {[
              { label: 'Latest', value: 'latest' },
              { label: 'Oldest', value: 'oldest' },
              { label: 'A-Z', value: 'alphabetical' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setSortBy(item.value as any)}
                className={`transition-colors ${
                  sortBy === item.value 
                    ? 'text-indigo-500 font-extrabold' 
                    : 'hover:text-slate-600 text-slate-400'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lists scroll area */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-20">
        
        {/* Active Notes */}
        <div className="mb-4">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 mb-2 px-1 flex items-center gap-1.5">
            <LayoutGrid size={10} className="text-indigo-400" />
            <span>Active Notes</span>
            <span className="ml-auto font-medium text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full">
              {sortedActive.length}
            </span>
          </div>
          {sortedActive.length === 0 ? (
            <div className="text-[10px] text-slate-400/70 italic text-center py-4 border border-dashed border-black/5 rounded-xl">
              No active notes
            </div>
          ) : (
            sortedActive.map(note => renderNoteCard(note))
          )}
        </div>

        {/* Archived Section */}
        <div className="mb-4">
          <button
            onClick={() => setShowArchive(prev => !prev)}
            className="flex items-center gap-1.5 w-full text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 mb-2 px-1 focus:outline-none"
          >
            <Archive size={10} className="text-orange-400" />
            <span>Archive</span>
            <span className="font-medium text-[9px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded-full">
              {sortedArchived.length}
            </span>
            <ChevronDown size={10} className={`ml-auto transition-transform ${showArchive ? '' : '-rotate-90'}`} />
          </button>
          {showArchive && (
            sortedArchived.length === 0 ? (
              <div className="text-[10px] text-slate-400/70 italic text-center py-4 border border-dashed border-black/5 rounded-xl">
                Archive is empty
              </div>
            ) : (
              sortedArchived.map(note => renderNoteCard(note))
            )
          )}
        </div>

        {/* Trash Recycle Section */}
        <div className="mb-4">
          <button
            onClick={() => setShowTrash(prev => !prev)}
            className="flex items-center gap-1.5 w-full text-[10px] font-extrabold uppercase tracking-widest text-slate-400/80 mb-2 px-1 focus:outline-none"
          >
            <Trash2 size={10} className="text-red-400" />
            <span>Trash</span>
            <span className="font-medium text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded-full">
              {sortedTrashed.length}
            </span>
            <ChevronDown size={10} className={`ml-auto transition-transform ${showTrash ? '' : '-rotate-90'}`} />
          </button>
          {showTrash && (
            sortedTrashed.length === 0 ? (
              <div className="text-[10px] text-slate-400/70 italic text-center py-4 border border-dashed border-black/5 rounded-xl">
                Trash is empty
              </div>
            ) : (
              sortedTrashed.map(note => renderNoteCard(note, true))
            )
          )}
        </div>
      </div>
    </div>
  )
}
