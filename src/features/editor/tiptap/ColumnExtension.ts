import { Node, mergeAttributes } from '@tiptap/core';

export const ColumnBlock = Node.create({
  name: 'columnBlock',
  group: 'block',
  content: 'column+',
  
  parseHTML() {
    return [{ tag: 'div[data-type="columnBlock"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'columnBlock',
      class: 'flex w-full gap-4 my-4'
    }), 0];
  },
});

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,
  
  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 
      'data-type': 'column',
      class: 'flex-1 flex-col min-w-0'
    }), 0];
  },
});
