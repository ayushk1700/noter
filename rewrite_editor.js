const fs = require('fs');

const path = 'src/features/editor/components/EditorView.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Imports
content = content.replace(
  "import GlobalNavbar from '@/shared/components/GlobalNavbar';",
  `import GlobalNavbar from '@/shared/components/GlobalNavbar';\nimport EditorHeader from './EditorHeader';\nimport DragHandleOverlay from './DragHandleOverlay';\nimport { Column, ColumnBlock } from '@/features/editor/tiptap/ColumnExtension';\nimport { BlockId } from '@/features/editor/tiptap/BlockIdExtension';`
);

// 2. States
content = content.replace(
  "const attachMenuRef = useRef<HTMLDivElement>(null);",
  "const attachMenuRef = useRef<HTMLDivElement>(null);\n  const [anchorPositions, setAnchorPositions] = useState<Record<string, number>>({});\n  const editorScrollRef = useRef<HTMLDivElement>(null);"
);

// 3. Extensions
content = content.replace(
  "extensions: [\n      StarterKit.configure({",
  "extensions: [\n      BlockId,\n      ColumnBlock,\n      Column,\n      StarterKit.configure({"
);

// 4. Effects
content = content.replace(
  "useEffect(() => {\n    if (editor) {",
  `useEffect(() => {
    const updatePositions = () => {
       const newPositions: Record<string, number> = {};
       note.attachments?.forEach(att => {
         if (att.blockAnchorId) {
           const el = document.querySelector(\`[data-block-id="\${att.blockAnchorId}"]\`) as HTMLElement;
           if (el && editorScrollRef.current) {
             const editorRect = editorScrollRef.current.getBoundingClientRect();
             const elRect = el.getBoundingClientRect();
             newPositions[att.id] = elRect.top - editorRect.top + editorScrollRef.current.scrollTop;
           }
         }
       });
       setAnchorPositions(newPositions);
    };
    
    updatePositions();
    const timer = setInterval(updatePositions, 1000);
    return () => clearInterval(timer);
  }, [note.attachments, note.content]);

  useEffect(() => {
    if (editor) {`
);

// 5. Main Content Area
const oldMainContent = `{/* Editor Main Content Area */} 
      <div className="flex-1 overflow-y-auto flex flex-col max-w-5xl w-full mx-auto px-8 md:px-12 pb-32">
        <div className="pt-24 pb-6">
          {/* Subtle accent line */}
          <div className="h-0.5 w-16 bg-gradient-to-r from-[#FF7D54] to-transparent rounded-full mb-6 opacity-60" />
          <div className="flex flex-col gap-2">
            <input 
              type="text" 
              value={note.tags?.[0] || ''}
              onChange={(e) => onTagsChange(e.target.value ? [e.target.value] : [])}
              placeholder="Add a tag to group this note..." 
              className="w-full bg-transparent text-sm font-semibold uppercase tracking-widest text-[#FF7D54] outline-none placeholder-[#FF7D54]/50"
            />
            <input 
              type="text" 
              value={note.title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Note Title..." 
              className={\`w-full bg-transparent text-5xl md:text-6xl font-extrabold outline-none tracking-tight \${themeMode === 'dark' ? 'text-white placeholder-neutral-700' : 'text-gray-900 placeholder-gray-200'}\`}
            />
          </div>
        </div>
        
        <div className={\`flex-1 min-h-[400px] prose prose-lg max-w-none focus:outline-none \${themeMode === 'dark' ? 'prose-invert text-neutral-300' : 'text-gray-800'}\`}>
          <EditorContent editor={editor} />
        </div>

        {note.attachments && note.attachments.length > 0 && (`

const newMainContent = `{/* Editor Main Content Area */} 
      <div id="editor-scroll-container" ref={editorScrollRef} className="flex-1 overflow-y-auto flex flex-col w-full relative pb-32">
        <EditorHeader note={note} onNoteChange={onNoteChange} themeMode={themeMode} />

        <div className="max-w-[900px] w-full mx-auto px-8 md:px-12 relative">
          <DragHandleOverlay editor={editor} />

          {/* Render Block-Anchored Attachments (Margin Bleed) */}
          {note.attachments?.map(att => {
             if (!att.blockAnchorId) return null;
             const top = anchorPositions[att.id] ?? 0;
             return (
               <div 
                 key={\`anchor-\${att.id}\`}
                 className="absolute transition-all duration-300"
                 style={{ 
                   top: top + 'px', 
                   left: 'calc(100% + 2rem)', // Bleed into right margin
                   zIndex: att.zIndex || 10
                 }}
               >
                  <AttachmentNode 
                     data={{ 
                       attachment: att, 
                       onPreview: setPreviewAttachment, 
                       onRemove: onRemoveAttachment 
                     }} 
                  />
                  <button 
                     onClick={() => onNoteChange({ ...note, attachments: note.attachments!.map(a => a.id === att.id ? { ...a, zIndex: a.zIndex === -1 ? 10 : -1 } : a) })}
                     className="absolute -top-4 -right-4 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-xl opacity-0 hover:opacity-100 transition-opacity"
                  >
                     {att.zIndex === -1 ? 'Bring to Front' : 'Push to Back'}
                  </button>
               </div>
             )
          })}

          <div className={\`flex-1 min-h-[400px] prose prose-lg max-w-none focus:outline-none \${themeMode === 'dark' ? 'prose-invert text-neutral-300' : 'text-gray-800'}\`}>
            <EditorContent editor={editor} />
          </div>

        {note.attachments && note.attachments.length > 0 && (`

content = content.replace(oldMainContent, newMainContent);

fs.writeFileSync(path, content);
console.log('Done rewriting EditorView.tsx');
