import { create } from 'zustand'
import { Note, Attachment } from '@/shared/lib/types'
import { get, set, del } from 'idb-keyval'
import { getCurrentDate } from '@/shared/lib/utils'

interface NotesState {
  notes: Note[]
  activeNoteId: string | null
  searchQuery: string
  sortBy: 'latest' | 'oldest' | 'alphabetical'
  themeMode: 'light' | 'dark'
  
  // Actions
  loadNotes: () => Promise<void>
  createNote: (x?: number, y?: number) => Note
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void // Move to Trash (isDeleted: true)
  restoreNote: (id: string) => void // Restore from Trash
  permanentlyDeleteNote: (id: string) => void // Delete completely
  archiveNote: (id: string) => void // Toggle Archive
  duplicateNote: (id: string) => void // Duplicate Note
  toggleTheme: () => void
  setActiveNoteId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: 'latest' | 'oldest' | 'alphabetical') => void
  setNotes: (notes: Note[]) => void
}

export const useNotesStore = create<NotesState>((setStore, getStore) => ({
  notes: [],
  activeNoteId: null,
  searchQuery: '',
  sortBy: 'latest',
  themeMode: 'light',

  loadNotes: async () => {
    try {
      const savedNotes = await get('fokus-notes')
      const parsedNotes: Note[] = savedNotes
        ? (typeof savedNotes === 'string' ? JSON.parse(savedNotes) : savedNotes)
        : []
      
      const theme = (localStorage.getItem('fokus-theme') as 'light' | 'dark') || 'light'
      
      setStore({
        notes: parsedNotes,
        themeMode: theme,
      })
    } catch (e) {
      console.error('[ZUSTAND] Failed to load notes:', e)
    }
  },

  createNote: (x?: number, y?: number) => {
    const defaultX = x || (typeof window !== 'undefined' ? window.innerWidth / 2 - 160 : 200)
    const defaultY = y || (typeof window !== 'undefined' ? window.innerHeight / 2 - 160 : 200)
    
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      tags: [],
      date: getCurrentDate(),
      attachments: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
      isArchived: false,
      x: defaultX,
      y: defaultY,
      width: 320,
      color: '#ffffff',
    }

    const updatedNotes = [newNote, ...getStore().notes]
    setStore({ notes: updatedNotes, activeNoteId: newNote.id })
    set('fokus-notes', updatedNotes)
    return newNote
  },

  updateNote: (id, updates) => {
    const updatedNotes = getStore().notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          ...updates,
          updatedAt: Date.now(),
        }
      }
      return n
    })

    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)
  },

  deleteNote: (id) => {
    const updatedNotes = getStore().notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          isDeleted: true,
          updatedAt: Date.now(),
        }
      }
      return n
    })

    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)

    if (getStore().activeNoteId === id) {
      setStore({ activeNoteId: null })
    }
  },

  restoreNote: (id) => {
    const updatedNotes = getStore().notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          isDeleted: false,
          updatedAt: Date.now(),
        }
      }
      return n
    })

    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)
  },

  permanentlyDeleteNote: (id) => {
    const updatedNotes = getStore().notes.filter(n => n.id !== id)
    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)

    if (getStore().activeNoteId === id) {
      setStore({ activeNoteId: null })
    }
  },

  archiveNote: (id) => {
    const updatedNotes = getStore().notes.map(n => {
      if (n.id === id) {
        return {
          ...n,
          isArchived: !n.isArchived,
          updatedAt: Date.now(),
        }
      }
      return n
    })

    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)
  },

  duplicateNote: (id) => {
    const sourceNote = getStore().notes.find(n => n.id === id)
    if (!sourceNote) return

    const duplicate: Note = {
      ...sourceNote,
      id: Date.now().toString(),
      title: sourceNote.title ? `${sourceNote.title} (Copy)` : 'Copy of Note',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
      isArchived: false,
      x: (sourceNote.x ?? 200) + 40,
      y: (sourceNote.y ?? 200) + 40,
    }

    const updatedNotes = [duplicate, ...getStore().notes]
    setStore({ notes: updatedNotes })
    set('fokus-notes', updatedNotes)
  },

  toggleTheme: () => {
    const currentTheme = getStore().themeMode
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light'
    localStorage.setItem('fokus-theme', nextTheme)
    setStore({ themeMode: nextTheme })
  },

  setActiveNoteId: (id) => setStore({ activeNoteId: id }),
  setSearchQuery: (query) => setStore({ searchQuery: query }),
  setSortBy: (sort) => setStore({ sortBy: sort }),
  setNotes: (notes) => {
    setStore({ notes })
    set('fokus-notes', notes)
  },
}))
