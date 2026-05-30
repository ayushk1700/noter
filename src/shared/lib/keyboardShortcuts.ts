export type ShortcutItem = {
  keys: string;
  description: string;
};

export type ShortcutGroup = {
  title: string;
  items: ShortcutItem[];
};

export const KEYBOARD_SHORTCUTS: ShortcutGroup[] = [
  {
    title: 'Navigation',
    items: [
      { keys: 'Ctrl/Cmd + K', description: 'Open command palette' },
      { keys: '?', description: 'Open shortcuts overlay' },
      { keys: 'Ctrl/Cmd + Shift + K', description: 'Toggle editor search' },
    ],
  },
  {
    title: 'Editing',
    items: [
      { keys: 'Ctrl/Cmd + N', description: 'Create a new note' },
      { keys: 'Ctrl/Cmd + L', description: 'Toggle theme' },
    ],
  },
];