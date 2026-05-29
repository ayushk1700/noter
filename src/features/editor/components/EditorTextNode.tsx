import { EditorContent, Editor } from '@tiptap/react';

interface EditorTextNodeProps {
  data: {
    editor: Editor | null;
    title: string;
    onTitleChange: (t: string) => void;
    tags: string[];
    onTagsChange: (tags: string[]) => void;
  };
}

export default function EditorTextNode({ data }: EditorTextNodeProps) {
  return (
    <div
      className="relative bg-white/95 backdrop-blur-md rounded-[2rem] border border-gray-200/70 shadow-2xl
                 p-10 md:p-14 min-w-[680px] max-w-4xl flex flex-col nodrag cursor-text
                 animate-in fade-in zoom-in-95 duration-300"
    >
      {/* Subtle top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF7D54]/60 via-indigo-400/40 to-transparent rounded-t-[2rem]" />

      {/* Header area */}
      <div className="pb-8 border-b border-gray-100/80 mb-8 flex flex-col gap-3">
        {/* Tag input */}
        <div className="flex items-center gap-2">
          <span className="text-[#FF7D54]/50 text-xs font-bold uppercase tracking-widest select-none">#</span>
          <input
            type="text"
            value={data.tags?.[0] || ''}
            onChange={(e) => data.onTagsChange(e.target.value ? [e.target.value] : [])}
            placeholder="Add a tag..."
            className="flex-1 bg-transparent text-sm font-bold uppercase tracking-widest text-[#FF7D54]
                       outline-none placeholder-[#FF7D54]/30 caret-[#FF7D54]"
          />
        </div>

        {/* Title input */}
        <input
          type="text"
          value={data.title}
          onChange={(e) => data.onTitleChange(e.target.value)}
          placeholder="Note Title..."
          className="w-full bg-transparent text-5xl font-extrabold outline-none
                     placeholder-gray-200 text-gray-900 tracking-tight leading-tight
                     caret-gray-400"
        />
      </div>

      {/* Editor content */}
      <div className="flex-1 min-h-[500px]">
        {data.editor && <EditorContent editor={data.editor} />}
      </div>
    </div>
  );
}
