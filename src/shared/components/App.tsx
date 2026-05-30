'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { initialCalendarDays, initialCalendarEvents } from '@/shared/lib/constants';
import { getCurrentDate } from '@/shared/lib/utils';
import { Note, Toast, Attachment, CalendarDay, CalendarEvent, CalendarLayout, GoogleSyncConfig } from '@/shared/lib/types';
import { get, set, del } from 'idb-keyval';
import AmbientBackground from '@/shared/components/AmbientBackground';
import DragDropOverlay from '@/features/workspace/components/DragDropOverlay';
import DynamicIsland from '@/shared/components/DynamicIsland';
import SplashView from '@/shared/components/SplashView';
import WorkspaceView from '@/features/workspace/components/WorkspaceView';
import EditorView from '@/features/editor/components/EditorView';
import CalendarView from '@/features/calendar/components/CalendarView';
import { useNotesStore } from '@/shared/store/useNotesStore';

export default function App() {
  const notes = useNotesStore(state => state.notes);
  const themeMode = useNotesStore(state => state.themeMode);
  
  const setNotes = useCallback((newNotesVal: Note[] | ((prev: Note[]) => Note[])) => {
    const current = useNotesStore.getState().notes;
    const next = typeof newNotesVal === 'function' ? newNotesVal(current) : newNotesVal;
    useNotesStore.getState().setNotes(next);
  }, []);

  const setThemeMode = useCallback((newThemeVal: 'light' | 'dark' | ((prev: 'light' | 'dark') => 'light' | 'dark')) => {
    const current = useNotesStore.getState().themeMode;
    const next = typeof newThemeVal === 'function' ? newThemeVal(current) : newThemeVal;
    if (next !== current) {
      useNotesStore.getState().toggleTheme();
    }
  }, []);

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarLayout, setCalendarLayout] = useState<CalendarLayout>('month');
  const [activeDateObj, setActiveDateObj] = useState<Date>(() => new Date(2026, 4, 20));
  const [googleSyncConfig, setGoogleSyncConfig] = useState<GoogleSyncConfig>({
    clientId: '',
    apiKey: '',
    isConnected: false,
    lastSyncedAt: null,
  });
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [appState, setAppState] = useState<'splash' | 'workspace' | 'editor' | 'calendar'>('splash');
  const [editorInitialZenMode, setEditorInitialZenMode] = useState(false);
  const [isChronoEnabled, setIsChronoEnabled] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<'grid' | 'canvas'>('canvas');

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [notesLoaded, setNotesLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      let savedNotes;
      try {
        savedNotes = await get('fokus-notes');
        
        // Migration from localStorage if IDB is empty
        if (!savedNotes) {
          const legacyNotes = localStorage.getItem('fokus-notes');
          if (legacyNotes) {
            savedNotes = JSON.parse(legacyNotes);
            await set('fokus-notes', savedNotes);
            localStorage.removeItem('fokus-notes');
          }
        }
      } catch (err) {
        console.error('[MOUNT] Failed to get notes from IDB:', err);
      }

      console.log('[MOUNT] savedNotes from IDB:', savedNotes);
      
      const savedCalendarDays = localStorage.getItem('fokus-calendar-days');
      const savedCalendarEvents = localStorage.getItem('fokus-calendar-events');
      const savedLayout = localStorage.getItem('fokus-calendar-layout') as CalendarLayout;
      const savedActiveDate = localStorage.getItem('fokus-active-date');
      const savedGoogleSync = localStorage.getItem('fokus-google-sync-config');

      try {
        const parsedNotes = savedNotes ? (typeof savedNotes === 'string' ? JSON.parse(savedNotes) : savedNotes) : [];
        const seedIds = new Set(['n1', 'n2', 'n3', 'n4']);
        const hasOnlySeedNotes = Array.isArray(parsedNotes) && parsedNotes.length > 0 && parsedNotes.every((note: Note) => seedIds.has(note.id));

        if (hasOnlySeedNotes) {
          console.log('[MOUNT] hasOnlySeedNotes is true. Clearing notes.');
          setNotes([]);
          await del('fokus-notes');
        } else {
          console.log('[MOUNT] setting parsedNotes:', parsedNotes);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('[MOUNT] Failed to parse savedNotes:', error);
        setNotes([]);
      }

      try {
        setCalendarDays(savedCalendarDays ? JSON.parse(savedCalendarDays) : initialCalendarDays);
        setCalendarEvents(savedCalendarEvents ? JSON.parse(savedCalendarEvents) : initialCalendarEvents);
        if (savedGoogleSync) setGoogleSyncConfig(JSON.parse(savedGoogleSync));
      } catch (e) {
        console.error('[MOUNT] Failed to parse calendar data:', e);
      }

      if (savedLayout) setCalendarLayout(savedLayout);
      if (savedActiveDate) setActiveDateObj(new Date(savedActiveDate));

      setNotesLoaded(true);
    })();
  }, [setNotes]);

  useEffect(() => {
    console.log('[SAVE EFFECT] notesLoaded:', notesLoaded, 'notes.length:', notes.length);
    if (!notesLoaded) return;
    
    (async () => {
      try {
        if (notes.length > 0) {
          console.log('[SAVE EFFECT] Saving notes to IDB');
          await set('fokus-notes', notes);
        } else {
          console.log('[SAVE EFFECT] Removing notes from IDB (length is 0)');
          await del('fokus-notes');
        }
      } catch (err) {
        console.error('[SAVE EFFECT] Failed to save notes to IDB:', err);
      }
    })();
  }, [notes, notesLoaded]);

  useEffect(() => {
    if (isInitialMount.current) {
      if (calendarDays.length > 0 || calendarEvents.length > 0) {
        isInitialMount.current = false;
      }
      return;
    }
    localStorage.setItem('fokus-calendar-days', JSON.stringify(calendarDays));
    localStorage.setItem('fokus-calendar-events', JSON.stringify(calendarEvents));
  }, [calendarDays, calendarEvents]);

  useEffect(() => {
    localStorage.setItem('fokus-calendar-layout', calendarLayout);
  }, [calendarLayout]);

  useEffect(() => {
    localStorage.setItem('fokus-active-date', activeDateObj.toISOString());
  }, [activeDateObj]);

  useEffect(() => {
    localStorage.setItem('fokus-google-sync-config', JSON.stringify(googleSyncConfig));
  }, [googleSyncConfig]);

  // Sync calendar days strip around activeDateObj
  useEffect(() => {
    const startOfWeek = new Date(activeDateObj);
    const dayOfWeek = activeDateObj.getDay();
    startOfWeek.setDate(activeDateObj.getDate() - dayOfWeek);

    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    const newDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const isSelected = d.getDate() === activeDateObj.getDate() &&
                         d.getMonth() === activeDateObj.getMonth() &&
                         d.getFullYear() === activeDateObj.getFullYear();
      
      const hasEvent = calendarEvents.some(event => 
        event.date === d.getDate() &&
        event.month === d.getMonth() &&
        event.year === d.getFullYear()
      );

      return {
        day: weekdays[i],
        date: d.getDate(),
        active: isSelected,
        hasEvent,
      };
    });
    setCalendarDays(newDays);
  }, [activeDateObj, calendarEvents]);

  // Load Google API Scripts dynamically on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('google-gsi-client')) {
      const scriptGsi = document.createElement('script');
      scriptGsi.id = 'google-gsi-client';
      scriptGsi.src = 'https://accounts.google.com/gsi/client';
      scriptGsi.async = true;
      scriptGsi.defer = true;
      document.head.appendChild(scriptGsi);
    }

    if (!document.getElementById('google-gapi')) {
      const scriptGapi = document.createElement('script');
      scriptGapi.id = 'google-gapi';
      scriptGapi.src = 'https://apis.google.com/js/api.js';
      scriptGapi.async = true;
      scriptGapi.defer = true;
      scriptGapi.onload = () => {
        if ((window as any).gapi) {
          (window as any).gapi.load('client', () => {});
        }
      };
      document.head.appendChild(scriptGapi);
    }
  }, []);


  // Stable callback for creating notes
  const createNewNote = useCallback((x?: number, y?: number) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      tags: [],
      date: getCurrentDate(),
      attachments: [],
      updatedAt: Date.now(),
      x: x || window.innerWidth / 2 - 160,
      y: y || window.innerHeight / 2 - 160,
      width: 320,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setAppState('editor');
  }, [setNotes]);

  const createVoiceNote = useCallback((blob: Blob, durationMs: number) => {
    const url = URL.createObjectURL(blob);
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    const label = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const attachment: Attachment = {
        id: Date.now().toString(),
        type: 'audio',
        data: base64,
        name: `Voice Note (${label})`,
      };
      const newNote: Note = {
        id: (Date.now() + 1).toString(),
        title: `Voice Note · ${label}`,
        content: '',
        tags: [],
        date: getCurrentDate(),
        attachments: [attachment],
        updatedAt: Date.now(),
        x: window.innerWidth / 2 - 160,
        y: window.innerHeight / 2 - 160,
        width: 320,
      };
      setNotes(prev => [newNote, ...prev]);
      setActiveNote(newNote);
      setAppState('editor');
      URL.revokeObjectURL(url);
    };
    reader.readAsDataURL(blob);
  }, [setNotes]);

  const createMediaNote = useCallback((type: 'image' | 'video', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const attachment: Attachment = {
        id: Date.now().toString(),
        type: type,
        data: base64,
        name: file.name,
      };
      const newNote: Note = {
        id: (Date.now() + 1).toString(),
        title: '',
        content: '',
        tags: [],
        date: getCurrentDate(),
        attachments: [attachment],
        updatedAt: Date.now(),
        x: window.innerWidth / 2 - 160 + (Math.random() * 40 - 20),
        y: window.innerHeight / 2 - 160 + (Math.random() * 40 - 20),
        width: 320,
      };
      setNotes(prev => [newNote, ...prev]);
      triggerToast(`${type.charAt(0).toUpperCase() + type.slice(1)} Note created!`, 'success');
    };
    reader.readAsDataURL(file);
  }, [setNotes]);


  const closeEditor = useCallback(() => {
    if (activeNote && activeNote.parentId) {
      const parent = notes.find(n => n.id === activeNote.parentId);
      if (parent) {
        setActiveNote(parent);
        return;
      }
    }
    setActiveNote(null);
    setAppState('workspace');
  }, [activeNote, notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        createNewNote();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (appState === 'editor') closeEditor();
        else if (appState === 'calendar') setAppState('workspace');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notes, appState, createNewNote, closeEditor]);

  const triggerToast = (message: string, type: 'error' | 'success' = 'success', actionText = '', onAction: (() => void) | null = null) => {
    setToast({ message, type, actionText, onAction: onAction || undefined });
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setToast(null), 5000);
  };

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updatedNote = { ...activeNote, ...updates, updatedAt: Date.now() };
    setActiveNote(updatedNote);
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
  };

  const deleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (!noteToDelete) return;

    setNotes(notes.filter(n => n.id !== noteId));
    if (activeNote?.id === noteId) closeEditor();
    triggerToast('Note deleted successfully.', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'file') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      triggerToast('File is too large! Limit is 5MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const newAttachment: Attachment = {
        id: Date.now().toString(),
        type,
        data: base64,
        name: file.name,
      };

      const currentAttachments = activeNote?.attachments || [];
      updateActiveNote({ attachments: [...currentAttachments, newAttachment] });
      triggerToast('Attachment uploaded!', 'success');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAttachment = (attId: string) => {
    if (!activeNote) return;
    updateActiveNote({ attachments: activeNote.attachments.filter(a => a.id !== attId) });
  };

  const selectCalendarDay = (date: number) => {
    const nextDate = new Date(activeDateObj);
    nextDate.setDate(date);
    setActiveDateObj(nextDate);
  };

  const createCalendarEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    setCalendarEvents(prev => [...prev, newEvent]);
    triggerToast('Event scheduled in calendar!', 'success');
  };

  const deleteCalendarEvent = (id: string) => {
    setCalendarEvents(prev => prev.filter(e => e.id !== id));
    triggerToast('Event deleted successfully.', 'success');
  };

  const triggerGoogleSync = async (useSimulation: boolean) => {
    if (useSimulation || !googleSyncConfig.clientId || !googleSyncConfig.apiKey) {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const year = activeDateObj.getFullYear();
          const month = activeDateObj.getMonth();

          const simulatedEvents: CalendarEvent[] = [
            {
              id: 'g1',
              date: 20,
              month: month,
              year: year,
              time: '11:00 AM - 12:30 PM',
              startTime: '11:00',
              endTime: '12:30',
              title: 'Google I/O Keynote 🚀',
              desc: 'Annual developer festival showcasing Google innovations and client AI platforms.',
              color: 'bg-[#EAF5FF]',
              iconColor: 'bg-[#1A73E8]',
              iconName: 'work',
              isGoogleEvent: true,
              googleEventId: 'io-keynote-2026',
            },
            {
              id: 'g2',
              date: 20,
              month: month,
              year: year,
              time: '02:00 PM - 03:00 PM',
              startTime: '14:00',
              endTime: '15:00',
              title: 'Coffee with Sundar Pichai ☕',
              desc: 'Discussing the future of client-side local-first agent workflows in Fokus application.',
              color: 'bg-[#FDF0EB]',
              iconColor: 'bg-[#EA4335]',
              iconName: 'personal',
              isGoogleEvent: true,
              googleEventId: 'sundar-coffee-2026',
            },
            {
              id: 'g3',
              date: 21,
              month: month,
              year: year,
              time: '01:00 PM - 02:00 PM',
              startTime: '13:00',
              endTime: '14:00',
              title: 'DeepMind Workspace Sync 🧠',
              desc: 'Reviewing performance metrics, HSL styling paradigms, and user micro-interactions.',
              color: 'bg-[#EBFDF0]',
              iconColor: 'bg-[#34A853]',
              iconName: 'laptop',
              isGoogleEvent: true,
              googleEventId: 'deepmind-sync-2026',
            },
            {
              id: 'g4',
              date: 22,
              month: month,
              year: year,
              time: '04:30 PM - 05:30 PM',
              startTime: '16:30',
              endTime: '17:30',
              title: 'Refactor UI with Glassmorphism 🪄',
              desc: 'Applying premium sand color tones (#F9F8F6) and modern CSS backdrop filters.',
              color: 'bg-[#FCFBEB]',
              iconColor: 'bg-[#FBBC05]',
              iconName: 'flower',
              isGoogleEvent: true,
              googleEventId: 'ui-refactor-2026',
            },
          ];

          setCalendarEvents(prev => {
            const filtered = prev.filter(e => !e.isGoogleEvent);
            return [...filtered, ...simulatedEvents];
          });

          setGoogleSyncConfig(prev => ({
            ...prev,
            isConnected: true,
            lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
          }));

          triggerToast('Successfully synced 4 Google Calendar events (Simulation Mode)!', 'success');
          resolve();
        }, 1500);
      });
    } else {
      return new Promise<void>((resolve, reject) => {
        const gapi = (window as any).gapi;
        const google = (window as any).google;

        if (!gapi || !google) {
          triggerToast('Google client libraries not loaded yet. Try again in a moment.', 'error');
          reject(new Error('Libraries not loaded'));
          return;
        }

        try {
          gapi.client.init({
            apiKey: googleSyncConfig.apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          }).then(() => {
            const tokenClient = google.accounts.oauth2.initTokenClient({
              client_id: googleSyncConfig.clientId,
              scope: 'https://www.googleapis.com/auth/calendar.readonly',
              callback: async (resp: any) => {
                if (resp.error !== undefined) {
                  triggerToast('Google Authentication failed.', 'error');
                  reject(resp);
                  return;
                }

                try {
                  const timeMin = new Date();
                  timeMin.setDate(timeMin.getDate() - 7);
                  const response = await gapi.client.calendar.events.list({
                    calendarId: 'primary',
                    timeMin: timeMin.toISOString(),
                    showDeleted: false,
                    singleEvents: true,
                    maxResults: 15,
                    orderBy: 'startTime',
                  });

                  const items = response.result.items || [];
                  const fetchedEvents: CalendarEvent[] = items.map((item: any) => {
                    const startDateTime = item.start?.dateTime || item.start?.date || '';
                    const endDateTime = item.end?.dateTime || item.end?.date || '';
                    const parsedStart = new Date(startDateTime);
                    const parsedEnd = new Date(endDateTime);

                    const pad = (n: number) => n.toString().padStart(2, '0');
                    const startTimeStr = `${pad(parsedStart.getHours())}:${pad(parsedStart.getMinutes())}`;
                    const endTimeStr = `${pad(parsedEnd.getHours())}:${pad(parsedEnd.getMinutes())}`;

                    const ampmStart = parsedStart.getHours() >= 12 ? 'PM' : 'AM';
                    const displayHour = parsedStart.getHours() % 12 === 0 ? 12 : parsedStart.getHours() % 12;
                    const timeLabel = `${displayHour}:${pad(parsedStart.getMinutes())} ${ampmStart}`;

                    return {
                      id: item.id,
                      date: parsedStart.getDate(),
                      month: parsedStart.getMonth(),
                      year: parsedStart.getFullYear(),
                      time: timeLabel,
                      startTime: startTimeStr,
                      endTime: endTimeStr,
                      title: item.summary || 'Google Event',
                      desc: item.description || '',
                      color: 'bg-[#EAE4FF]',
                      iconColor: 'bg-[#7D54FF]',
                      iconName: 'laptop',
                      isGoogleEvent: true,
                      googleEventId: item.id,
                    };
                  });

                  setCalendarEvents(prev => {
                    const filtered = prev.filter(e => !e.isGoogleEvent);
                    return [...filtered, ...fetchedEvents];
                  });

                  setGoogleSyncConfig(prev => ({
                    ...prev,
                    isConnected: true,
                    lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
                  }));

                  triggerToast(`Synced ${fetchedEvents.length} Google Calendar events successfully!`, 'success');
                  resolve();
                } catch (err) {
                  console.error(err);
                  triggerToast('Failed to fetch events from Google Calendar.', 'error');
                  reject(err);
                }
              },
            });

            tokenClient.requestAccessToken({ prompt: 'consent' });
          }).catch((err: any) => {
            console.error(err);
            triggerToast('Google client initialization failed. Check your API Key.', 'error');
            reject(err);
          });
        } catch (e) {
          console.error(e);
          triggerToast('Sync failed. Please check client console.', 'error');
          reject(e);
        }
      });
    }
  };



  const handleGlobalDragOver = (e: React.DragEvent) => {
    if (appState !== 'editor') e.preventDefault();
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    if (appState !== 'editor') e.preventDefault();
  };

  const toggleTheme = () => setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  const toggleChrono = () => setIsChronoEnabled(prev => !prev);

  return (
    <div
      className={`flex h-[100dvh] w-full font-sans overflow-hidden selection:bg-gray-300 relative ${themeMode === 'dark' ? 'bg-neutral-900 text-slate-100' : 'bg-[#F9F8F6] text-gray-900'}`}
      onDragOver={handleGlobalDragOver}
      onDrop={handleGlobalDrop}
    >
      <AmbientBackground />
      
      <DynamicIsland 
        toast={toast}
        onCloseToast={() => setToast(null)}
        onNewNote={createNewNote}
        onVoiceNote={createVoiceNote}
        onMediaNote={createMediaNote}
        onZoomToggle={appState === 'workspace' ? () => setWorkspaceMode(prev => prev === 'grid' ? 'canvas' : 'grid') : undefined}
        themeMode={themeMode}
        isVisible={appState === 'workspace' || appState === 'editor' || appState === 'calendar'}
      />

      {appState === 'splash' && (
        <SplashView
          onNewNote={createNewNote}
          onGoToWorkspace={() => setAppState('workspace')}
          onQuickCapture={(thought) => {
            const newNote: Note = {
              id: Date.now().toString(),
              title: 'Quick Capture',
              content: thought,
              tags: [],
              date: getCurrentDate(),
              attachments: [],
              updatedAt: Date.now(),
            };
            setNotes([newNote, ...notes]);
            triggerToast('Quick capture saved to workspace!', 'success', 'Open Editor', () => {
              setActiveNote(newNote);
              setAppState('editor');
            });
          }}
          themeMode={themeMode}
          isChronoEnabled={isChronoEnabled}
          onToggleTheme={toggleTheme}
          onToggleChrono={toggleChrono}
        />
      )}

      {(appState === 'workspace' || appState === 'editor') && (
        <div className="flex flex-row w-full h-full overflow-hidden relative z-10">
          {/* Main Dashboard Panel */}
          <div className="flex-1 h-full overflow-hidden relative flex flex-col">
            {appState === 'workspace' && (
              <WorkspaceView
                notes={notes.filter(n => !n.isDeleted && !n.isArchived)}
                onNoteClick={(note, zenMode = false) => {
                  setActiveNote(note);
                  setEditorInitialZenMode(zenMode);
                  setAppState('editor');
                }}
                onBackToSplash={() => setAppState('splash')}
                onNewNote={createNewNote}
                onNewVoiceNote={createVoiceNote}
                onCalendar={() => setAppState('calendar')}
                onNoteChange={(updatedNote) => {
                  setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
                }}
                onNoteCreate={(newNote) => {
                  setNotes(prev => [newNote, ...prev]);
                }}
                onNoteDelete={deleteNote}
                themeMode={themeMode}
                workspaceMode={workspaceMode}
                setWorkspaceMode={setWorkspaceMode}
                onToggleTheme={toggleTheme}
              />
            )}

            {appState === 'editor' && activeNote && (
              <EditorView
                note={activeNote}
                notes={notes}
                themeMode={themeMode}
                isChronoEnabled={isChronoEnabled}
                initialZenMode={editorInitialZenMode}
                onToggleTheme={toggleTheme}
                onToggleChrono={toggleChrono}
                onTitleChange={(title) => updateActiveNote({ title })}
                onContentChange={(content) => updateActiveNote({ content })}
                onTagsChange={(tags) => updateActiveNote({ tags })}
                onNoteChange={(note) => updateActiveNote(note)}
                onBack={closeEditor}
                onOpenNote={(noteId) => {
                  const note = notes.find(n => n.id === noteId);
                  if (note) setActiveNote(note);
                }}
                onDelete={() => deleteNote(activeNote.id)}
                onImageUpload={(e) => handleFileUpload(e, 'image')}
                onVideoUpload={(e) => handleFileUpload(e, 'video')}
                onFileUpload={(e) => handleFileUpload(e, 'file')}
                onRemoveAttachment={removeAttachment}
                imageInputRef={imageInputRef}
                videoInputRef={videoInputRef}
                fileInputRef={fileInputRef}
                onCreateSubPage={(title?: string, content?: string) => {
                  const newNote: Note = {
                    id: Date.now().toString(),
                    parentId: activeNote.id,
                    title: title || 'Untitled Page',
                    content: content || '',
                    tags: [],
                    date: getCurrentDate(),
                    attachments: [],
                    updatedAt: Date.now(),
                  };
                  setNotes(prev => [newNote, ...prev]);
                  return newNote.id;
                }}
                onOpenSubPage={(pageId) => {
                  const page = notes.find(n => n.id === pageId);
                  if (page) {
                    setActiveNote(page);
                    setAppState('editor');
                  } else {
                    triggerToast('Page not found', 'error');
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      {appState === 'calendar' && (
        <CalendarView
          calendarDays={calendarDays}
          calendarEvents={calendarEvents}
          activeDateObj={activeDateObj}
          onActiveDateChange={setActiveDateObj}
          calendarLayout={calendarLayout}
          onLayoutChange={setCalendarLayout}
          googleSyncConfig={googleSyncConfig}
          onSaveSyncConfig={setGoogleSyncConfig}
          onTriggerSync={triggerGoogleSync}
          onClose={() => setAppState('workspace')}
          onDayClick={selectCalendarDay}
          onAddEvent={createCalendarEvent}
          onDeleteEvent={deleteCalendarEvent}
          themeMode={themeMode}
          isChronoEnabled={isChronoEnabled}
          onToggleTheme={toggleTheme}
          onToggleChrono={toggleChrono}
        />
      )}
    </div>
  );
}
