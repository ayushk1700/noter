$ErrorActionPreference = 'Stop'

# Create directories
New-Item -ItemType Directory -Force -Path "src/features/calendar/components"
New-Item -ItemType Directory -Force -Path "src/features/editor/components"
New-Item -ItemType Directory -Force -Path "src/features/editor/hooks"
New-Item -ItemType Directory -Force -Path "src/features/editor/tiptap"
New-Item -ItemType Directory -Force -Path "src/features/folders/components"
New-Item -ItemType Directory -Force -Path "src/features/workspace/components"
New-Item -ItemType Directory -Force -Path "src/shared/components"
New-Item -ItemType Directory -Force -Path "src/shared/lib"
New-Item -ItemType Directory -Force -Path "src/shared/styles"

# Move files
Move-Item "src/components/views/calendar/*" "src/features/calendar/components/" -Force
Move-Item "src/components/views/CalendarView.tsx" "src/features/calendar/components/" -Force

Move-Item "src/components/views/EditorView.tsx" "src/features/editor/components/" -Force
Move-Item "src/components/ui/BlockEditor.tsx" "src/features/editor/components/" -Force
Move-Item "src/components/ui/EditorTextNode.tsx" "src/features/editor/components/" -Force
Move-Item "src/hooks/useVoiceRecorder.ts" "src/features/editor/hooks/" -Force
Move-Item "src/lib/tiptap/*" "src/features/editor/tiptap/" -Force

Move-Item "src/components/views/FoldersView.tsx" "src/features/folders/components/" -Force
Move-Item "src/components/views/FolderDetailView.tsx" "src/features/folders/components/" -Force
Move-Item "src/components/ui/FolderModal.tsx" "src/features/folders/components/" -Force

Move-Item "src/components/views/WorkspaceView.tsx" "src/features/workspace/components/" -Force
Move-Item "src/components/ui/ZenCanvas.tsx" "src/features/workspace/components/" -Force
Move-Item "src/components/ui/ZenCanvasNoteCard.tsx" "src/features/workspace/components/" -Force
Move-Item "src/components/ui/DragDropOverlay.tsx" "src/features/workspace/components/" -Force
Move-Item "src/components/ui/AttachmentNode.tsx" "src/features/workspace/components/" -Force
Move-Item "src/components/ui/NoteNode.tsx" "src/features/workspace/components/" -Force

Move-Item "src/components/App.tsx" "src/shared/components/" -Force
Move-Item "src/components/views/SplashView.tsx" "src/shared/components/" -Force
Move-Item "src/components/ui/GlobalNavbar.tsx" "src/shared/components/" -Force
Move-Item "src/components/ui/AmbientBackground.tsx" "src/shared/components/" -Force
Move-Item "src/components/ui/Lightbox.tsx" "src/shared/components/" -Force
Move-Item "src/components/ui/LoadingSpinner.tsx" "src/shared/components/" -Force
Move-Item "src/components/ui/ToastNotification.tsx" "src/shared/components/" -Force

Move-Item "src/lib/*" "src/shared/lib/" -Force
Move-Item "src/styles/*" "src/shared/styles/" -Force

# Clean up old directories
Remove-Item "src/components/views/calendar" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/components/views" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/components/ui" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/components" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/hooks" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/lib/tiptap" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/lib" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "src/styles" -Recurse -Force -ErrorAction SilentlyContinue

echo "Done"
