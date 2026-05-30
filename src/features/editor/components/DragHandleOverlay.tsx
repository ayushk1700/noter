import React, { useEffect, useState } from 'react';
import { Editor } from '@tiptap/react';
import { GripVertical } from 'lucide-react';
import { NodeSelection } from '@tiptap/pm/state';

interface DragHandleOverlayProps {
  editor: Editor | null;
}

export default function DragHandleOverlay({ editor }: DragHandleOverlayProps) {
  const [handlePos, setHandlePos] = useState<{ top: number; left: number } | null>(null);
  const [activeNode, setActiveNode] = useState<Element | null>(null);

  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pm = editor.view.dom;
      
      const target = e.target as Element;
      
      // Keep handle visible if hovering over the handle itself or the menu
      if (target.closest('#drag-handle-container')) return;

      if (!pm.contains(target)) {
        if (!menuOpen) setHandlePos(null);
        return;
      }

      // Find the closest block level element
      const block = target.closest('p, h1, h2, h3, h4, ul, ol, li, blockquote, pre, [data-type="pageBlock"], [data-type="columnBlock"], [data-type="toggleBlock"]');
      
      if (block && block !== pm) {
        const rect = block.getBoundingClientRect();
        // Position handle relative to the viewport
        setHandlePos({ top: rect.top, left: rect.left - 30 });
        setActiveNode(block);
      } else {
        if (!menuOpen) setHandlePos(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [editor, menuOpen]);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('#drag-handle-container')) {
        setMenuOpen(false);
        setHandlePos(null);
      }
    };
    if (menuOpen) {
      window.addEventListener('mousedown', handleClick);
      return () => window.removeEventListener('mousedown', handleClick);
    }
  }, [menuOpen]);

  if (!editor || !handlePos) return null;

  const handleDragStart = (e: React.DragEvent) => {
    if (!activeNode) return;
    
    try {
      const pos = editor.view.posAtDOM(activeNode as Node, 0);
      if (pos >= 0) {
        // We select the node in ProseMirror so that its native drag-and-drop mechanism takes over
        const selection = NodeSelection.create(editor.state.doc, pos - 1); 
        // Note: PM node positions are usually index-1 for the wrapper
        editor.view.dispatch(editor.state.tr.setSelection(selection));
      }
    } catch (err) {
      console.error("Could not select node for drag", err);
    }
  };

  const handleAction = (action: () => void) => {
    if (activeNode) {
      const pos = editor.view.posAtDOM(activeNode as Node, 0);
      if (pos >= 0) {
        const selection = NodeSelection.create(editor.state.doc, pos - 1);
        editor.view.dispatch(editor.state.tr.setSelection(selection));
      }
    }
    action();
    setMenuOpen(false);
  };

  return (
    <div
      id="drag-handle-container"
      className="fixed z-50 flex items-center justify-center"
      style={{
        top: handlePos.top,
        left: handlePos.left,
        marginTop: '2px' // alignment tweak
      }}
    >
      <div
        id="drag-handle"
        draggable
        onDragStart={handleDragStart}
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
        title="Drag to move, click to open menu"
      >
        <GripVertical size={16} />
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border border-gray-200/50 dark:border-neutral-800/50 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
          <p className="px-2 py-1.5 text-[10px] font-bold text-gray-400 dark:text-neutral-500 uppercase tracking-widest">Turn into</p>
          <div className="flex flex-col gap-0.5">
            <button onClick={() => handleAction(() => editor.chain().focus().setParagraph().run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Text</button>
            <button onClick={() => handleAction(() => editor.chain().focus().toggleHeading({ level: 1 }).run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Heading 1</button>
            <button onClick={() => handleAction(() => editor.chain().focus().toggleHeading({ level: 2 }).run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Heading 2</button>
            <button onClick={() => handleAction(() => editor.chain().focus().toggleHeading({ level: 3 }).run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Heading 3</button>
            <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1" />
            <button onClick={() => handleAction(() => editor.chain().focus().toggleBulletList().run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Bulleted list</button>
            <button onClick={() => handleAction(() => editor.chain().focus().toggleOrderedList().run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Numbered list</button>
            <button onClick={() => handleAction(() => editor.chain().focus().toggleTaskList().run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">To-do list</button>
            <button onClick={() => handleAction(() => editor.chain().focus().setNode('toggleBlock').run())} className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-neutral-300 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors font-medium">Toggle list</button>
            <div className="h-px bg-gray-100 dark:bg-neutral-800 my-1" />
            <button onClick={() => handleAction(() => editor.chain().focus().deleteSelection().run())} className="w-full text-left px-2 py-1.5 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-semibold">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}
