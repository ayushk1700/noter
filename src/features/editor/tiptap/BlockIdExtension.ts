import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const BlockId = Extension.create({
  name: 'blockId',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote', 'codeBlock'],
        attributes: {
          id: {
            default: null,
            parseHTML: element => element.getAttribute('data-block-id'),
            renderHTML: attributes => {
              if (!attributes.id) {
                return {};
              }
              return {
                'data-block-id': attributes.id,
              };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('blockId'),
        appendTransaction: (transactions, oldState, newState) => {
          if (!transactions.some(tr => tr.docChanged)) return;

          let modified = false;
          const tr = newState.tr;

          newState.doc.descendants((node, pos) => {
            if (node.isBlock && !node.attrs.id) {
              const id = Math.random().toString(36).substring(2, 9);
              tr.setNodeMarkup(pos, undefined, { ...node.attrs, id });
              modified = true;
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});
