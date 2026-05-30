'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, Clock, Hash, ArrowRight } from 'lucide-react';
import { Note } from '@/shared/lib/types';

interface NavbarSearchProps {
  notes: Note[];
  themeMode?: 'light' | 'dark';
  onOpenNote: (note: Note) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function NavbarSearch({
  notes,
  themeMode = 'light',
  onOpenNote,
  isOpen,
  onOpen,
  onClose,
}: NavbarSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = themeMode === 'dark';

  const stripHtml = (html: string) =>
    (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

  const formatRelTime = (ts: number) => {
    const d = Date.now() - ts;
    const m = Math.floor(d / 60000);
    const h = Math.floor(d / 3600000);
    const days = Math.floor(d / 86400000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m`;
    if (h < 24) return `${h}h`;
    return `${days}d`;
  };

  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${esc})`, 'gi'), '<mark>$1</mark>');
  };

  useEffect(() => {
    if (!isOpen) return;
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults(
        [...notes]
          .filter(n => !n.isDeleted && !n.isArchived)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 5)
      );
      setSelectedIndex(0);
      return;
    }
    const matched = notes
      .filter(n => !n.isDeleted && !n.isArchived)
      .filter(n => {
        const t = (n.title || '').toLowerCase();
        const c = stripHtml(n.content || '').toLowerCase();
        const tg = (n.tags || []).join(' ').toLowerCase();
        return t.includes(q) || c.includes(q) || tg.includes(q);
      })
      .sort((a, b) => {
        const at = (a.title || '').toLowerCase().includes(q);
        const bt = (b.title || '').toLowerCase().includes(q);
        if (at && !bt) return -1;
        if (!at && bt) return 1;
        return b.updatedAt - a.updatedAt;
      })
      .slice(0, 6);
    setResults(matched);
    setSelectedIndex(0);
  }, [query, notes, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
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
    },
    [results, selectedIndex, onOpenNote, onClose]
  );

  const getSnippet = (content: string, q: string) => {
    const plain = stripHtml(content);
    if (!q.trim()) return plain.slice(0, 80);
    const idx = plain.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return plain.slice(0, 80);
    const start = Math.max(0, idx - 30);
    const end = Math.min(plain.length, idx + q.length + 60);
    return (start > 0 ? '\u2026' : '') + plain.slice(start, end) + (end < plain.length ? '\u2026' : '');
  };

  return (
    <>
      {/* Backdrop — captures outside clicks */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[199]"
          onClick={onClose}
        />
      )}

      {/* Pill inline content */}
      <div className="relative flex items-center z-[200]">
        {/* Collapsed state: just the icon */}
        {!isOpen && (
          <button
            onClick={onOpen}
            title="Search notes (Ctrl+K)"
            className="p-2 rounded-full hover:bg-white/10 text-white/40 hover:text-white/80 transition-all"
          >
            <Search className="w-4 h-4" />
          </button>
        )}

        {/* Expanded state: inline search input in pill */}
        {isOpen && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
            <Search className="w-3.5 h-3.5 text-white/50 shrink-0 ml-1" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes\u2026"
              className="bg-transparent text-sm font-medium text-white placeholder:text-white/30 outline-none w-44 min-w-0"
              style={{ caretColor: '#FF7D54' }}
            />
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Results dropdown — FIXED to viewport, horizontally centered */}
        {isOpen && (
          <div
            className={`fixed left-1/2 -translate-x-1/2 top-[72px] w-[440px] max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl overflow-hidden z-[201] border animate-in fade-in slide-in-from-top-2 duration-200 ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 shadow-black/70'
                : 'bg-white border-gray-200 shadow-gray-400/20'
            }`}
          >
            {/* Header row */}
            <div className={`px-4 pt-3 pb-2 flex items-center justify-between border-b ${isDark ? 'border-neutral-800' : 'border-gray-100'}`}>
              <span className={`text-[9px] font-extrabold uppercase tracking-widest ${isDark ? 'text-neutral-500' : 'text-gray-400'}`}>
                {query.trim() ? `${results.length} result${results.length !== 1 ? 's' : ''}` : 'Recent Notes'}
              </span>
              <div className={`flex items-center gap-3 text-[9px] font-semibold ${isDark ? 'text-neutral-700' : 'text-gray-300'}`}>
                <span>&uarr;&darr; navigate</span>
                <span>&crarr; open</span>
              </div>
            </div>

            {/* No results */}
            {results.length === 0 && query.trim() ? (
              <div className={`flex flex-col items-center py-10 gap-2 ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                <Search size={28} className="opacity-25" />
                <p className="text-xs font-semibold">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-[10px] opacity-60">Try different keywords</p>
              </div>
            ) : (
              <div className="py-1.5 max-h-[320px] overflow-y-auto">
                {results.map((note, idx) => {
                  const isSelected = idx === selectedIndex;
                  const hasColor = note.color && note.color !== '#ffffff' && note.color !== 'transparent';
                  const snippet = getSnippet(note.content || '', query);

                  return (
                    <button
                      key={note.id}
                      onClick={() => { onOpenNote(note); onClose(); }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-2.5 flex items-start gap-3 transition-all ${
                        isSelected
                          ? isDark ? 'bg-neutral-800' : 'bg-indigo-50'
                          : isDark ? 'hover:bg-neutral-800/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {/* Color-aware icon */}
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{
                          background: hasColor ? (note.color + '22') : (isDark ? '#262626' : '#f4f4f5'),
                          border: `1.5px solid ${hasColor ? (note.color + '44') : (isDark ? '#333' : '#e4e4e7')}`,
                        }}
                      >
                        <FileText
                          size={13}
                          style={{ color: hasColor ? note.color! : (isDark ? '#737373' : '#a1a1aa') }}
                        />
                      </div>

                      {/* Text block */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span
                            className={`text-xs font-bold truncate flex-1 ${isDark ? 'text-neutral-100' : 'text-gray-900'}`}
                            dangerouslySetInnerHTML={{ __html: highlight(note.title || 'Untitled', query) }}
                          />
                          <span className={`text-[9px] shrink-0 flex items-center gap-0.5 font-medium ${isDark ? 'text-neutral-600' : 'text-gray-400'}`}>
                            <Clock size={8} />
                            {formatRelTime(note.updatedAt)}
                          </span>
                        </div>
                        {snippet && (
                          <p
                            className={`text-[10px] line-clamp-1 leading-relaxed ${isDark ? 'text-neutral-500' : 'text-gray-500'}`}
                            dangerouslySetInnerHTML={{ __html: highlight(snippet, query) }}
                          />
                        )}
                        {note.tags && note.tags.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {note.tags.slice(0, 3).map(tag => (
                              <span
                                key={tag}
                                className={`inline-flex items-center gap-0.5 text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                                  isDark ? 'bg-indigo-500/15 text-indigo-400' : 'bg-indigo-50 text-indigo-500'
                                }`}
                              >
                                <Hash size={6} />{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <ArrowRight
                        size={12}
                        className={`shrink-0 mt-1.5 transition-opacity ${isSelected ? 'opacity-50' : 'opacity-0'} ${isDark ? 'text-neutral-400' : 'text-gray-400'}`}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div className={`px-4 py-2.5 border-t text-[9px] font-medium flex items-center justify-between ${isDark ? 'border-neutral-800 text-neutral-700' : 'border-gray-100 text-gray-400'}`}>
              <span>Ctrl+K to toggle</span>
              <span>Esc to dismiss</span>
            </div>
          </div>
        )}
      </div>

      <style>{`mark { background: transparent; color: #FF7D54; font-weight: 800; }`}</style>
    </>
  );
}
