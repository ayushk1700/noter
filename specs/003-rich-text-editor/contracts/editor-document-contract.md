# Editor Document Contract

## Purpose

Define the serialization format for Rich Text Editor documents to ensure stable
persistence and cross-version compatibility.

## Format: JSON

Example:

```json
{
  "id": "doc-123",
  "type": "document",
  "updatedAt": 1716900000000,
  "content": [
    { "type": "heading", "level": 1, "id": "h1", "content": [{ "type": "text", "text": "Title" }] },
    { "type": "paragraph", "id": "p1", "content": [{ "type": "text", "text": "Hello ", "marks": ["bold"] }, { "type": "text", "text": "world" }] },
    { "type": "checklist", "items": [{ "id": "c1", "text": [{ "type": "text", "text": "Buy milk" }], "checked": false }] }
  ]
}
```

Notes:
- Implementations MUST preserve unknown block types when loading/saving (forward compatibility) by storing unknown nodes but rendering them as plain text or a placeholder.
- The contract is intentionally minimal to allow editor evolvability.

