import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Editor } from '@tiptap/core';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Code, 
  Heading1, 
  Heading2,
  Link as LinkIcon
} from 'lucide-react';

interface EditorBubbleMenuProps {
  editor: Editor | null;
}

export default function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu 
      editor={editor} 
      className="flex items-center gap-1 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-md shadow-xl border border-white/20 rounded-lg px-2 py-1.5 z-50 transition-all duration-200"
    >
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('bold') ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Bold"
      >
        <Bold size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('italic') ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Italic"
      >
        <Italic size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('strike') ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('code') ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Inline Code"
      >
        <Code size={14} />
      </button>
      <button
        onClick={() => {
          const previousUrl = editor.getAttributes('link').href;
          const url = window.prompt('URL', previousUrl);
          
          if (url === null) {
            return;
          }
          
          if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
          }
          
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('link') ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Link"
      >
        <LinkIcon size={14} />
      </button>

      <div className="w-px h-4 bg-gray-300 dark:bg-neutral-700 mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-1.5 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800/50 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'text-[#FF7D54] bg-gray-200/50 dark:bg-neutral-800/50' : 'text-gray-600 dark:text-neutral-400'}`}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </button>
    </BubbleMenu>
  );
}
