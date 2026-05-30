'use client';

import { X } from 'lucide-react';
import type { ShortcutGroup } from '@/shared/lib/keyboardShortcuts';

type Props = {
  isOpen: boolean;
  shortcuts: ShortcutGroup[];
  onClose: () => void;
};

export default function KeyboardShortcutsOverlay({ isOpen, shortcuts, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 px-4 backdrop-blur-md">
      <div className="w-full max-w-3xl rounded-[2rem] border border-white/10 bg-neutral-950/95 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/35">Shortcuts</div>
            <h2 className="mt-2 text-2xl font-semibold">Keyboard shortcuts</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {shortcuts.map(group => (
            <section key={group.title} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              <div className="mt-3 space-y-2">
                {group.items.map(item => (
                  <div key={`${group.title}-${item.keys}`} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-white/5">
                    <span className="text-sm text-white/70">{item.description}</span>
                    <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-xs font-semibold text-white/55">{item.keys}</span>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}