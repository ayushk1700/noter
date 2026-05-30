type EditorSurfaceOptions = {
  isFocusMode: boolean;
  prefersReducedMotion: boolean;
  themeMode: 'light' | 'dark';
};

export const getEditorSurfaceClassName = ({
  isFocusMode,
  prefersReducedMotion,
  themeMode,
}: EditorSurfaceOptions): string => {
  const base = [
    'mx-auto w-full',
    'transition-all',
    prefersReducedMotion ? 'duration-0' : 'duration-300',
  ];

  if (isFocusMode) {
    base.push('max-w-[760px] px-2 sm:px-4 py-8 sm:py-10');
    base.push(themeMode === 'dark' ? 'text-neutral-100' : 'text-gray-900');
    return base.join(' ');
  }

  base.push('max-w-[900px] rounded-[2rem] px-4 sm:px-8 py-6 sm:py-8');
  base.push(themeMode === 'dark' ? 'bg-neutral-900/20 text-neutral-100' : 'bg-white/70 text-gray-900');
  base.push('backdrop-blur-sm border');
  base.push(themeMode === 'dark' ? 'border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.18)]' : 'border-gray-100 shadow-[0_20px_60px_rgba(15,23,42,0.08)]');

  return base.join(' ');
};