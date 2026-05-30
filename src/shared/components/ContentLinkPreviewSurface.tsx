'use client';

import { ReactNode, useEffect, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import { ArrowUpRight, ExternalLink, FileText, Link2, Sparkles } from 'lucide-react';
import type { Note } from '@/shared/lib/types';
import { formatRelativeTime, getSnippet, isAbsoluteHttpUrl } from '@/shared/lib/linkPreview';

type ExternalPreview = {
  title: string;
  description: string;
  image?: string;
  siteName?: string;
  url: string;
  host: string;
};

type ActivePreview = {
  kind: 'internal' | 'external';
  rect: DOMRect;
  note?: Note;
  href?: string;
  external?: ExternalPreview | null;
  loadingExternal?: boolean;
  error?: string;
};

type Props = {
  children?: ReactNode;
  html?: string;
  notes?: Note[];
  onOpenNote?: (noteId: string) => void;
  themeMode?: 'light' | 'dark';
  className?: string;
  contentClassName?: string;
};

const CARD_WIDTH = 376;
const CARD_HEIGHT = 272;

export default function ContentLinkPreviewSurface({
  children,
  html,
  notes = [],
  onOpenNote,
  themeMode = 'light',
  className = '',
  contentClassName = '',
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<number | null>(null);
  const activeTargetRef = useRef<HTMLElement | null>(null);
  const externalPreviewCache = useRef<Map<string, ExternalPreview>>(new Map());
  const [activePreview, setActivePreview] = useState<ActivePreview | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });

  const isDark = themeMode === 'dark';

  useEffect(() => {
    setIsMounted(true);

    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);

    return () => {
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  const repositionPreview = () => {
    const target = activeTargetRef.current;
    if (!target) return;
    const rect = target.getBoundingClientRect();

    setActivePreview(current => (current ? { ...current, rect } : current));
  };

  useEffect(() => {
    if (!activePreview) return;

    window.addEventListener('scroll', repositionPreview, true);
    window.addEventListener('resize', repositionPreview);

    return () => {
      window.removeEventListener('scroll', repositionPreview, true);
      window.removeEventListener('resize', repositionPreview);
    };
  }, [activePreview]);

  useEffect(() => {
    if (!activePreview || activePreview.kind !== 'external' || !activePreview.href) return;

    const cached = externalPreviewCache.current.get(activePreview.href);
    if (cached) {
      setActivePreview(current => (current && current.href === activePreview.href ? { ...current, external: cached, loadingExternal: false } : current));
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`/api/link-preview?url=${encodeURIComponent(activePreview.href!)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Preview fetch failed');
        }

        const payload = (await response.json()) as Partial<ExternalPreview>;
        const resolvedPreview: ExternalPreview = {
          title: payload.title?.trim() || activePreview.href!,
          description: payload.description?.trim() || 'No description available.',
          image: payload.image,
          siteName: payload.siteName,
          url: payload.url || activePreview.href!,
          host: payload.host || new URL(activePreview.href!).host,
        };

        externalPreviewCache.current.set(activePreview.href!, resolvedPreview);
        setActivePreview(current => (current && current.href === activePreview.href ? { ...current, external: resolvedPreview, loadingExternal: false } : current));
      } catch {
        if (controller.signal.aborted) return;
        setActivePreview(current => (current && current.href === activePreview.href ? { ...current, loadingExternal: false, error: 'Unable to load preview.' } : current));
      }
    })();

    return () => controller.abort();
  }, [activePreview?.href, activePreview?.kind]);

  const getTriggerElement = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof HTMLElement)) return null;
    const root = rootRef.current;
    if (!root || !root.contains(target)) return null;
    if (cardRef.current?.contains(target)) return null;
    return target.closest('a[href], [data-type="mention"][data-id], [data-note-id]') as HTMLElement | null;
  };

  const showPreview = (target: HTMLElement) => {
    const root = rootRef.current;
    if (!root || !root.contains(target)) return;

    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }

    activeTargetRef.current = target;
    const rect = target.getBoundingClientRect();
    const mentionId = target.dataset.noteId || target.getAttribute('data-id');
    const href = target.getAttribute('href') || '';

    if (mentionId) {
      const note = notes.find(item => item.id === mentionId);
      setActivePreview({
        kind: 'internal',
        rect,
        note,
      });
      return;
    }

    if (href && isAbsoluteHttpUrl(href)) {
      const cached = externalPreviewCache.current.get(href) || null;
      setActivePreview({
        kind: 'external',
        rect,
        href,
        external: cached,
        loadingExternal: !cached,
      });
    }
  };

  const hidePreview = () => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setActivePreview(null);
      activeTargetRef.current = null;
    }, 90);
  };

  const handleMouseOver = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = getTriggerElement(event.target);
    if (!trigger) return;
    if (activeTargetRef.current === trigger && activePreview) return;
    showPreview(trigger);
  };

  const handleMouseOut = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = getTriggerElement(event.target);
    if (!trigger) return;

    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node) {
      if (trigger.contains(relatedTarget)) return;
      if (cardRef.current?.contains(relatedTarget)) return;
    }

    hidePreview();
  };

  const handleFocusIn = (event: FocusEvent<HTMLDivElement>) => {
    const trigger = getTriggerElement(event.target);
    if (!trigger) return;
    showPreview(trigger);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const trigger = getTriggerElement(event.target);
    if (!trigger) return;

    const href = trigger.getAttribute('href') || '';
    const mentionId = trigger.dataset.noteId || trigger.getAttribute('data-id');

    if (mentionId) {
      if (!onOpenNote) return;
      event.preventDefault();
      event.stopPropagation();
      onOpenNote(mentionId);
      return;
    }

    if (!href || !isAbsoluteHttpUrl(href)) return;

    event.preventDefault();
    event.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const previewStyle = activePreview && viewport.width > 0 && viewport.height > 0
    ? (() => {
        const margin = 12;
        const spaceBelow = viewport.height - activePreview.rect.bottom;
        const spaceAbove = activePreview.rect.top;
        const top = spaceBelow < CARD_HEIGHT + 24 && spaceAbove > CARD_HEIGHT + 24
          ? Math.max(margin, activePreview.rect.top - CARD_HEIGHT - 12)
          : Math.min(viewport.height - CARD_HEIGHT - margin, activePreview.rect.bottom + 12);
        const left = Math.min(
          Math.max(margin, activePreview.rect.left),
          Math.max(margin, viewport.width - CARD_WIDTH - margin)
        );

        return { top, left };
      })()
    : undefined;

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onFocusCapture={handleFocusIn}
      onBlurCapture={hidePreview}
      onClickCapture={handleClickCapture}
    >
      {html ? (
        <div className={contentClassName} dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        children
      )}

      {isMounted && activePreview && previewStyle && (
        <div
          ref={cardRef}
          className={`fixed z-[120] w-[min(${CARD_WIDTH}px,calc(100vw-24px))] rounded-[1.6rem] border shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-all duration-150 ${
            isDark ? 'border-white/10 bg-neutral-950/95 text-white' : 'border-gray-200 bg-white/95 text-gray-900'
          }`}
          style={previewStyle}
          onMouseEnter={() => {
            if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
          }}
          onMouseLeave={hidePreview}
        >
          <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
            <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-600'}`}>
              {activePreview.kind === 'internal' ? <FileText size={16} /> : <ExternalLink size={16} />}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-[10px] font-bold uppercase tracking-[0.28em] ${isDark ? 'text-white/35' : 'text-gray-400'}`}>
                {activePreview.kind === 'internal' ? 'Linked Note' : 'External Link'}
              </div>
              <div className="truncate text-sm font-semibold">
                {activePreview.kind === 'internal'
                  ? (activePreview.note?.title || 'Untitled note')
                  : (activePreview.external?.title || activePreview.href)}
              </div>
            </div>
            {activePreview.kind === 'internal' ? <Link2 size={14} className={isDark ? 'text-white/30' : 'text-gray-400'} /> : <ArrowUpRight size={14} className={isDark ? 'text-white/30' : 'text-gray-400'} />}
          </div>

          {activePreview.kind === 'internal' ? (
            <div className="space-y-4 p-4">
              <div className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'}`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/75' : 'text-gray-600'}`}>
                  {activePreview.note ? getSnippet(activePreview.note.content, 170) || 'No preview content yet.' : 'This linked note is missing.'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-white/45' : 'text-gray-400'}`}>
                  <Sparkles size={12} />
                  <span>{activePreview.note ? formatRelativeTime(activePreview.note.updatedAt) : 'Unknown update time'}</span>
                </div>

                {activePreview.note && onOpenNote && (
                  <button
                    onClick={() => onOpenNote(activePreview.note!.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Open note
                    <ArrowUpRight size={12} />
                  </button>
                )}
              </div>

              {activePreview.note?.tags?.length ? (
                <div className="flex flex-wrap gap-2">
                  {activePreview.note.tags.slice(0, 4).map(tag => (
                    <span
                      key={tag}
                      className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.24em] ${
                        isDark ? 'bg-white/10 text-white/55' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4 p-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/5">
                {activePreview.loadingExternal ? (
                  <div className={`aspect-[16/8] animate-pulse ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                ) : activePreview.external?.image ? (
                  <img src={activePreview.external.image} alt="Link preview" className="aspect-[16/8] w-full object-cover" />
                ) : (
                  <div className={`flex aspect-[16/8] items-center justify-center ${isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}`}>
                    <ExternalLink size={28} />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className={`text-base font-semibold leading-snug ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {activePreview.loadingExternal ? 'Loading preview…' : activePreview.external?.title || activePreview.href}
                </p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/65' : 'text-gray-600'}`}>
                  {activePreview.loadingExternal
                    ? 'Fetching the page metadata so you can preview it before opening.'
                    : activePreview.external?.description || activePreview.error || 'No description available.'}
                </p>
              </div>

              <div className={`flex items-center justify-between gap-3 text-xs ${isDark ? 'text-white/45' : 'text-gray-400'}`}>
                <span className="truncate">{activePreview.external?.siteName || activePreview.external?.host || activePreview.href}</span>
                {activePreview.external?.url && (
                  <button
                    onClick={() => window.open(activePreview.external!.url, '_blank', 'noopener,noreferrer')}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Open link
                    <ArrowUpRight size={12} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}