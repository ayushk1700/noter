import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent, NodeViewProps } from '@tiptap/react';
import React from 'react';
import { ChevronRight } from 'lucide-react';

const ToggleComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  return (
    <NodeViewWrapper className="flex items-start gap-1 my-2 group" data-type="toggleBlock">
      <button 
        contentEditable={false}
        onClick={() => updateAttributes({ isOpen: !node.attrs.isOpen })}
        className="mt-[6px] p-[2px] rounded hover:bg-gray-200 dark:hover:bg-neutral-800 select-none text-gray-400 hover:text-gray-700 dark:hover:text-neutral-300 transition-colors cursor-pointer"
      >
        <ChevronRight size={16} className={`transition-transform duration-200 ${node.attrs.isOpen ? 'rotate-90' : ''}`} />
      </button>
      <div className="flex-1 min-w-0">
         <div className={node.attrs.isOpen ? '' : 'max-h-[30px] overflow-hidden opacity-80'}>
             <NodeViewContent className="toggle-content" />
         </div>
      </div>
    </NodeViewWrapper>
  );
};

export const ToggleBlockExtension = Node.create({
  name: 'toggleBlock',
  group: 'block',
  content: 'block+',
  draggable: true,

  addAttributes() {
    return {
      isOpen: {
        default: true,
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="toggleBlock"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'toggleBlock' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent);
  },
});
