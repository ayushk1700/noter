'use client';

import React, { useEffect, useMemo, useState } from 'react';
import EditorToolbar from './EditorToolbar';
import type { Block, Document } from '../lib/types';

type Props = {
  document?: Document | null;
  onChange?: (doc: Document) => void;
};

const createBlockId = () => `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createEmptyBlock = (type: Block['type'] = 'paragraph'): Block => {
  const id = createBlockId();

  if (type === 'heading') {
    return { type: 'heading', level: 1, id, content: [] };
  }

  if (type === 'quote') {
    return { type: 'quote', id, content: [] };
  }

  if (type === 'divider') {
    return { type: 'divider', id };
  }

  if (type === 'code') {
    return { type: 'code', id, code: '' };
  }

  if (type === 'list') {
    return {
      type: 'list',
      id,
      ordered: false,
      items: [{ id: createBlockId(), content: [] }],
    };
  }

  if (type === 'checklist') {
    return {
      type: 'checklist',
      id,
      items: [{ id: createBlockId(), checked: false, text: [] }],
    };
  }

  return { type: 'paragraph', id, content: [] };
};

const getBlockText = (block: Block): string => {
  if (block.type === 'code') return block.code;
  if (block.type === 'divider') return '';
  if (block.type === 'list') {
    return block.items.map(item => item.content.map(node => node.type === 'text' ? node.text : '').join('')).join('\n');
  }
  if (block.type === 'checklist') {
    return block.items.map(item => item.text.map(node => node.type === 'text' ? node.text : '').join('')).join('\n');
  }
  return block.content.map(node => node.type === 'text' ? node.text : '').join('');
};

const setBlockText = (block: Block, text: string): Block => {
  if (block.type === 'code') {
    return { ...block, code: text };
  }

  if (block.type === 'divider') {
    return block;
  }

  if (block.type === 'list') {
    const lines = text.split('\n');
    return {
      ...block,
      items: lines.map(line => ({
        id: createBlockId(),
        content: line ? [{ type: 'text', text: line }] : [],
      })),
    };
  }

  if (block.type === 'checklist') {
    const lines = text.split('\n');
    return {
      ...block,
      items: lines.map(line => ({
        id: createBlockId(),
        checked: false,
        text: line ? [{ type: 'text' as const, text: line }] : [],
      })),
    };
  }

  return {
    ...block,
    content: text ? [{ type: 'text', text }] : [],
  };
};

const withUpdatedBlocks = (doc: Document, blocks: Block[]): Document => ({
  ...doc,
  content: blocks,
  updatedAt: Date.now(),
});

export default function RichTextEditor({ document, onChange }: Props) {
  const initialDocument = useMemo<Document>(() => document ?? {
    id: 'draft-document',
    type: 'document',
    content: [createEmptyBlock('paragraph')],
    updatedAt: Date.now(),
  }, [document]);

  const [draftDocument, setDraftDocument] = useState<Document>(initialDocument);

  useEffect(() => {
    setDraftDocument(initialDocument);
  }, [initialDocument]);

  const blocks = draftDocument.content.length > 0 ? draftDocument.content : [createEmptyBlock('paragraph')];

  const emitChange = (nextBlocks: Block[]) => {
    const nextDocument = withUpdatedBlocks(draftDocument, nextBlocks);
    setDraftDocument(nextDocument);
    onChange?.(nextDocument);
  };

  const updateBlock = (blockId: string, nextText: string) => {
    emitChange(blocks.map(block => (block.id === blockId ? setBlockText(block, nextText) : block)));
  };

  const insertBlockAfter = (index: number, type: Block['type'] = 'paragraph') => {
    const nextBlocks = [...blocks.slice(0, index + 1), createEmptyBlock(type), ...blocks.slice(index + 1)];
    emitChange(nextBlocks);
  };

  const removeBlock = (index: number) => {
    const nextBlocks = blocks.filter((_, blockIndex) => blockIndex !== index);
    emitChange(nextBlocks.length > 0 ? nextBlocks : [createEmptyBlock('paragraph')]);
  };

  const changeBlockType = (index: number, type: Block['type']) => {
    const currentBlock = blocks[index];
    if (!currentBlock) return;

    const text = getBlockText(currentBlock);
    let nextBlock = createEmptyBlock(type);

    if (type === 'heading' && nextBlock.type === 'heading') {
      nextBlock = { ...nextBlock, level: 1, content: text ? [{ type: 'text', text }] : [] };
    } else if (type === 'quote' && nextBlock.type === 'quote') {
      nextBlock = { ...nextBlock, content: text ? [{ type: 'text', text }] : [] };
    } else if (type === 'code' && nextBlock.type === 'code') {
      nextBlock = { ...nextBlock, code: text };
    } else if (type === 'list' && nextBlock.type === 'list') {
      nextBlock = {
        ...nextBlock,
        items: text
          ? text.split('\n').map(line => ({ id: createBlockId(), content: [{ type: 'text', text: line }] }))
          : [{ id: createBlockId(), content: [] }],
      };
    } else if (type === 'divider') {
      nextBlock = { ...nextBlock, id: currentBlock.id, type: 'divider' } as Block;
    } else {
      nextBlock = { ...nextBlock, content: text ? [{ type: 'text', text }] : [] } as Block;
    }

    nextBlock = { ...nextBlock, id: currentBlock.id } as Block;

    emitChange(blocks.map((block, blockIndex) => (blockIndex === index ? nextBlock : block)));
  };

  const handleBlockKeyDown = (event: React.KeyboardEvent<HTMLElement>, index: number) => {
    if (event.key === 'Enter' && !event.shiftKey && blocks[index]?.type !== 'code') {
      event.preventDefault();
      insertBlockAfter(index, 'paragraph');
      return;
    }

    if (event.key === 'Backspace') {
      const currentText = getBlockText(blocks[index] || createEmptyBlock());
      if (!currentText.trim() && blocks.length > 1) {
        event.preventDefault();
        removeBlock(index);
      }
    }
  };

  return (
    <div className="rich-text-editor h-full w-full flex flex-col">
      <EditorToolbar />
      <div data-testid="editor-canvas" className="flex-1 p-4 space-y-4 overflow-y-auto">
        {blocks.map((block, index) => {
          if (block.type === 'divider') {
            return (
              <div key={block.id} className="flex items-center gap-3 py-2">
                <select
                  aria-label={`Block type ${index + 1}`}
                  value={block.type}
                  onChange={e => changeBlockType(index, e.target.value as Block['type'])}
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
                >
                  <option value="paragraph">Text</option>
                  <option value="heading">Heading</option>
                  <option value="quote">Quote</option>
                  <option value="code">Code</option>
                  <option value="list">List</option>
                  <option value="divider">Divider</option>
                </select>
                <div className="flex-1 border-t border-dashed border-gray-300" />
              </div>
            );
          }

          const text = getBlockText(block);
          const isCode = block.type === 'code';
          const commonClasses = 'w-full rounded-2xl border border-gray-200 bg-white/80 px-4 py-3 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';

          return (
            <div key={block.id} className="flex items-start gap-3">
              <select
                aria-label={`Block type ${index + 1}`}
                value={block.type}
                onChange={e => changeBlockType(index, e.target.value as Block['type'])}
                className="mt-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
              >
                <option value="paragraph">Text</option>
                <option value="heading">Heading</option>
                <option value="quote">Quote</option>
                <option value="code">Code</option>
                <option value="list">List</option>
                <option value="divider">Divider</option>
              </select>

              {isCode ? (
                <textarea
                  value={text}
                  onChange={e => updateBlock(block.id, e.target.value)}
                  onKeyDown={e => handleBlockKeyDown(e, index)}
                  placeholder="Type code..."
                  className={`${commonClasses} min-h-[120px] font-mono text-sm leading-6 text-gray-800`}
                />
              ) : (
                <div
                  role="textbox"
                  aria-multiline="true"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={e => updateBlock(block.id, e.currentTarget.textContent || '')}
                  onKeyDown={e => handleBlockKeyDown(e, index)}
                  className={`${commonClasses} min-h-[56px] whitespace-pre-wrap text-base leading-7 text-gray-800 ${block.type === 'heading' ? 'font-extrabold text-2xl tracking-tight' : ''} ${block.type === 'quote' ? 'border-l-4 border-indigo-200 pl-4 italic text-gray-600' : ''}`}
                >
                  {text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
