export type Mark = 'bold' | 'italic' | 'underline' | 'strikethrough' | 'inline_code';

export interface TextNode {
  type: 'text';
  text: string;
  marks?: Mark[];
}

export interface InlineCodeNode {
  type: 'inline_code';
  code: string;
}

export interface ParagraphBlock {
  type: 'paragraph';
  id: string;
  content: (TextNode | InlineCodeNode)[];
}

export interface HeadingBlock {
  type: 'heading';
  level: 1 | 2 | 3;
  id: string;
  content: (TextNode | InlineCodeNode)[];
}

export interface ListItem {
  id: string;
  content: (TextNode | InlineCodeNode)[];
}

export interface ListBlock {
  type: 'list';
  id: string;
  ordered: boolean;
  items: ListItem[];
}

export interface ChecklistItem {
  id: string;
  text: (TextNode | InlineCodeNode)[];
  checked: boolean;
}

export interface ChecklistBlock {
  type: 'checklist';
  id: string;
  items: ChecklistItem[];
}

export interface QuoteBlock {
  type: 'quote';
  id: string;
  content: (TextNode | InlineCodeNode)[];
}

export interface DividerBlock {
  type: 'divider';
  id: string;
}

export interface CodeBlock {
  type: 'code';
  id: string;
  language?: string;
  code: string;
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | ChecklistBlock
  | QuoteBlock
  | DividerBlock
  | CodeBlock;

export interface Document {
  id: string;
  type: 'document';
  content: Block[];
  updatedAt: number;
}
