import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { Maximize2, Plus } from 'lucide-react';

const ZoomableListItemComponent = (props: any) => {
  const { node, extension, getPos, editor } = props;

  const handleZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (extension.options.onZoomBullet) {
      // Get the text content of the current list item to use as a title
      const title = node.textContent.trim() || 'Zoomed Bullet';
      
      // Call the zoom callback which will create the page
      const pageId = extension.options.onZoomBullet(title, node);
      
      if (pageId) {
        // Replace this list item with a PageBlock!
        editor.chain().focus().deleteRange({ from: getPos(), to: getPos() + node.nodeSize }).insertContent({
          type: 'pageBlock',
          attrs: { pageId, title }
        }).run();
      }
    }
  };

  return (
    <NodeViewWrapper as="li" className="relative group/bullet pl-6 my-1">
      <div className="absolute left-0 top-1.5 flex items-center justify-center w-6">
        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full group-hover/bullet:opacity-0 transition-opacity" />
        <button
          contentEditable={false}
          onClick={handleZoom}
          className="absolute opacity-0 group-hover/bullet:opacity-100 p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all cursor-pointer z-10 -ml-1"
          title="Zoom into bullet (Turn into page)"
        >
          <Maximize2 size={12} />
        </button>
      </div>
      <NodeViewContent className="outline-none" />
    </NodeViewWrapper>
  );
};

export interface ZoomableListItemOptions {
  onZoomBullet: ((title: string, node: any) => string | null) | null;
  HTMLAttributes: Record<string, any>;
}

export const ZoomableListItem = Node.create<ZoomableListItemOptions>({
  name: 'listItem',
  group: 'listItem',
  content: 'paragraph block*',
  defining: true,

  addOptions() {
    return {
      onZoomBullet: null,
      HTMLAttributes: {},
    };
  },

  parseHTML() {
    return [
      {
        tag: 'li',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['li', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ZoomableListItemComponent);
  },
});
