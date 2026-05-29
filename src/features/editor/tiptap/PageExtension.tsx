import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { FileText, ArrowRight } from 'lucide-react';

const PageNodeComponent = (props: any) => {
  const { node, extension } = props;
  const pageId = node.attrs.pageId;
  const title = node.attrs.title || 'Untitled Page';

  return (
    <NodeViewWrapper className="page-block-wrapper my-4">
      <div 
        onClick={() => {
          if (extension.options.onOpenPage) {
            extension.options.onOpenPage(pageId);
          }
        }}
        className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
            <FileText className="w-5 h-5 text-[#FF7D54]" />
          </div>
          <span className="font-semibold text-gray-900">{title}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </NodeViewWrapper>
  );
};

export interface PageOptions {
  onOpenPage: ((pageId: string) => void) | null;
}

export const PageExtension = Node.create<PageOptions>({
  name: 'pageBlock',
  group: 'block',
  atom: true,

  addOptions() {
    return {
      onOpenPage: null,
    };
  },

  addAttributes() {
    return {
      pageId: { default: null },
      title: { default: 'Untitled Page' },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="page-block"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'page-block' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(PageNodeComponent);
  },
});
