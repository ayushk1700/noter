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

  useEffect(() => {
    if (!editor) return;

    const handleMouseMove = (e: MouseEvent) => {
      const pm = editor.view.dom;
      
      const target = e.target as Element;
      
      // Keep handle visible if hovering over the handle itself
      if (target.closest('#drag-handle')) return;

      if (!pm.contains(target)) {
        setHandlePos(null);
        return;
      }

      // Find the closest block level element
      const block = target.closest('p, h1, h2, h3, h4, ul, ol, li, blockquote, pre, [data-type="pageBlock"], [data-type="columnBlock"]');
      
      if (block && block !== pm) {
        const rect = block.getBoundingClientRect();
        // Position handle relative to the viewport
        setHandlePos({ top: rect.top, left: rect.left - 30 });
        setActiveNode(block);
      } else {
        setHandlePos(null);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [editor]);

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

  return (
    <div
      id="drag-handle"
      draggable
      onDragStart={handleDragStart}
      className="fixed z-50 flex items-center justify-center w-6 h-6 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 dark:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
      style={{
        top: handlePos.top,
        left: handlePos.left,
        marginTop: '2px' // alignment tweak
      }}
      title="Drag to move"
    >
      <GripVertical size={16} />
    </div>
  );
}
