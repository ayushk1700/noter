# data-model.md

## Document Model

- `Document` (root)
  - `id: string`
  - `type: 'document'`
  - `content: Block[]`  // array of block nodes
  - `updatedAt: number`

## Block (union)

- Paragraph: `{ type: 'paragraph', id, content: Inline[] }`
- Heading: `{ type: 'heading', level: 1|2|3, id, content: Inline[] }`
- List: `{ type: 'list', ordered: boolean, items: ListItem[] }`
- Checklist: `{ type: 'checklist', items: ChecklistItem[] }`
- Quote: `{ type: 'quote', id, content: Inline[] }`
- Divider: `{ type: 'divider', id }`
- CodeBlock: `{ type: 'code', language?: string, code: string }`

## Inline

- Text: `{ type: 'text', text: string, marks?: Mark[] }`
- InlineCode: `{ type: 'inline_code', code: string }`

## Marks

- Bold, Italic, Underline, Strikethrough

## ChecklistItem

- `{ id: string, text: Inline[], checked: boolean }`

## Persistence

- Document JSON MUST be serializable and round-trippable.
- Storage: integrate with existing local-first persistence adapters (IDB/localStorage). Use save/load contract defined in /contracts/editor-document-contract.md
