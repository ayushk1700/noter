import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { FileText, ArrowRight, Layers } from 'lucide-react';
import { Note } from '@/shared/lib/types';
import { useState, useEffect } from 'react';

const EmbedNodeComponent = (props: any) => {
  const { node, extension } = props;
  const noteId = node.attrs.noteId;
  const { notes, onNoteChange, onOpenNote } = extension.options;
  
  const targetNote = notes?.find((n: Note) => n.id === noteId);

  const embedEditor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: targetNote?.content ?? '',
    onUpdate: ({ editor }) => {
      if (onNoteChange && targetNote) {
        onNoteChange({ ...targetNote, content: editor.getHTML() });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none',
      },
    },
  });

  if (!targetNote) {
    return (
      <NodeViewWrapper className="my-4">
        <div className="p-4 border border-dashed border-gray-300 bg-gray-50 rounded-xl">
          <p className="text-sm font-semibold text-gray-500 mb-2">Select a note to embed:</p>
          <select 
            className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
            onChange={(e) => {
              props.updateAttributes({ noteId: e.target.value });
            }}
            defaultValue=""
          >
            <option value="" disabled>Select a note...</option>
            {notes?.map((n: Note) => (
              <option key={n.id} value={n.id}>{n.title || 'Untitled'}</option>
            ))}
          </select>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="embed-block-wrapper my-6 relative group">
      <div className="absolute -top-3 left-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm border border-indigo-200 cursor-pointer hover:bg-indigo-200" onClick={() => onOpenNote && onOpenNote(noteId)}>
        <Layers size={10} /> Live Portal: {targetNote.title || 'Untitled'}
      </div>
      <div 
        className="block p-6 bg-indigo-50/30 border border-indigo-100 rounded-2xl transition-all hover:shadow-md mt-4"
      >
        <EditorContent editor={embedEditor} />
      </div>
    </NodeViewWrapper>
  );
};

export interface EmbedOptions {
  notes: Note[];
  onNoteChange: ((note: Note) => void) | null;
  onOpenNote: ((noteId: string) => void) | null;
}

export const EmbedExtension = Node.create<EmbedOptions>({
  name: 'embedBlock',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      notes: [],
      onNoteChange: null,
      onOpenNote: null,
    };
  },

  addAttributes() {
    return {
      noteId: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="embed-block"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'embed-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedNodeComponent);
  },
});
