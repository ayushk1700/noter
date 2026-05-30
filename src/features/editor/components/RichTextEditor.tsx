'use client';

import React from 'react';
import EditorToolbar from './EditorToolbar';
import type { Document } from '../lib/types';

type Props = {
  document?: Document | null;
  onChange?: (doc: Document) => void;
};

export default function RichTextEditor({ document, onChange }: Props) {
  return (
    <div className="rich-text-editor h-full w-full flex flex-col">
      <EditorToolbar />
      <div data-testid="editor-canvas" className="flex-1 p-4">
        {/* Editor canvas placeholder. Implementation will mount editor view here. */}
        <div className="text-sm text-gray-500">Editor canvas (placeholder)</div>
      </div>
    </div>
  );
}
