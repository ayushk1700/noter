import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import React, { useEffect, useState } from 'react';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

const BookmarkComponent: React.FC<NodeViewProps> = ({ node }) => {
  const [data, setData] = useState<{ title: string; description: string; image: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await fetch(`/api/metadata?url=${encodeURIComponent(node.attrs.url)}`);
        const json = await res.json();
        if (json && !json.error) {
          setData(json);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (node.attrs.url) fetchMetadata();
  }, [node.attrs.url]);

  return (
    <NodeViewWrapper className="my-4" data-type="bookmark">
      <a 
        href={node.attrs.url} 
        target="_blank" 
        rel="noopener noreferrer"
        contentEditable={false}
        className="flex overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors h-32 no-underline group select-none"
      >
        <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
          <div>
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate mb-1">
              {loading ? 'Loading...' : (data?.title || node.attrs.url)}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
              {!loading && data?.description}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 truncate mt-2">
            <ExternalLink size={12} />
            <span className="truncate">{node.attrs.url}</span>
          </div>
        </div>
        <div className="w-32 sm:w-48 bg-gray-100 dark:bg-neutral-800 flex-shrink-0 flex items-center justify-center border-l border-gray-200 dark:border-neutral-800">
          {!loading && data?.image ? (
            <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={24} className="text-gray-300 dark:text-neutral-600" />
          )}
        </div>
      </a>
    </NodeViewWrapper>
  );
};

export const BookmarkExtension = Node.create({
  name: 'bookmark',
  group: 'block',
  draggable: true,

  addAttributes() {
    return {
      url: { default: null },
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="bookmark"]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'bookmark' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkComponent);
  },
});
