'use client';

import React from 'react';

export default function EditorToolbar() {
  return (
    <div role="toolbar" aria-label="Editor toolbar" className="flex gap-2 p-2">
      <button aria-label="Bold" title="Bold (Ctrl/Cmd+B)">B</button>
      <button aria-label="Italic" title="Italic (Ctrl/Cmd+I)">I</button>
      <button aria-label="Underline" title="Underline (Ctrl/Cmd+U)">U</button>
      <button aria-label="Strikethrough" title="Strikethrough">S</button>
      <button aria-label="Code" title="Inline code">{`</>`}</button>
    </div>
  );
}
