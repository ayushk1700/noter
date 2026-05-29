const fs = require('fs');

const path = 'src/shared/components/Lightbox.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "import { Attachment } from '@/shared/lib/types';",
  "import { Attachment, Note } from '@/shared/lib/types';\nimport { EditorContent, useEditor } from '@tiptap/react';\nimport StarterKit from '@tiptap/starter-kit';\nimport { BlockId } from '@/features/editor/tiptap/BlockIdExtension';\nimport { ColumnBlock, Column } from '@/features/editor/tiptap/ColumnExtension';\nimport EditorHeader from '@/features/editor/components/EditorHeader';"
);

content = content.replace(
  "interface LightboxProps {\n  attachment: Attachment;",
  "interface LightboxProps {\n  attachment?: Attachment;\n  note?: Note;"
);

content = content.replace(
  "export default function Lightbox({ attachment, onClose }: LightboxProps) {",
  `export default function Lightbox({ attachment, note, onClose }: LightboxProps) {
  const editor = useEditor({
    extensions: [BlockId, ColumnBlock, Column, StarterKit],
    content: note?.content,
    editable: false,
    editorProps: { attributes: { class: 'prose prose-lg focus:outline-none min-w-full max-w-none prose-invert text-neutral-300' } }
  });`
);

content = content.replace(
  "{attachment.name}",
  "{attachment?.name || note?.title}"
);

content = content.replace(
  "attachment.type === 'image'",
  "attachment?.type === 'image'"
);

content = content.replace(
  "const handleDownload = () => {",
  "const handleDownload = () => {\n    if (!attachment) return;"
);

const mediaAreaStart = `{/* ── Media area ── */}`;
const newMediaAreaStart = `{/* ── Media area ── */}
      <div
        className="relative flex items-center justify-center w-full h-full px-8 pt-20 pb-8 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {note && (
          <div className="w-full max-w-4xl bg-neutral-900 rounded-3xl overflow-hidden shadow-2xl pb-16 flex flex-col h-max mt-auto mb-auto animate-in zoom-in-95 duration-300">
             <div className="pointer-events-none">
               <EditorHeader note={note} onNoteChange={() => {}} themeMode="dark" />
             </div>
             <div className="px-12">
               <EditorContent editor={editor} />
             </div>
          </div>
        )}

        {attachment?.type === 'image' && (`;

content = content.replace(
  `{/* ── Media area ── */}
      <div
        className="relative flex items-center justify-center w-full h-full px-8 pt-20 pb-8"
        onClick={e => e.stopPropagation()}
      >
        {attachment.type === 'image' && (`,
  newMediaAreaStart
);

content = content.replace(/attachment\.type === 'video'/g, "attachment?.type === 'video'");
content = content.replace(/attachment\.type === 'file'/g, "attachment?.type === 'file'");
content = content.replace(/attachment\.type === 'audio'/g, "attachment?.type === 'audio'");
content = content.replace(/attachment\.data/g, "attachment?.data");
content = content.replace(/attachment\.name/g, "attachment?.name");

fs.writeFileSync(path, content);
console.log('Lightbox updated.');
