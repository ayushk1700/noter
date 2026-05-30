'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import type { GlobalCommand } from '@/shared/hooks/useGlobalCommandPalette';

type Props = {
  commands: GlobalCommand[];
  isOpen: boolean;
  query: string;
  onQueryChange: (query: string) => void;
  onRunCommand: (command: GlobalCommand) => void;
  onClose: () => void;
};

export default function CommandPalette({
  commands,
  isOpen,
  query,
  onQueryChange,
  onRunCommand,
  onClose,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter(command => {
      const haystack = [
        command.label,
        command.description,
        command.category,
        ...(command.keywords || []),
      ].join(' ').toLowerCase();
      return haystack.includes(normalized);
    });
  }, [commands, query]);

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
    }
  }, [isOpen, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex(index => Math.min(index + 1, filteredCommands.length - 1));
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(index => Math.max(index - 1, 0));
      }
      if (event.key === 'Enter' && filteredCommands[selectedIndex]) {
        event.preventDefault();
        onRunCommand(filteredCommands[selectedIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCommands, isOpen, onClose, onRunCommand, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-md">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-neutral-950/95 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <Search size={18} className="text-white/50" />
          <input
            autoFocus
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search commands..."
            className="flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-white/30"
          />
          <button onClick={onClose} className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-white/40">No commands match your search.</div>
          ) : (
            filteredCommands.map((command, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={command.id}
                  onClick={() => onRunCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-start justify-between gap-4 rounded-2xl px-4 py-3 text-left transition-colors ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{command.label}</div>
                    <div className="mt-1 text-xs text-white/45">{command.description}</div>
                  </div>
                  {command.shortcut && <div className="text-xs font-medium text-white/35">{command.shortcut}</div>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}