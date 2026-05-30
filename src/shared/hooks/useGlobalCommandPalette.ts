'use client';

import { useCallback, useMemo, useState } from 'react';

export type GlobalCommand = {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  category?: string;
  shortcut?: string;
  action: () => void | Promise<void>;
};

export function useGlobalCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [commands, setCommands] = useState<GlobalCommand[]>([]);

  const registerCommand = useCallback((command: GlobalCommand) => {
    setCommands(prev => {
      const next = prev.filter(existing => existing.id !== command.id);
      return [...next, command];
    });
  }, []);

  const unregisterCommand = useCallback((commandId: string) => {
    setCommands(prev => prev.filter(command => command.id !== commandId));
  }, []);

  const clearCommandRegistry = useCallback(() => {
    setCommands([]);
  }, []);

  const openPalette = useCallback(() => setIsOpen(true), []);
  const closePalette = useCallback(() => setIsOpen(false), []);

  return useMemo(() => ({
    isOpen,
    openPalette,
    closePalette,
    query,
    setQuery,
    commands,
    registerCommand,
    unregisterCommand,
    clearCommandRegistry,
  }), [
    isOpen,
    openPalette,
    closePalette,
    query,
    commands,
    registerCommand,
    unregisterCommand,
    clearCommandRegistry,
  ]);
}