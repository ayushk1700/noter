import { Node, mergeAttributes } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const ImageUploadExtension = Node.create({
  name: 'imageBlock',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'img[src]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['img', mergeAttributes(HTMLAttributes, { class: 'max-w-full rounded-xl shadow-md border border-gray-200 dark:border-neutral-800 my-4 object-cover cursor-default' })];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageDrop'),
        props: {
          handleDrop(view, event, slice, moved) {
            if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
              const file = event.dataTransfer.files[0];
              if (file.type.startsWith('image/')) {
                event.preventDefault(); // Stop default editor drop behavior
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                  const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });
                  if (coordinates) {
                    const node = view.state.schema.nodes.imageBlock.create({ src: readerEvent.target?.result });
                    const transaction = view.state.tr.insert(coordinates.pos, node);
                    view.dispatch(transaction);
                  }
                };
                reader.readAsDataURL(file);
                return true;
              }
            }
            return false;
          },
        },
      }),
    ];
  },
});
