import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { SlashCommand } from '@/features/editor/tiptap/SlashCommand';
import { PageExtension } from '@/features/editor/tiptap/PageExtension';

interface BlockEditorProps {
  title: string;
  content: string;
  onTitleChange: (t: string) => void;
  onContentChange: (c: string) => void;
  onCreateSubPage?: () => string;
  onOpenSubPage?: (id: string) => void;
}

export default function BlockEditor({ title, content, onTitleChange, onContentChange, onCreateSubPage, onOpenSubPage }: BlockEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
      PageExtension.configure({ onOpenPage: onOpenSubPage || (() => {}) }),
      SlashCommand,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg focus:outline-none min-w-full text-gray-800 leading-relaxed max-w-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      (editor.storage as any).pageCreation = {
        onCreatePage: () => {
          if (onCreateSubPage) {
             const newPageId = onCreateSubPage();
             editor.chain().focus().insertContent({ type: 'pageBlock', attrs: { pageId: newPageId, title: 'Untitled Page' } }).run();
          }
        }
      };
    }
  }, [editor, onCreateSubPage]);

  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content || '', { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="w-full h-full flex flex-col p-8 md:p-12">
      <input 
        type="text" 
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Note Title..." 
        className="w-full bg-transparent text-4xl md:text-5xl font-extrabold outline-none placeholder-gray-300 text-gray-900 tracking-tighter mb-8 leading-tight"
      />
      <div className="flex-1 cursor-text overflow-y-auto no-scrollbar pb-32" onPointerDown={(e) => e.stopPropagation()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
