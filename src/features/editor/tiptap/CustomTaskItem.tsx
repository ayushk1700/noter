import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import TaskItem from '@tiptap/extension-task-item';
import React from 'react';

const TaskItemComponent: React.FC<NodeViewProps> = ({ node, updateAttributes }) => {
  return (
    <NodeViewWrapper as="li" className="flex items-start gap-3 my-1 group" data-type="taskItem" data-checked={node.attrs.checked}>
      <label className="flex items-center justify-center mt-1 cursor-pointer select-none" contentEditable={false}>
        <div className={`w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center transition-all ${
          node.attrs.checked 
            ? 'bg-indigo-500 border-indigo-500 text-white' 
            : 'bg-transparent border-gray-300 dark:border-neutral-600 group-hover:border-indigo-400 dark:group-hover:border-indigo-400'
        }`}>
          {node.attrs.checked && (
            <svg viewBox="0 0 14 14" fill="none" className="w-3 h-3">
              <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={node.attrs.checked}
          onChange={(e) => updateAttributes({ checked: e.target.checked })}
        />
      </label>
      <div 
        className={`flex-1 min-w-0 outline-none transition-colors ${node.attrs.checked ? 'text-gray-400 dark:text-neutral-500 line-through' : 'text-gray-800 dark:text-neutral-200'}`} 
        data-node-view-content 
      />
    </NodeViewWrapper>
  );
};

export const CustomTaskItem = TaskItem.extend({
  addNodeView() {
    return ReactNodeViewRenderer(TaskItemComponent);
  },
});
