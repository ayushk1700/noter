import React, { ReactNode, useEffect, useState } from 'react';

interface GlobalNavbarProps {
  themeMode?: 'light' | 'dark';
  children: ReactNode;
  className?: string;
  scrollContainerId?: string;
}

export default function GlobalNavbar({ themeMode = 'light', children, className = '', scrollContainerId }: GlobalNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const target = scrollContainerId ? document.getElementById(scrollContainerId) : window;
    if (!target) return;

    const handleScroll = () => {
      const scrollTop = target instanceof Window ? window.scrollY : (target as HTMLElement).scrollTop;
      setIsScrolled(scrollTop > 40);
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerId]);

  const isDark = themeMode === 'dark';

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-[100] transition-all duration-700 ease-out ${isScrolled ? 'top-4' : 'top-6'} ${className} ${isDark ? 'nav-dark' : 'nav-light'}`}>
      <div
        className={`flex items-center justify-center rounded-[2.5rem] transition-all duration-500 ease-out overflow-visible border backdrop-blur-md shadow-xl
          ${isDark
            ? 'bg-neutral-900/70 border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.45)]'
            : 'bg-white/70 border-white/20 shadow-[0_18px_50px_rgba(15,23,42,0.14)]'
          }
          ${isScrolled
            ? 'px-3 py-2 scale-[0.85] hover:scale-95'
            : 'px-6 py-3 scale-100'
          }
        `}
      >
        <div className={`nav-content flex items-center transition-all duration-500 ${isScrolled ? 'is-collapsed gap-2' : 'gap-3'}`}>
          {children}
        </div>
      </div>

      {/* MacOS Dock Animation & Theme Overrides */}
      <style dangerouslySetInnerHTML={{
        __html: `
        /* MacOS Dock Magnification Effect */
        .nav-content button {
          transition: transform 0.25s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.2s, opacity 0.2s, color 0.2s;
          will-change: transform;
          transform-origin: bottom center;
        }

        /* LIGHT MODE OVERRIDES */
        .nav-light .nav-content button {
           color: rgba(0, 0, 0, 0.5) !important;
        }
        .nav-light .nav-content button:hover {
           color: rgba(0, 0, 0, 0.9) !important;
            background-color: rgba(255, 255, 255, 0.55) !important;
        }
        .nav-light .nav-content .w-px {
           background-color: rgba(0, 0, 0, 0.15) !important;
        }
        .nav-light .nav-content span {
           color: rgba(0, 0, 0, 0.7) !important;
        }

        /* DARK MODE OVERRIDES */
        .nav-dark .nav-content button {
           color: rgba(255, 255, 255, 0.5) !important;
        }
        .nav-dark .nav-content button:hover {
           color: rgba(255, 255, 255, 0.9) !important;
            background-color: rgba(255, 255, 255, 0.08) !important;
        }
        .nav-dark .nav-content .w-px {
           background-color: rgba(255, 255, 255, 0.15) !important;
        }
        .nav-dark .nav-content span {
           color: rgba(255, 255, 255, 0.7) !important;
        }
        
        .nav-content button:hover {
          transform: scale(1.3) translateY(-4px);
          z-index: 10;
        }

        /* Adjacent sibling scaling using modern CSS :has() */
        .nav-content button:has(+ button:hover),
        .nav-content button:has(+ .w-px + button:hover),
        .nav-content button:hover + button,
        .nav-content button:hover + .w-px + button {
          transform: scale(1.15) translateY(-2px);
        }

        /* Exclusions for primary brand and action buttons */
        .nav-content button div.bg-\\[\\#FF7D54\\] {
           color: white !important;
        }
        
        .nav-content button.bg-\\[\\#FF7D54\\] {
          background-color: #FF7D54 !important;
          color: white !important;
          padding: 0.5rem !important;
        }
        
        .nav-content button.bg-\\[\\#FF7D54\\]:hover {
          background-color: #ff9170 !important;
          color: white !important;
        }
        
        /* Make sure the text spans in the brand button inherit the parent color or keep their white */
        .nav-content button:has(div.bg-\\[\\#FF7D54\\]) span {
          color: inherit !important;
        }

        /* Active View Toggles */
        .nav-light .nav-content button.bg-white\\/20 {
           background-color: rgba(0, 0, 0, 0.08) !important;
           color: rgba(0, 0, 0, 0.9) !important;
        }
        .nav-dark .nav-content button.bg-white\\/20 {
           background-color: rgba(255, 255, 255, 0.15) !important;
           color: rgba(255, 255, 255, 0.9) !important;
        }

        /* Collapsed State Overrides */
        .nav-content.is-collapsed span {
          opacity: 0;
          width: 0;
          overflow: hidden;
          margin: 0 !important;
          padding: 0 !important;
          display: none;
        }
        .nav-content.is-collapsed button {
          padding: 0.4rem !important;
        }
        .nav-content.is-collapsed .w-px {
          height: 16px !important;
          opacity: 0.3;
          margin: 0 4px !important;
        }
      `}} />
    </div>
  );
}
