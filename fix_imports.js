const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    const replacements = {
        '@/components/views/calendar/WeekView': '@/features/calendar/components/WeekView',
        '@/components/views/calendar/MonthView': '@/features/calendar/components/MonthView',
        '@/components/views/calendar/AgendaView': '@/features/calendar/components/AgendaView',
        '@/components/views/calendar/DayView': '@/features/calendar/components/DayView',
        '@/components/views/CalendarView': '@/features/calendar/components/CalendarView',
        
        '@/components/views/EditorView': '@/features/editor/components/EditorView',
        '@/components/ui/BlockEditor': '@/features/editor/components/BlockEditor',
        '@/components/ui/EditorTextNode': '@/features/editor/components/EditorTextNode',
        '@/hooks/useVoiceRecorder': '@/features/editor/hooks/useVoiceRecorder',
        '@/lib/tiptap/mentionSuggestion': '@/features/editor/tiptap/mentionSuggestion',
        '@/lib/tiptap/EmbedExtension': '@/features/editor/tiptap/EmbedExtension',
        '@/lib/tiptap/MentionList': '@/features/editor/tiptap/MentionList',
        '@/lib/tiptap/PageExtension': '@/features/editor/tiptap/PageExtension',
        '@/lib/tiptap/SlashCommand': '@/features/editor/tiptap/SlashCommand',
        '@/lib/tiptap/suggestion': '@/features/editor/tiptap/suggestion',
        '@/lib/tiptap/ZoomableListItem': '@/features/editor/tiptap/ZoomableListItem',
        
        '@/components/views/FoldersView': '@/features/folders/components/FoldersView',
        '@/components/views/FolderDetailView': '@/features/folders/components/FolderDetailView',
        '@/components/ui/FolderModal': '@/features/folders/components/FolderModal',
        
        '@/components/views/WorkspaceView': '@/features/workspace/components/WorkspaceView',
        '@/components/ui/ZenCanvasNoteCard': '@/features/workspace/components/ZenCanvasNoteCard',
        '@/components/ui/ZenCanvas': '@/features/workspace/components/ZenCanvas',
        '@/components/ui/DragDropOverlay': '@/features/workspace/components/DragDropOverlay',
        '@/components/ui/AttachmentNode': '@/features/workspace/components/AttachmentNode',
        '@/components/ui/NoteNode': '@/features/workspace/components/NoteNode',
        
        '@/components/App': '@/shared/components/App',
        '@/components/views/SplashView': '@/shared/components/SplashView',
        '@/components/ui/GlobalNavbar': '@/shared/components/GlobalNavbar',
        '@/components/ui/AmbientBackground': '@/shared/components/AmbientBackground',
        '@/components/ui/Lightbox': '@/shared/components/Lightbox',
        '@/components/ui/LoadingSpinner': '@/shared/components/LoadingSpinner',
        '@/components/ui/ToastNotification': '@/shared/components/ToastNotification',
        
        '@/lib/constants': '@/shared/lib/constants',
        '@/lib/types': '@/shared/lib/types',
        '@/lib/utils': '@/shared/lib/utils',
    };

    if (filePath.includes('tiptap')) {
        content = content.replace(/from '\.\.\/types'/g, "from '@/shared/lib/types'");
        content = content.replace(/from '\.\.\/utils'/g, "from '@/shared/lib/utils'");
    }

    for (const [oldStr, newStr] of Object.entries(replacements)) {
        content = content.split(oldStr).join(newStr);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

walkDir(path.join(__dirname, 'src'));
console.log('Imports fixed.');
