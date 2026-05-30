import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, Clock, Tag, ChevronRight, Hash } from 'lucide-react';
import { Note } from '@/shared/lib/types';

interface SearchModalProps {
  notes: Note[];
  themeMode?: 'light' | 'dark';
  onOpenNote: (note: Note) => void;
  onClose: () => void;
}

export default function SearchModal({ notes, themeMode = 'light', onOpenNote, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = themeMode === 'dark';

  // Strip HTML helper
  const stripHtml = (html: string): string => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Highlight matching text
  const highlightMatch = (text: string, q: string): string => {
    if (!q.trim()) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  };

  // Filter notes based on query
  useEffect(() => {
    if (!query.trim()) {
      // Show recent notes when no query
      const recent = [...notes]
        .filter(n => !n.isDeleted && !n.isArchived)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 6);
      setResults(recent);
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const matched = notes
      .filter(n => !n.isDeleted && !n.isArchived)
      .filter(n => {
        const title = (n.title || '').toLowerCase();
        const content = stripHtml(n.content || '').toLowerCase();
        const tags = (n.tags || []).join(' ').toLowerCase();
        return title.includes(q) || content.includes(q) || tags.includes(q);
      })
      .sort((a, b) => {
        // Title matches rank higher
        const aTitleMatch = (a.title || '').toLowerCase().includes(q);
        const bTitleMatch = (b.title || '').toLowerCase().includes(q);
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, 8);

    setResults(matched);
    setSelectedIndex(0);
  }, [query, notes]);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onOpenNote(results[selectedIndex]);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onOpenNote, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Get snippet of content around match
  const getSnippet = (content: string, q: string): string => {
    const plain = stripHtml(content);
    if (!q.trim()) return plain.slice(0, 120);
    const idx = plain.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return plain.slice(0, 120);
    const start = Math.max(0, idx - 40);
    const end = Math.min(plain.length, idx + q.length + 80);
    return (start > 0 ? '...' : '') + plain.slice(start, end) + (end < plain.length ? '...' : '');
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4"
      style={{ background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(15,15,15,0.55)' }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 backdrop-blur-md pointer-events-none" />

      {/* Modal panel */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200 backdrop-blur-md shadow-[0_24px_80px_rgba(15,23,42,0.22)] ${
          isDark ? 'bg-neutral-900/70 border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.48)]' : 'bg-white/70 border border-white/20 shadow-[0_24px_80px_rgba(14,165,233,0.14)]'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Row */}
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-white/20'}`}>
          <Search
            size={18}
            className={isDark ? 'text-neutral-400 shrink-0' : 'text-gray-400 shrink-0'}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search notes, tags, content..."
            className={`flex-1 bg-transparent text-base font-medium outline-none placeholder:font-normal ${
              isDark
                ? 'text-white placeholder:text-neutral-500'
                : 'text-gray-900 placeholder:text-gray-400'
            }`}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className={`p-1 rounded-full transition-colors ${isDark ? 'hover:bg-neutral-800 text-neutral-400' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors ${
              isDark ? 'bg-neutral-800 text-neutral-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          >
            Esc
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {results.length === 0 && query.trim() ? (
            <div className={`flex flex-col items-center justify-center py-16 gap-3 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
              <Search size={32} className="opacity-30" />
              <p className="text-balance font-medium">No notes found for &ldquo;<span className="font-bold">{query}</span>&rdquo;</p>
              <p className="text-balance text-sm">Try different keywords or check spelling</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Section label */}
              <p className={`text-balance text-[10px] font-bold uppercase tracking-widest px-3 py-2 ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                {query.trim() ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Recent Notes'}
              </p>

              {results.map((note, idx) => {
                const isSelected = idx === selectedIndex;
                const snippet = getSnippet(note.content || '', query);
                const hasColorAccent = note.color && note.color !== '#ffffff' && note.color !== 'transparent';

                return (
                  <button
                    key={note.id}
                    onClick={() => { onOpenNote(note); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-150 flex items-start gap-3 group ${
                      isSelected
                        ? (isDark ? 'bg-neutral-800' : 'bg-indigo-50')
                        : (isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50')
                    }`}
                  >
                    {/* Color Dot / Icon */}
                    <div
                      className="mt-0.5 w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        background: hasColorAccent ? note.color + '30' : (isDark ? '#2a2a2a' : '#f3f4f6'),
                        border: `1.5px solid ${hasColorAccent ? note.color + '60' : (isDark ? '#3a3a3a' : '#e5e7eb')}`
                      }}
                    >
                      <FileText size={14} style={{ color: hasColorAccent ? note.color : (isDark ? '#6b6b6b' : '#9ca3af') }} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4
                          className={`font-bold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                          dangerouslySetInnerHTML={{
                            __html: highlightMatch(note.title || 'Untitled Note', query)
                          }}
                        />
                        <div className={`flex items-center gap-1 shrink-0 text-[10px] font-medium ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                          <Clock size={9} />
                          {formatRelativeTime(note.updatedAt)}
                        </div>
                      </div>

                      {snippet && (
                        <p
                          className={`text-xs line-clamp-2 leading-relaxed ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}
                          dangerouslySetInnerHTML={{ __html: highlightMatch(snippet, query) }}
                        />
                      )}

                      {note.tags && note.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          {note.tags.slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className={`inline-flex items-center gap-0.5 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                                isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-500'
                              }`}
                            >
                              <Hash size={7} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      size={14}
                      className={`shrink-0 mt-1 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'} ${isDark ? 'text-neutral-400' : 'text-gray-400'}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer hints */}
        <div className={`flex items-center justify-between px-5 py-3 border-t text-[10px] font-medium ${
          isDark ? 'border-neutral-800 text-neutral-600' : 'border-gray-100 text-gray-400'
        }`}>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-gray-100 text-gray-500'}`}>↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className={`px-1.5 py-0.5 rounded ${isDark ? 'bg-neutral-800 text-neutral-400' : 'bg-gray-100 text-gray-500'}`}>↵</kbd>
              Open
            </span>
          </div>
          <span>Ctrl+K to search</span>
        </div>
      </div>

      {/* Highlight styles */}
      <style>{`
        mark {
          background: transparent;
          color: #6366f1;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
